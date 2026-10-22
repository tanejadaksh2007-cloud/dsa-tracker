import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route wrapper that ensures the user is authenticated.
 * Displays a loading state while onAuthStateChanged is checking credentials.
 * Redirects unauthenticated users to /login and saves the intended location.
 */
export default function ProtectedRoute() {
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

  if (!user) {
    // Preserve requested path so the user can be redirected back after logging in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
