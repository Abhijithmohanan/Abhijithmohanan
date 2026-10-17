import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import { ArrowRight, Bell, Clock3, FilePlus2, LayoutDashboard, Search, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getDatabase } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  MEMBER_ACCOUNT_STATUSES,
  MEMBERSHIP_STATUSES,
  formatDate,
  statusTone,
  type MembershipRequest,
  type MembershipStatus,
} from '../config/membership';
import PortalFrame from '../components/PortalFrame';
import { MembershipRequestDetail } from './MemberPortal';

type AdminMember = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  membershipStatus: string;
};

const panelClass = 'border border-white/10 bg-[#151517] p-5 sm:p-7';
const inputClass =
  'min-h-11 w-full border border-white/15 bg-brand-dark px-3 text-sm text-white focus:border-brand-gold focus:outline-none disabled:opacity-60';
const APPLICATION_STATUSES = [
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'More Information Required',
] as const;
const SERVICE_REQUEST_STATUSES = [
  'Submitted',
  'Under Review',
  'Awaiting Information',
  'Approved',
  'In Progress',
  'Completed',
  'Rejected',
  'Cancelled',
] as const;

type DashboardApplication = Pick<
  MembershipRequest,
  'id' | 'applicantName' | 'applicantEmail' | 'membershipType' | 'status'
> & { createdAt: Timestamp | null };

type DashboardServiceRequest = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  kind: 'service' | 'support';
  title: string;
  category: string;
  status: string;
  createdAt: Timestamp | null;
};

type AdminOverviewData = {
  profileCount: number;
  applications: Record<(typeof APPLICATION_STATUSES)[number], number>;
  serviceRequests: Record<(typeof SERVICE_REQUEST_STATUSES)[number], number>;
};

const emptyOverview: AdminOverviewData = {
  profileCount: 0,
  applications: Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, 0])) as AdminOverviewData['applications'],
  serviceRequests: Object.fromEntries(SERVICE_REQUEST_STATUSES.map((status) => [status, 0])) as AdminOverviewData['serviceRequests'],
};

function AdminError({ text }: { text: string }) {
  return <p role="alert" className="border border-brand-red/25 bg-brand-red/5 p-4 text-sm text-red-200">{text}</p>;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${statusTone(status)}`}>
      {status}
    </span>
  );
}

function useAllRequests() {
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void getDatabase()
      .then((db) => {
        if (!active) return;
        unsubscribe = onSnapshot(
          query(collection(db, 'membershipRequests'), orderBy('createdAt', 'desc')),
          (snapshot) => {
            setRequests(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as MembershipRequest));
            setLoading(false);
            setError('');
          },
          (listenError) => {
            setError(listenError instanceof FirebaseError && listenError.code === 'permission-denied'
              ? 'Your verified admin claim is missing or revoked. Refresh your sign-in session and try again.'
              : 'Membership requests could not be loaded.');
            setLoading(false);
          },
        );
        if (!active) unsubscribe();
      })
      .catch(() => {
        if (active) {
          setError('Could not connect to the membership database.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return { requests, loading, error };
}

function useAdminOverview() {
  const [data, setData] = useState<AdminOverviewData>(emptyOverview);
  const [recentApplications, setRecentApplications] = useState<DashboardApplication[]>([]);
  const [recentServiceRequests, setRecentServiceRequests] = useState<DashboardServiceRequest[]>([]);
  const [applicationsNeedingReview, setApplicationsNeedingReview] = useState<DashboardApplication[]>([]);
  const [serviceRequestsNeedingAttention, setServiceRequestsNeedingAttention] = useState<DashboardServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const unsubscribers: Array<() => void> = [];
    let summaryRefreshTimer: number | undefined;
    setLoading(true);
    setError('');

    const reportError = (message: string) => {
      if (active) {
        setError(message);
        setLoading(false);
      }
    };

    const loadSummary = async (db: Awaited<ReturnType<typeof getDatabase>>) => {
      try {
        const [profileCount, applicationCounts, serviceRequestCounts] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          Promise.all(APPLICATION_STATUSES.map(async (status) => {
            const snapshot = await getCountFromServer(query(
              collection(db, 'membershipRequests'),
              where('status', '==', status),
            ));
            return [status, snapshot.data().count] as const;
          })),
          Promise.all(SERVICE_REQUEST_STATUSES.map(async (status) => {
            const snapshot = await getCountFromServer(query(
              collection(db, 'serviceRequests'),
              where('status', '==', status),
            ));
            return [status, snapshot.data().count] as const;
          })),
        ]);
        if (active) {
          setData({
            profileCount: profileCount.data().count,
            applications: Object.fromEntries(applicationCounts) as AdminOverviewData['applications'],
            serviceRequests: Object.fromEntries(serviceRequestCounts) as AdminOverviewData['serviceRequests'],
          });
          setLoading(false);
          setError('');
        }
      } catch (summaryError) {
        reportError(summaryError instanceof FirebaseError && summaryError.code === 'permission-denied'
          ? 'The overview could not read the admin records. Refresh your sign-in session and verify administrator access.'
          : 'Overview metrics could not be loaded. Check the Firestore connection and try again.');
      }
    };

    const scheduleSummaryRefresh = (db: Awaited<ReturnType<typeof getDatabase>>) => {
      if (summaryRefreshTimer !== undefined) window.clearTimeout(summaryRefreshTimer);
      summaryRefreshTimer = window.setTimeout(() => void loadSummary(db), 500);
    };

    void getDatabase()
      .then((db) => {
        if (!active) return;
        void loadSummary(db);

        const listen = <T,>(
          collectionName: string,
          statuses: string[] | null,
          onData: (records: T[]) => void,
        ) => {
          const constraints = statuses
            ? [where('status', 'in', statuses), orderBy('createdAt', 'desc'), limit(6)]
            : [orderBy('createdAt', 'desc'), limit(6)];
          const unsubscribe = onSnapshot(
            query(collection(db, collectionName), ...constraints),
            (snapshot) => {
              const records = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as T);
              onData(records);
              scheduleSummaryRefresh(db);
            },
            (listenError) => {
              reportError(listenError instanceof FirebaseError && listenError.code === 'permission-denied'
                ? 'The overview could not read admin records. Refresh your sign-in session and verify administrator access.'
                : 'Recent admin records could not be loaded. Please retry.');
            },
          );
          unsubscribers.push(unsubscribe);
        };

        listen<DashboardApplication>('membershipRequests', null, setRecentApplications);
        listen<DashboardServiceRequest>('serviceRequests', null, setRecentServiceRequests);
        listen<DashboardApplication>(
          'membershipRequests',
          ['Pending', 'Under Review', 'More Information Required'],
          setApplicationsNeedingReview,
        );
        listen<DashboardServiceRequest>(
          'serviceRequests',
          ['Submitted', 'Awaiting Information'],
          setServiceRequestsNeedingAttention,
        );
      })
      .catch(() => reportError('Could not connect to the membership database.'));

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      if (summaryRefreshTimer !== undefined) window.clearTimeout(summaryRefreshTimer);
    };
  }, [reloadKey]);

  return {
    data,
    recentApplications,
    recentServiceRequests,
    applicationsNeedingReview,
    serviceRequestsNeedingAttention,
    loading,
    error,
    retry: () => setReloadKey((value) => value + 1),
  };
}

function formatOverviewDate(value: Timestamp | null) {
  return value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(value.toDate())
    : 'Date unavailable';
}

function DistributionPanel({
  title,
  items,
  loading,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
  loading: boolean;
}) {
  const maximum = Math.max(1, ...items.map((item) => item.count));
  return (
    <section className={`${panelClass} rounded-xl`}>
      <h2 className="font-display text-lg font-bold text-white">{title}</h2>
      {loading ? (
        <p role="status" className="mt-4 text-sm text-neutral-400">Loading status totals…</p>
      ) : items.every((item) => item.count === 0) ? (
        <p className="mt-4 text-sm text-neutral-400">No records to visualize yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.label} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-x-3 gap-y-1">
              <span className="truncate text-xs text-neutral-300">{item.label}</span>
              <span className="text-right text-xs font-semibold tabular-nums text-neutral-200">{item.count}</span>
              <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="block h-full rounded-full bg-brand-red transition-[width]"
                  style={{ width: `${(item.count / maximum) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const overview = useAdminOverview();
  const pendingApplications = overview.data.applications.Pending
    + overview.data.applications['Under Review'];
  const newRequests = overview.data.serviceRequests.Submitted;
  const inProgressRequests = overview.data.serviceRequests['In Progress'];
  const completedRequests = overview.data.serviceRequests.Completed;
  const recentActivity = [
    ...overview.recentApplications.map((application) => ({
      id: `membership-${application.id}`,
      title: 'Membership application submitted',
      subtitle: `${application.applicantName || application.applicantEmail} · ${application.membershipType}`,
      createdAt: application.createdAt,
      to: `/admin/requests/${application.id}`,
      icon: UserRound,
    })),
    ...overview.recentServiceRequests.map((request) => ({
      id: `service-${request.id}`,
      title: request.kind === 'support' ? 'Support request received' : 'Service request submitted',
      subtitle: `${request.requesterName || request.requesterEmail} · ${request.title}`,
      createdAt: request.createdAt,
      to: '/admin/service-requests',
      icon: FilePlus2,
    })),
  ].sort((left, right) => (right.createdAt?.toMillis() ?? 0) - (left.createdAt?.toMillis() ?? 0)).slice(0, 8);
  const attentionItems = [
    ...overview.applicationsNeedingReview.map((application) => ({
      id: `membership-${application.id}`,
      title: application.applicantName || application.applicantEmail,
      detail: `${application.membershipType} membership application`,
      status: application.status,
      to: `/admin/requests/${application.id}`,
    })),
    ...overview.serviceRequestsNeedingAttention.map((request) => ({
      id: `request-${request.id}`,
      title: request.title,
      detail: `${request.kind === 'support' ? 'Support' : request.category} · ${request.requesterName || request.requesterEmail}`,
      status: request.status,
      to: '/admin/service-requests',
    })),
  ].slice(0, 8);

  return (
    <PortalFrame admin title="Overview">
      <section className="relative isolate overflow-hidden rounded-xl border border-white/10 bg-[#151517] p-5 sm:p-7">
        <div className="absolute inset-y-0 right-0 -z-10 w-2/3 bg-gradient-to-l from-brand-red/15 to-transparent" aria-hidden="true" />
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">Administrative overview</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-white sm:text-3xl">
          Welcome{user?.displayName ? `, ${user.displayName}` : ' to your admin console'}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
          Review membership applications and service requests using the latest records in Firestore.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/admin/membership-applications" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-button px-4 text-xs font-bold text-white hover:bg-brand-button-hover">
            <LayoutDashboard size={15} aria-hidden="true" /> Review applications
          </Link>
          <Link to="/admin/service-requests" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white hover:border-white/30">
            <FilePlus2 size={15} aria-hidden="true" /> Open service queue
          </Link>
          <button type="button" onClick={overview.retry} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white hover:border-white/30">
            Refresh data
          </button>
        </div>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Registered profiles" value={overview.loading ? null : overview.data.profileCount} detail="Firestore user profiles" />
        <StatCard label="Applications to review" value={overview.loading ? null : pendingApplications} detail="Pending or under review" />
        <StatCard label="New service requests" value={overview.loading ? null : newRequests} detail="Submitted, not yet reviewed" />
        <StatCard label="Requests in progress" value={overview.loading ? null : inProgressRequests} detail="Current service requests" />
        <StatCard label="Completed requests" value={overview.loading ? null : completedRequests} detail="No separate projects collection" />
      </div>

      {overview.error && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <AdminError text={overview.error} />
          <button type="button" onClick={overview.retry} className="min-h-10 shrink-0 rounded-lg border border-white/15 px-4 text-xs font-semibold text-white hover:border-white/30">
            Retry
          </button>
        </div>
      )}
      {overview.loading && <p role="status" className="mt-4 text-xs text-neutral-500">Refreshing live metrics…</p>}

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <DistributionPanel
          title="Membership application status"
          items={APPLICATION_STATUSES.map((status) => ({ label: status, count: overview.data.applications[status] }))}
          loading={overview.loading}
        />
        <DistributionPanel
          title="Service request status"
          items={SERVICE_REQUEST_STATUSES.map((status) => ({ label: status, count: overview.data.serviceRequests[status] }))}
          loading={overview.loading}
        />
      </div>

      <div className="mt-5 grid items-start gap-4 xl:grid-cols-2">
        <section className={`${panelClass} rounded-xl`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">Live Firestore records</p>
              <h2 className="mt-1 font-display text-lg font-bold text-white">Recent submissions</h2>
            </div>
            <Bell size={17} className="text-neutral-500" aria-hidden="true" />
          </div>
          {overview.loading && recentActivity.length === 0 ? (
            <p role="status" className="mt-4 text-sm text-neutral-400">Loading recent activity…</p>
          ) : recentActivity.length ? (
            <ul className="mt-3 divide-y divide-white/[0.06]">
              {recentActivity.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link to={item.to} className="flex min-h-16 items-center gap-3 py-3 hover:text-white">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red"><Icon size={16} aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-neutral-200">{item.title}</span>
                        <span className="mt-1 block truncate text-xs text-neutral-500">{item.subtitle}</span>
                      </span>
                      <span className="hidden shrink-0 text-right text-[10px] text-neutral-500 sm:block">{formatOverviewDate(item.createdAt)}</span>
                      <ArrowRight size={14} className="shrink-0 text-neutral-500" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-400">No application or service request submissions have been recorded yet.</p>
          )}
        </section>

        <section className={`${panelClass} rounded-xl`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">Items requiring attention</p>
              <h2 className="mt-1 font-display text-lg font-bold text-white">Review queue</h2>
            </div>
            <Clock3 size={17} className="text-brand-gold" aria-hidden="true" />
          </div>
          {overview.loading && attentionItems.length === 0 ? (
            <p role="status" className="mt-4 text-sm text-neutral-400">Checking the review queue…</p>
          ) : attentionItems.length ? (
            <ul className="mt-3 divide-y divide-white/[0.06]">
              {attentionItems.map((item) => (
                <li key={item.id}>
                  <Link to={item.to} className="flex min-h-16 items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-neutral-200">{item.title}</span>
                      <span className="mt-1 block truncate text-xs text-neutral-500">{item.detail}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={item.status} />
                      <ArrowRight size={14} className="text-neutral-500" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-400">No membership applications or service requests currently require review.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-4 border-t border-white/[0.06] pt-3">
            <Link to="/admin/membership-applications" className="text-xs font-semibold text-neutral-300 hover:text-white">All applications <ArrowRight size={12} className="ml-1 inline" aria-hidden="true" /></Link>
            <Link to="/admin/service-requests" className="text-xs font-semibold text-neutral-300 hover:text-white">All service requests <ArrowRight size={12} className="ml-1 inline" aria-hidden="true" /></Link>
          </div>
        </section>
      </div>
    </PortalFrame>
  );
}

export function AdminMembershipApplications() {
  const { requests, loading, error } = useAllRequests();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
      const matchesSearch = !term || [
        request.id,
        request.applicantName,
        request.applicantEmail,
        request.membershipType,
      ].some((value) => value.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  return (
    <PortalFrame admin title="Membership requests">
        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total requests" value={requests.length} />
          <StatCard label="Pending review" value={requests.filter((item) => item.status === 'Pending').length} />
          <StatCard label="Approved" value={requests.filter((item) => item.status === 'Approved').length} />
          <StatCard label="Rejected" value={requests.filter((item) => item.status === 'Rejected').length} />
        </div>
        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]">
          <label className="relative">
            <span className="sr-only">Search requests</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, reference, or type"
              className={`${inputClass} pl-10`}
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
              <option value="All">All statuses</option>
              {MEMBERSHIP_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </div>
        {loading ? (
          <p role="status" className="py-8 text-sm text-neutral-400">Loading membership requests…</p>
        ) : error ? (
          <AdminError text={error} />
        ) : filteredRequests.length === 0 ? (
          <div className={panelClass}>
            <p className="text-sm text-neutral-400">{requests.length ? 'No requests match your filters.' : 'No membership requests have been submitted yet.'}</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-white/10">
            <div className="hidden grid-cols-[1.15fr_1fr_0.8fr_0.8fr_auto] gap-4 bg-white/[0.04] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500 md:grid">
              <span>Applicant</span><span>Membership type</span><span>Submitted</span><span>Status</span><span />
            </div>
            <ul className="divide-y divide-white/10">
              {filteredRequests.map((request) => (
                <li key={request.id}>
                  <Link
                    to={`/admin/requests/${request.id}`}
                    className="grid gap-3 px-5 py-4 transition hover:bg-white/[0.03] md:grid-cols-[1.15fr_1fr_0.8fr_0.8fr_auto] md:items-center md:gap-4"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white">{request.applicantName}</span>
                      <span className="mt-1 block truncate text-xs text-neutral-500">{request.applicantEmail}</span>
                      <span className="mt-1 block truncate font-mono text-[10px] text-neutral-600">{request.id}</span>
                    </span>
                    <span className="text-sm text-neutral-300">{request.membershipType}</span>
                    <span className="text-xs text-neutral-400">{formatDate(request.createdAt)}</span>
                    <span><StatusBadge status={request.status} /></span>
                    <ArrowRight size={16} className="hidden text-brand-gold md:block" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
    </PortalFrame>
  );
}

function StatCard({ label, value, detail }: { label: string; value: number | null; detail?: string }) {
  return (
    <div className={`${panelClass} rounded-xl`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-white">{value === null ? '—' : value}</p>
      {detail && <p className="mt-1 text-[10px] leading-4 text-neutral-500">{detail}</p>}
    </div>
  );
}

export function AdminRequestDetail() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState<MembershipRequest | null>(null);
  const [status, setStatus] = useState<MembershipStatus>('Pending');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [memberMessage, setMemberMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requestId) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void getDatabase()
      .then((db) => {
        if (!active) return;
        unsubscribe = onSnapshot(doc(db, 'membershipRequests', requestId), (snapshot) => {
          if (!snapshot.exists()) {
            setError('This request does not exist.');
            return;
          }
          const data = { id: snapshot.id, ...snapshot.data() } as MembershipRequest;
          setRequest(data);
          setStatus(data.status);
          setAdminRemarks(data.adminRemarks);
          setMemberMessage(data.memberVisibleMessage);
          setError('');
        }, () => setError('This request could not be loaded. Verify your administrator access.'));
      })
      .catch(() => {
        if (active) setError('Could not connect to the membership database.');
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [requestId]);

  const saveReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!request || !requestId || !user) return;
    setIsBusy(true);
    setError('');
    setNotice('');

    try {
      const db = await getDatabase();
      const batch = writeBatch(db);
      const updatedAt = serverTimestamp();
      const profileRef = doc(db, 'users', request.userId);
      const profileSnapshot = await getDoc(profileRef);
      const profileUpdate: Record<string, unknown> = { membershipStatus: status, updatedAt };
      if (status === 'Approved') {
        profileUpdate.membershipType = request.membershipType;
        profileUpdate.memberSince = profileSnapshot.data()?.memberSince ?? serverTimestamp();
      }
      batch.update(doc(db, 'membershipRequests', requestId), {
        status,
        adminRemarks: adminRemarks.trim(),
        memberVisibleMessage: memberMessage.trim(),
        updatedAt,
      });
      batch.set(profileRef, profileSnapshot.exists()
        ? profileUpdate
        : {
            uid: request.userId,
            email: request.applicantEmail,
            displayName: request.applicantName,
            photoURL: '',
            membershipStatus: status,
            ...(status === 'Approved'
              ? { membershipType: request.membershipType, memberSince: serverTimestamp() }
              : {}),
            createdAt: serverTimestamp(),
            updatedAt,
          }, { merge: true });

      if (
        request.status !== status ||
        request.memberVisibleMessage !== memberMessage.trim()
      ) {
        batch.set(doc(collection(db, 'membershipRequests', requestId, 'history')), {
          previousStatus: request.status,
          newStatus: status,
          changedBy: user.uid,
          timestamp: serverTimestamp(),
          message: memberMessage.trim(),
        });
      }

      if (
        request.status !== status ||
        request.memberVisibleMessage !== memberMessage.trim()
      ) {
        const notificationType = request.status !== status
          ? status === 'More Information Required'
            ? 'additional_information_requested'
            : 'membership_status_changed'
          : 'admin_message';
        const notificationTitle = notificationType === 'admin_message'
          ? 'New message from the studio'
          : status === 'Approved'
            ? 'Membership application approved'
            : status === 'Rejected'
              ? 'Membership application decision'
              : notificationType === 'additional_information_requested'
                ? 'More information is needed'
                : 'Membership application updated';
        batch.set(doc(collection(db, 'users', request.userId, 'notifications')), {
          type: notificationType,
          title: notificationTitle,
          message: (memberMessage.trim() || `Your membership application status is now ${status}.`).slice(0, 1000),
          relatedType: 'membership',
          relatedId: requestId,
          createdAt: serverTimestamp(),
          read: false,
          readAt: null,
        });
      }

      await batch.commit();
      setNotice('Request review saved.');
    } catch (saveError) {
      setError(saveError instanceof FirebaseError && saveError.code === 'permission-denied'
        ? 'Firestore denied this update. Confirm this account has the active administrator claim.'
        : 'The review could not be saved. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <PortalFrame admin title="Review membership request">
      <div className="grid items-start gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          {error ? <AdminError text={error} /> : request ? (
            <MembershipRequestDetail adminView embedded />
          ) : (
            <p role="status" className="text-sm text-neutral-400">Loading request…</p>
          )}
        </div>
        <form onSubmit={saveReview} className={`${panelClass} space-y-5`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold">Decision</p>
            <label htmlFor="requestStatus" className="mb-2 mt-4 block text-xs font-semibold text-neutral-300">Status</label>
            <select id="requestStatus" value={status} onChange={(event) => setStatus(event.target.value as MembershipStatus)} className={inputClass}>
              {MEMBERSHIP_STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="adminRemarks" className="mb-2 block text-xs font-semibold text-neutral-300">Internal notes</label>
            <textarea id="adminRemarks" value={adminRemarks} onChange={(event) => setAdminRemarks(event.target.value)} maxLength={4000} rows={4} className={`${inputClass} py-3`} />
            <p className="mt-1 text-[10px] text-neutral-500">Visible only to authorized administrators.</p>
          </div>
          <div>
            <label htmlFor="memberMessage" className="mb-2 block text-xs font-semibold text-neutral-300">Message to member</label>
            <textarea id="memberMessage" value={memberMessage} onChange={(event) => setMemberMessage(event.target.value)} maxLength={2000} rows={4} className={`${inputClass} py-3`} />
          </div>
          {notice && <p role="status" className="text-sm text-brand-gold">{notice}</p>}
          {error && request && <AdminError text={error} />}
          <button type="submit" disabled={isBusy || !request} className="min-h-11 w-full rounded-full bg-brand-button px-5 text-xs font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60">
            {isBusy ? 'Saving…' : 'Save review'}
          </button>
        </form>
      </div>
    </PortalFrame>
  );
}

export function AdminMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [busyUid, setBusyUid] = useState('');

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void getDatabase()
      .then((db) => {
        if (!active) return;
        unsubscribe = onSnapshot(
          query(collection(db, 'users'), orderBy('displayName')),
          (snapshot) => {
            setMembers(snapshot.docs.map((entry) => ({ uid: entry.id, ...entry.data() }) as AdminMember));
            setLoading(false);
            setError('');
          },
          () => {
            setError('Members could not be loaded. Verify your administrator access.');
            setLoading(false);
          },
        );
      })
      .catch(() => {
        if (active) {
          setError('Could not connect to the membership database.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const filteredMembers = members.filter((member) => {
    const term = search.trim().toLowerCase();
    return !term || [member.displayName, member.email, member.uid].some((value) => value.toLowerCase().includes(term));
  });

  const updateMemberStatus = async (member: AdminMember, membershipStatus: string) => {
    if (!user) return;
    if (member.membershipStatus === membershipStatus) {
      setNotice('That member already has this status.');
      return;
    }
    if (!MEMBER_ACCOUNT_STATUSES.some((status) => status === membershipStatus)) return;
    setBusyUid(member.uid);
    setNotice('');
    setError('');
    try {
      const db = await getDatabase();
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', member.uid), {
        membershipStatus,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(collection(db, 'users', member.uid, 'notifications')), {
        type: 'membership_status_changed',
        title: membershipStatus === 'Approved'
          ? 'Membership application approved'
          : membershipStatus === 'Active'
            ? 'Membership is active'
            : membershipStatus === 'Rejected'
              ? 'Membership application decision'
              : 'Membership status updated',
        message: `Your membership status is now ${membershipStatus}.`,
        relatedType: 'membership',
        relatedId: '',
        createdAt: serverTimestamp(),
        read: false,
        readAt: null,
      });
      await batch.commit();
      setNotice(`Updated membership status for ${member.displayName || member.email}.`);
    } catch (updateError) {
      setError(updateError instanceof FirebaseError && updateError.code === 'permission-denied'
        ? 'Firestore denied this update. Confirm this account has the active administrator claim.'
        : 'The member status could not be updated.');
    } finally {
      setBusyUid('');
    }
  };

  return (
    <PortalFrame admin title="Manage members">
      <label className="relative mb-5 block max-w-xl">
        <span className="sr-only">Search members</span>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or UID" className={`${inputClass} pl-10`} />
      </label>
      {notice && <p role="status" className="mb-4 text-sm text-brand-gold">{notice}</p>}
      {error && <AdminError text={error} />}
      {loading ? (
        <p role="status" className="py-8 text-sm text-neutral-400">Loading members…</p>
      ) : filteredMembers.length === 0 ? (
        <div className={panelClass}><p className="text-sm text-neutral-400">No members match your search.</p></div>
      ) : (
        <div className="overflow-hidden border border-white/10">
          <ul className="divide-y divide-white/10">
            {filteredMembers.map((member) => (
              <li key={member.uid} className="flex flex-col gap-4 bg-[#151517] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {member.photoURL ? (
                    <img src={member.photoURL} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs text-neutral-300">
                      {(member.displayName || member.email || '?').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{member.displayName || 'Member'}</span>
                    <span className="block truncate text-xs text-neutral-400">{member.email}</span>
                    <span className="mt-1 block truncate font-mono text-[10px] text-neutral-600">{member.uid}</span>
                  </span>
                </div>
                <label className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">Status</span>
                  <select
                    value={member.membershipStatus || 'Not Applied'}
                    disabled={busyUid === member.uid}
                    onChange={(event) => void updateMemberStatus(member, event.target.value)}
                    className="min-h-10 border border-white/15 bg-brand-dark px-3 text-xs text-white disabled:opacity-60"
                  >
                    {MEMBER_ACCOUNT_STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PortalFrame>
  );
}
