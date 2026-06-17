import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { subscribeToDashboardUpdates } from '../services/signalr';

export default function InvestorDashboard({ setCurrentTab, setDiscussionId }) {
  const [approvedProposals, setApprovedProposals] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedInvestedProposal, setSelectedInvestedProposal] = useState(null);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investNotes, setInvestNotes] = useState('');
  const [investError, setInvestError] = useState('');
  const [investing, setInvesting] = useState(false);

  const fmt = (val) => {
    if (val == null) return '$0';
    return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const fetchData = async () => {
    try {
      const [props, port, sum] = await Promise.all([
        api.get('/investor/approved-proposals'),
        api.get('/investor/portfolio'),
        api.get('/investor/portfolio/summary')
      ]);
      setApprovedProposals(Array.isArray(props) ? props : []);
      
      let aggregatedPortfolio = [];
      if (Array.isArray(port)) {
        const portMap = new Map();
        for (const inv of port) {
          const pid = inv.proposalId || inv.ProposalId;
          if (!portMap.has(pid)) {
            portMap.set(pid, { ...inv });
          } else {
            const existing = portMap.get(pid);
            existing.committedAmount = (existing.committedAmount || 0) + (inv.committedAmount || inv.CommittedAmount || 0);
            if (new Date(inv.investedAt) > new Date(existing.investedAt)) {
              existing.investedAt = inv.investedAt;
            }
          }
        }
        aggregatedPortfolio = Array.from(portMap.values());
      }
      
      setPortfolio(aggregatedPortfolio);
      setSummary(sum);
    } catch (err) {
      console.error('Error fetching investor data', err);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToDashboardUpdates(() => fetchData());
    return () => unsubscribe();
  }, []);

  const handleInvest = async (e) => {
    e.preventDefault();
    setInvestError('');

    if (!investAmount || parseFloat(investAmount) <= 0) {
      setInvestError('Enter a valid investment amount.');
      return;
    }

    setInvesting(true);
    try {
      await api.post('/investor/invest', {
        proposalId: selectedProposal.id,
        amount: parseFloat(investAmount),
        notes: investNotes
      });
      setShowInvestModal(false);
      setInvestAmount('');
      setInvestNotes('');
      setSelectedProposal(null);
      fetchData();
    } catch (err) {
      setInvestError(err.message || 'Investment failed.');
    } finally {
      setInvesting(false);
    }
  };

  const handleDownloadDoc = (filePath) => {
    if (!filePath) {
      alert('No document attached to this proposal.');
      return;
    }
    const baseUrl = window.location.port !== '5031' && window.location.port !== '' ? `http://${window.location.hostname}:5031/api` : '/api';
    window.open(`${baseUrl}/files/download?filePath=${encodeURIComponent(filePath)}`, '_blank');
  };

  const handleDownloadReport = () => {
    const reportText = `INVESTOR PORTFOLIO SUMMARY REPORT
Generated At: ${new Date().toLocaleString()}
--------------------------------------------------
Total Capital Committed: ${fmt(summary?.totalCommitted)}
Total Capital Disbursed: ${fmt(summary?.totalDisbursed)}
Active Investments: ${summary?.activeInvestments || 0}
Total Portfolio Companies: ${portfolio.length}

PORTFOLIO BREAKDOWN:
${portfolio.map(inv => `- ${inv.proposalTitle} (${inv.proposalDepartment}): Committed ${fmt(inv.committedAmount)}, Disbursed ${fmt(inv.totalDisbursed)} (${inv.disbursementPercent}%)`).join('\n')}
--------------------------------------------------
InnovAura Proposal Governance & Investment Platform
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `Portfolio_Summary_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const existingInvestmentAmount = selectedProposal 
    ? portfolio.filter(inv => inv.proposalId === selectedProposal.id || inv.ProposalId === selectedProposal.id).reduce((sum, inv) => sum + (inv.committedAmount || inv.CommittedAmount || 0), 0)
    : 0;

  const calculateEquity = () => {
    if (!selectedProposal || !selectedProposal.equityOffered || !selectedProposal.approvedAmount) return 0;
    const additionalInvest = parseFloat(investAmount || 0);
    const totalInvest = existingInvestmentAmount + additionalInvest;
    return ((totalInvest / selectedProposal.approvedAmount) * selectedProposal.equityOffered).toFixed(2);
  };

  return (
    <div className="page-container">
      {/* Top Header with Report Download */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, fontFamily: 'var(--font-mono)' }}>
            💼 INVESTOR PORTFOLIO DASHBOARD
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Monitor your committed capital, portfolio startups, documents, and founder activities.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleDownloadReport}
          style={{ margin: 0, fontWeight: '600', fontSize: '0.85rem' }}
        >
          📄 Download Portfolio Report
        </button>
      </div>

      {/* Portfolio Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Total Committed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'rgba(165,180,252,0.95)' }}>{fmt(summary?.totalCommitted)}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Total Disbursed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>{fmt(summary?.totalDisbursed)}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))', border: '1px solid rgba(251,191,36,0.2)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Active Investments</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'rgba(251,191,36,0.9)' }}>{summary?.activeInvestments ?? 0}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(236,72,153,0.04))', border: '1px solid rgba(236,72,153,0.2)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>Total Portfolio</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'rgba(236,72,153,0.9)' }}>{portfolio.length}</div>
        </div>
      </div>

      <div className="dashboard-columns">
        {/* Left: Approved Proposals Open for Investment */}
        <div>
          <div className="table-card">
            <div className="card-header">
              <h3>📊 Available Investment Opportunities</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {approvedProposals.filter(p => !p.isFullyFunded).length} open
              </span>
            </div>
            {approvedProposals.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No approved proposals available for investment yet.
              </p>
            ) : (
              <table className="governance-table">
                <thead>
                  <tr>
                    <th>Startup / Proposal</th>
                    <th>Equity</th>
                    <th>Approved</th>
                    <th>Funded</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedProposals.map((prop) => {
                    const pct = prop.approvedAmount > 0 ? Math.round((prop.totalInvested / prop.approvedAmount) * 100) : 0;
                    return (
                      <tr key={prop.id} onClick={() => {
                        const existingInv = portfolio.find(inv => inv.proposalId === prop.id || inv.ProposalId === prop.id);
                        if (existingInv) setSelectedInvestedProposal(existingInv);
                      }} style={{ cursor: portfolio.some(inv => inv.proposalId === prop.id || inv.ProposalId === prop.id) ? 'pointer' : 'default', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => { if (portfolio.some(inv => inv.proposalId === prop.id || inv.ProposalId === prop.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td>
                          <div style={{ fontWeight: '500' }}>{prop.title}</div>
                          {prop.startupName && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '0.1rem 0.45rem', marginTop: '0.2rem' }}>
                              <span style={{ fontSize: '0.65rem', color: 'rgba(165,180,252,0.85)', fontWeight: '600' }}>🚀 {prop.startupName}</span>
                            </div>
                          )}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{prop.department} · {prop.submitterName}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'rgba(165,180,252,0.85)' }}>
                          {prop.equityOffered != null ? `${prop.equityOffered}%` : '—'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{fmt(prop.approvedAmount)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                              <div style={{
                                width: `${Math.min(pct, 100)}%`,
                                height: '100%',
                                background: pct >= 100
                                  ? 'var(--accent-secondary)'
                                  : 'linear-gradient(90deg, rgba(99,102,241,0.8), rgba(165,180,252,0.8))',
                                borderRadius: '3px',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: pct >= 100 ? 'var(--accent-secondary)' : 'var(--text-secondary)', minWidth: '35px' }}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td>
                          {prop.isFullyFunded ? (
                            <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>Fully Funded</span>
                          ) : (
                            <span className="badge badge-submitted" style={{ fontSize: '0.7rem' }}>Open</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {!prop.isFullyFunded && (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', margin: 0 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProposal(prop);
                                  setInvestAmount('');
                                  setInvestNotes('');
                                  setInvestError('');
                                  setShowInvestModal(true);
                                }}
                              >
                                {portfolio.some(inv => inv.proposalId === prop.id || inv.ProposalId === prop.id) ? '💰 Invest More' : '💰 Invest'}
                              </button>
                            )}
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', margin: 0 }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const room = await api.post('/discussions/start', { proposalId: prop.id });
                                  setDiscussionId(room.id);
                                  setCurrentTab('discussions');
                                } catch (err) {
                                  console.error('Error starting discussion:', err);
                                  alert('Could not open discussion room.');
                                }
                              }}
                            >
                              💬 Chat
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: My Invested Portfolio startups */}
        <div>
          <div className="table-card">
            <div className="card-header">
              <h3>💼 My Invested Portfolio</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {portfolio.length} invested
              </span>
            </div>
            {portfolio.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                You haven't invested in any proposals yet. Browse opportunities on the left or in the Marketplace.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
                {portfolio.map((inv) => (
                  <div key={inv.id} style={{
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                  }} onClick={() => setSelectedInvestedProposal(inv)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <div>
                        {inv.startupName && (
                          <span style={{ fontSize: '0.68rem', color: 'rgba(165,180,252,0.85)', background: 'rgba(99,102,241,0.1)', padding: '0.1rem 0.4rem', borderRadius: '8px', display: 'inline-block', marginBottom: '0.2rem' }}>
                            🚀 {inv.startupName}
                          </span>
                        )}
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-primary)' }}>{inv.proposalTitle}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{inv.proposalDepartment} · Founder: {inv.submitterName || 'Founder'}</span>
                      </div>
                      <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                        Invested ✓
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>My Equity</span>
                        <div style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'rgba(16,185,129,0.95)', marginTop: '0.15rem' }}>
                          {inv.equityOffered != null && inv.approvedAmount > 0 
                            ? `${((inv.committedAmount / inv.approvedAmount) * inv.equityOffered).toFixed(2)}%` 
                            : '—'}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Commitment</span>
                        <div style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'rgba(165,180,252,0.95)', marginTop: '0.15rem' }}>
                          {fmt(inv.committedAmount)}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Disbursed</span>
                        <div style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)', marginTop: '0.15rem' }}>
                          {fmt(inv.totalDisbursed)} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>({inv.disbursementPercent}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: '0.6rem' }}>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${inv.disbursementPercent}%`,
                          height: '100%',
                          background: inv.disbursementPercent >= 100 ? 'var(--accent-secondary)' : 'linear-gradient(90deg, rgba(99,102,241,0.7), rgba(165,180,252,0.7))',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', margin: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const prop = approvedProposals.find(p => p.id === inv.proposalId) || {
                            id: inv.proposalId,
                            title: inv.proposalTitle,
                            approvedAmount: inv.approvedAmount || 0,
                            remainingToFund: (inv.approvedAmount || 0) - (inv.totalAllocated || inv.totalDisbursed || 0),
                            equityOffered: inv.equityOffered,
                            startupName: inv.startupName
                          };
                          setSelectedProposal(prop);
                          setInvestAmount('');
                          setInvestNotes('');
                          setInvestError('');
                          setShowInvestModal(true);
                        }}
                      >
                        💰 Invest More
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>
                          📂 View Details ↗
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                          Invested: {new Date(inv.investedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INVESTED PROPOSAL FULL DOCUMENTS & FOUNDER ACTIVITIES HUB MODAL */}
      {selectedInvestedProposal && (
        <div className="modal-backdrop" style={{ display: 'flex', zIndex: 1100 }} onClick={() => setSelectedInvestedProposal(null)}>
          <div className="modal-content wide" style={{ maxWidth: '850px', background: 'var(--bg-secondary)', animation: 'scaleIn 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-approved" style={{ fontSize: '0.72rem', marginBottom: '0.3rem' }}>Active Portfolio Investment</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedInvestedProposal.proposalTitle}</h3>
              </div>
              <button className="btn-close" onClick={() => setSelectedInvestedProposal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ padding: '1rem', maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Financial & Investment Overview Card */}
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '1rem', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>My Commitment</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'rgba(165,180,252,0.95)', marginTop: '0.15rem' }}>{fmt(selectedInvestedProposal.committedAmount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Approved</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '0.15rem' }}>{fmt(selectedInvestedProposal.approvedAmount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Equity Offered</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)', marginTop: '0.15rem' }}>{selectedInvestedProposal.equityOffered != null ? `${selectedInvestedProposal.equityOffered}%` : '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Disbursed Capital</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)', marginTop: '0.15rem' }}>{fmt(selectedInvestedProposal.totalDisbursed)}</div>
                </div>
              </div>

              {/* Founder Contact & Direct Discussion */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.85rem 1.1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Founder / Submitter</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {selectedInvestedProposal.submitterName || 'Founder'} {selectedInvestedProposal.submitterEmail ? `(${selectedInvestedProposal.submitterEmail})` : ''}
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ margin: 0, padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
                  onClick={async () => {
                    try {
                      const room = await api.post('/discussions/start', { proposalId: selectedInvestedProposal.proposalId });
                      setDiscussionId(room.id);
                      setSelectedInvestedProposal(null);
                      setCurrentTab('discussions');
                    } catch (err) {
                      console.error('Error opening room:', err);
                      alert('Could not open discussion room.');
                    }
                  }}
                >
                  💬 Message Founder Directly
                </button>
              </div>

              {/* Founder Documents Access */}
              <div style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📁 Pitch Deck & Founder Documents
                </h4>
                {selectedInvestedProposal.supportingDocumentPath ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Official Pitch Deck & Specifications Document</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Full access granted to verified investor</div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDownloadDoc(selectedInvestedProposal.supportingDocumentPath)}
                      style={{ margin: 0, fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
                    >
                      📥 Download Document
                    </button>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>No additional supporting document uploaded by founder.</p>
                )}
              </div>

              {/* Founder Details & Business Model */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {selectedInvestedProposal.problemStatement && (
                  <div className="ai-analysis-block" style={{ margin: 0 }}>
                    <h4>🎯 Problem Statement</h4>
                    <p style={{ fontSize: '0.82rem' }}>{selectedInvestedProposal.problemStatement}</p>
                  </div>
                )}
                {selectedInvestedProposal.proposedStatement && (
                  <div className="ai-analysis-block" style={{ margin: 0 }}>
                    <h4>💡 Proposed Solution</h4>
                    <p style={{ fontSize: '0.82rem' }}>{selectedInvestedProposal.proposedStatement}</p>
                  </div>
                )}
              </div>

              {selectedInvestedProposal.businessModel && (
                <div className="ai-analysis-block" style={{ margin: 0 }}>
                  <h4>💼 Business Model</h4>
                  <p style={{ fontSize: '0.82rem' }}>{selectedInvestedProposal.businessModel}</p>
                </div>
              )}

              {selectedInvestedProposal.teamDetails && (
                <div className="ai-analysis-block" style={{ margin: 0 }}>
                  <h4>👥 Team Details</h4>
                  <p style={{ fontSize: '0.82rem' }}>{selectedInvestedProposal.teamDetails}</p>
                </div>
              )}

              {selectedInvestedProposal.demoVideoUrl && (
                <div className="ai-analysis-block" style={{ margin: 0 }}>
                  <h4>🎬 Demo / Pitch Video</h4>
                  <a href={selectedInvestedProposal.demoVideoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
                    Watch Demo Video ↗
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInvestedProposal(null)} style={{ margin: 0 }}>Close Hub</button>
            </div>
          </div>
        </div>
      )}

      {/* INVEST MODAL */}
      {showInvestModal && selectedProposal && (
        <div className="modal-backdrop" style={{ display: 'flex', zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '500px', animation: 'scaleIn 0.2s ease-out' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💰 Commit Investment
              </h3>
              <button className="btn-close" onClick={() => setShowInvestModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              {/* Proposal Info */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                {selectedProposal.startupName && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '0.15rem 0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(165,180,252,0.85)', fontWeight: '600' }}>🚀 {selectedProposal.startupName}</span>
                  </div>
                )}
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem' }}>{selectedProposal.title}</h4>
                {selectedProposal.description && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.6rem 0', lineHeight: '1.5' }}>{selectedProposal.description}</p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Approved</span>
                    <div style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '0.1rem' }}>{fmt(selectedProposal.approvedAmount)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Remaining</span>
                    <div style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'rgba(251,191,36,0.9)', marginTop: '0.1rem' }}>{fmt(selectedProposal.remainingToFund)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Equity</span>
                    <div style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'rgba(165,180,252,0.9)', marginTop: '0.1rem' }}>
                      {selectedProposal.equityOffered != null ? `${calculateEquity()}% (of ${selectedProposal.equityOffered}%)` : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {investError && (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-rejected)', padding: '0.6rem', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                  {investError}
                </div>
              )}

              <form onSubmit={handleInvest}>
                <div className="form-group">
                  <label>Investment Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder={`Max: ${selectedProposal.remainingToFund?.toLocaleString()}`}
                    max={selectedProposal.remainingToFund}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                {/* Quick buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.3rem', fontSize: '0.72rem', margin: 0 }}
                      onClick={() => setInvestAmount((selectedProposal.remainingToFund * pct / 100).toFixed(2))}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label>Investment Notes <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>(Optional)</span></label>
                  <textarea
                    className="form-textarea"
                    value={investNotes}
                    onChange={(e) => setInvestNotes(e.target.value)}
                    placeholder="e.g. Interested in the AI component of this project..."
                    rows={2}
                    style={{ minHeight: '60px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowInvestModal(false)} style={{ margin: 0 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={investing} style={{ margin: 0 }}>
                    {investing ? 'Processing...' : `Commit ${investAmount ? fmt(parseFloat(investAmount)) : ''}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
