import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Service } from '../config/site';

type ServiceCardProps = {
  service: Service;
  index: number;
};

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <article className="group relative isolate flex min-h-[360px] flex-col overflow-hidden border border-white/10 bg-[#101012] p-5 transition-colors hover:border-brand-red/70 sm:min-h-[380px] sm:p-6">
      <img
        src={service.image}
        alt={service.imageAlt}
        width="1200"
        height="800"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 z-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(8,8,9,0.96)_0%,rgba(8,8,9,0.83)_40%,rgba(8,8,9,0.42)_100%),linear-gradient(0deg,rgba(8,8,9,0.84),transparent_72%)]"
      />
      <div className="relative z-20 flex items-center justify-between">
        <Icon
          size={23}
          strokeWidth={1.7}
          className="text-brand-red"
          aria-hidden="true"
        />
        <span className="text-[10px] font-semibold tracking-[0.16em] text-neutral-400">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="relative z-20 mt-auto max-w-[90%]">
        <h3 className="font-display text-lg font-bold leading-snug text-white sm:text-xl">
          {service.title}
        </h3>
        <p className="mt-2 text-sm leading-5 text-neutral-300">{service.description}</p>
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-medium text-neutral-300 sm:text-[11px]">
          {service.deliverables.map((deliverable) => (
            <li key={deliverable} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand-gold" />
              {deliverable}
            </li>
          ))}
        </ul>
        <Link
          to={`/services/${service.path}`}
          className="mt-5 inline-flex min-h-10 items-center gap-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
        >
          Explore service
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-red/80 text-brand-red transition-colors group-hover:bg-brand-red group-hover:text-white"
          >
            <ArrowRight size={15} />
          </span>
        </Link>
      </div>
    </article>
  );
}
