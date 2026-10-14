import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config/site';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <div className="w-full py-24">
      <Helmet>
        <title>Services | {SITE_CONFIG.name}</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">Our <span className="text-brand-red">Services.</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl">Comprehensive digital production and marketing solutions designed for scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {SITE_CONFIG.services.map((service, index) => (
            <div key={service.id} className="bg-brand-charcoal p-10 rounded-2xl border border-white/10 hover:border-brand-red/50 transition-all flex flex-col justify-between">
              <div>
                <span className="text-brand-red font-black text-xl mb-4 block">0{index + 1}</span>
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-gray-400 mb-8">{service.description}</p>
              </div>
              <Link to="/contact" className="inline-flex items-center text-sm font-bold text-white hover:text-brand-red transition-colors">
                Inquire about this service <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}