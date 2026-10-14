type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}
