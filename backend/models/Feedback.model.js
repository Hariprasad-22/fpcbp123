const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5 },
  skills: [String],
  experience: String,
  feedback: String
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);