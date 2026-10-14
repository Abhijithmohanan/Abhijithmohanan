import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ProjectCard from '../components/ProjectCard';
import { PORTFOLIO_DEMOS, type PortfolioFilter } from '../config/portfolio';
import { SITE_CONFIG } from '../config/site';

const filters: PortfolioFilter[] = ['All', 'Film', 'Studio', 'Campaign'];

export default function Work() {
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>('All');
  const projects = PORTFOLIO_DEMOS.filter(
    (project) => activeFilter === 'All' || project.filter === activeFilter,
  );

  return (
    <>
      <Helmet>
        <title>Portfolio Concepts | {SITE_CONFIG.name}</title>
        <meta
          name="description"
          content="Explore visual direction demonstrations from Black Humor Productions. These concept projects are not commissioned client work."
        />
        <meta property="og:title" content={`Portfolio Concepts | ${SITE_CONFIG.name}`} />
      </Helmet>

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-8 sm:pb-14 sm:pt-20 lg:px-12 lg:pt-24">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">
          Portfolio
        </p>
        <h1 className="max-w-4xl font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
          A feel for <span className="text-brand-red">what’s possible.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">
          These visual direction exercises demonstrate the kinds of stories we can create. They
          are concepts—not client projects, commissioned work or case studies.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter concepts by type">
          {filters.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilter(filter)}
                className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition ${
                  isActive
                    ? 'border-brand-button bg-brand-button text-white'
                    : 'border-white/15 text-neutral-400 hover:border-white/35 hover:text-white'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <p className="sr-only" aria-live="polite">
          Showing {projects.length} {activeFilter === 'All' ? '' : `${activeFilter} `}concept
          {projects.length === 1 ? '' : 's'}.
        </p>
        <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
        <p className="mt-10 border-l-2 border-brand-gold/70 pl-4 text-xs leading-6 text-neutral-500">
          All featured images are illustrative demonstration material. No clients, business
          results or completed projects are implied.
        </p>
      </section>
    </>
  );
}
