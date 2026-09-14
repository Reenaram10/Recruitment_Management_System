-- Auto-generated Schema from ims_staff_db_schema.csv

CREATE DATABASE IF NOT EXISTS `necfacultyrecruitment`;
USE `necfacultyrecruitment`;

CREATE TABLE IF NOT EXISTS `tbl_Users` (
  `int_User_Id` int AUTO_INCREMENT NOT NULL,
  `txt_User_Email` varchar(255) NOT NULL,
  `txt_User_Password` varchar(255) NOT NULL,
  `txt_Department_Name` varchar(100) NOT NULL,
  `dte_Created_Date` datetime NOT NULL,
  PRIMARY KEY (`int_User_Id`),
  UNIQUE KEY `uk_txt_User_Email` (`txt_User_Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tbl_Personal_Info` (
  `int_Personal_Id` int AUTO_INCREMENT NOT NULL,
  `txt_User_Email` varchar(255) NOT NULL,
  `dte_Applied_Date` datetime DEFAULT NULL,
  `txt_Post_Applied` varchar(100) DEFAULT NULL,
  `txt_Post_Other` varchar(100) DEFAULT NULL,
  `txt_Full_Name` varchar(255) DEFAULT NULL,
  `dte_Dob` datetime DEFAULT NULL,
  `int_Age` int DEFAULT NULL,
  `txt_Father_Name` varchar(255) DEFAULT NULL,
  `txt_Mother_Name` varchar(255) DEFAULT NULL,
  `txt_Gender` varchar(50) DEFAULT NULL,
  `txt_Gender_Other` varchar(100) DEFAULT NULL,
  `txt_Blood_Group` varchar(20) DEFAULT NULL,
  `txt_Blood_Group_Other` varchar(50) DEFAULT NULL,
  `txt_Marital_Status` varchar(50) DEFAULT NULL,
  `txt_Spouse_Name` varchar(255) DEFAULT NULL,
  `txt_Marital_Status_Other` varchar(100) DEFAULT NULL,
  `txt_Photo_Path` varchar(255) DEFAULT NULL,
  `txt_Nationality` varchar(100) DEFAULT NULL,
  `txt_Religion` varchar(100) DEFAULT NULL,
  `txt_Religion_Other` varchar(100) DEFAULT NULL,
  `txt_Community` varchar(100) DEFAULT NULL,
  `txt_Community_Other` varchar(100) DEFAULT NULL,
  `txt_Caste` varchar(100) DEFAULT NULL,
  `txt_Contact_Email` varchar(255) DEFAULT NULL,
  `txt_Alt_Email` varchar(255) DEFAULT NULL,
  `txt_Phone` varchar(20) DEFAULT NULL,
  `txt_Whatsapp` varchar(20) DEFAULT NULL,
  `txt_Emergency_Name` varchar(255) DEFAULT NULL,
  `txt_Emergency_Relation` varchar(100) DEFAULT NULL,
  `txt_Emergency_Phone` varchar(20) DEFAULT NULL,
  `txt_Aadhaar_No` varchar(20) DEFAULT NULL,
  `txt_Permanent_Address` varchar(500) DEFAULT NULL,
  `txt_Communication_Address` varchar(500) DEFAULT NULL,
  `txt_State_Name` varchar(100) DEFAULT NULL,
  `txt_District_Name` varchar(100) DEFAULT NULL,
  `txt_Pincode` varchar(10) DEFAULT NULL,
  `txt_Tenth_Doc_Path` varchar(255) DEFAULT NULL,
  `txt_Twelfth_Doc_Path` varchar(255) DEFAULT NULL,
  `txt_Ug_Doc_Path` varchar(255) DEFAULT NULL,
  `txt_Pg_Doc_Path` varchar(255) DEFAULT NULL,
  `txt_Mphil_Doc_Path` varchar(255) DEFAULT NULL,
  `txt_Phd_Doc_Path` varchar(255) DEFAULT NULL,
  `txt_Id_Proof_Doc_Path` varchar(255) DEFAULT NULL,
  `txt_Ug_Gate_Score` varchar(50) DEFAULT NULL,
  `txt_Ug_Net_Slet_Score` varchar(50) DEFAULT NULL,
  `txt_Pg_Gate_Score` varchar(50) DEFAULT NULL,
  `txt_Pg_Net_Slet_Score` varchar(50) DEFAULT NULL,
  `dte_Created_Date` datetime NOT NULL,
  `dte_Updated_Date` datetime DEFAULT NULL,
  PRIMARY KEY (`int_Personal_Id`),
  FOREIGN KEY (`txt_User_Email`) REFERENCES `tbl_Users`(`txt_User_Email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tbl_User_Education` (
  `int_Education_Id` int AUTO_INCREMENT NOT NULL,
  `txt_User_Email` varchar(255) NOT NULL,
  `txt_Qual_Type` varchar(20) NOT NULL,
  `txt_Is_Na` char(1) NOT NULL,
  `dec_Percentage` decimal(5,2) DEFAULT NULL,
  `int_Year_Of_Passing` int DEFAULT NULL,
  `txt_Medium` varchar(50) DEFAULT NULL,
  `txt_Medium_Other` varchar(100) DEFAULT NULL,
  `txt_First_Attempt` varchar(50) DEFAULT NULL,
  `txt_First_Class` varchar(50) DEFAULT NULL,
  `txt_Degree` varchar(100) DEFAULT NULL,
  `txt_Degree_Other` varchar(100) DEFAULT NULL,
  `txt_Specialization` varchar(150) DEFAULT NULL,
  `txt_Specialization_Other` varchar(150) DEFAULT NULL,
  `txt_Topic` varchar(255) DEFAULT NULL,
  `txt_Institution_Name` varchar(255) DEFAULT NULL,
  `txt_Institution_Other` varchar(255) DEFAULT NULL,
  `txt_Cert_Path` varchar(255) DEFAULT NULL,
  `dte_Created_Date` datetime NOT NULL,
  PRIMARY KEY (`int_Education_Id`),
  FOREIGN KEY (`txt_User_Email`) REFERENCES `tbl_Users`(`txt_User_Email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tbl_User_Experience` (
  `int_Experience_Id` int AUTO_INCREMENT NOT NULL,
  `txt_User_Email` varchar(255) NOT NULL,
  `txt_Is_Fresher` char(1) NOT NULL,
  `txt_Exp_Type` varchar(50) DEFAULT NULL,
  `txt_Org_Name` varchar(255) DEFAULT NULL,
  `dte_From_Date` datetime DEFAULT NULL,
  `dte_To_Date` datetime DEFAULT NULL,
  `txt_Total_Duration` varchar(50) DEFAULT NULL,
  `txt_Designation` varchar(100) DEFAULT NULL,
  `dec_Salary` decimal(10,2) DEFAULT NULL,
  `dte_Created_Date` datetime NOT NULL,
  PRIMARY KEY (`int_Experience_Id`),
  FOREIGN KEY (`txt_User_Email`) REFERENCES `tbl_Users`(`txt_User_Email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tbl_User_Certifications` (
  `int_Certification_Id` int AUTO_INCREMENT NOT NULL,
  `txt_User_Email` varchar(255) NOT NULL,
  `txt_Title` varchar(255) NOT NULL,
  `txt_Score` varchar(50) DEFAULT NULL,
  `txt_Category` varchar(100) DEFAULT NULL,
  `txt_Organization` varchar(255) DEFAULT NULL,
  `int_Year` int DEFAULT NULL,
  `txt_Cert_Doc` varchar(255) DEFAULT NULL,
  `dte_Created_Date` datetime NOT NULL,
  PRIMARY KEY (`int_Certification_Id`),
  FOREIGN KEY (`txt_User_Email`) REFERENCES `tbl_Users`(`txt_User_Email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tbl_User_Phd_Details` (
  `int_Phd_Id` int AUTO_INCREMENT NOT NULL,
  `txt_User_Email` varchar(255) NOT NULL,
  `txt_University` varchar(255) DEFAULT NULL,
  `txt_Thesis_Title` varchar(500) DEFAULT NULL,
  `txt_Guide_Name` varchar(255) DEFAULT NULL,
  `txt_Guide_College` varchar(255) DEFAULT NULL,
  `txt_Status` varchar(50) DEFAULT NULL,
  `int_Year_Of_Registration` int DEFAULT NULL,
  `int_Year_Of_Completion` int DEFAULT NULL,
  `int_Publications_During_Phd` int DEFAULT NULL,
  `int_Publications_Post_Phd` int DEFAULT NULL,
  `int_No_Of_Awards` int DEFAULT 0,
  `int_No_Of_Funded_Projects` int DEFAULT 0,
  `int_No_Of_Funded_Consultancy` int DEFAULT 0,
  `txt_Post_Phd_Experience` varchar(1000) DEFAULT NULL,
  `dte_Created_Date` datetime NOT NULL,
  `dte_Updated_Date` datetime DEFAULT NULL,
  PRIMARY KEY (`int_Phd_Id`),
  FOREIGN KEY (`txt_User_Email`) REFERENCES `tbl_Users`(`txt_User_Email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tbl_Institution` (
  `int_Institution_Id` int AUTO_INCREMENT NOT NULL,
  `txt_Institution_Name` varchar(255) NOT NULL,
  `txt_Category` varchar(100) DEFAULT NULL,
  `txt_Affiliated_University` varchar(255) DEFAULT NULL,
  `txt_District_Name` varchar(100) DEFAULT NULL,
  `txt_State_Name` varchar(100) DEFAULT NULL,
  `txt_Active` char(1) NOT NULL,
  `dte_Created_Date` datetime NOT NULL,
  PRIMARY KEY (`int_Institution_Id`),
  UNIQUE KEY `uk_txt_Institution_Name` (`txt_Institution_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tbl_School_Village_Names` (
  `int_School_Id` int AUTO_INCREMENT NOT NULL,
  `txt_School_Name` varchar(255) NOT NULL,
  `txt_Village_Name` varchar(255) DEFAULT NULL,
  `txt_Full_Display` varchar(500) NOT NULL,
  PRIMARY KEY (`int_School_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tbl_Dropdown_Options` (
  `int_Option_Id` int AUTO_INCREMENT NOT NULL,
  `txt_Category` varchar(50) NOT NULL,
  `txt_Option_Value` varchar(100) NOT NULL,
  `txt_Option_Label` varchar(150) NOT NULL,
  `txt_Active` char(1) NOT NULL,
  `int_Display_Order` int DEFAULT NULL,
  `dte_Created_Date` datetime NOT NULL,
  PRIMARY KEY (`int_Option_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

