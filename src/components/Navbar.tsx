import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, Phone, X } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { assetUrl } from '../config/assets';

const links = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Contact', path: '/contact' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative py-2 text-[13px] font-semibold transition-colors hover:text-white focus-visible:outline-offset-4 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-brand-red after:transition-transform ${
    isActive ? 'text-white after:scale-x-100' : 'text-neutral-400'
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
        className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[88px] sm:px-6 xl:gap-5 xl:px-8"
      >
        <Link
          to="/"
          aria-label="Black Humor Productions home"
          className="group flex shrink-0 items-center gap-2.5 max-[360px]:gap-1.5 sm:gap-3.5"
        >
          <img
            src={assetUrl('images/black-humor-productions-logo.png')}
            alt=""
            width="64"
            height="64"
            className="h-10 w-10 object-contain sm:h-14 sm:w-14 xl:h-16 xl:w-16"
          />
          <span className="h-8 w-px bg-brand-red sm:h-10" aria-hidden="true" />
          <span className="leading-none">
            <span className="font-display text-[13px] font-extrabold tracking-[0.07em] text-white max-[360px]:text-[11px] sm:text-[15px] xl:text-base">
              BLACK <span className="text-brand-red">HUMOR</span>
            </span>
            <span className="mt-1 inline-block text-[8px] font-bold uppercase tracking-[0.25em] text-neutral-400 sm:text-[9px]">
              Productions
            </span>
          </span>
        </Link>

        <div className="hidden shrink-0 items-center gap-5 2xl:gap-7 xl:flex">
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

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 xl:ml-0">
          <ConnectWithUs className="hidden xl:block" />
          <Link
            to="/login"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-white/15 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-white transition hover:border-white/35 hover:bg-white/[0.04] focus-visible:outline-offset-4 sm:min-h-11 sm:px-4 sm:text-[11px] sm:tracking-[0.1em]"
          >
            Login
          </Link>
          <Link
            to="/contact"
            className="hidden min-h-11 items-center justify-center gap-2 rounded-full bg-brand-button px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover focus-visible:outline-offset-4 xl:inline-flex 2xl:px-5 2xl:text-[11px]"
          >
            Start a project <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/30 xl:hidden"
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
        <div id="mobile-navigation" className="max-h-[calc(100svh-77px)] overflow-y-auto border-t border-white/10 bg-brand-dark sm:max-h-[calc(100svh-89px)] xl:hidden">
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
            <ConnectWithUs
              className="mt-2 border-t border-white/10 px-4 pt-4"
              onSelect={() => setIsOpen(false)}
            />
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-button px-5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-brand-button-hover"
            >
              Start a project <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function ConnectWithUs({
  className = '',
  onSelect,
}: {
  className?: string;
  onSelect?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const options = [
    {
      title: 'Instagram',
      subtitle: 'Follow our work',
      href: SITE_CONFIG.instagramLink,
      icon: <InstagramMark className="h-6 w-6" />,
      external: true,
      tone: 'text-[#e1306c]',
    },
    {
      title: 'YouTube',
      subtitle: 'Watch our videos',
      href: SITE_CONFIG.youtubeLink,
      icon: <YouTubeMark className="h-6 w-6" />,
      external: true,
      tone: 'text-[#ff0033]',
    },
    {
      title: 'WhatsApp',
      subtitle: 'Chat with us',
      href: SITE_CONFIG.whatsappLink,
      icon: <WhatsAppMark className="h-6 w-6" />,
      external: true,
      tone: 'text-[#25d366]',
    },
    {
      title: 'Call Us',
      subtitle: SITE_CONFIG.phone,
      href: `tel:${SITE_CONFIG.phoneHref}`,
      icon: <Phone size={21} strokeWidth={1.8} aria-hidden="true" />,
      external: false,
      tone: 'text-brand-gold',
    },
    {
      title: 'Our Location',
      subtitle: SITE_CONFIG.location,
      href: SITE_CONFIG.mapLink,
      icon: <GoogleMapsMark className="h-6 w-6" />,
      external: true,
      tone: 'text-white',
    },
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-full border border-brand-red/50 bg-[#151112] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:border-brand-red hover:bg-[#201416] focus-visible:outline-offset-2 xl:w-auto xl:text-[11px]"
      >
        Connect with us
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`text-brand-red transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="static mt-2 w-full max-w-full overflow-hidden rounded-xl border border-white/10 border-t-2 border-t-brand-red bg-[#111112] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.55)] xl:absolute xl:left-auto xl:top-[calc(100%+10px)] xl:mt-0 xl:w-[360px] xl:max-w-[360px] xl:right-0"
        >
          <h2 className="px-3 pb-2 pt-2.5 font-display text-[10px] font-extrabold uppercase tracking-[0.18em] text-neutral-400">
            Connect with us
          </h2>
          <div className="divide-y divide-white/[0.08]">
            {options.map((option) => (
              <a
                key={option.title}
                href={option.href}
                target={option.external ? '_blank' : undefined}
                rel={option.external ? 'noreferrer' : undefined}
                onClick={() => {
                  setIsOpen(false);
                  onSelect?.();
                }}
                className="group flex min-h-[62px] items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-white/[0.045] focus-visible:bg-white/[0.045] focus-visible:outline-offset-[-2px]"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${option.tone}`}>
                  {option.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white transition-colors group-hover:text-brand-gold">
                    {option.title}
                  </span>
                  <span className="mt-0.5 block break-words text-xs leading-5 text-neutral-400">
                    {option.subtitle}
                  </span>
                </span>
                {option.external && (
                  <ArrowUpRight
                    size={15}
                    aria-hidden="true"
                    className="shrink-0 text-neutral-500 transition-colors group-hover:text-white"
                  />
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
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

function WhatsAppMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12.04 2a9.85 9.85 0 0 0-8.48 14.86L2.2 22l5.28-1.38A9.93 9.93 0 0 0 12.03 22h.01A10 10 0 0 0 22 12 9.96 9.96 0 0 0 12.04 2Zm-.01 18.3h-.01a8.25 8.25 0 0 1-4.2-1.15l-.3-.18-3.13.82.84-3.05-.2-.32a8.3 8.3 0 1 1 7 3.88Zm4.56-6.22c-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.57.13-.17.25-.65.81-.8.98-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.52.12-.11.25-.3.38-.45.12-.15.16-.25.25-.42.08-.17.04-.32-.02-.45-.07-.13-.57-1.37-.78-1.88-.2-.49-.41-.42-.57-.43h-.49c-.17 0-.45.06-.68.32-.23.25-.89.87-.89 2.12s.91 2.46 1.03 2.63c.13.17 1.79 2.73 4.33 3.83.61.27 1.09.43 1.46.55.61.19 1.17.16 1.61.1.49-.08 1.48-.61 1.69-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.17-.49-.3Z" />
    </svg>
  );
}

function GoogleMapsMark({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path
        fill="#34a853"
        d="M12 1.8a8.2 8.2 0 0 0-7.1 12.3l5.9 8.1c.6.8 1.8.8 2.4 0l5.9-8.1A8.2 8.2 0 0 0 12 1.8Z"
      />
      <path
        fill="#4285f4"
        d="M12 1.8a8.2 8.2 0 0 0-7.1 12.3l2.7-3.7a4.8 4.8 0 0 1 4.4-7.3Z"
      />
      <path
        fill="#fbbc04"
        d="M4.9 14.1 7.6 10.4a4.8 4.8 0 0 0 .5 5.3l2.1 2.9-1.4 1.9-3.9-5.4Z"
      />
      <path
        fill="#ea4335"
        d="M12 1.8a8.2 8.2 0 0 1 7.1 12.3l-2.7-3.7A4.8 4.8 0 0 0 12 3.1V1.8Z"
      />
      <circle cx="12" cy="9.6" r="2.6" fill="#fff" />
      <circle cx="12" cy="9.6" r="1.6" fill="#4285f4" />
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
