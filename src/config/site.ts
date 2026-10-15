import {
  BarChart3,
  Camera,
  Clapperboard,
  Megaphone,
  PenTool,
  Radio,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';

export const SITE_CONFIG = {
  name: 'Black Humor Productions',
  location: 'Nooranad, near Police Station, Kerala, India',
  mapLink:
    'https://www.google.com/maps/search/?api=1&query=Nooranad%20Police%20Station%2C%20Kerala%2C%20India',
  email: 'blackhumorproductions@outlook.com',
  phone: '+91 9544 405 504',
  phoneDisplay: '9544 405 504',
  phoneHref: '+919544405504',
  whatsappNumber: '919544405504',
  whatsappLink: 'https://wa.me/919544405504',
  instagramLink: 'https://www.instagram.com/arun_nrd/',
  youtubeLink: 'https://www.youtube.com/@Arun_nrd',
  website: 'https://blackhumorproductions.qd.je',
  services: [
    {
      id: 'social-media',
      title: 'Social Media Management',
      description:
        'Channel planning and content calendars that keep your brand present and consistent.',
      icon: Smartphone,
      image: '/images/service-social-media.webp',
      imageAlt: 'Smartphone displaying a collection of social media apps.',
    },
    {
      id: 'digital-marketing',
      title: 'Digital Marketing',
      description:
        'Strategy, content and measurement focused on the channels that matter.',
      icon: BarChart3,
      image: '/images/service-digital-marketing.webp',
      imageAlt: 'Laptop displaying digital analytics charts and performance data.',
    },
    {
      id: 'online-advertising',
      title: 'Online Advertising Campaigns',
      description:
        'Audience-led campaigns with creative that earns attention and supports your goals.',
      icon: Megaphone,
      image: '/images/service-advertising.webp',
      imageAlt: 'A film projector casting a dramatic beam of light in a dark room.',
    },
    {
      id: 'podcast-production',
      title: 'Podcast Production',
      description:
        'Recording and post-production for thoughtful, studio-quality conversations.',
      icon: Radio,
      image: '/images/service-podcast.webp',
      imageAlt: 'Professional studio microphone and pop filter in a dark recording room.',
    },
    {
      id: 'video-production',
      title: 'Video Production & Editing',
      description:
        'From creative direction to final edit, for social, campaigns and brand stories.',
      icon: Clapperboard,
      image: '/images/service-video-production.webp',
      imageAlt: 'Video-editing timeline displayed on a production monitor.',
    },
    {
      id: 'creative-content',
      title: 'Creative Content Production',
      description:
        'Photography and short-form video designed to work together across your channels.',
      icon: Camera,
      image: '/images/service-content-production.webp',
      imageAlt: 'Professional camera ready for a photo and video shoot.',
    },
    {
      id: 'brand-identity',
      title: 'Brand Identity & Graphic Design',
      description:
        'Distinctive visual identities and practical design systems for brands building their next chapter.',
      icon: PenTool,
      image: '/images/service-brand-identity.webp',
      imageAlt: 'Color palette, tablet and design tools arranged on a creative desk.',
    },
  ] satisfies Array<{
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    image: string;
    imageAlt: string;
  }>,
} as const;

export type Service = (typeof SITE_CONFIG.services)[number];
