const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getPool, isDbConnected, initDatabase, memoryDropdowns, memoryUsers, memoryPersonal, memoryEducation, memoryExperience, memoryCertifications, memoryPhd } = require('./db');

const app = express();
const PORT = parseInt(process.env.PORT || 8000, 10);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload directory setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Serve static build files if dist directory exists, otherwise serve root & uploads
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
} else {
    app.use(express.static(__dirname));
}
app.use('/uploads', express.static(uploadDir));

/* ===========================================================
   1. AUTHENTICATION ENDPOINTS
=========================================================== */

// Register Endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, department } = req.body;
        if (!email || !password || !department) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        if (isDbConnected() && getPool()) {
            const [existing] = await getPool().query('SELECT * FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
            }

            await getPool().query(
                'INSERT INTO users (email, password, department) VALUES (?, ?, ?)',
                [email, password, department]
            );
        } else {
            // Memory fallback
            const existing = memoryUsers.find(u => u.email === email);
            if (existing) {
                return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
            }
            memoryUsers.push({ email, password, department });
        }

        res.json({ success: true, message: 'Account registered successfully.' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Database error during registration.' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Username/Email and password are required.' });
        }

        const inputUser = email.trim().toLowerCase();

        // Check for dedicated Admin credentials
        if (inputUser === 'admin' || inputUser === 'admin@nec.edu.in' || inputUser === 'admin@gmail.com') {
            if (password === 'admin@123') {
                return res.json({
                    success: true,
                    message: 'Admin login successful.',
                    user: { email: 'admin', department: 'ADMIN' },
                    isAdmin: true
                });
            } else {
                return res.status(401).json({ success: false, message: 'Incorrect password for admin account.' });
            }
        }

        if (isDbConnected() && getPool()) {
            const [users] = await getPool().query('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return res.status(404).json({ success: false, message: 'No account found with this email.' });
            }

            const user = users[0];
            if (user.password !== password) {
                return res.status(401).json({ success: false, message: 'Incorrect password.' });
            }

            return res.json({
                success: true,
                message: 'Login successful.',
                user: { email: user.email, department: user.department },
                isAdmin: false
            });
        } else {
            // Memory fallback
            const user = memoryUsers.find(u => u.email === email);
            if (!user) {
                return res.status(404).json({ success: false, message: 'No account found with this email.' });
            }
            if (user.password !== password) {
                return res.status(401).json({ success: false, message: 'Incorrect password.' });
            }

            return res.json({
                success: true,
                message: 'Login successful.',
                user: { email: user.email, department: user.department },
                isAdmin: false
            });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Database error during login.' });
    }
});

/* ===========================================================
   2. INSTITUTIONS DROPDOWN ENDPOINT
=========================================================== */

const fallbackInstitutions = [
    'National Engineering College, Kovilpatti',
    'Anna University, Chennai',
    'Indian Institute of Technology Madras (IIT Madras)',
    'National Institute of Technology Tiruchirappalli (NIT Trichy)',
    'Thiagarajar College of Engineering, Madurai',
    'PSG College of Technology, Coimbatore',
    'Coimbatore Institute of Technology, Coimbatore',
    'Mepco Schlenk Engineering College, Sivakasi',
    'Government College of Engineering, Tirunelveli',
    'Manonmaniam Sundaranar University, Tirunelveli',
    'Madurai Kamaraj University, Madurai',
    'Bharathidasan University, Tiruchirappalli',
    'Kamaraj College of Engineering & Technology, Virudhunagar',
    'St. Xavier\'s College, Palayamkottai',
    'Francis Xavier Engineering College, Tirunelveli',
    'SRM Institute of Science and Technology, Chennai',
    'Vellore Institute of Technology (VIT), Vellore',
    'SASTRA Deemed University, Thanjavur',
    'Amrita Vishwa Vidyapeetham, Coimbatore',
    'Central Board of Secondary Education (CBSE)',
    'Tamil Nadu State Board (Matriculation/Higher Secondary)',
    'Indian Certificate of Secondary Education (ICSE)'
];

// Read engineering and arts college datasets from CSV files
let loadedEngineeringColleges = [];
let loadedArtsScienceColleges = [];

try {
    const engCsvPath = path.join(__dirname, 'tn_engineering_college_names_only.csv');
    if (fs.existsSync(engCsvPath)) {
        const lines = fs.readFileSync(engCsvPath, 'utf8').split(/\r?\n/);
        loadedEngineeringColleges = lines
            .map(l => l.trim())
            .filter(l => l && l !== 'College Name');
    }
} catch (err) {
    console.warn('Error reading engineering colleges CSV:', err.message);
}

try {
    const artsCsvPath = path.join(__dirname, 'tn_arts_science_colleges_all.csv');
    if (fs.existsSync(artsCsvPath)) {
        const lines = fs.readFileSync(artsCsvPath, 'utf8').split(/\r?\n/);
        loadedArtsScienceColleges = lines
            .map(l => {
                const firstCol = l.split(',')[0];
                return firstCol ? firstCol.trim() : '';
            })
            .filter(l => l && l !== 'College Name');
    }
} catch (err) {
    console.warn('Error reading arts science colleges CSV:', err.message);
}

app.get('/api/institutions', async (req, res) => {
    try {
        const category = (req.query.category || req.query.type || '').toLowerCase().trim();

        const engList = loadedEngineeringColleges.length ? loadedEngineeringColleges : fallbackInstitutions;
        const artsList = loadedArtsScienceColleges.length ? loadedArtsScienceColleges : fallbackInstitutions;

        if (category === 'engineering' || category === 'eng') {
            return res.json({ success: true, category: 'engineering', institutions: engList });
        }
        if (category === 'arts' || category === 'arts_science') {
            return res.json({ success: true, category: 'arts', institutions: artsList });
        }

        let allList = Array.from(new Set([...engList, ...artsList])).sort();

        if (isDbConnected() && getPool()) {
            const [rows] = await getPool().query('SELECT name FROM institutions ORDER BY name ASC');
            if (rows.length > 0) {
                const dbList = rows.map(r => r.name);
                allList = Array.from(new Set([...allList, ...dbList])).sort();
            }
        }

        res.json({
            success: true,
            category: 'all',
            institutions: allList,
            engineering: engList,
            arts: artsList
        });
    } catch (err) {
        console.warn('Institutions API error:', err.message);
        res.json({ success: true, category: 'all', institutions: fallbackInstitutions });
    }
});

/* ===========================================================
   2b. SCHOOL & VILLAGE NAMES DROPDOWN ENDPOINT (10th/12th)
=========================================================== */
app.get('/api/schools', async (req, res) => {
    try {
        const search = req.query.search ? req.query.search.trim() : '';
        const limit = parseInt(req.query.limit) || 300;

        if (isDbConnected() && getPool()) {
            let sql = 'SELECT id, school_name, village_name, full_display FROM school_village_names';
            const params = [];
            if (search) {
                sql += ' WHERE full_display LIKE ? OR school_name LIKE ? OR village_name LIKE ?';
                const searchPattern = `%${search}%`;
                params.push(searchPattern, searchPattern, searchPattern);
            }
            sql += ' ORDER BY full_display ASC LIMIT ?';
            params.push(limit);

            const [rows] = await getPool().query(sql, params);
            return res.json({ success: true, schools: rows });
        } else {
            return res.json({
                success: true,
                schools: [
                    { id: 1, school_name: 'St. Xavier Higher Secondary School', village_name: 'Palayamkottai', full_display: 'St. Xavier Higher Secondary School, Palayamkottai' },
                    { id: 2, school_name: 'Central Board of Secondary Education (CBSE)', village_name: 'Chennai', full_display: 'Central Board of Secondary Education (CBSE), Chennai' },
                    { id: 3, school_name: 'Tamil Nadu State Board Higher Secondary', village_name: 'Tirunelveli', full_display: 'Tamil Nadu State Board Higher Secondary, Tirunelveli' },
                    { id: 4, school_name: 'Government Higher Secondary School', village_name: 'Kovilpatti', full_display: 'Government Higher Secondary School, Kovilpatti' }
                ]
            });
        }
    } catch (err) {
        console.error('School fetch error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch school list.' });
    }
});

/* ===========================================================
   3. TAB 1: PERSONAL INFORMATION ENDPOINT
=========================================================== */

app.post('/api/personal', upload.single('photoDoc'), async (req, res) => {
    try {
        const data = req.body;
        const user_email = data.user_email || data.email;

        if (!user_email) {
            return res.status(400).json({ success: false, message: 'User email is required.' });
        }

        let photo_path = data.photo_path || null;
        if (req.file) {
            photo_path = '/uploads/' + req.file.filename;
        }

        const sql = `
      INSERT INTO personal_info (
        user_email, applied_date, post, post_other, full_name, dob, age, father_name, mother_name,
        gender, gender_other, blood_group, blood_group_other, marital_status, spouse_name, marital_status_other,
        photo_path, nationality, religion, religion_other, community, community_other, caste, email, alt_email,
        phone, whatsapp, emergency_name, emergency_relation, emergency_phone, aadhaar, permanent_address,
        communication_address, state, district, pincode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        applied_date = VALUES(applied_date), post = VALUES(post), post_other = VALUES(post_other),
        full_name = VALUES(full_name), dob = VALUES(dob), age = VALUES(age), father_name = VALUES(father_name),
        mother_name = VALUES(mother_name), gender = VALUES(gender), gender_other = VALUES(gender_other),
        blood_group = VALUES(blood_group), blood_group_other = VALUES(blood_group_other),
        marital_status = VALUES(marital_status), spouse_name = VALUES(spouse_name),
        marital_status_other = VALUES(marital_status_other), photo_path = COALESCE(VALUES(photo_path), photo_path),
        nationality = VALUES(nationality), religion = VALUES(religion), religion_other = VALUES(religion_other),
        community = VALUES(community), community_other = VALUES(community_other), caste = VALUES(caste),
        email = VALUES(email), alt_email = VALUES(alt_email), phone = VALUES(phone), whatsapp = VALUES(whatsapp),
        emergency_name = VALUES(emergency_name), emergency_relation = VALUES(emergency_relation),
        emergency_phone = VALUES(emergency_phone), aadhaar = VALUES(aadhaar),
        permanent_address = VALUES(permanent_address), communication_address = VALUES(communication_address),
        state = VALUES(state), district = VALUES(district), pincode = VALUES(pincode);
    `;

        const params = [
            user_email,
            data.appliedDate || null,
            data.post || null,
            data.postOther || null,
            data.fullName || null,
            data.dob || null,
            data.age ? parseInt(data.age) : null,
            data.fatherName || null,
            data.motherName || null,
            data.gender || null,
            data.genderOther || null,
            data.bloodGroup || null,
            data.bloodGroupOther || null,
            data.maritalStatus || null,
            data.spouseName || null,
            data.maritalStatusOther || null,
            photo_path,
            data.nationality || null,
            data.religion || null,
            data.religionOther || null,
            data.community || null,
            data.communityOther || null,
            data.caste || null,
            data.email || null,
            data.altEmail || null,
            data.phone || null,
            data.whatsapp || null,
            data.emergencyName || null,
            data.emergencyRelation || null,
            data.emergencyPhone || null,
            data.aadhaar || null,
            data.permanentAddress || null,
            data.communicationAddress || null,
            data.state || null,
            data.district || null,
            data.pincode || null
        ];

        if (isDbConnected() && getPool()) {
            await getPool().query(sql, params);
        } else {
            console.log('Saved personal info to memory fallback for:', user_email);
        }
        res.json({ success: true, message: 'Personal details saved successfully.', photo_path });
    } catch (err) {
        console.error('Personal save error:', err);
        res.status(500).json({ success: false, message: 'Failed to save personal details.' });
    }
});

/* ===========================================================
   4. TAB 2: EDUCATION DETAILS ENDPOINT
=========================================================== */

const eduUploadFields = upload.fields([
    { name: 'tenthDoc', maxCount: 1 },
    { name: 'twelfthDoc', maxCount: 1 },
    { name: 'ugDoc', maxCount: 1 },
    { name: 'pgDoc', maxCount: 1 },
    { name: 'mphilDoc', maxCount: 1 },
    { name: 'phdDoc', maxCount: 1 },
    { name: 'idProofDoc', maxCount: 1 }
]);

app.post('/api/education', eduUploadFields, async (req, res) => {
    try {
        const data = req.body;
        const user_email = data.user_email;

        if (!user_email) {
            return res.status(400).json({ success: false, message: 'User email is required.' });
        }

        const files = req.files || {};
        const qualTypes = ['tenth', 'twelfth', 'ug', 'pg', 'mphil', 'phd'];

        for (const prefix of qualTypes) {
            const is_na = data[prefix + 'NA'] === 'true' || data[prefix + 'NA'] === true ? 1 : 0;
            const percentage = data[prefix + 'Percentage'] ? parseFloat(data[prefix + 'Percentage']) : null;
            const year_of_passing = data[prefix + 'Year'] ? parseInt(data[prefix + 'Year']) : null;
            const medium = data[prefix + 'Medium'] || null;
            const medium_other = data[prefix + 'MediumOther'] || null;
            const first_attempt = data[prefix + 'Attempt'] || null;
            const first_class = data[prefix + 'Class'] || null;
            const degree = data[prefix + 'Degree'] || null;
            const degree_other = data[prefix + 'DegreeOther'] || null;
            const specialization = data[prefix + 'Specialization'] || null;
            const specialization_other = data[prefix + 'SpecializationOther'] || null;
            const topic = data[prefix + 'Topic'] || null;
            const institution_name = data[prefix + 'Institution'] || null;
            const institution_other = data[prefix + 'InstitutionOther'] || null;
            const gate_score = data[prefix + 'GateScore'] || null;
            const net_slet_score = data[prefix + 'NetSletScore'] || null;

            let cert_path = null;
            if (files[prefix + 'Doc'] && files[prefix + 'Doc'][0]) {
                cert_path = '/uploads/' + files[prefix + 'Doc'][0].filename;
            }

            const sql = `
        INSERT INTO user_education (
          user_email, qual_type, is_na, percentage, year_of_passing, medium, medium_other,
          first_attempt, first_class, degree, degree_other, specialization, specialization_other,
          topic, institution_name, institution_other, cert_path, ug_gate_score, ug_net_slet_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          is_na = VALUES(is_na), percentage = VALUES(percentage), year_of_passing = VALUES(year_of_passing),
          medium = VALUES(medium), medium_other = VALUES(medium_other), first_attempt = VALUES(first_attempt),
          first_class = VALUES(first_class), degree = VALUES(degree), degree_other = VALUES(degree_other),
          specialization = VALUES(specialization), specialization_other = VALUES(specialization_other),
          topic = VALUES(topic), institution_name = VALUES(institution_name),
          institution_other = VALUES(institution_other),
          ug_gate_score = VALUES(ug_gate_score), ug_net_slet_score = VALUES(ug_net_slet_score),
          cert_path = COALESCE(VALUES(cert_path), cert_path);
      `;

            if (isDbConnected() && getPool()) {
                await getPool().query(sql, [
                    user_email, prefix, is_na, percentage, year_of_passing, medium, medium_other,
                    first_attempt, first_class, degree, degree_other, specialization, specialization_other,
                    topic, institution_name, institution_other, cert_path, gate_score, net_slet_score
                ]);
            }
        }

        // Process Ph.D specific detailed attributes if PhD is not NA
        const phdNA = data.phdNA === 'true' || data.phdNA === true;
        if (!phdNA) {
            const phd_university = data.phdInstitution || data.phdInstitutionOther || null;
            const phd_title = data.phdTopic || null;
            const phd_guide_name = data.phdGuideName || null;
            const phd_guide_college = data.phdGuideCollege || null;
            const phd_status = data.phdStatus || 'Completed';
            const phd_reg_year = data.phdYearRegistration ? parseInt(data.phdYearRegistration) : null;
            const phd_comp_year = data.phdYear ? parseInt(data.phdYear) : null;
            const phd_pub_during = data.phdPublicationsDuring ? parseInt(data.phdPublicationsDuring) : 0;
            const phd_pub_post = data.phdPublicationsPost ? parseInt(data.phdPublicationsPost) : 0;
            const phd_awards = data.phdAwards ? parseInt(data.phdAwards) : 0;
            const phd_funded_projects = data.phdFundedProjects ? parseInt(data.phdFundedProjects) : 0;
            const phd_funded_consultancy = data.phdFundedConsultancy ? parseInt(data.phdFundedConsultancy) : 0;
            const phd_exp = data.phdPostExperience || null;

            if (isDbConnected() && getPool()) {
                const phdSql = `
            INSERT INTO user_phd_details (
              user_email, university, title, guide_name, guide_college, status,
              year_of_registration, year_of_completion, no_of_publications_during_phd,
              no_of_publications_post_phd, no_of_awards, no_of_funded_projects,
              no_of_funded_consultancy, post_phd_experience
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              university = VALUES(university), title = VALUES(title), guide_name = VALUES(guide_name),
              guide_college = VALUES(guide_college), status = VALUES(status),
              year_of_registration = VALUES(year_of_registration), year_of_completion = VALUES(year_of_completion),
              no_of_publications_during_phd = VALUES(no_of_publications_during_phd),
              no_of_publications_post_phd = VALUES(no_of_publications_post_phd),
              no_of_awards = VALUES(no_of_awards),
              no_of_funded_projects = VALUES(no_of_funded_projects),
              no_of_funded_consultancy = VALUES(no_of_funded_consultancy),
              post_phd_experience = VALUES(post_phd_experience);
          `;

                await getPool().query(phdSql, [
                    user_email, phd_university, phd_title, phd_guide_name, phd_guide_college, phd_status,
                    phd_reg_year, phd_comp_year, phd_pub_during, phd_pub_post, phd_awards,
                    phd_funded_projects, phd_funded_consultancy, phd_exp
                ]);
            }
        }

        res.json({ success: true, message: 'Education details saved successfully.' });
    } catch (err) {
        console.error('Education save error:', err);
        res.status(500).json({ success: false, message: 'Failed to save education details.' });
    }
});

/* ===========================================================
   5. TAB 3: WORK EXPERIENCE ENDPOINT
=========================================================== */

app.post('/api/experience', async (req, res) => {
    try {
        const { user_email, is_fresher, entries } = req.body;

        if (!user_email) {
            return res.status(400).json({ success: false, message: 'User email is required.' });
        }

        if (isDbConnected() && getPool()) {
            await getPool().query('DELETE FROM user_experience WHERE user_email = ?', [user_email]);

            if (is_fresher) {
                await getPool().query(
                    'INSERT INTO user_experience (user_email, is_fresher) VALUES (?, 1)',
                    [user_email]
                );
            } else if (Array.isArray(entries) && entries.length > 0) {
                for (const entry of entries) {
                    await getPool().query(
                        `INSERT INTO user_experience (
                user_email, is_fresher, exp_type, org_name, from_date, to_date, total_duration, designation, salary
              ) VALUES (?, 0, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            user_email,
                            entry.type || null,
                            entry.org || null,
                            entry.from || null,
                            entry.to || null,
                            entry.total || null,
                            entry.designation || null,
                            entry.salary ? parseFloat(entry.salary) : null
                        ]
                    );
                }
            }
        }

        res.json({ success: true, message: 'Work experience saved successfully.' });
    } catch (err) {
        console.error('Experience save error:', err);
        res.status(500).json({ success: false, message: 'Failed to save work experience.' });
    }
});

/* ===========================================================
   6. TAB 4: CERTIFICATIONS & NPTEL ENDPOINT
=========================================================== */

app.post('/api/certifications', upload.any(), async (req, res) => {
    try {
        const data = req.body;
        const user_email = data.user_email;

        if (!user_email) {
            return res.status(400).json({ success: false, message: 'User email is required.' });
        }

        let entries = [];
        if (data.entries) {
            try {
                entries = typeof data.entries === 'string' ? JSON.parse(data.entries) : data.entries;
            } catch (e) {
                entries = [];
            }
        }

        if (isDbConnected() && getPool()) {
            await getPool().query('DELETE FROM user_certifications WHERE user_email = ?', [user_email]);

            const files = req.files || [];

            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                let cert_path = null;

                const matchingFile = files.find(f => f.fieldname === `certDoc_${i}`);
                if (matchingFile) {
                    cert_path = '/uploads/' + matchingFile.filename;
                }

                await getPool().query(
                    `INSERT INTO user_certifications (
              user_email, title, score, category, organization, year, cert_doc
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        user_email,
                        entry.title || 'Certification',
                        entry.score || null,
                        entry.category || null,
                        entry.organization || null,
                        entry.year || null,
                        cert_path
                    ]
                );
            }
        }

        res.json({ success: true, message: 'Certifications saved successfully.' });
    } catch (err) {
        console.error('Certifications save error:', err);
        res.status(500).json({ success: false, message: 'Failed to save certifications.' });
    }
});

/* ===========================================================
   7. FETCH PROFILE DETAILS API
=========================================================== */

app.get('/api/profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: 'Email parameter missing.' });

        const dedupe = (arr, keyFn) => {
            const seen = new Set();
            return (arr || []).filter(item => {
                const k = keyFn(item);
                if (!k || seen.has(k)) return false;
                seen.add(k);
                return true;
            });
        };

        if (isDbConnected() && getPool()) {
            const [personal] = await getPool().query('SELECT * FROM personal_info WHERE user_email = ?', [email]);
            const [education] = await getPool().query('SELECT * FROM user_education WHERE user_email = ?', [email]);
            const [experience] = await getPool().query('SELECT * FROM user_experience WHERE user_email = ?', [email]);
            const [certifications] = await getPool().query('SELECT * FROM user_certifications WHERE user_email = ?', [email]);
            const [phdDetails] = await getPool().query('SELECT * FROM user_phd_details WHERE user_email = ?', [email]);

            return res.json({
                success: true,
                personal: personal[0] || null,
                education: dedupe(education, e => `${e.qual_type}_${e.degree}_${e.year_of_passing}`),
                experience: dedupe(experience, e => `${e.designation}_${e.org_name}_${e.from_date}`),
                certifications: dedupe(certifications, c => `${c.title}_${c.organization}_${c.year}`),
                phd_details: phdDetails[0] || null
            });
        } else {
            const personal = memoryPersonal.find(p => p.user_email === email) || null;
            const education = memoryEducation.filter(e => e.user_email === email);
            const experience = memoryExperience.filter(e => e.user_email === email);
            const certifications = memoryCertifications.filter(c => c.user_email === email);
            const phdDetails = memoryPhd.find(p => p.user_email === email) || null;

            return res.json({
                success: true,
                personal,
                education: dedupe(education, e => `${e.qual_type}_${e.degree}_${e.year_of_passing}`),
                experience: dedupe(experience, e => `${e.designation}_${e.org_name}_${e.from_date}`),
                certifications: dedupe(certifications, c => `${c.title}_${c.organization}_${c.year}`),
                phd_details: phdDetails
            });
        }
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch profile details.' });
    }
});

/* ===========================================================
   8. DYNAMIC DROPDOWN OPTIONS ENDPOINTS (PUBLIC & ADMIN)
=========================================================== */

// Dynamic scoring: the database defines the parameter, source field and rules.
async function candidateScoringValues(email) {
    const pool = getPool();
    const [education] = await pool.query('SELECT * FROM user_education WHERE user_email = ?', [email]);
    const [experience] = await pool.query('SELECT * FROM user_experience WHERE user_email = ?', [email]);
    const [certifications] = await pool.query('SELECT * FROM user_certifications WHERE user_email = ?', [email]);
    const [phdRows] = await pool.query('SELECT * FROM user_phd_details WHERE user_email = ?', [email]);
    const byType = Object.fromEntries(education.map(e => [e.qual_type, e])); const field = (type, key) => byType[type]?.[key] ?? null;
    const months = experience.reduce((sum, e) => { const m = String(e.total_duration || '').match(/(\d+)\s*(?:yr|yrs|year|years)/i); const n = String(e.total_duration || '').match(/(\d+)\s*month/i); return sum + (m ? +m[1] * 12 : 0) + (n ? +n[1] : 0); }, 0);
    const phd = phdRows[0] || {};
    return { 'tenth.score': field('tenth', 'percentage'), 'tenth.medium': field('tenth', 'medium'), 'twelfth.score': field('twelfth', 'percentage'), 'twelfth.medium': field('twelfth', 'medium'), ...Object.fromEntries(['ug', 'pg', 'mphil'].flatMap(t => [[`${t}.score`, field(t, 'percentage')], [`${t}.institute`, field(t, 'institution_name')], [`${t}.first_attempt`, field(t, 'first_attempt')], [`${t}.first_class`, field(t, 'first_class')]])), 'ug.gate_score': field('ug', 'ug_gate_score'), 'ug.net_slet_score': field('ug', 'ug_net_slet_score'), 'phd.status': phd.status, 'phd.completed': phd.status === 'Completed' ? 'Yes' : 'No', 'phd.publications_during': phd.no_of_publications_during_phd, 'phd.awards': phd.no_of_awards, 'phd.funded_projects': phd.no_of_funded_projects, 'phd.funded_consultancy': phd.no_of_funded_consultancy, 'experience.years': months / 12, 'certifications.nptel_count': certifications.filter(c => /nptel/i.test(c.category || '')).length };
}
let memoryScoringParameters = [
    { id: 1, parameter_key: 'tenth_score', parameter_name: '10th Score (%)', candidate_field: 'tenth.score', value_type: 'number', max_weightage: 5, is_active: 1, ranges: [{ id: 101, range_type: 'number', min_value: 80, max_value: 100, assigned_score: 5 }, { id: 102, range_type: 'number', min_value: 60, max_value: 79, assigned_score: 3 }] },
    { id: 2, parameter_key: 'tenth_medium', parameter_name: '10th Medium', candidate_field: 'tenth.medium', value_type: 'category', max_weightage: 2, is_active: 1, ranges: [{ id: 103, range_type: 'category', category_value: 'English', assigned_score: 2 }, { id: 104, range_type: 'category', category_value: 'Tamil', assigned_score: 1 }] },
    { id: 3, parameter_key: 'twelfth_score', parameter_name: '12th Score (%)', candidate_field: 'twelfth.score', value_type: 'number', max_weightage: 5, is_active: 1, ranges: [{ id: 105, range_type: 'number', min_value: 80, max_value: 100, assigned_score: 5 }, { id: 106, range_type: 'number', min_value: 60, max_value: 79, assigned_score: 3 }] },
    { id: 4, parameter_key: 'twelfth_medium', parameter_name: '12th Medium', candidate_field: 'twelfth.medium', value_type: 'category', max_weightage: 2, is_active: 1, ranges: [{ id: 107, range_type: 'category', category_value: 'English', assigned_score: 2 }, { id: 108, range_type: 'category', category_value: 'Tamil', assigned_score: 1 }] },
    { id: 5, parameter_key: 'ug_institute', parameter_name: 'UG Institute', candidate_field: 'ug.institute', value_type: 'category', max_weightage: 5, is_active: 1, ranges: [] },
    { id: 6, parameter_key: 'ug_cgpa', parameter_name: 'UG CGPA (0 - 10 Scale)', candidate_field: 'ug.score', value_type: 'number', max_weightage: 15, is_active: 1, ranges: [{ id: 109, range_type: 'number', min_value: 8.5, max_value: 10.0, assigned_score: 15 }, { id: 110, range_type: 'number', min_value: 7.0, max_value: 8.4, assigned_score: 10 }, { id: 1110, range_type: 'number', min_value: 5.5, max_value: 6.9, assigned_score: 5 }] },
    { id: 7, parameter_key: 'ug_first_attempt', parameter_name: 'UG First Attempt', candidate_field: 'ug.first_attempt', value_type: 'category', max_weightage: 3, is_active: 1, ranges: [{ id: 111, range_type: 'category', category_value: 'Yes', assigned_score: 3 }] },
    { id: 8, parameter_key: 'ug_first_class', parameter_name: 'UG First Class', candidate_field: 'ug.first_class', value_type: 'category', max_weightage: 3, is_active: 1, ranges: [{ id: 112, range_type: 'category', category_value: 'Yes', assigned_score: 3 }] },
    { id: 9, parameter_key: 'pg_institute', parameter_name: 'PG Institute', candidate_field: 'pg.institute', value_type: 'category', max_weightage: 5, is_active: 1, ranges: [] },
    { id: 10, parameter_key: 'pg_cgpa', parameter_name: 'PG CGPA (0 - 10 Scale)', candidate_field: 'pg.score', value_type: 'number', max_weightage: 15, is_active: 1, ranges: [{ id: 113, range_type: 'number', min_value: 8.5, max_value: 10.0, assigned_score: 15 }, { id: 114, range_type: 'number', min_value: 7.0, max_value: 8.4, assigned_score: 10 }, { id: 1114, range_type: 'number', min_value: 5.5, max_value: 6.9, assigned_score: 5 }] },
    { id: 11, parameter_key: 'pg_first_attempt', parameter_name: 'PG First Attempt', candidate_field: 'pg.first_attempt', value_type: 'category', max_weightage: 3, is_active: 1, ranges: [{ id: 115, range_type: 'category', category_value: 'Yes', assigned_score: 3 }] },
    { id: 12, parameter_key: 'pg_first_class', parameter_name: 'PG First Class', candidate_field: 'pg.first_class', value_type: 'category', max_weightage: 3, is_active: 1, ranges: [{ id: 116, range_type: 'category', category_value: 'Yes', assigned_score: 3 }] },
    { id: 13, parameter_key: 'mphil_score', parameter_name: 'M.Phil Score', candidate_field: 'mphil.score', value_type: 'number', max_weightage: 2, is_active: 0, ranges: [] },
    { id: 14, parameter_key: 'mphil_institute', parameter_name: 'M.Phil Institute', candidate_field: 'mphil.institute', value_type: 'category', max_weightage: 2, is_active: 0, ranges: [] },
    { id: 15, parameter_key: 'mphil_first_attempt', parameter_name: 'M.Phil First Attempt', candidate_field: 'mphil.first_attempt', value_type: 'category', max_weightage: 1, is_active: 0, ranges: [] },
    { id: 16, parameter_key: 'mphil_first_class', parameter_name: 'M.Phil First Class', candidate_field: 'mphil.first_class', value_type: 'category', max_weightage: 1, is_active: 0, ranges: [] },
    { id: 17, parameter_key: 'phd_completion', parameter_name: 'Ph.D. Completion', candidate_field: 'phd.completed', value_type: 'category', max_weightage: 10, is_active: 1, ranges: [{ id: 117, range_type: 'category', category_value: 'Yes', assigned_score: 10 }] },
    { id: 18, parameter_key: 'net', parameter_name: 'NET Qualified', candidate_field: 'ug.net_slet_score', value_type: 'number', max_weightage: 3, is_active: 0, ranges: [] },
    { id: 19, parameter_key: 'slet', parameter_name: 'SLET Qualified', candidate_field: 'ug.net_slet_score', value_type: 'number', max_weightage: 2, is_active: 0, ranges: [] },
    { id: 20, parameter_key: 'gate_score', parameter_name: 'GATE Score', candidate_field: 'ug.gate_score', value_type: 'number', max_weightage: 3, is_active: 0, ranges: [] },
    { id: 21, parameter_key: 'experience', parameter_name: 'Teaching Experience (Years)', candidate_field: 'experience.years', value_type: 'number', max_weightage: 5, is_active: 1, ranges: [{ id: 118, range_type: 'number', min_value: 5, max_value: 50, assigned_score: 5 }, { id: 119, range_type: 'number', min_value: 1, max_value: 4, assigned_score: 3 }] },
    { id: 22, parameter_key: 'publications_during_phd', parameter_name: 'Publications During Ph.D.', candidate_field: 'phd.publications_during', value_type: 'number', max_weightage: 2, is_active: 0, ranges: [] },
    { id: 23, parameter_key: 'awards', parameter_name: 'Awards & Honors', candidate_field: 'phd.awards', value_type: 'number', max_weightage: 2, is_active: 0, ranges: [] },
    { id: 24, parameter_key: 'nptel_course', parameter_name: 'NPTEL Certifications Count', candidate_field: 'certifications.nptel_count', value_type: 'number', max_weightage: 2, is_active: 0, ranges: [] },
    { id: 25, parameter_key: 'funded_projects', parameter_name: 'Funded Projects', candidate_field: 'phd.funded_projects', value_type: 'category', max_weightage: 1, is_active: 0, ranges: [] },
    { id: 26, parameter_key: 'funded_consultancy', parameter_name: 'Funded Consultancy', candidate_field: 'phd.funded_consultancy', value_type: 'category', max_weightage: 1, is_active: 0, ranges: [] }
];
async function candidateScoringValues(email) {
    let education = [], experience = [], certifications = [], phdRows = [];
    if (isDbConnected() && getPool()) {
        const pool = getPool();
        [education] = await pool.query('SELECT * FROM user_education WHERE user_email = ?', [email]);
        [experience] = await pool.query('SELECT * FROM user_experience WHERE user_email = ?', [email]);
        [certifications] = await pool.query('SELECT * FROM user_certifications WHERE user_email = ?', [email]);
        [phdRows] = await pool.query('SELECT * FROM user_phd_details WHERE user_email = ?', [email]);
    } else {
        education = memoryEducation.filter(e => e.user_email === email);
        experience = memoryExperience.filter(e => e.user_email === email);
        certifications = memoryCertifications.filter(c => c.user_email === email);
        phdRows = memoryPhd.filter(p => p.user_email === email);
    }
    const byType = Object.fromEntries(education.map(e => [e.qual_type, e]));
    const field = (type, key) => byType[type]?.[key] ?? null;
    const months = experience.reduce((sum, e) => {
        const m = String(e.total_duration || '').match(/(\d+)\s*(?:yr|yrs|year|years)/i);
        const n = String(e.total_duration || '').match(/(\d+)\s*month/i);
        return sum + (m ? +m[1] * 12 : 0) + (n ? +n[1] : 0);
    }, 0);
    const phd = phdRows[0] || {};
    return {
        'tenth.score': field('tenth', 'percentage'),
        'tenth.medium': field('tenth', 'medium'),
        'twelfth.score': field('twelfth', 'percentage'),
        'twelfth.medium': field('twelfth', 'medium'),
        ...Object.fromEntries(['ug', 'pg', 'mphil'].flatMap(t => [
            [`${t}.score`, field(t, 'percentage')],
            [`${t}.institute`, field(t, 'institution_name')],
            [`${t}.first_attempt`, field(t, 'first_attempt')],
            [`${t}.first_class`, field(t, 'first_class')]
        ])),
        'ug.gate_score': field('ug', 'ug_gate_score'),
        'ug.net_slet_score': field('ug', 'ug_net_slet_score'),
        'phd.status': phd.status,
        'phd.completed': phd.status === 'Completed' ? 'Yes' : 'No',
        'phd.publications_during': phd.no_of_publications_during_phd,
        'phd.awards': phd.no_of_awards,
        'phd.funded_projects': (phd.no_of_funded_projects && Number(phd.no_of_funded_projects) > 0) ? 'Yes' : 'No',
        'phd.funded_consultancy': (phd.no_of_funded_consultancy && Number(phd.no_of_funded_consultancy) > 0) ? 'Yes' : 'No',
        'experience.years': months / 12,
        'certifications.nptel_count': certifications.filter(c => /nptel/i.test(c.category || '')).length
    };
}

async function computeCandidateTotalScore(email) {
    try {
        let activeParams = [];
        if (isDbConnected() && getPool()) {
            const [params] = await getPool().query('SELECT * FROM scoring_parameters WHERE is_active=1 ORDER BY display_order,id');
            for (const p of params) {
                const [ranges] = await getPool().query('SELECT * FROM scoring_ranges WHERE parameter_id=? ORDER BY display_order,id', [p.id]);
                p.ranges = ranges;
            }
            activeParams = params;
        } else {
            activeParams = memoryScoringParameters.filter(p => p.is_active);
        }

        const values = await candidateScoringValues(email);
        let total = 0;

        for (const p of activeParams) {
            const val = values[p.candidate_field];
            const ranges = p.ranges || [];
            let matched = null;
            if (p.value_type === 'category') {
                matched = ranges.find(r => String(val || '').toLowerCase() === String(r.category_value || '').toLowerCase());
            } else {
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                    matched = ranges.find(r => numVal >= parseFloat(r.min_value ?? 0) && numVal <= parseFloat(r.max_value ?? 100));
                }
            }
            if (matched) total += Number(matched.assigned_score || 0);
        }
        return total;
    } catch (e) {
        return 0;
    }
}

app.get('/api/scoring/candidate', async (req, res) => {
    try {
        const email = req.query.email;
        let activeParams = [];
        if (isDbConnected() && getPool()) {
            const [params] = await getPool().query('SELECT * FROM scoring_parameters WHERE is_active=1 ORDER BY display_order,id');
            for (const p of params) {
                const [ranges] = await getPool().query('SELECT * FROM scoring_ranges WHERE parameter_id=? ORDER BY display_order,id', [p.id]);
                p.ranges = ranges;
            }
            activeParams = params;
        } else {
            activeParams = memoryScoringParameters.filter(p => p.is_active);
        }

        const values = await candidateScoringValues(email);
        const result = [];

        for (const p of activeParams) {
            const val = values[p.candidate_field];
            const ranges = p.ranges || [];
            let matched = null;
            if (p.value_type === 'category') {
                matched = ranges.find(r => String(val || '').toLowerCase() === String(r.category_value || '').toLowerCase());
            } else {
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                    matched = ranges.find(r => numVal >= parseFloat(r.min_value ?? 0) && numVal <= parseFloat(r.max_value ?? 100));
                }
            }
            const earnedScore = matched ? Number(matched.assigned_score || 0) : 0;
            result.push({
                parameter_name: p.parameter_name,
                value: val ?? 'N/A',
                score: earnedScore,
                max_score: p.max_weightage
            });
        }

        const total = result.reduce((sum, r) => sum + r.score, 0);
        return res.json({ success: true, breakdown: result, total });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Unable to calculate score.' });
    }
});

app.get('/api/scoring/parameters', async (req, res) => {
    try {
        if (isDbConnected() && getPool()) {
            const [rows] = await getPool().query('SELECT p.*, r.id AS range_id, r.range_type, r.min_value, r.max_value, r.category_value, r.assigned_score, r.display_order AS range_order FROM scoring_parameters p LEFT JOIN scoring_ranges r ON r.parameter_id=p.id ORDER BY p.display_order,p.id,r.display_order,r.id');
            const grouped = [];
            rows.forEach(r => {
                let p = grouped.find(x => x.id === r.id);
                if (!p) { p = { ...r, ranges: [] }; delete p.range_id; grouped.push(p) }
                if (r.range_id) p.ranges.push({ id: r.range_id, range_type: r.range_type, min_value: r.min_value, max_value: r.max_value, category_value: r.category_value, assigned_score: r.assigned_score, display_order: r.range_order })
            });
            return res.json({ success: true, parameters: grouped });
        } else {
            return res.json({ success: true, parameters: memoryScoringParameters });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Unable to load scoring configuration.' });
    }
});

app.put('/api/admin/scoring/parameters/:id', async (req, res) => {
    try {
        const p = req.body;
        if (isDbConnected() && getPool()) {
            const [totalRows] = await getPool().query('SELECT COALESCE(SUM(max_weightage),0) total FROM scoring_parameters WHERE is_active=1 AND id<>?', [req.params.id]);
            if (+p.is_active && +totalRows[0].total + +p.max_weightage > 100) return res.status(400).json({ success: false, message: 'Total weightage cannot exceed 100.' });
            await getPool().query('UPDATE scoring_parameters SET parameter_name=?,candidate_field=?,value_type=?,max_weightage=?,is_active=? WHERE id=?', [p.parameter_name, p.candidate_field, p.value_type, +p.max_weightage, p.is_active ? 1 : 0, req.params.id]);
            await getPool().query('DELETE FROM scoring_ranges WHERE parameter_id=?', [req.params.id]);
            for (const [i, r] of (p.ranges || []).entries()) await getPool().query('INSERT INTO scoring_ranges(parameter_id,range_type,min_value,max_value,category_value,assigned_score,display_order) VALUES(?,?,?,?,?,?,?)', [req.params.id, r.range_type, r.min_value || null, r.max_value || null, r.category_value || null, +r.assigned_score, i]);
            return res.json({ success: true });
        } else {
            const idx = memoryScoringParameters.findIndex(item => String(item.id) === String(req.params.id));
            if (idx !== -1) {
                memoryScoringParameters[idx] = { ...memoryScoringParameters[idx], ...p };
            }
            return res.json({ success: true });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Unable to save scoring configuration.' });
    }
});

app.post('/api/admin/scoring/parameters', async (req, res) => {
    try {
        const p = req.body;
        if (isDbConnected() && getPool()) {
            const [x] = await getPool().query('INSERT INTO scoring_parameters(parameter_key,parameter_name,candidate_field,value_type,max_weightage,is_active,display_order) VALUES(?,?,?,?,0,0,999)', [p.parameter_key, p.parameter_name, p.candidate_field, p.value_type || 'number']);
            return res.json({ success: true, id: x.insertId });
        } else {
            const newId = Date.now();
            const newParam = { id: newId, parameter_key: p.parameter_key, parameter_name: p.parameter_name, candidate_field: p.candidate_field, value_type: p.value_type || 'number', max_weightage: 0, is_active: 0, ranges: [] };
            memoryScoringParameters.push(newParam);
            return res.json({ success: true, id: newId });
        }
    } catch (e) {
        return res.status(400).json({ success: false, message: 'Parameter key must be unique.' });
    }
});

app.delete('/api/admin/scoring/parameters/:id', async (req, res) => {
    try {
        if (isDbConnected() && getPool()) {
            await getPool().query('DELETE FROM scoring_parameters WHERE id=?', [req.params.id]);
        } else {
            memoryScoringParameters = memoryScoringParameters.filter(p => String(p.id) !== String(req.params.id));
        }
        return res.json({ success: true });
    } catch (e) {
        return res.status(500).json({ success: false, message: 'Unable to delete parameter.' });
    }
});

// Public Endpoint: Fetch active dropdown options
app.get('/api/dropdowns', async (req, res) => {
    try {
        const { category } = req.query;

        if (isDbConnected() && getPool()) {
            let sql = 'SELECT id, category, option_value, option_label FROM dropdown_options WHERE is_active = 1';
            const params = [];
            if (category) {
                if (category === 'pg_domain') {
                    sql += ' AND category LIKE ?';
                    params.push('pg_domain%');
                } else {
                    sql += ' AND category = ?';
                    params.push(category);
                }
            }
            sql += ' ORDER BY display_order ASC, option_label ASC';
            const [rows] = await getPool().query(sql, params);

            if (category) {
                return res.json({ success: true, category, options: rows });
            }

            const grouped = {};
            rows.forEach(r => {
                if (!grouped[r.category]) grouped[r.category] = [];
                grouped[r.category].push({ id: r.id, value: r.option_value, label: r.option_label });
            });
            return res.json({ success: true, dropdowns: grouped });
        } else {
            // Memory fallback
            let filtered = memoryDropdowns.filter(d => d.is_active === 1);
            if (category) {
                if (category === 'pg_domain') {
                    filtered = filtered.filter(d => d.category.startsWith('pg_domain'));
                } else {
                    filtered = filtered.filter(d => d.category === category);
                }
                return res.json({ success: true, category, options: filtered });
            }

            const grouped = {};
            filtered.forEach(r => {
                if (!grouped[r.category]) grouped[r.category] = [];
                grouped[r.category].push({ id: r.id, value: r.option_value, label: r.option_label });
            });
            return res.json({ success: true, dropdowns: grouped });
        }
    } catch (err) {
        console.error('Dropdown fetch error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch dropdown options.' });
    }
});

// Admin Endpoint: Fetch all dropdown options (including disabled ones)
app.get('/api/admin/dropdowns', async (req, res) => {
    try {
        if (isDbConnected() && getPool()) {
            const [rows] = await getPool().query('SELECT * FROM dropdown_options ORDER BY category ASC, display_order ASC, id ASC');
            return res.json({ success: true, options: rows });
        } else {
            return res.json({ success: true, options: memoryDropdowns });
        }
    } catch (err) {
        console.error('Admin dropdown fetch error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch admin dropdown options.' });
    }
});

// Admin Endpoint: Add a new dropdown option
app.post('/api/admin/dropdowns', async (req, res) => {
    try {
        const { category, option_value, option_label } = req.body;
        if (!category || !option_value || !option_label) {
            return res.status(400).json({ success: false, message: 'Category, value, and label are required.' });
        }

        const cat = category.trim().toLowerCase();
        const val = option_value.trim();
        const lbl = option_label.trim();

        if (isDbConnected() && getPool()) {
            await getPool().query(
                'INSERT INTO dropdown_options (category, option_value, option_label, is_active) VALUES (?, ?, ?, 1)',
                [cat, val, lbl]
            );
        } else {
            const newId = memoryDropdowns.length ? Math.max(...memoryDropdowns.map(d => d.id)) + 1 : 1;
            memoryDropdowns.push({
                id: newId,
                category: cat,
                option_value: val,
                option_label: lbl,
                is_active: 1,
                display_order: 99
            });
        }

        res.json({ success: true, message: 'Dropdown option added successfully.' });
    } catch (err) {
        console.error('Admin dropdown add error:', err);
        res.status(500).json({ success: false, message: 'Failed to add dropdown option.' });
    }
});

// Admin Endpoint: Toggle active status of a dropdown option
app.put('/api/admin/dropdowns/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (isDbConnected() && getPool()) {
            await getPool().query('UPDATE dropdown_options SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        } else {
            const opt = memoryDropdowns.find(d => d.id === parseInt(id));
            if (opt) opt.is_active = is_active ? 1 : 0;
        }
        res.json({ success: true, message: `Dropdown option status updated to ${is_active ? 'enabled' : 'disabled'}.` });
    } catch (err) {
        console.error('Admin dropdown toggle error:', err);
        res.status(500).json({ success: false, message: 'Failed to toggle dropdown status.' });
    }
});

// Admin Endpoint: Update label/value of a dropdown option
app.put('/api/admin/dropdowns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { option_label, option_value } = req.body;
        const lbl = option_label ? option_label.trim() : '';
        const val = option_value ? option_value.trim() : lbl;

        if (!lbl) return res.status(400).json({ success: false, message: 'Label required.' });

        if (isDbConnected() && getPool()) {
            await getPool().query(
                'UPDATE dropdown_options SET option_label = ?, option_value = ? WHERE id = ?',
                [lbl, val, id]
            );
        } else {
            const opt = memoryDropdowns.find(d => d.id === parseInt(id));
            if (opt) {
                opt.option_label = lbl;
                opt.option_value = val;
            }
        }
        res.json({ success: true, message: 'Dropdown option updated successfully.' });
    } catch (err) {
        console.error('Admin dropdown update error:', err);
        res.status(500).json({ success: false, message: 'Failed to update dropdown option.' });
    }
});

// Admin Endpoint: Delete a dropdown option
app.delete('/api/admin/dropdowns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (isDbConnected() && getPool()) {
            await getPool().query('DELETE FROM dropdown_options WHERE id = ?', [id]);
        } else {
            const index = memoryDropdowns.findIndex(d => d.id === parseInt(id));
            if (index !== -1) memoryDropdowns.splice(index, 1);
        }
        res.json({ success: true, message: 'Dropdown option deleted successfully.' });
    } catch (err) {
        console.error('Admin dropdown delete error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete dropdown option.' });
    }
});

/* ===========================================================
   9. ADMIN APPLICATIONS ENDPOINTS WITH SCORING RANKING
=========================================================== */

// Admin Endpoint: Get list of all staff applications with dynamic scores
app.get('/api/admin/applications', async (req, res) => {
    try {
        if (isDbConnected() && getPool()) {
            const sql = `
                SELECT 
                    u.id AS user_id,
                    u.email,
                    u.department,
                    u.created_at AS registered_at,
                    p.full_name,
                    p.post,
                    p.post_other,
                    p.applied_date,
                    p.photo_path,
                    p.phone,
                    p.updated_at AS last_updated,
                    GROUP_CONCAT(DISTINCT NULLIF(COALESCE(e.institution_name, e.institution_other), '') SEPARATOR ' || ') AS institutions
                FROM users u
                INNER JOIN personal_info p ON u.email = p.user_email AND p.full_name IS NOT NULL AND TRIM(p.full_name) != '' AND p.phone IS NOT NULL AND TRIM(p.phone) != ''
                INNER JOIN user_education e ON u.email = e.user_email
                GROUP BY u.id, u.email, u.department, u.created_at, p.full_name, p.post, p.post_other, p.applied_date, p.photo_path, p.phone, p.updated_at
                ORDER BY u.created_at DESC;
            `;
            const [rows] = await getPool().query(sql);
            for (const appItem of rows) {
                appItem.score = await computeCandidateTotalScore(appItem.email);
            }
            return res.json({ success: true, applications: rows });
        } else {
            const apps = [];
            for (const u of memoryUsers) {
                const p = memoryPersonal.find(per => per.user_email === u.email && per.full_name && per.full_name.trim() !== '');
                if (p) {
                    const score = await computeCandidateTotalScore(u.email);
                    apps.push({
                        user_id: u.id,
                        email: u.email,
                        department: u.department,
                        registered_at: u.created_at,
                        full_name: p.full_name,
                        post: p.post || 'Assistant Professor',
                        post_other: p.post_other || null,
                        applied_date: p.applied_date || new Date().toISOString().split('T')[0],
                        photo_path: p.photo_path || 'college.jpg',
                        phone: p.phone || '',
                        institutions: 'National Engineering College, Kovilpatti',
                        last_updated: p.updated_at || new Date().toISOString(),
                        score
                    });
                }
            }
            return res.json({ success: true, applications: apps });
        }
    } catch (err) {
        console.error('Admin applications error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch applications.' });
    }
});

// Admin Endpoint: Get detailed application data for a candidate by email
app.get('/api/admin/applications/:email', async (req, res) => {
    try {
        const { email } = req.params;

        if (isDbConnected() && getPool()) {
            const [users] = await getPool().query('SELECT id, email, department, created_at FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            const user = users[0];
            const [personal] = await getPool().query('SELECT * FROM personal_info WHERE user_email = ?', [email]);
            const [education] = await getPool().query('SELECT * FROM user_education WHERE user_email = ?', [email]);
            const [experience] = await getPool().query('SELECT * FROM user_experience WHERE user_email = ?', [email]);
            const [certifications] = await getPool().query('SELECT * FROM user_certifications WHERE user_email = ?', [email]);
            const [phdDetails] = await getPool().query('SELECT * FROM user_phd_details WHERE user_email = ?', [email]);

            return res.json({
                success: true,
                user,
                personal: personal[0] || null,
                education: education || [],
                experience: experience || [],
                certifications: certifications || [],
                phd_details: phdDetails[0] || null
            });
        } else {
            const user = memoryUsers.find(u => u.email === email) || { id: 1, email, department: 'CSE', created_at: new Date().toISOString() };
            const personal = memoryPersonal.find(p => p.user_email === email) || memoryPersonal[0];

            return res.json({
                success: true,
                user,
                personal,
                education: memoryEducation.filter(e => e.user_email === email),
                experience: memoryExperience.filter(e => e.user_email === email),
                certifications: memoryCertifications.filter(c => c.user_email === email),
                phd_details: memoryPhd.find(p => p.user_email === email) || null
            });
        }
    } catch (err) {
        console.error('Admin application detail error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch application detail.' });
    }
});
/* ===========================================================
   9. DATABASE-DRIVEN RECRUITMENT ASSISTANT CHATBOT ENDPOINT
=========================================================== */
app.post('/api/chatbot', async (req, res) => {
    try {
        const { message, email, isAdmin } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, reply: "Please enter a question or topic." });
        }

        const msg = message.toLowerCase().trim();
        // Strip emojis to allow matching raw keywords like "top candidates" from "🏆 Top Candidates"
        const cleanMsg = msg.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').toLowerCase().trim();
        let reply = "";
        let quickOptions = [];

        // =========================================================
        // ADMIN SPECIFIC & CANDIDATE RANK LOOKUP QUERY HANDLERS
        // =========================================================
        if (isAdmin || cleanMsg.includes('rank') || cleanMsg.includes('top candidate') || cleanMsg.includes('global') || cleanMsg.includes('highest score') || cleanMsg.includes('total application') || cleanMsg.includes('breakdown') || cleanMsg.includes('weightage') || cleanMsg.includes('dropdown') || cleanMsg.includes('navigate') || cleanMsg.includes('open') || cleanMsg.includes('view') || cleanMsg.includes('detail')) {

            // A0. SPECIFIC CANDIDATE NAME RANK / SCORE / NAVIGATION LOOKUP (e.g. "what is meenakshi rank", "navigate to meenakshi details")
            const searchWords = cleanMsg.split(/\s+/).filter(w => w.length > 2 && !['what', 'is', 'the', 'rank', 'score', 'of', 'for', 'where', 'find', 'show', 'who', 'candidate', 'applicant', 'placed', 'navigate', 'open', 'view', 'details', 'detail', 'profile', 'to'].includes(w));
            if (searchWords.length > 0 && isDbConnected() && getPool()) {
                const [allUsers] = await getPool().query('SELECT DISTINCT user_email FROM personal_info');
                if (allUsers.length > 0) {
                    const scoredList = [];
                    for (const u of allUsers) {
                        const e = u.user_email;
                        const score = await computeCandidateTotalScore(e);
                        const [p] = await getPool().query('SELECT p.full_name, p.post, u.department FROM personal_info p LEFT JOIN users u ON p.user_email = u.email WHERE p.user_email = ?', [e]);
                        if (p.length > 0) {
                            scoredList.push({
                                email: e,
                                name: p[0].full_name || e,
                                post: p[0].post || 'N/A',
                                department: p[0].department || 'N/A',
                                score
                            });
                        }
                    }
                    scoredList.sort((a, b) => b.score - a.score);

                    let targetCand = null;
                    for (let i = 0; i < scoredList.length; i++) {
                        const cand = scoredList[i];
                        const candNameLower = cand.name.toLowerCase();
                        const candEmailLower = cand.email.toLowerCase();
                        if (searchWords.some(w => candNameLower.includes(w) || candEmailLower.includes(w))) {
                            targetCand = { ...cand, rank: i + 1, totalApplicants: scoredList.length };
                            break;
                        }
                    }

                    if (targetCand) {
                        const isNavigating = cleanMsg.includes('navigate') || cleanMsg.includes('open') || cleanMsg.includes('view') || cleanMsg.includes('detail');
                        reply = (isNavigating ? `🚀 **Navigating to Candidate Application Details**:\n\n` : `📊 **Candidate Rank & Score Details**:\n\n`) +
                            `👤 **Candidate Name**: ${targetCand.name}\n` +
                            `📧 **Email**: ${targetCand.email}\n` +
                            `🏫 **Department**: ${targetCand.department}\n` +
                            `📌 **Applied Post**: ${targetCand.post}\n` +
                            `🏆 **Global Rank**: **Global #${targetCand.rank}** (out of ${targetCand.totalApplicants} applicants)\n` +
                            `💯 **Total Dynamic Score**: **${targetCand.score} Points**\n\n` +
                            (isNavigating ? `👉 **Opening candidate application modal in the portal...**` : `👉 Click below to open candidate full application modal.`);
                        quickOptions = ['🏆 Top Candidates', '📊 Total Applications', '🏫 Dept Breakdown'];
                        return res.json({ success: true, reply, quickOptions, targetEmail: targetCand.email });
                    }
                }
            }

            // A1. TOP CANDIDATES / GLOBAL #1 RANK QUERY
            if (cleanMsg.includes('top candidate') || cleanMsg.includes('top candidates') || cleanMsg.includes('rank') || cleanMsg.includes('global') || cleanMsg.includes('highest score') || cleanMsg.includes('winner') || cleanMsg.includes('who has')) {
                if (isDbConnected() && getPool()) {
                    const [allUsers] = await getPool().query('SELECT DISTINCT user_email FROM personal_info');
                    if (allUsers.length > 0) {
                        const scoredList = [];
                        for (const u of allUsers) {
                            const e = u.user_email;
                            const score = await computeCandidateTotalScore(e);
                            const [p] = await getPool().query('SELECT p.full_name, p.post, u.department FROM personal_info p LEFT JOIN users u ON p.user_email = u.email WHERE p.user_email = ?', [e]);
                            if (p.length > 0) {
                                scoredList.push({
                                    email: e,
                                    name: p[0].full_name || e,
                                    post: p[0].post || 'N/A',
                                    department: p[0].department || 'N/A',
                                    score
                                });
                            }
                        }
                        scoredList.sort((a, b) => b.score - a.score);

                        if (scoredList.length > 0) {
                            const top = scoredList[0];
                            const runners = scoredList.slice(1, 3);

                            let topStr = `🏆 **Global #1 Ranked Candidate**:\n\n` +
                                `👤 **Name**: ${top.name}\n` +
                                `📧 **Email**: ${top.email}\n` +
                                `🏫 **Department**: ${top.department}\n` +
                                `📌 **Applied Post**: ${top.post}\n` +
                                `💯 **Total Dynamic Score**: **${top.score} Points**\n\n`;

                            if (runners.length > 0) {
                                topStr += `🥇 **Runner-up Candidates**:\n` +
                                    runners.map((r, i) => `• Global #${i + 2}: **${r.name}** (${r.department}) - **${r.score} pts**`).join('\n');
                            }

                            reply = topStr;
                        } else {
                            reply = `ℹ️ No completed candidate profiles found in the database yet.`;
                        }
                    } else {
                        reply = `ℹ️ No applicant records found in the database.`;
                    }
                } else {
                    reply = `🏆 **Global #1 Candidate (Memory Data)**:\n\n` +
                        `👤 **Name**: Dr. P. Anandhi\n` +
                        `📧 **Email**: anandhi.it@gmail.com\n` +
                        `🏫 **Department**: Information Technology (IT)\n` +
                        `📌 **Post**: Assistant Professor\n` +
                        `💯 **Score**: **45 Points**`;
                }
                quickOptions = ['📊 Total Applications', '🏫 Dept Breakdown', '💯 Active Weightage Rules', '⚙️ Dropdown Manager'];
            }

            // A2. TOTAL APPLICATIONS & DEPT BREAKDOWN
            else if (cleanMsg.includes('total application') || cleanMsg.includes('total applications') || cleanMsg.includes('dept breakdown') || cleanMsg.includes('department breakdown') || cleanMsg.includes('count') || cleanMsg.includes('how many') || cleanMsg.includes('breakdown')) {
                if (isDbConnected() && getPool()) {
                    const [countRow] = await getPool().query(`
                        SELECT COUNT(DISTINCT p.user_email) as total 
                        FROM personal_info p 
                        INNER JOIN user_education e ON p.user_email = e.user_email 
                        WHERE p.full_name IS NOT NULL AND TRIM(p.full_name) != '' AND p.phone IS NOT NULL AND TRIM(p.phone) != ''
                    `);
                    const [deptGroup] = await getPool().query(`
                        SELECT u.department, COUNT(DISTINCT p.user_email) as cnt 
                        FROM personal_info p 
                        INNER JOIN user_education e ON p.user_email = e.user_email 
                        LEFT JOIN users u ON p.user_email = u.email 
                        WHERE p.full_name IS NOT NULL AND TRIM(p.full_name) != '' AND p.phone IS NOT NULL AND TRIM(p.phone) != '' 
                        GROUP BY u.department 
                        ORDER BY cnt DESC
                    `);

                    const total = countRow[0]?.total || 0;
                    const groupStr = deptGroup.map(d => `• **${d.department || 'Unassigned'}**: ${d.cnt} applicant(s)`).join('\n');

                    reply = `📊 **Recruitment Applications Overview**:\n\n` +
                        `📝 **Total Submitted Applications**: **${total} Candidates**\n\n` +
                        `🏫 **Department-wise Breakdown**:\n${groupStr || 'No data available'}`;
                } else {
                    reply = `📊 **Recruitment Overview (Memory Data)**:\n\n📝 Total Applicants: **7 Candidates**\n🏫 IT: 3 | CIVIL: 2 | ECE: 2`;
                }
                quickOptions = ['🏆 Top Candidates', '💯 Active Weightage Rules', '⚙️ Dropdown Manager'];
            }

            // A3. ACTIVE WEIGHTAGE RULES
            else if (cleanMsg.includes('weightage') || cleanMsg.includes('scoring') || cleanMsg.includes('parameter') || cleanMsg.includes('rule')) {
                let paramsList = [];
                if (isDbConnected() && getPool()) {
                    const [activeParams] = await getPool().query('SELECT parameter_name, max_weightage FROM scoring_parameters WHERE is_active = 1 ORDER BY display_order');
                    paramsList = activeParams.map(p => `• **${p.parameter_name}**: Max ${p.max_weightage} pts`);
                }
                if (paramsList.length === 0) {
                    paramsList = [
                        '• **UG CGPA**: Max 15 pts',
                        '• **PG CGPA**: Max 15 pts',
                        '• **Ph.D Completion**: Max 10 pts',
                        '• **Teaching Experience**: Max 5 pts',
                        '• **10th & 12th Scores**: Max 5 pts each'
                    ];
                }

                reply = `💯 **Admin Scoring & Weightage Parameters**:\n\n` +
                    `Active evaluation rules defined by Admin:\n\n` +
                    paramsList.join('\n') + `\n\n` +
                    `⚙️ You can edit max weightages and range thresholds in the **Weightage & Scoring** sidebar tab.`;
                quickOptions = ['🏆 Top Candidates', '📊 Total Applications', '⚙️ Dropdown Manager'];
            }

            // A4. DROPDOWN MANAGER HELP
            else if (cleanMsg.includes('dropdown') || cleanMsg.includes('option') || cleanMsg.includes('manage')) {
                reply = `⚙️ **Dropdown Options Manager Help**:\n\n` +
                    `As an Admin, you can dynamically configure dropdown selections for applicants:\n\n` +
                    `• 🏫 **Departments**: Add / disable engineering & science departments.\n` +
                    `• 📌 **Posts**: Manage faculty & staff recruitment designations.\n` +
                    `• 🏛️ **Religions & Communities**: Add official government categories.\n` +
                    `• 🎓 **Specializations**: Manage PG / Ph.D specialization options.\n\n` +
                    `👉 Navigate to **Dropdown Manager** in the Admin sidebar to make live edits.`;
                quickOptions = ['🏆 Top Candidates', '📊 Total Applications', '💯 Active Weightage Rules'];
            }

            // A5. DEFAULT ADMIN GREETING / FALLBACK
            else if (isAdmin) {
                reply = `👋 Welcome Admin! I am your **NEC Recruitment Analytics Assistant**.\n\n` +
                    `I can assist you with:\n` +
                    `• 🏆 **Top Candidates & Rank Leaderboard**\n` +
                    `• 📊 **Total Application Counts & Metrics**\n` +
                    `• 🏫 **Department-wise Application Breakdown**\n` +
                    `• 💯 **Active Scoring Weightage Rules**\n` +
                    `• ⚙️ **Dropdown Options Management Guidelines**\n\n` +
                    `What would you like to check?`;
                quickOptions = ['🏆 Top Candidates', '📊 Total Applications', '🏫 Dept Breakdown', '💯 Active Weightage Rules', '⚙️ Dropdown Manager'];
            }

            // Return response for Admin
            if (reply) {
                return res.json({ success: true, reply, quickOptions });
            }
        }

        // 1. OPEN POSITIONS & DEPARTMENTS
        if (msg.includes('post') || msg.includes('position') || msg.includes('department') || msg.includes('opening') || msg.includes('vacan') || msg.includes('job')) {
            let departments = [], posts = [];
            if (isDbConnected() && getPool()) {
                const [deptRows] = await getPool().query("SELECT option_label FROM dropdown_options WHERE category = 'department' AND is_active = 1 ORDER BY display_order");
                const [postRows] = await getPool().query("SELECT option_label FROM dropdown_options WHERE category = 'post' AND is_active = 1 ORDER BY display_order");
                departments = deptRows.map(r => r.option_label);
                posts = postRows.map(r => r.option_label);
            } else {
                departments = ['Information Technology', 'Computer Science & Engineering', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering', 'AI & Data Science'];
                posts = ['Assistant Professor', 'Associate Professor', 'Professor', 'Technical Assistant', 'Non-Teaching Staff', 'Administration'];
            }

            reply = `🏛️ **NEC Faculty & Staff Recruitment Openings**:\n\n` +
                `📋 **Available Roles / Posts**:\n• ${posts.slice(0, 6).join('\n• ')}\n\n` +
                `🏫 **Recruiting Departments**:\n• ${departments.slice(0, 8).join('\n• ')}\n\n` +
                `👉 You can select your desired post and department in Step 1 (Personal Info) of your profile application!`;
            quickOptions = ['My Application Status', 'Eligibility Rules', 'Scoring Criteria'];
        }

        // 2. CANDIDATE PROFILE STATUS & dynamic score
        else if ((msg.includes('status') || msg.includes('my profile') || msg.includes('application') || msg.includes('my score') || msg.includes('progress')) && email) {
            if (isDbConnected() && getPool()) {
                const [personal] = await getPool().query('SELECT full_name, post, applied_date FROM personal_info WHERE user_email = ?', [email]);
                const [edu] = await getPool().query('SELECT qual_type FROM user_education WHERE user_email = ?', [email]);
                const [exp] = await getPool().query('SELECT id FROM user_experience WHERE user_email = ?', [email]);
                const totalScore = await computeCandidateTotalScore(email);

                if (personal.length > 0) {
                    const p = personal[0];
                    const qualCount = edu.length;
                    const expCount = exp.length;
                    reply = `👤 **Application Profile Status for ${p.full_name || email}**:\n\n` +
                        `📌 **Target Post**: ${p.post || 'Not specified'}\n` +
                        `📅 **Applied Date**: ${p.applied_date ? new Date(p.applied_date).toLocaleDateString() : 'Draft'}\n` +
                        `🎓 **Educational Qualifications Added**: ${qualCount} entries\n` +
                        `💼 **Experience Entries Added**: ${expCount} entries\n` +
                        `💯 **Calculated Dynamic Merit Score**: **${totalScore} Points**\n\n` +
                        `✅ You can review your completed application and generate a PDF in Step 5 (Submit & Preview).`;
                } else {
                    reply = `ℹ️ You have registered with **${email}**, but haven't saved your Personal Details yet. Please complete Step 1 (Personal Info) to begin your application!`;
                }
            } else {
                reply = `👤 **Profile Status**: You are logged in as **${email}**. Please complete all 5 steps to submit your recruitment profile.`;
            }
            quickOptions = ['Available Posts', 'Scoring Criteria', 'Required Docs'];
        }

        // 3. ELIGIBILITY CRITERIA
        else if (msg.includes('eligib') || msg.includes('qualification') || msg.includes('requirement') || msg.includes('gate') || msg.includes('net') || msg.includes('slet')) {
            reply = `📜 **NEC Staff Recruitment Eligibility Guidelines**:\n\n` +
                `1. **Assistant Professor**: Essential PG degree (M.E / M.Tech / M.Sc / M.A) with minimum First Class. Ph.D or NET / SLET / GATE qualification preferred.\n` +
                `2. **Associate Professor**: Ph.D degree in relevant discipline + minimum 8 years of teaching / research / industry experience.\n` +
                `3. **Professor**: Ph.D degree in relevant field + minimum 10-15 years teaching experience with significant research publications.\n` +
                `4. **Technical Assistant**: B.E / B.Tech / B.Sc / Diploma in relevant engineering / science branch.`;
            quickOptions = ['Scoring Criteria', 'Available Posts', 'Required Docs'];
        }

        // 4. SCORING SYSTEM & WEIGHTAGE
        else if (msg.includes('score') || msg.includes('weightage') || msg.includes('marks') || msg.includes('calculation') || msg.includes('evaluate')) {
            let paramsList = [];
            if (isDbConnected() && getPool()) {
                const [activeParams] = await getPool().query('SELECT parameter_name, max_weightage FROM scoring_parameters WHERE is_active = 1 ORDER BY display_order LIMIT 8');
                paramsList = activeParams.map(p => `• **${p.parameter_name}**: Max ${p.max_weightage} pts`);
            }
            if (paramsList.length === 0) {
                paramsList = [
                    '• **UG CGPA**: Max 15 pts',
                    '• **PG CGPA**: Max 15 pts',
                    '• **Ph.D Completion**: Max 10 pts',
                    '• **Teaching Experience**: Max 5 pts',
                    '• **10th & 12th Scores**: Max 5 pts each',
                    '• **First Class & First Attempt**: Max 3 pts each'
                ];
            }

            reply = `💯 **NEC Dynamic Scoring System & Weightage**:\n\n` +
                `Applications are evaluated automatically based on admin-defined weightage parameters:\n\n` +
                paramsList.join('\n') + `\n\n` +
                `💡 Candidates with higher academic CGPA, Ph.D, and relevant teaching experience earn higher merit scores!`;
            quickOptions = ['My Application Status', 'Eligibility Rules', 'Contact Info'];
        }

        // 5. REQUIRED DOCUMENTS
        else if (msg.includes('doc') || msg.includes('upload') || msg.includes('photo') || msg.includes('certificate') || msg.includes('file')) {
            reply = `📄 **Mandatory Documents to Upload**:\n\n` +
                `• 📷 **Passport Size Photo** (Step 1 - Personal Info)\n` +
                `• 📜 **10th & 12th Marksheets / Certificates** (Step 2 - Education)\n` +
                `• 🎓 **UG Degree & Consolidate Marksheet** (Step 2)\n` +
                `• 🎓 **PG Degree & Marksheet** (Step 2)\n` +
                `• 🎓 **Ph.D Degree Certificate** (If applicable, Step 2)\n` +
                `• 🆔 **Aadhaar / ID Proof Document** (Step 2)\n\n` +
                `📌 File types supported: PDF, JPG, PNG (Max 10MB per file).`;
            quickOptions = ['Available Posts', 'My Application Status', 'Contact Info'];
        }

        // 6. CONTACT & INSTITUTION INFO
        else if (cleanMsg.includes('contact') || cleanMsg.includes('address') || cleanMsg.includes('phone') || cleanMsg.includes('location') || cleanMsg.includes('email') || cleanMsg.includes('college') || cleanMsg.includes('nec') || cleanMsg.includes('kovilpatti')) {
            reply = `📞 **National Engineering College (NEC) Contact Details**:\n\n` +
                `📍 **Address**: K.R.Nagar, Kovilpatti, Thoothukudi District, Tamil Nadu - 628503.\n` +
                `📧 **Recruitment Email**: principal@nec.edu.in / recruitment@nec.edu.in\n` +
                `🌐 **Website**: https://nec.edu.in\n` +
                `☎️ **Helpline**: 04632-222502 / 230227\n\n` +
                `Operational Hours: Monday - Saturday (9:00 AM to 5:00 PM)`;
            quickOptions = ['Available Posts', 'Scoring Criteria', 'Eligibility Rules'];
        }

        // 7. GREETINGS & GENERAL RECRUITMENT MENU
        else if (cleanMsg === 'hi' || cleanMsg === 'hello' || cleanMsg === 'hey' || cleanMsg === 'help' || cleanMsg === 'start' || cleanMsg === 'menu') {
            reply = `👋 Hello! I am the **NEC Recruitment AI Assistant**.\n\n` +
                `I can help you with database-backed information about:\n` +
                `• 💼 **Open Positions & Departments**\n` +
                `• 📊 **Your Application Profile Status & Dynamic Score**\n` +
                `• 📜 **Eligibility Criteria & Minimum Qualifications**\n` +
                `• 💯 **Scoring Weightage & Parameter Calculations**\n` +
                `• 📄 **Required Document Upload Guidelines**\n` +
                `• 📞 **NEC Kovilpatti Contact Details**\n\n` +
                `What would you like to know?`;
            quickOptions = ['Available Posts', 'My Application Status', 'Eligibility Rules', 'Scoring Criteria', 'Required Docs', 'Contact Info'];
        }

        // 8. STRICT DOMAIN GUARDRAIL FOR OFF-TOPIC QUESTIONS
        else {
            reply = `⚠️ I am the **NEC Recruitment AI Assistant**.\n\n` +
                `I am specialized to answer questions about **National Engineering College (NEC)** and this **Recruitment Portal** only.\n\n` +
                `Please ask about college details, open faculty posts, eligibility rules, dynamic scoring, required documents, or application status alone!`;
            quickOptions = isAdmin
                ? ['🏆 Top Candidates', '📊 Total Applications', '🏫 Dept Breakdown', '💯 Active Weightage Rules']
                : ['Available Posts', 'My Application Status', 'Eligibility Rules', 'Scoring Criteria', 'Required Docs'];
        }

        res.json({ success: true, reply, quickOptions });
    } catch (err) {
        console.error('Chatbot API error:', err);
        res.status(500).json({ success: false, reply: "Sorry, an internal error occurred while retrieving information from the database." });
    }
});

// SPA Fallback Route for React App
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
    }
    const distIndex = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Start server after initializing DB with dynamic port fallback
initDatabase().then(() => {
    function listenOnPort(p) {
        const srv = app.listen(p, '0.0.0.0', () => {
            console.log(`🚀 NEC Staff Portal backend server running on http://localhost:${p}`);
        });

        srv.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`⚠️ Port ${p} is in use, trying port ${p + 1}...`);
                listenOnPort(p + 1);
            } else {
                console.error('Server error:', err);
            }
        });
    }

    listenOnPort(PORT);
});
