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
const upload = require('../utils/fileUpload');

// router.post(
//   '/',
//   protect,
//   upload.fields([
//     { name: 'offerLetter', maxCount: 1 },
//     { name: 'nocByHod', maxCount: 1 },
//     { name: 'studentLetterToHod', maxCount: 1 }
//   ]),
//   validateApplication,
//   createApplication
// );

router.get('/', protect, admin, getApplications);

router.route('/:id/status')
  .put(protect, admin, validateStatusUpdate, updateApplicationStatus);

router.route('/:id/documents/:docType')
  .get(protect, downloadDocument);

module.exports = router;
