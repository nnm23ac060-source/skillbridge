import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Search,
  UserRound,
  BarChart3,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

/* --------------------------------- Data ---------------------------------- */
const features = [
  {
    icon: Search,
    title: 'Smart internship discovery',
    text: 'Search and filter opportunities by location, category, skills, stipend and work mode — find the right fit in seconds.',
  },
  {
    icon: CheckCircle2,
    title: 'One-click applications',
    text: 'Apply with your cover letter and resume link. Your profile details are reused so applying takes less than a minute.',
  },
  {
    icon: BarChart3,
    title: 'Live application tracking',
    text: 'Follow every application through Pending → Under Review → Shortlisted → Accepted, with a clear status dashboard.',
  },
  {
    icon: UserRound,
    title: 'A profile that works for you',
    text: 'Showcase education, skills, GitHub, LinkedIn, portfolio and resume in one professional student profile.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based dashboards',
    text: 'Students and admins get purpose-built dashboards with secure JWT authentication and protected routes.',
  },
  {
    icon: Sparkles,
    title: 'Built for placement cells',
    text: 'Admins publish listings, review applicants and move candidates through the pipeline — all in one place.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Create your profile',
    text: 'Register in seconds and add your education, skills and links.',
  },
  {
    n: '02',
    title: 'Explore internships',
    text: 'Browse curated listings and filter down to what fits you.',
  },
  {
    n: '03',
    title: 'Apply & track',
    text: 'Submit applications and follow every status update in real time.',
  },
];

const showcase = [
  {
    title: 'Frontend Engineering Intern',
    company: 'Nova Labs',
    location: 'Bengaluru',
    mode: 'Remote',
    stipend: '₹25,000 / month',
    skills: ['React', 'Tailwind', 'Git'],
    accent: 'bg-brand-50 text-brand-700 border-brand-100',
  },
  {
    title: 'Data Science Intern',
    company: 'Analytica',
    location: 'Hyderabad',
    mode: 'Hybrid',
    stipend: '₹30,000 / month',
    skills: ['Python', 'Pandas', 'SQL'],
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    title: 'UI/UX Design Intern',
    company: 'PixelForge',
    location: 'Remote',
    mode: 'Remote',
    stipend: '₹18,000 / month',
    skills: ['Figma', 'Prototyping'],
    accent: 'bg-amber-50 text-amber-700 border-amber-100',
  },
];

/* -------------------------------- Component ------------------------------- */
export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* ============================== Navbar ============================== */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
              <Briefcase className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Skill<span className="text-brand-600">Bridge</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Features
            </a>
            <a href="#how" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              How it works
            </a>
            <a href="#for-students" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              For students
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Features
              </a>
              <a href="#how" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                How it works
              </a>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =============================== Hero =============================== */}
      <section className="relative overflow-hidden">
        {/* soft background decoration */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" />
          <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-slate-50" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              Internship &amp; Skill Development Platform
            </span>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">
              Bridge the gap between{' '}
              <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
                learning and your dream career
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              SkillBridge helps students discover curated internships, apply in
              minutes and track every application — while admins manage the
              entire pipeline from one clean dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-card-hover"
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card"
              >
                Log in to dashboard
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free for students
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> JWT-secured
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real-time status tracking
              </span>
            </div>
          </div>

          {/* Showcase cards (illustrative) */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="space-y-4">
              {showcase.map((s, i) => (
                <div
                  key={s.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
                  style={{ marginLeft: `${i * 18}px` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{s.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{s.company}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${s.accent}`}>
                      {s.mode}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {s.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> 6 months
                    </span>
                    <span className="font-semibold text-emerald-600">{s.stipend}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.skills.map((sk) => (
                      <span
                        key={sk}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Sample listings shown for illustration
            </p>
          </div>
        </div>
      </section>

      {/* ============================= Features ============================= */}
      <section id="features" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything students &amp; admins need
            </h2>
            <p className="mt-4 text-slate-600">
              A complete pipeline — from publishing an internship to accepting
              an offer — designed with a clean, modern interface.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== How it works =========================== */}
      <section id="how" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              From signup to offer in three steps
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-7">
                <span className="text-4xl font-extrabold text-brand-100">{s.n}</span>
                <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CTA band ============================== */}
      <section id="for-students" className="bg-white pb-24 pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 px-8 py-14 text-center shadow-card-hover sm:px-16">
            <div
              className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-2xl"
              aria-hidden="true"
            />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to start your career journey?
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-brand-100">
              Join SkillBridge today — build your profile, explore internships
              and track every application from a single dashboard.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= Footer ============================== */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Briefcase className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-slate-900">
              Skill<span className="text-brand-600">Bridge</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SkillBridge. Built with the MERN stack.
          </p>
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <a href="#features" className="transition hover:text-slate-900">
              Features
            </a>
            <a href="#how" className="transition hover:text-slate-900">
              How it works
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
