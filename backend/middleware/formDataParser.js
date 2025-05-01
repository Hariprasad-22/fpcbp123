const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Configure and export the multer middleware
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    // Accept all document types for now
    cb(null, true);
  }
});

// JSON parser middleware after file upload
const parseFormJsonFields = (req, res, next) => {
  console.log('Form data received, processing JSON fields');
  
  try {
    // Parse each field that should be JSON
    ['studentInfo', 'companyInfo', 'internshipDuration'].forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
          console.log(`Parsed ${field} successfully:`, req.body[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
        }
      }
    });
    
    next();
  } catch (error) {
    console.error('Error in parseFormJsonFields middleware:', error);
    next(error);
  }
};

// Export all functions
module.exports = { upload, parseFormJsonFields };
