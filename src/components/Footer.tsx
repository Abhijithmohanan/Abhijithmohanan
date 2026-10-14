import { SITE_CONFIG } from '../config/site';

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-brand-red flex items-center justify-center font-black text-white rounded text-sm">BHP</div>
              <span className="font-black tracking-wide text-white">BLACK HUMOR</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-xs">Premium creative digital marketing and media production agency.</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6">Services</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              {SITE_CONFIG.services.map(s => (
                <li key={s.id}>{s.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6">Contact</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>{SITE_CONFIG.location}</li>
              <li>Phone: {SITE_CONFIG.phoneDisplay}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}