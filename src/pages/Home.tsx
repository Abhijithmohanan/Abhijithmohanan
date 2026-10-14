import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Camera, Mic2 } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  return (
    <div className="w-full">
      <Helmet>
        <title>Home | {SITE_CONFIG.name}</title>
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-brand-red/10 blur-[120px] rounded-full w-[600px] h-[600px] -top-20 -left-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-brand-gold/5 blur-[100px] rounded-full w-[400px] h-[400px] bottom-0 right-0 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-8 tracking-tight">
              Ideas That Get Noticed.<br />
              <span className="text-brand-red">Stories That Make an Impact.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-light">
              We are a premium digital media and production agency specializing in high-end content, advertising, and strategic growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-brand-red rounded-lg hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]">
                Let's Talk About Your Project <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/services" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-brand-charcoal border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                Explore Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-charcoal p-10 rounded-2xl border border-white/10 hover:border-brand-red/50 transition-colors group">
              <Activity className="h-12 w-12 text-brand-red mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-4">Digital Marketing</h3>
              <p className="text-gray-400">Data-driven marketing and advertising campaigns built to scale your business.</p>
            </div>
            <div className="bg-brand-charcoal p-10 rounded-2xl border border-white/10 hover:border-brand-red/50 transition-colors group">
              <Mic2 className="h-12 w-12 text-brand-red mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-4">Podcast Production</h3>
              <p className="text-gray-400">Studio-grade audio and video podcast production tailored for modern audiences.</p>
            </div>
            <div className="bg-brand-charcoal p-10 rounded-2xl border border-white/10 hover:border-brand-red/50 transition-colors group">
              <Camera className="h-12 w-12 text-brand-red mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-4">Creative Content</h3>
              <p className="text-gray-400">High-end visual storytelling, video editing, and complete brand identity design.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}