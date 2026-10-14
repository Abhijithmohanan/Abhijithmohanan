export const PORTFOLIO_DEMOS = [
  {
    id: 'frame-by-frame',
    title: 'Frame by Frame',
    category: 'Film & content',
    filter: 'Film',
    image: '/images/film-concept.webp',
    imageAlt: 'Camera equipment arranged for a visual production',
    concept: 'A visual direction study for a contemporary camera brand.',
  },
  {
    id: 'the-listening-room',
    title: 'The Listening Room',
    category: 'Podcast',
    filter: 'Studio',
    image: '/images/podcast-concept.webp',
    imageAlt: 'A warmly lit recording studio prepared for a conversation',
    concept: 'A studio atmosphere concept for a thoughtful new podcast.',
  },
  {
    id: 'good-things-grow',
    title: 'Good Things Grow',
    category: 'Campaign',
    filter: 'Campaign',
    image: '/images/campaign-concept.webp',
    imageAlt: 'A screen showing a modern digital interface',
    concept: 'An imagined digital launch for an independent local business.',
  },
] as const;

export type PortfolioFilter = 'All' | 'Film' | 'Studio' | 'Campaign';
