const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { profileUpdateRules } = require('../utils/validators');

router.get('/me', protect, getProfile);
router.put('/me', protect, validate(profileUpdateRules), updateProfile);

module.exports = router;
