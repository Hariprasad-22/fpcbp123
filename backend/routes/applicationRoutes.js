const express = require('express');
const router = express.Router();
const { 
  createApplication,
  getApplications,
  updateApplicationStatus,
  downloadDocument
} = require('../controllers/applicationController');
const { validateApplication, validateStatusUpdate } = require('../middleware/validation');
const { protect, admin } = require('../middleware/auth');
const { upload, parseFormJsonFields } = require('../middleware/formDataParser');

// Create new application with file uploads and improved form data handling
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'offerLetter', maxCount: 1 },
    { name: 'nocByHod', maxCount: 1 },
    { name: 'studentLetterToHod', maxCount: 1 }
  ]),
  parseFormJsonFields, // Parse JSON strings after file upload
  validateApplication, // Validate the parsed data
  createApplication
);

// Get applications for the logged-in student
router.get('/mystudent', protect, async (req, res, next) => {
  req.studentOnly = true;
  next();
}, getApplications);

// Alternative endpoint for student applications
router.get('/student/applications', protect, async (req, res, next) => {
  req.studentOnly = true;
  next();
}, getApplications);

// Get all applications (admin only)
router.get('/', protect, admin, getApplications);

// Update application status
router.route('/:id/status')
  .put(protect, admin, validateStatusUpdate, updateApplicationStatus);

// Download document
router.route('/:id/documents/:docType')
  .get(protect, downloadDocument);

module.exports = router;
