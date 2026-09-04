const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mysql = require('mysql2/promise');
require('dotenv').config();

const passwordsToTry = [process.env.DB_PASSWORD, '', 'root', 'admin', 'password', '123456', 'root123'].filter(p => p !== undefined);

async function main() {
    let pool = null;
    let host = process.env.DB_HOST || 'localhost';
    let user = process.env.DB_USER || 'root';
    let dbName = process.env.DB_NAME || 'necfacultyrecruitment';

    for (let pw of passwordsToTry) {
        try {
            pool = mysql.createPool({
                host: host,
                user: user,
                password: pw,
                database: dbName,
                multipleStatements: true,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            await pool.query('SELECT 1');
            console.log(`✅ Connected to MySQL with password "${pw}"`);
            break;
        } catch (err) {
            pool = null;
        }
    }

    if (!pool) {
        console.error('❌ Could not connect to MySQL server.');
        process.exit(1);
    }

    // Ensure table exists
    await pool.query(`
        CREATE TABLE IF NOT EXISTS school_village_names (
            id INT AUTO_INCREMENT PRIMARY KEY,
            school_name VARCHAR(255) NOT NULL,
            village_name VARCHAR(255) DEFAULT NULL,
            full_display VARCHAR(500) NOT NULL,
            INDEX idx_school_name (school_name),
            INDEX idx_full_display (full_display(100))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check existing count
    const [countRows] = await pool.query('SELECT COUNT(*) as cnt FROM school_village_names');
    if (countRows[0].cnt > 50000) {
        console.log(`ℹ️ Table school_village_names already contains ${countRows[0].cnt} records. Skipping seeding.`);
        await pool.end();
        return;
    }

    const csvPath = path.join(__dirname, '..', 'school_village_names.csv');
    if (!fs.existsSync(csvPath)) {
        console.error(`❌ File not found: ${csvPath}`);
        process.exit(1);
    }

    console.log(`📂 Reading CSV file: ${csvPath}...`);
    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isHeader = true;
    let batch = [];
    let totalInserted = 0;
    const batchSize = 2500;

    for await (let line of rl) {
        line = line.trim();
        if (!line) continue;

        if (isHeader) {
            isHeader = false;
            if (line.toLowerCase().includes('school') && line.toLowerCase().includes('village')) {
                continue;
            }
        }

        // Clean quotes
        let cleanLine = line.replace(/^"+|"+$/g, '').trim();
        if (!cleanLine) continue;

        let schoolName = cleanLine;
        let villageName = null;
        let fullDisplay = cleanLine;

        // Split by last comma if contains comma
        const lastCommaIndex = cleanLine.lastIndexOf(',');
        if (lastCommaIndex !== -1) {
            const firstPart = cleanLine.substring(0, lastCommaIndex).trim().replace(/^"+|"+$/g, '');
            const secondPart = cleanLine.substring(lastCommaIndex + 1).trim().replace(/^"+|"+$/g, '');

            if (firstPart && secondPart) {
                schoolName = firstPart.substring(0, 250);
                villageName = secondPart.substring(0, 250);
                fullDisplay = `${schoolName}, ${villageName}`.substring(0, 490);
            }
        }

        batch.push([schoolName, villageName, fullDisplay]);

        if (batch.length >= batchSize) {
            await pool.query(
                'INSERT INTO school_village_names (school_name, village_name, full_display) VALUES ?',
                [batch]
            );
            totalInserted += batch.length;
            console.log(`  Processed ${totalInserted} records...`);
            batch = [];
        }
    }

    if (batch.length > 0) {
        await pool.query(
            'INSERT INTO school_village_names (school_name, village_name, full_display) VALUES ?',
            [batch]
        );
        totalInserted += batch.length;
    }

    console.log(`✅ Successfully seeded ${totalInserted} school and village records into MySQL!`);
    await pool.end();
}

main().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
