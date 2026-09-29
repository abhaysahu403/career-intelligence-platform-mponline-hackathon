-- Starter set (~11 per exam type) of real, well-known question patterns for each
-- government interview format. Expand later via a new migration.

INSERT INTO government_interview_questions (exam_type, category, difficulty, question, ideal_answer, tags) VALUES
-- SSB (Services Selection Board)
('SSB', 'Leadership', 'MEDIUM', 'Tell me about a time you took charge of a group without being asked.', 'Look for initiative, ownership of outcome, and how the group responded to being led.', ARRAY['leadership','initiative']),
('SSB', 'Motivation', 'EASY', 'Why do you want to join the armed forces?', 'Genuine, specific motivation tied to service/duty rather than generic answers.', ARRAY['motivation','patriotism']),
('SSB', 'Situation Reaction', 'HARD', 'What would you do if your subordinate refused to follow an order during an exercise?', 'Calm, firm, chain-of-command-respecting resolution; not aggression.', ARRAY['situation-reaction','discipline']),
('SSB', 'Decision Making', 'MEDIUM', 'Describe a situation where you had to make a quick decision under pressure.', 'Clear reasoning under time pressure, ownership of the outcome (good or bad).', ARRAY['decision-making','pressure']),
('SSB', 'Leadership', 'EASY', 'What are the qualities of a good leader in your opinion?', 'Concrete qualities with personal examples, not just a textbook list.', ARRAY['leadership']),
('SSB', 'Conflict Resolution', 'MEDIUM', 'How would you handle a conflict between two team members you are leading?', 'Fair, listens to both sides, resolves without favoritism.', ARRAY['leadership','conflict-resolution']),
('SSB', 'Current Affairs', 'HARD', 'What is your understanding of India''s current border security priorities?', 'Basic awareness of defence-related current affairs; honesty if unsure is better than bluffing.', ARRAY['current-affairs','defence']),
('SSB', 'Self Awareness', 'MEDIUM', 'Tell me about a personal failure and what you learned from it.', 'Genuine reflection, not a disguised humble-brag; shows growth.', ARRAY['self-awareness']),
('SSB', 'Integrity', 'MEDIUM', 'If you found a fellow cadet cheating, what would you do?', 'Upholds integrity while considering how the situation is handled fairly.', ARRAY['integrity','ethics']),
('SSB', 'Motivation', 'EASY', 'What motivates you to serve the nation?', 'Specific and personal, avoids generic slogans.', ARRAY['motivation','patriotism']),
('SSB', 'Team Work', 'MEDIUM', 'Describe a time you gave up personal comfort for a team goal.', 'Concrete sacrifice with a clear team benefit.', ARRAY['teamwork','sacrifice']),

-- UPSC Civil Services
('UPSC', 'Motivation', 'EASY', 'Why do you want to become a civil servant?', 'Personal, specific reasoning connected to public service, not generic idealism.', ARRAY['motivation']),
('UPSC', 'Governance', 'HARD', 'What are the biggest challenges facing rural development in India today?', 'Structured answer covering infrastructure, access, and implementation gaps.', ARRAY['governance','rural-development']),
('UPSC', 'Personal Background', 'EASY', 'Tell me about your home state''s key economic activities.', 'Accurate, specific knowledge of home state economy.', ARRAY['personal-background']),
('UPSC', 'Policy', 'HARD', 'What is your view on the debate around a Uniform Civil Code?', 'Balanced view considering constitutional, social, and legal dimensions.', ARRAY['policy','current-affairs']),
('UPSC', 'Governance', 'HARD', 'How would you balance development and environmental conservation as a district magistrate?', 'Concrete trade-off reasoning with real administrative levers.', ARRAY['governance','environment']),
('UPSC', 'Ethics', 'MEDIUM', 'What does the Preamble to the Constitution mean to you personally?', 'Genuine reflection connecting values to intended role.', ARRAY['ethics','constitution']),
('UPSC', 'Current Affairs', 'MEDIUM', 'Discuss a recent government scheme and its impact.', 'Specific scheme, accurate objective, honest assessment of impact/gaps.', ARRAY['current-affairs','schemes']),
('UPSC', 'Governance', 'HARD', 'If posted to a conflict-prone district, how would you approach maintaining law and order?', 'Balanced approach: firm enforcement plus community engagement.', ARRAY['governance','law-and-order']),
('UPSC', 'Personal Background', 'EASY', 'What is your optional subject, and why did you choose it?', 'Genuine personal reasoning, depth of subject knowledge.', ARRAY['personal-background']),
('UPSC', 'Ethics', 'MEDIUM', 'How do you view the role of civil servants in a democracy?', 'Understanding of neutrality, accountability, and service delivery.', ARRAY['ethics','governance']),
('UPSC', 'Ethics', 'HARD', 'Describe a time you demonstrated integrity despite pressure to do otherwise.', 'Concrete example with real stakes and a principled outcome.', ARRAY['ethics','integrity']),

-- Bank PO (IBPS / SBI)
('BANK_PO', 'Motivation', 'EASY', 'Why do you want to pursue a career in banking?', 'Specific, personal motivation tied to the sector, not generic stability claims.', ARRAY['motivation']),
('BANK_PO', 'Banking Awareness', 'MEDIUM', 'What is the repo rate, and how does it affect lending in the economy?', 'Correct definition and a clear explanation of the transmission mechanism.', ARRAY['banking-awareness','monetary-policy']),
('BANK_PO', 'Banking Awareness', 'HARD', 'Explain the difference between an NPA and NPA provisioning.', 'Correct distinction between the asset classification and the accounting buffer against it.', ARRAY['banking-awareness','npa']),
('BANK_PO', 'Banking Awareness', 'MEDIUM', 'What is the role of the RBI in controlling inflation?', 'Understanding of repo rate, CRR/SLR, and open market operations as levers.', ARRAY['banking-awareness','rbi']),
('BANK_PO', 'Financial Literacy', 'MEDIUM', 'What do you understand by financial inclusion, and how can banks contribute to it?', 'Concrete initiatives: Jan Dhan-style accounts, micro-finance, rural branch reach.', ARRAY['financial-inclusion']),
('BANK_PO', 'Banking Awareness', 'EASY', 'What is the difference between a savings account and a current account?', 'Correct distinction: interest-bearing vs. transactional, withdrawal limits.', ARRAY['banking-awareness']),
('BANK_PO', 'Current Affairs', 'MEDIUM', 'How has UPI impacted traditional banking in India?', 'Discussion of transaction volume shift, branch footfall, and new bank strategies.', ARRAY['current-affairs','digital-banking']),
('BANK_PO', 'Customer Service', 'MEDIUM', 'How would you handle an upset customer at a bank branch?', 'Calm, empathetic, solution-oriented approach without over-promising.', ARRAY['customer-service']),
('BANK_PO', 'Banking Awareness', 'HARD', 'What are CRR and SLR, and why do banks need to maintain them?', 'Correct definitions and their role in liquidity/monetary control.', ARRAY['banking-awareness','crr-slr']),
('BANK_PO', 'Current Affairs', 'HARD', 'What is a recent RBI policy change you are aware of, and what is its likely impact?', 'Specific, reasonably current policy with a coherent impact analysis.', ARRAY['current-affairs','rbi']),
('BANK_PO', 'Motivation', 'EASY', 'Where do you see the banking sector heading in the next five years?', 'Informed opinion on digitization, competition from fintech, and changing customer expectations.', ARRAY['motivation','future-outlook']),

-- SSC / Railway
('SSC_RAILWAY', 'General Awareness', 'MEDIUM', 'Tell me about a recent national or international event that caught your attention.', 'Accurate summary with the candidate''s own perspective.', ARRAY['general-awareness','current-affairs']),
('SSC_RAILWAY', 'Motivation', 'EASY', 'Why do you want to work in this government department?', 'Specific reasoning tied to the department''s function, not generic job security answers.', ARRAY['motivation']),
('SSC_RAILWAY', 'Department Knowledge', 'MEDIUM', 'What are the key functions of the department you are applying to?', 'Accurate understanding of the department''s core mandate.', ARRAY['department-knowledge']),
('SSC_RAILWAY', 'Technical (JE)', 'HARD', 'Explain the function of a signal interlocking system in railway safety.', 'Correct explanation of how interlocking prevents conflicting train movements.', ARRAY['technical','railway','signalling']),
('SSC_RAILWAY', 'Work Approach', 'MEDIUM', 'What steps would you take to improve efficiency in your role?', 'Concrete, realistic process-improvement ideas.', ARRAY['work-approach']),
('SSC_RAILWAY', 'General Awareness', 'MEDIUM', 'What is your understanding of e-governance initiatives in India?', 'Awareness of digital service delivery examples (e.g. online applications, DigiLocker-style systems).', ARRAY['general-awareness','e-governance']),
('SSC_RAILWAY', 'General Awareness', 'EASY', 'How do you stay updated with current affairs?', 'Concrete habits (newspapers, news apps, government portals).', ARRAY['general-awareness']),
('SSC_RAILWAY', 'Department Knowledge', 'EASY', 'Describe your understanding of the organization''s structure.', 'Reasonably accurate hierarchy/structure awareness for the specific organisation.', ARRAY['department-knowledge']),
('SSC_RAILWAY', 'Technical (JE)', 'HARD', 'What safety precautions are critical when working on or near railway tracks?', 'Correct safety protocol awareness (isolation, signage, communication with control).', ARRAY['technical','railway','safety']),
('SSC_RAILWAY', 'Ethics', 'MEDIUM', 'How would you handle a situation where a senior official asks you to bypass procedure?', 'Respectful but firm adherence to procedure, escalation if needed.', ARRAY['ethics','procedure']),
('SSC_RAILWAY', 'General Awareness', 'MEDIUM', 'What government welfare scheme do you find most impactful, and why?', 'Specific scheme with a reasoned explanation of its impact.', ARRAY['general-awareness','schemes']),

-- DRDO / ISRO / NIC Research
('RESEARCH_ORG', 'Project Deep-Dive', 'HARD', 'Explain your final year project in detail, including the biggest technical challenge you faced.', 'Clear problem framing, technical depth, and honest discussion of the hardest part.', ARRAY['project','technical-depth']),
('RESEARCH_ORG', 'Technical', 'HARD', 'Describe a time-space tradeoff you made in a project and why.', 'Concrete example with reasoning about the tradeoff''s impact.', ARRAY['technical','tradeoffs']),
('RESEARCH_ORG', 'DSA', 'MEDIUM', 'Explain the difference between a hash map, a heap, and a balanced tree, and when you would use each.', 'Correct complexity characteristics and appropriate use-case for each structure.', ARRAY['dsa','data-structures']),
('RESEARCH_ORG', 'Research Aptitude', 'MEDIUM', 'What research areas in your field interest you most, and why?', 'Genuine, specific interest with some depth beyond surface-level buzzwords.', ARRAY['research-aptitude']),
('RESEARCH_ORG', 'System Design', 'HARD', 'How would you approach designing a fault-tolerant system for a satellite communication link?', 'Redundancy, error-correction, and graceful degradation concepts.', ARRAY['system-design','fault-tolerance']),
('RESEARCH_ORG', 'Technical', 'MEDIUM', 'What are the trade-offs between object-oriented and functional programming in a large research codebase?', 'Balanced discussion of maintainability, state management, and team familiarity.', ARRAY['technical','programming-paradigms']),
('RESEARCH_ORG', 'Research Aptitude', 'MEDIUM', 'What is your approach to reading and implementing a research paper?', 'Structured approach: abstract/methodology skim, reproduction plan, validation.', ARRAY['research-aptitude']),
('RESEARCH_ORG', 'Technical', 'HARD', 'Describe an algorithm you would use to optimize a resource-constrained embedded system.', 'Concrete algorithmic choice justified by memory/power/compute constraints.', ARRAY['technical','embedded-systems']),
('RESEARCH_ORG', 'Ethics', 'MEDIUM', 'What ethical considerations arise in defence-related research and development?', 'Thoughtful discussion of dual-use concerns and responsible research practice.', ARRAY['ethics','research']),
('RESEARCH_ORG', 'Technical', 'HARD', 'How do you validate the correctness of a complex simulation model?', 'Concrete validation approach: known-result checks, sensitivity analysis, peer review.', ARRAY['technical','validation']),
('RESEARCH_ORG', 'Research Aptitude', 'EASY', 'What technology do you believe will significantly impact India''s research capabilities in the next decade?', 'Informed, reasoned opinion rather than a buzzword list.', ARRAY['research-aptitude','future-outlook']);
