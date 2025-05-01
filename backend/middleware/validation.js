const { check, validationResult } = require('express-validator');

// Preprocessing middleware to handle JSON strings in form data
const preprocessFormData = (req, res, next) => {
  console.log('Original request body:', req.body);
  
  // Parse JSON strings if they exist
  ['studentInfo', 'companyInfo', 'internshipDuration'].forEach(field => {
    if (typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        console.error(`Error parsing ${field}:`, e);
      }
    }
  });
  
  console.log('Preprocessed request body:', req.body);
  next();
};

// Application validation
const validateApplication = [
  // First preprocess the form data
  preprocessFormData,
  
  // Student info validations
  check('studentInfo.fullName').notEmpty().withMessage('Full name is required'),
  check('studentInfo.rollNumber').notEmpty().withMessage('Roll number is required'),
  check('studentInfo.course').notEmpty().withMessage('Course is required'),
  check('studentInfo.branch').notEmpty().withMessage('Branch is required'),
  check('studentInfo.year').notEmpty().withMessage('Year is required'),
  check('studentInfo.semester').notEmpty().withMessage('Semester is required'),
  check('studentInfo.email').isEmail().withMessage('Valid email is required'),
  check('studentInfo.mobileNumber').notEmpty().withMessage('Mobile number is required'),
  check('studentInfo.academicYear').notEmpty().withMessage('Academic year is required'),
  
  // Company info validations
  check('companyInfo.companyName').notEmpty().withMessage('Company name is required'),
  check('companyInfo.roleOffered').notEmpty().withMessage('Role is required'),
  check('companyInfo.stipend').notEmpty().withMessage('Stipend is required'),
  check('companyInfo.duration').notEmpty().withMessage('Duration is required'),
  check('companyInfo.hrName').notEmpty().withMessage('HR name is required'),
  check('companyInfo.hrMobile').notEmpty().withMessage('HR mobile is required'),
  check('companyInfo.hrEmail').isEmail().withMessage('Valid HR email is required'),
  
  // Internship duration validations
  check('internshipDuration.startDate').optional().isISO8601().toDate().withMessage('Valid start date is required'),
  check('internshipDuration.endDate').optional().isISO8601().toDate().withMessage('Valid end date is required'),
  
  // Process validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Log the validated body for debugging
    console.log('Validated request body:', {
      studentInfo: req.body.studentInfo,
      companyInfo: req.body.companyInfo,
      internshipDuration: req.body.internshipDuration
    });
    
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