import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user, isAdmin, isLoading, error } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[55svh] max-w-xl items-center justify-center px-5 text-center">
        <p role="status" className="text-sm text-neutral-400">
          Verifying your secure session…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p role="alert" className="text-sm text-brand-red">{error}</p>
        <Link to={admin ? '/admin/login' : '/login'} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-button px-5 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-brand-button-hover">
          Sign in again
        </Link>
      </div>
    );
  }
  if (!user) {
    return (
      <Navigate
        to={admin ? '/admin/login' : '/login'}
        replace
        state={{ from: location }}
      />
    );
  }
  if (admin && !isAdmin) return <Navigate to="/access-denied" replace />;

  return <Outlet />;
}
