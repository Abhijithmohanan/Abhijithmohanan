import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type ProjectCardProps = {
  id: string;
  title: string;
  category: string;
  image: string;
  imageAlt: string;
  concept: string;
};

export default function ProjectCard({
  id,
  title,
  category,
  image,
  imageAlt,
  concept,
}: ProjectCardProps) {
  return (
    <article className="group relative isolate min-h-[245px] overflow-hidden border border-white/10 bg-brand-charcoal transition-colors hover:border-brand-red/60">
      <img
        src={image}
        alt={imageAlt}
        width="1200"
        height="800"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 z-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/25 to-black/10"
      />
      <span className="absolute left-4 top-4 z-20 border border-white/30 bg-brand-dark/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
        Demonstration concept
      </span>
      <div className="absolute inset-x-4 bottom-4 z-20 flex items-end justify-between gap-4 sm:inset-x-5 sm:bottom-5">
        <div className="min-w-0">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-brand-gold">
            {category}
          </p>
          <h3 className="font-display text-lg font-bold text-white sm:text-xl">{title}</h3>
          <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-300">{concept}</p>
        </div>
        <Link
          to={`/portfolio/${id}`}
          aria-label={`Explore the ${title} demonstration concept`}
          className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-red text-white transition-colors hover:bg-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-red"
        >
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
