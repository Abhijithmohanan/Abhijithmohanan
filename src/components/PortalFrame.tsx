import type { ReactNode } from 'react';
import {
  Bell,
  ClipboardList,
  CircleHelp,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { NavLink } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { SITE_CONFIG } from '../config/site';

export default function PortalFrame({
  children,
  title,
  admin = false,
  showTitle = true,
}: {
  children: ReactNode;
  title: string;
  admin?: boolean;
  showTitle?: boolean;
}) {
  const { user, isAdmin } = useAuth();
  const links = admin
    ? [
        { to: '/admin', label: 'Requests', icon: ClipboardList },
        { to: '/admin/members', label: 'Members', icon: UserRound },
        { to: '/admin/service-requests', label: 'Service requests', icon: FilePlus2 },
        { to: '/dashboard', label: 'Member console', icon: LayoutDashboard },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/services', label: 'Explore services', icon: Sparkles },
        { to: '/service-requests/new', label: 'Raise a request', icon: FilePlus2 },
        { to: '/my-requests', label: 'My requests', icon: ClipboardList },
        { to: '/notifications', label: 'Notifications', icon: Bell },
        { to: '/profile', label: 'My profile', icon: UserRound },
        { to: '/help', label: 'Help & support', icon: CircleHelp },
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
      <section className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)] xl:gap-7">
          <aside className="min-w-0">
            <div className="mb-4 hidden border-b border-white/10 pb-4 lg:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                {admin ? 'Administration' : 'Member workspace'}
              </p>
              {user && <p className="mt-2 truncate text-xs font-medium text-neutral-300">{user.displayName || user.email}</p>}
            </div>
            <nav aria-label={`${admin ? 'Administrator' : 'Member'} navigation`} className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:-mx-7 sm:px-7 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard' || to === '/admin'}
                  className={({ isActive }) =>
                    `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition lg:flex ${
                      isActive
                        ? 'bg-brand-red/15 text-white lg:border-l-2 lg:border-brand-red'
                        : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                    }`
                  }
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
            {user && (
              <div className="mt-4 hidden border-t border-white/10 pt-4 lg:block">
                <div className="flex items-center gap-2">
                  {user.photoURL ? <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-neutral-400"><UserRound size={15} aria-hidden="true" /></span>}
                  <span className="min-w-0 truncate text-[11px] text-neutral-400">{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="mt-3 inline-flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-xs font-medium text-neutral-400 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <LogOut size={14} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </aside>
          <div className="min-w-0">
            {showTitle && (
              <div className="mb-5 border-b border-white/10 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                  {admin ? 'Administrator console' : 'Member workspace'}
                </p>
                <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {title}
                </h1>
              </div>
            )}
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
