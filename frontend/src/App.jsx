import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
import { initSignalR, stopSignalR } from './services/signalr';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FounderDashboard from './pages/FounderDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import SocialFeed from './pages/SocialFeed';
import ProposalMarketplace from './pages/ProposalMarketplace';
import DiscussionRoom from './pages/DiscussionRoom';
import SubscriptionPlans from './pages/SubscriptionPlans';
import TrustScoreView from './pages/TrustScoreView';
import VerificationDashboard from './pages/VerificationDashboard';
import VerificationReviewPage from './pages/VerificationReviewPage';
import DashboardOverview from './pages/DashboardOverview';
import ConsultationHub from './pages/ConsultationHub';
import AdminSubscriptionManager from './pages/AdminSubscriptionManager';
import LandingHome from './pages/LandingHome';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [discussionId, setDiscussionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Derive currentTab from URL path
  const currentPath = location.pathname.substring(1) || 'home';
  const currentTab = currentPath;

  const handleSetTab = (tab) => {
    if (!tab) return;
    if (tab === 'home') navigate('/landing');
    else navigate(`/${tab}`);
    setSidebarOpen(false);
  };

  const fetchSubscription = async () => {
    try {
      const data = await api.get('/subscription/my');
      setActiveSub(data);
    } catch {
      setActiveSub(null);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'Investor' || user.role === 'Founder')) {
      fetchSubscription();
    }
  }, [user, currentTab]);

  const subData = activeSub?.data || activeSub?.Data;
  const sub = subData?.subscription || subData?.Subscription;
  const price = sub?.price ?? sub?.Price ?? 0;
  const name = sub?.name ?? sub?.Name ?? '';
  const subStatus = subData?.status || subData?.Status || '';
  const hasActive = Boolean(activeSub?.hasActive || activeSub?.HasActive);
  const hasPremium = Boolean(hasActive && (subStatus === 'Active' || subStatus === '') && (price > 0 || name.toLowerCase().includes('premium')));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(u);
        if (u?.id && u?.role) {
          initSignalR(u.id, u.role);
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const getDefaultTab = (role) => {
    if (role === 'Reviewer') return 'reviews';
    if (role === 'Investor') return 'marketplace';
    return 'overview';
  };

  const handleLoginSuccess = (data) => {
    const userObj = data?.user || {
      id: data?.id ?? data?.Id,
      username: data?.username ?? data?.Username,
      role: data?.role ?? data?.Role,
      fullName: data?.fullName ?? data?.FullName,
      email: data?.email ?? data?.Email,
      department: data?.department ?? data?.Department,
      patentId: data?.patentId ?? data?.PatentId,
      patentVerificationStatus: data?.patentVerificationStatus ?? data?.PatentVerificationStatus,
      patentDetailsJson: data?.patentDetailsJson ?? data?.PatentDetailsJson
    };

    const tokenVal = data?.token ?? data?.Token;

    if (tokenVal) localStorage.setItem('token', tokenVal);
    if (userObj) localStorage.setItem('user', JSON.stringify(userObj));
    setToken(tokenVal);
    setUser(userObj);

    const defaultTab = getDefaultTab(userObj?.role);
    navigate(`/${defaultTab}`);

    if (userObj?.id && userObj?.role) {
      initSignalR(userObj.id, userObj.role);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    stopSignalR();
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  };

  // Helper renderers for routes with complex guards
  const renderDashboardRoute = () => {
    if (user?.role === 'Founder') {
      return (
        <FounderDashboard
          user={user}
          setUser={setUser}
          currentTab="dashboard"
          setCurrentTab={handleSetTab}
        />
      );
    }
    if (user?.role === 'Investor') {
      return (
        <InvestorDashboard
          setCurrentTab={handleSetTab}
          setDiscussionId={setDiscussionId}
        />
      );
    }
    return <DashboardOverview user={user} setCurrentTab={handleSetTab} />;
  };

  const renderTrustRoute = () => {
    if (user?.role === 'Admin' || user?.role === 'Reviewer') {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-rejected)' }}>
          <h2>403 — Forbidden</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Trust Score and Verification submission features are restricted exclusively to Founder and Investor accounts.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => handleSetTab(getDefaultTab(user?.role))}>
            Return to Dashboard
          </button>
        </div>
      );
    }
    return <TrustScoreView user={user} />;
  };

  const renderVerificationRoute = () => {
    if (user?.role === 'Admin' || user?.role === 'Reviewer') {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-rejected)' }}>
          <h2>403 — Forbidden</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Trust Score and Verification submission features are restricted exclusively to Founder and Investor accounts.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => handleSetTab(getDefaultTab(user?.role))}>
            Return to Dashboard
          </button>
        </div>
      );
    }
    return <VerificationDashboard user={user} />;
  };

  const renderConsultationsRoute = () => {
    if (user?.role === 'Investor' && !hasPremium) {
      return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: 540, margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
          <h2 style={{ color: 'var(--text-primary)' }}>Premium Feature Only</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 1.5rem', lineHeight: '1.6', fontSize: '0.92rem' }}>
            Expert Consultations are available exclusively for Premium Investor members. Upgrade your plan to access this feature.
          </p>
          <button className="btn btn-primary" onClick={() => handleSetTab('subscription')}>
            Upgrade to Premium Plan
          </button>
        </div>
      );
    }
    return <ConsultationHub user={user} userRole={user?.role} setCurrentTab={handleSetTab} />;
  };

  // Auth views when unauthenticated
  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={
          <Register
            onRegisterSuccess={() => navigate('/login')}
            switchToLogin={() => navigate('/login')}
            goToHome={() => navigate('/landing')}
          />
        } />
        <Route path="/landing" element={
          <div className="app-layout" style={{ display: 'block', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <header style={{
              background: 'var(--bg-card)',
              borderBottom: '1px solid var(--border-color)',
              padding: '1rem 2rem',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '1rem', fontWeight: 'bold'
                }}>🏛️</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#000000', letterSpacing: '-0.02em' }}>InnovAura</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/login')}
                  style={{ fontWeight: '700' }}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/register')}
                  style={{ fontWeight: '700' }}
                >
                  Register Account
                </button>
              </div>
            </header>
            <main style={{ padding: '2rem 1.5rem' }}>
              <LandingHome user={null} setCurrentTab={(tab) => {
                if (tab === 'new-proposal') navigate('/register');
                else navigate('/login');
              }} />
            </main>
          </div>
        } />
        <Route path="/login" element={
          <Login
            onLoginSuccess={handleLoginSuccess}
            switchToRegister={() => navigate('/register')}
            goToHome={() => navigate('/landing')}
          />
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Main application layout when authenticated
  return (
    <div className="app-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 35, display: 'none'
          }}
          className="sidebar-overlay"
        />
      )}

      <Sidebar
        user={user}
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        sidebarOpen={sidebarOpen}
        hasPremium={hasPremium}
      />

      <div className="main-content">
        <Navbar
          user={user}
          currentTab={currentTab}
          handleLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(o => !o)}
          setCurrentTab={handleSetTab}
        />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to={`/${getDefaultTab(user.role)}`} replace />} />
            <Route path="/login" element={<Navigate to={`/${getDefaultTab(user.role)}`} replace />} />
            <Route path="/register" element={<Navigate to={`/${getDefaultTab(user.role)}`} replace />} />
            <Route path="/home" element={<Navigate to={`/${getDefaultTab(user.role)}`} replace />} />

            <Route path="/overview" element={
              <ProtectedRoute user={user}>
                {user.role === 'Investor' ? <Navigate to="/marketplace" replace /> : <DashboardOverview user={user} setCurrentTab={handleSetTab} />}
              </ProtectedRoute>
            } />

            <Route path="/feed" element={
              <ProtectedRoute user={user}>
                <SocialFeed />
              </ProtectedRoute>
            } />

            <Route path="/marketplace" element={
              <ProtectedRoute user={user}>
                <ProposalMarketplace user={user} setCurrentTab={handleSetTab} setDiscussionId={setDiscussionId} />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute user={user}>
                {renderDashboardRoute()}
              </ProtectedRoute>
            } />

            <Route path="/new-proposal" element={
              <ProtectedRoute user={user} allowedRoles={['Founder']}>
                <FounderDashboard user={user} setUser={setUser} currentTab="new-proposal" setCurrentTab={handleSetTab} />
              </ProtectedRoute>
            } />

            <Route path="/edit-proposal" element={
              <ProtectedRoute user={user} allowedRoles={['Founder']}>
                <FounderDashboard user={user} setUser={setUser} currentTab="edit-proposal" setCurrentTab={handleSetTab} />
              </ProtectedRoute>
            } />

            <Route path="/discussions" element={
              <ProtectedRoute user={user}>
                <DiscussionRoom user={user} discussionId={discussionId} setDiscussionId={setDiscussionId} />
              </ProtectedRoute>
            } />

            <Route path="/consultations" element={
              <ProtectedRoute user={user}>
                {renderConsultationsRoute()}
              </ProtectedRoute>
            } />

            <Route path="/trust" element={
              <ProtectedRoute user={user}>
                {renderTrustRoute()}
              </ProtectedRoute>
            } />

            <Route path="/verification" element={
              <ProtectedRoute user={user}>
                {renderVerificationRoute()}
              </ProtectedRoute>
            } />

            <Route path="/subscription" element={
              <ProtectedRoute user={user} allowedRoles={['Founder', 'Investor']}>
                <SubscriptionPlans user={user} onSubscriptionChange={fetchSubscription} />
              </ProtectedRoute>
            } />

            <Route path="/reviews" element={
              <ProtectedRoute user={user} allowedRoles={['Reviewer']}>
                <ReviewerDashboard user={user} currentTab="reviews" setCurrentTab={handleSetTab} />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute user={user} allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/analytics" element={
              <ProtectedRoute user={user} allowedRoles={['Admin']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />

            <Route path="/verification-review" element={
              <ProtectedRoute user={user} allowedRoles={['Admin']}>
                <VerificationReviewPage user={user} />
              </ProtectedRoute>
            } />

            <Route path="/admin-subscriptions" element={
              <ProtectedRoute user={user} allowedRoles={['Admin']}>
                <AdminSubscriptionManager user={user} />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to={`/${getDefaultTab(user.role)}`} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
