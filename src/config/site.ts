import {
  Clapperboard,
  Fingerprint,
  Megaphone,
  PenTool,
  Radio,
  Share2,
  Video,
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
        'Thoughtful channel planning, content calendars and day-to-day publishing that keep your brand present and consistent.',
      icon: Share2,
    },
    {
      id: 'digital-marketing',
      title: 'Digital Marketing',
      description:
        'A considered digital strategy that connects useful content, the right channels and clear campaign objectives.',
      icon: Megaphone,
    },
    {
      id: 'online-advertising',
      title: 'Online Advertising Campaigns',
      description:
        'Creative campaign assets and audience-focused paid promotion, shaped around your brief and budget.',
      icon: Fingerprint,
    },
    {
      id: 'podcast-production',
      title: 'Podcast Production',
      description:
        'End-to-end podcast recording and post-production for conversations that sound as considered as they feel.',
      icon: Radio,
    },
    {
      id: 'video-production',
      title: 'Video Production & Editing',
      description:
        'From a clear creative direction to the final edit, we produce video for social, campaigns and brand stories.',
      icon: Clapperboard,
    },
    {
      id: 'creative-content',
      title: 'Creative Content Production',
      description:
        'Photography, short-form video and campaign content made to feel coherent across your digital channels.',
      icon: Video,
    },
    {
      id: 'brand-identity',
      title: 'Brand Identity & Graphic Design',
      description:
        'Distinctive visual identities and practical design systems for brands building their next chapter.',
      icon: PenTool,
    },
  ] satisfies Array<{
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
  }>,
} as const;

export type Service = (typeof SITE_CONFIG.services)[number];
