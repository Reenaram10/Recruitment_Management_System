const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const passwordsToTry = [process.env.DB_PASSWORD, '', 'root', 'admin', 'password', '123456', 'root123'].filter(p => p !== undefined);

let pool = null;
let isDbConnected = false;

// Default initial seeded dropdown options for memory fallback
const initialDropdownOptions = [
    // Departments
    { id: 1, category: 'department', option_value: 'IT', option_label: 'Information Technology', is_active: 1, display_order: 1 },
    { id: 2, category: 'department', option_value: 'CSE', option_label: 'Computer Science & Engineering', is_active: 1, display_order: 2 },
    { id: 3, category: 'department', option_value: 'ECE', option_label: 'Electronics & Communication', is_active: 1, display_order: 3 },
    { id: 4, category: 'department', option_value: 'EEE', option_label: 'Electrical & Electronics', is_active: 1, display_order: 4 },
    { id: 5, category: 'department', option_value: 'MECH', option_label: 'Mechanical Engineering', is_active: 1, display_order: 5 },
    { id: 6, category: 'department', option_value: 'CIVIL', option_label: 'Civil Engineering', is_active: 1, display_order: 6 },
    { id: 7, category: 'department', option_value: 'AIDS', option_label: 'AI & Data Science', is_active: 1, display_order: 7 },
    { id: 8, category: 'department', option_value: 'MATHS', option_label: 'Mathematics', is_active: 1, display_order: 8 },
    { id: 9, category: 'department', option_value: 'PHYSICS', option_label: 'Physics', is_active: 1, display_order: 9 },
    { id: 10, category: 'department', option_value: 'CHEMISTRY', option_label: 'Chemistry', is_active: 1, display_order: 10 },
    { id: 11, category: 'department', option_value: 'TAMIL', option_label: 'Tamil', is_active: 1, display_order: 11 },
    { id: 12, category: 'department', option_value: 'ENGLISH', option_label: 'English', is_active: 1, display_order: 12 },
    { id: 13, category: 'department', option_value: 'NON-TEACHING', option_label: 'Non-Teaching Staff', is_active: 1, display_order: 13 },
    { id: 14, category: 'department', option_value: 'ADMINISTRATION', option_label: 'Administration', is_active: 1, display_order: 14 },

    // Posts
    { id: 15, category: 'post', option_value: 'Assistant Professor', option_label: 'Assistant Professor', is_active: 1, display_order: 1 },
    { id: 16, category: 'post', option_value: 'Associate Professor', option_label: 'Associate Professor', is_active: 1, display_order: 2 },
    { id: 17, category: 'post', option_value: 'Professor', option_label: 'Professor', is_active: 1, display_order: 3 },
    { id: 18, category: 'post', option_value: 'Lab Assistant', option_label: 'Lab Assistant', is_active: 1, display_order: 4 },
    { id: 19, category: 'post', option_value: 'Technical Assistant', option_label: 'Technical Assistant', is_active: 1, display_order: 5 },
    { id: 20, category: 'post', option_value: 'Office Staff', option_label: 'Office Staff', is_active: 1, display_order: 6 },
    { id: 21, category: 'post', option_value: 'Other', option_label: 'Other', is_active: 1, display_order: 7 },

    // Gender
    { id: 22, category: 'gender', option_value: 'Male', option_label: 'Male', is_active: 1, display_order: 1 },
    { id: 23, category: 'gender', option_value: 'Female', option_label: 'Female', is_active: 1, display_order: 2 },
    { id: 24, category: 'gender', option_value: 'Transgender', option_label: 'Transgender', is_active: 1, display_order: 3 },
    { id: 25, category: 'gender', option_value: 'Prefer not to say', option_label: 'Prefer not to say', is_active: 1, display_order: 4 },
    { id: 26, category: 'gender', option_value: 'Other', option_label: 'Other', is_active: 1, display_order: 5 },

    // Blood Group
    { id: 27, category: 'blood_group', option_value: 'A+', option_label: 'A+', is_active: 1, display_order: 1 },
    { id: 28, category: 'blood_group', option_value: 'A-', option_label: 'A-', is_active: 1, display_order: 2 },
    { id: 29, category: 'blood_group', option_value: 'B+', option_label: 'B+', is_active: 1, display_order: 3 },
    { id: 30, category: 'blood_group', option_value: 'B-', option_label: 'B-', is_active: 1, display_order: 4 },
    { id: 31, category: 'blood_group', option_value: 'O+', option_label: 'O+', is_active: 1, display_order: 5 },
    { id: 32, category: 'blood_group', option_value: 'O-', option_label: 'O-', is_active: 1, display_order: 6 },
    { id: 33, category: 'blood_group', option_value: 'AB+', option_label: 'AB+', is_active: 1, display_order: 7 },
    { id: 34, category: 'blood_group', option_value: 'AB-', option_label: 'AB-', is_active: 1, display_order: 8 },

    // Marital Status
    { id: 35, category: 'marital_status', option_value: 'Single', option_label: 'Single', is_active: 1, display_order: 1 },
    { id: 36, category: 'marital_status', option_value: 'Married', option_label: 'Married', is_active: 1, display_order: 2 },
    { id: 37, category: 'marital_status', option_value: 'Widowed', option_label: 'Widowed', is_active: 1, display_order: 3 },
    { id: 38, category: 'marital_status', option_value: 'Divorced', option_label: 'Divorced', is_active: 1, display_order: 4 },

    // Religion
    { id: 39, category: 'religion', option_value: 'Hindu', option_label: 'Hindu', is_active: 1, display_order: 1 },
    { id: 40, category: 'religion', option_value: 'Christian', option_label: 'Christian', is_active: 1, display_order: 2 },
    { id: 41, category: 'religion', option_value: 'Muslim', option_label: 'Muslim', is_active: 1, display_order: 3 },
    { id: 42, category: 'religion', option_value: 'Jain', option_label: 'Jain', is_active: 1, display_order: 4 },
    { id: 43, category: 'religion', option_value: 'Sikh', option_label: 'Sikh', is_active: 1, display_order: 5 },
    { id: 44, category: 'religion', option_value: 'Other', option_label: 'Other', is_active: 1, display_order: 6 },

    // Community
    { id: 45, category: 'community', option_value: 'OC', option_label: 'OC (Open Category)', is_active: 1, display_order: 1 },
    { id: 46, category: 'community', option_value: 'BC', option_label: 'BC (Backward Class)', is_active: 1, display_order: 2 },
    { id: 47, category: 'community', option_value: 'MBC', option_label: 'MBC (Most Backward Class)', is_active: 1, display_order: 3 },
    { id: 48, category: 'community', option_value: 'SC', option_label: 'SC (Scheduled Caste)', is_active: 1, display_order: 4 },
    { id: 49, category: 'community', option_value: 'ST', option_label: 'ST (Scheduled Tribe)', is_active: 1, display_order: 5 },

    // Ph.D Status
    { id: 50, category: 'phd_status', option_value: 'Completed', option_label: 'Completed', is_active: 1, display_order: 1 },
    { id: 51, category: 'phd_status', option_value: 'Pursuing', option_label: 'Pursuing', is_active: 1, display_order: 2 },
    { id: 52, category: 'phd_status', option_value: 'Viva Completed', option_label: 'Viva Completed', is_active: 1, display_order: 3 },
    { id: 53, category: 'phd_status', option_value: 'Submitted', option_label: 'Submitted', is_active: 1, display_order: 4 },

    // ECE PG Specialization Domains
    { id: 60, category: 'pg_domain_ece', option_value: 'Embedded Systems', option_label: 'Embedded Systems', is_active: 1, display_order: 1 },
    { id: 61, category: 'pg_domain_ece', option_value: 'VLSI Design', option_label: 'VLSI Design', is_active: 1, display_order: 2 },
    { id: 62, category: 'pg_domain_ece', option_value: 'Communication Systems', option_label: 'Communication Systems', is_active: 1, display_order: 3 },
    { id: 63, category: 'pg_domain_ece', option_value: 'Signal Processing & AI', option_label: 'Signal Processing & AI', is_active: 1, display_order: 4 },
    { id: 64, category: 'pg_domain_ece', option_value: 'Wireless & Mobile Technologies', option_label: 'Wireless & Mobile Technologies', is_active: 1, display_order: 5 },
    { id: 65, category: 'pg_domain_ece', option_value: 'Robotics & Automation', option_label: 'Robotics & Automation', is_active: 1, display_order: 6 },

    // CSE / IT PG Specialization Domains
    { id: 70, category: 'pg_domain_cse', option_value: 'Computational Intelligence', option_label: 'Computational Intelligence', is_active: 1, display_order: 1 },
    { id: 71, category: 'pg_domain_cse', option_value: 'Blockchain Technology', option_label: 'Blockchain Technology', is_active: 1, display_order: 2 },
    { id: 72, category: 'pg_domain_cse', option_value: 'AR / VR (Augmented & Virtual Reality)', option_label: 'AR / VR (Augmented & Virtual Reality)', is_active: 1, display_order: 3 },
    { id: 73, category: 'pg_domain_cse', option_value: 'Full Stack Web Development', option_label: 'Full Stack Web Development', is_active: 1, display_order: 4 },
    { id: 74, category: 'pg_domain_cse', option_value: 'Business Analytics', option_label: 'Business Analytics', is_active: 1, display_order: 5 },
    { id: 75, category: 'pg_domain_cse', option_value: 'Cyber Security & Digital Forensics', option_label: 'Cyber Security & Digital Forensics', is_active: 1, display_order: 6 },
    { id: 76, category: 'pg_domain_cse', option_value: 'Artificial Intelligence & Machine Learning', option_label: 'Artificial Intelligence & Machine Learning', is_active: 1, display_order: 7 },
    { id: 77, category: 'pg_domain_cse', option_value: 'Data Science & Analytics', option_label: 'Data Science & Analytics', is_active: 1, display_order: 8 },
    { id: 78, category: 'pg_domain_cse', option_value: 'Cloud Computing & DevOps', option_label: 'Cloud Computing & DevOps', is_active: 1, display_order: 9 },

    // EEE PG Specialization Domains
    { id: 80, category: 'pg_domain_eee', option_value: 'Power Electronics & Drives', option_label: 'Power Electronics & Drives', is_active: 1, display_order: 1 },
    { id: 81, category: 'pg_domain_eee', option_value: 'Power Systems Engineering', option_label: 'Power Systems Engineering', is_active: 1, display_order: 2 },
    { id: 82, category: 'pg_domain_eee', option_value: 'Renewable Energy Systems', option_label: 'Renewable Energy Systems', is_active: 1, display_order: 3 },
    { id: 83, category: 'pg_domain_eee', option_value: 'Electric Vehicle (EV) Technology', option_label: 'Electric Vehicle (EV) Technology', is_active: 1, display_order: 4 },

    // MECH PG Specialization Domains
    { id: 90, category: 'pg_domain_mech', option_value: 'CAD / CAM & Product Design', option_label: 'CAD / CAM & Product Design', is_active: 1, display_order: 1 },
    { id: 91, category: 'pg_domain_mech', option_value: 'Thermal Engineering', option_label: 'Thermal Engineering', is_active: 1, display_order: 2 },
    { id: 92, category: 'pg_domain_mech', option_value: 'Mechatronics & Automation', option_label: 'Mechatronics & Automation', is_active: 1, display_order: 3 },

    // CIVIL PG Specialization Domains
    { id: 95, category: 'pg_domain_civil', option_value: 'Structural Engineering', option_label: 'Structural Engineering', is_active: 1, display_order: 1 },
    { id: 96, category: 'pg_domain_civil', option_value: 'Environmental Engineering', option_label: 'Environmental Engineering', is_active: 1, display_order: 2 },
    { id: 97, category: 'pg_domain_civil', option_value: 'Construction Engineering & Management', option_label: 'Construction Engineering & Management', is_active: 1, display_order: 3 },

    // Active Recruitment Job Calls (Admin Managed)
    { id: 100, category: 'job_call', option_value: 'ECE - Assistant Professor', option_label: 'ECE - Assistant Professor (Open Call)', is_active: 1, display_order: 1 },
    { id: 101, category: 'job_call', option_value: 'ECE - Associate Professor', option_label: 'ECE - Associate Professor (Open Call)', is_active: 1, display_order: 2 },
    { id: 102, category: 'job_call', option_value: 'CSE - Assistant Professor', option_label: 'CSE - Assistant Professor (Open Call)', is_active: 1, display_order: 3 },
    { id: 103, category: 'job_call', option_value: 'CSE - Associate Professor', option_label: 'CSE - Associate Professor (Open Call)', is_active: 1, display_order: 4 },
    { id: 104, category: 'job_call', option_value: 'EEE - Assistant Professor', option_label: 'EEE - Assistant Professor (Open Call)', is_active: 1, display_order: 5 },
    { id: 105, category: 'job_call', option_value: 'MECH - Assistant Professor', option_label: 'MECH - Assistant Professor (Open Call)', is_active: 1, display_order: 6 },
    { id: 106, category: 'job_call', option_value: 'IT - Assistant Professor', option_label: 'IT - Assistant Professor (Open Call)', is_active: 1, display_order: 7 }
];

let memoryDropdowns = [...initialDropdownOptions];

let memoryUsers = [
    { id: 1, email: 'sample.faculty@gmail.com', department: 'CSE', created_at: '2026-07-25T10:00:00.000Z' },
    { id: 2, email: 'rajesh.kumar@gmail.com', department: 'CSE', created_at: '2026-08-01T10:00:00.000Z' },
    { id: 3, email: 'farooq.ece@gmail.com', department: 'ECE', created_at: '2026-08-05T10:00:00.000Z' },
    { id: 4, email: 'murugan.mech@gmail.com', department: 'MECH', created_at: '2026-08-08T10:00:00.000Z' },
    { id: 5, email: 'anandhi.it@gmail.com', department: 'IT', created_at: '2026-08-10T10:00:00.000Z' },
    { id: 6, email: 'karuppasamy.eee@gmail.com', department: 'EEE', created_at: '2026-08-12T10:00:00.000Z' },
    { id: 7, email: 'vijayabalan.aids@gmail.com', department: 'AIDS', created_at: '2026-08-15T10:00:00.000Z' },
    { id: 8, email: 'meenakshi.civil@gmail.com', department: 'CIVIL', created_at: '2026-08-18T10:00:00.000Z' },
    { id: 9, email: 'vignesh.tech@gmail.com', department: 'CSE', created_at: '2026-08-20T10:00:00.000Z' }
];

let memoryPersonal = [
    {
        user_email: 'sample.faculty@gmail.com',
        full_name: 'Dr. S. Ramakrishnan',
        post: 'Associate Professor',
        post_other: null,
        dob: '1988-05-15',
        age: 38,
        gender: 'Male',
        phone: '9876543210',
        applied_date: '2026-07-25',
        photo_path: 'college.jpg',
        father_name: 'Mr. Subramanian',
        mother_name: 'Mrs. Lakshmi',
        marital_status: 'Married',
        community: 'BC',
        caste: 'Pillai',
        religion: 'Hindu',
        aadhaar: '1234 5678 9012'
    },
    {
        user_email: 'rajesh.kumar@gmail.com',
        full_name: 'Dr. A. Rajesh Kumar',
        post: 'Professor',
        post_other: null,
        dob: '1981-03-20',
        age: 45,
        gender: 'Male',
        phone: '9842156789',
        applied_date: '2026-08-01',
        photo_path: 'college.jpg',
        father_name: 'Mr. Arumugam',
        mother_name: 'Mrs. Parvathi',
        marital_status: 'Married',
        community: 'OC',
        caste: 'Iyer',
        religion: 'Hindu',
        aadhaar: '2345 6789 0123'
    },
    {
        user_email: 'farooq.ece@gmail.com',
        full_name: 'Dr. M. Farooq Ahmed',
        post: 'Assistant Professor',
        post_other: null,
        dob: '1994-08-12',
        age: 32,
        gender: 'Male',
        phone: '9789123456',
        applied_date: '2026-08-05',
        photo_path: 'college.jpg',
        father_name: 'Mr. Mohammed Ali',
        mother_name: 'Mrs. Fatima',
        marital_status: 'Married',
        community: 'BCM',
        caste: 'Muslim',
        religion: 'Muslim',
        aadhaar: '3456 7890 1234'
    },
    {
        user_email: 'murugan.mech@gmail.com',
        full_name: 'Dr. K. Murugan',
        post: 'Professor',
        post_other: null,
        dob: '1978-11-05',
        age: 48,
        gender: 'Male',
        phone: '9443123890',
        applied_date: '2026-08-08',
        photo_path: 'college.jpg',
        father_name: 'Mr. Kandasamy',
        mother_name: 'Mrs. Valliammai',
        marital_status: 'Married',
        community: 'MBC',
        caste: 'Vanniyar',
        religion: 'Hindu',
        aadhaar: '4567 8901 2345'
    },
    {
        user_email: 'anandhi.it@gmail.com',
        full_name: 'Dr. P. Anandhi',
        post: 'Assistant Professor',
        post_other: null,
        dob: '1996-02-18',
        age: 30,
        gender: 'Female',
        phone: '9629876543',
        applied_date: '2026-08-10',
        photo_path: 'college.jpg',
        father_name: 'Mr. Perumal',
        mother_name: 'Mrs. Selvi',
        marital_status: 'Single',
        community: 'SC',
        caste: 'Adi Dravidar',
        religion: 'Hindu',
        aadhaar: '5678 9012 3456'
    },
    {
        user_email: 'karuppasamy.eee@gmail.com',
        full_name: 'Dr. R. Karuppasamy',
        post: 'Assistant Professor',
        post_other: null,
        dob: '1992-09-24',
        age: 34,
        gender: 'Male',
        phone: '9500123456',
        applied_date: '2026-08-12',
        photo_path: 'college.jpg',
        father_name: 'Mr. Ramasamy',
        mother_name: 'Mrs. Mariammal',
        marital_status: 'Married',
        community: 'SCA',
        caste: 'Arunthathiyar',
        religion: 'Hindu',
        aadhaar: '6789 0123 4567'
    },
    {
        user_email: 'vijayabalan.aids@gmail.com',
        full_name: 'Dr. T. Vijayabalan',
        post: 'Assistant Professor',
        post_other: null,
        dob: '1995-07-14',
        age: 31,
        gender: 'Male',
        phone: '9360987654',
        applied_date: '2026-08-15',
        photo_path: 'college.jpg',
        father_name: 'Mr. Thangavel',
        mother_name: 'Mrs. Valli',
        marital_status: 'Single',
        community: 'ST',
        caste: 'Malayali',
        religion: 'Hindu',
        aadhaar: '7890 1234 5678'
    },
    {
        user_email: 'meenakshi.civil@gmail.com',
        full_name: 'Dr. V. Meenakshi',
        post: 'Associate Professor',
        post_other: null,
        dob: '1989-10-30',
        age: 37,
        gender: 'Female',
        phone: '9176543210',
        applied_date: '2026-08-18',
        photo_path: 'college.jpg',
        father_name: 'Mr. Venkataraman',
        mother_name: 'Mrs. Janaki',
        marital_status: 'Married',
        community: 'OC',
        caste: 'Brahmin',
        religion: 'Hindu',
        aadhaar: '8901 2345 6789'
    },
    {
        user_email: 'vignesh.tech@gmail.com',
        full_name: 'Er. K. Vignesh',
        post: 'Technical Assistant',
        post_other: null,
        dob: '2000-01-10',
        age: 26,
        gender: 'Male',
        phone: '9080123456',
        applied_date: '2026-08-20',
        photo_path: 'college.jpg',
        father_name: 'Mr. Krishnan',
        mother_name: 'Mrs. Radhika',
        marital_status: 'Single',
        community: 'BC',
        caste: 'Nadar',
        religion: 'Hindu',
        aadhaar: '9012 3456 7890'
    }
];

let memoryEducation = [
    { user_email: 'sample.faculty@gmail.com', qual_type: 'tenth', percentage: 88.5, year_of_passing: 2004, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'SSLC', institution_name: 'Central Board of Secondary Education (CBSE), Chennai' },
    { user_email: 'sample.faculty@gmail.com', qual_type: 'twelfth', percentage: 91.2, year_of_passing: 2006, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'HSC', institution_name: 'Central Board of Secondary Education (CBSE), Chennai' },
    { user_email: 'sample.faculty@gmail.com', qual_type: 'ug', percentage: 8.85, year_of_passing: 2010, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'B.E.', institution_name: 'PSG College of Technology, Coimbatore' },
    { user_email: 'sample.faculty@gmail.com', qual_type: 'pg', percentage: 9.1, year_of_passing: 2012, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'M.E.', institution_name: 'Anna University, Chennai' },
    { user_email: 'sample.faculty@gmail.com', qual_type: 'phd', percentage: 9.5, year_of_passing: 2019, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'Ph.D.', institution_name: 'Indian Institute of Technology Madras (IIT Madras)' },

    { user_email: 'rajesh.kumar@gmail.com', qual_type: 'tenth', percentage: 94.0, year_of_passing: 1997, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'SSLC', institution_name: 'Central Board of Secondary Education (CBSE), Chennai' },
    { user_email: 'rajesh.kumar@gmail.com', qual_type: 'twelfth', percentage: 95.5, year_of_passing: 1999, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'HSC', institution_name: 'Central Board of Secondary Education (CBSE), Chennai' },
    { user_email: 'rajesh.kumar@gmail.com', qual_type: 'ug', percentage: 9.4, year_of_passing: 2003, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'B.Tech', institution_name: 'National Institute of Technology Tiruchirappalli (NIT Trichy)' },
    { user_email: 'rajesh.kumar@gmail.com', qual_type: 'pg', percentage: 9.6, year_of_passing: 2005, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'M.Tech', institution_name: 'Indian Institute of Technology Madras (IIT Madras)' },
    { user_email: 'rajesh.kumar@gmail.com', qual_type: 'phd', percentage: 9.8, year_of_passing: 2011, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'Ph.D.', institution_name: 'Indian Institute of Technology Madras (IIT Madras)' },

    { user_email: 'farooq.ece@gmail.com', qual_type: 'tenth', percentage: 85.0, year_of_passing: 2010, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'SSLC', institution_name: 'Tamil Nadu State Board Higher Secondary, Tirunelveli' },
    { user_email: 'farooq.ece@gmail.com', qual_type: 'twelfth', percentage: 87.4, year_of_passing: 2012, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'HSC', institution_name: 'Tamil Nadu State Board Higher Secondary, Tirunelveli' },
    { user_email: 'farooq.ece@gmail.com', qual_type: 'ug', percentage: 8.2, year_of_passing: 2016, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'B.E.', institution_name: 'National Engineering College, Kovilpatti' },
    { user_email: 'farooq.ece@gmail.com', qual_type: 'pg', percentage: 8.6, year_of_passing: 2018, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'M.E.', institution_name: 'SRM Institute of Science and Technology, Chennai' },
    { user_email: 'farooq.ece@gmail.com', qual_type: 'phd', percentage: 8.8, year_of_passing: 2022, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'Ph.D.', institution_name: 'Anna University, Chennai' },

    { user_email: 'murugan.mech@gmail.com', qual_type: 'tenth', percentage: 82.0, year_of_passing: 1994, medium: 'Tamil', first_attempt: 'Yes', first_class: 'Yes', degree: 'SSLC', institution_name: 'Government Higher Secondary School, Kovilpatti' },
    { user_email: 'murugan.mech@gmail.com', qual_type: 'twelfth', percentage: 84.0, year_of_passing: 1996, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'HSC', institution_name: 'Government Higher Secondary School, Kovilpatti' },
    { user_email: 'murugan.mech@gmail.com', qual_type: 'ug', percentage: 8.1, year_of_passing: 2000, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'B.E.', institution_name: 'Government College of Engineering, Tirunelveli' },
    { user_email: 'murugan.mech@gmail.com', qual_type: 'pg', percentage: 8.5, year_of_passing: 2003, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'M.E.', institution_name: 'Coimbatore Institute of Technology, Coimbatore' },
    { user_email: 'murugan.mech@gmail.com', qual_type: 'phd', percentage: 8.9, year_of_passing: 2010, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'Ph.D.', institution_name: 'Anna University, Chennai' },

    { user_email: 'anandhi.it@gmail.com', qual_type: 'tenth', percentage: 91.0, year_of_passing: 2012, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'SSLC', institution_name: 'Central Board of Secondary Education (CBSE), Chennai' },
    { user_email: 'anandhi.it@gmail.com', qual_type: 'twelfth', percentage: 92.5, year_of_passing: 2014, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'HSC', institution_name: 'Central Board of Secondary Education (CBSE), Chennai' },
    { user_email: 'anandhi.it@gmail.com', qual_type: 'ug', percentage: 8.9, year_of_passing: 2018, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'B.Tech', institution_name: 'Anna University, Chennai' },
    { user_email: 'anandhi.it@gmail.com', qual_type: 'pg', percentage: 9.0, year_of_passing: 2020, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'M.Tech', institution_name: 'Anna University, Chennai' },
    { user_email: 'anandhi.it@gmail.com', qual_type: 'phd', percentage: 9.3, year_of_passing: 2024, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'Ph.D.', institution_name: 'National Institute of Technology Tiruchirappalli (NIT Trichy)' },

    { user_email: 'karuppasamy.eee@gmail.com', qual_type: 'tenth', percentage: 83.5, year_of_passing: 2008, medium: 'Tamil', first_attempt: 'Yes', first_class: 'Yes', degree: 'SSLC', institution_name: 'Government Higher Secondary School, Kovilpatti' },
    { user_email: 'karuppasamy.eee@gmail.com', qual_type: 'twelfth', percentage: 86.0, year_of_passing: 2010, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'HSC', institution_name: 'Government Higher Secondary School, Kovilpatti' },
    { user_email: 'karuppasamy.eee@gmail.com', qual_type: 'ug', percentage: 7.8, year_of_passing: 2014, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'B.E.', institution_name: 'Government College of Engineering, Tirunelveli' },
    { user_email: 'karuppasamy.eee@gmail.com', qual_type: 'pg', percentage: 8.3, year_of_passing: 2016, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'M.E.', institution_name: 'PSG College of Technology, Coimbatore' },
    { user_email: 'karuppasamy.eee@gmail.com', qual_type: 'phd', percentage: 8.6, year_of_passing: 2021, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'Ph.D.', institution_name: 'Manonmaniam Sundaranar University, Tirunelveli' },

    { user_email: 'vijayabalan.aids@gmail.com', qual_type: 'tenth', percentage: 79.0, year_of_passing: 2011, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'SSLC', institution_name: 'Tamil Nadu State Board Higher Secondary, Tirunelveli' },
    { user_email: 'vijayabalan.aids@gmail.com', qual_type: 'twelfth', percentage: 81.5, year_of_passing: 2013, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'HSC', institution_name: 'Tamil Nadu State Board Higher Secondary, Tirunelveli' },
    { user_email: 'vijayabalan.aids@gmail.com', qual_type: 'ug', percentage: 7.6, year_of_passing: 2017, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'B.E.', institution_name: 'Kamaraj College of Engineering & Technology, Virudhunagar' },
    { user_email: 'vijayabalan.aids@gmail.com', qual_type: 'pg', percentage: 8.2, year_of_passing: 2019, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'M.Tech', institution_name: 'SASTRA Deemed University, Thanjavur' },

    { user_email: 'meenakshi.civil@gmail.com', qual_type: 'tenth', percentage: 92.0, year_of_passing: 2005, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'SSLC', institution_name: 'Central Board of Secondary Education (CBSE), Chennai' },
    { user_email: 'meenakshi.civil@gmail.com', qual_type: 'twelfth', percentage: 93.5, year_of_passing: 2007, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'HSC', institution_name: 'Central Board of Secondary Education (CBSE), Chennai' },
    { user_email: 'meenakshi.civil@gmail.com', qual_type: 'ug', percentage: 8.7, year_of_passing: 2011, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'B.E.', institution_name: 'Thiagarajar College of Engineering, Madurai' },
    { user_email: 'meenakshi.civil@gmail.com', qual_type: 'pg', percentage: 8.9, year_of_passing: 2013, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'M.E.', institution_name: 'Anna University, Chennai' },
    { user_email: 'meenakshi.civil@gmail.com', qual_type: 'phd', percentage: 9.2, year_of_passing: 2017, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'Ph.D.', institution_name: 'Indian Institute of Technology Madras (IIT Madras)' },

    { user_email: 'vignesh.tech@gmail.com', qual_type: 'tenth', percentage: 86.0, year_of_passing: 2016, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'SSLC', institution_name: 'Tamil Nadu State Board Higher Secondary, Tirunelveli' },
    { user_email: 'vignesh.tech@gmail.com', qual_type: 'twelfth', percentage: 88.0, year_of_passing: 2018, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'HSC', institution_name: 'Tamil Nadu State Board Higher Secondary, Tirunelveli' },
    { user_email: 'vignesh.tech@gmail.com', qual_type: 'ug', percentage: 7.8, year_of_passing: 2022, medium: 'English', first_attempt: 'Yes', first_class: 'Yes', degree: 'B.E.', institution_name: 'National Engineering College, Kovilpatti' }
];

let memoryExperience = [
    { user_email: 'sample.faculty@gmail.com', is_fresher: 0, exp_type: 'Teaching', org_name: 'PSG College of Technology, Coimbatore', total_duration: '7 yrs', designation: 'Assistant Professor', salary: 75000 },
    { user_email: 'rajesh.kumar@gmail.com', is_fresher: 0, exp_type: 'Teaching & Research', org_name: 'Thiagarajar College of Engineering, Madurai', total_duration: '14 yrs', designation: 'Professor', salary: 140000 },
    { user_email: 'farooq.ece@gmail.com', is_fresher: 0, exp_type: 'Teaching', org_name: 'Mepco Schlenk Engineering College, Sivakasi', total_duration: '4 yrs', designation: 'Assistant Professor', salary: 62000 },
    { user_email: 'murugan.mech@gmail.com', is_fresher: 0, exp_type: 'Teaching', org_name: 'Alagappa University, Karaikudi', total_duration: '16 yrs', designation: 'Professor', salary: 155000 },
    { user_email: 'anandhi.it@gmail.com', is_fresher: 0, exp_type: 'Teaching', org_name: 'SRM Institute of Science and Technology, Chennai', total_duration: '2 yrs', designation: 'Assistant Professor', salary: 58000 },
    { user_email: 'karuppasamy.eee@gmail.com', is_fresher: 0, exp_type: 'Teaching', org_name: 'Francis Xavier Engineering College, Tirunelveli', total_duration: '5 yrs', designation: 'Assistant Professor', salary: 65000 },
    { user_email: 'vijayabalan.aids@gmail.com', is_fresher: 0, exp_type: 'Teaching', org_name: 'Kamaraj College of Engineering & Technology', total_duration: '3 yrs', designation: 'Assistant Professor', salary: 52000 },
    { user_email: 'meenakshi.civil@gmail.com', is_fresher: 0, exp_type: 'Teaching', org_name: 'Vellore Institute of Technology (VIT), Vellore', total_duration: '8 yrs', designation: 'Associate Professor', salary: 95000 },
    { user_email: 'vignesh.tech@gmail.com', is_fresher: 1, exp_type: null, org_name: null, total_duration: '0 yrs', designation: null, salary: null }
];

let memoryCertifications = [
    { user_email: 'sample.faculty@gmail.com', title: 'Deep Learning & Neural Networks', score: '85%', category: 'NPTEL', organization: 'IIT Madras / NPTEL', year: '2021' },
    { user_email: 'sample.faculty@gmail.com', title: 'Cloud Computing & Distributed Systems', score: '90%', category: 'NPTEL', organization: 'IIT Kharagpur / NPTEL', year: '2022' },
    { user_email: 'rajesh.kumar@gmail.com', title: 'Advanced AI Architectures', score: '94%', category: 'NPTEL', organization: 'IIT Madras', year: '2020' },
    { user_email: 'rajesh.kumar@gmail.com', title: 'High Performance Parallel Computing', score: '92%', category: 'NPTEL', organization: 'IIT Kanpur', year: '2022' },
    { user_email: 'farooq.ece@gmail.com', title: 'VLSI System Testing & Verification', score: '82%', category: 'NPTEL', organization: 'IIT Kharagpur', year: '2021' },
    { user_email: 'murugan.mech@gmail.com', title: 'Solar & Thermal Renewable Energy Systems', score: '88%', category: 'NPTEL', organization: 'IIT Roorkee', year: '2019' },
    { user_email: 'anandhi.it@gmail.com', title: 'Blockchain Technology & Cyber Security', score: '89%', category: 'NPTEL', organization: 'IIT Bombay', year: '2023' },
    { user_email: 'anandhi.it@gmail.com', title: 'Applied Machine Learning', score: '91%', category: 'NPTEL', organization: 'IIT Madras', year: '2024' },
    { user_email: 'karuppasamy.eee@gmail.com', title: 'Electric Vehicles & Smart Grid Integration', score: '84%', category: 'NPTEL', organization: 'IIT Delhi', year: '2022' },
    { user_email: 'vijayabalan.aids@gmail.com', title: 'Data Science & Machine Learning Foundations', score: '80%', category: 'NPTEL', organization: 'IIT Madras', year: '2023' },
    { user_email: 'meenakshi.civil@gmail.com', title: 'Structural Dynamics & Earthquake Engineering', score: '90%', category: 'NPTEL', organization: 'IIT Madras', year: '2021' },
    { user_email: 'vignesh.tech@gmail.com', title: 'Python Data Structures & Web Development', score: '78%', category: 'NPTEL', organization: 'IIT Kanpur', year: '2023' }
];

let memoryPhd = [
    { user_email: 'sample.faculty@gmail.com', university: 'IIT Madras', title: 'Deep Neural Networks for Medical Image Classification', guide_name: 'Dr. K. Swaminathan', status: 'Completed', year_of_registration: 2014, year_of_completion: 2019, no_of_publications_during_phd: 4, no_of_publications_post_phd: 8, no_of_awards: 2, no_of_funded_projects: 1, no_of_funded_consultancy: 1 },
    { user_email: 'rajesh.kumar@gmail.com', university: 'IIT Madras', title: 'Optimized Parallel Processing in Distributed Heterogeneous Clusters', guide_name: 'Dr. V. Kamakoti', status: 'Completed', year_of_registration: 2007, year_of_completion: 2011, no_of_publications_during_phd: 6, no_of_publications_post_phd: 15, no_of_awards: 4, no_of_funded_projects: 3, no_of_funded_consultancy: 2 },
    { user_email: 'farooq.ece@gmail.com', university: 'Anna University', title: 'Low-Power Sub-Threshold Circuit Design for Embedded IoT', guide_name: 'Dr. S. Sundararajan', status: 'Completed', year_of_registration: 2018, year_of_completion: 2022, no_of_publications_during_phd: 3, no_of_publications_post_phd: 3, no_of_awards: 1, no_of_funded_projects: 1, no_of_funded_consultancy: 0 },
    { user_email: 'murugan.mech@gmail.com', university: 'Anna University', title: 'Experimental Investigation of Phase Change Materials in Solar Thermal Collectors', guide_name: 'Dr. P. Ganesan', status: 'Completed', year_of_registration: 2005, year_of_completion: 2010, no_of_publications_during_phd: 5, no_of_publications_post_phd: 12, no_of_awards: 3, no_of_funded_projects: 2, no_of_funded_consultancy: 1 },
    { user_email: 'anandhi.it@gmail.com', university: 'NIT Trichy', title: 'Privacy-Preserving Decentralized Smart Contracts for Healthcare', guide_name: 'Dr. N. Ramaswamy', status: 'Completed', year_of_registration: 2020, year_of_completion: 2024, no_of_publications_during_phd: 4, no_of_publications_post_phd: 2, no_of_awards: 2, no_of_funded_projects: 1, no_of_funded_consultancy: 0 },
    { user_email: 'karuppasamy.eee@gmail.com', university: 'Manonmaniam Sundaranar University', title: 'Adaptive Control Algorithms for Microgrid Power Quality Enhancement', guide_name: 'Dr. M. Shanmugam', status: 'Completed', year_of_registration: 2017, year_of_completion: 2021, no_of_publications_during_phd: 3, no_of_publications_post_phd: 4, no_of_awards: 1, no_of_funded_projects: 0, no_of_funded_consultancy: 1 },
    { user_email: 'vijayabalan.aids@gmail.com', university: 'Anna University', title: 'Real-Time Streaming Big Data Analytics in Distributed Cloud Environments', guide_name: 'Dr. R. Senthamilselvan', status: 'Pursuing', year_of_registration: 2022, year_of_completion: null, no_of_publications_during_phd: 2, no_of_publications_post_phd: 0, no_of_awards: 0, no_of_funded_projects: 0, no_of_funded_consultancy: 0 },
    { user_email: 'meenakshi.civil@gmail.com', university: 'IIT Madras', title: 'Seismic Performance of High-Rise RC Framed Buildings with Viscous Dampers', guide_name: 'Dr. A. Meher Prasad', status: 'Completed', year_of_registration: 2013, year_of_completion: 2017, no_of_publications_during_phd: 4, no_of_publications_post_phd: 6, no_of_awards: 2, no_of_funded_projects: 1, no_of_funded_consultancy: 1 }
];


let memoryInstitutionRankings = [
    { id: 1, college_name: 'National Engineering College, Kovilpatti', category: 'Engineering', nirf_rank: 101, nba_accredited: 'Yes', tier: 'Tier 2', score: 85 },
    { id: 2, college_name: 'Anna University, Chennai', category: 'Engineering', nirf_rank: 13, nba_accredited: 'Yes', tier: 'Tier 1', score: 98 },
    { id: 3, college_name: 'Indian Institute of Technology Madras (IIT Madras)', category: 'Engineering', nirf_rank: 1, nba_accredited: 'Yes', tier: 'Tier 1', score: 100 },
    { id: 4, college_name: 'National Institute of Technology Tiruchirappalli (NIT Trichy)', category: 'Engineering', nirf_rank: 9, nba_accredited: 'Yes', tier: 'Tier 1', score: 99 },
    { id: 5, college_name: 'PSG College of Technology, Coimbatore', category: 'Engineering', nirf_rank: 63, nba_accredited: 'Yes', tier: 'Tier 2', score: 90 },
    { id: 6, college_name: 'Thiagarajar College of Engineering, Madurai', category: 'Engineering', nirf_rank: 85, nba_accredited: 'Yes', tier: 'Tier 2', score: 88 }
];

async function initDatabase() {
    let host = process.env.DB_HOST || 'localhost';
    let user = process.env.DB_USER || 'root';
    let dbName = process.env.DB_NAME || 'necfacultyrecruitment';

    for (let pw of passwordsToTry) {
        try {
            const conn = await mysql.createConnection({
                host: host,
                user: user,
                password: pw,
                multipleStatements: true
            });

            await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await conn.query(`USE \`${dbName}\``);

            // Ensure user_education table exists with proper schema
            await conn.query(`
                CREATE TABLE IF NOT EXISTS \`user_education\` (
                  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                  \`user_email\` VARCHAR(255) NOT NULL,
                  \`qual_type\` VARCHAR(20) NOT NULL,
                  \`is_na\` TINYINT(1) DEFAULT 0,
                  \`percentage\` DECIMAL(5,2) DEFAULT NULL,
                  \`year_of_passing\` INT DEFAULT NULL,
                  \`medium\` VARCHAR(50) DEFAULT NULL,
                  \`medium_other\` VARCHAR(100) DEFAULT NULL,
                  \`first_attempt\` VARCHAR(50) DEFAULT NULL,
                  \`first_class\` VARCHAR(50) DEFAULT NULL,
                  \`degree\` VARCHAR(100) DEFAULT NULL,
                  \`degree_other\` VARCHAR(100) DEFAULT NULL,
                  \`specialization\` VARCHAR(150) DEFAULT NULL,
                  \`specialization_other\` VARCHAR(150) DEFAULT NULL,
                  \`topic\` VARCHAR(255) DEFAULT NULL,
                  \`institution_name\` VARCHAR(255) DEFAULT NULL,
                  \`institution_other\` VARCHAR(255) DEFAULT NULL,
                  \`cert_path\` VARCHAR(255) DEFAULT NULL,
                  \`ug_gate_score\` VARCHAR(50) DEFAULT NULL,
                  \`ug_net_slet_score\` VARCHAR(50) DEFAULT NULL,
                  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  UNIQUE KEY \`user_qual_unique\` (\`user_email\`(191), \`qual_type\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);

            console.log(`✅ Connected to MySQL server successfully.`);
            console.log('✅ Using normalized tbl_ schema architecture.');

            await conn.end();

            pool = mysql.createPool({
                host: host,
                user: user,
                password: pw,
                database: dbName,
                dateStrings: true,
                multipleStatements: true,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            isDbConnected = true;

            // Auto-migrate schema: ensure columns exist in base tables
            const alterCols = [
                "ALTER TABLE tbl_personal_info ADD COLUMN txt_Ug_Gate_Score VARCHAR(50) DEFAULT NULL",
                "ALTER TABLE tbl_personal_info ADD COLUMN txt_Ug_Net_Slet_Score VARCHAR(50) DEFAULT NULL",
                "ALTER TABLE tbl_personal_info ADD COLUMN txt_Pg_Gate_Score VARCHAR(50) DEFAULT NULL",
                "ALTER TABLE tbl_personal_info ADD COLUMN txt_Pg_Net_Slet_Score VARCHAR(50) DEFAULT NULL",
                "ALTER TABLE tbl_user_education ADD COLUMN txt_Ug_Gate_Score VARCHAR(50) DEFAULT NULL",
                "ALTER TABLE tbl_user_education ADD COLUMN txt_Ug_Net_Slet_Score VARCHAR(50) DEFAULT NULL",
                "ALTER TABLE tbl_user_phd_details ADD COLUMN int_No_Of_Awards INT DEFAULT 0",
                "ALTER TABLE tbl_user_phd_details ADD COLUMN int_No_Of_Funded_Projects INT DEFAULT 0",
                "ALTER TABLE tbl_user_phd_details ADD COLUMN int_No_Of_Funded_Consultancy INT DEFAULT 0"
            ];
            for (const colSql of alterCols) {
                try { await pool.query(colSql); } catch (e) { /* ignore if column exists */ }
            }

            // Deduplicate tbl_personal_info (keep row with MAX int_Personal_Id for each txt_User_Email)
            try {
                await pool.query(`
                    DELETE p1 FROM tbl_personal_info p1
                    INNER JOIN tbl_personal_info p2
                    ON p1.txt_User_Email = p2.txt_User_Email AND p1.int_Personal_Id < p2.int_Personal_Id
                `);
                console.log('✅ tbl_personal_info deduplicated.');
            } catch (e) {
                console.warn('Warning during tbl_personal_info deduplication:', e.message);
            }

            // Add UNIQUE key on tbl_personal_info(txt_User_Email)
            try {
                await pool.query(`ALTER TABLE tbl_personal_info ADD UNIQUE KEY uk_txt_User_Email (txt_User_Email(191))`);
                console.log('✅ Added UNIQUE constraint uk_txt_User_Email on tbl_personal_info.');
            } catch (e) { /* index may already exist */ }

            // Deduplicate tbl_user_education (keep row with MAX int_Education_Id for each txt_User_Email, txt_Qual_Type)
            try {
                await pool.query(`
                    DELETE e1 FROM tbl_user_education e1
                    INNER JOIN tbl_user_education e2
                    ON e1.txt_User_Email = e2.txt_User_Email
                    AND e1.txt_Qual_Type = e2.txt_Qual_Type
                    AND e1.int_Education_Id < e2.int_Education_Id
                `);
                console.log('✅ tbl_user_education deduplicated.');
            } catch (e) {
                console.warn('Warning during tbl_user_education deduplication:', e.message);
            }

            // Add UNIQUE key on tbl_user_education(txt_User_Email, txt_Qual_Type)
            try {
                await pool.query(`ALTER TABLE tbl_user_education ADD UNIQUE KEY uk_user_qual (txt_User_Email(191), txt_Qual_Type)`);
                console.log('✅ Added UNIQUE constraint uk_user_qual on tbl_user_education.');
            } catch (e) { /* index may already exist */ }

            // Deduplicate tbl_user_phd_details
            try {
                await pool.query(`
                    DELETE d1 FROM tbl_user_phd_details d1
                    INNER JOIN tbl_user_phd_details d2
                    ON d1.txt_User_Email = d2.txt_User_Email AND d1.int_Phd_Id < d2.int_Phd_Id
                `);
                console.log('✅ tbl_user_phd_details deduplicated.');
            } catch (e) {
                console.warn('Warning during tbl_user_phd_details deduplication:', e.message);
            }

            // Add UNIQUE key on tbl_user_phd_details(txt_User_Email)
            try {
                await pool.query(`ALTER TABLE tbl_user_phd_details ADD UNIQUE KEY uk_txt_User_Email (txt_User_Email(191))`);
                console.log('✅ Added UNIQUE constraint uk_txt_User_Email on tbl_user_phd_details.');
            } catch (e) { /* index may already exist */ }

            // Re-create Views to guarantee view columns match base tables
            try {
                const viewsSql = `
                    CREATE OR REPLACE VIEW users AS
                    SELECT int_User_Id AS id, txt_User_Email AS email, txt_User_Password AS password, txt_Department_Name AS department, dte_Created_Date AS created_at
                    FROM tbl_Users;

                    CREATE OR REPLACE VIEW personal_info AS
                    SELECT
                        int_Personal_Id AS id, txt_User_Email AS user_email, dte_Applied_Date AS applied_date, txt_Post_Applied AS post, txt_Post_Other AS post_other,
                        txt_Full_Name AS full_name, dte_Dob AS dob, int_Age AS age, txt_Father_Name AS father_name, txt_Mother_Name AS mother_name,
                        txt_Gender AS gender, txt_Gender_Other AS gender_other, txt_Blood_Group AS blood_group, txt_Blood_Group_Other AS blood_group_other,
                        txt_Marital_Status AS marital_status, txt_Spouse_Name AS spouse_name, txt_Marital_Status_Other AS marital_status_other,
                        txt_Photo_Path AS photo_path, txt_Nationality AS nationality, txt_Religion AS religion, txt_Religion_Other AS religion_other,
                        txt_Community AS community, txt_Community_Other AS community_other, txt_Caste AS caste, txt_Contact_Email AS email, txt_Alt_Email AS alt_email,
                        txt_Phone AS phone, txt_Whatsapp AS whatsapp, txt_Emergency_Name AS emergency_name, txt_Emergency_Relation AS emergency_relation,
                        txt_Emergency_Phone AS emergency_phone, txt_Aadhaar_No AS aadhaar, txt_Permanent_Address AS permanent_address, txt_Communication_Address AS communication_address,
                        txt_State_Name AS state, txt_District_Name AS district, txt_Pincode AS pincode, txt_Tenth_Doc_Path AS tenth_doc, txt_Twelfth_Doc_Path AS twelfth_doc,
                        txt_Ug_Doc_Path AS ug_doc, txt_Pg_Doc_Path AS pg_doc, txt_Mphil_Doc_Path AS mphil_doc, txt_Phd_Doc_Path AS phd_doc, txt_Id_Proof_Doc_Path AS id_proof_doc,
                        txt_Ug_Gate_Score AS ug_gate_score, txt_Ug_Net_Slet_Score AS ug_net_slet_score, txt_Pg_Gate_Score AS pg_gate_score, txt_Pg_Net_Slet_Score AS pg_net_slet_score,
                        dte_Created_Date AS created_at, dte_Updated_Date AS updated_at
                    FROM tbl_Personal_Info;

                    CREATE OR REPLACE VIEW user_education AS
                    SELECT
                        int_Education_Id AS id, txt_User_Email AS user_email, txt_Qual_Type AS qual_type, txt_Is_Na AS is_na, dec_Percentage AS percentage,
                        int_Year_Of_Passing AS year_of_passing, txt_Medium AS medium, txt_Medium_Other AS medium_other, txt_First_Attempt AS first_attempt,
                        txt_First_Class AS first_class, txt_Degree AS degree, txt_Degree_Other AS degree_other, txt_Specialization AS specialization,
                        txt_Specialization_Other AS specialization_other, txt_Topic AS topic, txt_Institution_Name AS institution_name, txt_Institution_Other AS institution_other,
                        txt_Cert_Path AS cert_path, txt_Ug_Gate_Score AS ug_gate_score, txt_Ug_Net_Slet_Score AS ug_net_slet_score, dte_Created_Date AS created_at
                    FROM tbl_User_Education;

                    CREATE OR REPLACE VIEW user_experience AS
                    SELECT
                        int_Experience_Id AS id, txt_User_Email AS user_email, txt_Is_Fresher AS is_fresher, txt_Exp_Type AS exp_type, txt_Org_Name AS org_name,
                        dte_From_Date AS from_date, dte_To_Date AS to_date, txt_Total_Duration AS total_duration, txt_Designation AS designation, dec_Salary AS salary,
                        dte_Created_Date AS created_at
                    FROM tbl_User_Experience;

                    CREATE OR REPLACE VIEW user_certifications AS
                    SELECT
                        int_Certification_Id AS id, txt_User_Email AS user_email, txt_Title AS title, txt_Score AS score, txt_Category AS category,
                        txt_Organization AS organization, int_Year AS year, txt_Cert_Doc AS cert_doc, dte_Created_Date AS created_at
                    FROM tbl_User_Certifications;

                    CREATE OR REPLACE VIEW user_phd_details AS
                    SELECT
                        int_Phd_Id AS id, txt_User_Email AS user_email, txt_University AS university, txt_Thesis_Title AS title, txt_Guide_Name AS guide_name,
                        txt_Guide_College AS guide_college, txt_Status AS status, int_Year_Of_Registration AS year_of_registration, int_Year_Of_Completion AS year_of_completion,
                        int_Publications_During_Phd AS no_of_publications_during_phd, int_Publications_Post_Phd AS no_of_publications_post_phd, txt_Post_Phd_Experience AS post_phd_experience,
                        int_No_Of_Awards AS no_of_awards, int_No_Of_Funded_Projects AS no_of_funded_projects, int_No_Of_Funded_Consultancy AS no_of_funded_consultancy, dte_Created_Date AS created_at, dte_Updated_Date AS updated_at
                    FROM tbl_User_Phd_Details;
                `;
                await pool.query(viewsSql);
                console.log('✅ Views created/updated successfully.');
            } catch (e) {
                console.warn('Warning creating views:', e.message);
            }

            console.log('✅ Database auto-migrations completed.');
            return;
        } catch (err) {
            console.error('DB INIT CATCH ERROR for PW:', pw, err.message);
            // try next password
        }
    }

    console.warn('⚠️ Could not connect to MySQL server. Operating in memory-fallback mode.');
    isDbConnected = false;
}

module.exports = {
    getPool: () => pool,
    isDbConnected: () => isDbConnected,
    initDatabase,
    memoryDropdowns,
    memoryUsers,
    memoryPersonal,
    memoryEducation,
    memoryExperience,
    memoryCertifications,
    memoryPhd,
    memoryInstitutionRankings
};
