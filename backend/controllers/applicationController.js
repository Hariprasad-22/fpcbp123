const asyncHandler = require('express-async-handler');
const Application = require('../models/Application.model');
const upload = require('../utils/fileUpload');

// @desc    Get all applications (admin)
const getApplications = asyncHandler(async (req, res) => {
    const requiredFields = [
        'studentInfo', 
        'companyInfo', 
        'internshipDuration'
      ];
  const applications = await Application.find({})
    .populate('student', 'fullName email rollNumber');
  res.json(applications);
});

// @desc    Create new application with file uploads
const createApplication = asyncHandler(async (req, res) => {
  // Handle file uploads
  upload.fields([
    { name: 'offerLetter', maxCount: 1 },
    { name: 'nocByHod', maxCount: 1 },
    { name: 'studentLetterToHod', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const documents = {
        offerLetter: req.files.offerLetter?.[0]?.path,
        nocByHod: req.files.nocByHod?.[0]?.path,
        studentLetterToHod: req.files.studentLetterToHod?.[0]?.path
      };

      const application = new Application({
        student: req.user._id,
        ...req.body,
        documents
      });

      const createdApplication = await application.save();
      res.status(201).json(createdApplication);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

// @desc    Update application status
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  
  if (application) {
    application.status = req.body.status;
    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

// @desc    Download document
const downloadDocument = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const docType = req.params.docType;
  const filePath = application.documents[docType];
  
  if (!filePath) {
    res.status(404);
    throw new Error('Document not found');
  }

  res.download(filePath);
});




module.exports = { 
  createApplication, 
  getApplications, 
  updateApplicationStatus,
  downloadDocument
};