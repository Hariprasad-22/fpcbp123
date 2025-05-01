const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'], 
    default: 'pending' 
  },
  studentInfo: {
    fullName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    course: { type: String, required: true },
    branch: { type: String, required: true },
    year: { type: String, required: true },
    semester: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    academicYear: { type: String, required: true }
  },
  companyInfo: {
    companyName: { type: String, required: true },
    roleOffered: { type: String, required: true },
    stipend: { type: String, required: true },
    duration: { type: String, required: true },
    internshipYear: { type: String },
    hrName: { type: String, required: true },
    hrMobile: { type: String, required: true },
    hrEmail: { type: String, required: true }
  },
  internshipDuration: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  documents: {
    offerLetter: { type: String },
    nocByHod: { type: String },
    studentLetterToHod: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);