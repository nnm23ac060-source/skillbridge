import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
        <Compass className="h-8 w-8" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand-600">
        404 — Page not found
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        This page doesn’t exist
      </h1>
      <p className="mt-3 max-w-md text-slate-500">
        The link may be broken, or the page might have been moved. Let’s get you
        back on track.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}
