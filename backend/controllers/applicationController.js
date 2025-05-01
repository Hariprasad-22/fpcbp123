const asyncHandler = require('express-async-handler');
const Application = require('../models/Application.model');
const mongoose = require('mongoose');
const upload = require('../utils/fileUpload');

// @desc    Get all applications (admin)
const getApplications = asyncHandler(async (req, res) => {
    // If studentOnly flag is set, only return applications for the logged-in student
    if (req.studentOnly) {
        const applications = await Application.find({ student: req.user._id })
            .populate('student', 'fullName email rollNumber');
        return res.json(applications);
    }
    
    // Otherwise return all applications (admin access)
    const applications = await Application.find({})
        .populate('student', 'fullName email rollNumber');
    res.json(applications);
});

// @desc    Create new application with file uploads
const createApplication = asyncHandler(async (req, res) => {
  console.log('Creating application with body:', {
    studentInfo: req.body.studentInfo,
    companyInfo: req.body.companyInfo,
    internshipDuration: req.body.internshipDuration
  });
  
  try {
    // Parse JSON strings if they are strings
    let studentInfo = req.body.studentInfo;
    let companyInfo = req.body.companyInfo;
    let internshipDuration = req.body.internshipDuration;
    
    // Check if the data is sent as strings and parse them
    if (typeof studentInfo === 'string') {
      try {
        studentInfo = JSON.parse(studentInfo);
      } catch (e) {
        console.error('Error parsing studentInfo:', e);
      }
    }
    
    if (typeof companyInfo === 'string') {
      try {
        companyInfo = JSON.parse(companyInfo);
      } catch (e) {
        console.error('Error parsing companyInfo:', e);
      }
    }
    
    if (typeof internshipDuration === 'string') {
      try {
        internshipDuration = JSON.parse(internshipDuration);
      } catch (e) {
        console.error('Error parsing internshipDuration:', e);
      }
    }
    
    // Get file paths from the uploaded files
    const documents = {
      offerLetter: req.files?.offerLetter?.[0]?.path || null,
      nocByHod: req.files?.nocByHod?.[0]?.path || null,
      studentLetterToHod: req.files?.studentLetterToHod?.[0]?.path || null
    };
    
    // Ensure we have a valid MongoDB ObjectId for the user
    let studentId;
    
    if (req.user && req.user._id) {
      // Try to use the ID from authentication
      try {
        // Fix: Use 'new' keyword with mongoose.Types.ObjectId constructor
        studentId = new mongoose.Types.ObjectId(req.user._id);
        console.log('Using authenticated user ID:', studentId);
      } catch (error) {
        console.error('Error converting user ID to ObjectId:', error);
        // Create a dummy ObjectId for development testing
        studentId = new mongoose.Types.ObjectId();
        console.log('Created temporary ObjectId for development:', studentId);
      }
    } else {
      console.log('No user ID found in request, using JWT token ID if available');
      
      // Check if there's a decoded token with an ID in the request
      if (req.decoded && req.decoded.id) {
        try {
          studentId = new mongoose.Types.ObjectId(req.decoded.id);
          console.log('Using ID from JWT token:', studentId);
        } catch (error) {
          console.error('Invalid ID in JWT token:', error);
          studentId = new mongoose.Types.ObjectId();
          console.log('Created temporary ObjectId after JWT token failure:', studentId);
        }
      } else {
        // Fallback for development/testing
        studentId = new mongoose.Types.ObjectId();
        console.log('No user identification found, created temporary ObjectId:', studentId);
      }
    }
    
    // Create the application with parsed data
    const application = new Application({
      student: studentId,
      studentInfo,
      companyInfo,
      internshipDuration,
      documents
    });
    
    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
  } catch (error) {
    console.error('Application creation error:', error);
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack 
    });
  }
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