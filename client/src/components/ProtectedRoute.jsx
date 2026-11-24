import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from './ui/Spinner';

/**
 * ProtectedRoute — requires a logged-in user.
 * `roles` optionally restricts access (role-based authorization).
 * Unauthenticated → /login (remembering the intended destination).
 * Wrong role → redirected to the user's own home.
 */
export function ProtectedRoute({ roles }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader label="Restoring your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;
  }
  return <Outlet />;
}

/**
 * GuestRoute — login/register only. Authenticated users are sent home.
 */
export function GuestRoute() {
  const { user, initializing } = useAuth();
  if (initializing) return <FullPageLoader label="Restoring your session…" />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;
  return <Outlet />;
}
