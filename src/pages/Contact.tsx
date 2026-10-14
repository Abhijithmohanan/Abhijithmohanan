import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';

export default function Contact() {
  const [status, setStatus] = useState({ message: '', type: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({
      message: 'Form submission requires backend configuration. Please contact us via phone or WhatsApp.',
      type: 'error'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <Helmet>
        <title>Contact Us | {SITE_CONFIG.name}</title>
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Let's Build Something <span className="text-brand-red">Great.</span></h1>
          <p className="text-gray-400 text-lg mb-12">Ready to scale your digital presence? Reach out to us directly or fill out the project inquiry form.</p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-brand-charcoal rounded-full flex items-center justify-center flex-shrink-0 text-brand-gold border border-white/10">
                <Phone className="h-6 w-6" />
              </div>
              <div className="pt-2">
                <h3 className="text-white font-bold mb-1 text-lg">Call Us</h3>
                <a href={`tel:${SITE_CONFIG.phone.replace(/\s+/g, '')}`} className="text-gray-400 hover:text-brand-red transition-colors text-lg">{SITE_CONFIG.phoneDisplay}</a>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-brand-charcoal rounded-full flex items-center justify-center flex-shrink-0 text-brand-gold border border-white/10">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="pt-2">
                <h3 className="text-white font-bold mb-1 text-lg">WhatsApp</h3>
                <a href={SITE_CONFIG.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-red transition-colors text-lg">Start a project chat</a>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-brand-charcoal rounded-full flex items-center justify-center flex-shrink-0 text-brand-gold border border-white/10">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="pt-2">
                <h3 className="text-white font-bold mb-1 text-lg">Studio Location</h3>
                <p className="text-gray-400 text-lg leading-relaxed">{SITE_CONFIG.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-charcoal p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 blur-[50px] rounded-full"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input id="name" required type="text" className="w-full bg-brand-dark border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-red transition-colors" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-300 mb-2">Phone / Email</label>
              <input id="contact" required type="text" className="w-full bg-brand-dark border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-red transition-colors" placeholder="How can we reach you?" />
            </div>
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">Service of Interest</label>
              <select id="service" className="w-full bg-brand-dark border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-red transition-colors appearance-none cursor-pointer">
                <option value="">Select a service</option>
                {SITE_CONFIG.services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-300 mb-2">Project Details</label>
              <textarea id="details" required rows={4} className="w-full bg-brand-dark border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-red transition-colors resize-none" placeholder="Tell us about your project scale and goals..."></textarea>
            </div>
            <button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)]">
              Submit Inquiry
            </button>
            
            {status.message && (
              <div className={`p-4 rounded-lg text-sm text-center font-medium ${status.type === 'error' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-green-500/10 text-green-500'}`}>
                {status.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}