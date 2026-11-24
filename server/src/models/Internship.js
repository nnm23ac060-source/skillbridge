const mongoose = require('mongoose');

const CATEGORIES = [
  'Engineering',
  'Data Science',
  'Design',
  'Marketing',
  'Finance',
  'Human Resources',
  'Operations',
  'Other',
];

const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: 120,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [30, 'Description must be at least 30 characters'],
      maxlength: 5000,
    },
    category: {
      type: String,
      required: true,
      enum: { values: CATEGORIES, message: 'Invalid category' },
      default: 'Other',
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (v) =>
          Array.isArray(v) &&
          v.length > 0 &&
          v.length <= 20 &&
          v.every((s) => typeof s === 'string' && s.trim().length > 0 && s.length <= 50),
        message: 'Provide 1-20 skills (each 1-50 characters)',
      },
      set: (v) => (Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : v),
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 100,
    },
    workMode: {
      type: String,
      required: true,
      enum: { values: WORK_MODES, message: 'Work mode must be Remote, On-site or Hybrid' },
      default: 'On-site',
    },
    stipend: {
      type: Number,
      required: [true, 'Stipend is required'],
      min: [0, 'Stipend cannot be negative'],
      max: [1000000, 'Stipend looks unrealistic'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
      maxlength: 60,
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Filtering indexes
internshipSchema.index({ category: 1, workMode: 1 });
internshipSchema.index({ createdAt: -1 });

/** Is the application deadline in the past? */
internshipSchema.methods.isExpired = function () {
  return this.deadline && this.deadline.getTime() < Date.now();
};

module.exports = mongoose.model('Internship', internshipSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.WORK_MODES = WORK_MODES;
