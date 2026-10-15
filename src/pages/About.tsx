import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { SITE_CONFIG } from '../config/site';

const principles = [
  {
    number: '01',
    title: 'Start with listening',
    description:
      'We take time to understand the people, place and purpose behind each brief before shaping the work.',
  },
  {
    number: '02',
    title: 'Make it with care',
    description:
      'From a first sketch to a final export, we bring considered creative choices to every detail.',
  },
  {
    number: '03',
    title: 'Keep it clear',
    description:
      'A straightforward process keeps the collaboration human and the creative direction focused.',
  },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About the Studio | {SITE_CONFIG.name}</title>
        <meta
          name="description"
          content="Meet the creative thinking behind Black Humor Productions, an independent media studio in Nooranad, Kerala."
        />
        <meta property="og:title" content={`About the Studio | ${SITE_CONFIG.name}`} />
      </Helmet>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12 lg:pt-24">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">
          About the studio
        </p>
        <h1 className="max-w-5xl font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
          Independent thinking. <span className="text-brand-red">Thoughtful making.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">
          {SITE_CONFIG.name} is a creative media studio based in Nooranad, Kerala. We bring
          production and digital services together to help ideas find their clearest expression.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-12 lg:pb-28">
        <div className="relative min-h-[340px] overflow-hidden bg-brand-charcoal sm:min-h-[480px]">
          <img
            src="/images/studio-hero.webp"
            alt="A creative shoot taking shape outdoors"
            width="1400"
            height="1750"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <p className="absolute bottom-5 left-5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/80">
            Based in Nooranad, Kerala
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <SectionHeading eyebrow="Who we are" title="Good work starts with a real conversation." />
          <p className="mt-6 text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8">
            There’s no one-size-fits-all story. We work from your goals and your audience to find
            a creative approach that feels right for your brand—whether that means a social
            campaign, a film, a podcast or a new visual identity.
          </p>
          <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8">
            Our studio is rooted in Nooranad. Our focus is the work: useful ideas, careful
            production and a collaborative process from first brief to final delivery.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold text-white transition hover:text-brand-red"
          >
            Tell us what you have in mind <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#151517] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <SectionHeading
            eyebrow="How we think"
            title="A few things we believe in."
            description="The best creative relationships are built on trust, curiosity and care for the details."
          />
          <div className="mt-10 grid gap-x-10 sm:grid-cols-3">
            {principles.map((principle) => (
              <article key={principle.number} className="border-t border-white/15 py-6">
                <p className="mb-8 text-xs font-semibold tracking-[0.15em] text-brand-gold">
                  {principle.number}
                </p>
                <h2 className="font-display text-xl font-bold text-white">{principle.title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-400">{principle.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-2 lg:px-12 lg:py-24">
        <article className="border-t border-brand-red/60 pt-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Our mission</p>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Make good ideas clear, compelling and ready to meet their audience.</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-neutral-400">
            We bring strategy and craft together so each project has a thoughtful purpose, a distinct point of view and a useful way forward.
          </p>
        </article>
        <article className="border-t border-white/20 pt-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Our vision</p>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">A creative partner for stories that deserve to be noticed.</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-neutral-400">
            We aim to make considered, collaborative creative work accessible to brands and people building what comes next.
          </p>
        </article>
      </section>

      <section className="border-t border-white/[0.08] bg-[#151517] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <SectionHeading eyebrow="How we work" title="Curious by nature. Clear by design." description="A practical, collaborative approach keeps the work grounded in your goals and gives good ideas room to grow." />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Curiosity', 'Ask better questions and stay open to the unexpected.'],
              ['Craft', 'Give the details and the bigger picture equal care.'],
              ['Collaboration', 'Keep decisions, expectations and communication clear.'],
            ].map(([title, description]) => (
              <article key={title} className="border border-white/10 p-5 sm:p-6">
                <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-400">{description}</p>
              </article>
            ))}
          </div>
          <Link to="/contact" className="mt-9 inline-flex min-h-12 items-center gap-3 rounded-full bg-brand-button px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover">
            Start a project <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
