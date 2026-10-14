type ProjectCardProps = {
  title: string;
  category: string;
  image: string;
  imageAlt: string;
  concept: string;
};

export default function ProjectCard({
  title,
  category,
  image,
  imageAlt,
  concept,
}: ProjectCardProps) {
  return (
    <article className="group">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-charcoal">
        <img
          src={image}
          alt={imageAlt}
          width="900"
          height="675"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />
        <span className="absolute left-4 top-4 border border-white/30 bg-brand-dark/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          Demonstration concept
        </span>
      </div>
      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">
            {category}
          </p>
          <h3 className="font-display text-lg font-bold text-white">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-neutral-500">{concept}</p>
        </div>
      </div>
    </article>
  );
}
