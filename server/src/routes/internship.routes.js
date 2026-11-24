const router = require('express').Router();
const {
  listInternships,
  getInternship,
  createInternship,
  updateInternship,
  deleteInternship,
} = require('../controllers/internship.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createInternshipRules,
  updateInternshipRules,
  listInternshipRules,
} = require('../utils/validators');

// Public: browse & search
router.get('/', validate(listInternshipRules), listInternships);
router.get('/:id', getInternship);

// Admin: CRUD
router.post('/', protect, authorize('admin'), validate(createInternshipRules), createInternship);
router.put('/:id', protect, authorize('admin'), validate(updateInternshipRules), updateInternship);
router.delete('/:id', protect, authorize('admin'), deleteInternship);

module.exports = router;
