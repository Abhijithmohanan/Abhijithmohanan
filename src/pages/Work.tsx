import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config/site';

export default function Work() {
  return (
    <div className="w-full py-24 min-h-[80vh]">
      <Helmet>
        <title>Our Work | {SITE_CONFIG.name}</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">Our <span className="text-brand-red">Work.</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl">A showcase of our cinematic production and strategic marketing case studies.</p>
        </div>

        <div className="bg-brand-charcoal border border-white/10 border-dashed rounded-3xl p-16 text-center">
          <p className="text-gray-400 text-lg mb-4">Portfolio assets are currently being updated.</p>
          <p className="text-gray-500 text-sm">Please contact us directly for specific case studies and demonstration projects.</p>
        </div>
      </div>
    </div>
  );
}