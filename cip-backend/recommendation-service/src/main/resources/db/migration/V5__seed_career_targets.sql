-- Starter set of real career targets across all types the target-selector supports.
-- avg_package_lpa, hiring_months, readiness_required and preparation_weeks are
-- reasonable illustrative estimates for planning purposes, not scraped/verified figures
-- (same treatment as government_jobs.exam_cycle earlier) — always point students to the
-- official source for exact current figures.

INSERT INTO career_targets (target_code, name, target_type, min_cgpa, required_skills, preferred_skills, interview_rounds, avg_package_lpa, hiring_months, readiness_required, preparation_weeks) VALUES

-- Private Tech
('GOOGLE_SWE', 'Google — Software Engineer', 'PRIVATE_TECH', 7.0, ARRAY['DSA','System Design','Algorithms','Python','Java'], ARRAY['Distributed Systems','Machine Learning'], 5, 25, ARRAY['October','November','March','April'], 85, 16),
('MICROSOFT_SWE', 'Microsoft — Software Engineer', 'PRIVATE_TECH', 7.0, ARRAY['DSA','System Design','C++','Java'], ARRAY['Cloud Computing','Azure'], 4, 22, ARRAY['August','September','January'], 82, 14),
('AMAZON_SDE', 'Amazon — SDE-1', 'PRIVATE_TECH', 6.5, ARRAY['DSA','System Design','AWS','Java'], ARRAY['Microservices','DynamoDB'], 5, 20, ARRAY['June','July','December'], 80, 14),
('FLIPKART_SDE', 'Flipkart — SDE-1', 'PRIVATE_TECH', 6.5, ARRAY['DSA','System Design','Java','SQL'], ARRAY['Scalability'], 4, 18, ARRAY['July','August'], 78, 12),
('TCS_SWE_TRAINEE', 'TCS — Software Engineer Trainee', 'PRIVATE_TECH', 6.0, ARRAY['Java','SQL','OOP','DSA'], ARRAY['Spring Boot'], 3, 4.5, ARRAY['August','September','December'], 55, 6),
('INFOSYS_SYS_ENG', 'Infosys — Systems Engineer', 'PRIVATE_TECH', 6.0, ARRAY['Programming Fundamentals','SQL','Communication'], ARRAY['Python'], 3, 4.0, ARRAY['July','August'], 50, 6),
('WIPRO_PROJECT_ENG', 'Wipro — Project Engineer', 'PRIVATE_TECH', 6.0, ARRAY['Programming Fundamentals','SQL','Communication'], ARRAY['Cloud Computing'], 3, 4.0, ARRAY['July','September'], 50, 6),
('STARTUP_SDE', 'Startup — Software Engineer', 'PRIVATE_TECH', NULL, ARRAY['JavaScript','React','Node.js','Problem Solving'], ARRAY['Product Sense'], 2, 8.0, ARRAY['Year-round'], 60, 8),

-- Government
('UPSC_IAS', 'UPSC — IAS (Civil Services)', 'GOVERNMENT', NULL, ARRAY['General Studies','Current Affairs','Essay Writing','Ethics'], ARRAY['Optional Subject Depth'], 3, NULL, ARRAY['February'], 90, 52),
('MPPSC_STATE_SERVICE', 'MPPSC — State Service Exam', 'GOVERNMENT', NULL, ARRAY['General Studies','Current Affairs','MP GK'], ARRAY['Hindi Essay Writing'], 3, NULL, ARRAY['Varies annually'], 85, 40),
('NIC_SCIENTIST_B', 'NIC — Scientist B', 'GOVERNMENT', 6.0, ARRAY['Java','DSA','Networking'], ARRAY['Cloud Computing'], 2, 8.0, ARRAY['Varies'], 70, 10),
('CDAC_PROJECT_ENG', 'CDAC — Project Engineer', 'GOVERNMENT', 6.5, ARRAY['Java','DSA','C++'], ARRAY['AI/ML'], 2, 6.0, ARRAY['Rolling'], 65, 8),
('DRDO_SCIENTIST', 'DRDO — Scientist/Engineer', 'GOVERNMENT', 6.5, ARRAY['DSA','Electronics Fundamentals','Research Aptitude'], ARRAY['Embedded Systems'], 2, 8.0, ARRAY['January','February'], 75, 12),
('ISRO_SCIENTIST_ENG', 'ISRO — Scientist/Engineer', 'GOVERNMENT', 6.5, ARRAY['DSA','Electronics Fundamentals','Mechanical Fundamentals'], ARRAY['Research Aptitude'], 2, 8.0, ARRAY['Varies by centre'], 78, 12),

-- PSU
('ONGC_GRAD_TRAINEE', 'ONGC — Graduate Trainee', 'PSU', 6.0, ARRAY['Core Engineering','Quantitative Aptitude'], ARRAY['Domain Certification'], 2, 10.0, ARRAY['Varies'], 65, 10),
('NTPC_ENG_TRAINEE', 'NTPC — Engineer Trainee', 'PSU', 6.0, ARRAY['Core Engineering','Quantitative Aptitude'], ARRAY['Power Systems'], 2, 9.0, ARRAY['Varies'], 65, 10),

-- Banking
('SBI_PO', 'SBI — Probationary Officer', 'BANKING', NULL, ARRAY['Banking Awareness','Quantitative Aptitude','Reasoning Ability','English'], ARRAY['Computer Awareness'], 3, 9.0, ARRAY['April','May'], 70, 12),
('IBPS_PO', 'IBPS — Probationary Officer', 'BANKING', NULL, ARRAY['Banking Awareness','Quantitative Aptitude','Reasoning Ability'], ARRAY['English'], 3, 8.0, ARRAY['August','September'], 68, 10),
('RBI_GRADE_B', 'RBI — Grade B Officer', 'BANKING', NULL, ARRAY['Banking Awareness','Economics','Essay Writing'], ARRAY['Finance'], 3, 12.0, ARRAY['June','July'], 85, 16),

-- Defence
('SSB_ARMY_OFFICER', 'Indian Army — Officer (SSB)', 'DEFENCE', NULL, ARRAY['Leadership','Physical Fitness','General Awareness'], ARRAY['Current Affairs-Defence'], 2, 8.0, ARRAY['Twice yearly'], 65, 10),
('AFCAT_AIRFORCE', 'Indian Air Force — Officer (AFCAT)', 'DEFENCE', NULL, ARRAY['Reasoning Ability','General Awareness','Physics/Maths Basics'], ARRAY['Leadership'], 2, 8.0, ARRAY['June','December'], 65, 10),
('NAVY_SSC', 'Indian Navy — SSC Officer', 'DEFENCE', 6.0, ARRAY['Physics/Maths Basics','Leadership'], ARRAY['Engineering Fundamentals'], 2, 8.0, ARRAY['Varies'], 65, 10),

-- Higher Studies
('GATE', 'GATE (for M.Tech/PSU)', 'HIGHER_STUDIES', NULL, ARRAY['Core Engineering Subjects','Engineering Mathematics','Aptitude'], ARRAY['Prior Year Papers Practice'], 1, NULL, ARRAY['February'], 75, 20),
('CAT', 'CAT (for MBA)', 'HIGHER_STUDIES', NULL, ARRAY['Quantitative Ability','Verbal Ability','Data Interpretation'], ARRAY['Logical Reasoning'], 1, NULL, ARRAY['November'], 75, 16),

-- Entrepreneurship
('STARTUP_FOUNDER', 'Entrepreneurship — Startup Founder', 'ENTREPRENEURSHIP', NULL, ARRAY['Business Fundamentals','Leadership','Product Sense'], ARRAY['Fundraising','Public Speaking'], 0, NULL, ARRAY['Year-round'], 50, 24);
