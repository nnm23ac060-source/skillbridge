const Internship = require('../models/Internship');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex } = require('../utils/validators');

/**
 * GET /api/internships
 * Public list with search + filters + pagination + sorting.
 * Query params:
 *   q, location, category, skill, mode, minStipend, maxStipend,
 *   sort (newest | stipend_desc | deadline), page, limit
 */
const listInternships = asyncHandler(async (req, res) => {
  const {
    q,
    location,
    category,
    skill,
    mode,
    minStipend,
    maxStipend,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};

  if (q && String(q).trim()) {
    const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
    filter.$or = [{ title: rx }, { company: rx }, { description: rx }, { skills: rx }];
  }
  if (location && String(location).trim()) {
    filter.location = new RegExp(escapeRegex(String(location).trim()), 'i');
  }
  if (category) filter.category = category;
  if (mode) filter.workMode = mode;
  if (skill && String(skill).trim()) {
    filter.skills = new RegExp(escapeRegex(String(skill).trim()), 'i');
  }
  if (minStipend !== undefined && minStipend !== '') filter.stipend = { ...(filter.stipend || {}), $gte: Number(minStipend) };
  if (maxStipend !== undefined && maxStipend !== '') filter.stipend = { ...(filter.stipend || {}), $lte: Number(maxStipend) };

  const sortMap = {
    newest: { createdAt: -1 },
    deadline: { deadline: 1 },
    stipend_desc: { stipend: -1 },
  };
  const sortSpec = sortMap[sort] || sortMap.newest;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

  const [total, internships] = await Promise.all([
    Internship.countDocuments(filter),
    Internship.find(filter)
      .sort(sortSpec)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('createdBy', 'name email'),
  ]);

  res.json({
    success: true,
    data: {
      internships,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
      limit: limitNum,
    },
  });
});

/**
 * GET /api/internships/:id — public detail view
 */
const getInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id).populate('createdBy', 'name email');
  if (!internship) {
    return res.status(404).json({ success: false, message: 'Internship not found' });
  }
  res.json({ success: true, data: { internship } });
});

/**
 * POST /api/internships — admin only
 */
const createInternship = asyncHandler(async (req, res) => {
  const { title, company, description, category, skills, location, workMode, stipend, duration, deadline } =
    req.body;

  const internship = await Internship.create({
    title,
    company,
    description,
    category,
    skills,
    location,
    workMode,
    stipend,
    duration,
    deadline,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Internship created successfully',
    data: { internship },
  });
});

/**
 * PUT /api/internships/:id — admin only (partial update)
 */
const updateInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    return res.status(404).json({ success: false, message: 'Internship not found' });
  }

  const allowed = [
    'title',
    'company',
    'description',
    'category',
    'skills',
    'location',
    'workMode',
    'stipend',
    'duration',
    'deadline',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) internship[key] = req.body[key];
  }

  await internship.save();
  res.json({
    success: true,
    message: 'Internship updated successfully',
    data: { internship },
  });
});

/**
 * DELETE /api/internships/:id — admin only.
 * Cascades: applications submitted to this internship are removed too.
 */
const deleteInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    return res.status(404).json({ success: false, message: 'Internship not found' });
  }

  const { deletedCount } = await Application.deleteMany({ internship: internship._id });
  await internship.deleteOne();

  res.json({
    success: true,
    message: `Internship deleted${deletedCount ? ` along with ${deletedCount} application(s)` : ''}`,
    data: { deletedApplications: deletedCount },
  });
});

module.exports = {
  listInternships,
  getInternship,
  createInternship,
  updateInternship,
  deleteInternship,
};
