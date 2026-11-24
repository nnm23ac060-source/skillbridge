import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  UserRound,
  Mail,
  GraduationCap,
  Plus,
  Trash2,
  Tag,
  Link as LinkIcon,
  FileText,
  Save,
  ExternalLink,
  CircleCheck,
  Sparkles,
} from 'lucide-react';
import api, { getFieldErrors, getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { GithubIcon, LinkedinIcon } from '../../components/ui/BrandIcons';

const EMPTY_EDU = {
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startYear: '',
  endYear: '',
  grade: '',
  description: '',
};

const blankUser = {
  name: '',
  email: '',
  education: [],
  skills: [],
  linkedin: '',
  github: '',
  portfolio: '',
  resume: '',
};

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState(blankUser);
  const [baseline, setBaseline] = useState(blankUser);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  /* hydrate from auth user */
  useEffect(() => {
    if (!user) return;
    const snapshot = {
      name: user.name || '',
      email: user.email || '',
      education: (user.education || []).map((e) => ({
        ...EMPTY_EDU,
        ...e,
        startYear: e.startYear ?? '',
        endYear: e.endYear ?? '',
      })),
      skills: [...(user.skills || [])],
      linkedin: user.linkedin || '',
      github: user.github || '',
      portfolio: user.portfolio || '',
      resume: user.resume || '',
    };
    setForm(snapshot);
    setBaseline(JSON.parse(JSON.stringify(snapshot)));
    setErrors({});
  }, [user]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(baseline), [form, baseline]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  /* ------------------------------ Education ------------------------------ */
  const setEdu = (i, key, value) => {
    setForm((f) => {
      const education = f.education.map((entry, idx) =>
        idx === i ? { ...entry, [key]: value } : entry
      );
      return { ...f, education };
    });
    setErrors((err) => ({ ...err, [`education.${i}`]: undefined }));
  };
  const addEdu = () =>
    setForm((f) =>
      f.education.length >= 5 ? f : { ...f, education: [...f.education, { ...EMPTY_EDU }] }
    );
  const removeEdu = (i) =>
    setForm((f) => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));

  /* ------------------------------- Skills ------------------------------- */
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (s.length > 50) return toast.error('Skill must be under 50 characters');
    if (form.skills.some((x) => x.toLowerCase() === s.toLowerCase()))
      return toast.error('Skill already added');
    if (form.skills.length >= 30) return toast.error('Maximum 30 skills');
    setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput('');
  };
  const removeSkill = (s) =>
    setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  /* -------------------------------- Save -------------------------------- */
  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    form.education.forEach((entry, i) => {
      if (!entry.institution.trim() || !entry.degree.trim()) {
        e[`education.${i}`] = 'Institution and degree are required';
      }
      if (entry.startYear && (Number(entry.startYear) < 1950 || Number(entry.startYear) > 2100))
        e[`education.${i}.startYear`] = 'Year must be 1950-2100';
      if (entry.endYear && (Number(entry.endYear) < 1950 || Number(entry.endYear) > 2100))
        e[`education.${i}.endYear`] = 'Year must be 1950-2100';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        skills: form.skills,
        linkedin: form.linkedin.trim(),
        github: form.github.trim(),
        portfolio: form.portfolio.trim(),
        resume: form.resume.trim(),
        education: form.education.map((e2) => ({
          institution: e2.institution.trim(),
          degree: e2.degree.trim(),
          fieldOfStudy: (e2.fieldOfStudy || '').trim(),
          startYear: e2.startYear === '' ? undefined : Number(e2.startYear),
          endYear: e2.endYear === '' ? undefined : Number(e2.endYear),
          grade: (e2.grade || '').trim(),
          description: (e2.description || '').trim(),
        })),
      };
      const { data } = await api.put('/profile/me', payload);
      updateUser(data.data.user);
      setBaseline(JSON.parse(JSON.stringify(form)));
      toast.success(data.message || 'Profile updated');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      toast.error(getErrorMessage(err, 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  };

  const sectionSave = (
    <Button type="submit" loading={saving} disabled={!dirty}>
      {!saving && (
        <>
          <Save className="h-4 w-4" />
          Save changes
        </>
      )}
    </Button>
  );

  const linkRows = [
    { key: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, placeholder: 'https://linkedin.com/in/your-handle' },
    { key: 'github', label: 'GitHub', icon: GithubIcon, placeholder: 'https://github.com/your-handle' },
    { key: 'portfolio', label: 'Portfolio', icon: LinkIcon, placeholder: 'https://your-portfolio.dev' },
    { key: 'resume', label: 'Resume link', icon: FileText, placeholder: 'https://drive.google.com/…/resume.pdf' },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ------------------------- Profile header ------------------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-extrabold text-white shadow-soft">
              {(form.name || '?')
                .split(' ')
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join('')}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900">
                  {form.name || 'Your name'}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  <Sparkles className="h-3 w-3" /> Student
                </span>
              </div>
              <p className="truncate text-sm text-slate-500">{form.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${user?.profileCompleteness ?? 0}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {user?.profileCompleteness ?? 0}% complete
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {dirty && (
              <span className="hidden text-xs font-medium text-amber-600 sm:inline">
                Unsaved changes
              </span>
            )}
            {sectionSave}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ------------------------ Basic info ------------------------ */}
        <Card>
          <CardHeader
            title="Basic information"
            subtitle="How recruiters see you on applications"
            action={
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <UserRound className="h-5 w-5" />
              </span>
            }
          />
          <CardBody className="space-y-4">
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              required
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              hint="Used for sign-in and recruiter replies"
              required
            />
          </CardBody>
        </Card>

        {/* ------------------------ Skills ------------------------ */}
        <Card>
          <CardHeader
            title="Skills"
            subtitle={`${form.skills.length}/30 — press Enter or click Add`}
            action={
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Tag className="h-5 w-5" />
              </span>
            }
          />
          <CardBody>
            <div className="flex gap-2">
              <input
                name="skill-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="e.g. React"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
              <Button variant="secondary" onClick={addSkill} type="button">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            {form.skills.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-400">
                No skills yet — add at least 3 to strengthen your profile.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
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
          </CardBody>
        </Card>
      </div>

      {/* ------------------------ Education ------------------------ */}
      <Card>
        <CardHeader
          title="Education"
          subtitle="Your most recent qualifications first"
          action={
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <GraduationCap className="h-5 w-5" />
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addEdu}
                disabled={form.education.length >= 5}
              >
                <Plus className="h-4 w-4" />
                Add education
              </Button>
            </div>
          }
        />
        <CardBody className="pt-3">
          {form.education.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
              No education added yet — recruiters look for your college and degree.
            </p>
          ) : (
            <div className="space-y-5">
              {form.education.map((entry, i) => (
                <div
                  key={i}
                  className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4 pt-5"
                >
                  <button
                    type="button"
                    onClick={() => removeEdu(i)}
                    className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove education entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Institution"
                      name={`edu-inst-${i}`}
                      placeholder="Visvesvaraya Technological University"
                      value={entry.institution}
                      onChange={(e) => setEdu(i, 'institution', e.target.value)}
                      required
                    />
                    <Input
                      label="Degree"
                      name={`edu-degree-${i}`}
                      placeholder="B.E. Computer Science"
                      value={entry.degree}
                      onChange={(e) => setEdu(i, 'degree', e.target.value)}
                      required
                    />
                    <Input
                      label="Field of study"
                      name={`edu-field-${i}`}
                      placeholder="Computer Science"
                      value={entry.fieldOfStudy}
                      onChange={(e) => setEdu(i, 'fieldOfStudy', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Start year"
                        name={`edu-start-${i}`}
                        type="number"
                        placeholder="2023"
                        value={entry.startYear}
                        onChange={(e) => setEdu(i, 'startYear', e.target.value)}
                        error={errors[`education.${i}.startYear`]}
                      />
                      <Input
                        label="End year"
                        name={`edu-end-${i}`}
                        type="number"
                        placeholder="2027"
                        value={entry.endYear}
                        onChange={(e) => setEdu(i, 'endYear', e.target.value)}
                        error={errors[`education.${i}.endYear`]}
                      />
                    </div>
                    <Input
                      label="Grade / CGPA"
                      name={`edu-grade-${i}`}
                      placeholder="8.4 CGPA"
                      value={entry.grade}
                      onChange={(e) => setEdu(i, 'grade', e.target.value)}
                    />
                  </div>
                  {errors[`education.${i}`] && (
                    <p className="mt-3 text-xs font-medium text-red-600">
                      {errors[`education.${i}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ------------------------ Links ------------------------ */}
      <Card>
        <CardHeader
          title="Links & resume"
          subtitle="Attach a resume once — future applications pre-fill it"
          action={
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <LinkIcon className="h-5 w-5" />
            </span>
          }
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          {linkRows.map(({ key, label, icon: Icon, placeholder }) => (
            <Input
              key={key}
              label={label}
              name={key}
              type="url"
              icon={Icon}
              placeholder={placeholder}
              value={form[key]}
              onChange={set(key)}
              error={errors[key]}
              hint={key === 'resume' ? 'PDF or drive link' : undefined}
            />
          ))}
        </CardBody>
      </Card>

      {/* Save bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 px-5 py-4">
        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
          <CircleCheck className="h-4 w-4 text-emerald-500" />
          {dirty ? 'You have unsaved changes' : 'All changes saved'}
        </p>
        <div className="flex gap-3">
          {dirty && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setForm(JSON.parse(JSON.stringify(baseline)));
                setErrors({});
              }}
            >
              Discard
            </Button>
          )}
          {sectionSave}
        </div>
      </div>
    </form>
  );
}
