import { useEffect, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SITE_CONFIG } from '../config/site';

type FieldName = 'name' | 'contact' | 'service' | 'details';
type FormErrors = Partial<Record<FieldName, string>>;

export default function Contact() {
  const [searchParams] = useSearchParams();
  const [selectedService, setSelectedService] = useState(searchParams.get('service') ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [whatsAppInquiry, setWhatsAppInquiry] = useState('');

  useEffect(() => {
    const service = searchParams.get('service') ?? '';
    setSelectedService(
      SITE_CONFIG.services.some((item) => item.id === service) ? service : '',
    );
  }, [searchParams]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const contact = String(formData.get('contact') ?? '').trim();
    const service = String(formData.get('service') ?? '');
    const details = String(formData.get('details') ?? '').trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const isPhone = /\d/.test(contact) && /^\+?[\d\s().-]{7,}$/.test(contact);
    const nextErrors: FormErrors = {};

    if (!name) nextErrors.name = 'Please enter your name.';
    if (!isEmail && !isPhone) {
      nextErrors.contact = 'Enter a valid email address or phone number.';
    }
    if (!SITE_CONFIG.services.some((item) => item.id === service)) {
      nextErrors.service = 'Please choose a service.';
    }
    if (!details) nextErrors.details = 'Please add a few details about your project.';

    setErrors(nextErrors);
    setWhatsAppInquiry('');

    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      form.querySelector<HTMLElement>(`#${firstInvalidField}`)?.focus();
      return;
    }

    const serviceTitle = SITE_CONFIG.services.find((item) => item.id === service)?.title;
    const message = [
      `Hello ${SITE_CONFIG.name},`,
      '',
      `I'm ${name}.`,
      `You can reach me at: ${contact}`,
      `I'm interested in: ${serviceTitle}`,
      '',
      'Project details:',
      details,
    ].join('\n');

    setWhatsAppInquiry(
      `${SITE_CONFIG.whatsappLink}?text=${encodeURIComponent(message)}`,
    );
  };

  const clearError = (field: FieldName) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setWhatsAppInquiry('');
  };

  return (
    <>
      <Helmet>
        <title>Contact the Studio | {SITE_CONFIG.name}</title>
        <meta
          name="description"
          content="Start a project with Black Humor Productions in Nooranad, Kerala. Email, call or WhatsApp +91 9544 405 504."
        />
        <meta property="og:title" content={`Contact the Studio | ${SITE_CONFIG.name}`} />
      </Helmet>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mb-10 max-w-3xl sm:mb-14">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">
            Get in touch
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-white sm:text-6xl">
            Let’s make something <span className="text-brand-red">matter.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">
            Tell us what you’re thinking. We’ll start with a conversation and work out the right
            next step together.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.15em] text-neutral-300">
              The studio
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <Phone size={18} className="mt-1 shrink-0 text-brand-gold" aria-hidden="true" />
                <div>
                  <p className="mb-1 text-xs text-neutral-500">Call us</p>
                  <a
                    href={`tel:${SITE_CONFIG.phoneHref}`}
                    className="text-base font-semibold text-white transition hover:text-brand-red"
                  >
                    {SITE_CONFIG.phone}
                  </a>
                </div>
              </div>
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <MessageCircle
                  size={18}
                  className="mt-1 shrink-0 text-brand-gold"
                  aria-hidden="true"
                />
                <div>
                  <p className="mb-1 text-xs text-neutral-500">WhatsApp</p>
                  <a
                    href={SITE_CONFIG.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-semibold text-white transition hover:text-brand-red"
                  >
                    Start a conversation
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              </div>
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <Mail size={18} className="mt-1 shrink-0 text-brand-gold" aria-hidden="true" />
                <div>
                  <p className="mb-1 text-xs text-neutral-500">Email</p>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="break-all text-base font-semibold text-white transition hover:text-brand-red"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </div>
              </div>
              <div className="flex gap-4 border-t border-white/10 pt-5">
                <MapPin size={18} className="mt-1 shrink-0 text-brand-gold" aria-hidden="true" />
                <div>
                  <p className="mb-1 text-xs text-neutral-500">Find us</p>
                  <p className="text-base font-semibold leading-6 text-white">
                    {SITE_CONFIG.location}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-8 border-l-2 border-brand-gold/60 pl-4 text-xs leading-6 text-neutral-500">
              The inquiry form prepares a message for WhatsApp. Nothing is sent until you review
              and send it there.
            </p>
          </div>

          <div className="border border-white/10 bg-[#151517] p-5 sm:p-8 lg:p-10">
            <h2 className="font-display text-xl font-bold text-white">Tell us about your project</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Share a few details and we’ll prepare a WhatsApp message for you.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-xs font-semibold text-neutral-300">
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  type="text"
                  onChange={() => clearError('name')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className="min-h-12 w-full border border-white/10 bg-brand-dark px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-brand-gold focus:outline-none"
                  placeholder="Name"
                />
                {errors.name && <FieldError id="name-error" message={errors.name} />}
              </div>

              <div>
                <label htmlFor="contact" className="mb-2 block text-xs font-semibold text-neutral-300">
                  Phone or email
                </label>
                <input
                  id="contact"
                  name="contact"
                  autoComplete="email"
                  type="text"
                  onChange={() => clearError('contact')}
                  aria-invalid={Boolean(errors.contact)}
                  aria-describedby={errors.contact ? 'contact-error' : undefined}
                  className="min-h-12 w-full border border-white/10 bg-brand-dark px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-brand-gold focus:outline-none"
                  placeholder="How can we reach you?"
                />
                {errors.contact && <FieldError id="contact-error" message={errors.contact} />}
              </div>

              <div>
                <label htmlFor="service" className="mb-2 block text-xs font-semibold text-neutral-300">
                  Service of interest
                </label>
                <select
                  id="service"
                  name="service"
                  value={selectedService}
                  onChange={(event) => {
                    setSelectedService(event.target.value);
                    clearError('service');
                  }}
                  aria-invalid={Boolean(errors.service)}
                  aria-describedby={errors.service ? 'service-error' : undefined}
                  className="min-h-12 w-full border border-white/10 bg-brand-dark px-4 py-3 text-sm text-neutral-200 focus:border-brand-gold focus:outline-none"
                >
                  <option value="">Choose a service</option>
                  {SITE_CONFIG.services.map((service) => (
                    <option key={service.id} value={service.id}>{service.title}</option>
                  ))}
                </select>
                {errors.service && <FieldError id="service-error" message={errors.service} />}
              </div>

              <div>
                <label htmlFor="details" className="mb-2 block text-xs font-semibold text-neutral-300">
                  Project details
                </label>
                <textarea
                  id="details"
                  name="details"
                  rows={4}
                  onChange={() => clearError('details')}
                  aria-invalid={Boolean(errors.details)}
                  aria-describedby={errors.details ? 'details-error' : undefined}
                  className="w-full resize-y border border-white/10 bg-brand-dark px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-brand-gold focus:outline-none"
                  placeholder="A little about your idea, timeline or goals..."
                />
                {errors.details && <FieldError id="details-error" message={errors.details} />}
              </div>

              <button
                type="submit"
                className="min-h-[52px] w-full bg-brand-button px-6 py-4 text-sm font-bold text-white transition hover:bg-brand-button-hover focus-visible:outline-offset-4"
              >
                Prepare WhatsApp inquiry
              </button>

              {whatsAppInquiry && (
                <div
                  role="status"
                  className="border border-brand-gold/35 bg-brand-gold/[0.07] p-4 text-sm leading-6 text-neutral-200"
                >
                  Your message is ready. Review it in WhatsApp and press send when you’re happy
                  with it.
                  <a
                    href={whatsAppInquiry}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex font-bold text-brand-gold underline decoration-brand-gold/40 underline-offset-4 hover:text-white"
                  >
                    Open WhatsApp
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-2 text-xs font-medium text-rose-300">
      {message}
    </p>
  );
}
