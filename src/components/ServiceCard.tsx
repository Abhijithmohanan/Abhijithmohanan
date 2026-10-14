import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Service } from '../config/site';

type ServiceCardProps = {
  service: Service;
  index: number;
};

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <article className="group flex h-full flex-col border-t border-white/15 py-6 transition-colors hover:border-brand-red sm:py-7">
      <div className="mb-6 flex items-center justify-between">
        <Icon size={23} strokeWidth={1.5} className="text-brand-gold" aria-hidden="true" />
        <span className="text-xs font-medium tracking-[0.12em] text-neutral-600">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-white sm:text-xl">{service.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-neutral-400">{service.description}</p>
      <Link
        to={`/contact?service=${encodeURIComponent(service.id)}`}
        className="mt-5 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-neutral-300 transition group-hover:text-white"
      >
        Discuss this service
        <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </article>
  );
}
