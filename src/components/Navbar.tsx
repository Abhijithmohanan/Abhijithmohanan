import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Our Work', path: '/work' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-dark/90 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-red flex items-center justify-center font-black text-white rounded">BHP</div>
            <div className="leading-tight">
              <span className="block font-black text-xl tracking-wide text-white group-hover:text-brand-red transition-colors">BLACK HUMOR</span>
              <span className="block text-[10px] tracking-[0.2em] text-gray-400 uppercase">Productions</span>
            </div>
          </Link>
          <div className="hidden md:flex space-x-8">
            {links.map((link) => (
              <Link key={link.name} to={link.path} className="text-sm font-semibold text-gray-300 hover:text-brand-red transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-brand-charcoal border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-brand-red hover:bg-white/5 rounded-md">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}