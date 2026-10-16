import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { ArrowRight, Search } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getDatabase } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
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

export function AdminDashboard() {
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={panelClass}>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-white">{value}</p>
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
      batch.update(doc(db, 'membershipRequests', requestId), {
        status,
        adminRemarks: adminRemarks.trim(),
        memberVisibleMessage: memberMessage.trim(),
        updatedAt,
      });
      batch.set(profileRef, profileSnapshot.exists()
        ? { membershipStatus: status, updatedAt }
        : {
            uid: request.userId,
            email: request.applicantEmail,
            displayName: request.applicantName,
            photoURL: '',
            membershipStatus: status,
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
    setBusyUid(member.uid);
    setNotice('');
    setError('');
    try {
      const db = await getDatabase();
      await updateDoc(doc(db, 'users', member.uid), {
        membershipStatus,
        updatedAt: serverTimestamp(),
      });
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
                    <option>Not Applied</option>
                    {MEMBERSHIP_STATUSES.map((status) => <option key={status}>{status}</option>)}
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
