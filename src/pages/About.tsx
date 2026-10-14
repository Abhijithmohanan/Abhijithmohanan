import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config/site';
import { Award, Target, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="w-full py-24">
      <Helmet>
        <title>About Us | {SITE_CONFIG.name}</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">About <span className="text-brand-red">Us.</span></h1>
          <p className="text-xl text-gray-400">We are a dedicated team of digital strategists, creators, and producers based in Kerala.</p>
        </div>
        
        <div className="bg-brand-charcoal border border-white/10 rounded-3xl p-8 md:p-16 mb-20">
          <h2 className="text-3xl font-bold text-white mb-6">Our Foundation</h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            {SITE_CONFIG.name} was established with a clear vision: to elevate brand storytelling through high-impact media production and strategic digital marketing. Operating out of our studio in {SITE_CONFIG.location}, we service clients looking to make a serious impact in the digital space.
          </p>
          <div className="bg-brand-dark border-l-4 border-brand-gold p-6 rounded-r-lg">
            <p className="text-sm text-gray-300 italic flex items-center gap-3">
              <Award className="text-brand-gold h-5 w-5" />
              Historical Note: Our studio inauguration was officially honored by the presence of {SITE_CONFIG.inauguration}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-brand-charcoal p-10 rounded-2xl border border-white/10">
            <Target className="h-10 w-10 text-brand-red mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-gray-400">To provide enterprise-grade creative and digital marketing solutions that drive measurable growth and establish market dominance for our partners.</p>
          </div>
          <div className="bg-brand-charcoal p-10 rounded-2xl border border-white/10">
            <Users className="h-10 w-10 text-brand-red mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Our Approach</h3>
            <p className="text-gray-400">We blend cinematic aesthetics with data-driven strategies, ensuring every piece of content not only looks premium but performs optimally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}