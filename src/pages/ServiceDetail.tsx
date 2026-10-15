import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import NotFound from './NotFound';
import { SITE_CONFIG } from '../config/site';

const serviceStories = {
  'social-media-management': {
    eyebrow: 'Presence with a point of view',
    headline: 'Show up consistently. Sound unmistakably like you.',
    intro:
      'Social media works best when every post belongs to a bigger story. We help shape a considered presence around your voice, audience and capacity.',
    overview:
      'From channel priorities to a practical publishing rhythm, we turn scattered ideas into an editorial plan your team can use. The focus is on purposeful content and a recognisable voice—not posting for the sake of it.',
    approach:
      'We begin with your audience and existing channels, agree the role each platform should play, then build a flexible calendar with formats and creative direction. We review what resonates and use those observations to inform the next cycle.',
    process: ['Review your channels and audience', 'Set voice, themes and publishing rhythm', 'Plan content and refine from feedback'],
    useCases: ['A more consistent brand presence', 'A launch or seasonal content calendar', 'Ongoing creative support for a small team'],
  },
  'digital-marketing': {
    eyebrow: 'A strategy built around real priorities',
    headline: 'Connect the channels. Make every move count.',
    intro:
      'Digital marketing should feel joined up. We help you clarify what matters, choose useful channels and create a plan that can be measured and improved.',
    overview:
      'We bring content, campaign planning and channel coordination into one clear direction. Recommendations are grounded in your goals and available resources, with practical measures agreed before activity begins.',
    approach:
      'We map the audience journey, identify the most relevant digital touchpoints, and shape a focused plan. As work goes live, we look at the signals available, share what they suggest and adjust the next steps together.',
    process: ['Clarify goals, audience and current activity', 'Prioritise channels and define measures', 'Coordinate delivery and review learning'],
    useCases: ['A clearer digital marketing plan', 'A campaign across several online channels', 'A review of current content and activity'],
  },
  'online-advertising': {
    eyebrow: 'Campaigns designed to earn attention',
    headline: 'Put the right idea in front of the right people.',
    intro:
      'Thoughtful advertising starts before the launch button. We help shape campaign ideas, creative and audience direction around the outcome you want.',
    overview:
      'From a campaign brief to a set of platform-ready creative, we help align the message, audience and placement. We keep the plan grounded in the information and access available, without promising outcomes no campaign can guarantee.',
    approach:
      'We agree the campaign objective and audience, develop a clear message and creative direction, prepare the assets, then review available performance signals to guide sensible refinements.',
    process: ['Define the objective and audience', 'Develop messaging and creative assets', 'Launch, review and refine the campaign'],
    useCases: ['Promoting a product, service or event', 'Supporting a time-bound launch', 'Testing a new message with a defined audience'],
  },
  'podcast-production': {
    eyebrow: 'Make room for a good conversation',
    headline: 'Turn a strong voice into a show worth staying for.',
    intro:
      'A compelling podcast is more than a microphone. We help make recording, editing and publishing feel considered, clear and repeatable.',
    overview:
      'Whether you are developing a new format or producing an individual episode, we can support the planning and post-production that brings a conversation into focus—from clean edits to platform-ready audio.',
    approach:
      'We shape the episode format and recording plan with you, prepare the session, edit for clarity and pacing, and deliver files suited to the publishing destinations you choose.',
    process: ['Shape the format and episode plan', 'Record with a clear run of show', 'Edit, review and prepare the final files'],
    useCases: ['Launching a first podcast series', 'Producing a one-off interview or branded episode', 'Building a consistent post-production workflow'],
  },
  'video-production': {
    eyebrow: 'From first frame to final cut',
    headline: 'Give your story a picture, pace and purpose.',
    intro:
      'A good video makes its point quickly and leaves something behind. We bring creative direction and practical production together for stories built to be watched.',
    overview:
      'We help shape a video from the initial idea through planning, production and editing. The format and final deliverables are considered for where the video will live and who it needs to reach.',
    approach:
      'We clarify the audience and message, map the story into a workable production plan, capture the material, then edit and prepare agreed versions for your channels.',
    process: ['Set the brief, message and visual direction', 'Plan and capture the footage', 'Edit, review and deliver channel-ready versions'],
    useCases: ['A brand introduction or campaign film', 'Short-form video for social channels', 'Interviews, explainers or event coverage'],
  },
  'creative-content': {
    eyebrow: 'A library of stories, not one-offs',
    headline: 'Create content that feels like it belongs together.',
    intro:
      'Strong content gives people more than one reason to notice you. We plan and produce photography and short-form video with a coherent visual language.',
    overview:
      'We develop a content direction that connects the story, setting and format. A planned shoot can create a considered set of assets for your website, social channels and campaign needs.',
    approach:
      'We start with the purpose and placements for each asset, shape a shot plan and visual references, produce the material, then edit and organise a set of ready-to-use files.',
    process: ['Agree the story, formats and placements', 'Plan the shoot and creative direction', 'Capture, edit and organise the content'],
    useCases: ['Refreshing a library of brand photography', 'Planning a series of short-form content', 'Creating launch assets across multiple channels'],
  },
} as const;

export default function ServiceDetail() {
  const { servicePath } = useParams();
  const service = SITE_CONFIG.services.find((item) => item.path === servicePath);
  const story = servicePath ? serviceStories[servicePath as keyof typeof serviceStories] : undefined;

  if (!service || !story) return <NotFound />;

  const serviceInquiry = `/contact?service=${encodeURIComponent(service.id)}`;

  return (
    <>
      <Helmet>
        <title>{service.title} | {SITE_CONFIG.name}</title>
        <meta name="description" content={story.intro} />
        <meta property="og:title" content={`${service.title} | ${SITE_CONFIG.name}`} />
        <meta property="og:description" content={story.intro} />
      </Helmet>

      <section className="border-b border-white/[0.08] bg-[#151517]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-12 lg:py-24">
          <div>
            <Link to="/services" className="mb-8 inline-flex text-xs font-semibold text-neutral-400 transition hover:text-white">
              Services <span className="px-2 text-brand-red">/</span> {service.title}
            </Link>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">{story.eyebrow}</p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.07] tracking-[-0.055em] text-white sm:text-6xl">
              {story.headline}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">{story.intro}</p>
            <Link to={serviceInquiry} className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-brand-button px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover">
              Discuss this service <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden border border-white/10">
            <img src={service.image} alt={service.imageAlt} width="1200" height="900" fetchPriority="high" className="h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 text-[9px] font-bold uppercase tracking-[0.17em] text-white/80">Black Humor Productions · {service.title}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-12 lg:py-24">
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">The service</p>
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">Built for the brief in front of you.</h2>
        </div>
        <div>
          <p className="text-base leading-8 text-neutral-300">{story.overview}</p>
          <h3 className="mt-8 font-display text-lg font-bold text-white">What we can make together</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {service.deliverables.map((deliverable) => (
              <li key={deliverable} className="flex items-start gap-3 border-t border-white/10 py-4 text-sm text-neutral-300">
                <Check size={16} className="mt-0.5 shrink-0 text-brand-gold" aria-hidden="true" />
                {deliverable}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#151517] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Our approach</p>
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">Clear steps. Room for good ideas.</h2>
              <p className="mt-5 text-sm leading-7 text-neutral-400 sm:text-base">{story.approach}</p>
            </div>
            <ol className="space-y-0">
              {story.process.map((step, index) => (
                <li key={step} className="flex gap-5 border-t border-white/15 py-5">
                  <span className="pt-1 text-xs font-semibold tracking-[0.14em] text-brand-red">{String(index + 1).padStart(2, '0')}</span>
                  <span className="font-display text-base font-semibold text-white">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[0.8fr_1.2fr] md:items-center lg:px-12 lg:py-24">
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">A good fit for</p>
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">Where this work can help.</h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {story.useCases.map((useCase) => (
            <li key={useCase} className="border border-white/10 bg-white/[0.02] p-5 text-sm leading-6 text-neutral-300">{useCase}</li>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/[0.08] bg-[#151517]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:px-8 sm:py-16 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Have something in mind?</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">Let’s talk about your {service.title.toLowerCase()} brief.</h2>
          </div>
          <Link to={serviceInquiry} className="inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-brand-button px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover">
            Start an inquiry <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
