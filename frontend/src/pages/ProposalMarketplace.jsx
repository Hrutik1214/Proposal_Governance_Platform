import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { subscribeToDashboardUpdates } from '../services/signalr';

export default function ProposalMarketplace({ user, setCurrentTab, setDiscussionId }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal state
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Proposal Comparison state
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Investment Modal state
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investNotes, setInvestNotes] = useState('');
  const [investError, setInvestError] = useState('');
  const [investing, setInvesting] = useState(false);

  // NDA Modal state
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [signingNda, setSigningNda] = useState(false);
  const [pendingDocPath, setPendingDocPath] = useState(null);

  const [investedProposalIds, setInvestedProposalIds] = useState(new Set());

  const fetchProposals = async () => {
    try {
      const data = await api.get('/marketplace');
      let allProposals = Array.isArray(data) ? data : [];

      if (user?.role === 'Investor') {
        try {
          const portfolio = await api.get('/investor/portfolio');
          if (Array.isArray(portfolio)) {
            const ids = new Set(portfolio.map(inv => inv.proposalId || inv.ProposalId));
            setInvestedProposalIds(ids);
            allProposals = allProposals.filter(p => !ids.has(p.id));
          }
        } catch { /* ignored */ }
      }

      setProposals(allProposals);

      if (selectedProposal) {
        const updatedDetail = await api.get(`/marketplace/${selectedProposal.id}`).catch(() => null);
        if (updatedDetail) setSelectedProposal(updatedDetail);
      }
    } catch (err) {
      console.error('Error fetching marketplace proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
    const unsubscribe = subscribeToDashboardUpdates(() => {
      fetchProposals();
    });
    return () => unsubscribe();
  }, []);

  const toggleCompare = (e, prop) => {
    e.stopPropagation();
    setSelectedForCompare(prev => {
      const exists = prev.some(p => p.id === prop.id);
      if (exists) {
        return prev.filter(p => p.id !== prop.id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 proposals side-by-side.');
          return prev;
        }
        return [...prev, prop];
      }
    });
  };

  const handleLike = async (proposalId) => {
    try {
      const result = await api.post(`/social/proposals/${proposalId}/like`);
      setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          return { ...p, hasLiked: result.liked, likeCount: result.likeCount };
        }
        return p;
      }));
      if (selectedProposal && selectedProposal.id === proposalId) {
        setSelectedProposal(prev => ({
          ...prev,
          hasLiked: result.liked,
          likeCount: result.likeCount
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleInterest = async (proposalId) => {
    if (user.role !== 'Investor') return;
    try {
      const result = await api.post(`/marketplace/${proposalId}/interest`);
      setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          return { ...p, hasInterested: result.interested, interestCount: result.interestCount };
        }
        return p;
      }));
      if (selectedProposal && selectedProposal.id === proposalId) {
        setSelectedProposal(prev => ({
          ...prev,
          hasInterested: result.interested,
          interestCount: result.interestCount
        }));
      }
    } catch (err) {
      console.error('Error toggling interest:', err);
    }
  };

  const handleOpenDiscussion = async (proposalId) => {
    if (user.role !== 'Investor') return;
    try {
      const room = await api.post('/discussions/start', { proposalId });
      setDiscussionId(room.id);
      setCurrentTab('discussions');
    } catch (err) {
      console.error('Error starting discussion:', err);
      alert('Could not open discussion room. Please try again.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackContent.trim() || !selectedProposal) return;

    setSubmittingFeedback(true);
    try {
      const newComment = await api.post(`/marketplace/${selectedProposal.id}/feedback`, {
        content: feedbackContent
      });
      setSelectedProposal(prev => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1,
        comments: [...(prev.comments || []), newComment]
      }));
      setFeedbackContent('');
      fetchProposals();
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleInvestSubmit = async (e) => {
    e.preventDefault();
    setInvestError('');

    if (!investAmount || parseFloat(investAmount) <= 0) {
      setInvestError('Please enter a valid investment amount.');
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
      alert('🎉 Investment commitment submitted successfully!');
      fetchProposals();
    } catch (err) {
      setInvestError(err.message || 'Investment failed.');
    } finally {
      setInvesting(false);
    }
  };

  const handleDownloadDoc = async (filePath) => {
    if (!filePath) {
      alert('No pitch deck document attached to this proposal.');
      return;
    }

    if (user.role === 'Investor' && !ndaAccepted) {
      setPendingDocPath(filePath);
      setShowNdaModal(true);
      return;
    }

    try {
      // Log download with watermark text
      await api.post(`/proposalaccess/log-download/${selectedProposal.id}`, {
        documentType: 'PitchDeck',
        documentName: filePath.split('/').pop() || 'document.pdf'
      }).catch(() => null);

      api.downloadFile(filePath);
    } catch (err) {
      console.error(err);
      api.downloadFile(filePath);
    }
  };

  const handleConfirmNdaSign = async () => {
    setSigningNda(true);
    try {
      await api.post(`/proposalaccess/nda/accept/${selectedProposal.id}`).catch(() => null);
      setNdaAccepted(true);
      setShowNdaModal(false);
      if (pendingDocPath) {
        handleDownloadDoc(pendingDocPath);
        setPendingDocPath(null);
      }
    } catch (err) {
      console.error(err);
      setNdaAccepted(true);
      setShowNdaModal(false);
      if (pendingDocPath) {
        api.downloadFile(pendingDocPath);
        setPendingDocPath(null);
      }
    } finally {
      setSigningNda(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?\S*v=|&v=)([^#&?]*).*/;
    let match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const fmtCurrency = (val) => {
    return (val ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft': return <span className="badge badge-draft">Draft</span>;
      case 'Submitted': return <span className="badge badge-submitted">Submitted</span>;
      case 'UnderReview': return <span className="badge badge-underreview">Under Review</span>;
      case 'Reviewed': return <span className="badge badge-reviewed">Reviewed</span>;
      case 'Approved': return <span className="badge badge-approved">Approved</span>;
      case 'Rejected': return <span className="badge badge-rejected">Rejected</span>;
      case 'FundAllocated': return <span className="badge badge-fundallocated">Fund Allocated</span>;
      default: return null;
    }
  };

  const handleOpenDetails = async (proposal) => {
    setSelectedProposal(proposal);
    setNdaAccepted(false);
    try {
      const details = await api.get(`/marketplace/${proposal.id}`);
      setSelectedProposal(details);
    } catch (err) {
      console.error('Error loading details:', err);
    }
  };

  return (
    <div className="page-container" style={{ padding: '1.5rem', maxWidth: '1400px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, fontFamily: 'var(--font-mono)' }}>
            🏪 PROPOSAL MARKETPLACE
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Explore governance-approved startup proposals, compare metrics, and commit capital.
          </p>
        </div>

        {selectedForCompare.length >= 2 && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCompareModal(true)}
            style={{ fontWeight: '700', margin: 0, boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}
          >
            ⚖️ Compare Selected ({selectedForCompare.length})
          </button>
        )}
      </div>

      {/* Grid of Proposal Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading proposals...
        </div>
      ) : proposals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          color: 'var(--text-muted)'
        }}>
          <h3>No proposals match your filters.</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Try broadening your search criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: '1.5rem'
        }}>
          {proposals.map(prop => {
            const isCompared = selectedForCompare.some(p => p.id === prop.id);
            return (
              <div
                key={prop.id}
                onClick={() => handleOpenDetails(prop)}
                style={{
                  background: 'var(--bg-card)',
                  border: isCompared ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar: Startup name, Compare checkbox, Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-cyan)' }}>
                      🚀 {prop.startupName || 'Startup'}
                    </span>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        className={`btn ${isCompared ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', margin: 0 }}
                        onClick={(e) => toggleCompare(e, prop)}
                        title="Add to comparison matrix"
                      >
                        {isCompared ? '✓ Comparing' : '+ Compare'}
                      </button>
                      {getStatusBadge(prop.status)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {prop.title}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {prop.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {prop.industry && (
                      <span style={{ fontSize: '0.62rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'rgba(165, 180, 252, 0.95)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        {prop.industry}
                      </span>
                    )}
                    {prop.category && (
                      <span style={{ fontSize: '0.62rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                        {prop.category}
                      </span>
                    )}
                    <span style={{ fontSize: '0.62rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)' }}>
                      {prop.department}
                    </span>
                  </div>
                </div>

                {/* Financial metrics & Engagement */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Funding Ask</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        {fmtCurrency(prop.requestedAmount)}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Equity Offer</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>
                        {prop.equityOffered}%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>By {prop.submitter?.fullName || 'Founder'}</span>
                    
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>🔥 {prop.interestCount || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>❤️ {prop.likeCount || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>💬 {prop.commentCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Compare Action Bar */}
      {selectedForCompare.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-primary)',
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 100
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            Comparing {selectedForCompare.length} proposal{selectedForCompare.length > 1 ? 's' : ''}
          </span>
          <button
            className="btn btn-primary"
            disabled={selectedForCompare.length < 2}
            onClick={() => setShowCompareModal(true)}
            style={{ margin: 0, fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
          >
            Open Side-by-Side Matrix ↗
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setSelectedForCompare([])}
            style={{ margin: 0, fontSize: '0.82rem', padding: '0.4rem 0.65rem' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* SIDE-BY-SIDE PROPOSAL COMPARISON MODAL */}
      {showCompareModal && (
        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="modal-content wide" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-secondary)', maxWidth: '1100px' }}>
            <div className="modal-header">
              <h3>⚖️ Side-by-Side Proposal Comparison</h3>
              <button className="modal-close" onClick={() => setShowCompareModal(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ overflowX: 'auto' }}>
              <table className="governance-table" style={{ width: '100%', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Metric</th>
                    {selectedForCompare.map(p => (
                      <th key={p.id} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{p.startupName || p.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{p.department}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Proposal Title</strong></td>
                    {selectedForCompare.map(p => <td key={p.id} style={{ textAlign: 'center', fontSize: '0.85rem' }}>{p.title}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Funding Ask</strong></td>
                    {selectedForCompare.map(p => (
                      <td key={p.id} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                        {fmtCurrency(p.requestedAmount)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Equity Offered</strong></td>
                    {selectedForCompare.map(p => (
                      <td key={p.id} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)', fontWeight: '700' }}>
                        {p.equityOffered}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Implied Valuation</strong></td>
                    {selectedForCompare.map(p => {
                      const val = (p.equityOffered && p.equityOffered > 0) ? (p.requestedAmount / (p.equityOffered / 100)) : 0;
                      return (
                        <td key={p.id} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                          {val > 0 ? fmtCurrency(val) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td><strong>Founder Name</strong></td>
                    {selectedForCompare.map(p => <td key={p.id} style={{ textAlign: 'center', fontSize: '0.82rem' }}>{p.submitter?.fullName || 'Founder'}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    {selectedForCompare.map(p => <td key={p.id} style={{ textAlign: 'center' }}>{getStatusBadge(p.status)}</td>)}
                  </tr>
                  <tr>
                    <td><strong>Action</strong></td>
                    {selectedForCompare.map(p => (
                      <td key={p.id} style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', margin: '0 auto' }}
                          onClick={() => {
                            setShowCompareModal(false);
                            handleOpenDetails(p);
                          }}
                        >
                          View Details ↗
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCompareModal(false)}>Close Matrix</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedProposal && (
        <div className="modal-overlay" onClick={() => setSelectedProposal(null)}>
          <div className="modal-content wide" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-hover)' }}>
            
            <div className="modal-header">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', background: 'rgba(99,102,241,0.15)', color: 'rgba(165,180,252,0.95)', border: '1px solid rgba(99,102,241,0.3)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                  🚀 {selectedProposal.startupName || 'Startup'}
                </span>
                {getStatusBadge(selectedProposal.status)}
              </div>
              <button className="modal-close" onClick={() => setSelectedProposal(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', maxHeight: '78vh' }}>
              
              {/* Left Column: Profile */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{selectedProposal.title}</h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedProposal.description}</p>
                </div>

                {selectedProposal.supportingDocumentPath && (
                  <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', padding: '0.85rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)' }}>📄 Pitch Deck & Specifications</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Official startup documentation</div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDownloadDoc(selectedProposal.supportingDocumentPath)}
                      style={{ margin: 0, fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                    >
                      📥 Download Pitch Deck
                    </button>
                  </div>
                )}

                <div className="ai-analysis-block" style={{ margin: 0 }}>
                  <h4>🎯 Problem Statement</h4>
                  <p style={{ fontSize: '0.85rem' }}>{selectedProposal.problemStatement}</p>
                </div>

                <div className="ai-analysis-block" style={{ margin: 0 }}>
                  <h4>💡 Proposed Solution</h4>
                  <p style={{ fontSize: '0.85rem' }}>{selectedProposal.proposedStatement}</p>
                </div>

                {selectedProposal.businessModel && (
                  <div className="ai-analysis-block" style={{ margin: 0 }}>
                    <h4>💼 Business Model</h4>
                    <p style={{ fontSize: '0.85rem' }}>{selectedProposal.businessModel}</p>
                  </div>
                )}

                <div className="ai-analysis-block" style={{ margin: 0 }}>
                  <h4>👥 Founders & Team</h4>
                  <p style={{ fontSize: '0.85rem' }}>{selectedProposal.teamDetails}</p>
                </div>

                {selectedProposal.demoVideoUrl && (
                  <div className="ai-analysis-block" style={{ margin: 0 }}>
                    <h4>🎬 Pitch / Demo Video</h4>
                    {getEmbedUrl(selectedProposal.demoVideoUrl) ? (
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <iframe
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                          src={getEmbedUrl(selectedProposal.demoVideoUrl)}
                          title="Pitch Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a href={selectedProposal.demoVideoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontSize: '0.85rem' }}>
                        Watch Demo Video ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Financials & Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1rem'
                }}>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                    Financial Offering
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>FUNDING ASK</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        {fmtCurrency(selectedProposal.requestedAmount)}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>EQUITY OFFER</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>
                        {selectedProposal.equityOffered}%
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem' }}>
                    <strong>Founder:</strong> {selectedProposal.submitter?.fullName} ({selectedProposal.submitter?.email})
                  </div>
                </div>

                {/* Action Controls for Investors */}
                {user.role === 'Investor' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(selectedProposal.status?.toLowerCase() === 'approved' || selectedProposal.status?.toLowerCase() === 'fundallocated') ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setInvestAmount('');
                          setInvestNotes('');
                          setInvestError('');
                          setShowInvestModal(true);
                        }}
                        style={{ margin: 0, fontSize: '0.92rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', fontWeight: '700' }}
                      >
                        💰 Commit Capital / Invest
                      </button>
                    ) : (
                      <div style={{ padding: '0.65rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '6px', color: '#eab308', fontSize: '0.8rem', textAlign: 'center', fontWeight: '600' }}>
                        🔒 Investments Locked (Status: {selectedProposal.status || 'Under Review'})
                      </div>
                    )}

                    <button
                      className="btn"
                      onClick={() => handleInterest(selectedProposal.id)}
                      style={{
                        margin: 0,
                        background: selectedProposal.hasInterested ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        color: selectedProposal.hasInterested ? '#fff' : '#fbbf24',
                        fontWeight: '600',
                        fontSize: '0.88rem'
                      }}
                    >
                      🔥 {selectedProposal.hasInterested ? 'Expressed Interest' : 'Express Interest'}
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => handleOpenDiscussion(selectedProposal.id)}
                      style={{ margin: 0, fontSize: '0.88rem' }}
                    >
                      💬 Open Private Discussion Room
                    </button>
                  </div>
                )}

                {/* Community Interaction Status */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    className="btn"
                    onClick={() => handleLike(selectedProposal.id)}
                    style={{
                      flex: 1,
                      margin: 0,
                      padding: '0.4rem',
                      background: selectedProposal.hasLiked ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      color: selectedProposal.hasLiked ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontSize: '0.78rem'
                    }}
                  >
                    👍 {selectedProposal.hasLiked ? 'Liked' : 'Like'} ({selectedProposal.likeCount || 0})
                  </button>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    🔥 {selectedProposal.interestCount || 0} Interested
                  </div>
                </div>

                {/* Feedback Comments Section */}
                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: '220px'
                }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    Community Rating & Feedback ({selectedProposal.comments?.length || 0})
                  </h4>

                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    maxHeight: '180px',
                    paddingRight: '0.25rem',
                    marginBottom: '0.75rem'
                  }}>
                    {(!selectedProposal.comments || selectedProposal.comments.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        No feedback posted yet.
                      </div>
                    ) : (
                      selectedProposal.comments.map(c => (
                        <div key={c.id} style={{
                          background: 'rgba(255,255,255,0.015)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: '6px',
                          padding: '0.5rem 0.75rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                            <span><strong>{c.userName}</strong> ({c.userRole})</span>
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Share constructive feedback..."
                      value={feedbackContent}
                      onChange={e => setFeedbackContent(e.target.value)}
                      style={{ margin: 0, padding: '0.45rem', fontSize: '0.78rem', borderRadius: '6px', flex: 1 }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submittingFeedback || !feedbackContent.trim()}
                      style={{ margin: 0, padding: '0.45rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px' }}
                    >
                      Submit
                    </button>
                  </form>

                </div>

              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedProposal(null)}>Close Details</button>
            </div>

          </div>
        </div>
      )}

      {/* DIRECT INVEST MODAL */}
      {showInvestModal && selectedProposal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowInvestModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>💰 Commit Capital Investment</h3>
              <button className="modal-close" onClick={() => setShowInvestModal(false)}>✕</button>
            </div>

            <form onSubmit={handleInvestSubmit} style={{ padding: '1rem 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedProposal.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Startup Ask: {fmtCurrency(selectedProposal.requestedAmount)} · Equity: {selectedProposal.equityOffered}%
                </div>
              </div>

              {investError && (
                <div style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-rejected)', padding: '0.6rem', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                  {investError}
                </div>
              )}

              <div className="form-group">
                <label>Investment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={investAmount}
                  onChange={e => setInvestAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes / Investment Intent (Optional)</label>
                <textarea
                  className="form-textarea"
                  value={investNotes}
                  onChange={e => setInvestNotes(e.target.value)}
                  placeholder="e.g. Strategic investor interested in scaling engineering operations..."
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvestModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={investing}>
                  {investing ? 'Submitting...' : 'Confirm Capital Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NDA SIGNING MODAL */}
      {showNdaModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setShowNdaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>🔒 Non-Disclosure Agreement (NDA) Required</h3>
              <button className="modal-close" onClick={() => setShowNdaModal(false)}>✕</button>
            </div>

            <div style={{ padding: '1rem 0' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                By proceeding to download confidential pitch deck files and proprietary financial records for <strong>{selectedProposal?.startupName || selectedProposal?.title}</strong>, you agree to the following legal terms:
              </p>

              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', height: '120px', overflowY: 'auto', margin: '1rem 0' }}>
                1. <strong>Confidentiality:</strong> You agree not to disclose, publish, or distribute any proprietary business model, financial projections, or patent information to unauthorized third parties.<br/><br/>
                2. <strong>Watermarking:</strong> Downloaded documents will be dynamically embedded with a digital watermark containing your full legal name, email address, IP address, and timestamp.<br/><br/>
                3. <strong>Use Restriction:</strong> All information is provided solely for investment evaluation purposes under InnovAura Governance Platform terms of service.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowNdaModal(false)}>Decline</button>
                <button className="btn btn-primary" disabled={signingNda} onClick={handleConfirmNdaSign}>
                  {signingNda ? 'Signing...' : 'I Agree & Sign NDA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
