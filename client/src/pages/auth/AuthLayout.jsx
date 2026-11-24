import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Sparkles, GraduationCap, Search } from 'lucide-react';

/**
 * AuthLayout — split-screen layout for Login / Register.
 * Left: brand panel (desktop). Right: the form.
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden w-[44%] max-w-xl overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-12 lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl"
          aria-hidden="true"
        />

        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Skill<span className="text-brand-200">Bridge</span>
          </span>
        </Link>

        <div className="relative mt-auto">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
            Your career bridge starts with one profile.
          </h2>
          <p className="mt-4 max-w-md text-brand-100">
            Discover curated internships, apply in minutes and track every application
            — all from a single, modern dashboard.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-brand-50">
            {[
              [Search, 'Filter internships by skills, stipend, location & mode'],
              [CheckCircle2, 'Track applications across five clear statuses'],
              [GraduationCap, 'Build a profile recruiters actually read'],
            ].map(([Icon, text]) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-10 flex items-center gap-2 text-xs text-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            Built with React · Express · MongoDB · Node
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col px-4 sm:px-8">
        <div className="flex h-16 items-center lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Briefcase className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold text-slate-900">
              Skill<span className="text-brand-600">Bridge</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md animate-fade-in-up">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
