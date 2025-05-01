const { check, validationResult } = require('express-validator');

// Application validation
const validateApplication = [
  check('studentInfo.fullName').notEmpty().withMessage('Full name is required'),
  check('studentInfo.rollNumber').notEmpty().withMessage('Roll number is required'),
  check('studentInfo.course').notEmpty().withMessage('Course is required'),
  check('companyInfo.companyName').notEmpty().withMessage('Company name is required'),
  check('companyInfo.roleOffered').notEmpty().withMessage('Role is required'),
  check('internshipDuration.startDate').isISO8601().toDate(),
  check('internshipDuration.endDate').isISO8601().toDate(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Status update validation
const validateStatusUpdate = [
  check('status')
    .isIn(['pending', 'approved', 'rejected', 'completed'])
    .withMessage('Invalid status value'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateApplication, validateStatusUpdate };