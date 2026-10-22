import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, loginWithGoogle, authError, clearAuthError, isFirebaseConfigured } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Intended destination after login, defaulting to home
  const from = location.state?.from?.pathname || '/';

  function validate() {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    clearAuthError();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Welcome back to AlgoForge!');
      navigate(from, { replace: true });
    } catch (err) {
      // Handled by AuthContext and displayed in error box
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    clearAuthError();
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success('Successfully signed in with Google!');
      navigate(from, { replace: true });
    } catch (err) {
      // Handled by AuthContext and displayed in error box
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Branding Header */}
        <div className="auth-brand-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">◈</span>
            <span className="auth-logo-title">AlgoForge</span>
          </div>
          <p className="auth-tagline">Forge Your Problem-Solving Skills.</p>
          <h1 className="auth-heading">Sign In</h1>
          <p className="auth-subtext">
            Enter your credentials to access your roadmap and track problem readiness.
          </p>
        </div>

        {/* Configuration Warning if Firebase env is incomplete */}
        {!isFirebaseConfigured && (
          <div className="auth-notice-banner" role="alert">
            <span className="auth-notice-icon">⚠️</span>
            <div>
              <strong>Firebase Setup Required:</strong>
              <p>
                Add your <code>VITE_FIREBASE_API_KEY</code> and project credentials in your <code>.env</code> file to enable live authentication.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {authError && (
          <div className="auth-error-banner" role="alert">
            <span className="auth-error-icon">✕</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form className="auth-form" onSubmit={handleEmailSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">
              Email Address <span className="field-required">*</span>
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
              }}
              disabled={isSubmitting || isGoogleSubmitting}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <span id="email-error" className="field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">
              Password <span className="field-required">*</span>
            </label>
            <div className="password-input-wrap">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                disabled={isSubmitting || isGoogleSubmitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && (
              <span id="password-error" className="field-error" role="alert">
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={isSubmitting || isGoogleSubmitting}
          >
            {isSubmitting ? (
              <span className="auth-btn-spinner-wrap">
                <span className="auth-spinner-sm" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleLogin}
          disabled={isSubmitting || isGoogleSubmitting}
        >
          {isGoogleSubmitting ? (
            <span className="auth-btn-spinner-wrap">
              <span className="auth-spinner-sm" />
              Connecting to Google...
            </span>
          ) : (
            <>
              <svg className="google-icon" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Footer Navigation Link */}
        <div className="auth-footer-link">
          Don&apos;t have an account?{' '}
          <Link to="/signup" state={{ from: location.state?.from }} className="auth-switch-link">
            Create an account →
          </Link>
        </div>
      </div>
    </div>
  );
}
