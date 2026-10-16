import type { ReactNode } from 'react';
import { ClipboardList, FilePlus2, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { SITE_CONFIG } from '../config/site';

export default function PortalFrame({
  children,
  title,
  admin = false,
}: {
  children: ReactNode;
  title: string;
  admin?: boolean;
}) {
  const { user, isAdmin } = useAuth();
  const links = admin
    ? [
        { to: '/admin', label: 'Requests', icon: ClipboardList },
        { to: '/admin/members', label: 'Members', icon: UserRound },
        { to: '/dashboard', label: 'Member console', icon: LayoutDashboard },
      ]
    : [
        { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/requests', label: 'My requests', icon: ClipboardList },
        { to: '/requests/new', label: 'New request', icon: FilePlus2 },
        { to: '/profile', label: 'Profile', icon: UserRound },
        ...(isAdmin ? [{ to: '/admin', label: 'Admin console', icon: ClipboardList }] : []),
      ];

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch {
      window.alert('We could not sign you out. Please try again.');
    }
  };

  return (
    <>
      <Helmet>
        <title>{title} | {SITE_CONFIG.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
              {admin ? 'Administrator console' : 'Member console'}
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-10 w-10 rounded-full border border-white/15 object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-neutral-300">
                <UserRound size={18} aria-hidden="true" />
              </span>
            )}
            <span className="max-w-[180px] truncate text-xs text-neutral-300">
              {user?.displayName || user?.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition hover:border-brand-red/50 hover:text-white"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav aria-label={`${admin ? 'Administrator' : 'Member'} navigation`} className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-white/10 px-4 text-xs font-semibold text-neutral-300 transition hover:border-white/25 hover:text-white"
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </section>
    </>
  );
}
