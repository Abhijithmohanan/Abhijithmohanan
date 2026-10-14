import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | {SITE_CONFIG.name}</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <section className="mx-auto flex min-h-[65vh] max-w-7xl flex-col justify-center px-5 py-20 sm:px-8 lg:px-12">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
          404 · Page not found
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-6xl">
          This story stops here.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-neutral-400">
          That page may have moved. Head back to the home page and we’ll take it from there.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold text-white transition hover:text-brand-red"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to home
        </Link>
      </section>
    </>
  );
}
