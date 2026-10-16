import { useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../config/site';

type AuthMode = 'login' | 'register';

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const isRegister = mode === 'register';
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (isRegister) {
      const formData = new FormData(form);
      if (formData.get('password') !== formData.get('confirmPassword')) {
        setMessage('Your passwords do not match. Please check them and try again.');
        form.querySelector<HTMLInputElement>('#confirmPassword')?.focus();
        return;
      }
    }

    setMessage('Authentication is not connected yet. Your details were not sent.');
  };

  const clearMessage = () => setMessage('');

  return (
    <>
      <Helmet>
        <title>{isRegister ? 'Create an Account' : 'Client Login'} | {SITE_CONFIG.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="relative isolate flex min-h-[calc(100svh-77px)] items-center justify-center overflow-hidden px-5 py-14 sm:min-h-[calc(100svh-89px)] sm:px-8 sm:py-20">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/[0.07] blur-3xl"
          aria-hidden="true"
        />

        <div className="w-full max-w-[440px] border border-white/10 bg-[#151517] p-6 shadow-2xl shadow-black/20 sm:p-10">
          <div className="mb-8 flex items-center gap-3">
            <img
              src="/images/black-humor-productions-logo.png"
              alt=""
              width="48"
              height="48"
              className="h-11 w-11 object-contain"
            />
            <span className="h-8 w-px bg-brand-red" aria-hidden="true" />
            <div>
              <p className="font-display text-xs font-extrabold tracking-[0.08em] text-white">
                BLACK <span className="text-brand-red">HUMOR</span>
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500">
                Productions
              </p>
            </div>
          </div>

          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
            Client access
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-[-0.05em] text-white">
            {isRegister ? 'Create your account.' : 'Welcome back.'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            {isRegister
              ? 'Set up an account to stay connected with the studio.'
              : 'Sign in to your Black Humor Productions account.'}
          </p>

          <form onSubmit={handleSubmit} onChange={clearMessage} className="mt-8 space-y-5">
            {isRegister && (
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-xs font-semibold text-neutral-300"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold text-neutral-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-neutral-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={8}
                required
                className={inputClass}
              />
              {isRegister && (
                <p className="mt-2 text-xs text-neutral-500">Use at least 8 characters.</p>
              )}
            </div>

            {isRegister && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-xs font-semibold text-neutral-300"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className={inputClass}
                />
              </div>
            )}

            {!isRegister && (
              <div className="-mt-1 text-right">
                <a
                  href={`mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent('Password reset')}`}
                  className="text-xs font-semibold text-brand-gold transition hover:text-white"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-button px-5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-brand-button-hover focus-visible:outline-offset-4"
            >
              {isRegister ? 'Create account' : 'Sign in'}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <p aria-live="polite" className="min-h-5 text-center text-xs leading-5 text-brand-gold">
              {message}
            </p>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-xs text-neutral-400">
            <LockKeyhole size={14} aria-hidden="true" />
            <span>
              {isRegister ? 'Already have an account?' : 'New to the studio?'}
            </span>
            <Link
              to={isRegister ? '/login' : '/register'}
              className="font-semibold text-white underline decoration-brand-red underline-offset-4 transition hover:text-brand-gold"
            >
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const inputClass =
  'min-h-12 w-full border border-white/15 bg-brand-dark px-4 text-sm text-white placeholder:text-neutral-600 transition focus:border-brand-gold focus:outline-none';
