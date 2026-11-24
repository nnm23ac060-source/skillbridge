import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, CheckCircle2 } from 'lucide-react';
import api, { getFieldErrors, getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

/**
 * ApplyModal — submit a cover letter + resume link for one internship.
 * Server enforces duplicates/deadlines; this handles UX + field errors.
 */
export default function ApplyModal({ open, onClose, internship, onApplied }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ coverLetter: '', resume: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* Prefill when opened */
  useEffect(() => {
    if (open) {
      setForm({ coverLetter: '', resume: user?.resume || '' });
      setErrors({});
    }
  }, [open, user?.resume]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    const cl = form.coverLetter.trim();
    if (cl.length < 30) e.coverLetter = `Cover letter must be at least 30 characters (currently ${cl.length})`;
    if (cl.length > 5000) e.coverLetter = 'Cover letter must be under 5000 characters';
    if (!form.resume.trim() && !user?.resume) e.resume = 'Add a resume link (none saved on your profile)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/applications', {
        internshipId: internship._id,
        coverLetter: form.coverLetter.trim(),
        resume: form.resume.trim(),
      });
      toast.success(data.message || 'Application submitted 🎉');
      onApplied?.(data.data.application);
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (err.response?.status === 409) {
        toast('You already applied to this internship', { icon: 'ℹ️' });
        onApplied?.(null); // parent refetches applied state
        onClose();
      } else {
        if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
        toast.error(getErrorMessage(err, 'Could not submit application'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for this internship"
      subtitle={internship ? `${internship.title} · ${internship.company}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="apply-form" loading={submitting}>
            Submit application
          </Button>
        </>
      }
    >
      <form id="apply-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-3.5">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs leading-relaxed text-slate-600">
            Your profile details and resume link are shared with the recruiter.
            Make sure your cover letter is tailored to{' '}
            <span className="font-semibold text-slate-800">{internship?.company}</span>.
          </p>
        </div>

        <Textarea
          label="Cover letter"
          name="coverLetter"
          rows={7}
          maxLength={5000}
          showCount
          required
          placeholder={`Dear ${internship?.company || 'hiring team'} team, I am excited to apply for the ${internship?.title || 'internship'}…`}
          value={form.coverLetter}
          onChange={set('coverLetter')}
          error={errors.coverLetter}
          hint="Minimum 30 characters — introduce yourself and why you're a fit."
        />

        <Input
          label="Resume link"
          name="resume"
          type="url"
          required
          placeholder="https://drive.google.com/…/resume.pdf"
          value={form.resume}
          onChange={set('resume')}
          error={errors.resume}
          hint={
            user?.resume
              ? 'Pre-filled from your profile — you can override it for this application.'
              : 'Tip: save a resume link once in your profile to auto-fill future applications.'
          }
        />

        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          You can track this application under “My Applications”.
        </div>
      </form>
    </Modal>
  );
}
