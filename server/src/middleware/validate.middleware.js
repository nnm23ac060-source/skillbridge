const { validationResult } = require('express-validator');

/**
 * validate — runs express-validator rule chains and returns a
 * consistent 400 payload: { success:false, message, errors:[{field,msg}] }
 */
const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.array().map((e) => ({
        field: e.path || e.param,
        msg: e.msg,
      })),
    });
  },
];

module.exports = validate;
