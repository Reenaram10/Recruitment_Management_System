const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateData() {
    const csvContent = fs.readFileSync(path.join('C:', 'Users', 'Reena', 'Desktop', 'education.csv'), 'utf8');
    const lines = csvContent.split('\n').filter(l => l.trim());

    // Connect to DB
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Sufyan@837',
        database: process.env.DB_NAME || 'necfacultyrecruitment',
        multipleStatements: true
    });

    try {
        console.log('Connected to MySQL.');

        // 1. Create Tables
        const ddl = `
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS designations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS department_designations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    designation_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE CASCADE,
    UNIQUE KEY (department_id, designation_id)
);

CREATE TABLE IF NOT EXISTS pg_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS department_pg_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    pg_domain_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (pg_domain_id) REFERENCES pg_domains(id) ON DELETE CASCADE,
    UNIQUE KEY (department_id, pg_domain_id)
);
        `;
        await conn.query(ddl);
        console.log('Tables created or verified.');

        // Parse CSV
        const departments = new Map();
        const designations = new Map();
        const pgDomains = new Map();
        const otherOptions = []; // gender, religion, etc.

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length < 7) continue;

            const category = cols[1];
            const option_value = cols[2];
            const option_label = cols[3];
            // Fix boolean string handling in parsing logic from empty CSV
            const display_order = parseInt(cols[5]) || 0;

            if (category === 'department') {
                if (!departments.has(option_value)) {
                    departments.set(option_value, { name: option_label, display_order });
                }
            } else if (category === 'post') {
                if (!designations.has(option_label)) {
                    designations.set(option_label, { display_order });
                }
            } else if (category.startsWith('pg_domain_')) {
                const deptCode = category.split('_')[2].toUpperCase();
                if (!pgDomains.has(option_label)) {
                    pgDomains.set(option_label, { display_order, validFor: new Set([deptCode]) });
                } else {
                    pgDomains.get(option_label).validFor.add(deptCode);
                }
            } else {
                otherOptions.push({ category, option_value, option_label, display_order });
            }
        }

        // 2. Insert Departments
        for (const [code, data] of departments.entries()) {
            await conn.query(
                `INSERT IGNORE INTO departments (code, name, display_order) VALUES (?, ?, ?)`,
                [code, data.name, data.display_order]
            );
        }

        // 3. Insert Designations
        for (const [name, data] of designations.entries()) {
            await conn.query(
                `INSERT IGNORE INTO designations (name, display_order) VALUES (?, ?)`,
                [name, data.display_order]
            );
        }

        // 4. Map Department <-> Designations (All posts everywhere, based on legacy logic instruction)
        const [dbDepts] = await conn.query(`SELECT id, code FROM departments`);
        const [dbPosts] = await conn.query(`SELECT id, name FROM designations`);
        for (const dept of dbDepts) {
            for (const post of dbPosts) {
                await conn.query(
                    `INSERT IGNORE INTO department_designations (department_id, designation_id) VALUES (?, ?)`,
                    [dept.id, post.id]
                );
            }
        }

        // 5. Insert PG Domains & Mapping
        for (const [name, data] of pgDomains.entries()) {
            await conn.query(
                `INSERT IGNORE INTO pg_domains (name, display_order) VALUES (?, ?)`,
                [name, data.display_order]
            );
        }

        const [dbDomains] = await conn.query(`SELECT id, name FROM pg_domains`);
        for (const domain of dbDomains) {
            const mappingData = pgDomains.get(domain.name);
            if (mappingData) {
                for (const deptCode of mappingData.validFor) {
                    const matchedDept = dbDepts.find(d => d.code === deptCode);
                    if (matchedDept) {
                        await conn.query(
                            `INSERT IGNORE INTO department_pg_domains (department_id, pg_domain_id) VALUES (?, ?)`,
                            [matchedDept.id, domain.id]
                        );
                    }
                }
            }
        }

        // 6. Clear and generic dropdowns
        // Let's migrate other generic independent dropdowns avoiding dups
        await conn.query(`DELETE FROM tbl_Dropdown_Options WHERE txt_Category IN ('gender', 'blood_group', 'marital_status', 'religion', 'community', 'phd_status')`);

        const uniqueOtherOptions = new Map();
        for (let opt of otherOptions) {
            const key = opt.category + '_' + opt.option_value;
            if (!uniqueOtherOptions.has(key)) {
                uniqueOtherOptions.set(key, opt);
            }
        }

        for (const opt of uniqueOtherOptions.values()) {
            await conn.query(
                `INSERT IGNORE INTO tbl_Dropdown_Options (txt_Category, txt_Option_Value, txt_Option_Label, txt_Active, int_Display_Order) VALUES (?, ?, ?, '1', ?)`,
                [opt.category, opt.option_value, opt.option_label, opt.display_order]
            );
        }

        console.log('Migration completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await conn.end();
    }
}

migrateData();
