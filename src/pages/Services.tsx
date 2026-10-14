import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import SectionHeading from '../components/SectionHeading';
import { SITE_CONFIG } from '../config/site';

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Creative & Digital Services | {SITE_CONFIG.name}</title>
        <meta
          name="description"
          content="Explore social media management, digital marketing, online advertising, podcast and video production, creative content and brand identity services."
        />
        <meta property="og:title" content={`Creative & Digital Services | ${SITE_CONFIG.name}`} />
      </Helmet>

      <section className="mx-auto max-w-7xl px-5 pb-14 pt-16 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12 lg:pt-24">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">
          What we can do together
        </p>
        <h1 className="max-w-4xl font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
          Creative work, <span className="text-brand-red">made for your next move.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">
          From a single production to an ongoing partnership, bring us the brief and we’ll find the
          right way to make it happen.
        </p>
      </section>

      <section className="border-y border-white/[0.08] bg-[#151517]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
          <div className="grid gap-x-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
            {SITE_CONFIG.services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-20 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:px-12 lg:py-24">
        <div>
          <SectionHeading
            eyebrow="Have a brief?"
            title="Let’s find the right way to bring it to life."
            description="Tell us what you need and we’ll start with a conversation."
          />
        </div>
        <Link
          to="/contact"
          className="inline-flex min-h-[52px] w-fit items-center justify-center gap-3 rounded-full bg-brand-button px-7 py-4 text-sm font-bold text-white transition hover:bg-brand-button-hover"
        >
          Start a Project <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
