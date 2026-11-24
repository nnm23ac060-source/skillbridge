import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserRound, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { getFieldErrors, getErrorMessage } from '../../api/client';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      e.password = 'Password must contain a letter and a number';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success(`Account created — welcome, ${user.name.split(' ')[0]}!`);
      navigate('/app', { replace: true });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      toast.error(getErrorMessage(err, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free for students — start applying in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Full name"
          name="name"
          placeholder="Priya Sharma"
          icon={UserRound}
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          required
          autoComplete="name"
        />
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@college.edu"
          icon={Mail}
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          name="password"
          placeholder="At least 8 characters"
          icon={Lock}
          toggle
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="Must include a letter and a number"
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          name="confirm"
          placeholder="Repeat your password"
          icon={Lock}
          toggle
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
          required
          autoComplete="new-password"
        />

        <Button type="submit" loading={submitting} full size="lg">
          {!submitting && (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
          By registering you get a student account — you can complete your profile and
          apply to internships right away.
        </p>
      </form>
    </AuthLayout>
  );
}
