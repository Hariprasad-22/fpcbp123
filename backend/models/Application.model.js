const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'], 
    default: 'pending' 
  },
  studentInfo: {
    fullName: String,
    rollNumber: String,
    course: String,
    branch: String,
    year: Number,
    semester: Number,
    email: String,
    mobileNumber: String,
    academicYear: String
  },
  companyInfo: {
    companyName: String,
    roleOffered: String,
    stipend: Number,
    duration: Number,
    internshipYear: String,
    hrName: String,
    hrMobile: String,
    hrEmail: String
  },
  internshipDuration: {
    startDate: Date,
    endDate: Date
  },
  documents: {
    offerLetter: String,
    nocByHod: String,
    studentLetterToHod: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);