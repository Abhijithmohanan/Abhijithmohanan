import { Helmet } from 'react-helmet-async';
import { ArrowRight, MoveDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import ProjectCard from '../components/ProjectCard';
import { SITE_CONFIG } from '../config/site';
import { PORTFOLIO_DEMOS } from '../config/portfolio';
import { assetUrl } from '../config/assets';

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
    hasMap: SITE_CONFIG.mapLink,
    image: `${SITE_CONFIG.website}/images/black-humor-productions-storefront.jpg`,
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
        <link
          rel="preload"
          as="image"
          href={assetUrl('images/black-humor-productions-storefront.jpg')}
        />
        <title>Creative Media & Digital Studio in Kerala | {SITE_CONFIG.name}</title>
        <meta
          name="description"
          content="We create engaging content, powerful brands and meaningful experiences through strategy, creativity and technology."
        />
        <meta property="og:title" content={`${SITE_CONFIG.name} — Ideas That Get Noticed`} />
        <meta
          property="og:description"
          content="Creative production, digital campaigns and brand storytelling from Nooranad, Kerala."
        />
        <meta property="og:url" content={SITE_CONFIG.website} />
        <meta
          property="og:image"
          content={`${SITE_CONFIG.website}/images/black-humor-productions-storefront.jpg`}
        />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <section className="relative isolate overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 -z-10 bg-brand-dark" />
        <div className="mx-auto grid min-h-[calc(100svh-77px)] max-w-[1440px] items-center gap-10 px-5 py-12 sm:min-h-[calc(100svh-89px)] sm:px-8 sm:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:px-10 lg:py-16 xl:px-12">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 sm:text-xs">
              <span className="h-px w-8 bg-brand-gold" />
              Independent creative studio · Kerala
            </p>
            <h1 className="font-display text-[clamp(2.65rem,5.2vw,5.2rem)] font-extrabold leading-[1.02] tracking-[-0.065em] text-white">
              Ideas That Get Noticed.
              <span className="mt-2 block text-brand-red">Stories That Make an Impact.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-400 sm:mt-7 sm:text-lg sm:leading-8">
              We create engaging content, powerful brands and meaningful experiences through
              strategy, creativity and technology.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/services"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-brand-button px-7 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover focus-visible:outline-offset-4"
              >
                Explore Our Services <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/20 px-7 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:border-white/45 hover:bg-white/[0.04]"
              >
                Start a Project <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3 text-xs font-medium text-neutral-500 sm:mt-10">
              <MoveDown size={15} className="text-brand-gold" aria-hidden="true" />
              Made with intent in Nooranad, Kerala
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[760px] lg:ml-auto">
            <div
              className="absolute -inset-3 border border-white/[0.08] sm:-inset-4"
              aria-hidden="true"
            />
            <div className="relative aspect-[16/10] overflow-hidden bg-brand-charcoal">
              <img
                src={assetUrl('images/black-humor-productions-storefront.jpg')}
                alt="Black Humor Productions' warmly lit storefront, with the circular studio sign and red facade lighting."
                width="1365"
                height="768"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-8 grid gap-5 md:grid-cols-[1fr_0.8fr] md:items-end lg:mb-10 lg:grid-cols-[1.25fr_0.75fr_auto] lg:gap-8">
            <div className="max-w-2xl">
              <p className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                <span aria-hidden="true" className="h-px w-8 bg-brand-gold" />
                What we do
              </p>
              <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.05em] text-white sm:text-4xl lg:text-[2.75rem]">
                A creative partner,
                <span className="block text-brand-red">from first idea to final frame.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">
              Strategy, content and creativity that help your brand get seen, remembered and grow.
            </p>
            <Link
              to="/services"
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-brand-red/70 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-red"
            >
              All services <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SITE_CONFIG.services.slice(0, 6).map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#101011] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-end lg:mb-10">
            <div className="max-w-3xl">
              <p className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                <span aria-hidden="true" className="h-px w-8 bg-brand-gold" />
                Selected concepts
              </p>
              <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.05em] text-white sm:text-4xl lg:text-[2.75rem]">
                A glimpse of the <span className="text-brand-red">stories we could tell.</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">
                These are visual direction exercises—not commissioned client projects or a record
                of completed work.
              </p>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-brand-red/70 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-red"
            >
              View all concepts <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="relative isolate overflow-hidden border-y border-white/[0.08] bg-[#151517]">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_50%,rgba(176,18,34,0.18),transparent_42%)]" />
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-end md:justify-between lg:px-12 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Black Humor Productions</p>
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-[-0.05em] text-white sm:text-5xl">
              Make the next idea <span className="text-brand-red">impossible to ignore.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">
              Thoughtful creative, made with intention in Nooranad, Kerala.
            </p>
          </div>
          <Link to="/contact" className="inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-brand-button px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover">
            Start a conversation <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

    </>
  );
}
