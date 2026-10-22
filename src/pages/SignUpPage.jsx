import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerWithEmail, loginWithGoogle, authError, clearAuthError, isFirebaseConfigured } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Intended destination after registration, defaulting to home
  const from = location.state?.from?.pathname || '/';

  function validate() {
    const errs = {};

    if (!displayName.trim()) {
      errs.displayName = 'Full name is required.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    clearAuthError();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await registerWithEmail(email, password, displayName);
      toast.success('Account created! Welcome to AlgoForge.');
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
          <h1 className="auth-heading">Create Account</h1>
          <p className="auth-subtext">
            Start tracking topic readiness and preparing for campus placement interviews.
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

        {/* Registration Form */}
        <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="signup-name" className="form-label">
              Full Name <span className="field-required">*</span>
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              className={`form-input ${fieldErrors.displayName ? 'input-error' : ''}`}
              placeholder="e.g. Alex Chen"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (fieldErrors.displayName) setFieldErrors((prev) => ({ ...prev, displayName: '' }));
              }}
              disabled={isSubmitting || isGoogleSubmitting}
              aria-invalid={Boolean(fieldErrors.displayName)}
              aria-describedby={fieldErrors.displayName ? 'name-error' : undefined}
            />
            {fieldErrors.displayName && (
              <span id="name-error" className="field-error" role="alert">
                {fieldErrors.displayName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">
              Email Address <span className="field-required">*</span>
            </label>
            <input
              id="signup-email"
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
              aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
            />
            {fieldErrors.email && (
              <span id="signup-email-error" className="field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">
              Password <span className="field-required">*</span>
            </label>
            <div className="password-input-wrap">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                disabled={isSubmitting || isGoogleSubmitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
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
              <span id="signup-password-error" className="field-error" role="alert">
                {fieldErrors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm-password" className="form-label">
              Confirm Password <span className="field-required">*</span>
            </label>
            <div className="password-input-wrap">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                disabled={isSubmitting || isGoogleSubmitting}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? 'confirm-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span id="confirm-error" className="field-error" role="alert">
                {fieldErrors.confirmPassword}
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
                Creating account...
              </span>
            ) : (
              'Create Account'
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
              <span>Sign up with Google</span>
            </>
          )}
        </button>

        {/* Footer Navigation Link */}
        <div className="auth-footer-link">
          Already have an account?{' '}
          <Link to="/login" state={{ from: location.state?.from }} className="auth-switch-link">
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}
