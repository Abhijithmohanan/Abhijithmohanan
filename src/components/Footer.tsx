import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../config/site';

const socialLinks = [
  {
    name: 'Instagram',
    href: SITE_CONFIG.instagramLink,
    icon: <InstagramMark />,
    hover: 'hover:border-brand-red hover:text-white',
  },
  {
    name: 'YouTube',
    href: SITE_CONFIG.youtubeLink,
    icon: <YouTubeMark />,
    hover: 'hover:border-brand-red hover:text-white',
  },
].filter((link) => Boolean(link.href));

const studioWords = ['IDEAS', 'STORIES', 'BRANDS', 'PEOPLE', 'IMPACT'];

export default function Footer() {
  return (
    <footer className="bg-[#080809] text-white">
      <div className="relative isolate border-b border-white/15">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_74%_48%,rgba(176,18,34,0.16),transparent_34%),linear-gradient(110deg,#080809_0%,#0b0b0c_55%,#080809_100%)]"
        />
        <div className="mx-auto grid max-w-[1600px] items-center gap-8 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-10 lg:px-12 lg:py-16">
          <div className="relative z-10 flex items-center gap-5 sm:gap-7">
            <Link
              to="/"
              aria-label="Black Humor Productions home"
              className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
            >
              <img
                src="/images/black-humor-productions-logo.png"
                alt="Black Humor Productions circular logo"
                width="112"
                height="112"
                loading="lazy"
                decoding="async"
                className="h-[76px] w-[76px] object-contain sm:h-24 sm:w-24 lg:h-28 lg:w-28"
              />
            </Link>
            <span className="h-28 w-px shrink-0 bg-brand-red sm:h-32" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-display text-[clamp(1.35rem,4vw,2.7rem)] font-extrabold leading-none tracking-[0.035em] text-white">
                BLACK <span className="text-brand-red">HUMOR</span>
              </p>
              <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-neutral-300 sm:text-sm sm:tracking-[0.48em]">
                PRODUCTIONS
              </p>
              <p className="mt-5 text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">
                Independent creative studio.
                <br />
                Bold ideas, meaningful stories.
              </p>
            </div>
          </div>

          <div className="relative isolate flex min-h-[260px] items-center overflow-hidden sm:min-h-[320px] lg:min-h-[390px]">
            <img
              src="/images/black-humor-productions-footer-camera.jpg"
              alt="Cinema camera in a red-lit production studio"
              width="1800"
              height="640"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 z-0 h-full w-full object-cover object-[72%_50%] brightness-110 contrast-110"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 bg-[linear-gradient(90deg,#080809_0%,rgba(8,8,9,0.88)_10%,rgba(8,8,9,0.42)_34%,rgba(8,8,9,0.04)_74%),linear-gradient(0deg,rgba(8,8,9,0.38),transparent_42%,rgba(8,8,9,0.12))]"
            />
            <div className="absolute inset-y-0 left-0 z-10 w-1/2 bg-[radial-gradient(ellipse_at_70%_48%,rgba(191,20,38,0.18),transparent_65%)]" />
            <div className="relative z-20 ml-3 border-l border-brand-red/80 py-1 pl-5 sm:ml-8 sm:pl-7">
              <ul className="space-y-2.5 text-[0.68rem] font-medium tracking-[0.3em] text-neutral-300/80 sm:space-y-3 sm:text-xs sm:tracking-[0.38em]">
                {studioWords.map((word) => <li key={word}>{word}</li>)}
              </ul>
              <span className="mt-5 block h-px w-8 bg-brand-red sm:w-10" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-5 py-6 sm:px-8 sm:py-7 md:flex-row md:items-center md:justify-between lg:px-12">
        <p className="text-xs leading-5 text-neutral-400 sm:text-sm">
          &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
        </p>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
          <div className="border-l border-white/20 pl-4 text-sm leading-6 sm:pl-5">
            <p className="text-neutral-200">Made with intention.</p>
            <p className="text-neutral-500">Nooranad, Kerala, India.</p>
          </div>
          {socialLinks.length > 0 && (
            <nav aria-label="Social media" className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${link.name} (opens in a new tab)`}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border border-brand-red/70 text-neutral-200 transition-colors motion-reduce:transition-none ${link.hover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-red`}
                >
                  {link.icon}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
      <a
        href={SITE_CONFIG.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us"
        className="group fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_28px_rgba(0,0,0,0.38)] transition duration-200 hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] motion-reduce:transform-none motion-reduce:transition-none sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:right-6 sm:h-[60px] sm:w-[60px]"
      >
        <WhatsAppMark />
        <span className="pointer-events-none absolute right-[calc(100%+0.75rem)] whitespace-nowrap rounded-md border border-white/10 bg-[#171719] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          Chat with us
        </span>
      </a>
    </footer>
  );
}

function WhatsAppMark() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2a9.85 9.85 0 0 0-8.48 14.86L2.2 22l5.28-1.38A9.93 9.93 0 0 0 12.03 22h.01A10 10 0 0 0 22 12 9.96 9.96 0 0 0 12.04 2Zm-.01 18.3h-.01a8.25 8.25 0 0 1-4.2-1.15l-.3-.18-3.13.82.84-3.05-.2-.32a8.3 8.3 0 1 1 7 3.88Zm4.56-6.22c-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.57.13-.17.25-.65.81-.8.98-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.52.12-.11.25-.3.38-.45.12-.15.16-.25.25-.42.08-.17.04-.32-.02-.45-.07-.13-.57-1.37-.78-1.88-.2-.49-.41-.42-.57-.43h-.49c-.17 0-.45.06-.68.32-.23.25-.89.87-.89 2.12s.91 2.46 1.03 2.63c.13.17 1.79 2.73 4.33 3.83.61.27 1.09.43 1.46.55.61.19 1.17.16 1.61.1.49-.08 1.48-.61 1.69-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.17-.49-.3Z" />
    </svg>
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
