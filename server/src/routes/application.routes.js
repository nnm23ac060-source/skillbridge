const router = require('express').Router();
const {
  apply,
  myApplications,
  getMyApplication,
  listAllApplications,
  updateStatus,
  adminStats,
} = require('../controllers/application.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { applyRules, statusUpdateRules } = require('../utils/validators');

/* ------------------------------ Student routes ------------------------------ */
router.post('/', protect, authorize('student'), validate(applyRules), apply);
router.get('/my', protect, authorize('student'), myApplications);
router.get('/my/:id', protect, authorize('student'), getMyApplication);

/* ------------------------------- Admin routes ------------------------------- */
router.get('/admin/stats', protect, authorize('admin'), adminStats);
router.get('/', protect, authorize('admin'), listAllApplications);
router.patch('/:id/status', protect, authorize('admin'), validate(statusUpdateRules), updateStatus);

module.exports = router;
