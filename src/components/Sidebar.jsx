import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { TOPICS } from '../data';
import { selectOverallStats, resetProgress } from '../store/progressSlice';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ProgressRing from './ProgressRing';
import NavItem from './NavItem';
import ConfirmDialog from './ConfirmDialog';

export default function Sidebar({ isOpen, onNavigate }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const stats = useSelector(selectOverallStats);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const percent = stats.totalQ ? Math.round((stats.solved / stats.totalQ) * 100) : 0;

  async function handleLogout() {
    try {
      await logout();
      toast.info('Signed out successfully.');
    } catch (err) {
      toast.error('Failed to sign out.');
    }
  }

  function handleConfirmReset() {
    dispatch(resetProgress());
    setIsResetConfirmOpen(false);
    toast.info('All problem progress has been reset.');
  }

  return (
    <aside id="sidebar" className={isOpen ? 'open' : ''}>
      <div className="sidebar-top">
        <div className="logo">
          <span className="logo-icon">◈</span>
          <div>
            <div className="logo-title">AlgoForge</div>
            <div className="logo-sub">Campus Placement Prep</div>
          </div>
        </div>
        <ProgressRing percent={percent} />
      </div>

      <nav className="topic-nav" onClick={onNavigate}>
        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">⌂</span>
          <span className="nav-label">
            <span className="nav-name">All topics</span>
            <span className="nav-meta">home</span>
          </span>
        </NavLink>
        <NavLink to="/problems" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">⌕</span>
          <span className="nav-label">
            <span className="nav-name">Problem Explorer</span>
            <span className="nav-meta">search & filter</span>
          </span>
        </NavLink>
        {TOPICS.map((topic) => (
          <NavItem key={topic.id} topic={topic} />
        ))}
        <NavLink to="/custom-problems" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">★</span>
          <span className="nav-label">
            <span className="nav-name">Custom problems</span>
            <span className="nav-meta">personal list</span>
          </span>
        </NavLink>
        <NavLink to="/notes" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">✎</span>
          <span className="nav-label">
            <span className="nav-name">Prep notes</span>
            <span className="nav-meta">notes</span>
          </span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-profile-bar">
            <div className="user-avatar" title={user.displayName || user.email}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="user-avatar-img" />
              ) : (
                <span className="user-avatar-initial">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="user-info-text">
              <span className="user-display-name">{user.displayName || user.email?.split('@')[0]}</span>
              <span className="user-display-email" title={user.email}>{user.email}</span>
            </div>
            <button
              type="button"
              className="user-signout-btn"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              Log out
            </button>
          </div>
        )}

        <div className="quick-stats">
          <div className="qs-row"><span className="qs-dot solved-dot" /><span>{stats.solved} solved</span></div>
          <div className="qs-row"><span className="qs-dot attempted-dot" /><span>{stats.attempted} attempted</span></div>
          <div className="qs-row"><span className="qs-dot mastered-dot" /><span>{stats.mastered}/{TOPICS.length} topics mastered</span></div>
        </div>
        <button
          type="button"
          className="reset-all-btn"
          onClick={() => setIsResetConfirmOpen(true)}
        >
          Reset all progress
        </button>
      </div>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset All Progress"
        message="Are you sure you want to reset all tracked problem progress? This action cannot be undone."
        confirmText="Yes, Reset Everything"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </aside>
  );
}
