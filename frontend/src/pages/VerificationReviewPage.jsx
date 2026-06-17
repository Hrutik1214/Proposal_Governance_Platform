import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';

function StatusBadge({ status }) {
  const map = {
    Pending: { color: '#f59e0b', icon: '⏳', label: 'Pending' },
    UnderReview: { color: '#3b82f6', icon: '🔍', label: 'Under Review' },
    NeedsMoreDocuments: { color: '#d97706', icon: '📄', label: 'Awaiting Docs' },
    Verified: { color: '#10b981', icon: '✓', label: 'Approved' },
    Approved: { color: '#10b981', icon: '✓', label: 'Approved' },
    Rejected: { color: '#ef4444', icon: '✗', label: 'Rejected' },
  };
  const { color, icon, label } = map[status] || { color: '#94a3b8', icon: '—', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      fontSize: '0.75rem', fontWeight: 700, color,
      background: `${color}18`, border: `1px solid ${color}40`,
      borderRadius: 20, padding: '0.2rem 0.65rem', whiteSpace: 'nowrap'
    }}>
      {icon} {label}
    </span>
  );
}

function DetailRow({ label, value, link, verifyUrl, verifyLabel, isMasked, onToggleMask }) {
  if (!value) return null;
  const displayVal = isMasked ? '••••••••' : value;

  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', minWidth: 170, flexShrink: 0, fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 600, wordBreak: 'break-all' }}>
            {value.length > 45 ? `${value.slice(0, 45)}…` : value} ↗
          </a>
        ) : (
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: isMasked ? 'monospace' : 'inherit' }}>
            {displayVal}
          </span>
        )}

        {onToggleMask && (
          <button
            onClick={onToggleMask}
            style={{
              background: 'none', border: 'none', color: 'var(--accent-primary)',
              cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: 0
            }}
          >
            {isMasked ? 'Show' : 'Hide'}
          </button>
        )}

        {verifyUrl && (
          <a href={verifyUrl} target="_blank" rel="noopener noreferrer" style={{
            fontSize: '0.72rem', color: 'var(--color-approved)', background: 'var(--color-approved-bg)',
            border: '1px solid rgba(5,150,105,0.3)', borderRadius: '4px', padding: '0.15rem 0.5rem',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600
          }}>
            🔍 {verifyLabel || 'Verify Registry'} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function VerificationModal({ type, item, reviewers, onClose, onAction, onAssignReviewer }) {
  const [notes, setNotes] = useState(item.notes || '');
  const [selectedReviewerId, setSelectedReviewerId] = useState(item.checkedById || item.verifiedById || '');
  const [submitting, setSubmitting] = useState(false);
  const [showMaskedPan, setShowMaskedPan] = useState(true);
  const [showMaskedAadhaar, setShowMaskedAadhaar] = useState(true);

  const isFounder = type === 'founder';
  const isPatent = type === 'patent';

  const currentStatus = isFounder ? item.status : isPatent ? item.verificationStatus : item.overallStatus;
  const assignedReviewer = item.checkedBy || item.verifiedBy;

  const handleActionClick = async (action) => {
    setSubmitting(true);
    try {
      const targetId = isPatent ? (item.id || item.startupId) : item.id;
      await onAction(type, targetId, action, notes);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignClick = async () => {
    if (!selectedReviewerId) return;
    setSubmitting(true);
    try {
      const targetId = isPatent ? (item.id || item.startupId) : item.id;
      await onAssignReviewer(type, targetId, parseInt(selectedReviewerId), notes);
    } finally {
      setSubmitting(false);
    }
  };

  const maskedPan = item.panNumber ? `${item.panNumber.slice(0, 2)}****${item.panNumber.slice(-2)}` : null;
  const maskedAadhaar = item.aadhaarNumber ? `XXXX XXXX ${item.aadhaarNumber.slice(-4)}` : null;

  return (
    <div className="modal-overlay">
      <div className="modal-content wide">
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              🛡️ {isFounder ? 'Founder Verification Request' : isPatent ? 'Patent Registry Review' : 'Startup Document Verification'}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>ID #{item.id}</span>
              <span>•</span>
              <StatusBadge status={currentStatus} />
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Info Banner */}
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                {isFounder ? 'Founder Name' : 'Startup Name'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                {isFounder ? (item.user?.fullName || item.user?.username || `User #${item.userId}`) : (item.startup?.startupName || item.startup?.title || `Proposal #${item.startupId}`)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {isFounder ? item.user?.email : `Submitter: ${item.startup?.submitter?.fullName || item.startup?.submitter?.email || 'Founder'}`}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Verification Level / Scope
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                {isFounder ? `Level: ${item.verificationLevel}` : isPatent ? `Status: ${item.patentStatus}` : 'Full Corporate Bundle'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Assigned Reviewer: <strong>{assignedReviewer?.fullName || assignedReviewer?.username || 'Unassigned'}</strong>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
              ⏱️ Verification Progress Timeline
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 110, padding: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--color-approved)', fontWeight: 700 }}>1. Submitted</span>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Initial submission</div>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>➔</span>

              <div style={{ flex: 1, minWidth: 110, padding: '0.5rem', background: 'var(--bg-card)', border: `1px solid ${assignedReviewer ? 'var(--accent-primary)' : 'var(--border-color)'}`, borderRadius: 6, fontSize: '0.75rem' }}>
                <span style={{ color: assignedReviewer ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 700 }}>
                  2. Reviewer Assigned
                </span>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{assignedReviewer ? assignedReviewer.fullName : 'Pending Admin'}</div>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>➔</span>

              <div style={{ flex: 1, minWidth: 110, padding: '0.5rem', background: 'var(--bg-card)', border: `1px solid ${currentStatus === 'NeedsMoreDocuments' ? 'var(--color-underreview)' : 'var(--border-color)'}`, borderRadius: 6, fontSize: '0.75rem' }}>
                <span style={{ color: currentStatus === 'NeedsMoreDocuments' ? 'var(--color-underreview)' : 'var(--text-muted)', fontWeight: 700 }}>
                  3. Due Diligence
                </span>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{currentStatus === 'NeedsMoreDocuments' ? 'Docs Requested' : 'Assessing'}</div>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>➔</span>

              <div style={{ flex: 1, minWidth: 110, padding: '0.5rem', background: 'var(--bg-card)', border: `1px solid ${currentStatus === 'Verified' || currentStatus === 'Approved' ? 'var(--color-approved)' : currentStatus === 'Rejected' ? 'var(--color-rejected)' : 'var(--border-color)'}`, borderRadius: 6, fontSize: '0.75rem' }}>
                <span style={{ color: currentStatus === 'Verified' || currentStatus === 'Approved' ? 'var(--color-approved)' : currentStatus === 'Rejected' ? 'var(--color-rejected)' : 'var(--text-muted)', fontWeight: 700 }}>
                  4. Admin Decision
                </span>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{currentStatus}</div>
              </div>
            </div>
          </div>

          {/* Details & Documents */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>📁 Submitted Verification Documents & Identifiers</h4>

            {isFounder ? (
              <>
                <DetailRow label="Verification Tier" value={item.verificationLevel} />
                <DetailRow label="Email Address" value={item.user?.email} />
                <DetailRow label="Founder Contact No." value={item.user?.contactNumber || item.user?.ContactNumber || 'Not specified'} />
                <DetailRow
                  label="PAN Number"
                  value={showMaskedPan ? maskedPan : item.panNumber}
                  isMasked={showMaskedPan}
                  onToggleMask={() => setShowMaskedPan(v => !v)}
                  verifyUrl="https://eportal.incometax.gov.in/iec/foservices/#/pre-login/verifyYourPAN"
                  verifyLabel="Income Tax Registry"
                />
                <DetailRow
                  label="Aadhaar Number"
                  value={showMaskedAadhaar ? maskedAadhaar : item.aadhaarNumber}
                  isMasked={showMaskedAadhaar}
                  onToggleMask={() => setShowMaskedAadhaar(v => !v)}
                  verifyUrl="https://myaadhaar.uidai.gov.in/"
                  verifyLabel="UIDAI Portal"
                />
                <DetailRow label="LinkedIn Profile" value={item.linkedInUrl} link />
                <DetailRow label="GSTIN Number" value={item.gstNumber} verifyUrl="https://services.gst.gov.in/services/searchtp" verifyLabel="GST Portal" />
                <DetailRow label="Company Reg No." value={item.registrationNumber} verifyUrl="https://www.mca.gov.in/mcafoportal/viewCompanyOrLLPDetails.html" verifyLabel="MCA Registry" />
                <DetailRow label="CIN Number" value={item.cinNumber} verifyUrl="https://www.mca.gov.in/mcafoportal/viewCompanyOrLLPDetails.html" verifyLabel="MCA CIN Portal" />
                <DetailRow label="Document Bundle" value={item.documentUrl} link />
                <DetailRow label="Notes from Founder" value={item.notes} />
              </>
            ) : isPatent ? (
              <>
                <DetailRow label="Startup Proposal" value={item.startup?.startupName || item.startup?.title} />
                <DetailRow label="Patent Status" value={item.patentStatus} />
                <DetailRow
                  label="Patent Application No."
                  value={item.patentNumber}
                  verifyUrl={item.patentNumber && item.patentNumber.startsWith('20') ? "https://iprsearch.ipindia.gov.in/publicsearch" : "https://ppubs.uspto.gov/pubwebapp/"}
                  verifyLabel="Patent Registry Search"
                />
                <DetailRow label="Filing Date" value={item.filingDate ? new Date(item.filingDate).toLocaleDateString('en-IN') : null} />
                <DetailRow label="Patent Specification Document" value={item.patentDocumentUrl} link />
              </>
            ) : (
              <>
                <DetailRow label="Startup Name" value={item.startup?.startupName || item.startup?.title} />
                <DetailRow label="Registration Certificate" value={item.registrationCertificateUrl} link />
                <DetailRow label="GST Registration Certificate" value={item.gstDocumentUrl} link />
                <DetailRow label="PAN Card Copy" value={item.panDocumentUrl} link />
                <DetailRow label="Audited Financial Statements" value={item.financialStatementsUrl} link />
                <DetailRow label="Investor Pitch Deck" value={item.pitchDeckUrl} link />
                <DetailRow label="Notes" value={item.notes} />
              </>
            )}
          </div>

          {/* Reviewer Assignment & Recommendation */}
          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>👥 Reviewer Assistance & Delegation</h4>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Assign Reviewer to Request
                </label>
                <select
                  className="form-select"
                  value={selectedReviewerId}
                  onChange={e => setSelectedReviewerId(e.target.value)}
                  style={{ fontSize: '0.825rem' }}
                >
                  <option value="">-- Select Reviewer --</option>
                  {reviewers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.department || 'Reviewer'})
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-secondary"
                style={{ marginTop: '1.1rem' }}
                onClick={handleAssignClick}
                disabled={submitting || !selectedReviewerId}
              >
                Assign / Reassign Reviewer
              </button>
            </div>
          </div>

          {/* Admin Decision Feedback Notes */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Admin Decision Notes &amp; Audit Trail Commentary
            </label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="State technical justification, missing documents, or validation criteria outcome..."
              rows="3"
            />
          </div>
        </div>

        <div className="modal-footer" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>

          <button
            className="btn btn-secondary"
            style={{ color: 'var(--color-underreview)' }}
            onClick={() => handleActionClick('request-docs')}
            disabled={submitting}
          >
            📄 Request Addl. Docs
          </button>

          <button
            className="btn btn-danger"
            onClick={() => handleActionClick('reject')}
            disabled={submitting}
          >
            {submitting ? '...' : '✗ Reject Verification'}
          </button>

          <button
            className="btn btn-success"
            onClick={() => handleActionClick('approve')}
            disabled={submitting}
          >
            {submitting ? '...' : '✓ Approve & Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerificationReviewPage({ user }) {
  const [founders, setFounders] = useState([]);
  const [startups, setStartups] = useState([]);
  const [patents, setPatents] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewType, setReviewType] = useState(null);
  const [activeTab, setActiveTab] = useState('founders');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allData, reviewerData] = await Promise.all([
        api.get('/verification/admin/all'),
        api.get('/verification/admin/reviewers').catch(() => [])
      ]);
      setFounders(allData.founders ?? []);
      setStartups(allData.startups ?? []);
      setPatents(allData.patents ?? []);
      setReviewers(reviewerData ?? []);
    } catch (err) {
      console.error('Failed to load verifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Compute metrics for Dashboard Cards
  const stats = useMemo(() => {
    const allItems = [
      ...founders.map(f => ({ ...f, currentStatus: f.status, date: f.checkedAt })),
      ...startups.map(s => ({ ...s, currentStatus: s.overallStatus, date: s.verifiedAt })),
      ...patents.map(p => ({ ...p, currentStatus: p.verificationStatus, date: p.lastCheckedAt }))
    ];

    const todayStr = new Date().toISOString().split('T')[0];

    const pending = allItems.filter(i => i.currentStatus === 'Pending').length;
    const underReview = allItems.filter(i => i.currentStatus === 'UnderReview').length;
    const awaitingDocs = allItems.filter(i => i.currentStatus === 'NeedsMoreDocuments').length;
    const approvedToday = allItems.filter(i => (i.currentStatus === 'Verified' || i.currentStatus === 'Approved') && i.date && i.date.startsWith(todayStr)).length;
    const rejectedToday = allItems.filter(i => i.currentStatus === 'Rejected' && i.date && i.date.startsWith(todayStr)).length;

    return { pending, underReview, awaitingDocs, approvedToday, rejectedToday };
  }, [founders, startups, patents]);

  const handleAction = async (type, id, action, notes) => {
    let endpoint;
    let payload = { notes };
    if (action === 'request-docs') {
      endpoint = `/verification/admin/request-docs/${type}/${id}`;
    } else if (type === 'founder') {
      endpoint = `/verification/admin/${action}/founder/${id}`;
    } else if (type === 'startup') {
      endpoint = `/verification/admin/${action}/startup/${id}`;
    } else if (type === 'patent') {
      endpoint = `/PatentInfo/verify/${id}`;
      payload = { status: action === 'approve' ? 'Verified' : 'Rejected' };
    }

    try {
      await api.post(endpoint, payload);
      setMessage({ type: 'success', text: `${type.toUpperCase()} verification updated successfully.` });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Action failed.' });
      throw err;
    }
  };

  const handleAssignReviewer = async (type, id, reviewerId, notes) => {
    try {
      await api.post(`/verification/admin/assign-reviewer/${type}/${id}`, { reviewerId, notes });
      setMessage({ type: 'success', text: 'Reviewer assigned successfully.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Assignment failed.' });
    }
  };

  const openReview = (type, item) => { setReviewType(type); setReviewItem(item); };

  // Filtered Items for active tab
  const filteredData = useMemo(() => {
    let raw = activeTab === 'founders' ? founders : activeTab === 'startups' ? startups : patents;

    if (statusFilter !== 'ALL') {
      raw = raw.filter(item => {
        const st = activeTab === 'founders' ? item.status : activeTab === 'startups' ? item.overallStatus : item.verificationStatus;
        return st === statusFilter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      raw = raw.filter(item => {
        const fName = item.user?.fullName || item.user?.username || '';
        const email = item.user?.email || item.startup?.submitter?.email || '';
        const sName = item.startup?.startupName || item.startup?.title || '';
        return fName.toLowerCase().includes(q) || email.toLowerCase().includes(q) || sName.toLowerCase().includes(q);
      });
    }

    return raw;
  }, [activeTab, statusFilter, searchQuery, founders, startups, patents]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>🛡️ Admin Verification Center</h2>
          <p>Central workspace to verify Founder identity credentials, Startup corporate documents, and Patent records.</p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem',
          background: message.type === 'success' ? 'var(--color-approved-bg)' : 'var(--color-rejected-bg)',
          color: message.type === 'success' ? 'var(--color-approved)' : 'var(--color-rejected)',
          border: `1px solid ${message.type === 'success' ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'}`,
          fontSize: '0.85rem', fontWeight: 600
        }}>
          {message.text}
        </div>
      )}

      {/* Verification Dashboard KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card amber">
          <div className="metric-header">Pending Verifications</div>
          <div className="metric-value">{stats.pending}</div>
          <div className="metric-footer">Awaiting initial admin/reviewer check</div>
        </div>
        <div className="metric-card blue">
          <div className="metric-header">Under Review</div>
          <div className="metric-value">{stats.underReview}</div>
          <div className="metric-footer">Assigned to reviewers for due diligence</div>
        </div>
        <div className="metric-card teal">
          <div className="metric-header">Awaiting Documents</div>
          <div className="metric-value">{stats.awaitingDocs}</div>
          <div className="metric-footer">Returned to founder for additional info</div>
        </div>
        <div className="metric-card emerald">
          <div className="metric-header">Approved Today</div>
          <div className="metric-value">{stats.approvedToday}</div>
          <div className="metric-footer">Verified credentials &amp; documents</div>
        </div>
        <div className="metric-card red">
          <div className="metric-header">Rejected Today</div>
          <div className="metric-value">{stats.rejectedToday}</div>
          <div className="metric-footer">Rejected due to criteria non-compliance</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="section-card">
        {/* Tabs & Search Toolbar */}
        <div className="table-toolbar">
          {/* Tab Navigation */}
          <div className="tab-container" style={{ margin: 0, border: 'none' }}>
            <button
              className={`tab-btn ${activeTab === 'founders' ? 'active' : ''}`}
              onClick={() => setActiveTab('founders')}
            >
              👤 Founder Verification ({founders.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'startups' ? 'active' : ''}`}
              onClick={() => setActiveTab('startups')}
            >
              🏢 Startup Documents ({startups.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'patents' ? 'active' : ''}`}
              onClick={() => setActiveTab('patents')}
            >
              📜 Patent Registry ({patents.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="table-search">
            <svg className="table-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search founder, email, or startup..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="table-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="UnderReview">Under Review</option>
            <option value="NeedsMoreDocuments">Awaiting Documents</option>
            <option value="Verified">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="empty-state">
            <p>Loading Verification Center records...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛡️</div>
            <h4>No verification records found</h4>
            <p>No records match your selected tab, filter, or search query.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="governance-table">
              <thead>
                <tr>
                  <th>{activeTab === 'founders' ? 'Founder Name' : 'Startup / Project'}</th>
                  <th>Email / Submitter</th>
                  <th>{activeTab === 'founders' ? 'Verification Level' : activeTab === 'patents' ? 'Patent Status' : 'Documents Bundle'}</th>
                  <th>Current Status</th>
                  <th>Assigned Reviewer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => {
                  const currentSt = activeTab === 'founders' ? item.status : activeTab === 'startups' ? item.overallStatus : item.verificationStatus;
                  const reviewer = item.checkedBy || item.verifiedBy;

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>
                        {activeTab === 'founders'
                          ? (item.user?.fullName || item.user?.username || `User #${item.userId}`)
                          : (item.startup?.startupName || item.startup?.title || `Proposal #${item.startupId}`)}
                      </td>
                      <td>
                        {activeTab === 'founders'
                          ? item.user?.email
                          : (item.startup?.submitter?.email || item.startup?.submitter?.fullName || '—')}
                      </td>
                      <td>
                        {activeTab === 'founders' ? (
                          <span className="badge badge-submitted">{item.verificationLevel}</span>
                        ) : activeTab === 'patents' ? (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{item.patentStatus}</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Doc Set</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={currentSt} />
                      </td>
                      <td>
                        {reviewer ? (
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                            👤 {reviewer.fullName || reviewer.username}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openReview(activeTab.slice(0, -1), item)}
                        >
                          Review &amp; Process
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Decision Modal */}
      {reviewItem && (
        <VerificationModal
          type={reviewType}
          item={reviewItem}
          reviewers={reviewers}
          onClose={() => { setReviewItem(null); setReviewType(null); }}
          onAction={handleAction}
          onAssignReviewer={handleAssignReviewer}
        />
      )}
    </div>
  );
}
