/**
 * authorize — role-based access control. Must run after `protect`.
 * Usage: router.get('/x', protect, authorize('admin'), handler)
 */
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — your role (${req.user?.role || 'guest'}) cannot perform this action.`,
      });
    }
    next();
  };

module.exports = { authorize };
