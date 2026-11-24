/**
 * Seed script (idempotent — safe to run repeatedly).
 *
 *   npm run seed          from server/
 *
 * Creates:
 *   1. Admin account            admin@skillbridge.dev / Admin@123
 *   2. SAMPLE internship listings  ← clearly marked demonstration data,
 *      used to demo search/filters/dashboard. Real admins can edit or
 *      delete every one of these from the Admin panel.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Internship = require('../models/Internship');

const ADMIN = {
  name: 'Platform Admin',
  email: (process.env.ADMIN_EMAIL || 'admin@skillbridge.dev').toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  role: 'admin',
};

/* --------------------- SAMPLE DATA (demonstration only) ---------------------- */
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

const SAMPLE_INTERNSHIPS = [
  {
    title: 'Frontend Engineering Intern',
    company: 'NovaLabs Technologies',
    description:
      'Work with our product team to build customer-facing dashboards in React. You will own features end-to-end — from Figma handoff to production release — write clean, tested components and ship UI used by thousands of users every day. Great fit for someone who cares deeply about performance, accessibility and polish.',
    category: 'Engineering',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Git'],
    location: 'Bengaluru',
    workMode: 'Hybrid',
    stipend: 25000,
    duration: '6 months',
    deadline: daysFromNow(21),
  },
  {
    title: 'Backend Development Intern',
    company: 'Cloudwick Solutions',
    description:
      'Join our platform team to design and build REST APIs with Node.js and Express, model data in MongoDB and keep services observable in production. You will participate in code reviews, write integration tests and learn how a small team runs a high-traffic SaaS backend.',
    category: 'Engineering',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
    location: 'Pune',
    workMode: 'On-site',
    stipend: 30000,
    duration: '6 months',
    deadline: daysFromNow(18),
  },
  {
    title: 'Data Science Intern',
    company: 'Analytica Labs',
    description:
      'Explore real-world datasets, build predictive models and communicate insights to product managers. Interns work closely with senior data scientists on feature engineering, model evaluation and dashboarding. Comfort with Python and statistics is essential; prior ML project experience is a big plus.',
    category: 'Data Science',
    skills: ['Python', 'Pandas', 'SQL', 'Machine Learning'],
    location: 'Hyderabad',
    workMode: 'Hybrid',
    stipend: 32000,
    duration: '4 months',
    deadline: daysFromNow(25),
  },
  {
    title: 'UI/UX Design Intern',
    company: 'PixelForge Studio',
    description:
      'Design delightful experiences for mobile and web products from research to hi-fi prototypes. You will run user interviews, map journeys, build Figma component libraries and collaborate daily with engineers. Portfolio of previous work is required.',
    category: 'Design',
    skills: ['Figma', 'Prototyping', 'User Research'],
    location: 'Remote',
    workMode: 'Remote',
    stipend: 20000,
    duration: '3 months',
    deadline: daysFromNow(30),
  },
  {
    title: 'Digital Marketing Intern',
    company: 'GrowthWave',
    description:
      'Help plan and execute growth campaigns across SEO, email and social channels. You will run A/B tests, write conversion-focused copy, track funnels in analytics tools and present weekly learnings to the growth team.',
    category: 'Marketing',
    skills: ['SEO', 'Content Writing', 'Social Media'],
    location: 'Mumbai',
    workMode: 'On-site',
    stipend: 15000,
    duration: '3 months',
    deadline: daysFromNow(12),
  },
  {
    title: 'Full Stack Development Intern',
    company: 'ByteCraft Software',
    description:
      'Build features across our MERN stack product — React interfaces, Express endpoints and MongoDB schemas. Interns ship production code from week one with mentor support, participate in stand-ups and own a small project through to launch.',
    category: 'Engineering',
    skills: ['React', 'Node.js', 'MongoDB', 'Git'],
    location: 'Chennai',
    workMode: 'Remote',
    stipend: 28000,
    duration: '6 months',
    deadline: daysFromNow(20),
  },
  {
    title: 'Cybersecurity Intern',
    company: 'SecureNest',
    description:
      'Assist the security team with vulnerability assessments, network monitoring and hardening of internal systems. You will learn to use industry tooling, document findings and help run periodic security drills under senior guidance.',
    category: 'Engineering',
    skills: ['Networking', 'Linux', 'Wireshark'],
    location: 'Noida',
    workMode: 'Hybrid',
    stipend: 25000,
    duration: '4 months',
    deadline: daysFromNow(28),
  },
  {
    title: 'Financial Analysis Intern',
    company: 'FinEdge Capital',
    description:
      'Support the investments team with financial modeling, market research and reporting. Interns build spreadsheets that feed real decisions, prepare presentation decks and summarize sector trends for weekly reviews.',
    category: 'Finance',
    skills: ['Excel', 'Financial Modeling', 'SQL'],
    location: 'Gurugram',
    workMode: 'On-site',
    stipend: 22000,
    duration: '3 months',
    deadline: daysFromNow(15),
  },
  {
    title: 'HR & Talent Acquisition Intern',
    company: 'PeopleFirst',
    description:
      'Partner with recruiters to source candidates, schedule interviews and improve our hiring pipeline metrics. You will own a campus hiring drive end-to-end and learn modern ATS tools and assessment frameworks.',
    category: 'Human Resources',
    skills: ['Screening', 'Interview Coordination', 'Excel'],
    location: 'Bengaluru',
    workMode: 'Hybrid',
    stipend: 12000,
    duration: '3 months',
    deadline: daysFromNow(14),
  },
  {
    title: 'Quality Assurance Intern',
    company: 'BugTrail QA',
    description:
      'Write and execute test plans for web and mobile releases, automate regression suites with Selenium and file precise bug reports. You will work alongside developers in a fast release cycle and learn modern CI quality gates.',
    category: 'Engineering',
    skills: ['Selenium', 'TestNG', 'JIRA', 'API Testing'],
    location: 'Kochi',
    workMode: 'Remote',
    stipend: 18000,
    duration: '4 months',
    deadline: daysFromNow(24),
  },
];
/* -------------------------------------------------------------------------- */

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    /* --- 1. Admin --- */
    let admin = await User.findOne({ email: ADMIN.email });
    if (admin) {
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log(`Updated "${admin.email}" role → admin`);
      } else {
        console.log(`Admin already exists: ${ADMIN.email}`);
      }
    } else {
      admin = await User.create(ADMIN);
      console.log(`✅ Admin account created: ${ADMIN.email} / ${ADMIN.password}`);
    }

    /* --- 2. SAMPLE internships --- */
    let created = 0;
    let updated = 0;
    for (const sample of SAMPLE_INTERNSHIPS) {
      const existing = await Internship.findOne({ title: sample.title, company: sample.company });
      if (existing) {
        // Keep listings fresh: refresh sample fields, preserve id/audience
        Object.assign(existing, sample, { createdBy: existing.createdBy || admin._id });
        await existing.save();
        updated += 1;
      } else {
        await Internship.create({ ...sample, createdBy: admin._id });
        created += 1;
      }
    }
    console.log(
      `📚 Sample internships — ${created} created, ${updated} refreshed (demonstration data)`
    );

    const [users, internships] = await Promise.all([
      User.countDocuments(),
      Internship.countDocuments(),
    ]);
    console.log(`Totals → users: ${users}, internships: ${internships}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

run();
