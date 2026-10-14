import { ArrowUpRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../config/site';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0c0c0d]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label="Black Humor Productions home">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-button text-xs font-extrabold text-white">
                BHP
              </span>
              <span className="font-display text-sm font-extrabold tracking-[0.09em] text-white">
                BLACK HUMOR
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-400">
              Creative production and digital services, made with intention in Nooranad, Kerala.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-neutral-300">
              Explore
            </h2>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link to="/about" className="transition hover:text-white">About</Link></li>
              <li><Link to="/services" className="transition hover:text-white">Services</Link></li>
              <li><Link to="/work" className="transition hover:text-white">Portfolio</Link></li>
              <li><Link to="/contact" className="transition hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-neutral-300">
              Say hello
            </h2>
            <p className="mb-3 text-sm leading-6 text-neutral-400">{SITE_CONFIG.location}</p>
            <a
              href={`tel:${SITE_CONFIG.phoneHref}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-brand-red"
            >
              <Phone size={15} aria-hidden="true" />
              {SITE_CONFIG.phoneDisplay}
            </a>
            <a
              href={SITE_CONFIG.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex w-fit items-center gap-1.5 text-sm text-neutral-400 transition hover:text-white"
            >
              WhatsApp <ArrowUpRight size={14} aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/[0.08] pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
          <p>Based in Nooranad, Kerala, India.</p>
        </div>
      </div>
    </footer>
  );
}
