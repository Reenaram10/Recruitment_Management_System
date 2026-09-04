-- MySQL Schema for NEC Staff Recruitment Portal

CREATE DATABASE IF NOT EXISTS `necfacultyrecruitment` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `necfacultyrecruitment`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Personal Information Table
CREATE TABLE IF NOT EXISTS `personal_info` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_email` VARCHAR(255) NOT NULL UNIQUE,
  `applied_date` DATE DEFAULT NULL,
  `post` VARCHAR(100) DEFAULT NULL,
  `post_other` VARCHAR(100) DEFAULT NULL,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `dob` DATE DEFAULT NULL,
  `age` INT DEFAULT NULL,
  `father_name` VARCHAR(255) DEFAULT NULL,
  `mother_name` VARCHAR(255) DEFAULT NULL,
  `gender` VARCHAR(50) DEFAULT NULL,
  `gender_other` VARCHAR(100) DEFAULT NULL,
  `blood_group` VARCHAR(20) DEFAULT NULL,
  `blood_group_other` VARCHAR(50) DEFAULT NULL,
  `marital_status` VARCHAR(50) DEFAULT NULL,
  `spouse_name` VARCHAR(255) DEFAULT NULL,
  `marital_status_other` VARCHAR(100) DEFAULT NULL,
  `photo_path` VARCHAR(255) DEFAULT NULL,
  `nationality` VARCHAR(100) DEFAULT NULL,
  `religion` VARCHAR(100) DEFAULT NULL,
  `religion_other` VARCHAR(100) DEFAULT NULL,
  `community` VARCHAR(100) DEFAULT NULL,
  `community_other` VARCHAR(100) DEFAULT NULL,
  `caste` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `alt_email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `whatsapp` VARCHAR(20) DEFAULT NULL,
  `emergency_name` VARCHAR(255) DEFAULT NULL,
  `emergency_relation` VARCHAR(100) DEFAULT NULL,
  `emergency_phone` VARCHAR(20) DEFAULT NULL,
  `aadhaar` VARCHAR(20) DEFAULT NULL,
  `permanent_address` TEXT DEFAULT NULL,
  `communication_address` TEXT DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `pincode` VARCHAR(10) DEFAULT NULL,
  `tenth_doc` VARCHAR(255) DEFAULT NULL,
  `twelfth_doc` VARCHAR(255) DEFAULT NULL,
  `ug_doc` VARCHAR(255) DEFAULT NULL,
  `pg_doc` VARCHAR(255) DEFAULT NULL,
  `mphil_doc` VARCHAR(255) DEFAULT NULL,
  `phd_doc` VARCHAR(255) DEFAULT NULL,
  `id_proof_doc` VARCHAR(255) DEFAULT NULL,
  `ug_gate_score` VARCHAR(50) DEFAULT NULL,
  `ug_net_slet_score` VARCHAR(50) DEFAULT NULL,
  `pg_gate_score` VARCHAR(50) DEFAULT NULL,
  `pg_net_slet_score` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_email`) REFERENCES `users`(`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. USER CERTIFICATIONS TABLE (NPTEL / Online / Other)
CREATE TABLE IF NOT EXISTS user_certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    score VARCHAR(50) DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    organization VARCHAR(255) DEFAULT NULL,
    year VARCHAR(10) DEFAULT NULL,
    cert_doc VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. USER PHD DETAILS TABLE
CREATE TABLE IF NOT EXISTS user_phd_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    university VARCHAR(255) DEFAULT NULL,
    title VARCHAR(500) DEFAULT NULL,
    guide_name VARCHAR(255) DEFAULT NULL,
    guide_college VARCHAR(255) DEFAULT NULL,
    status ENUM('Completed', 'Pursuing', 'Viva Completed', 'Submitted') DEFAULT 'Completed',
    year_of_registration INT DEFAULT NULL,
    year_of_completion INT DEFAULT NULL,
    no_of_publications_during_phd INT DEFAULT 0,
    no_of_publications_post_phd INT DEFAULT 0,
    no_of_awards INT DEFAULT 0,
    no_of_funded_projects INT DEFAULT 0,
    no_of_funded_consultancy INT DEFAULT 0,
    post_phd_experience TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dynamic, administrator-managed scoring configuration. No marks or ranges are seeded.
CREATE TABLE IF NOT EXISTS scoring_parameters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parameter_key VARCHAR(100) NOT NULL UNIQUE,
  parameter_name VARCHAR(150) NOT NULL,
  candidate_field VARCHAR(100) NOT NULL,
  value_type ENUM('number','category') NOT NULL DEFAULT 'number',
  max_weightage DECIMAL(6,2) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scoring_ranges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parameter_id INT NOT NULL,
  range_type ENUM('number','category') NOT NULL DEFAULT 'number',
  min_value DECIMAL(12,2) DEFAULT NULL,
  max_value DECIMAL(12,2) DEFAULT NULL,
  category_value VARCHAR(255) DEFAULT NULL,
  assigned_score DECIMAL(6,2) NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (parameter_id) REFERENCES scoring_parameters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- These are data bindings only; administrators provide all weightages and score ranges.
INSERT IGNORE INTO scoring_parameters (parameter_key, parameter_name, candidate_field, value_type, display_order) VALUES
('tenth_score','10th Score','tenth.score','number',1),('tenth_medium','10th Medium','tenth.medium','category',2),('twelfth_medium','12th Medium','twelfth.medium','category',3),('twelfth_score','12th Score','twelfth.score','number',4),
('ug_institute','UG Institute','ug.institute','category',4),('ug_cgpa','UG CGPA','ug.score','number',5),('ug_first_attempt','UG First Attempt','ug.first_attempt','category',6),('ug_first_class','UG First Class','ug.first_class','category',7),
('pg_institute','PG Institute','pg.institute','category',8),('pg_cgpa','PG CGPA','pg.score','number',9),('pg_first_attempt','PG First Attempt','pg.first_attempt','category',10),('pg_first_class','PG First Class','pg.first_class','category',11),
('mphil_score','M.Phil Score','mphil.score','number',12),('mphil_institute','M.Phil Institute','mphil.institute','category',13),('mphil_first_attempt','M.Phil First Attempt','mphil.first_attempt','category',14),('mphil_first_class','M.Phil First Class','mphil.first_class','category',15),
('phd_completion','Ph.D. Completion','phd.completed','category',16),('net','NET','ug.net_slet_score','number',17),('slet','SLET','ug.net_slet_score','number',18),('gate_score','GATE Score','ug.gate_score','number',19),('experience','Experience','experience.years','number',20),
('publications_during_phd','Publications During Ph.D.','phd.publications_during','number',21),('awards','Awards','phd.awards','number',22),('nptel_course','NPTEL Course','certifications.nptel_count','number',23),('funded_projects','Funded Projects','phd.funded_projects','category',24),('funded_consultancy','Funded Consultancy','phd.funded_consultancy','category',25);

-- 3. Education Information Table
CREATE TABLE IF NOT EXISTS `user_education` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_email` VARCHAR(255) NOT NULL,
  `qual_type` VARCHAR(20) NOT NULL COMMENT 'tenth, twelfth, ug, pg, mphil, phd',
  `is_na` TINYINT(1) DEFAULT 0,
  `percentage` DECIMAL(5,2) DEFAULT NULL,
  `year_of_passing` INT DEFAULT NULL,
  `medium` VARCHAR(50) DEFAULT NULL,
  `medium_other` VARCHAR(100) DEFAULT NULL,
  `first_attempt` VARCHAR(50) DEFAULT NULL,
  `first_class` VARCHAR(50) DEFAULT NULL,
  `degree` VARCHAR(100) DEFAULT NULL,
  `degree_other` VARCHAR(100) DEFAULT NULL,
  `specialization` VARCHAR(150) DEFAULT NULL,
  `specialization_other` VARCHAR(150) DEFAULT NULL,
  `topic` VARCHAR(255) DEFAULT NULL,
  `institution_name` VARCHAR(255) DEFAULT NULL,
  `institution_other` VARCHAR(255) DEFAULT NULL,
  `cert_path` VARCHAR(255) DEFAULT NULL,
  `ug_gate_score` VARCHAR(50) DEFAULT NULL,
  `ug_net_slet_score` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `user_qual_unique` (`user_email`, `qual_type`),
  FOREIGN KEY (`user_email`) REFERENCES `users`(`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Work Experience Table
CREATE TABLE IF NOT EXISTS `user_experience` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_email` VARCHAR(255) NOT NULL,
  `is_fresher` TINYINT(1) DEFAULT 0,
  `exp_type` VARCHAR(50) DEFAULT NULL,
  `org_name` VARCHAR(255) DEFAULT NULL,
  `from_date` DATE DEFAULT NULL,
  `to_date` DATE DEFAULT NULL,
  `total_duration` VARCHAR(50) DEFAULT NULL,
  `designation` VARCHAR(100) DEFAULT NULL,
  `salary` DECIMAL(10,2) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_email`) REFERENCES `users`(`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Master Institutions Table for Education Dropdowns
CREATE TABLE IF NOT EXISTS `institutions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `category` VARCHAR(100) DEFAULT 'College/University',
  `state` VARCHAR(100) DEFAULT 'Tamil Nadu'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5b. School & Village Names Table for 10th/12th Dropdowns
CREATE TABLE IF NOT EXISTS `school_village_names` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_name` VARCHAR(255) NOT NULL,
  `village_name` VARCHAR(255) DEFAULT NULL,
  `full_display` VARCHAR(500) NOT NULL,
  INDEX `idx_school_name` (`school_name`),
  INDEX `idx_full_display` (`full_display`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Institutions Data
INSERT IGNORE INTO `institutions` (`name`, `category`, `state`) VALUES
('National Engineering College, Kovilpatti', 'Engineering College', 'Tamil Nadu'),
('Anna University, Chennai', 'University', 'Tamil Nadu'),
('Indian Institute of Technology Madras (IIT Madras)', 'IIT', 'Tamil Nadu'),
('National Institute of Technology Tiruchirappalli (NIT Trichy)', 'NIT', 'Tamil Nadu'),
('Thiagarajar College of Engineering, Madurai', 'Engineering College', 'Tamil Nadu'),
('PSG College of Technology, Coimbatore', 'Engineering College', 'Tamil Nadu'),
('Coimbatore Institute of Technology, Coimbatore', 'Engineering College', 'Tamil Nadu'),
('Mepco Schlenk Engineering College, Sivakasi', 'Engineering College', 'Tamil Nadu'),
('Government College of Engineering, Tirunelveli', 'Engineering College', 'Tamil Nadu'),
('Manonmaniam Sundaranar University, Tirunelveli', 'University', 'Tamil Nadu'),
('Madurai Kamaraj University, Madurai', 'University', 'Tamil Nadu'),
('Bharathidasan University, Tiruchirappalli', 'University', 'Tamil Nadu'),
('Kamaraj College of Engineering & Technology, Virudhunagar', 'Engineering College', 'Tamil Nadu'),
('St. Xavier\'s College, Palayamkottai', 'Arts & Science College', 'Tamil Nadu'),
('St. John\'s College, Palayamkottai', 'Arts & Science College', 'Tamil Nadu'),
('Sadakathullah Appa College, Tirunelveli', 'Arts & Science College', 'Tamil Nadu'),
('Sarah Tucker College, Tirunelveli', 'Arts & Science College', 'Tamil Nadu'),
('V.O.Chidambaram College, Thoothukudi', 'Arts & Science College', 'Tamil Nadu'),
('Francis Xavier Engineering College, Tirunelveli', 'Engineering College', 'Tamil Nadu'),
('SRM Institute of Science and Technology, Chennai', 'Deemed University', 'Tamil Nadu'),
('Vellore Institute of Technology (VIT), Vellore', 'Deemed University', 'Tamil Nadu'),
('SASTRA Deemed University, Thanjavur', 'Deemed University', 'Tamil Nadu'),
('Amrita Vishwa Vidyapeetham, Coimbatore', 'Deemed University', 'Tamil Nadu'),
('SSN College of Engineering, Chennai', 'Engineering College', 'Tamil Nadu'),
('Sathyabama Institute of Science and Technology, Chennai', 'Deemed University', 'Tamil Nadu'),
('Hindustan Institute of Technology and Science, Chennai', 'Deemed University', 'Tamil Nadu'),
('Kongu Engineering College, Erode', 'Engineering College', 'Tamil Nadu'),
('Bannari Amman Institute of Technology, Sathyamangalam', 'Engineering College', 'Tamil Nadu'),
('Kumaraguru College of Technology, Coimbatore', 'Engineering College', 'Tamil Nadu'),
('Sri Krishna College of Engineering and Technology, Coimbatore', 'Engineering College', 'Tamil Nadu'),
('Vel Tech Rangarajan Dr.Sagunthala R&D Institute, Chennai', 'Deemed University', 'Tamil Nadu'),
('Alagappa University, Karaikudi', 'University', 'Tamil Nadu'),
('Annamalai University, Chidambaram', 'University', 'Tamil Nadu'),
('Periyar University, Salem', 'University', 'Tamil Nadu'),
('Bharathiar University, Coimbatore', 'University', 'Tamil Nadu'),
('Central Board of Secondary Education (CBSE)', 'School Board', 'All India'),
('Tamil Nadu State Board (Matriculation/Higher Secondary)', 'School Board', 'Tamil Nadu'),
('Indian Certificate of Secondary Education (ICSE)', 'School Board', 'All India');

-- 6. Master Table for Managed Dropdown Options
CREATE TABLE IF NOT EXISTS `dropdown_options` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(50) NOT NULL COMMENT 'department, post, gender, blood_group, marital_status, religion, community, phd_status',
  `option_value` VARCHAR(100) NOT NULL,
  `option_label` VARCHAR(150) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `cat_val_unique` (`category`, `option_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Master Dropdown Options
INSERT IGNORE INTO `dropdown_options` (`category`, `option_value`, `option_label`, `display_order`) VALUES
-- Departments
('department', 'IT', 'Information Technology', 1),
('department', 'CSE', 'Computer Science & Engineering', 2),
('department', 'ECE', 'Electronics & Communication', 3),
('department', 'EEE', 'Electrical & Electronics', 4),
('department', 'MECH', 'Mechanical Engineering', 5),
('department', 'CIVIL', 'Civil Engineering', 6),
('department', 'AIDS', 'AI & Data Science', 7),
('department', 'MATHS', 'Mathematics', 8),
('department', 'PHYSICS', 'Physics', 9),
('department', 'CHEMISTRY', 'Chemistry', 10),
('department', 'TAMIL', 'Tamil', 11),
('department', 'ENGLISH', 'English', 12),
('department', 'NON-TEACHING', 'Non-Teaching Staff', 13),
('department', 'ADMINISTRATION', 'Administration', 14),

-- Posts
('post', 'Assistant Professor', 'Assistant Professor', 1),
('post', 'Associate Professor', 'Associate Professor', 2),
('post', 'Professor', 'Professor', 3),
('post', 'Technical Assistant', 'Technical Assistant', 4),
('post', 'Non-Teaching Staff', 'Non-Teaching Staff', 5),
('post', 'Administration', 'Administration', 6),
('post', 'Other', 'Other', 7),

-- Gender
('gender', 'Male', 'Male', 1),
('gender', 'Female', 'Female', 2),
('gender', 'Other', 'Other', 3),

-- Blood Group
('blood_group', 'A+', 'A+', 1),
('blood_group', 'A-', 'A-', 2),
('blood_group', 'B+', 'B+', 3),
('blood_group', 'B-', 'B-', 4),
('blood_group', 'AB+', 'AB+', 5),
('blood_group', 'AB-', 'AB-', 6),
('blood_group', 'O+', 'O+', 7),
('blood_group', 'O-', 'O-', 8),
('blood_group', 'Other', 'Other', 9),

-- Marital Status
('marital_status', 'Single', 'Single', 1),
('marital_status', 'Married', 'Married', 2),
('marital_status', 'Widowed', 'Widowed', 3),
('marital_status', 'Divorced', 'Divorced', 4),
('marital_status', 'Other', 'Other', 5),

-- Religion
('religion', 'Hindu', 'Hindu', 1),
('religion', 'Christian', 'Christian', 2),
('religion', 'Muslim', 'Muslim', 3),
('religion', 'Sikh', 'Sikh', 4),
('religion', 'Jain', 'Jain', 5),
('religion', 'Buddhist', 'Buddhist', 6),
('religion', 'Other', 'Other', 7),

-- Community
('community', 'OC', 'OC', 1),
('community', 'BC', 'BC', 2),
('community', 'BCM', 'BCM', 3),
('community', 'MBC', 'MBC', 4),
('community', 'SC', 'SC', 5),
('community', 'SCA', 'SCA', 6),
('community', 'ST', 'ST', 7),
('community', 'Other', 'Other', 8),

-- PhD Status
('phd_status', 'Completed', 'Completed', 1),
('phd_status', 'Pursuing', 'Pursuing', 2),
('phd_status', 'Viva Completed', 'Viva Completed', 3),
('phd_status', 'Submitted', 'Submitted', 4),

-- PG Specialization Domains (Department Wise)
('pg_domain_ece', 'Embedded Systems', 'Embedded Systems', 1),
('pg_domain_ece', 'VLSI Design', 'VLSI Design', 2),
('pg_domain_ece', 'Communication Systems', 'Communication Systems', 3),
('pg_domain_ece', 'Signal Processing & AI', 'Signal Processing & AI', 4),
('pg_domain_ece', 'Wireless & Mobile Technologies', 'Wireless & Mobile Technologies', 5),
('pg_domain_ece', 'Robotics & Automation', 'Robotics & Automation', 6),

('pg_domain_cse', 'Computational Intelligence', 'Computational Intelligence', 1),
('pg_domain_cse', 'Blockchain Technology', 'Blockchain Technology', 2),
('pg_domain_cse', 'AR / VR (Augmented & Virtual Reality)', 'AR / VR (Augmented & Virtual Reality)', 3),
('pg_domain_cse', 'Full Stack Web Development', 'Full Stack Web Development', 4),
('pg_domain_cse', 'Business Analytics', 'Business Analytics', 5),
('pg_domain_cse', 'Cyber Security & Digital Forensics', 'Cyber Security & Digital Forensics', 6),
('pg_domain_cse', 'Artificial Intelligence & Machine Learning', 'Artificial Intelligence & Machine Learning', 7),
('pg_domain_cse', 'Data Science & Analytics', 'Data Science & Analytics', 8),
('pg_domain_cse', 'Cloud Computing & DevOps', 'Cloud Computing & DevOps', 9),

('pg_domain_eee', 'Power Electronics & Drives', 'Power Electronics & Drives', 1),
('pg_domain_eee', 'Power Systems Engineering', 'Power Systems Engineering', 2),
('pg_domain_eee', 'Renewable Energy Systems', 'Renewable Energy Systems', 3),
('pg_domain_eee', 'Electric Vehicle (EV) Technology', 'Electric Vehicle (EV) Technology', 4),

('pg_domain_mech', 'CAD / CAM & Product Design', 'CAD / CAM & Product Design', 1),
('pg_domain_mech', 'Thermal Engineering', 'Thermal Engineering', 2),
('pg_domain_mech', 'Mechatronics & Automation', 'Mechatronics & Automation', 3),

('pg_domain_civil', 'Structural Engineering', 'Structural Engineering', 1),
('pg_domain_civil', 'Environmental Engineering', 'Environmental Engineering', 2),
('pg_domain_civil', 'Construction Engineering & Management', 'Construction Engineering & Management', 3);

-- =============================================================================
-- SAMPLE CANDIDATES SEED DATA (Different Categories: OC, BC, BCM, MBC, SC, SCA, ST, EWS)
-- =============================================================================

INSERT IGNORE INTO `users` (`id`, `email`, `password`, `department`) VALUES
(1, 'sample.faculty@gmail.com', 'faculty123', 'CSE'),
(2, 'rajesh.kumar@gmail.com', 'rajesh123', 'CSE'),
(3, 'farooq.ece@gmail.com', 'farooq123', 'ECE'),
(4, 'murugan.mech@gmail.com', 'murugan123', 'MECH'),
(5, 'anandhi.it@gmail.com', 'anandhi123', 'IT'),
(6, 'karuppasamy.eee@gmail.com', 'karuppasamy123', 'EEE'),
(7, 'vijayabalan.aids@gmail.com', 'vijayabalan123', 'AIDS'),
(8, 'meenakshi.civil@gmail.com', 'meenakshi123', 'CIVIL'),
(9, 'vignesh.tech@gmail.com', 'vignesh123', 'CSE');

INSERT IGNORE INTO `personal_info` (
  `user_email`, `applied_date`, `post`, `full_name`, `dob`, `age`, `father_name`, `mother_name`,
  `gender`, `blood_group`, `marital_status`, `spouse_name`, `photo_path`, `nationality`, `religion`,
  `community`, `caste`, `email`, `phone`, `whatsapp`, `aadhaar`, `permanent_address`, `communication_address`,
  `state`, `district`, `pincode`
) VALUES
('sample.faculty@gmail.com', '2026-07-25', 'Associate Professor', 'Dr. S. Ramakrishnan', '1988-05-15', 38, 'Mr. Subramanian', 'Mrs. Lakshmi', 'Male', 'B+', 'Married', 'Mrs. R. Sangeetha', 'college.jpg', 'Indian', 'Hindu', 'BC', 'Pillai', 'sample.faculty@gmail.com', '9876543210', '9876543210', '1234 5678 9012', '12, Main Road, Kovilpatti', '12, Main Road, Kovilpatti', 'Tamil Nadu', 'Thoothukudi', '628501'),
('rajesh.kumar@gmail.com', '2026-08-01', 'Professor', 'Dr. A. Rajesh Kumar', '1981-03-20', 45, 'Mr. Arumugam', 'Mrs. Parvathi', 'Male', 'O+', 'Married', 'Dr. R. Priya', 'college.jpg', 'Indian', 'Hindu', 'OC', 'Iyer', 'rajesh.kumar@gmail.com', '9842156789', '9842156789', '2345 6789 0123', '45, Anna Nagar, Chennai', '45, Anna Nagar, Chennai', 'Tamil Nadu', 'Chennai', '600040'),
('farooq.ece@gmail.com', '2026-08-05', 'Assistant Professor', 'Dr. M. Farooq Ahmed', '1994-08-12', 32, 'Mr. Mohammed Ali', 'Mrs. Fatima', 'Male', 'A+', 'Married', 'Mrs. S. Ayesha', 'college.jpg', 'Indian', 'Muslim', 'BCM', 'Muslim', 'farooq.ece@gmail.com', '9789123456', '9789123456', '3456 7890 1234', '78, Palayamkottai High Rd, Tirunelveli', '78, Palayamkottai High Rd, Tirunelveli', 'Tamil Nadu', 'Tirunelveli', '627002'),
('murugan.mech@gmail.com', '2026-08-08', 'Professor', 'Dr. K. Murugan', '1978-11-05', 48, 'Mr. Kandasamy', 'Mrs. Valliammai', 'Male', 'AB+', 'Married', 'Mrs. M. Sundari', 'college.jpg', 'Indian', 'Hindu', 'MBC', 'Vanniyar', 'murugan.mech@gmail.com', '9443123890', '9443123890', '4567 8901 2345', '102, West Car Street, Madurai', '102, West Car Street, Madurai', 'Tamil Nadu', 'Madurai', '625001'),
('anandhi.it@gmail.com', '2026-08-10', 'Assistant Professor', 'Dr. P. Anandhi', '1996-02-18', 30, 'Mr. Perumal', 'Mrs. Selvi', 'Female', 'O-', 'Single', NULL, 'college.jpg', 'Indian', 'Hindu', 'SC', 'Adi Dravidar', 'anandhi.it@gmail.com', '9629876543', '9629876543', '5678 9012 3456', '15, Gandhi Nagar, Trichy', '15, Gandhi Nagar, Trichy', 'Tamil Nadu', 'Tiruchirappalli', '620001'),
('karuppasamy.eee@gmail.com', '2026-08-12', 'Assistant Professor', 'Dr. R. Karuppasamy', '1992-09-24', 34, 'Mr. Ramasamy', 'Mrs. Mariammal', 'Male', 'B-', 'Married', 'Mrs. K. Chitra', 'college.jpg', 'Indian', 'Hindu', 'SCA', 'Arunthathiyar', 'karuppasamy.eee@gmail.com', '9500123456', '9500123456', '6789 0123 4567', '88, Kamraj Nagar, Salem', '88, Kamraj Nagar, Salem', 'Tamil Nadu', 'Salem', '636001'),
('vijayabalan.aids@gmail.com', '2026-08-15', 'Assistant Professor', 'Dr. T. Vijayabalan', '1995-07-14', 31, 'Mr. Thangavel', 'Mrs. Valli', 'Male', 'A-', 'Single', NULL, 'college.jpg', 'Indian', 'Hindu', 'ST', 'Malayali', 'vijayabalan.aids@gmail.com', '9360987654', '9360987654', '7890 1234 5678', '34, Hill View Road, Yercaud', '34, Hill View Road, Yercaud', 'Tamil Nadu', 'Salem', '636601'),
('meenakshi.civil@gmail.com', '2026-08-18', 'Associate Professor', 'Dr. V. Meenakshi', '1989-10-30', 37, 'Mr. Venkataraman', 'Mrs. Janaki', 'Female', 'O+', 'Married', 'Dr. K. Sundar', 'college.jpg', 'Indian', 'Hindu', 'OC', 'Brahmin', 'meenakshi.civil@gmail.com', '9176543210', '9176543210', '8901 2345 6789', '56, DB Road, Coimbatore', '56, DB Road, Coimbatore', 'Tamil Nadu', 'Coimbatore', '641002'),
('vignesh.tech@gmail.com', '2026-08-20', 'Technical Assistant', 'Er. K. Vignesh', '2000-01-10', 26, 'Mr. Krishnan', 'Mrs. Radhika', 'Male', 'B+', 'Single', NULL, 'college.jpg', 'Indian', 'Hindu', 'BC', 'Nadar', 'vignesh.tech@gmail.com', '9080123456', '9080123456', '9012 3456 7890', '12, South Street, Kovilpatti', '12, South Street, Kovilpatti', 'Tamil Nadu', 'Thoothukudi', '628501');

INSERT IGNORE INTO `user_education` (
  `user_email`, `qual_type`, `is_na`, `percentage`, `year_of_passing`, `medium`, `first_attempt`, `first_class`,
  `degree`, `specialization`, `institution_name`
) VALUES
('sample.faculty@gmail.com', 'tenth', 0, 88.50, 2004, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Central Board of Secondary Education (CBSE), Chennai'),
('sample.faculty@gmail.com', 'twelfth', 0, 91.20, 2006, 'English', 'Yes', 'Yes', 'HSC', 'Computer Science', 'Central Board of Secondary Education (CBSE), Chennai'),
('sample.faculty@gmail.com', 'ug', 0, 88.50, 2010, 'English', 'Yes', 'Yes', 'B.E.', 'Computer Science & Engineering', 'PSG College of Technology, Coimbatore'),
('sample.faculty@gmail.com', 'pg', 0, 91.00, 2012, 'English', 'Yes', 'Yes', 'M.E.', 'Computer Science & Engineering', 'Anna University, Chennai'),
('sample.faculty@gmail.com', 'phd', 0, 95.00, 2019, 'English', 'Yes', 'Yes', 'Ph.D.', 'Deep Learning & AI', 'Indian Institute of Technology Madras (IIT Madras)'),

('rajesh.kumar@gmail.com', 'tenth', 0, 94.00, 1997, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Central Board of Secondary Education (CBSE), Chennai'),
('rajesh.kumar@gmail.com', 'twelfth', 0, 95.50, 1999, 'English', 'Yes', 'Yes', 'HSC', 'Mathematics & Computer', 'Central Board of Secondary Education (CBSE), Chennai'),
('rajesh.kumar@gmail.com', 'ug', 0, 94.00, 2003, 'English', 'Yes', 'Yes', 'B.Tech', 'Computer Science', 'National Institute of Technology Tiruchirappalli (NIT Trichy)'),
('rajesh.kumar@gmail.com', 'pg', 0, 96.00, 2005, 'English', 'Yes', 'Yes', 'M.Tech', 'Computer Science & Engg', 'Indian Institute of Technology Madras (IIT Madras)'),
('rajesh.kumar@gmail.com', 'phd', 0, 98.00, 2011, 'English', 'Yes', 'Yes', 'Ph.D.', 'High Performance Computing', 'Indian Institute of Technology Madras (IIT Madras)'),

('farooq.ece@gmail.com', 'tenth', 0, 85.00, 2010, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('farooq.ece@gmail.com', 'twelfth', 0, 87.40, 2012, 'English', 'Yes', 'Yes', 'HSC', 'Biology & Maths', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('farooq.ece@gmail.com', 'ug', 0, 82.00, 2016, 'English', 'Yes', 'Yes', 'B.E.', 'Electronics & Communication', 'National Engineering College, Kovilpatti'),
('farooq.ece@gmail.com', 'pg', 0, 86.00, 2018, 'English', 'Yes', 'Yes', 'M.E.', 'VLSI Design & Embedded Systems', 'SRM Institute of Science and Technology, Chennai'),
('farooq.ece@gmail.com', 'phd', 0, 88.00, 2022, 'English', 'Yes', 'Yes', 'Ph.D.', 'Low Power VLSI Architecture', 'Anna University, Chennai'),

('murugan.mech@gmail.com', 'tenth', 0, 82.00, 1994, 'Tamil', 'Yes', 'Yes', 'SSLC', 'General', 'Government Higher Secondary School, Kovilpatti'),
('murugan.mech@gmail.com', 'twelfth', 0, 84.00, 1996, 'English', 'Yes', 'Yes', 'HSC', 'Maths & Physics', 'Government Higher Secondary School, Kovilpatti'),
('murugan.mech@gmail.com', 'ug', 0, 81.00, 2000, 'English', 'Yes', 'Yes', 'B.E.', 'Mechanical Engineering', 'Government College of Engineering, Tirunelveli'),
('murugan.mech@gmail.com', 'pg', 0, 85.00, 2003, 'English', 'Yes', 'Yes', 'M.E.', 'Thermal Engineering', 'Coimbatore Institute of Technology, Coimbatore'),
('murugan.mech@gmail.com', 'phd', 0, 89.00, 2010, 'English', 'Yes', 'Yes', 'Ph.D.', 'Heat Transfer & Fluid Dynamics', 'Anna University, Chennai'),

('anandhi.it@gmail.com', 'tenth', 0, 91.00, 2012, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Central Board of Secondary Education (CBSE), Chennai'),
('anandhi.it@gmail.com', 'twelfth', 0, 92.50, 2014, 'English', 'Yes', 'Yes', 'HSC', 'Computer Science', 'Central Board of Secondary Education (CBSE), Chennai'),
('anandhi.it@gmail.com', 'ug', 0, 89.00, 2018, 'English', 'Yes', 'Yes', 'B.Tech', 'Information Technology', 'Anna University, Chennai'),
('anandhi.it@gmail.com', 'pg', 0, 90.00, 2020, 'English', 'Yes', 'Yes', 'M.Tech', 'Information Technology', 'Anna University, Chennai'),
('anandhi.it@gmail.com', 'phd', 0, 93.00, 2024, 'English', 'Yes', 'Yes', 'Ph.D.', 'Cyber Security & Blockchain', 'National Institute of Technology Tiruchirappalli (NIT Trichy)'),

('karuppasamy.eee@gmail.com', 'tenth', 0, 83.50, 2008, 'Tamil', 'Yes', 'Yes', 'SSLC', 'General', 'Government Higher Secondary School, Kovilpatti'),
('karuppasamy.eee@gmail.com', 'twelfth', 0, 86.00, 2010, 'English', 'Yes', 'Yes', 'HSC', 'Maths & Electronics', 'Government Higher Secondary School, Kovilpatti'),
('karuppasamy.eee@gmail.com', 'ug', 0, 78.00, 2014, 'English', 'Yes', 'Yes', 'B.E.', 'Electrical & Electronics', 'Government College of Engineering, Tirunelveli'),
('karuppasamy.eee@gmail.com', 'pg', 0, 83.00, 2016, 'English', 'Yes', 'Yes', 'M.E.', 'Power Electronics & Drives', 'PSG College of Technology, Coimbatore'),
('karuppasamy.eee@gmail.com', 'phd', 0, 86.00, 2021, 'English', 'Yes', 'Yes', 'Ph.D.', 'Smart Grid & Renewable Integration', 'Manonmaniam Sundaranar University, Tirunelveli'),

('vijayabalan.aids@gmail.com', 'tenth', 0, 79.00, 2011, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('vijayabalan.aids@gmail.com', 'twelfth', 0, 81.50, 2013, 'English', 'Yes', 'Yes', 'HSC', 'Computer Science', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('vijayabalan.aids@gmail.com', 'ug', 0, 76.00, 2017, 'English', 'Yes', 'Yes', 'B.E.', 'Computer Science & Engineering', 'Kamaraj College of Engineering & Technology, Virudhunagar'),
('vijayabalan.aids@gmail.com', 'pg', 0, 82.00, 2019, 'English', 'Yes', 'Yes', 'M.Tech', 'Data Science & Analytics', 'SASTRA Deemed University, Thanjavur'),
('vijayabalan.aids@gmail.com', 'phd', 0, 80.00, NULL, 'English', 'Yes', 'Yes', 'Ph.D.', 'Big Data & Cloud Analytics', 'Anna University, Chennai'),

('meenakshi.civil@gmail.com', 'tenth', 0, 92.00, 2005, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Central Board of Secondary Education (CBSE), Chennai'),
('meenakshi.civil@gmail.com', 'twelfth', 0, 93.50, 2007, 'English', 'Yes', 'Yes', 'HSC', 'Maths & Physics', 'Central Board of Secondary Education (CBSE), Chennai'),
('meenakshi.civil@gmail.com', 'ug', 0, 87.00, 2011, 'English', 'Yes', 'Yes', 'B.E.', 'Civil Engineering', 'Thiagarajar College of Engineering, Madurai'),
('meenakshi.civil@gmail.com', 'pg', 0, 89.00, 2013, 'English', 'Yes', 'Yes', 'M.E.', 'Structural Engineering', 'Anna University, Chennai'),
('meenakshi.civil@gmail.com', 'phd', 0, 92.00, 2017, 'English', 'Yes', 'Yes', 'Ph.D.', 'Earthquake Resistant Structures', 'Indian Institute of Technology Madras (IIT Madras)'),

('vignesh.tech@gmail.com', 'tenth', 0, 86.00, 2016, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('vignesh.tech@gmail.com', 'twelfth', 0, 88.00, 2018, 'English', 'Yes', 'Yes', 'HSC', 'Computer Science', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('vignesh.tech@gmail.com', 'ug', 0, 78.00, 2022, 'English', 'Yes', 'Yes', 'B.E.', 'Computer Science & Engineering', 'National Engineering College, Kovilpatti');

INSERT IGNORE INTO `user_experience` (
  `user_email`, `is_fresher`, `exp_type`, `org_name`, `from_date`, `to_date`, `total_duration`, `designation`, `salary`
) VALUES
('sample.faculty@gmail.com', 0, 'Teaching', 'PSG College of Technology, Coimbatore', '2019-06-01', '2026-07-01', '7 yrs', 'Assistant Professor', 75000.00),
('rajesh.kumar@gmail.com', 0, 'Teaching & Research', 'Thiagarajar College of Engineering, Madurai', '2011-07-01', '2025-07-01', '14 yrs', 'Professor', 140000.00),
('farooq.ece@gmail.com', 0, 'Teaching', 'Mepco Schlenk Engineering College, Sivakasi', '2022-06-01', '2026-06-01', '4 yrs', 'Assistant Professor', 62000.00),
('murugan.mech@gmail.com', 0, 'Teaching', 'Alagappa University, Karaikudi', '2010-06-01', '2026-06-01', '16 yrs', 'Professor', 155000.00),
('anandhi.it@gmail.com', 0, 'Teaching', 'SRM Institute of Science and Technology, Chennai', '2024-06-01', '2026-06-01', '2 yrs', 'Assistant Professor', 58000.00),
('karuppasamy.eee@gmail.com', 0, 'Teaching', 'Francis Xavier Engineering College, Tirunelveli', '2021-06-01', '2026-06-01', '5 yrs', 'Assistant Professor', 65000.00),
('vijayabalan.aids@gmail.com', 0, 'Teaching', 'Kamaraj College of Engineering & Technology, Virudhunagar', '2023-06-01', '2026-06-01', '3 yrs', 'Assistant Professor', 52000.00),
('meenakshi.civil@gmail.com', 0, 'Teaching', 'Vellore Institute of Technology (VIT), Vellore', '2017-06-01', '2025-06-01', '8 yrs', 'Associate Professor', 95000.00),
('vignesh.tech@gmail.com', 1, NULL, NULL, NULL, NULL, '0 yrs', NULL, NULL);

INSERT IGNORE INTO `user_certifications` (
  `user_email`, `title`, `score`, `category`, `organization`, `year`
) VALUES
('sample.faculty@gmail.com', 'Deep Learning & Neural Networks', '85%', 'NPTEL', 'IIT Madras / NPTEL', '2021'),
('sample.faculty@gmail.com', 'Cloud Computing & Distributed Systems', '90%', 'NPTEL', 'IIT Kharagpur / NPTEL', '2022'),
('rajesh.kumar@gmail.com', 'Advanced AI Architectures', '94%', 'NPTEL', 'IIT Madras', '2020'),
('rajesh.kumar@gmail.com', 'High Performance Parallel Computing', '92%', 'NPTEL', 'IIT Kanpur', '2022'),
('farooq.ece@gmail.com', 'VLSI System Testing & Verification', '82%', 'NPTEL', 'IIT Kharagpur', '2021'),
('murugan.mech@gmail.com', 'Solar & Thermal Renewable Energy Systems', '88%', 'NPTEL', 'IIT Roorkee', '2019'),
('anandhi.it@gmail.com', 'Blockchain Technology & Cyber Security', '89%', 'NPTEL', 'IIT Bombay', '2023'),
('anandhi.it@gmail.com', 'Applied Machine Learning', '91%', 'NPTEL', 'IIT Madras', '2024'),
('karuppasamy.eee@gmail.com', 'Electric Vehicles & Smart Grid Integration', '84%', 'NPTEL', 'IIT Delhi', '2022'),
('vijayabalan.aids@gmail.com', 'Data Science & Machine Learning Foundations', '80%', 'NPTEL', 'IIT Madras', '2023'),
('meenakshi.civil@gmail.com', 'Structural Dynamics & Earthquake Engineering', '90%', 'NPTEL', 'IIT Madras', '2021'),
('vignesh.tech@gmail.com', 'Python Data Structures & Web Development', '78%', 'NPTEL', 'IIT Kanpur', '2023');

INSERT IGNORE INTO `user_phd_details` (
  `user_email`, `university`, `title`, `guide_name`, `guide_college`, `status`,
  `year_of_registration`, `year_of_completion`, `no_of_publications_during_phd`,
  `no_of_publications_post_phd`, `no_of_awards`, `no_of_funded_projects`,
  `no_of_funded_consultancy`, `post_phd_experience`
) VALUES
('sample.faculty@gmail.com', 'IIT Madras', 'Deep Neural Networks for Medical Image Classification', 'Dr. K. Swaminathan', 'IIT Madras', 'Completed', 2014, 2019, 4, 8, 2, 1, 1, '7 years post-PhD teaching & research experience'),
('rajesh.kumar@gmail.com', 'IIT Madras', 'Optimized Parallel Processing in Distributed Heterogeneous Clusters', 'Dr. V. Kamakoti', 'IIT Madras', 'Completed', 2007, 2011, 6, 15, 4, 3, 2, '14 years post-PhD senior teaching & consultancy experience'),
('farooq.ece@gmail.com', 'Anna University', 'Low-Power Sub-Threshold Circuit Design for Embedded IoT', 'Dr. S. Sundararajan', 'Anna Univ', 'Completed', 2018, 2022, 3, 3, 1, 1, 0, '4 years post-PhD teaching experience'),
('murugan.mech@gmail.com', 'Anna University', 'Experimental Investigation of Phase Change Materials in Solar Thermal Collectors', 'Dr. P. Ganesan', 'Anna Univ', 'Completed', 2005, 2010, 5, 12, 3, 2, 1, '16 years post-PhD academic experience'),
('anandhi.it@gmail.com', 'NIT Trichy', 'Privacy-Preserving Decentralized Smart Contracts for Healthcare', 'Dr. N. Ramaswamy', 'NIT Trichy', 'Completed', 2020, 2024, 4, 2, 2, 1, 0, '2 years post-PhD research & teaching experience'),
('karuppasamy.eee@gmail.com', 'Manonmaniam Sundaranar University', 'Adaptive Control Algorithms for Microgrid Power Quality Enhancement', 'Dr. M. Shanmugam', 'MS Univ', 'Completed', 2017, 2021, 3, 4, 1, 0, 1, '5 years post-PhD teaching experience'),
('vijayabalan.aids@gmail.com', 'Anna University', 'Real-Time Streaming Big Data Analytics in Distributed Cloud Environments', 'Dr. R. Senthamilselvan', 'Anna Univ', 'Pursuing', 2022, NULL, 2, 0, 0, 0, 0, 'Currently pursuing Ph.D.'),
('meenakshi.civil@gmail.com', 'IIT Madras', 'Seismic Performance of High-Rise RC Framed Buildings with Viscous Dampers', 'Dr. A. Meher Prasad', 'IIT Madras', 'Completed', 2013, 2017, 4, 6, 2, 1, 1, '8 years post-PhD consultancy and teaching experience');


