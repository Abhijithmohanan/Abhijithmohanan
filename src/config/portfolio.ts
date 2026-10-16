import { assetUrl } from './assets';

export const PORTFOLIO_DEMOS = [
  {
    id: 'brand-film-concept',
    title: 'Brand Film Concept',
    category: 'Brand film',
    filter: 'Film',
    image: assetUrl('images/concept-brand-film.webp'),
    imageAlt: 'Cinematic close-up of a professional camera and lens.',
    concept: 'A cinematic introduction to a bold brand story.',
  },
  {
    id: 'content-series-concept',
    title: 'Content Series Concept',
    category: 'Content series',
    filter: 'Studio',
    image: assetUrl('images/concept-content-series.webp'),
    imageAlt: 'Colourful music and content production studio with guitars and recording equipment.',
    concept: 'A visual direction for a recurring content series.',
  },
  {
    id: 'campaign-concept',
    title: 'Campaign Concept',
    category: 'Campaign',
    filter: 'Campaign',
    image: assetUrl('images/concept-campaign.webp'),
    imageAlt: 'Laptop displaying a digital campaign dashboard and analytics.',
    concept: 'A look and feel for a digital campaign.',
  },
] as const;
export type PortfolioFilter = 'All' | 'Film' | 'Studio' | 'Campaign';
