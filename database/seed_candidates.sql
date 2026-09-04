-- Sample Candidate Data for Testing Different Categories in NEC Staff Recruitment Portal
USE `necfacultyrecruitment`;

-- Clear existing sample test data safely if needed (optional)
-- DELETE FROM users WHERE email LIKE '%@nec.edu.in' OR email LIKE '%@gmail.com';

-- =============================================================================
-- 1. USERS SEED DATA
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

-- =============================================================================
-- 2. PERSONAL INFORMATION SEED DATA (Categorized by Community, Dept, Post)
-- =============================================================================
INSERT IGNORE INTO `personal_info` (
  `user_email`, `applied_date`, `post`, `full_name`, `dob`, `age`, `father_name`, `mother_name`,
  `gender`, `blood_group`, `marital_status`, `spouse_name`, `photo_path`, `nationality`, `religion`,
  `community`, `caste`, `email`, `phone`, `whatsapp`, `aadhaar`, `permanent_address`, `communication_address`,
  `state`, `district`, `pincode`
) VALUES
-- Candidate 1: BC Community, CSE Dept, Associate Professor
('sample.faculty@gmail.com', '2026-07-25', 'Associate Professor', 'Dr. S. Ramakrishnan', '1988-05-15', 38, 'Mr. Subramanian', 'Mrs. Lakshmi',
 'Male', 'B+', 'Married', 'Mrs. R. Sangeetha', 'college.jpg', 'Indian', 'Hindu',
 'BC', 'Pillai', 'sample.faculty@gmail.com', '9876543210', '9876543210', '1234 5678 9012', '12, Main Road, Kovilpatti', '12, Main Road, Kovilpatti',
 'Tamil Nadu', 'Thoothukudi', '628501'),

-- Candidate 2: OC Community, CSE Dept, Professor
('rajesh.kumar@gmail.com', '2026-08-01', 'Professor', 'Dr. A. Rajesh Kumar', '1981-03-20', 45, 'Mr. Arumugam', 'Mrs. Parvathi',
 'Male', 'O+', 'Married', 'Dr. R. Priya', 'college.jpg', 'Indian', 'Hindu',
 'OC', 'Iyer', 'rajesh.kumar@gmail.com', '9842156789', '9842156789', '2345 6789 0123', '45, Anna Nagar, Chennai', '45, Anna Nagar, Chennai',
 'Tamil Nadu', 'Chennai', '600040'),

-- Candidate 3: BCM Community, ECE Dept, Assistant Professor
('farooq.ece@gmail.com', '2026-08-05', 'Assistant Professor', 'Dr. M. Farooq Ahmed', '1994-08-12', 32, 'Mr. Mohammed Ali', 'Mrs. Fatima',
 'Male', 'A+', 'Married', 'Mrs. S. Ayesha', 'college.jpg', 'Indian', 'Muslim',
 'BCM', 'Muslim', 'farooq.ece@gmail.com', '9789123456', '9789123456', '3456 7890 1234', '78, Palayamkottai High Rd, Tirunelveli', '78, Palayamkottai High Rd, Tirunelveli',
 'Tamil Nadu', 'Tirunelveli', '627002'),

-- Candidate 4: MBC Community, MECH Dept, Professor
('murugan.mech@gmail.com', '2026-08-08', 'Professor', 'Dr. K. Murugan', '1978-11-05', 48, 'Mr. Kandasamy', 'Mrs. Valliammai',
 'Male', 'AB+', 'Married', 'Mrs. M. Sundari', 'college.jpg', 'Indian', 'Hindu',
 'MBC', 'Vanniyar', 'murugan.mech@gmail.com', '9443123890', '9443123890', '4567 8901 2345', '102, West Car Street, Madurai', '102, West Car Street, Madurai',
 'Tamil Nadu', 'Madurai', '625001'),

-- Candidate 5: SC Community, IT Dept, Assistant Professor
('anandhi.it@gmail.com', '2026-08-10', 'Assistant Professor', 'Dr. P. Anandhi', '1996-02-18', 30, 'Mr. Perumal', 'Mrs. Selvi',
 'Female', 'O-', 'Single', NULL, 'college.jpg', 'Indian', 'Hindu',
 'SC', 'Adi Dravidar', 'anandhi.it@gmail.com', '9629876543', '9629876543', '5678 9012 3456', '15, Gandhi Nagar, Trichy', '15, Gandhi Nagar, Trichy',
 'Tamil Nadu', 'Tiruchirappalli', '620001'),

-- Candidate 6: SCA Community, EEE Dept, Assistant Professor
('karuppasamy.eee@gmail.com', '2026-08-12', 'Assistant Professor', 'Dr. R. Karuppasamy', '1992-09-24', 34, 'Mr. Ramasamy', 'Mrs. Mariammal',
 'Male', 'B-', 'Married', 'Mrs. K. Chitra', 'college.jpg', 'Indian', 'Hindu',
 'SCA', 'Arunthathiyar', 'karuppasamy.eee@gmail.com', '9500123456', '9500123456', '6789 0123 4567', '88, Kamraj Nagar, Salem', '88, Kamraj Nagar, Salem',
 'Tamil Nadu', 'Salem', '636001'),

-- Candidate 7: ST Community, AIDS Dept, Assistant Professor
('vijayabalan.aids@gmail.com', '2026-08-15', 'Assistant Professor', 'Dr. T. Vijayabalan', '1995-07-14', 31, 'Mr. Thangavel', 'Mrs. Valli',
 'Male', 'A-', 'Single', NULL, 'college.jpg', 'Indian', 'Hindu',
 'ST', 'Malayali', 'vijayabalan.aids@gmail.com', '9360987654', '9360987654', '7890 1234 5678', '34, Hill View Road, Yercaud', '34, Hill View Road, Yercaud',
 'Tamil Nadu', 'Salem', '636601'),

-- Candidate 8: EWS Community, CIVIL Dept, Associate Professor
('meenakshi.civil@gmail.com', '2026-08-18', 'Associate Professor', 'Dr. V. Meenakshi', '1989-10-30', 37, 'Mr. Venkataraman', 'Mrs. Janaki',
 'Female', 'O+', 'Married', 'Dr. K. Sundar', 'college.jpg', 'Indian', 'Hindu',
 'OC', 'Brahmin', 'meenakshi.civil@gmail.com', '9176543210', '9176543210', '8901 2345 6789', '56, DB Road, Coimbatore', '56, DB Road, Coimbatore',
 'Tamil Nadu', 'Coimbatore', '641002'),

-- Candidate 9: BC Community, CSE Dept, Technical Assistant
('vignesh.tech@gmail.com', '2026-08-20', 'Technical Assistant', 'Er. K. Vignesh', '2000-01-10', 26, 'Mr. Krishnan', 'Mrs. Radhika',
 'Male', 'B+', 'Single', NULL, 'college.jpg', 'Indian', 'Hindu',
 'BC', 'Nadar', 'vignesh.tech@gmail.com', '9080123456', '9080123456', '9012 3456 7890', '12, South Street, Kovilpatti', '12, South Street, Kovilpatti',
 'Tamil Nadu', 'Thoothukudi', '628501');

-- =============================================================================
-- 3. EDUCATION INFORMATION SEED DATA
-- =============================================================================
INSERT IGNORE INTO `user_education` (
  `user_email`, `qual_type`, `is_na`, `percentage`, `year_of_passing`, `medium`, `first_attempt`, `first_class`,
  `degree`, `specialization`, `institution_name`
) VALUES
-- Candidate 1: Dr. S. Ramakrishnan
('sample.faculty@gmail.com', 'tenth', 0, 88.50, 2004, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Central Board of Secondary Education (CBSE), Chennai'),
('sample.faculty@gmail.com', 'twelfth', 0, 91.20, 2006, 'English', 'Yes', 'Yes', 'HSC', 'Computer Science', 'Central Board of Secondary Education (CBSE), Chennai'),
('sample.faculty@gmail.com', 'ug', 0, 88.50, 2010, 'English', 'Yes', 'Yes', 'B.E.', 'Computer Science & Engineering', 'PSG College of Technology, Coimbatore'),
('sample.faculty@gmail.com', 'pg', 0, 91.00, 2012, 'English', 'Yes', 'Yes', 'M.E.', 'Computer Science & Engineering', 'Anna University, Chennai'),
('sample.faculty@gmail.com', 'phd', 0, 95.00, 2019, 'English', 'Yes', 'Yes', 'Ph.D.', 'Deep Learning & AI', 'Indian Institute of Technology Madras (IIT Madras)'),

-- Candidate 2: Dr. A. Rajesh Kumar
('rajesh.kumar@gmail.com', 'tenth', 0, 94.00, 1997, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Central Board of Secondary Education (CBSE), Chennai'),
('rajesh.kumar@gmail.com', 'twelfth', 0, 95.50, 1999, 'English', 'Yes', 'Yes', 'HSC', 'Mathematics & Computer', 'Central Board of Secondary Education (CBSE), Chennai'),
('rajesh.kumar@gmail.com', 'ug', 0, 94.00, 2003, 'English', 'Yes', 'Yes', 'B.Tech', 'Computer Science', 'National Institute of Technology Tiruchirappalli (NIT Trichy)'),
('rajesh.kumar@gmail.com', 'pg', 0, 96.00, 2005, 'English', 'Yes', 'Yes', 'M.Tech', 'Computer Science & Engg', 'Indian Institute of Technology Madras (IIT Madras)'),
('rajesh.kumar@gmail.com', 'phd', 0, 98.00, 2011, 'English', 'Yes', 'Yes', 'Ph.D.', 'High Performance Computing', 'Indian Institute of Technology Madras (IIT Madras)'),

-- Candidate 3: Dr. M. Farooq Ahmed
('farooq.ece@gmail.com', 'tenth', 0, 85.00, 2010, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('farooq.ece@gmail.com', 'twelfth', 0, 87.40, 2012, 'English', 'Yes', 'Yes', 'HSC', 'Biology & Maths', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('farooq.ece@gmail.com', 'ug', 0, 82.00, 2016, 'English', 'Yes', 'Yes', 'B.E.', 'Electronics & Communication', 'National Engineering College, Kovilpatti'),
('farooq.ece@gmail.com', 'pg', 0, 86.00, 2018, 'English', 'Yes', 'Yes', 'M.E.', 'VLSI Design & Embedded Systems', 'SRM Institute of Science and Technology, Chennai'),
('farooq.ece@gmail.com', 'phd', 0, 88.00, 2022, 'English', 'Yes', 'Yes', 'Ph.D.', 'Low Power VLSI Architecture', 'Anna University, Chennai'),

-- Candidate 4: Dr. K. Murugan
('murugan.mech@gmail.com', 'tenth', 0, 82.00, 1994, 'Tamil', 'Yes', 'Yes', 'SSLC', 'General', 'Government Higher Secondary School, Kovilpatti'),
('murugan.mech@gmail.com', 'twelfth', 0, 84.00, 1996, 'English', 'Yes', 'Yes', 'HSC', 'Maths & Physics', 'Government Higher Secondary School, Kovilpatti'),
('murugan.mech@gmail.com', 'ug', 0, 81.00, 2000, 'English', 'Yes', 'Yes', 'B.E.', 'Mechanical Engineering', 'Government College of Engineering, Tirunelveli'),
('murugan.mech@gmail.com', 'pg', 0, 85.00, 2003, 'English', 'Yes', 'Yes', 'M.E.', 'Thermal Engineering', 'Coimbatore Institute of Technology, Coimbatore'),
('murugan.mech@gmail.com', 'phd', 0, 89.00, 2010, 'English', 'Yes', 'Yes', 'Ph.D.', 'Heat Transfer & Fluid Dynamics', 'Anna University, Chennai'),

-- Candidate 5: Dr. P. Anandhi
('anandhi.it@gmail.com', 'tenth', 0, 91.00, 2012, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Central Board of Secondary Education (CBSE), Chennai'),
('anandhi.it@gmail.com', 'twelfth', 0, 92.50, 2014, 'English', 'Yes', 'Yes', 'HSC', 'Computer Science', 'Central Board of Secondary Education (CBSE), Chennai'),
('anandhi.it@gmail.com', 'ug', 0, 89.00, 2018, 'English', 'Yes', 'Yes', 'B.Tech', 'Information Technology', 'Anna University, Chennai'),
('anandhi.it@gmail.com', 'pg', 0, 90.00, 2020, 'English', 'Yes', 'Yes', 'M.Tech', 'Information Technology', 'Anna University, Chennai'),
('anandhi.it@gmail.com', 'phd', 0, 93.00, 2024, 'English', 'Yes', 'Yes', 'Ph.D.', 'Cyber Security & Blockchain', 'National Institute of Technology Tiruchirappalli (NIT Trichy)'),

-- Candidate 6: Dr. R. Karuppasamy
('karuppasamy.eee@gmail.com', 'tenth', 0, 83.50, 2008, 'Tamil', 'Yes', 'Yes', 'SSLC', 'General', 'Government Higher Secondary School, Kovilpatti'),
('karuppasamy.eee@gmail.com', 'twelfth', 0, 86.00, 2010, 'English', 'Yes', 'Yes', 'HSC', 'Maths & Electronics', 'Government Higher Secondary School, Kovilpatti'),
('karuppasamy.eee@gmail.com', 'ug', 0, 78.00, 2014, 'English', 'Yes', 'Yes', 'B.E.', 'Electrical & Electronics', 'Government College of Engineering, Tirunelveli'),
('karuppasamy.eee@gmail.com', 'pg', 0, 83.00, 2016, 'English', 'Yes', 'Yes', 'M.E.', 'Power Electronics & Drives', 'PSG College of Technology, Coimbatore'),
('karuppasamy.eee@gmail.com', 'phd', 0, 86.00, 2021, 'English', 'Yes', 'Yes', 'Ph.D.', 'Smart Grid & Renewable Integration', 'Manonmaniam Sundaranar University, Tirunelveli'),

-- Candidate 7: Dr. T. Vijayabalan
('vijayabalan.aids@gmail.com', 'tenth', 0, 79.00, 2011, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('vijayabalan.aids@gmail.com', 'twelfth', 0, 81.50, 2013, 'English', 'Yes', 'Yes', 'HSC', 'Computer Science', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('vijayabalan.aids@gmail.com', 'ug', 0, 76.00, 2017, 'English', 'Yes', 'Yes', 'B.E.', 'Computer Science & Engineering', 'Kamaraj College of Engineering & Technology, Virudhunagar'),
('vijayabalan.aids@gmail.com', 'pg', 0, 82.00, 2019, 'English', 'Yes', 'Yes', 'M.Tech', 'Data Science & Analytics', 'SASTRA Deemed University, Thanjavur'),
('vijayabalan.aids@gmail.com', 'phd', 0, 80.00, NULL, 'English', 'Yes', 'Yes', 'Ph.D.', 'Big Data & Cloud Analytics', 'Anna University, Chennai'),

-- Candidate 8: Dr. V. Meenakshi
('meenakshi.civil@gmail.com', 'tenth', 0, 92.00, 2005, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Central Board of Secondary Education (CBSE), Chennai'),
('meenakshi.civil@gmail.com', 'twelfth', 0, 93.50, 2007, 'English', 'Yes', 'Yes', 'HSC', 'Maths & Physics', 'Central Board of Secondary Education (CBSE), Chennai'),
('meenakshi.civil@gmail.com', 'ug', 0, 87.00, 2011, 'English', 'Yes', 'Yes', 'B.E.', 'Civil Engineering', 'Thiagarajar College of Engineering, Madurai'),
('meenakshi.civil@gmail.com', 'pg', 0, 89.00, 2013, 'English', 'Yes', 'Yes', 'M.E.', 'Structural Engineering', 'Anna University, Chennai'),
('meenakshi.civil@gmail.com', 'phd', 0, 92.00, 2017, 'English', 'Yes', 'Yes', 'Ph.D.', 'Earthquake Resistant Structures', 'Indian Institute of Technology Madras (IIT Madras)'),

-- Candidate 9: Er. K. Vignesh
('vignesh.tech@gmail.com', 'tenth', 0, 86.00, 2016, 'English', 'Yes', 'Yes', 'SSLC', 'General', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('vignesh.tech@gmail.com', 'twelfth', 0, 88.00, 2018, 'English', 'Yes', 'Yes', 'HSC', 'Computer Science', 'Tamil Nadu State Board Higher Secondary, Tirunelveli'),
('vignesh.tech@gmail.com', 'ug', 0, 78.00, 2022, 'English', 'Yes', 'Yes', 'B.E.', 'Computer Science & Engineering', 'National Engineering College, Kovilpatti');

-- =============================================================================
-- 4. WORK EXPERIENCE SEED DATA
-- =============================================================================
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

-- =============================================================================
-- 5. CERTIFICATIONS & NPTEL SEED DATA
-- =============================================================================
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

-- =============================================================================
-- 6. USER PHD DETAILS SEED DATA
-- =============================================================================
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

