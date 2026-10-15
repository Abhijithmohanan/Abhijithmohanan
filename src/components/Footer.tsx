import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../config/site';

const socialLinks = [
  {
    name: 'Instagram',
    href: SITE_CONFIG.instagramLink,
    icon: <InstagramMark />,
    hover: 'hover:text-[#e1306c]',
  },
  {
    name: 'YouTube',
    href: SITE_CONFIG.youtubeLink,
    icon: <YouTubeMark />,
    hover: 'hover:text-[#ff0033]',
  },
].filter((link) => Boolean(link.href));

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0b0b0c]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3"
              aria-label="Black Humor Productions home"
            >
              <img
                src="/images/black-humor-productions-logo.png"
                alt=""
                width="48"
                height="48"
                loading="lazy"
                className="h-12 w-12 object-contain"
              />
              <span className="h-9 w-px bg-brand-red" aria-hidden="true" />
              <span className="font-display font-extrabold tracking-[0.08em] text-white">
                <span className="block text-sm">
                  BLACK <span className="text-brand-red">HUMOR</span>
                </span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                  PRODUCTIONS
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-400">
              Independent creative studio. Bold ideas, meaningful stories.
            </p>
          </div>

          <div className="flex flex-col gap-5 md:items-end">
            <div className="space-y-2 text-sm text-neutral-400 md:text-right">
              <p>Made with intention.</p>
              <p>Nooranad, Kerala, India.</p>
            </div>
            {socialLinks.length > 0 && (
              <nav aria-label="Social media" className="flex items-center gap-2 md:justify-end">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${link.name} (opens in a new tab)`}
                    className={`flex h-10 w-10 items-center justify-center text-neutral-400 transition-colors focus-visible:outline-offset-2 ${link.hover}`}
                  >
                    {link.icon}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.08] pt-5 text-xs text-neutral-500 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}.</p>
          <p>Designed to stand out.</p>
        </div>
      </div>
    </footer>
  );
}

function InstagramMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}
