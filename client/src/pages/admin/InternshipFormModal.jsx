import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import api, { getFieldErrors, getErrorMessage } from '../../api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';

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
const MODES = ['Remote', 'On-site', 'Hybrid'];

const EMPTY = {
  title: '',
  company: '',
  description: '',
  category: 'Engineering',
  skills: [],
  location: '',
  workMode: 'On-site',
  stipend: '',
  duration: '',
  deadline: '',
};

const tomorrow = () => {
  const d = new Date(Date.now() + 86400000);
  return d.toISOString().slice(0, 10);
};

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

/**
 * InternshipFormModal — create / edit a listing (admin).
 */
export default function InternshipFormModal({ open, onClose, internship, onSaved }) {
  const editing = !!internship;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSkillInput('');
    if (internship) {
      setForm({
        title: internship.title || '',
        company: internship.company || '',
        description: internship.description || '',
        category: internship.category || 'Engineering',
        skills: [...(internship.skills || [])],
        location: internship.location || '',
        workMode: internship.workMode || 'On-site',
        stipend: internship.stipend ?? '',
        duration: internship.duration || '',
        deadline: toDateInput(internship.deadline),
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, internship]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (form.skills.some((x) => x.toLowerCase() === s.toLowerCase()))
      return toast.error('Skill already added');
    if (form.skills.length >= 20) return toast.error('Maximum 20 skills');
    setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput('');
  };
  const removeSkill = (s) => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!form.company.trim()) e.company = 'Company name is required';
    if (form.description.trim().length < 30)
      e.description = `Description must be at least 30 characters (${form.description.trim().length} now)`;
    if (!form.location.trim()) e.location = 'Location is required';
    if (form.skills.length === 0) e.skills = 'Add at least one skill';
    if (form.stipend === '' || Number(form.stipend) < 0) e.stipend = 'Enter a valid stipend';
    if (!form.duration.trim()) e.duration = 'Duration is required (e.g. 6 months)';
    if (!form.deadline) e.deadline = 'Deadline is required';
    else if (new Date(form.deadline).getTime() <= Date.now()) e.deadline = 'Deadline must be in the future';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        company: form.company.trim(),
        description: form.description.trim(),
        category: form.category,
        skills: form.skills,
        location: form.location.trim(),
        workMode: form.workMode,
        stipend: Number(form.stipend),
        duration: form.duration.trim(),
        deadline: new Date(`${form.deadline}T23:59:59`).toISOString(),
      };
      const { data } = editing
        ? await api.put(`/internships/${internship._id}`, payload)
        : await api.post('/internships', payload);
      toast.success(data.message);
      onSaved?.(data.data.internship, editing ? 'updated' : 'created');
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      toast.error(getErrorMessage(err, 'Could not save internship'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Edit internship' : 'Create internship'}
      subtitle={editing ? internship.title : 'Publish a new opportunity for students'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="ix-form" loading={submitting}>
            {editing ? 'Save changes' : 'Publish internship'}
          </Button>
        </>
      }
    >
      <form id="ix-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title"
            name="title"
            placeholder="Frontend Engineering Intern"
            value={form.title}
            onChange={set('title')}
            error={errors.title}
            required
          />
          <Input
            label="Company"
            name="company"
            placeholder="NovaLabs Technologies"
            value={form.company}
            onChange={set('company')}
            error={errors.company}
            required
          />
        </div>

        <Textarea
          label="Description"
          name="description"
          rows={5}
          maxLength={5000}
          showCount
          placeholder="What will the intern do? Responsibilities, team, learning outcomes…"
          value={form.description}
          onChange={set('description')}
          error={errors.description}
          hint="Minimum 30 characters — students read this first."
          required
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={set('category')}
            error={errors.category}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            label="Location"
            name="location"
            placeholder="Bengaluru"
            value={form.location}
            onChange={set('location')}
            error={errors.location}
            required
          />
          <Select label="Work mode" name="workMode" value={form.workMode} onChange={set('workMode')}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Stipend (₹ / month)"
            name="stipend"
            type="number"
            min="0"
            placeholder="25000"
            value={form.stipend}
            onChange={set('stipend')}
            error={errors.stipend}
            required
          />
          <Input
            label="Duration"
            name="duration"
            placeholder="6 months"
            value={form.duration}
            onChange={set('duration')}
            error={errors.duration}
            required
          />
          <Input
            label="Application deadline"
            name="deadline"
            type="date"
            min={tomorrow()}
            value={form.deadline}
            onChange={set('deadline')}
            error={errors.deadline}
            required
          />
        </div>

        {/* Skills */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Required skills<span className="ml-0.5 text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              name="ix-skill"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and press Enter"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
            <Button type="button" variant="secondary" onClick={addSkill}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {errors.skills ? (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.skills}</p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-500">e.g. React, JavaScript, Git</p>
          )}
          {form.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="rounded p-0.5 text-brand-400 transition hover:bg-brand-100 hover:text-brand-800"
                    aria-label={`Remove ${s}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
