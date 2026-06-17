import { useState, useRef, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';

const TAB_TITLES = {
  home:                 { label: 'Platform Home & Overview', icon: '🏠' },
  overview:             { label: 'Dashboard Overview', icon: '📊' },
  dashboard:            { label: 'My Proposals', icon: '📁' },
  'new-proposal':       { label: 'Submit New Proposal', icon: '✏️' },
  feed:                 { label: 'Community Feed', icon: '💬' },
  marketplace:          { label: 'Proposal Marketplace', icon: '🏪' },
  discussions:          { label: 'Discussion Rooms', icon: '💬' },
  reviews:              { label: 'Evaluation Queue', icon: '📋' },
  admin:                { label: 'Governance & Approvals', icon: '🏛️' },
  analytics:            { label: 'System Analytics', icon: '📈' },
  'verification-review':{ label: 'Admin Verification Center', icon: '🛡️' },
  subscription:         { label: 'Subscription Plans', icon: '💳' },
  trust:                { label: 'Trust Scores', icon: '🔒' },
  verification:         { label: 'Verification Centre', icon: '✅' },
  consultations:        { label: 'Consultation Hub', icon: '📞' },
  'admin-subscriptions':{ label: 'Subscription Management', icon: '⚙️' },
};

export default function Navbar({ user, currentTab, handleLogout, onMenuClick, setCurrentTab }) {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const pageInfo = TAB_TITLES[currentTab] || { label: 'Governance Portal', icon: '🏛️' };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <header className="top-header">
      {/* Left — mobile menu + breadcrumb */}
      <div className="header-left">
        {/* Mobile hamburger */}
        <button
          className="icon-btn"
          onClick={onMenuClick}
          style={{ display: 'none' }}
          aria-label="Toggle menu"
          id="mobile-menu-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="header-title">
          <h1>{pageInfo.label}</h1>
        </div>
      </div>

      {/* Right — actions */}
      <div className="header-actions">
        {/* Department chip */}
        {user.department && (
          <span className="dept-badge" title={`Department: ${user.department}`}>
            {user.department}
          </span>
        )}

        {/* Notifications */}
        <div className="notification-bell">
          <NotificationCenter />
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            className="profile-btn"
            onClick={() => setShowProfile(v => !v)}
            aria-label="Profile menu"
            id="profile-menu-btn"
          >
            <div className="user-avatar" aria-hidden="true" style={{ color: '#000000', fontWeight: 800 }}>
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <span title={user.fullName} style={{ color: '#000000', fontWeight: 700 }}>{user.fullName?.split(' ')[0] || user.username}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#000000', flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showProfile && (
            <div className="profile-dropdown" role="menu" aria-label="Profile menu">
              <div className="profile-dropdown-header">
                <p style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{user.fullName || user.username}</p>
                <div style={{ fontSize: '0.78rem', color: '#1E293B', fontWeight: 500, marginTop: '0.15rem' }}>{user.email}</div>
                <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="user-role-chip" style={{ color: '#000000', fontWeight: 700 }}>{user.role}</span>
                  {user.department && <span>• Dept: {user.department}</span>}
                </div>
              </div>

              <button
                className="profile-dropdown-item"
                role="menuitem"
                id="my-profile-btn"
                onClick={() => {
                  if (setCurrentTab) setCurrentTab(user?.role === 'Investor' ? 'marketplace' : user?.role === 'Reviewer' ? 'reviews' : 'overview');
                  setShowProfile(false);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </button>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />

              <button
                className="profile-dropdown-item danger"
                role="menuitem"
                onClick={() => { handleLogout(); setShowProfile(false); }}
                id="logout-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
