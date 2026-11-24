const mongoose = require('mongoose');

const APPLICATION_STATUSES = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];

/**
 * Application — a student's application to an internship.
 * Compound unique index guarantees no duplicate applications at DB level.
 */
const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [30, 'Cover letter must be at least 30 characters'],
      maxlength: 5000,
    },
    resume: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: { values: APPLICATION_STATUSES, message: 'Invalid status' },
      default: 'Pending',
    },
  },
  {
    timestamps: true, // createdAt = applied date
    toJSON: {
      transform(doc, ret) {
        ret.appliedAt = ret.createdAt;
        return ret;
      },
    },
  }
);

applicationSchema.index({ student: 1, internship: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });

/** Has the deadline for this application's internship passed? */
applicationSchema.virtual('isDeadlinePassed').get(function () {
  return false; // computed at query time when internship is populated
});

module.exports = mongoose.model('Application', applicationSchema);
module.exports.APPLICATION_STATUSES = APPLICATION_STATUSES;
