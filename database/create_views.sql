ALTER TABLE tbl_Users MODIFY dte_Created_Date DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tbl_Personal_Info MODIFY dte_Created_Date DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tbl_User_Education MODIFY dte_Created_Date DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tbl_User_Experience MODIFY dte_Created_Date DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tbl_User_Certifications MODIFY dte_Created_Date DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tbl_User_Phd_Details MODIFY dte_Created_Date DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tbl_Institution MODIFY dte_Created_Date DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tbl_Dropdown_Options MODIFY dte_Created_Date DATETIME DEFAULT CURRENT_TIMESTAMP;

DROP TABLE IF EXISTS users, personal_info, user_education, user_experience, user_certifications, user_phd_details, institutions, school_village_names, dropdown_options;

-- Recreate Views
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
    txt_Cert_Path AS cert_path, dte_Created_Date AS created_at
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

CREATE OR REPLACE VIEW institutions AS
SELECT int_Institution_Id AS id, txt_Institution_Name AS name, txt_Category AS category, txt_Affiliated_University AS affiliated_university,
txt_District_Name AS district, txt_State_Name AS state, txt_Active AS active, dte_Created_Date AS created_at
FROM tbl_Institution;

CREATE OR REPLACE VIEW school_village_names AS
SELECT int_School_Id AS id, txt_School_Name AS school_name, txt_Village_Name AS village_name, txt_Full_Display AS full_display
FROM tbl_School_Village_Names;

CREATE OR REPLACE VIEW dropdown_options AS
SELECT int_Option_Id AS id, txt_Category AS category, txt_Option_Value AS option_value, txt_Option_Label AS option_label, 
txt_Active AS is_active, int_Display_Order AS display_order, dte_Created_Date AS created_at
FROM tbl_Dropdown_Options;
