import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, allowedRoles, children }) {
  const token = localStorage.getItem('token');

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-rejected)' }}>
        <h2>403 — Forbidden</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return children;
}
