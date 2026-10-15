import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import NotFound from './NotFound';
import { PORTFOLIO_DEMOS } from '../config/portfolio';
import { SITE_CONFIG } from '../config/site';

const conceptNotes: Record<string, { direction: string; elements: string[] }> = {
  'brand-film-concept': {
    direction:
      'An imagined brand-film direction built around considered close-ups, tactile detail and a restrained cinematic palette. The exercise explores how visual rhythm can introduce a brand without relying on an invented client story.',
    elements: ['A visual mood and frame direction', 'A short-form narrative outline', 'A considered approach to light, texture and pacing'],
  },
  'content-series-concept': {
    direction:
      'A speculative recurring-content format for a creative studio environment. The concept explores how a consistent set, candid moments and repeatable episode structure might make a series feel recognisable.',
    elements: ['A repeatable episode structure', 'Studio-led visual references', 'A flexible set of social cut-down ideas'],
  },
  'campaign-concept': {
    direction:
      'A fictional digital campaign direction exploring how a clear message can be carried across a small family of online placements. No advertising results or client campaign are represented.',
    elements: ['A central campaign message', 'A family of adaptable creative formats', 'A sample channel and audience planning exercise'],
  },
};

export default function PortfolioDetail() {
  const { projectId } = useParams();
  const project = PORTFOLIO_DEMOS.find((item) => item.id === projectId);

  if (!project) return <NotFound />;

  const notes = conceptNotes[project.id];
  if (!notes) return <NotFound />;

  return (
    <>
      <Helmet>
        <title>{project.title} — Demonstration Concept | {SITE_CONFIG.name}</title>
        <meta name="description" content={`${project.concept} A fictional demonstration concept by ${SITE_CONFIG.name}, not client work.`} />
        <meta property="og:title" content={`${project.title} — Demonstration Concept | ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={project.concept} />
        <meta property="og:image" content={`${SITE_CONFIG.website}${project.image}`} />
      </Helmet>

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 transition hover:text-white">
          <ArrowLeft size={15} aria-hidden="true" /> Back to portfolio
        </Link>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="border border-brand-gold/60 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-brand-gold">Demonstration concept</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{project.category}</span>
        </div>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-white sm:text-6xl">{project.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg">{project.concept}</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="relative aspect-[16/9] overflow-hidden border border-white/10 bg-brand-charcoal">
          <img src={project.image} alt={project.imageAlt} width="1600" height="900" fetchPriority="high" className="h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white sm:bottom-6 sm:left-6">Demonstration concept · not client work</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Creative direction</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-white">An exercise in possibility.</h2>
        </div>
        <div>
          <p className="text-base leading-8 text-neutral-300">{notes.direction}</p>
          <h3 className="mt-8 font-display text-lg font-bold text-white">What this concept explores</h3>
          <ul className="mt-4 space-y-3">
            {notes.elements.map((element) => (
              <li key={element} className="border-t border-white/10 pt-3 text-sm leading-6 text-neutral-400">{element}</li>
            ))}
          </ul>
          <p className="mt-8 border-l-2 border-brand-gold/70 pl-4 text-xs leading-6 text-neutral-500">
            This is a fictional creative exercise using illustrative imagery. It does not describe a client engagement, commissioned project or achieved result.
          </p>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#151517]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <p className="max-w-2xl font-display text-xl font-bold text-white">Have a real brief that needs its own point of view?</p>
          <Link to="/contact" className="inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-brand-button px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover">
            Start a project <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
