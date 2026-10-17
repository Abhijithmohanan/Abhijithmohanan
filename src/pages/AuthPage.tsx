import { useEffect, useState, type FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SITE_CONFIG } from '../config/site';
import { auth, googleProvider } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ensureMemberProfile } from '../services/memberService';

type AuthMode = 'login' | 'register';
type Notice = { type: 'success' | 'error'; text: string };
type AuthPageLocationState = { from?: { pathname?: string } };

const authErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'An account already uses this email. Try signing in instead.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/invalid-login-credentials': 'Email or password is incorrect.',
  'auth/user-not-found': 'No account was found for this email.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
  'auth/password-does-not-meet-requirements':
    'Choose a password that meets the requirements and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Could not reach Firebase. Check your internet connection.',
  'auth/operation-not-allowed':
    'Email and password sign-in is not enabled for this Firebase project.',
  'auth/invalid-api-key': 'Firebase is not configured correctly. Please contact the site owner.',
  'auth/unauthorized-domain':
    'This site domain is not authorized in Firebase Authentication.',
  'auth/user-disabled': 'This account is disabled. Contact the studio for help.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed before completion.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
  'auth/cancelled-popup-request': 'A Google sign-in window is already open.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email. Sign in using its original method.',
};

function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return (
      authErrorMessages[error.code] ??
      'Firebase could not complete the request. Please try again.'
    );
  }
  return 'Something went wrong. Please try again.';
}

function getFirestoreErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') {
      return 'Firestore denied access to the users collection. Check your Firestore security rules.';
    }
    if (error.code === 'unavailable') {
      return 'Firestore is temporarily unavailable. Please try again.';
    }
  }
  return 'Firestore could not save your user profile. Please try again.';
}

export default function AuthPage({
  mode,
  adminEntry = false,
}: {
  mode: AuthMode;
  adminEntry?: boolean;
}) {
  const isRegister = mode === 'register';
  const { user, isAdmin, isLoading: isCheckingSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (isCheckingSession || !user) return;

    if (adminEntry && !isAdmin) {
      navigate('/access-denied', { replace: true });
      return;
    }

    const destination = adminEntry
      ? '/admin'
      : (location.state as AuthPageLocationState | null)?.from?.pathname ??
        (isAdmin ? '/admin' : '/dashboard');
    navigate(destination, { replace: true });
  }, [adminEntry, user, isAdmin, isCheckingSession, location.state, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const fullName = String(formData.get('fullName') ?? '').trim();
    setNotice(null);

    if (isRegister && !fullName) {
      setNotice({ type: 'error', text: 'Enter your full name.' });
      form.querySelector<HTMLInputElement>('#fullName')?.focus();
      return;
    }

    if (isRegister && password !== formData.get('confirmPassword')) {
      setNotice({
        type: 'error',
        text: 'Your passwords do not match. Please check them and try again.',
      });
      form.querySelector<HTMLInputElement>('#confirmPassword')?.focus();
      return;
    }

    setIsBusy(true);
    try {
      if (isRegister) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await updateProfile(credential.user, { displayName: fullName });
          await ensureMemberProfile(credential.user);
        } catch (error) {
          setNotice({
            type: 'error',
            text: `Your account was created, but its profile could not be saved. ${getFirestoreErrorMessage(error)}`,
          });
          return;
        }
        setNotice({ type: 'success', text: 'Your account is ready. You are now signed in.' });
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await ensureMemberProfile(credential.user);
        setNotice({ type: 'success', text: 'You are now signed in.' });
      }
    } catch (error) {
      setNotice({ type: 'error', text: getAuthErrorMessage(error) });
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsBusy(true);
    setNotice(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const additionalInfo = getAdditionalUserInfo(result);

      try {
        await ensureMemberProfile(result.user);
      } catch (error) {
        setNotice({
          type: 'error',
          text: `Your Google account${additionalInfo?.isNewUser ? ' was created' : ''} and you are signed in, but we could not save your user profile. ${getFirestoreErrorMessage(error)}`,
        });
        return;
      }

      setNotice({
        type: 'success',
        text: additionalInfo?.isNewUser
          ? 'Your account is ready. You are now signed in.'
          : 'You are now signed in.',
      });
    } catch (error) {
      setNotice({ type: 'error', text: getAuthErrorMessage(error) });
    } finally {
      setIsBusy(false);
    }
  };

  const handlePasswordReset = async (form: HTMLFormElement | null) => {
    const emailInput = form?.querySelector<HTMLInputElement>('#email');
    const email = emailInput?.value.trim() ?? '';
    setNotice(null);

    if (!email) {
      setNotice({ type: 'error', text: 'Enter your email address first.' });
      emailInput?.focus();
      return;
    }

    setIsBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice({
        type: 'success',
        text: 'If an account exists for this email, password reset instructions have been sent.',
      });
    } catch (error) {
      setNotice({ type: 'error', text: getAuthErrorMessage(error) });
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignOut = async () => {
    setIsBusy(true);
    setNotice(null);
    try {
      await signOut(auth);
      setNotice({ type: 'success', text: 'You have signed out.' });
    } catch (error) {
      setNotice({ type: 'error', text: getAuthErrorMessage(error) });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isRegister ? 'Create an Account' : 'Login'} | {SITE_CONFIG.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="relative isolate flex min-h-[calc(100svh-77px)] items-center justify-center overflow-hidden px-5 py-14 sm:min-h-[calc(100svh-89px)] sm:px-8 sm:py-20">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/[0.07] blur-3xl"
          aria-hidden="true"
        />

        <div className="w-full max-w-[440px] border border-white/10 bg-[#151517] p-6 shadow-2xl shadow-black/20 sm:p-10">
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-[-0.05em] text-white">
            {isRegister ? 'Create your account.' : 'Login.'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            {isRegister
              ? 'Set up an account to stay connected with the studio.'
              : 'Sign in to your Black Humor Productions account.'}
          </p>

          {isCheckingSession ? (
            <p role="status" className="mt-8 text-sm text-neutral-400">
              Checking your session…
            </p>
          ) : user ? (
            <div className="mt-8 space-y-5">
              <div className="border border-white/10 bg-brand-dark p-4">
                <p className="text-sm font-semibold text-white">
                  {user.displayName || user.email}
                </p>
                {user.displayName && (
                  <p className="mt-1 text-xs text-neutral-400">{user.email}</p>
                )}
                <p className="mt-2 text-xs text-neutral-500">You are signed in.</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isBusy}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 px-5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:border-white/35 hover:bg-white/[0.04] disabled:cursor-wait disabled:opacity-60"
              >
                {isBusy ? 'Signing out…' : 'Sign out'}
              </button>
              <Notice notice={notice} />
            </div>
          ) : (
            <>
              <form
                onSubmit={handleSubmit}
                onChange={() => setNotice(null)}
                className="mt-8 space-y-5"
              >
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
                      disabled={isBusy}
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
                    disabled={isBusy}
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
                    disabled={isBusy}
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
                      disabled={isBusy}
                      className={inputClass}
                    />
                  </div>
                )}

                {!isRegister && (
                  <div className="-mt-1 text-right">
                    <button
                      type="button"
                      onClick={(event) => handlePasswordReset(event.currentTarget.form)}
                      disabled={isBusy}
                      className="text-xs font-semibold text-brand-gold transition hover:text-white disabled:cursor-wait disabled:opacity-60"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBusy}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-button px-5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-brand-button-hover focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60"
                >
                  {isBusy
                    ? isRegister
                      ? 'Creating account…'
                      : 'Signing in…'
                    : isRegister
                      ? 'Create account'
                      : 'Sign in'}
                  {!isBusy && <ArrowRight size={16} aria-hidden="true" />}
                </button>
                <div className="flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    or
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isBusy}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-white/15 px-5 text-xs font-bold text-white transition hover:border-white/35 hover:bg-white/[0.04] focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60"
                >
                  <GoogleMark />
                  Continue with Google
                </button>
                <Notice notice={notice} />
              </form>

              <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-xs text-neutral-400">
                <LockKeyhole size={14} aria-hidden="true" />
                <span>{isRegister ? 'Already have an account?' : 'New to the studio?'}</span>
                <Link
                  to={isRegister ? '/login' : '/register'}
                  className="font-semibold text-white underline decoration-brand-red underline-offset-4 transition hover:text-brand-gold"
                >
                  {isRegister ? 'Sign in' : 'Create an account'}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.72 6C44.42 38.08 46.98 31.84 46.98 24.55Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.95 23.95 0 0 0 0 21.56l7.98-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.72-6c-2.13 1.43-4.85 2.3-8.19 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}

function Notice({ notice }: { notice: Notice | null }) {
  if (!notice) return null;

  return (
    <p
      role={notice.type === 'error' ? 'alert' : 'status'}
      className={`text-center text-xs leading-5 ${
        notice.type === 'error' ? 'text-brand-red' : 'text-brand-gold'
      }`}
    >
      {notice.text}
    </p>
  );
}

const inputClass =
  'min-h-12 w-full border border-white/15 bg-brand-dark px-4 text-sm text-white placeholder:text-neutral-600 transition focus:border-brand-gold focus:outline-none disabled:cursor-wait disabled:opacity-60';
