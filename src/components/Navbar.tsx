import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';

const links = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Portfolio', path: '/work' },
  { name: 'Contact', path: '/contact' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-semibold transition-colors hover:text-white focus-visible:outline-offset-4 ${
    isActive ? 'text-white' : 'text-neutral-400'
  }`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-brand-dark/90 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12"
      >
        <Link
          to="/"
          aria-label="Black Humor Productions home"
          className="group flex items-center"
        >
          <span className="leading-none">
            <span className="font-display text-[15px] font-extrabold tracking-[0.08em] text-white sm:text-base">
              BLACK <span className="text-brand-red">HUMOR</span>
            </span>
            <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-[0.28em] text-neutral-400">
              Productions
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={linkClass}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={SITE_CONFIG.instagramLink}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram (opens in a new tab)"
              className="text-neutral-400 transition-colors hover:text-[#e1306c] focus-visible:outline-offset-4"
            >
              <InstagramMark className="h-[18px] w-[18px]" />
            </a>
            <a
              href={SITE_CONFIG.youtubeLink}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube (opens in a new tab)"
              className="text-neutral-400 transition-colors hover:text-[#ff0033] focus-visible:outline-offset-4"
            >
              <YouTubeMark className="h-[19px] w-[19px]" />
            </a>
          </div>
          <Link
            to="/contact"
            className="rounded-full bg-brand-button px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-brand-button-hover focus-visible:outline-offset-4 sm:px-5 sm:text-[11px]"
          >
            Start a project
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/30 md:hidden"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div id="mobile-navigation" className="border-t border-white/10 bg-brand-dark md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-5 py-3 sm:px-8">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/[0.06] text-white'
                      : 'text-neutral-300 hover:bg-white/[0.04] hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <div className="flex items-center gap-5 border-t border-white/10 px-4 pt-4">
              <a
                href={SITE_CONFIG.instagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-2 py-2 text-sm font-medium text-neutral-300 transition hover:text-[#e1306c]"
              >
                <InstagramMark className="h-[18px] w-[18px] shrink-0" />
                Instagram
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a
                href={SITE_CONFIG.youtubeLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-2 py-2 text-sm font-medium text-neutral-300 transition hover:text-[#ff0033]"
              >
                <YouTubeMark className="h-[19px] w-[19px] shrink-0" />
                YouTube
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function InstagramMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
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

function YouTubeMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}
