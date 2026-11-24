const { body, query } = require('express-validator');
const { CATEGORIES, WORK_MODES } = require('../models/Internship');

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ------------------------------- Auth validators ------------------------------- */
const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain a letter')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/* ---------------------------- Profile validators ---------------------------- */
const profileUpdateRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('skills')
    .optional()
    .isArray({ max: 30 })
    .withMessage('Skills must be an array of up to 30 items'),
  body('skills.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be 1-50 characters'),
  body('linkedin').optional().trim().isLength({ max: 300 }).withMessage('LinkedIn URL is too long'),
  body('github').optional().trim().isLength({ max: 300 }).withMessage('GitHub URL is too long'),
  body('portfolio').optional().trim().isLength({ max: 300 }).withMessage('Portfolio URL is too long'),
  body('resume').optional().trim().isLength({ max: 500 }).withMessage('Resume URL is too long'),
  body('education').optional().isArray({ max: 10 }).withMessage('Education must be an array'),
];

/* --------------------------- Internship validators --------------------------- */
const createInternshipRules = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
  body('company').trim().notEmpty().withMessage('Company name is required').isLength({ max: 100 }),
  body('description')
    .trim()
    .isLength({ min: 30, max: 5000 })
    .withMessage('Description must be 30-5000 characters'),
  body('category').trim().isIn(CATEGORIES).withMessage('Choose a valid category'),
  body('skills')
    .isArray({ min: 1, max: 20 })
    .withMessage('Provide 1-20 skills'),
  body('skills.*').trim().isLength({ min: 1, max: 50 }).withMessage('Each skill must be 1-50 characters'),
  body('location').trim().notEmpty().withMessage('Location is required').isLength({ max: 100 }),
  body('workMode').trim().isIn(WORK_MODES).withMessage('Work mode must be Remote, On-site or Hybrid'),
  body('stipend').isInt({ min: 0, max: 1000000 }).withMessage('Stipend must be a number between 0 and 1,000,000'),
  body('duration').trim().notEmpty().withMessage('Duration is required').isLength({ max: 60 }),
  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be a valid date')
    .custom((v) => new Date(v).getTime() > Date.now())
    .withMessage('Deadline must be in the future'),
];

const updateInternshipRules = [
  body('title').optional().trim().isLength({ min: 3, max: 120 }),
  body('company').optional().trim().notEmpty().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ min: 30, max: 5000 }),
  body('category').optional().trim().isIn(CATEGORIES),
  body('skills').optional().isArray({ min: 1, max: 20 }),
  body('skills.*').optional().trim().isLength({ min: 1, max: 50 }),
  body('location').optional().trim().notEmpty().isLength({ max: 100 }),
  body('workMode').optional().trim().isIn(WORK_MODES),
  body('stipend').optional().isInt({ min: 0, max: 1000000 }),
  body('duration').optional().trim().notEmpty().isLength({ max: 60 }),
  body('deadline')
    .optional()
    .isISO8601()
    .custom((v) => new Date(v).getTime() > Date.now())
    .withMessage('Deadline must be in the future'),
];

/* ------------------------------- Listing query ------------------------------- */
const listInternshipRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minStipend').optional().isInt({ min: 0 }),
  query('maxStipend').optional().isInt({ min: 0 }),
  query('category').optional().isIn(CATEGORIES),
  query('mode').optional().isIn(WORK_MODES),
];

/* ---------------------------- Application validators ---------------------------- */
const applyRules = [
  body('internshipId').isMongoId().withMessage('Valid internship id is required'),
  body('coverLetter')
    .trim()
    .isLength({ min: 30, max: 5000 })
    .withMessage('Cover letter must be between 30 and 5000 characters'),
  body('resume')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Resume link is too long'),
];

const statusUpdateRules = [
  body('status')
    .isIn(['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'])
    .withMessage('Invalid status value'),
];

module.exports = {
  registerRules,
  loginRules,
  profileUpdateRules,
  createInternshipRules,
  updateInternshipRules,
  listInternshipRules,
  applyRules,
  statusUpdateRules,
  escapeRegex,
};
