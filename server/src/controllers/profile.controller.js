const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/profile/me — full profile of the logged-in user.
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    data: {
      user: {
        ...user.toJSON(),
        profileCompleteness: user.profileCompleteness(),
      },
    },
  });
});

/**
 * PUT /api/profile/me — update own profile.
 * Editable: name, email, education, skills, links, resume.
 * NOT editable here: role, password (auth concern), admin fields.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const allowed = ['name', 'email', 'education', 'skills', 'linkedin', 'github', 'portfolio', 'resume'];

  // Email uniqueness (case-insensitive)
  if (req.body.email !== undefined && req.body.email.toLowerCase() !== user.email) {
    const taken = await User.exists({
      email: String(req.body.email).toLowerCase(),
      _id: { $ne: user._id },
    });
    if (taken) {
      return res.status(409).json({
        success: false,
        message: 'That email is already in use by another account',
        errors: [{ field: 'email', msg: 'Email already in use' }],
      });
    }
  }

  // Education: require core fields on every provided entry
  if (Array.isArray(req.body.education)) {
    for (const [i, entry] of req.body.education.entries()) {
      if (!entry || !String(entry.institution || '').trim() || !String(entry.degree || '').trim()) {
        return res.status(400).json({
          success: false,
          message: 'Each education entry needs an institution and a degree',
          errors: [{ field: `education.${i}`, msg: 'Institution and degree are required' }],
        });
      }
      // Sanitize numeric years
      if (entry.startYear !== undefined && entry.startYear !== null && entry.startYear !== '') {
        entry.startYear = Number(entry.startYear);
        if (!Number.isInteger(entry.startYear) || entry.startYear < 1950 || entry.startYear > 2100) {
          return res.status(400).json({
            success: false,
            message: 'Invalid education start year',
            errors: [{ field: `education.${i}.startYear`, msg: 'Year must be between 1950 and 2100' }],
          });
        }
      } else {
        entry.startYear = undefined;
      }
      if (entry.endYear !== undefined && entry.endYear !== null && entry.endYear !== '') {
        entry.endYear = Number(entry.endYear);
        if (!Number.isInteger(entry.endYear) || entry.endYear < 1950 || entry.endYear > 2100) {
          return res.status(400).json({
            success: false,
            message: 'Invalid education end year',
            errors: [{ field: `education.${i}.endYear`, msg: 'Year must be between 1950 and 2100' }],
          });
        }
      } else {
        entry.endYear = undefined;
      }
    }
  }

  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }

  await user.save(); // triggers password-hash hook only if password modified (it isn't)

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        ...user.toJSON(),
        profileCompleteness: user.profileCompleteness(),
      },
    },
  });
});

module.exports = { getProfile, updateProfile };
