import { Navigate, Outlet, useLocation } from 'react-router-dom';
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

  if (!user) {
    return (
      <Navigate
        to={admin ? '/admin/login' : '/login'}
        replace
        state={{ from: location }}
      />
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p role="alert" className="text-sm text-brand-red">{error}</p>
      </div>
    );
  }
  if (admin && !isAdmin) return <Navigate to="/access-denied" replace />;

  return <Outlet />;
}
