-- Curated starter set of real courses. NPTEL URLs verified via web search against
-- current nptel.ac.in listings (not fabricated course IDs). NPTEL course landing pages
-- get re-issued each semester (noc##_xx## codes) — the /courses/<id> permalinks used here
-- were live at seed time; re-verify periodically. One entry (DBMS) only had a preview-style
-- URL available, not the usual /courses/<id> permalink — flagged in its tags.

INSERT INTO courses (code, title, platform, platform_type, url, skills_covered, branches, duration_weeks, cost, certification, certification_body, difficulty, rating, government_recognized, tags) VALUES

-- NPTEL (Government — IIT/IISc)
('CRS001', 'Programming, Data Structures And Algorithms Using Python', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/106106145', ARRAY['Python','DSA'], ARRAY['CSE','IT','ALL'], 12, 'Free', true, 'Chennai Mathematical Institute', 'BEGINNER', 4.6, true, ARRAY['programming','python']),
('CRS002', 'Programming In Java', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/106105191', ARRAY['Java','OOP'], ARRAY['CSE','IT'], 12, 'Free', true, 'IIT Kharagpur', 'BEGINNER', 4.7, true, ARRAY['programming','java','backend']),
('CRS003', 'Data Structures And Algorithms', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/106102064', ARRAY['DSA','Algorithms'], ARRAY['CSE','IT','ALL'], 12, 'Free', true, 'IIT Delhi', 'INTERMEDIATE', 4.6, true, ARRAY['dsa','core']),
('CRS004', 'Introduction to Machine Learning', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/106105152', ARRAY['Machine Learning'], ARRAY['CSE','IT','ALL'], 12, 'Free', true, 'IIT Kharagpur', 'INTERMEDIATE', 4.6, true, ARRAY['ml','ai']),
('CRS005', 'Deep Learning', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/106106184', ARRAY['Deep Learning','Neural Networks'], ARRAY['CSE','IT'], 12, 'Free', true, 'IIT Ropar', 'ADVANCED', 4.5, true, ARRAY['deep-learning','ai']),
('CRS006', 'Database Management System', 'NPTEL', 'GOVERNMENT', 'https://onlinecourses.nptel.ac.in/noc19_cs46/preview', ARRAY['DBMS','SQL'], ARRAY['CSE','IT','ALL'], 8, 'Free', true, 'IIT Kharagpur', 'BEGINNER', 4.5, true, ARRAY['dbms','core','preview-link']),
('CRS007', 'Operating System Fundamentals', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/106105214', ARRAY['Operating Systems','OS'], ARRAY['CSE','IT'], 8, 'Free', true, 'IIT Kharagpur', 'INTERMEDIATE', 4.5, true, ARRAY['os','core']),
('CRS008', 'Introduction on Computer Networks', 'NPTEL', 'GOVERNMENT', 'https://www.nptel.ac.in/courses/106106091', ARRAY['Computer Networks'], ARRAY['CSE','IT','ECE'], 8, 'Free', true, 'NPTEL', 'INTERMEDIATE', 4.4, true, ARRAY['networks','core']),
('CRS009', 'Software Engineering', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/106101061', ARRAY['Software Engineering','SDLC'], ARRAY['CSE','IT'], 12, 'Free', true, 'IIT Bombay', 'INTERMEDIATE', 4.4, true, ARRAY['software-engineering']),
('CRS010', 'Cloud Computing', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/106105167', ARRAY['Cloud Computing'], ARRAY['CSE','IT','ALL'], 12, 'Free', true, 'IIT Kharagpur', 'INTERMEDIATE', 4.4, true, ARRAY['cloud','devops']),
('CRS011', 'Introduction to VLSI Design', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/117106092', ARRAY['VLSI Design'], ARRAY['ECE','EEE'], 12, 'Free', true, 'NPTEL', 'ADVANCED', 4.4, true, ARRAY['vlsi','ece']),
('CRS012', 'Power System Engineering', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/108101040', ARRAY['Power Systems'], ARRAY['EEE'], 12, 'Free', true, 'IIT Kharagpur', 'INTERMEDIATE', 4.3, true, ARRAY['power-systems','eee']),
('CRS013', 'Control Systems', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/107106081', ARRAY['Control Systems'], ARRAY['EEE','ECE'], 12, 'Free', true, 'IIT Madras', 'INTERMEDIATE', 4.4, true, ARRAY['control-systems']),
('CRS014', 'Engineering Thermodynamics', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/101104063', ARRAY['Thermodynamics'], ARRAY['MECH'], 12, 'Free', true, 'IIT Kanpur', 'INTERMEDIATE', 4.3, true, ARRAY['thermodynamics','mech']),
('CRS015', 'Structural Analysis I', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/105101085', ARRAY['Structural Analysis'], ARRAY['CIVIL'], 12, 'Free', true, 'IIT Bombay', 'INTERMEDIATE', 4.3, true, ARRAY['structural-analysis','civil']),
('CRS016', 'Communication Skills', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/109104031', ARRAY['Communication','English'], ARRAY['ALL'], 8, 'Free', true, 'NPTEL', 'BEGINNER', 4.5, true, ARRAY['soft-skills','communication']),
('CRS017', 'Python for Data Science', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/106106212', ARRAY['Python','Data Science'], ARRAY['CSE','IT','ALL'], 8, 'Free', true, 'IIT Madras', 'BEGINNER', 4.5, true, ARRAY['data-science','python']),
('CRS018', 'Entrepreneurship', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/110106141', ARRAY['Entrepreneurship'], ARRAY['ALL'], 8, 'Free', true, 'IIT Madras', 'BEGINNER', 4.3, true, ARRAY['soft-skills','entrepreneurship']),
('CRS019', 'Design Thinking - A Primer', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/110106124', ARRAY['Design Thinking'], ARRAY['ALL'], 4, 'Free', true, 'IIT Madras', 'BEGINNER', 4.4, true, ARRAY['soft-skills','design-thinking']),
('CRS020', 'Digital Electronic Circuits', 'NPTEL', 'GOVERNMENT', 'https://nptel.ac.in/courses/108105132', ARRAY['Digital Electronics'], ARRAY['ECE','EEE'], 12, 'Free', true, 'IIT Kharagpur', 'INTERMEDIATE', 4.4, true, ARRAY['digital-electronics','ece']),

-- Free International
('CRS021', 'CS50: Introduction to Computer Science', 'edX (Harvard)', 'INTERNATIONAL', 'https://cs50.harvard.edu/x/', ARRAY['C','Python','Algorithms','CS Fundamentals'], ARRAY['ALL'], 12, 'Free', true, 'Harvard University', 'BEGINNER', 4.9, false, ARRAY['cs-fundamentals','cs50']),
('CRS022', 'Responsive Web Design', 'freeCodeCamp', 'INTERNATIONAL', 'https://www.freecodecamp.org/learn/responsive-web-design/', ARRAY['HTML','CSS'], ARRAY['CSE','IT'], 6, 'Free', true, 'freeCodeCamp', 'BEGINNER', 4.7, false, ARRAY['web-development','frontend']),
('CRS023', 'JavaScript Algorithms and Data Structures', 'freeCodeCamp', 'INTERNATIONAL', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', ARRAY['JavaScript','DSA'], ARRAY['CSE','IT'], 8, 'Free', true, 'freeCodeCamp', 'BEGINNER', 4.7, false, ARRAY['javascript','frontend']),
('CRS024', 'Machine Learning', 'Coursera (Stanford)', 'INTERNATIONAL', 'https://www.coursera.org/learn/machine-learning', ARRAY['Machine Learning'], ARRAY['CSE','IT','ALL'], 11, 'Free audit', true, 'Stanford University', 'INTERMEDIATE', 4.9, false, ARRAY['ml','ai']),
('CRS025', 'CS50''s Introduction to Artificial Intelligence with Python', 'edX (Harvard)', 'INTERNATIONAL', 'https://cs50.harvard.edu/ai/', ARRAY['AI','Python'], ARRAY['CSE','IT'], 7, 'Free', true, 'Harvard University', 'INTERMEDIATE', 4.8, false, ARRAY['ai','python']),
('CRS026', 'Introduction to Algorithms', 'MIT OpenCourseWare', 'INTERNATIONAL', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/', ARRAY['Algorithms','DSA'], ARRAY['CSE','IT'], 12, 'Free', false, NULL, 'ADVANCED', 4.8, false, ARRAY['algorithms','mit']),
('CRS027', 'Google Cloud Fundamentals', 'Coursera (Google)', 'INTERNATIONAL', 'https://www.coursera.org/learn/google-cloud-fundamentals', ARRAY['Cloud Computing','GCP'], ARRAY['CSE','IT'], 4, 'Free audit', true, 'Google Cloud', 'BEGINNER', 4.6, false, ARRAY['cloud','gcp']),
('CRS028', 'AWS Cloud Practitioner Essentials', 'AWS Skill Builder', 'INTERNATIONAL', 'https://skillbuilder.aws/', ARRAY['AWS','Cloud Computing'], ARRAY['CSE','IT'], 3, 'Free', true, 'Amazon Web Services', 'BEGINNER', 4.6, false, ARRAY['cloud','aws']),
('CRS029', 'Introduction to Linux', 'edX (Linux Foundation)', 'INTERNATIONAL', 'https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux', ARRAY['Linux'], ARRAY['CSE','IT'], 8, 'Free audit', true, 'Linux Foundation', 'BEGINNER', 4.6, false, ARRAY['linux','devops']),
('CRS030', 'Leading Teams', 'Coursera (University of Michigan)', 'INTERNATIONAL', 'https://www.coursera.org/learn/leading-teams', ARRAY['Leadership','Teamwork'], ARRAY['ALL'], 4, 'Free audit', true, 'University of Michigan', 'BEGINNER', 4.7, false, ARRAY['soft-skills','leadership']),
('CRS031', 'Google Project Management Certificate', 'Coursera (Google)', 'INTERNATIONAL', 'https://www.coursera.org/professional-certificates/google-project-management', ARRAY['Project Management'], ARRAY['ALL'], 24, 'Free audit', true, 'Google', 'BEGINNER', 4.8, false, ARRAY['soft-skills','project-management']),

-- Free Indian platforms
('CRS032', 'DSA Self Paced Course', 'GeeksforGeeks', 'INDIAN', 'https://www.geeksforgeeks.org/courses/', ARRAY['DSA'], ARRAY['CSE','IT'], 16, 'Free (with paid tiers)', false, NULL, 'INTERMEDIATE', 4.4, false, ARRAY['dsa','practice']),
('CRS033', 'Interview Preparation', 'InterviewBit', 'INDIAN', 'https://www.interviewbit.com/', ARRAY['DSA','Interview Prep'], ARRAY['CSE','IT'], 8, 'Free', false, NULL, 'INTERMEDIATE', 4.3, false, ARRAY['interview-prep']),
('CRS034', 'Competitive Programming', 'CodeChef', 'INDIAN', 'https://www.codechef.com/', ARRAY['DSA','Competitive Programming'], ARRAY['CSE','IT'], 12, 'Free', false, NULL, 'INTERMEDIATE', 4.3, false, ARRAY['competitive-programming']),
('CRS035', 'FutureSkills Prime Upskilling Programs', 'NASSCOM FutureSkills', 'INDIAN', 'https://futureskillsprime.in/', ARRAY['Cloud Computing','AI','Cybersecurity'], ARRAY['CSE','IT','ALL'], 8, 'Free (with paid tiers)', true, 'NASSCOM & MeitY', 'INTERMEDIATE', 4.2, true, ARRAY['upskilling','nasscom']),
('CRS036', 'Aptitude Questions and Answers', 'GeeksforGeeks', 'INDIAN', 'https://www.geeksforgeeks.org/aptitude-questions-and-answers/', ARRAY['Quantitative Aptitude'], ARRAY['ALL'], 4, 'Free', false, NULL, 'BEGINNER', 4.2, false, ARRAY['gov-exam-prep','aptitude']),
('CRS037', 'Reasoning', 'GeeksforGeeks', 'INDIAN', 'https://www.geeksforgeeks.org/reasoning/', ARRAY['Reasoning Ability'], ARRAY['ALL'], 4, 'Free', false, NULL, 'BEGINNER', 4.2, false, ARRAY['gov-exam-prep','reasoning']),
('CRS038', 'Press Releases & Current Affairs', 'PIB (Press Information Bureau)', 'GOVERNMENT', 'https://pib.gov.in/', ARRAY['Current Affairs'], ARRAY['ALL'], 0, 'Free', false, NULL, 'BEGINNER', 4.0, true, ARRAY['gov-exam-prep','current-affairs']),

-- Paid but affordable
('CRS039', 'Spring & Hibernate for Beginners (Spring Boot)', 'Udemy', 'PAID', 'https://www.udemy.com/course/spring-hibernate-tutorial/', ARRAY['Spring Boot','Java'], ARRAY['CSE','IT'], 8, '₹499 (sale price)', true, 'Udemy', 'INTERMEDIATE', 4.6, false, ARRAY['backend','spring-boot']),
('CRS040', 'DSA & Competitive Programming', 'Coding Ninjas', 'PAID', 'https://www.codingninjas.com/', ARRAY['DSA','Competitive Programming'], ARRAY['CSE','IT'], 12, 'Paid', true, 'Coding Ninjas', 'INTERMEDIATE', 4.4, false, ARRAY['dsa','paid']);
