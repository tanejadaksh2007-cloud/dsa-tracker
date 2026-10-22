import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route wrapper for public authentication pages (/login, /signup).
 * If the user is already authenticated, redirects them to their intended destination or home.
 */
export default function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <div className="auth-spinner" />
        <p className="auth-loading-text">Verifying session...</p>
      </div>
    );
  }

  if (user) {
    const destination = location.state?.from?.pathname || '/';
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
