import { useEffect, useState, type ChangeEventHandler, type FormEvent, type ReactNode } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ArrowRight, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MEMBERSHIP_TYPES, formatDate, statusTone, type MembershipRequest } from '../config/membership';
import { getDatabase } from '../config/firebase';
import PortalFrame from '../components/PortalFrame';

type RequestHistory = {
  id: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  timestamp: Timestamp;
  message: string;
};

type MemberProfileData = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  membershipStatus: string;
};

type LoadState<T> = { data: T; loading: boolean; error: string };

const panelClass = 'border border-white/10 bg-[#151517] p-5 sm:p-7';
const inputClass =
  'min-h-12 w-full border border-white/15 bg-brand-dark px-4 text-sm text-white placeholder:text-neutral-600 transition focus:border-brand-gold focus:outline-none disabled:cursor-wait disabled:opacity-60';
const MemberFrame = PortalFrame;

function getErrorMessage(error: unknown) {
  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    return 'Your account does not have permission to access this information.';
  }
  if (error instanceof FirebaseError && error.code === 'unavailable') {
    return 'The membership service is temporarily unavailable. Please try again.';
  }
  return 'We could not load or save this information. Please try again.';
}

function useMemberRequests(userId: string | undefined) {
  const [state, setState] = useState<LoadState<MembershipRequest[]>>({
    data: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (!userId) {
      setState({ data: [], loading: false, error: '' });
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const db = await getDatabase();
        if (!active) return;
        const requestsQuery = query(
          collection(db, 'membershipRequests'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
        );
        return onSnapshot(
          requestsQuery,
          (snapshot) =>
            setState({
              data: snapshot.docs.map(
                (request) => ({ id: request.id, ...request.data() }) as MembershipRequest,
              ),
              loading: false,
              error: '',
            }),
          (error) =>
            setState({ data: [], loading: false, error: getErrorMessage(error) }),
        );
      } catch (error) {
        if (active) setState({ data: [], loading: false, error: getErrorMessage(error) });
      }
    };

    let unsubscribe: (() => void) | undefined;
    void load().then((stop) => {
      unsubscribe = stop;
      if (!active) stop?.();
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [userId]);

  return state;
}

function useMemberProfile(userId: string | undefined) {
  const [state, setState] = useState<LoadState<MemberProfileData | null>>({
    data: null,
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (!userId) {
      setState({ data: null, loading: false, error: '' });
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;
    void getDatabase()
      .then((db) => {
        if (!active) return;
        unsubscribe = onSnapshot(
          doc(db, 'users', userId),
          (snapshot) =>
            setState({
              data: snapshot.exists()
                ? ({ uid: snapshot.id, ...snapshot.data() } as MemberProfileData)
                : null,
              loading: false,
              error: '',
            }),
          (error) => setState({ data: null, loading: false, error: getErrorMessage(error) }),
        );
        if (!active) unsubscribe();
      })
      .catch((error: unknown) => {
        if (active) setState({ data: null, loading: false, error: getErrorMessage(error) });
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [userId]);

  return state;
}

function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="border border-brand-red/25 bg-brand-red/5 p-4 text-sm text-red-200">
      {children}
    </p>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${statusTone(status)}`}
    >
      {status}
    </span>
  );
}

function RequestCard({ request }: { request: MembershipRequest }) {
  return (
    <Link
      to={`/requests/${request.id}`}
      className={`${panelClass} block transition hover:border-white/25`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-white">{request.membershipType}</p>
          <p className="mt-1 text-xs text-neutral-500">
            Ref. {request.id} · {formatDate(request.createdAt)}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-neutral-400">{request.reason}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-gold">
        View request <ArrowRight size={14} aria-hidden="true" />
      </span>
    </Link>
  );
}

function RequestList({
  requests,
  loading,
  error,
}: {
  requests: MembershipRequest[];
  loading: boolean;
  error: string;
}) {
  if (loading) return <p role="status" className="text-sm text-neutral-400">Loading requests…</p>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (requests.length === 0) {
    return (
      <div className={panelClass}>
        <p className="font-display text-lg font-bold text-white">No requests yet</p>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Your membership applications and their progress will appear here.
        </p>
        <Link
          to="/requests/new"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-button px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover"
        >
          Raise a request <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {requests.map((request) => <RequestCard key={request.id} request={request} />)}
    </div>
  );
}

export function MemberDashboard() {
  const { user } = useAuth();
  const requests = useMemberRequests(user?.uid);
  const profile = useMemberProfile(user?.uid);
  const status =
    requests.data[0]?.status ?? profile.data?.membershipStatus ?? 'Not Applied';

  return (
    <MemberFrame title="Your dashboard">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className={`${panelClass} relative overflow-hidden`}>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-red/10 blur-3xl" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold">Your membership</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {user?.displayName?.split(' ')[0] || 'member'}.
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            Keep track of your membership application and updates from the studio.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            <Link
              to="/requests/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-button px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover"
            >
              Raise membership request <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={panelClass}>
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-neutral-300">
                <UserRound size={22} aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <p className="font-display font-bold text-white">{user?.displayName || 'Member'}</p>
              <p className="mt-1 break-all text-xs text-neutral-400">{user?.email}</p>
            </div>
          </div>
          {profile.error && <p className="mt-4 text-xs text-brand-red">{profile.error}</p>}
          <Link to="/profile" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-brand-gold hover:text-white">
            Manage profile <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Progress</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">Recent requests</h2>
          </div>
          <Link to="/requests" className="text-xs font-semibold text-neutral-400 hover:text-white">View all</Link>
        </div>
        <RequestList requests={requests.data.slice(0, 4)} loading={requests.loading} error={requests.error} />
      </div>
    </MemberFrame>
  );
}

export function MembershipRequests() {
  const { user } = useAuth();
  const requests = useMemberRequests(user?.uid);
  return (
    <MemberFrame title="My requests">
      <RequestList requests={requests.data} loading={requests.loading} error={requests.error} />
    </MemberFrame>
  );
}

export function NewMembershipRequest() {
  const { user } = useAuth();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState('');

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const applicantName = String(data.get('applicantName') ?? '').trim();
    const applicantEmail = user.email ?? '';
    const phoneNumber = String(data.get('phoneNumber') ?? '').trim();
    const membershipType = String(data.get('membershipType') ?? '');
    const reason = String(data.get('reason') ?? '').trim();
    const additionalInformation = String(data.get('additionalInformation') ?? '').trim();

    if (!data.get('terms')) {
      setError('Please agree to the membership terms and privacy policy before submitting.');
      return;
    }
    if (!MEMBERSHIP_TYPES.includes(membershipType as (typeof MEMBERSHIP_TYPES)[number])) {
      setError('Choose a membership category from the list.');
      return;
    }

    setIsBusy(true);
    setError('');
    try {
      const db = await getDatabase();
      const requestRef = doc(collection(db, 'membershipRequests'));
      const batch = writeBatch(db);
      batch.set(requestRef, {
        userId: user.uid,
        applicantName,
        applicantEmail,
        phoneNumber,
        membershipType,
        reason,
        additionalInformation,
        status: 'Pending',
        adminRemarks: '',
        memberVisibleMessage: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'membershipRequests', requestRef.id, 'history', 'submitted'), {
        previousStatus: '',
        newStatus: 'Pending',
        changedBy: user.uid,
        timestamp: serverTimestamp(),
        message: 'Membership request submitted.',
      });
      await batch.commit();
      setCreatedId(requestRef.id);
      form.reset();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <MemberFrame title="Raise a membership request">
      {createdId ? (
        <div className={`${panelClass} max-w-2xl`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Request submitted</p>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-white">Thanks for applying.</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Your request is pending review. Keep this reference number for your records:
          </p>
          <p className="mt-4 break-all border border-white/10 bg-brand-dark p-4 font-mono text-sm text-white">{createdId}</p>
          <Link to={`/requests/${createdId}`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-button px-5 text-xs font-bold uppercase text-white hover:bg-brand-button-hover">
            Track request <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <form onSubmit={submitRequest} className={`${panelClass} max-w-3xl space-y-5`}>
          <p className="text-sm leading-6 text-neutral-400">
            Share a little about yourself and the membership you’re interested in. Required fields are marked.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="applicantName" defaultValue={user?.displayName ?? ''} required maxLength={120} />
            <Field label="Email address" name="email" type="email" defaultValue={user?.email ?? ''} disabled required />
            <Field label="Phone number" name="phoneNumber" type="tel" autoComplete="tel" minLength={7} maxLength={30} required />
            <div>
              <label htmlFor="membershipType" className="mb-2 block text-xs font-semibold text-neutral-300">Membership type *</label>
              <select id="membershipType" name="membershipType" required defaultValue="" className={inputClass}>
                <option value="" disabled>Select a category</option>
                {MEMBERSHIP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
          <TextArea label="Why are you requesting membership?" name="reason" minLength={20} maxLength={2000} required />
          <TextArea label="Additional information (optional)" name="additionalInformation" maxLength={2000} />
          <label className="flex items-start gap-3 text-xs leading-5 text-neutral-400">
            <input name="terms" type="checkbox" required className="mt-1 accent-[#c83243]" />
            <span>I confirm these details are accurate and agree to the membership terms and privacy policy. *</span>
          </label>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-button px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-button-hover disabled:cursor-wait disabled:opacity-60"
          >
            {isBusy ? 'Submitting…' : 'Submit request'}
            {!isBusy && <ArrowRight size={15} aria-hidden="true" />}
          </button>
        </form>
      )}
    </MemberFrame>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  value,
  disabled,
  required,
  minLength,
  maxLength,
  autoComplete,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-semibold text-neutral-300">
        {label}{required ? ' *' : ''}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={inputClass}
        defaultValue={defaultValue}
        value={value}
        disabled={disabled}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={onChange}
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  required = false,
  minLength,
  maxLength,
}: {
  label: string;
  name: string;
  required?: boolean;
  minLength?: number;
  maxLength: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-semibold text-neutral-300">
        {label}{required ? ' *' : ''}
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        className={`${inputClass} py-3`}
      />
    </div>
  );
}

export function MembershipRequestDetail({
  adminView = false,
  embedded = false,
}: {
  adminView?: boolean;
  embedded?: boolean;
}) {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState<MembershipRequest | null>(null);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !requestId) return;
    let active = true;
    let stopRequest: (() => void) | undefined;
    let stopHistory: (() => void) | undefined;
    void getDatabase()
      .then((db) => {
        if (!active) return;
        stopRequest = onSnapshot(
          doc(db, 'membershipRequests', requestId),
          (snapshot) => {
            if (!snapshot.exists()) {
              setError('This membership request could not be found.');
              setLoading(false);
              return;
            }
            setRequest({ id: snapshot.id, ...snapshot.data() } as MembershipRequest);
            setLoading(false);
            setError('');
          },
          (loadError) => {
            setError(getErrorMessage(loadError));
            setLoading(false);
          },
        );
        stopHistory = onSnapshot(
          query(
            collection(db, 'membershipRequests', requestId, 'history'),
            orderBy('timestamp', 'asc'),
          ),
          (snapshot) =>
            setHistory(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as RequestHistory)),
          (loadError) => setError(getErrorMessage(loadError)),
        );
        if (!active) {
          stopRequest();
          stopHistory();
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(getErrorMessage(loadError));
          setLoading(false);
        }
      });
    return () => {
      active = false;
      stopRequest?.();
      stopHistory?.();
    };
  }, [requestId, user]);

  const frame = (children: ReactNode) => embedded ? <>{children}</> : (
    <PortalFrame admin={adminView} title={adminView ? 'Review membership request' : 'Request tracking'}>
      {children}
    </PortalFrame>
  );

  if (loading) return frame(<p role="status" className="text-sm text-neutral-400">Loading request…</p>);
  if (error) return frame(<ErrorMessage>{error}</ErrorMessage>);
  if (!request) return frame(<ErrorMessage>This request is unavailable.</ErrorMessage>);

  return frame(
    <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <div className={panelClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-500">Request reference</p>
            <p className="mt-1 break-all font-mono text-sm text-white">{request.id}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <dl className="mt-7 grid gap-5 sm:grid-cols-2">
          <Detail label="Membership type" value={request.membershipType} />
          <Detail label="Submitted" value={formatDate(request.createdAt)} />
          <Detail label="Last updated" value={formatDate(request.updatedAt)} />
          <Detail label="Applicant" value={request.applicantName} />
          <Detail label="Phone" value={request.phoneNumber} />
          <Detail label="Email" value={request.applicantEmail} />
        </dl>
        <Detail label="Reason" value={request.reason} className="mt-6" />
        {request.additionalInformation && (
          <Detail label="Additional information" value={request.additionalInformation} className="mt-6" />
        )}
        {request.memberVisibleMessage && (
          <div className="mt-6 border-l-2 border-brand-gold pl-4">
            <p className="text-xs font-semibold text-brand-gold">Message from the studio</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{request.memberVisibleMessage}</p>
          </div>
        )}
        {adminView && request.adminRemarks && (
          <div className="mt-6 border-l-2 border-white/20 pl-4">
            <p className="text-xs font-semibold text-neutral-300">Internal admin notes</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-400">{request.adminRemarks}</p>
          </div>
        )}
      </div>
      <div className={panelClass}>
        <h2 className="font-display text-lg font-bold text-white">Request timeline</h2>
        {history.length ? (
          <ol className="mt-5 space-y-5">
            {history.map((entry) => (
              <li key={entry.id} className="relative border-l border-white/15 pb-1 pl-5 last:border-transparent">
                <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-brand-gold" />
                <p className="text-sm font-semibold text-white">{entry.newStatus}</p>
                <p className="mt-1 text-xs text-neutral-500">{formatDate(entry.timestamp)}</p>
                {entry.message && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-400">{entry.message}</p>}
              </li>
            ))}
          </ol>
        ) : <p className="mt-4 text-sm text-neutral-400">No updates yet.</p>}
        {!adminView && (
          <Link to="/requests" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-brand-gold">
            Back to my requests <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>,
  );
}

function Detail({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-200">{value || '—'}</dd>
    </div>
  );
}

export function MemberProfile() {
  const { user } = useAuth();
  const profile = useMemberProfile(user?.uid);
  const [name, setName] = useState(user?.displayName ?? '');
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => setName(profile.data?.displayName ?? user?.displayName ?? ''), [profile.data?.displayName, user?.displayName]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const displayName = name.trim();
    if (!displayName) {
      setMessage('Enter your name before saving.');
      return;
    }
    setIsBusy(true);
    setMessage('');
    try {
      const db = await getDatabase();
      await updateProfile(user, { displayName });
      await import('firebase/firestore').then(({ updateDoc }) =>
        updateDoc(doc(db, 'users', user.uid), {
          displayName,
          updatedAt: serverTimestamp(),
        }),
      );
      setMessage('Your profile has been updated.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <MemberFrame title="Your profile">
      {profile.loading ? (
        <p role="status" className="text-sm text-neutral-400">Loading your profile…</p>
      ) : profile.error ? (
        <ErrorMessage>{profile.error}</ErrorMessage>
      ) : (
        <form onSubmit={saveProfile} className={`${panelClass} max-w-xl space-y-5`}>
          {user?.photoURL && <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full object-cover" />}
          <Field label="Full name" name="profileName" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} />
          <Field label="Email address" name="profileEmail" type="email" value={user?.email ?? ''} disabled required />
          <Field label="Membership status" name="profileStatus" value={profile.data?.membershipStatus ?? 'Not Applied'} disabled />
          {message && <p role="status" className="text-sm text-brand-gold">{message}</p>}
          <button type="submit" disabled={isBusy} className="min-h-11 rounded-full bg-brand-button px-5 text-xs font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60">
            {isBusy ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}
    </MemberFrame>
  );
}

export function AccessDenied() {
  const { user } = useAuth();
  return (
    <MemberFrame title="Access denied">
      <div className={`${panelClass} mx-auto max-w-xl text-center`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-red">Admin access required</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-white">This console is restricted.</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          {user
            ? 'Your signed-in account does not have administrator access. Ask an authorized administrator to grant it using the trusted Firebase Admin SDK setup.'
            : 'Sign in with an authorized administrator account to continue.'}
        </p>
        <Link to={user ? '/dashboard' : '/admin/login'} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-button px-5 text-xs font-bold uppercase text-white">
          {user ? 'Go to member dashboard' : 'Admin sign in'}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </MemberFrame>
  );
}
