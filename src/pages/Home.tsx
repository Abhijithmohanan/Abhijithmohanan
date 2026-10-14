import { Helmet } from 'react-helmet-async';
import { ArrowRight, ArrowUpRight, MoveDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import ProjectCard from '../components/ProjectCard';
import { SITE_CONFIG } from '../config/site';
import { PORTFOLIO_DEMOS } from '../config/portfolio';

const processSteps = [
  {
    number: '01',
    title: 'Listen',
    description: 'We get to know your business, your audience and what you want the work to achieve.',
  },
  {
    number: '02',
    title: 'Shape',
    description: 'Together, we find the right story, format and creative direction for the brief.',
  },
  {
    number: '03',
    title: 'Make',
    description: 'We produce with care, keeping the craft and the practical details in balance.',
  },
  {
    number: '04',
    title: 'Share',
    description: 'Your finished work is prepared for the channels and people it was made to reach.',
  },
];

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.website,
    image: `${SITE_CONFIG.website}/images/studio-hero.webp`,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nooranad',
      addressRegion: 'Kerala',
      addressCountry: 'IN',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Kerala, India',
    },
  };

  return (
    <>
      <Helmet>
        <link rel="preload" as="image" href="/images/studio-hero.webp" />
        <title>Creative Media & Digital Studio in Kerala | {SITE_CONFIG.name}</title>
        <meta
          name="description"
          content="Ideas that get noticed. Black Humor Productions is a creative media studio in Nooranad, Kerala, for video, photography, digital marketing and brand design."
        />
        <meta property="og:title" content={`${SITE_CONFIG.name} — Ideas That Get Noticed`} />
        <meta
          property="og:description"
          content="Creative production, digital campaigns and brand storytelling from Nooranad, Kerala."
        />
        <meta property="og:url" content={SITE_CONFIG.website} />
        <meta property="og:image" content={`${SITE_CONFIG.website}/images/studio-hero.webp`} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <section className="relative isolate overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 -z-20 bg-brand-dark" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_24%_45%,rgba(231,68,80,0.12),transparent_44%)]" />
        <div className="mx-auto grid min-h-[calc(100svh-76px)] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-12 lg:py-20">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-6 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 sm:text-xs">
              <span className="h-px w-8 bg-brand-gold" />
              Independent creative studio · Kerala
            </p>
            <h1 className="font-display text-[clamp(2.8rem,7.2vw,6rem)] font-extrabold leading-[1.02] tracking-[-0.065em] text-white">
              Ideas That Get Noticed.
              <span className="mt-2 block text-brand-red">Stories That Make an Impact.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-400 sm:mt-7 sm:text-lg sm:leading-8">
              We bring thoughtful strategy and considered production together to help brands tell
              stories that stay with people.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/contact"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-brand-button px-7 text-sm font-bold text-white transition hover:bg-brand-button-hover focus-visible:outline-offset-4"
              >
                Start a Project <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                to="/work"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition hover:border-white/45 hover:bg-white/[0.04]"
              >
                Explore Our Work <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3 text-xs font-medium text-neutral-500">
              <MoveDown size={15} className="text-brand-gold" aria-hidden="true" />
              Made with intent in Nooranad, Kerala
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[600px] lg:ml-auto">
            <div className="absolute -inset-3 border border-white/[0.08] sm:-inset-5" aria-hidden="true" />
            <div className="relative aspect-[4/4.4] overflow-hidden bg-brand-charcoal sm:aspect-[4/4.2] lg:aspect-[4/5]">
              <img
                src="/images/studio-hero.webp"
                alt="A photographer framing a shot on location"
                width="1400"
                height="1750"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/5" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                <div>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/65">
                    The craft behind the story
                  </p>
                  <p className="font-display text-lg font-bold text-white sm:text-xl">
                    Made to move people.
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/50 text-white">
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              </div>
            </div>
            <p className="mt-3 text-right text-[9px] uppercase tracking-[0.15em] text-neutral-600">
              Studio atmosphere · illustrative photography
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="What we do"
              title="A creative partner, from first idea to final frame."
            />
            <Link
              to="/services"
              className="inline-flex w-fit items-center gap-2 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-neutral-300 transition hover:text-white"
            >
              All services <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
            {SITE_CONFIG.services.slice(0, 6).map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#151517] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Selected concepts"
              title="A glimpse of the stories we could tell."
              description="These are visual direction exercises—not commissioned client projects or a record of completed work."
            />
            <Link
              to="/work"
              className="inline-flex w-fit items-center gap-2 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-neutral-300 transition hover:text-white"
            >
              View all concepts <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO_DEMOS.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-12 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <SectionHeading
              eyebrow="A good process"
              title="Good work starts with good questions."
            />
            <p className="max-w-xl text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8">
              Every project is different. We keep the collaboration clear and considered, from the
              first conversation through to delivery.
            </p>
          </div>
          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
              <article key={step.number} className="border-t border-white/15 py-5 sm:py-6">
                <p className="mb-8 text-xs font-semibold tracking-[0.15em] text-brand-gold">
                  {step.number}
                </p>
                <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-400">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08] bg-[#151517] py-16 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
              Have a story to tell?
            </p>
            <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
              Let’s make something matter.
            </h2>
          </div>
          <Link
            to="/contact"
            className="inline-flex min-h-[52px] w-fit items-center justify-center gap-3 rounded-full bg-brand-button px-7 py-4 text-sm font-bold text-white transition hover:bg-brand-button-hover"
          >
            Start a Project <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
