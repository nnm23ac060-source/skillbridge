const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/* ----------------------------- Education sub-doc ----------------------------- */
const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true,
      maxlength: 150,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: 100,
    },
    fieldOfStudy: { type: String, trim: true, maxlength: 100 },
    startYear: { type: Number, min: [1950, 'Invalid start year'], max: [2100, 'Invalid start year'] },
    endYear: { type: Number, min: [1950, 'Invalid end year'], max: [2100, 'Invalid end year'] },
    grade: { type: String, trim: true, maxlength: 50 },
    description: { type: String, trim: true, maxlength: 500 },
  },
  { _id: true }
);

/* --------------------------------- User schema -------------------------------- */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: 'Role must be student or admin',
      },
      default: 'student',
    },

    /* ---- Profile fields ---- */
    education: {
      type: [educationSchema],
      default: [],
      validate: [(v) => v.length <= 10, 'At most 10 education entries are allowed'],
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (v) =>
          Array.isArray(v) &&
          v.length <= 30 &&
          v.every((s) => typeof s === 'string' && s.trim().length > 0 && s.length <= 50),
        message: 'Skills must be 1-50 characters each (max 30 skills)',
      },
      set: (v) => (Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : v),
    },
    linkedin: { type: String, trim: true, default: '', maxlength: 300 },
    github: { type: String, trim: true, default: '', maxlength: 300 },
    portfolio: { type: String, trim: true, default: '', maxlength: 300 },
    resume: { type: String, trim: true, default: '', maxlength: 500 },
  },
  {
    timestamps: true, // provides createdAt (created date) & updatedAt
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

/* --------------------------- Password hashing hook --------------------------- */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/** Compare a candidate password with the stored hash */
userSchema.methods.matchPassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/** How complete the public profile is (0-100), used by the dashboard */
userSchema.methods.profileCompleteness = function () {
  const checks = [
    !!this.name,
    !!this.email,
    this.education.length > 0,
    this.skills.length > 0,
    !!this.linkedin,
    !!this.github,
    !!this.portfolio,
    !!this.resume,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

module.exports = mongoose.model('User', userSchema);
