/**
 * Seed script — populates the database with sample skills, role profiles,
 * learning resources, and a default admin account.
 *
 * Usage: node src/utils/seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const RoleProfile = require('../models/RoleProfile');
const LearningResource = require('../models/LearningResource');
const OfficerProfile = require('../models/OfficerProfile');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

const skills = [
  // --- Statistical Domain ---
  { name: 'Statistical Data Analysis', category: 'Statistical', subDomain: 'Statistical Inference', description: 'Ability to analyze large datasets using statistical methods.' },
  { name: 'Survey Design & Methodology', category: 'Statistical', subDomain: 'Survey Design', description: 'Designing and conducting official statistical surveys.' },
  { name: 'Sampling Theory', category: 'Statistical', subDomain: 'Sampling', description: 'Probability sampling, stratification, and sample estimation.' },
  { name: 'National Accounts & GDP Estimation', category: 'Statistical', subDomain: 'National Accounts', description: 'Understanding national income accounting frameworks and macroeconomic aggregates.' },
  { name: 'Consumer Price Index Methodology', category: 'Statistical', subDomain: 'Price Statistics', description: 'CPI computation, weighting, and base-year revision.' },
  { name: 'Labour Statistics', category: 'Statistical', subDomain: 'Labour Statistics', description: 'Periodic Labour Force Survey (PLFS) concepts, activity statuses, and employment metrics.' },
  { name: 'Agricultural Statistics', category: 'Statistical', subDomain: 'Agricultural Statistics', description: 'Crop cutting experiments, area estimation, and agricultural census methodology.' },
  { name: 'Industrial Statistics', category: 'Statistical', subDomain: 'Industrial Statistics', description: 'Annual Survey of Industries (ASI), Index of Industrial Production (IIP) compilation.' },
  { name: 'SDG Indicators', category: 'Statistical', subDomain: 'SDG Indicators', description: 'Monitoring and tracking Sustainable Development Goal indicators for India.' },
  { name: 'Metadata Standards', category: 'Statistical', subDomain: 'Metadata Standards', description: 'Statistical data and metadata exchange (SDMX) and national data classification.' },
  { name: 'Data Quality Frameworks', category: 'Statistical', subDomain: 'Data Quality Frameworks', description: 'Assessing accuracy, reliability, coherence, and timeliness of official data.' },
  { name: 'Census Operations', category: 'Statistical', subDomain: 'Census Operations', description: 'Planning and executing population and economic censuses.' },

  // --- Technical Domain ---
  { name: 'Python for Data Science', category: 'Technical', subDomain: 'Python', description: 'Using Python (Pandas, NumPy, Scikit-learn) for data processing and analysis.' },
  { name: 'R Programming', category: 'Technical', subDomain: 'R', description: 'Using R for statistical computing, modeling, and package development.' },
  { name: 'Database Management (SQL)', category: 'Technical', subDomain: 'SQL', description: 'Writing SQL queries, data warehousing, and managing relational databases.' },
  { name: 'Stata', category: 'Technical', subDomain: 'Stata', description: 'Econometric analysis, panel data modeling, and survey data processing using Stata.' },
  { name: 'SPSS', category: 'Technical', subDomain: 'SPSS', description: 'Statistical Package for the Social Sciences for survey data manipulation.' },
  { name: 'SAS', category: 'Technical', subDomain: 'SAS', description: 'Enterprise statistical analytics, macro programming, and large-scale data handling.' },
  { name: 'GIS & Geospatial Analysis', category: 'Technical', subDomain: 'GIS', description: 'Using geographic information systems and spatial data for statistical mapping.' },
  { name: 'Data Visualization', category: 'Technical', subDomain: 'Data Visualization', description: 'Creating interactive dashboards, charts, and executive visual reports.' },
  { name: 'Machine Learning Basics', category: 'Technical', subDomain: 'AI/ML', description: 'Supervised and unsupervised learning, predictive modeling for statistical datasets.' },
  { name: 'Cloud Computing', category: 'Technical', subDomain: 'Cloud Computing', description: 'Leveraging cloud infrastructure (MeghRaj / NIC Cloud) for data storage and compute.' },
  { name: 'APIs', category: 'Technical', subDomain: 'APIs', description: 'Designing, integrating, and consuming REST APIs for government data dissemination.' },
  { name: 'Open Data', category: 'Technical', subDomain: 'Open Data', description: 'Publishing and maintaining machine-readable datasets on Open Government Data (data.gov.in).' },
  { name: 'Time Series Forecasting', category: 'Technical', subDomain: 'Time Series', description: 'ARIMA, exponential smoothing, and trend analysis for economic time series.' },

  // --- DigitalGovernance Domain ---
  { name: 'Cybersecurity', category: 'DigitalGovernance', subDomain: 'Cybersecurity', description: 'Securing official statistical databases, perimeter defence, and incident response.' },
  { name: 'Data Privacy & Ethics', category: 'DigitalGovernance', subDomain: 'Data Privacy', description: 'Ensuring respondent confidentiality, data anonymization, and DPDP Act compliance.' },
  { name: 'Digital Signatures', category: 'DigitalGovernance', subDomain: 'Digital Signatures', description: 'Implementation and verification of DSC/eSign in government administrative workflows.' },
  { name: 'Government Cloud', category: 'DigitalGovernance', subDomain: 'Government Cloud', description: 'Navigating GI Cloud (MeghRaj) compliance, multi-tenancy, and security guidelines.' },
  { name: 'Digital Public Infrastructure', category: 'DigitalGovernance', subDomain: 'Digital Public Infrastructure', description: 'Integrating with India Stack (Aadhaar, DigiLocker, UPI, e-Office).' },

  // --- BehaviouralManagerial Domain ---
  { name: 'Team Leadership', category: 'BehaviouralManagerial', subDomain: 'Leadership', description: 'Leading, mentoring, and motivating field and analytical statistical teams.' },
  { name: 'Presentation Skills', category: 'BehaviouralManagerial', subDomain: 'Communication', description: 'Presenting complex statistical findings to policymakers and public stakeholders.' },
  { name: 'Project Management', category: 'BehaviouralManagerial', subDomain: 'Project Management', description: 'Planning, scheduling, risk management, and monitoring statistical survey projects.' },
  { name: 'Ethics', category: 'BehaviouralManagerial', subDomain: 'Ethics', description: 'Adhering to the Fundamental Principles of Official Statistics and public service integrity.' },
  { name: 'Decision Making', category: 'BehaviouralManagerial', subDomain: 'Decision Making', description: 'Evidence-based administrative decision making under uncertainty and time constraints.' },
  { name: 'Change Management', category: 'BehaviouralManagerial', subDomain: 'Change Management', description: 'Guiding teams through digital transformation, modern survey tools, and CAPI adoption.' },
  { name: 'Report Writing', category: 'BehaviouralManagerial', subDomain: 'Communication', description: 'Drafting clear, rigorous, and policy-relevant statistical reports and releases.' },
];

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Skill.deleteMany({}),
    RoleProfile.deleteMany({}),
    LearningResource.deleteMany({}),
    OfficerProfile.deleteMany({}),
    Quiz.deleteMany({}),
    QuizAttempt.deleteMany({}),
  ]);

  console.log('🗑️  Cleared existing data');

  // --- Skills ---
  const createdSkills = await Skill.insertMany(skills);
  console.log(`✅ Seeded ${createdSkills.length} skills`);

  const skillMap = {};
  for (const s of createdSkills) {
    skillMap[s.name] = s._id;
  }

  // --- Role Profiles ---
  const roles = [
    {
      title: 'Junior Statistical Officer',
      department: 'Ministry of Statistics & Programme Implementation',
      description: 'Entry-level officer handling data collection and basic analysis.',
      requiredSkills: [
        { skill: skillMap['Statistical Data Analysis'], requiredLevel: 3, weight: 2 },
        { skill: skillMap['Survey Design & Methodology'], requiredLevel: 2, weight: 1.5 },
        { skill: skillMap['Data Visualization'], requiredLevel: 2, weight: 1 },
        { skill: skillMap['R Programming'], requiredLevel: 2, weight: 1 },
        { skill: skillMap['Database Management (SQL)'], requiredLevel: 2, weight: 1 },
        { skill: skillMap['Report Writing'], requiredLevel: 2, weight: 1 },
        { skill: skillMap['Sampling Theory'], requiredLevel: 3, weight: 1.5 },
      ],
    },
    {
      title: 'Senior Statistical Officer',
      department: 'Ministry of Statistics & Programme Implementation',
      description: 'Mid-level officer managing surveys and advanced analysis.',
      requiredSkills: [
        { skill: skillMap['Statistical Data Analysis'], requiredLevel: 4, weight: 2 },
        { skill: skillMap['Survey Design & Methodology'], requiredLevel: 4, weight: 2 },
        { skill: skillMap['Python for Data Science'], requiredLevel: 3, weight: 1.5 },
        { skill: skillMap['Time Series Forecasting'], requiredLevel: 3, weight: 1.5 },
        { skill: skillMap['National Accounts & GDP Estimation'], requiredLevel: 3, weight: 2 },
        { skill: skillMap['Team Leadership'], requiredLevel: 3, weight: 1 },
        { skill: skillMap['Project Management'], requiredLevel: 3, weight: 1 },
        { skill: skillMap['Data Privacy & Ethics'], requiredLevel: 3, weight: 1.5 },
      ],
    },
    {
      title: 'Deputy Director (Statistics)',
      department: 'Central Statistics Office',
      description: 'Senior officer overseeing statistical programmes and policy.',
      requiredSkills: [
        { skill: skillMap['Statistical Data Analysis'], requiredLevel: 5, weight: 2 },
        { skill: skillMap['National Accounts & GDP Estimation'], requiredLevel: 5, weight: 2.5 },
        { skill: skillMap['Consumer Price Index Methodology'], requiredLevel: 4, weight: 2 },
        { skill: skillMap['Census Operations'], requiredLevel: 4, weight: 1.5 },
        { skill: skillMap['Machine Learning Basics'], requiredLevel: 3, weight: 1 },
        { skill: skillMap['Team Leadership'], requiredLevel: 4, weight: 1.5 },
        { skill: skillMap['Project Management'], requiredLevel: 4, weight: 1.5 },
        { skill: skillMap['Report Writing'], requiredLevel: 4, weight: 1 },
        { skill: skillMap['Presentation Skills'], requiredLevel: 4, weight: 1 },
      ],
    },
  ];

  const createdRoles = await RoleProfile.insertMany(roles);
  console.log(`✅ Seeded ${createdRoles.length} role profiles`);

  // --- Learning Resources ---
  const resources = [
    { title: 'Introduction to Statistical Methods', type: 'course', source: 'igot', externalId: 'IGOT-001', skills: [skillMap['Statistical Data Analysis'], skillMap['Sampling Theory']], durationMinutes: 120, difficulty: 'beginner', language: 'English' },
    { title: 'Survey Methodology & Sampling', type: 'course', source: 'igot', externalId: 'IGOT-002', skills: [skillMap['Survey Design & Methodology'], skillMap['Sampling Theory']], durationMinutes: 180, difficulty: 'intermediate', language: 'English' },
    { title: 'Survey Design Best Practices', type: 'article', source: 'internal', skills: [skillMap['Survey Design & Methodology']], durationMinutes: 30, difficulty: 'intermediate', language: 'English' },
    { title: 'Data Visualization with Python & R', type: 'course', source: 'igot', externalId: 'IGOT-004', skills: [skillMap['Data Visualization'], skillMap['R Programming'], skillMap['Python for Data Science']], durationMinutes: 180, difficulty: 'intermediate', language: 'English' },
    { title: 'SQL for Government Data Systems', type: 'module', source: 'internal', skills: [skillMap['Database Management (SQL)']], durationMinutes: 90, difficulty: 'beginner', language: 'English' },
    { title: 'National Accounts: GDP Estimation Methods', type: 'course', source: 'igot', externalId: 'IGOT-003', skills: [skillMap['National Accounts & GDP Estimation']], durationMinutes: 240, difficulty: 'advanced', language: 'English' },
    { title: 'CPI Compilation Manual', type: 'document', source: 'internal', skills: [skillMap['Consumer Price Index Methodology']], durationMinutes: 60, difficulty: 'advanced', language: 'Hindi' },
    { title: 'Census Planning & Execution Handbook', type: 'document', source: 'internal', skills: [skillMap['Census Operations']], durationMinutes: 45, difficulty: 'intermediate', language: 'Hindi' },
    { title: 'Time Series Analysis with ARIMA', type: 'course', source: 'igot', externalId: 'IGOT-013', skills: [skillMap['Time Series Forecasting']], durationMinutes: 150, difficulty: 'intermediate', language: 'English' },
    { title: 'Machine Learning Foundations', type: 'course', source: 'external', skills: [skillMap['Machine Learning Basics']], durationMinutes: 300, difficulty: 'beginner', language: 'English' },
    { title: 'Effective Report Writing for Policymakers', type: 'module', source: 'internal', skills: [skillMap['Report Writing']], durationMinutes: 60, difficulty: 'beginner', language: 'English' },
    { title: 'GIS Fundamentals for Statisticians', type: 'course', source: 'igot', externalId: 'IGOT-012', skills: [skillMap['GIS & Geospatial Analysis']], durationMinutes: 120, difficulty: 'intermediate', language: 'English' },
    { title: 'Data Privacy Regulations in India', type: 'article', source: 'internal', skills: [skillMap['Data Privacy & Ethics']], durationMinutes: 20, difficulty: 'beginner', language: 'English' },
    // --- NSSTA TPAC-recommended programmes (Item 1) ---
    { title: 'NSSTA TPAC: Advanced Sampling Techniques', type: 'course', source: 'nssta', externalId: 'NSSTA-001', skills: [skillMap['Sampling Theory'], skillMap['Statistical Data Analysis']], durationMinutes: 300, difficulty: 'advanced', language: 'English' },
    { title: 'NSSTA TPAC: Survey Operations Quality Control', type: 'course', source: 'nssta', externalId: 'NSSTA-003', skills: [skillMap['Survey Design & Methodology']], durationMinutes: 240, difficulty: 'intermediate', language: 'English' },
    { title: 'NSSTA TPAC: Price Index Compilation & Rebasing', type: 'course', source: 'nssta', externalId: 'NSSTA-006', skills: [skillMap['Consumer Price Index Methodology']], durationMinutes: 180, difficulty: 'intermediate', language: 'Hindi' },
    // --- Virtual Labs (Item 4) ---
    { title: 'Interactive Lab: R Statistical Sandbox', type: 'lab', source: 'internal', embedUrl: 'https://rdrr.io/snippets/embed/', skills: [skillMap['R Programming'], skillMap['Statistical Data Analysis']], durationMinutes: 60, difficulty: 'intermediate', language: 'English' },
    { title: 'Interactive Lab: Python Data Analysis Notebook', type: 'lab', source: 'internal', embedUrl: 'https://colab.research.google.com/', skills: [skillMap['Python for Data Science'], skillMap['Data Visualization']], durationMinutes: 90, difficulty: 'intermediate', language: 'English' },
    { title: 'Interactive Lab: SQL Query Playground for MoSPI Datasets', type: 'lab', source: 'internal', embedUrl: 'https://sqliteonline.com/', skills: [skillMap['Database Management (SQL)']], durationMinutes: 45, difficulty: 'beginner', language: 'English' },
  ];

  await LearningResource.insertMany(resources);
  console.log(`✅ Seeded ${resources.length} learning resources`);

  // --- Default Admin ---
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@skillvista.gov.in',
    password: 'admin123',
    role: 'admin',
    department: 'IT Cell',
    designation: 'System Administrator',
  });
  console.log(`✅ Created admin: ${admin.email} (password: admin123)`);

  // --- Sample Officer ---
  const officer = await User.create({
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh@skillvista.gov.in',
    password: 'officer123',
    role: 'officer',
    department: 'Ministry of Statistics & Programme Implementation',
    designation: 'Junior Statistical Officer',
  });

  await OfficerProfile.create({
    user: officer._id,
    roleProfile: createdRoles[0]._id, // Junior Statistical Officer
    currentSkills: [
      { skill: skillMap['Statistical Data Analysis'], selfAssessedLevel: 2 },
      { skill: skillMap['Survey Design & Methodology'], selfAssessedLevel: 1 },
      { skill: skillMap['Data Visualization'], selfAssessedLevel: 1 },
      { skill: skillMap['R Programming'], selfAssessedLevel: 1 },
      { skill: skillMap['Database Management (SQL)'], selfAssessedLevel: 2 },
      { skill: skillMap['Report Writing'], selfAssessedLevel: 2 },
      { skill: skillMap['Sampling Theory'], selfAssessedLevel: 1 },
    ],
    qualifications: [
      { degree: 'M.Sc.', field: 'Statistics', institution: 'Delhi University', year: 2021 },
      { degree: 'B.Sc. (Hons)', field: 'Mathematical Statistics', institution: 'Banaras Hindu University', year: 2019 },
    ],
    experience: [
      { organization: 'National Sample Survey Office (FOD)', role: 'Junior Statistical Officer', fromYear: 2022, toYear: null },
      { organization: 'Directorate of Economics & Statistics', role: 'Statistical Investigator', fromYear: 2021, toYear: 2022 },
    ],
    previousTrainings: [
      { title: 'National Accounts & State GDP Compilation', provider: 'National Statistical Systems Training Academy (NSSTA)', completedAt: new Date('2023-08-15'), certificateUrl: 'https://nssta.gov.in/certs/rajesh-na-2023' },
      { title: 'Computer Assisted Personal Interviewing (CAPI) in NSS Surveys', provider: 'MoSPI Training Division', completedAt: new Date('2024-02-10'), certificateUrl: 'https://mospi.gov.in/certs/capi-cert-771' },
    ],
  });

  console.log(`✅ Created officer: ${officer.email} (password: officer123)`);

  // --- Quizzes (mapped to key skills with adaptive difficulty) ---
  const qSampling = await Quiz.create({
    title: 'Probability Sampling Theory & Estimators',
    description: 'Assesses foundational and advanced probability sampling, stratification, and sample estimation methods.',
    skill: skillMap['Sampling Theory'],
    createdBy: admin._id,
    questions: [
      {
        question: 'Which sampling method ensures proportional representation across distinct demographic subpopulations?',
        options: ['Simple Random Sampling', 'Stratified Random Sampling', 'Convenience Sampling', 'Snowball Sampling'],
        correctIndex: 1,
        explanation: 'Stratified sampling divides the population into non-overlapping homogeneous strata before sampling.',
        difficulty: 'easy',
      },
      {
        question: 'In multistage cluster sampling, what does the design effect (DEFF) quantify?',
        options: ['Ratio of complex design variance to simple random sample variance', 'Total sample size divided by clusters', 'Margin of error squared', 'Coefficient of variation of sample weights'],
        correctIndex: 0,
        explanation: 'DEFF is the ratio of the variance of an estimator under a complex design to the variance under SRS of the same size.',
        difficulty: 'medium',
      },
      {
        question: 'Under Horvitz-Thompson estimation for unequal probability sampling, what is the weight of unit i?',
        options: ['Inverse of its inclusion probability (1 / πi)', 'Inclusion probability squared', 'Logarithm of total sample units', 'Ratio of stratum size to sample size'],
        correctIndex: 0,
        explanation: 'The Horvitz-Thompson unbiased estimator weights each selected unit by the reciprocal of its inclusion probability.',
        difficulty: 'hard',
      },
    ],
  });

  const qInference = await Quiz.create({
    title: 'Statistical Inference & Hypothesis Testing',
    description: 'Evaluates knowledge of statistical distributions, p-values, hypothesis tests, and regression assumptions.',
    skill: skillMap['Statistical Data Analysis'],
    createdBy: admin._id,
    questions: [
      {
        question: 'What does a p-value less than 0.05 signify in a two-tailed hypothesis test?',
        options: ['The null hypothesis is definitively proven', 'Statistically significant evidence against the null hypothesis at 5% alpha', 'Sample size was inadequate', 'A Type II error definitely occurred'],
        correctIndex: 1,
        explanation: 'A p-value < 0.05 indicates the observed data is unlikely under the null hypothesis at the 5% significance level.',
        difficulty: 'easy',
      },
      {
        question: 'Which statistical test is appropriate for comparing means across three independent official statistical groups?',
        options: ['Paired sample t-test', 'One-way Analysis of Variance (ANOVA)', 'Chi-square goodness of fit', 'Wilcoxon signed-rank test'],
        correctIndex: 1,
        explanation: 'One-way ANOVA tests whether there are statistically significant differences among the means of three or more independent groups.',
        difficulty: 'medium',
      },
      {
        question: 'Which condition violates the Gauss-Markov theorem in Ordinary Least Squares (OLS) regression?',
        options: ['Heteroscedasticity of error variance', 'Linearity in parameters', 'Zero conditional mean of errors', 'No perfect multicollinearity'],
        correctIndex: 0,
        explanation: 'Heteroscedasticity violates the constant error variance assumption, meaning OLS estimators are no longer BLUE.',
        difficulty: 'hard',
      },
    ],
  });

  const qSurvey = await Quiz.create({
    title: 'NSS Survey Methodology & Quality Control',
    description: 'Assesses familiarity with NSS schedule design, sampling frame concepts, and non-sampling error reduction.',
    skill: skillMap['Survey Design & Methodology'],
    createdBy: admin._id,
    questions: [
      {
        question: 'In NSS field operations, what commonly constitutes a First Stage Unit (FSU)?',
        options: ['Household', 'Census Village or Urban Frame Survey (UFS) Block', 'District Collectorate Office', 'Individual respondent'],
        correctIndex: 1,
        explanation: 'In NSS surveys, FSUs are typically census villages in rural areas and UFS blocks in urban areas.',
        difficulty: 'easy',
      },
      {
        question: 'What is the primary objective of using interpenetrating sub-samples in NSS surveys?',
        options: ['To measure total non-sampling variance and investigator variability', 'To eliminate questionnaire printing costs', 'To reduce sample size by half', 'To restrict data collection to urban centers'],
        correctIndex: 0,
        explanation: 'Mahalanobis interpenetrating sub-samples allow independent estimation of non-sampling error and interviewer bias.',
        difficulty: 'medium',
      },
      {
        question: 'Which estimator corrects for non-response bias by sub-sampling non-respondents for intensive follow-up?',
        options: ['Hansen-Hurwitz estimator', 'Laspeyres price index', 'Kaplan-Meier estimator', 'Kendall rank correlation'],
        correctIndex: 0,
        explanation: 'The Hansen-Hurwitz technique provides an unbiased estimator in the presence of non-response through second-phase sampling.',
        difficulty: 'hard',
      },
    ],
  });

  console.log(`✅ Seeded 3 competency quizzes`);

  // --- Seed Quiz Attempts for officer ---
  await QuizAttempt.create([
    {
      officer: officer._id,
      quiz: qInference._id,
      answers: [
        { questionId: qInference.questions[0]._id, selectedIndex: 1, isCorrect: true },
        { questionId: qInference.questions[1]._id, selectedIndex: 1, isCorrect: true },
        { questionId: qInference.questions[2]._id, selectedIndex: 0, isCorrect: true },
      ],
      score: 100,
      totalQuestions: 3,
      correctCount: 3,
    },
    {
      officer: officer._id,
      quiz: qSampling._id,
      answers: [
        { questionId: qSampling.questions[0]._id, selectedIndex: 1, isCorrect: true },
        { questionId: qSampling.questions[1]._id, selectedIndex: 0, isCorrect: true },
        { questionId: qSampling.questions[2]._id, selectedIndex: 1, isCorrect: false },
      ],
      score: 67,
      totalQuestions: 3,
      correctCount: 2,
    },
  ]);

  console.log(`✅ Seeded 2 past quiz attempts for officer`);

  console.log('\n🎉 Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
