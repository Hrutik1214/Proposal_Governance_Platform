import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { subscribeToDashboardUpdates } from '../services/signalr';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const data = await api.get('/analytics/dashboard');
      setMetrics(data);
    } catch (err) {
      console.error('Error loading analytics metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const unsubscribe = subscribeToDashboardUpdates(() => {
      fetchMetrics();
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="page-container text-center" style={{ padding: '4rem 2rem' }}>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="page-container text-center" style={{ padding: '4rem 2rem', color: 'var(--color-rejected)' }}>
        <p>Failed to load analytics platform data.</p>
      </div>
    );
  }

  const { capitalPool, departmentSummary, recentTransactions } = metrics;

  // Visual Helper for SVG charts
  const maxRequested = departmentSummary.length > 0 
    ? Math.max(...departmentSummary.map(d => d.totalRequested)) 
    : 100000;

  return (
    <div className="page-container">
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">Global Capital Pool</div>
          <div className="metric-value">{capitalPool.totalPool.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          <div className="metric-footer">Total authorized capital limit</div>
        </div>
        <div className="metric-card amber">
          <div className="metric-header">Allocated Capital</div>
          <div className="metric-value">{(capitalPool?.allocated ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          <div className="metric-footer">Committed to approved projects</div>
        </div>
        <div className="metric-card emerald">
          <div className="metric-header">Remaining Capital Pool</div>
          <div className="metric-value">{(capitalPool?.remaining ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          <div className="metric-footer">Free unallocated capital balance</div>
        </div>
        <div className="metric-card cyan">
          <div className="metric-header">Disbursed Funds</div>
          <div className="metric-value">{(capitalPool?.disbursed ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          <div className="metric-footer">Actual drawdown expenses executed</div>
        </div>
      </div>

      <div className="dashboard-columns">
        {/* Department spending SVG bar chart */}
        <div className="table-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Requested Capital by Corporate Department</h3>
          
          {departmentSummary.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No department data available.</p>
          ) : (
            <div style={{ padding: '0 1rem' }}>
              <svg viewBox="0 0 500 220" style={{ width: '100%', height: 'auto', background: 'transparent' }}>
                {departmentSummary.map((dept, index) => {
                  const barHeight = maxRequested > 0 ? (dept.totalRequested / maxRequested) * 150 : 0;
                  const x = 50 + index * 90;
                  const y = 170 - barHeight;

                  return (
                    <g key={dept.department}>
                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width="45"
                        height={barHeight}
                        rx="4"
                        fill="url(#barGradient)"
                        className="chart-bar"
                        style={{ transition: 'all 0.5s ease-out' }}
                      />
                      {/* Value Text */}
                      <text
                        x={x + 22.5}
                        y={y - 8}
                        textAnchor="middle"
                        fill="var(--text-primary)"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="var(--font-mono)"
                      >
                        {dept.totalRequested >= 1000000 
                          ? `$${(dept.totalRequested / 1000000).toFixed(1)}M` 
                          : `$${(dept.totalRequested / 1000).toFixed(0)}k`}
                      </text>
                      {/* Label */}
                      <text
                        x={x + 22.5}
                        y="190"
                        textAnchor="middle"
                        fill="var(--text-secondary)"
                        fontSize="10"
                        fontWeight="500"
                      >
                        {dept.department}
                      </text>
                    </g>
                  );
                })}
                {/* Baseline */}
                <line x1="30" y1="172" x2="470" y2="172" stroke="var(--border-hover)" strokeWidth="1" />

                {/* Gradients */}
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="100%" stopColor="var(--accent-primary)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>

        {/* Recent Capital Transactions */}
        <div className="table-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent Capital Activities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '360px', overflowY: 'auto' }}>
            {recentTransactions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No transaction history.</p>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: tx.type === 'Allocation' ? 'var(--accent-secondary)' : 'var(--accent-cyan)' }}>
                      {tx.type.toUpperCase()}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      {tx.description}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', display: 'block' }}>
                      {tx.type === 'Allocation' ? '+' : '-'}{Number(tx.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
