import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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
          className="group flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-button text-sm font-extrabold tracking-tight text-white">
            BHP
          </span>
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
          </div>
        </div>
      )}
    </header>
  );
}
