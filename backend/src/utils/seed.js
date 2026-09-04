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

const skills = [
  { name: 'Statistical Data Analysis', category: 'Technical', description: 'Ability to analyze large datasets using statistical methods.' },
  { name: 'Survey Design & Methodology', category: 'Technical', description: 'Designing and conducting statistical surveys.' },
  { name: 'Data Visualization', category: 'Technical', description: 'Creating charts, dashboards, and visual reports.' },
  { name: 'R Programming', category: 'Technical', description: 'Using R for statistical computing.' },
  { name: 'Python for Data Science', category: 'Technical', description: 'Using Python (Pandas, NumPy, Scikit-learn) for data work.' },
  { name: 'Database Management (SQL)', category: 'Digital', description: 'Writing SQL queries and managing relational databases.' },
  { name: 'National Accounts & GDP Estimation', category: 'Domain', description: 'Understanding national income accounting frameworks.' },
  { name: 'Consumer Price Index Methodology', category: 'Domain', description: 'CPI computation, weighting, and base-year revision.' },
  { name: 'Census Operations', category: 'Domain', description: 'Planning and executing population / economic censuses.' },
  { name: 'Sampling Theory', category: 'Analytical', description: 'Probability sampling, stratification, and estimation.' },
  { name: 'Time Series Forecasting', category: 'Analytical', description: 'ARIMA, exponential smoothing, and trend analysis.' },
  { name: 'Machine Learning Basics', category: 'Analytical', description: 'Supervised / unsupervised learning fundamentals.' },
  { name: 'Report Writing', category: 'Communication', description: 'Drafting clear statistical reports for policymakers.' },
  { name: 'Presentation Skills', category: 'Communication', description: 'Presenting findings to stakeholders effectively.' },
  { name: 'Team Leadership', category: 'Managerial', description: 'Leading and mentoring statistical teams.' },
  { name: 'Project Management', category: 'Managerial', description: 'Planning, scheduling, and monitoring statistical projects.' },
  { name: 'GIS & Geospatial Analysis', category: 'Digital', description: 'Using geographic information systems for spatial data.' },
  { name: 'Data Privacy & Ethics', category: 'Domain', description: 'Ensuring data confidentiality and ethical use of statistics.' },
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
    { title: 'Introduction to Statistical Methods', type: 'course', source: 'igot', skills: [skillMap['Statistical Data Analysis'], skillMap['Sampling Theory']], durationMinutes: 120, difficulty: 'beginner' },
    { title: 'Survey Design Best Practices', type: 'article', source: 'internal', skills: [skillMap['Survey Design & Methodology']], durationMinutes: 30, difficulty: 'intermediate' },
    { title: 'Data Visualization with Python & R', type: 'course', source: 'igot', skills: [skillMap['Data Visualization'], skillMap['R Programming'], skillMap['Python for Data Science']], durationMinutes: 180, difficulty: 'intermediate' },
    { title: 'SQL for Government Data Systems', type: 'module', source: 'internal', skills: [skillMap['Database Management (SQL)']], durationMinutes: 90, difficulty: 'beginner' },
    { title: 'National Accounts: GDP Estimation Methods', type: 'course', source: 'igot', skills: [skillMap['National Accounts & GDP Estimation']], durationMinutes: 240, difficulty: 'advanced' },
    { title: 'CPI Compilation Manual', type: 'document', source: 'internal', skills: [skillMap['Consumer Price Index Methodology']], durationMinutes: 60, difficulty: 'advanced' },
    { title: 'Census Planning & Execution Handbook', type: 'document', source: 'internal', skills: [skillMap['Census Operations']], durationMinutes: 45, difficulty: 'intermediate' },
    { title: 'Time Series Analysis with ARIMA', type: 'course', source: 'igot', skills: [skillMap['Time Series Forecasting']], durationMinutes: 150, difficulty: 'intermediate' },
    { title: 'Machine Learning Foundations', type: 'course', source: 'external', skills: [skillMap['Machine Learning Basics']], durationMinutes: 300, difficulty: 'beginner' },
    { title: 'Effective Report Writing for Policymakers', type: 'module', source: 'internal', skills: [skillMap['Report Writing']], durationMinutes: 60, difficulty: 'beginner' },
    { title: 'GIS Fundamentals for Statisticians', type: 'course', source: 'igot', skills: [skillMap['GIS & Geospatial Analysis']], durationMinutes: 120, difficulty: 'intermediate' },
    { title: 'Data Privacy Regulations in India', type: 'article', source: 'internal', skills: [skillMap['Data Privacy & Ethics']], durationMinutes: 20, difficulty: 'beginner' },
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
  });

  console.log(`✅ Created officer: ${officer.email} (password: officer123)`);

  console.log('\n🎉 Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
