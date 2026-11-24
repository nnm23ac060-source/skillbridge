const mongoose = require('mongoose');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex } = require('../utils/validators');

const POPULATE_INTERNSHIP =
  'title company location workMode stipend duration deadline category skills';

/**
 * POST /api/applications  (student)
 * Apply to an internship — rejects duplicates, missing resume and
 * expired deadlines. The DB unique index is the final safety net.
 */
const apply = asyncHandler(async (req, res) => {
  const { internshipId, coverLetter, resume } = req.body;

  const internship = await Internship.findById(internshipId);
  if (!internship) {
    return res.status(404).json({ success: false, message: 'Internship not found' });
  }

  if (internship.deadline.getTime() < Date.now()) {
    return res.status(400).json({
      success: false,
      message: 'The application deadline for this internship has passed.',
      errors: [{ field: 'internshipId', msg: 'Deadline passed' }],
    });
  }

  const existing = await Application.findOne({
    student: req.user._id,
    internship: internship._id,
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'You have already applied to this internship.',
      errors: [{ field: 'internshipId', msg: 'Already applied' }],
    });
  }

  const resumeLink = (resume && resume.trim()) || req.user.resume || '';
  if (!resumeLink) {
    return res.status(400).json({
      success: false,
      message: 'Add a resume link to your application (or to your profile) first.',
      errors: [{ field: 'resume', msg: 'Resume link required' }],
    });
  }

  const application = await Application.create({
    student: req.user._id,
    internship: internship._id,
    coverLetter,
    resume: resumeLink,
    status: 'Pending',
  });

  const populated = await application.populate('internship', POPULATE_INTERNSHIP);

  res.status(201).json({
    success: true,
    message: `Application submitted to ${internship.company} 🎉`,
    data: { application: populated },
  });
});

/**
 * GET /api/applications/my  (student)
 * Optional query: status, internshipId, q (title/company search), page, limit.
 * Student lists are small by nature — populate + in-memory search keeps
 * title/company filtering correct without aggregations.
 */
const myApplications = asyncHandler(async (req, res) => {
  const { status, internshipId, q, page = 1, limit = 50 } = req.query;

  const filter = { student: req.user._id };
  if (status) filter.status = status;
  if (internshipId) filter.internship = internshipId;

  let apps = await Application.find(filter)
    .sort({ createdAt: -1 })
    .populate('internship', POPULATE_INTERNSHIP);

  // Guard: internship deleted → keep the row visible but shaped safely
  apps = apps.filter((a) => a.internship);

  if (q && String(q).trim()) {
    const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
    apps = apps.filter((a) => rx.test(a.internship.title) || rx.test(a.internship.company));
  }

  const total = apps.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 50);
  const start = (pageNum - 1) * limitNum;
  const paged = apps.slice(start, start + limitNum);

  // Status summary (used by My Applications + dashboard)
  const summary = {
    total: total,
    Pending: 0,
    'Under Review': 0,
    Shortlisted: 0,
    Accepted: 0,
    Rejected: 0,
  };
  apps.forEach((a) => {
    summary[a.status] = (summary[a.status] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      applications: paged,
      summary,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    },
  });
});

/**
 * GET /api/applications/my/:id  (student — must own the application)
 */
const getMyApplication = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid application id' });
  }
  const application = await Application.findOne({
    _id: req.params.id,
    student: req.user._id,
  })
    .populate('internship', POPULATE_INTERNSHIP)
    .populate('student', 'name email skills education resume linkedin github portfolio');

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }
  res.json({ success: true, data: { application } });
});

/**
 * GET /api/applications  (admin)
 * Filters: status, internshipId, q (student name/email or internship title/company)
 */
const listAllApplications = asyncHandler(async (req, res) => {
  const { status, internshipId, q, page = 1, limit = 20, sort = 'newest' } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (internshipId) filter.internship = internshipId;

  const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 } };

  let apps = await Application.find(filter)
    .sort(sortMap[sort] || sortMap.newest)
    .populate('internship', POPULATE_INTERNSHIP)
    .populate('student', 'name email skills education resume linkedin github portfolio role');

  if (q && String(q).trim()) {
    const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
    apps = apps.filter(
      (a) =>
        (a.student && (rx.test(a.student.name) || rx.test(a.student.email))) ||
        (a.internship && (rx.test(a.internship.title) || rx.test(a.internship.company)))
    );
  }

  const total = apps.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const start = (pageNum - 1) * limitNum;
  const paged = apps.slice(start, start + limitNum);

  const summary = {
    total,
    Pending: 0,
    'Under Review': 0,
    Shortlisted: 0,
    Accepted: 0,
    Rejected: 0,
  };
  apps.forEach((a) => {
    summary[a.status] = (summary[a.status] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      applications: paged,
      summary,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
      limit: limitNum,
    },
  });
});

/**
 * PATCH /api/applications/:id/status  (admin)
 * Pending → Under Review → Shortlisted → Accepted / Rejected
 */
const updateStatus = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid application id' });
  }

  const application = await Application.findById(req.params.id)
    .populate('internship', POPULATE_INTERNSHIP)
    .populate('student', 'name email');

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  application.status = req.body.status;
  await application.save();

  res.json({
    success: true,
    message: `Application marked as ${application.status}`,
    data: { application },
  });
});

/**
 * GET /api/applications/admin/stats  (admin)
 * Live dashboard statistics (registered before /:id routes).
 */
const adminStats = asyncHandler(async (req, res) => {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [students, internships, applications, pending, underReview, shortlisted, accepted, rejected, recent, applicationsByInternship] =
    await Promise.all([
      User.countDocuments({ role: 'student' }),
      Internship.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Pending' }),
      Application.countDocuments({ status: 'Under Review' }),
      Application.countDocuments({ status: 'Shortlisted' }),
      Application.countDocuments({ status: 'Accepted' }),
      Application.countDocuments({ status: 'Rejected' }),
      Application.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('student', 'name email')
        .populate('internship', 'title company'),
      Application.aggregate([
        { $group: { _id: '$internship', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'internships',
            localField: '_id',
            foreignField: '_id',
            as: 'ix',
          },
        },
        { $unwind: { path: '$ix', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            internshipId: '$_id',
            title: '$ix.title',
            company: '$ix.company',
            count: 1,
          },
        },
      ]),
    ]);

  res.json({
    success: true,
    data: {
      totals: { students, internships, applications },
      statusCounts: { Pending: pending, 'Under Review': underReview, Shortlisted: shortlisted, Accepted: accepted, Rejected: rejected },
      recentApplications: recent,
      topInternships: applicationsByInternship.filter((x) => x.title),
      last24h: await Application.countDocuments({ createdAt: { $gte: dayAgo } }),
    },
  });
});

module.exports = {
  apply,
  myApplications,
  getMyApplication,
  listAllApplications,
  updateStatus,
  adminStats,
};
