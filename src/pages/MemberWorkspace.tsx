import { useEffect, useMemo, useState, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import {
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  FilePlus2,
  LayoutGrid,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import PortalFrame from '../components/PortalFrame';
import { getDatabase } from '../config/firebase';
import { formatDate, statusTone, type MembershipRequest } from '../config/membership';
import { SITE_CONFIG } from '../config/site';
import { useAuth } from '../contexts/AuthContext';

type ServiceRequest = {
  id: string;
  userId: string;
  kind: 'service' | 'support';
  title: string;
  category: string;
  description: string;
  deadline: string;
  budget: string;
  status: string;
  adminMessage: string;
  memberResponse: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

type MemberNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedType: 'membership' | 'serviceRequest' | '';
  relatedId: string;
  createdAt: Timestamp | null;
  read: boolean;
  readAt: Timestamp | null;
};

type WorkspaceState = {
  membershipRequests: MembershipRequest[];
  serviceRequests: ServiceRequest[];
  loading: boolean;
  error: string;
};

const panelClass = 'rounded-xl border border-white/10 bg-[#151517]';
const fieldClass =
  'min-h-12 w-full rounded-lg border border-white/15 bg-[#101011] px-4 text-sm text-white placeholder:text-neutral-600 transition focus:border-brand-red focus:outline-none disabled:cursor-wait disabled:opacity-60';

function errorMessage(error: unknown) {
  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    return 'Firestore denied access to this information. Check the deployed security rules and your account permissions.';
  }
  if (error instanceof FirebaseError && error.code === 'unavailable') {
    return 'The member service is temporarily unavailable. Please try again.';
  }
  return 'We could not load or save this information. Please try again.';
}

function useMemberWorkspace(userId: string | undefined, pageSize = 5) {
  const [state, setState] = useState<WorkspaceState>({
    membershipRequests: [],
    serviceRequests: [],
    loading: true,
    error: '',
  });
  const [reloadId, setReloadId] = useState(0);

  useEffect(() => {
    if (!userId) {
      setState({ membershipRequests: [], serviceRequests: [], loading: false, error: '' });
      return;
    }

    let active = true;
    let pendingListeners = 2;
    let hasError = false;
    let stopMembership: (() => void) | undefined;
    let stopServices: (() => void) | undefined;
    setState((current) => ({ ...current, loading: true, error: '' }));

    const listenerReady = () => {
      pendingListeners -= 1;
      if (pendingListeners === 0 && active && !hasError) {
        setState((current) => ({ ...current, loading: false }));
      }
    };
    const listenerError = (error: Error) => {
      hasError = true;
      if (active) setState((current) => ({ ...current, loading: false, error: errorMessage(error) }));
    };

    void getDatabase()
      .then((db) => {
        if (!active) return;
        stopMembership = onSnapshot(
          query(
            collection(db, 'membershipRequests'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(pageSize),
          ),
          (snapshot) => {
            if (!active) return;
            setState((current) => ({
              ...current,
              membershipRequests: snapshot.docs.map(
                (request) => ({ id: request.id, ...request.data() }) as MembershipRequest,
              ),
            }));
            listenerReady();
          },
          listenerError,
        );
        stopServices = onSnapshot(
          query(
            collection(db, 'serviceRequests'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(pageSize),
          ),
          (snapshot) => {
            if (!active) return;
            setState((current) => ({
              ...current,
              serviceRequests: snapshot.docs.map(
                (request) => ({ id: request.id, ...request.data() }) as ServiceRequest,
              ),
            }));
            listenerReady();
          },
          listenerError,
        );
      })
      .catch((error: unknown) => {
        if (active) setState((current) => ({ ...current, loading: false, error: errorMessage(error) }));
      });

    return () => {
      active = false;
      stopMembership?.();
      stopServices?.();
    };
  }, [userId, reloadId]);

  return { ...state, retry: () => setReloadId((value) => value + 1) };
}

function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadId, setReloadId] = useState(0);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let active = true;
    let unsubscribe: (() => void) | undefined;
    setLoading(true);
    void getDatabase()
      .then((db) => {
        if (!active) return;
        unsubscribe = onSnapshot(
          doc(db, 'users', userId),
          (snapshot) => {
            if (!active) return;
            setProfile(snapshot.exists() ? snapshot.data() : null);
            setLoading(false);
            setError('');
          },
          (listenError) => {
            if (!active) return;
            setLoading(false);
            setError(errorMessage(listenError));
          },
        );
      })
      .catch((loadError: unknown) => {
        if (active) {
          setLoading(false);
          setError(errorMessage(loadError));
        }
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [userId, reloadId]);

  return { profile, loading, error, retry: () => setReloadId((value) => value + 1) };
}

function useNotifications(userId: string | undefined, pageSize = 30) {
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadId, setReloadId] = useState(0);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    let active = true;
    let unsubscribe: (() => void) | undefined;
    setLoading(true);
    void getDatabase()
      .then((db) => {
        if (!active) return;
        unsubscribe = onSnapshot(
          query(
            collection(db, 'users', userId, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(pageSize),
          ),
          (snapshot) => {
            if (!active) return;
            setNotifications(snapshot.docs.map((entry) => ({
              id: entry.id,
              ...entry.data(),
            }) as MemberNotification));
            setLoading(false);
            setError('');
            void getCountFromServer(query(
              collection(db, 'users', userId, 'notifications'),
              where('read', '==', false),
            )).then((count) => {
              if (active) setUnreadCount(count.data().count);
            }).catch((countError: unknown) => {
              if (active) setError(errorMessage(countError));
            });
          },
          (listenError) => {
            if (!active) return;
            setLoading(false);
            setError(errorMessage(listenError));
          },
        );
      })
      .catch((loadError: unknown) => {
        if (active) {
          setLoading(false);
          setError(errorMessage(loadError));
        }
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [userId, pageSize, reloadId]);

  return { notifications, unreadCount, loading, error, retry: () => setReloadId((value) => value + 1) };
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusTone(status)}`}>
      {status}
    </span>
  );
}

function InitialAvatar({ name, photoURL, size = 'h-14 w-14' }: { name: string; photoURL?: string | null; size?: string }) {
  return photoURL ? (
    <img src={photoURL} alt="" className={`${size} shrink-0 rounded-full border border-white/15 object-cover`} />
  ) : (
    <span aria-hidden="true" className={`${size} flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-semibold text-neutral-300`}>
      {name.trim().charAt(0).toUpperCase() || <UserRound size={20} />}
    </span>
  );
}

function WorkspaceError({ text, retry }: { text: string; retry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-brand-red/25 bg-brand-red/5 p-4 text-sm text-red-200">
      <p>{text}</p>
      {retry && <button type="button" onClick={retry} className="mt-3 font-semibold text-white underline underline-offset-4">Try again</button>}
    </div>
  );
}

function WelcomeCard({ user, membershipStatus }: { user: NonNullable<ReturnType<typeof useAuth>['user']>; membershipStatus: string }) {
  const name = user.displayName?.trim() || user.email?.split('@')[0] || 'there';
  return (
    <section className={`${panelClass} relative isolate overflow-hidden p-5 sm:p-8`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(19,19,22,0.98)_15%,rgba(20,12,14,0.93)_58%,rgba(92,17,26,0.55)_100%)]"
      />
      <div aria-hidden="true" className="absolute -right-12 -top-20 -z-10 h-56 w-56 rounded-full bg-brand-red/15 blur-3xl" />
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <InitialAvatar name={name} photoURL={user.photoURL} size="h-16 w-16 sm:h-[76px] sm:w-[76px]" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300">Member dashboard</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Welcome back, {name}!
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
            Your space to follow studio requests, explore services and manage your membership.
          </p>
          {user.email && <p className="mt-2 truncate text-xs text-neutral-400">{user.email}</p>}
        </div>
        <div className="flex w-full items-center justify-between gap-3 border-t border-white/10 pt-4 sm:w-auto sm:border-0 sm:pt-0">
          <StatusBadge status={membershipStatus} />
          <Link to="/profile" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-neutral-200 transition hover:bg-white/[0.06] hover:text-white">
            <UserRound size={15} aria-hidden="true" /> Profile settings
          </Link>
        </div>
      </div>
    </section>
  );
}

function toDate(value: Timestamp | null | undefined) {
  return value ? formatDate(value as MembershipRequest['createdAt']) : '—';
}

function RequestRow({ request }: { request: MembershipRequest | ServiceRequest }) {
  const membership = 'membershipType' in request;
  const title = membership ? `Membership · ${request.membershipType}` : request.title;
  const category = membership ? request.membershipType : request.category;
  const to = membership ? `/requests/${request.id}` : `/service-requests/${request.id}`;
  return (
    <Link to={to} className="group flex min-w-0 items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-white/[0.04]">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-neutral-300">
        {membership ? <ShieldCheck size={17} /> : <FilePlus2 size={17} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-neutral-100">{title}</span>
        <span className="mt-1 block truncate text-[11px] text-neutral-500">
          {category} · {request.id} · Submitted {toDate(request.createdAt)} · Updated {toDate(request.updatedAt)}
        </span>
      </span>
      <span className="shrink-0"><StatusBadge status={request.status} /></span>
      <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
    </Link>
  );
}

function NotificationLink({ notification, userId }: { notification: MemberNotification; userId: string }) {
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const navigate = useNavigate();
  const to = notification.relatedType === 'membership' && notification.relatedId
    ? `/requests/${notification.relatedId}`
    : notification.relatedType === 'serviceRequest' && notification.relatedId
      ? `/service-requests/${notification.relatedId}`
      : '';

  const markRead = async () => {
    if (notification.read) return true;
    setIsBusy(true);
    setError('');
    try {
      const db = await getDatabase();
      await updateDoc(doc(db, 'users', userId, 'notifications', notification.id), {
        read: true,
        readAt: serverTimestamp(),
      });
      return true;
    } catch (markReadError) {
      setError(errorMessage(markReadError));
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const openNotification = async (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (notification.read || !to) return;
    event.preventDefault();
    if (await markRead()) navigate(to);
  };

  const content = (
    <>
      <span className="block text-sm font-semibold text-neutral-100">{notification.title}</span>
      <span className="mt-1 block line-clamp-2 text-xs leading-5 text-neutral-400">{notification.message}</span>
      {notification.relatedId && <span className="mt-1 block truncate font-mono text-[10px] text-neutral-600">Ref. {notification.relatedId}</span>}
      <span className="mt-2 block text-[10px] text-neutral-600">{toDate(notification.createdAt)}</span>
      <span className="sr-only">{notification.read ? 'Read notification' : 'Unread notification'}</span>
    </>
  );

  return (
    <>
      <div className={`flex items-start gap-3 rounded-lg p-3 transition hover:bg-white/[0.04] ${notification.read ? '' : 'bg-white/[0.025]'}`}>
        <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-neutral-700' : 'bg-brand-red'}`} />
        <span className="min-w-0 flex-1">
          {to ? <Link to={to} onClick={(event) => void openNotification(event)} className="block rounded-sm focus-visible:outline-offset-2">{content}</Link> : content}
        </span>
        {!notification.read && <button type="button" disabled={isBusy} onClick={() => void markRead()} className="shrink-0 rounded px-2 py-1 text-[10px] font-semibold text-neutral-400 underline underline-offset-2 hover:text-white disabled:opacity-60">{isBusy ? 'Saving…' : 'Mark as read'}</button>}
      </div>
      {error && <p role="alert" className="px-3 pb-2 text-xs text-red-300">{error}</p>}
    </>
  );
}

export function MemberDashboard() {
  const { user } = useAuth();
  const workspace = useMemberWorkspace(user?.uid, 5);
  const profile = useProfile(user?.uid);
  const notificationState = useNotifications(user?.uid);
  const allRequests = useMemo(
    () => [...workspace.membershipRequests, ...workspace.serviceRequests]
      .sort((left, right) => (right.createdAt?.toMillis() ?? 0) - (left.createdAt?.toMillis() ?? 0)),
    [workspace.membershipRequests, workspace.serviceRequests],
  );
  const latestApplication = workspace.membershipRequests[0];
  const storedMembershipStatus = typeof profile.profile?.membershipStatus === 'string'
    ? profile.profile.membershipStatus
    : undefined;
  const membershipStatus = storedMembershipStatus && storedMembershipStatus !== 'Not Applied'
    ? storedMembershipStatus
    : latestApplication?.status ?? storedMembershipStatus ??
      (profile.loading || workspace.loading
        ? 'Loading…'
        : profile.error || workspace.error
          ? 'Unavailable'
          : 'Not Applied');
  const unseenNotifications = notificationState.unreadCount;
  const memberSince = profile.profile?.memberSince as Timestamp | undefined;
  const memberType = String(profile.profile?.membershipType ?? latestApplication?.membershipType ?? '');
  const membershipExpiry = profile.profile?.membershipExpiresAt as Timestamp | undefined;
  const memberId = String(profile.profile?.memberId ?? '');

  const membershipAction = membershipStatus === 'Loading…' || membershipStatus === 'Unavailable'
    ? null
    : membershipStatus === 'Not Applied'
    ? { label: 'Apply for membership', to: '/requests/new' }
    : membershipStatus === 'Pending' || membershipStatus === 'Under Review' || membershipStatus === 'More Information Required'
      ? { label: 'View application', to: latestApplication ? `/requests/${latestApplication.id}` : '/requests' }
      : membershipStatus === 'Approved' || membershipStatus === 'Active'
        ? { label: 'View membership benefits', to: '/benefits' }
        : membershipStatus === 'Rejected'
          ? { label: 'View decision', to: latestApplication ? `/requests/${latestApplication.id}` : '/requests' }
          : { label: 'Contact support', to: '/help' };

  return (
    <PortalFrame title="Your dashboard" showTitle={false}>
      <Helmet><title>Your dashboard | {SITE_CONFIG.name}</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="space-y-5">
        <WelcomeCard user={user!} membershipStatus={membershipStatus} />

        <section aria-labelledby="membership-overview-heading" className={`${panelClass} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Your account</p>
              <h2 id="membership-overview-heading" className="mt-1 font-display text-lg font-bold text-white">Membership overview</h2>
            </div>
            {membershipAction && <Link to={membershipAction.to} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-button px-4 text-xs font-bold text-white transition hover:bg-brand-button-hover">
              {membershipAction.label}<ArrowRight size={14} aria-hidden="true" />
            </Link>}
          </div>
          {(profile.error || workspace.error) && <div className="mt-4"><WorkspaceError text={profile.error || workspace.error} retry={profile.error ? profile.retry : workspace.retry} /></div>}
          {profile.loading ? (
            <p role="status" className="mt-4 text-sm text-neutral-500">Loading membership details…</p>
          ) : (
            <dl className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2 xl:grid-cols-4">
              <MembershipDetail label="Status" value={membershipStatus} />
              {memberType && <MembershipDetail label="Category" value={memberType} />}
              {memberSince && <MembershipDetail label="Member since" value={toDate(memberSince)} />}
              {membershipExpiry && <MembershipDetail label="Valid until" value={toDate(membershipExpiry)} />}
              {memberId && <MembershipDetail label="Member reference" value={memberId} />}
            </dl>
          )}
        </section>

        <section aria-labelledby="quick-actions-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Make your next move</p>
              <h2 id="quick-actions-heading" className="mt-1 font-display text-lg font-bold text-white">Quick actions</h2>
            </div>
            <Link to="/help" className="hidden items-center gap-1 text-xs font-semibold text-neutral-400 transition hover:text-white sm:inline-flex">Need help? <span className="text-brand-red">Contact support</span><ArrowRight size={13} aria-hidden="true" /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ActionCard to="/service-requests/new" icon={<FilePlus2 size={20} />} title="Raise a request" text="Tell us about your project or service needs." />
            <ActionCard to="/services" icon={<LayoutGrid size={20} />} title="Explore services" text="Find creative services configured by the studio." />
            <ActionCard to="/help" icon={<CircleHelp size={20} />} title="Contact support" text="Get help from the studio or send a support request." />
            <ActionCard to="/benefits" icon={<Sparkles size={20} />} title="Membership benefits" text="See benefits available for your membership." />
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <section aria-labelledby="recent-requests-heading" className={`${panelClass} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Your activity</p>
                <h2 id="recent-requests-heading" className="mt-1 font-display text-lg font-bold text-white">Recent requests</h2>
              </div>
              <Link to="/my-requests" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 transition hover:text-white">View all <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
            {workspace.loading ? <LoadingRows label="Loading your requests…" /> : workspace.error ? <div className="mt-4"><WorkspaceError text={workspace.error} retry={workspace.retry} /></div> : allRequests.length ? (
              <div className="mt-3 divide-y divide-white/[0.06]">
                {allRequests.slice(0, 4).map((request) => <RequestRow key={`${'membershipType' in request ? 'membership' : 'service'}-${request.id}`} request={request} />)}
              </div>
            ) : (
              <EmptyState className="mt-4" title="No requests yet" text="Requests you submit to the studio will appear here." action={{ label: 'Raise a request', to: '/service-requests/new' }} />
            )}
          </section>

          <section aria-labelledby="notifications-heading" className={`${panelClass} p-4 sm:p-5`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Stay in the loop</p>
                <h2 id="notifications-heading" className="mt-1 flex items-center gap-2 font-display text-lg font-bold text-white">Notifications
                  {unseenNotifications > 0 && <span className="rounded-full bg-brand-red px-2 py-0.5 font-sans text-[10px] font-bold text-white">{unseenNotifications}</span>}
                </h2>
              </div>
              <Link to="/notifications" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 transition hover:text-white">View all <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
            {notificationState.loading ? <LoadingRows label="Loading notifications…" /> : notificationState.error ? <div className="mt-4"><WorkspaceError text={notificationState.error} retry={notificationState.retry} /></div> : notificationState.notifications.length ? (
              <div className="mt-3 divide-y divide-white/[0.06]">
                {notificationState.notifications.slice(0, 4).map((notification) => <NotificationLink key={notification.id} notification={notification} userId={user!.uid} />)}
              </div>
            ) : <EmptyState className="mt-4" title="You're all caught up." text="New updates from the studio will appear here." />}
          </section>
        </div>

        <PendingActions status={membershipStatus} application={latestApplication} requests={workspace.serviceRequests} loading={workspace.loading} />

        <section aria-labelledby="recommended-services-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Configured by the studio</p>
              <h2 id="recommended-services-heading" className="mt-1 font-display text-lg font-bold text-white">Explore services</h2>
            </div>
            <Link to="/services" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 transition hover:text-white">All services <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SITE_CONFIG.services.slice(0, 3).map((service) => (
              <article key={service.id} className={`${panelClass} overflow-hidden transition hover:border-white/20`}>
                <img src={service.image} alt={service.imageAlt} loading="lazy" className="h-32 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-display text-sm font-bold text-white">{service.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400">{service.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Link to={`/services/${service.path}`} className="text-xs font-semibold text-neutral-300 hover:text-white">View details</Link>
                    <Link to={`/service-requests/new?service=${encodeURIComponent(service.id)}`} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand-button px-3 text-[11px] font-semibold text-white hover:bg-brand-button-hover">Request service <ArrowRight size={13} aria-hidden="true" /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PortalFrame>
  );
}

function MembershipDetail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-neutral-200">{value}</dd></div>;
}

function ActionCard({ to, icon, title, text }: { to: string; icon: ReactNode; title: string; text: string }) {
  return (
    <Link to={to} className="group flex min-h-[126px] gap-4 rounded-xl border border-white/10 bg-[#151517] p-4 transition hover:border-brand-red/45 hover:bg-[#191719] focus-visible:outline-offset-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand-red/25 bg-brand-red/10 text-brand-red">{icon}</span>
      <span className="min-w-0">
        <span className="block font-display text-sm font-bold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-neutral-400">{text}</span>
        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-300 group-hover:text-white">Open <ArrowRight size={12} aria-hidden="true" /></span>
      </span>
    </Link>
  );
}

function LoadingRows({ label }: { label: string }) {
  return <div role="status" className="mt-4 space-y-3"><span className="sr-only">{label}</span>{[0, 1, 2].map((row) => <div key={row} aria-hidden="true" className="h-14 animate-pulse rounded-lg bg-white/[0.04]" />)}</div>;
}

function EmptyState({ title, text, action, className = '' }: { title: string; text: string; action?: { label: string; to: string }; className?: string }) {
  return (
    <div className={`${className} rounded-lg border border-dashed border-white/10 bg-white/[0.015] p-4`}>
      <p className="text-sm font-semibold text-neutral-200">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{text}</p>
      {action && <Link to={action.to} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-200 hover:text-white">{action.label} <ArrowRight size={13} aria-hidden="true" /></Link>}
    </div>
  );
}

function PendingActions({ status, application, requests, loading }: { status: string; application?: MembershipRequest; requests: ServiceRequest[]; loading: boolean }) {
  const tasks: Array<{ title: string; text: string; to: string }> = [];
  if (status === 'More Information Required' && application) tasks.push({ title: 'Provide the requested membership information', text: application.memberVisibleMessage || 'Open your application to review the studio’s request.', to: `/requests/${application.id}` });
  if (status === 'Rejected' && application) tasks.push({ title: 'Review your membership decision', text: application.memberVisibleMessage || 'Your decision is available in the application details.', to: `/requests/${application.id}` });
  requests.filter((request) => request.status === 'Awaiting Information').forEach((request) => {
    tasks.push({ title: `Respond to: ${request.title}`, text: request.adminMessage || 'The studio is waiting for more information.', to: `/service-requests/${request.id}` });
  });

  return (
    <section aria-labelledby="pending-actions-heading" className={`${panelClass} p-4 sm:p-5`}>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-gold"><Clock3 size={17} aria-hidden="true" /></span>
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Your next steps</p><h2 id="pending-actions-heading" className="mt-1 font-display text-lg font-bold text-white">Pending actions</h2></div>
      </div>
      {loading ? <LoadingRows label="Checking for pending actions…" /> : tasks.length ? (
        <ul className="mt-3 divide-y divide-white/[0.06]">
          {tasks.map((task) => <li key={task.title} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span><span className="block text-sm font-semibold text-neutral-200">{task.title}</span><span className="mt-1 block text-xs leading-5 text-neutral-500">{task.text}</span></span>
            <Link to={task.to} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold text-neutral-200 hover:border-white/25 hover:text-white">Continue <ArrowRight size={13} aria-hidden="true" /></Link>
          </li>)}
        </ul>
      ) : <p className="mt-4 text-sm text-neutral-400">You're all caught up.</p>}
    </section>
  );
}

export function MyRequests() {
  const { user } = useAuth();
  const [pageSize, setPageSize] = useState(12);
  const workspace = useMemberWorkspace(user?.uid, pageSize);
  const requests = useMemo(
    () => [...workspace.membershipRequests, ...workspace.serviceRequests]
      .sort((left, right) => (right.createdAt?.toMillis() ?? 0) - (left.createdAt?.toMillis() ?? 0)),
    [workspace.membershipRequests, workspace.serviceRequests],
  );
  const mayHaveMore = workspace.membershipRequests.length === pageSize || workspace.serviceRequests.length === pageSize;
  return (
    <PortalFrame title="My requests">
      <p className="mb-5 max-w-2xl text-sm leading-6 text-neutral-400">Membership applications and project or support requests submitted from this account.</p>
      {workspace.error ? <WorkspaceError text={workspace.error} retry={workspace.retry} /> : workspace.loading ? <LoadingRows label="Loading your requests…" /> : requests.length ? (
        <>
          <div className={`${panelClass} divide-y divide-white/[0.06] p-2`}>
            {requests.map((request) => <RequestRow key={`${'membershipType' in request ? 'membership' : 'service'}-${request.id}`} request={request} />)}
          </div>
          {mayHaveMore && <button type="button" onClick={() => setPageSize((size) => size + 12)} className="mt-4 min-h-10 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white hover:border-white/30">Load more requests</button>}
        </>
      ) : <EmptyState title="No requests yet" text="When you submit a membership application, project brief or support request, it will appear here." action={{ label: 'Raise a project request', to: '/service-requests/new' }} />}
    </PortalFrame>
  );
}

export function NewServiceRequest() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [serviceId, setServiceId] = useState(searchParams.get('service') ?? '');
  const [kind, setKind] = useState<'service' | 'support'>(searchParams.get('kind') === 'support' ? 'support' : 'service');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState('');
  const service = SITE_CONFIG.services.find((entry) => entry.id === serviceId);

  useEffect(() => {
    const requestedService = searchParams.get('service') ?? '';
    setServiceId(SITE_CONFIG.services.some((entry) => entry.id === requestedService) ? requestedService : '');
    setKind(searchParams.get('kind') === 'support' ? 'support' : 'service');
  }, [searchParams]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();
    const deadline = String(data.get('deadline') ?? '').trim();
    const budget = String(data.get('budget') ?? '').trim();
    const selectedId = String(data.get('serviceId') ?? '');
    const selectedService = SITE_CONFIG.services.find((entry) => entry.id === selectedId);
    const category = kind === 'support' ? 'Support' : selectedService?.title ?? '';
    if (!title || title.length > 120 || description.length < 20 || description.length > 4000 ||
      (kind === 'service' && !selectedService) || deadline.length > 30 || budget.length > 80) {
      setError('Check the form values and make sure your request includes at least 20 characters of detail.');
      return;
    }

    setIsBusy(true);
    setError('');
    try {
      const db = await getDatabase();
      const requestRef = doc(collection(db, 'serviceRequests'));
      const notificationRef = doc(collection(db, 'users', user.uid, 'notifications'));
      const batch = writeBatch(db);
      batch.set(requestRef, {
        userId: user.uid,
        requesterName: user.displayName ?? '',
        requesterEmail: user.email ?? '',
        kind,
        title,
        category,
        description,
        deadline,
        budget,
        status: 'Submitted',
        adminMessage: '',
        memberResponse: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(notificationRef, {
        type: 'service_request_submitted',
        title: kind === 'support' ? 'Support request submitted' : 'Service request submitted',
        message: `Your request “${title}” has been submitted to the studio.`,
        relatedType: 'serviceRequest',
        relatedId: requestRef.id,
        createdAt: serverTimestamp(),
        read: false,
        readAt: null,
      });
      await batch.commit();
      setCreatedId(requestRef.id);
      form.reset();
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <PortalFrame title={kind === 'support' ? 'Contact support' : 'Raise a request'}>
      {createdId ? (
        <div className={`${panelClass} max-w-2xl p-6 sm:p-8`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><Check size={20} aria-hidden="true" /></span>
          <h2 className="mt-4 font-display text-2xl font-bold text-white">Request submitted</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">The studio has received your request. You can follow updates from your requests page.</p>
          <p className="mt-4 break-all font-mono text-xs text-neutral-500">Reference: {createdId}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to={`/service-requests/${createdId}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-button px-4 text-xs font-bold text-white hover:bg-brand-button-hover">View request <ArrowRight size={14} aria-hidden="true" /></Link>
            <Link to="/my-requests" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 text-xs font-semibold text-neutral-200 hover:border-white/30">My requests</Link>
          </div>
        </div>
      ) : (
        <div className={`${panelClass} max-w-3xl p-5 sm:p-7`}>
          <div className="mb-6 flex flex-wrap gap-2" aria-label="Request type">
            <button type="button" onClick={() => setKind('service')} aria-pressed={kind === 'service'} className={`min-h-10 rounded-lg px-4 text-xs font-semibold ${kind === 'service' ? 'bg-brand-button text-white' : 'border border-white/10 text-neutral-300 hover:text-white'}`}>Project / service</button>
            <button type="button" onClick={() => setKind('support')} aria-pressed={kind === 'support'} className={`min-h-10 rounded-lg px-4 text-xs font-semibold ${kind === 'support' ? 'bg-brand-button text-white' : 'border border-white/10 text-neutral-300 hover:text-white'}`}>Support</button>
          </div>
          <form onSubmit={submit} className="space-y-5">
            {kind === 'service' && <div>
              <label htmlFor="serviceId" className="mb-2 block text-xs font-semibold text-neutral-300">Service category <span aria-hidden="true">*</span></label>
              <select id="serviceId" name="serviceId" value={serviceId} onChange={(event) => setServiceId(event.target.value)} required className={fieldClass}>
                <option value="">Choose a configured service</option>
                {SITE_CONFIG.services.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}
              </select>
              {service && <p className="mt-2 text-xs leading-5 text-neutral-500">{service.description}</p>}
            </div>}
            <div>
              <label htmlFor="requestTitle" className="mb-2 block text-xs font-semibold text-neutral-300">Request title <span aria-hidden="true">*</span></label>
              <input id="requestTitle" name="title" required maxLength={120} className={fieldClass} placeholder={kind === 'support' ? 'What do you need help with?' : 'Give your project a short title'} />
            </div>
            <div>
              <label htmlFor="requestDescription" className="mb-2 block text-xs font-semibold text-neutral-300">Details <span aria-hidden="true">*</span></label>
              <textarea id="requestDescription" name="description" required minLength={20} maxLength={4000} rows={6} className={`${fieldClass} py-3`} placeholder="Share the goals, deliverables, context or support details that will help us respond." />
              <p className="mt-2 text-[11px] text-neutral-500">Please include at least 20 characters of detail.</p>
            </div>
            {kind === 'service' && <div className="grid gap-5 sm:grid-cols-2">
              <div><label htmlFor="deadline" className="mb-2 block text-xs font-semibold text-neutral-300">Target deadline (optional)</label><input id="deadline" name="deadline" type="date" min={new Date().toISOString().slice(0, 10)} className={fieldClass} /></div>
              <div><label htmlFor="budget" className="mb-2 block text-xs font-semibold text-neutral-300">Indicative budget (optional)</label><input id="budget" name="budget" maxLength={80} className={fieldClass} placeholder="e.g. range or currency" /></div>
            </div>}
            <p className="text-xs leading-5 text-neutral-500">Submitting creates a private request visible to you and authorized studio administrators.</p>
            {error && <WorkspaceError text={error} />}
            <button type="submit" disabled={isBusy} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand-button px-5 text-xs font-bold text-white transition hover:bg-brand-button-hover disabled:cursor-wait disabled:opacity-60">
              {isBusy ? 'Submitting…' : kind === 'support' ? 'Send support request' : 'Submit service request'} {!isBusy && <ArrowRight size={15} aria-hidden="true" />}
            </button>
          </form>
        </div>
      )}
    </PortalFrame>
  );
}

export function ServiceRequestDetail() {
  const { user } = useAuth();
  const { requestId } = useParams();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberResponse, setMemberResponse] = useState('');
  const [isSendingResponse, setIsSendingResponse] = useState(false);
  const [responseNotice, setResponseNotice] = useState('');

  useEffect(() => {
    if (!user || !requestId) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    setLoading(true);
    void getDatabase()
      .then((db) => {
        if (!active) return;
        unsubscribe = onSnapshot(doc(db, 'serviceRequests', requestId), (snapshot) => {
          if (!active) return;
          if (!snapshot.exists()) {
            setError('This request could not be found.');
            setRequest(null);
          } else {
            const data = { id: snapshot.id, ...snapshot.data() } as ServiceRequest;
            setRequest(data);
            setMemberResponse(data.memberResponse ?? '');
            setError('');
          }
          setLoading(false);
        }, (listenError) => {
          if (!active) return;
          setError(errorMessage(listenError));
          setLoading(false);
        });
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError));
          setLoading(false);
        }
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [requestId, user]);

  const submitResponse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!request || !user || request.status !== 'Awaiting Information') return;
    const response = memberResponse.trim();
    if (response.length < 5 || response.length > 2000) {
      setError('Enter a response between 5 and 2,000 characters.');
      return;
    }
    setIsSendingResponse(true);
    setError('');
    setResponseNotice('');
    try {
      const db = await getDatabase();
      await updateDoc(doc(db, 'serviceRequests', request.id), {
        memberResponse: response,
        updatedAt: serverTimestamp(),
      });
      setResponseNotice('Your response has been sent to the studio.');
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setIsSendingResponse(false);
    }
  };

  return (
    <PortalFrame title="Request details">
      {loading ? <LoadingRows label="Loading request details…" /> : error ? <WorkspaceError text={error} /> : request ? (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_0.7fr]">
          <section className={`${panelClass} p-5 sm:p-7`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">Request reference</p><p className="mt-1 break-all font-mono text-xs text-neutral-300">{request.id}</p></div>
              <StatusBadge status={request.status} />
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold text-white">{request.title}</h2>
            <p className="mt-2 text-sm text-neutral-400">{request.category}</p>
            <dl className="mt-6 grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-2">
              <MembershipDetail label="Submitted" value={toDate(request.createdAt)} />
              <MembershipDetail label="Last updated" value={toDate(request.updatedAt)} />
              {request.deadline && <MembershipDetail label="Target deadline" value={request.deadline} />}
              {request.budget && <MembershipDetail label="Indicative budget" value={request.budget} />}
            </dl>
            <div className="mt-6 border-t border-white/10 pt-5"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">Details</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{request.description}</p></div>
            {request.adminMessage && <div className="mt-6 border-l-2 border-brand-gold pl-4"><p className="text-xs font-semibold text-brand-gold">Message from the studio</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{request.adminMessage}</p></div>}
            {request.memberResponse && <div className="mt-6 border-t border-white/10 pt-5"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">Your response</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{request.memberResponse}</p></div>}
            {request.status === 'Awaiting Information' && <form onSubmit={submitResponse} className="mt-6 border-t border-white/10 pt-5">
              <label htmlFor="memberResponse" className="mb-2 block text-xs font-semibold text-neutral-300">Send the studio more information</label>
              <textarea id="memberResponse" value={memberResponse} onChange={(event) => setMemberResponse(event.target.value)} minLength={5} maxLength={2000} rows={4} required className={`${fieldClass} py-3`} />
              {responseNotice && <p role="status" className="mt-3 text-xs text-emerald-300">{responseNotice}</p>}
              <button type="submit" disabled={isSendingResponse} className="mt-4 min-h-10 rounded-lg bg-brand-button px-4 text-xs font-bold text-white hover:bg-brand-button-hover disabled:opacity-60">{isSendingResponse ? 'Sending…' : 'Send response'}</button>
            </form>}
          </section>
          <section className={`${panelClass} p-5`}>
            <h2 className="font-display text-lg font-bold text-white">Need to follow up?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">Contact the studio if you need to add context or have a question about this request.</p>
            <Link to="/help" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white hover:border-white/30"><CircleHelp size={15} aria-hidden="true" /> Contact support</Link>
          </section>
        </div>
      ) : null}
    </PortalFrame>
  );
}

export function NotificationsPage() {
  const { user } = useAuth();
  const [pageSize, setPageSize] = useState(30);
  const state = useNotifications(user?.uid, pageSize);
  const unreadCount = state.unreadCount;
  const [actionError, setActionError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    setIsBusy(true);
    setActionError('');
    try {
      const db = await getDatabase();
      while (true) {
        const unreadSnapshot = await getDocs(query(
          collection(db, 'users', user.uid, 'notifications'),
          where('read', '==', false),
          limit(450),
        ));
        if (unreadSnapshot.empty) break;
        const batch = writeBatch(db);
        unreadSnapshot.docs.forEach((notification) => batch.update(notification.ref, {
          read: true,
          readAt: serverTimestamp(),
        }));
        await batch.commit();
      }
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <PortalFrame title="Notifications">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-xl text-sm leading-6 text-neutral-400">Updates generated from actual membership and service-request events.</p>
        {unreadCount > 0 && <button type="button" disabled={isBusy} onClick={() => void markAllRead()} className="min-h-10 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white hover:border-white/30 disabled:opacity-60">{isBusy ? 'Updating…' : 'Mark all as read'}</button>}
      </div>
      {actionError && <div className="mb-4"><WorkspaceError text={actionError} /></div>}
      {state.error ? <WorkspaceError text={state.error} retry={state.retry} /> : state.loading ? <LoadingRows label="Loading notifications…" /> : state.notifications.length ? (
        <>
          <ul className={`${panelClass} divide-y divide-white/[0.06] p-2`}>
            {state.notifications.map((notification) => (
              <li key={notification.id}>
                <NotificationLink notification={notification} userId={user!.uid} />
                {!notification.read && <span className="sr-only">Unread notification</span>}
              </li>
            ))}
          </ul>
          {state.notifications.length === pageSize && <button type="button" onClick={() => setPageSize((size) => size + 30)} className="mt-4 min-h-10 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white hover:border-white/30">Load more notifications</button>}
        </>
      ) : <EmptyState title="You're all caught up." text="When there is an update on an application or request, you will find it here." />}
    </PortalFrame>
  );
}

export function MembershipBenefits() {
  const { user } = useAuth();
  const profile = useProfile(user?.uid);
  const memberType = typeof profile.profile?.membershipType === 'string' ? profile.profile.membershipType : '';
  const benefits = Array.isArray(profile.profile?.membershipBenefits)
    ? profile.profile.membershipBenefits.filter((benefit): benefit is string => typeof benefit === 'string')
    : [];
  const membershipStatus = typeof profile.profile?.membershipStatus === 'string'
    ? profile.profile.membershipStatus
    : 'Not Applied';
  return (
    <PortalFrame title="Membership benefits">
      {profile.error ? <WorkspaceError text={profile.error} retry={profile.retry} /> : profile.loading ? <LoadingRows label="Loading membership benefits…" /> : benefits.length && ['Approved', 'Active'].includes(membershipStatus) ? (
        <section className={`${panelClass} p-5 sm:p-7`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">{memberType || 'Your membership'}</p>
          <h2 className="mt-2 font-display text-xl font-bold text-white">Your benefits</h2>
          <ul className="mt-5 space-y-3">{benefits.map((benefit) => <li key={benefit} className="flex items-start gap-3 text-sm leading-6 text-neutral-300"><Check size={16} className="mt-1 shrink-0 text-emerald-300" aria-hidden="true" />{benefit}</li>)}</ul>
        </section>
      ) : <EmptyState title="Benefits are not configured yet" text="The studio has not published benefits for your membership category. Contact support for current membership information." action={{ label: 'Contact support', to: '/help' }} />}
    </PortalFrame>
  );
}

export function HelpSupport() {
  return (
    <PortalFrame title="Help & support">
      <p className="mb-5 max-w-2xl text-sm leading-6 text-neutral-400">Choose the support channel that works for you, or create a private support request that you can track in this dashboard.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <ContactCard href={`mailto:${SITE_CONFIG.email}`} icon={<Mail size={18} />} title="Email the studio" value={SITE_CONFIG.email} />
        <ContactCard href={`tel:${SITE_CONFIG.phoneHref}`} icon={<Phone size={18} />} title="Call the studio" value={SITE_CONFIG.phone} />
        <ContactCard href={SITE_CONFIG.whatsappLink} icon={<MessageSquareText size={18} />} title="WhatsApp" value="Start a conversation" external />
      </div>
      <Link to="/service-requests/new?kind=support" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand-button px-5 text-xs font-bold text-white hover:bg-brand-button-hover">Create a support request <ArrowRight size={15} aria-hidden="true" /></Link>
    </PortalFrame>
  );
}

function ContactCard({ href, icon, title, value, external = false }: { href: string; icon: ReactNode; title: string; value: string; external?: boolean }) {
  return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={`${panelClass} flex min-w-0 items-start gap-3 p-4 transition hover:border-white/20`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">{icon}</span><span className="min-w-0"><span className="block text-xs font-semibold text-white">{title}</span><span className="mt-1 block break-words text-xs leading-5 text-neutral-400">{value}</span></span></a>;
}

type AdminServiceRequest = ServiceRequest & { requesterName: string; requesterEmail: string };
const SERVICE_REQUEST_STATUSES = ['Submitted', 'Under Review', 'Awaiting Information', 'Approved', 'In Progress', 'Completed', 'Rejected', 'Cancelled'];

export function AdminServiceRequests() {
  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [reloadId, setReloadId] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    setLoading(true);
    void getDatabase()
      .then((db) => {
        if (!active) return;
        unsubscribe = onSnapshot(query(collection(db, 'serviceRequests'), orderBy('createdAt', 'desc'), limit(pageSize)), (snapshot) => {
          if (!active) return;
          setRequests(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as AdminServiceRequest));
          setLoading(false);
          setError('');
        }, (listenError) => {
          if (!active) return;
          setError(errorMessage(listenError));
          setLoading(false);
        });
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(errorMessage(loadError));
          setLoading(false);
        }
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [pageSize, reloadId]);

  const updateStatus = async (request: AdminServiceRequest, status: string, adminMessage: string) => {
    if (!user || !SERVICE_REQUEST_STATUSES.includes(status)) return;
    if (request.status === status && request.adminMessage === adminMessage) {
      setNotice(`No changes to request ${request.id}.`);
      return;
    }
    setIsBusy(request.id);
    setError('');
    setNotice('');
    try {
      const db = await getDatabase();
      const batch = writeBatch(db);
      const notificationType = status === request.status
        ? 'admin_message'
        : status === 'Completed'
          ? 'project_completed'
          : status === 'Awaiting Information'
            ? 'additional_information_requested'
            : 'service_request_status_changed';
      batch.update(doc(db, 'serviceRequests', request.id), { status, adminMessage, updatedAt: serverTimestamp() });
      const notificationRef = doc(collection(db, 'users', request.userId, 'notifications'));
      batch.set(notificationRef, {
        type: notificationType,
        title: notificationType === 'project_completed'
          ? 'Project completed'
          : notificationType === 'additional_information_requested'
            ? 'More information is needed'
            : notificationType === 'admin_message'
              ? 'New message from the studio'
              : 'Service request updated',
        message: (adminMessage || `Your request “${request.title}” is now ${status}.`).slice(0, 1000),
        relatedType: 'serviceRequest',
        relatedId: request.id,
        createdAt: serverTimestamp(),
        read: false,
        readAt: null,
      });
      await batch.commit();
      setNotice(`Updated request ${request.id}.`);
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setIsBusy('');
    }
  };

  return (
    <PortalFrame admin title="Service requests">
      {notice && <p role="status" className="mb-4 text-sm text-emerald-300">{notice}</p>}
      {error ? <WorkspaceError text={error} retry={() => setReloadId((value) => value + 1)} /> : loading ? <LoadingRows label="Loading service requests…" /> : requests.length ? (
        <>
          <ul className="space-y-4">
            {requests.map((request) => <AdminServiceRequestCard key={request.id} request={request} disabled={isBusy === request.id} onSave={(status, message) => void updateStatus(request, status, message)} />)}
          </ul>
          {requests.length === pageSize && <button type="button" onClick={() => setPageSize((size) => size + 50)} className="mt-4 min-h-10 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white hover:border-white/30">Load more requests</button>}
        </>
      ) : <EmptyState title="No service requests" text="Member project and support requests will appear here when submitted." />}
    </PortalFrame>
  );
}

function AdminServiceRequestCard({ request, disabled, onSave }: { request: AdminServiceRequest; disabled: boolean; onSave: (status: string, message: string) => void }) {
  const [status, setStatus] = useState(request.status);
  const [message, setMessage] = useState(request.adminMessage);
  return (
    <li className={`${panelClass} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">{request.kind === 'support' ? 'Support' : request.category}</p><h2 className="mt-1 font-display text-lg font-bold text-white">{request.title}</h2><p className="mt-1 break-all text-xs text-neutral-500">{request.id} · {request.requesterName || request.userId} · {request.requesterEmail}</p></div>
        <StatusBadge status={request.status} />
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{request.description}</p>
      {(request.deadline || request.budget) && <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-4">
        {request.deadline && <MembershipDetail label="Target deadline" value={request.deadline} />}
        {request.budget && <MembershipDetail label="Indicative budget" value={request.budget} />}
      </dl>}
      {request.memberResponse && <p className="mt-3 border-l-2 border-brand-gold pl-3 text-xs leading-5 text-neutral-400"><span className="font-semibold text-brand-gold">Member response: </span>{request.memberResponse}</p>}
      <form onSubmit={(event) => { event.preventDefault(); onSave(status, message.trim()); }} className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-[180px_1fr_auto] md:items-end">
        <div><label htmlFor={`status-${request.id}`} className="mb-2 block text-xs font-semibold text-neutral-300">Status</label><select id={`status-${request.id}`} value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClass}>{SERVICE_REQUEST_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div><label htmlFor={`message-${request.id}`} className="mb-2 block text-xs font-semibold text-neutral-300">Message to member</label><textarea id={`message-${request.id}`} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} rows={2} className={`${fieldClass} py-3`} /></div>
        <button type="submit" disabled={disabled} className="min-h-11 rounded-lg bg-brand-button px-4 text-xs font-bold text-white hover:bg-brand-button-hover disabled:opacity-60">{disabled ? 'Saving…' : 'Save update'}</button>
      </form>
    </li>
  );
}
