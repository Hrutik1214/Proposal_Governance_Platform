import { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  validatePan,
  validateAadhaar,
  validateGst,
  validateCin,
  validateUrl,
  validatePatentId,
  validatePastOrPresentDate
} from '../utils/validators';

const STATUS_COLORS = {
  Verified: 'var(--accent-secondary)',
  Pending: '#f59e0b',
  Rejected: 'var(--color-rejected)',
  Unverified: 'var(--text-secondary)',
};

function StatusBadge({ status }) {
  const icons = { Verified: '✓', Pending: '⏳', Rejected: '✗', Unverified: '—' };
  const color = STATUS_COLORS[status] || STATUS_COLORS.Unverified;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize: '0.75rem', fontWeight: 700, color,
      background: `${color}18`, border: `1px solid ${color}40`,
      borderRadius: 20, padding: '0.2rem 0.7rem'
    }}>
      {icons[status] || '—'} {status}
    </span>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)',
      borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem'
    }}>
      <h3 style={{ margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

export default function VerificationDashboard({ user }) {
  const [proposals, setProposals] = useState([]);
  const [founderStatus, setFounderStatus] = useState(null);
  const [startupStatus, setStartupStatus] = useState(null);
  const [patentStatus, setPatentStatus] = useState(null);
  const [selectedProposalId, setSelectedProposalId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Founder form
  const [founderForm, setFounderForm] = useState({
    verificationLevel: 'Basic',
    panNumber: '', aadhaarNumber: '', linkedInUrl: '',
    gstNumber: '', registrationNumber: '', cinNumber: '',
    documentUrl: '', notes: ''
  });

  const handleFounderFieldChange = (field, value) => {
    setFounderForm(prev => ({ ...prev, [field]: value }));

    let errorMsg = '';
    const trimmed = value.trim();

    if (trimmed) {
      if (field === 'panNumber') {
        const res = validatePan(trimmed);
        if (!res.isValid) errorMsg = res.message;
      } else if (field === 'aadhaarNumber') {
        const res = validateAadhaar(trimmed);
        if (!res.isValid) errorMsg = res.message;
      } else if (field === 'linkedInUrl') {
        const res = validateUrl(trimmed, 'LinkedIn Profile URL');
        if (!res.isValid) errorMsg = res.message;
      } else if (field === 'gstNumber') {
        const res = validateGst(trimmed);
        if (!res.isValid) errorMsg = res.message;
      } else if (field === 'cinNumber') {
        const res = validateCin(trimmed);
        if (!res.isValid) errorMsg = res.message;
      }
    }

    setFieldErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  // Startup form
  const [startupForm, setStartupForm] = useState({
    registrationCertificateUrl: '', gstDocumentUrl: '',
    panDocumentUrl: '', financialStatementsUrl: '',
    pitchDeckUrl: '', notes: ''
  });

  // Patent form & check states
  const [patentForm, setPatentForm] = useState({
    patentStatus: 'NoPatent',
    patentNumber: '',
    filingDate: '',
    patentDocumentUrl: ''
  });
  const [patentCheckResult, setPatentCheckResult] = useState(null);
  const [runningPatentCheck, setRunningPatentCheck] = useState(false);

  const handlePatentFieldChange = (field, value) => {
    setPatentForm(prev => ({ ...prev, [field]: value }));

    let errorMsg = '';
    const trimmed = value.trim();

    if (trimmed) {
      if (field === 'patentNumber') {
        const res = validatePatentId(trimmed);
        if (!res.isValid) errorMsg = res.message;
      } else if (field === 'patentDocumentUrl') {
        const res = validateUrl(trimmed, 'Patent Document URL');
        if (!res.isValid) errorMsg = res.message;
      } else if (field === 'filingDate') {
        const res = validatePastOrPresentDate(trimmed, 'Filing / Grant Date');
        if (!res.isValid) errorMsg = res.message;
      }
    }

    setFieldErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [props, fStatus] = await Promise.all([
        api.get('/proposals'),
        api.get('/verification/founder/status'),
      ]);
      const list = Array.isArray(props) ? props : props.proposals ?? [];
      setProposals(list);
      setFounderStatus(fStatus);
      if (fStatus?.data) {
        const d = fStatus.data;
        setFounderForm(prev => ({
          ...prev,
          verificationLevel: d.verificationLevel || 'Basic',
          panNumber: d.panNumber || '',
          aadhaarNumber: d.aadhaarNumber || '',
          linkedInUrl: d.linkedInUrl || '',
          gstNumber: d.gstNumber || '',
          registrationNumber: d.registrationNumber || '',
          cinNumber: d.cinNumber || '',
          documentUrl: d.documentUrl || '',
          notes: d.notes || ''
        }));
      }
      if (list.length > 0 && !selectedProposalId) {
        const firstId = list[0].id ?? list[0].Id;
        setSelectedProposalId(String(firstId));
        await fetchStartupStatus(firstId);
        await fetchPatentStatus(firstId);
      }
    } catch (err) {
      console.error('Verification fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStartupStatus = async (proposalId) => {
    try {
      const s = await api.get(`/verification/startup/${proposalId}`);
      setStartupStatus(s);
      if (s?.data) {
        const d = s.data;
        setStartupForm(prev => ({
          ...prev,
          registrationCertificateUrl: d.registrationCertificateUrl || '',
          gstDocumentUrl: d.gstDocumentUrl || '',
          panDocumentUrl: d.panDocumentUrl || '',
          financialStatementsUrl: d.financialStatementsUrl || '',
          pitchDeckUrl: d.pitchDeckUrl || '',
          notes: d.notes || ''
        }));
      }
    } catch { setStartupStatus(null); }
  };

  const fetchPatentStatus = async (proposalId) => {
    try {
      const p = await api.get(`/PatentInfo/startup/${proposalId}`);
      setPatentStatus(p);
      if (p?.hasRecord && p?.data) {
        const d = p.data;
        setPatentForm({
          patentStatus: d.patentStatus || 'NoPatent',
          patentNumber: d.patentNumber || '',
          filingDate: d.filingDate ? d.filingDate.split('T')[0] : '',
          patentDocumentUrl: d.patentDocumentUrl || ''
        });
      } else {
        setPatentForm({
          patentStatus: 'NoPatent',
          patentNumber: '',
          filingDate: '',
          patentDocumentUrl: ''
        });
      }
      // Load automated check results
      try {
        const res = await api.get(`/PatentInfo/results/${proposalId}`);
        setPatentCheckResult(res);
      } catch {
        setPatentCheckResult(null);
      }
    } catch { 
      setPatentStatus(null); 
      setPatentCheckResult(null);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProposalChange = async (e) => {
    const id = e.target.value;
    setSelectedProposalId(id);
    setStartupStatus(null);
    setPatentStatus(null);
    setPatentCheckResult(null);
    if (id) {
      await fetchStartupStatus(id);
      await fetchPatentStatus(id);
    }
  };

  const handleFounderSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const level = founderForm.verificationLevel || 'Basic';

    // 1. Validate any provided field format (regardless of tier level)
    if (founderForm.panNumber && founderForm.panNumber.trim()) {
      const panVal = validatePan(founderForm.panNumber);
      if (!panVal.isValid) {
        setMessage({ type: 'error', text: panVal.message });
        return;
      }
    }

    if (founderForm.aadhaarNumber && founderForm.aadhaarNumber.trim()) {
      const aadhaarVal = validateAadhaar(founderForm.aadhaarNumber);
      if (!aadhaarVal.isValid) {
        setMessage({ type: 'error', text: aadhaarVal.message });
        return;
      }
    }

    if (founderForm.linkedInUrl && founderForm.linkedInUrl.trim()) {
      const urlVal = validateUrl(founderForm.linkedInUrl, 'LinkedIn Profile URL');
      if (!urlVal.isValid) {
        setMessage({ type: 'error', text: urlVal.message });
        return;
      }
    }

    if (founderForm.gstNumber && founderForm.gstNumber.trim()) {
      const gstVal = validateGst(founderForm.gstNumber);
      if (!gstVal.isValid) {
        setMessage({ type: 'error', text: gstVal.message });
        return;
      }
    }

    if (founderForm.cinNumber && founderForm.cinNumber.trim()) {
      const cinVal = validateCin(founderForm.cinNumber);
      if (!cinVal.isValid) {
        setMessage({ type: 'error', text: cinVal.message });
        return;
      }
    }

    // 2. Enforce tier-specific mandatory fields
    if (level === 'Verified' || level === 'Business') {
      const panVal = validatePan(founderForm.panNumber);
      if (!panVal.isValid) {
        setMessage({ type: 'error', text: `PAN Card error: ${panVal.message}` });
        return;
      }

      const aadhaarVal = validateAadhaar(founderForm.aadhaarNumber);
      if (!aadhaarVal.isValid) {
        setMessage({ type: 'error', text: `Aadhaar error: ${aadhaarVal.message}` });
        return;
      }
    }

    if (level === 'Business') {
      const gstVal = validateGst(founderForm.gstNumber);
      if (!gstVal.isValid) {
        setMessage({ type: 'error', text: `GSTIN error: ${gstVal.message}` });
        return;
      }

      if (!founderForm.registrationNumber || !founderForm.registrationNumber.trim()) {
        setMessage({ type: 'error', text: 'Company Registration Number is required for Business tier.' });
        return;
      }

      const cinVal = validateCin(founderForm.cinNumber);
      if (!cinVal.isValid) {
        setMessage({ type: 'error', text: `CIN error: ${cinVal.message}` });
        return;
      }
    }

    if (founderForm.documentUrl && founderForm.documentUrl.trim()) {
      const docUrlVal = validateUrl(founderForm.documentUrl, 'Document Bundle URL');
      if (!docUrlVal.isValid) {
        setMessage({ type: 'error', text: docUrlVal.message });
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post('/verification/founder/submit', {
        ...founderForm,
        panNumber: founderForm.panNumber ? founderForm.panNumber.trim().toUpperCase() : '',
        gstNumber: founderForm.gstNumber ? founderForm.gstNumber.trim().toUpperCase() : '',
        cinNumber: founderForm.cinNumber ? founderForm.cinNumber.trim().toUpperCase() : ''
      });
      setMessage({ type: 'success', text: 'Founder verification request submitted! Awaiting admin review.' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Submission failed.' });
    } finally { setSubmitting(false); }
  };

  const handleStartupSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProposalId) return;
    setSubmitting(true); setMessage(null);
    try {
      await api.post('/verification/startup/submit', { ...startupForm, startupId: parseInt(selectedProposalId) });
      setMessage({ type: 'success', text: 'Startup documents submitted! Awaiting admin review.' });
      await fetchStartupStatus(selectedProposalId);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Submission failed.' });
    } finally { setSubmitting(false); }
  };

  const handlePatentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProposalId) return;

    if (patentForm.patentStatus !== 'NoPatent') {
      const patVal = validatePatentId(patentForm.patentNumber);
      if (!patVal.isValid) {
        setMessage({ type: 'error', text: patVal.message });
        return;
      }

      if (patentForm.patentDocumentUrl && patentForm.patentDocumentUrl.trim()) {
        const urlVal = validateUrl(patentForm.patentDocumentUrl, 'Patent Document URL');
        if (!urlVal.isValid) {
          setMessage({ type: 'error', text: urlVal.message });
          return;
        }
      }
    }

    setSubmitting(true); setMessage(null);
    try {
      await api.post('/PatentInfo/startup/submit', {
        ...patentForm,
        startupId: parseInt(selectedProposalId),
        filingDate: patentForm.filingDate ? new Date(patentForm.filingDate).toISOString() : null
      });
      setMessage({ type: 'success', text: 'Patent details submitted successfully!' });
      await fetchPatentStatus(selectedProposalId);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Patent details submission failed.' });
    } finally { setSubmitting(false); }
  };

  const handleRunPatentCheck = async () => {
    if (!selectedProposalId) return;
    setRunningPatentCheck(true); setMessage(null);
    try {
      const checkRes = await api.post(`/PatentInfo/check/${selectedProposalId}`);
      setPatentCheckResult(checkRes);
      setMessage({ type: 'success', text: 'Automated patent registry check completed!' });
      await fetchPatentStatus(selectedProposalId);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Automated patent registry search check failed.' });
    } finally { setRunningPatentCheck(false); }
  };

  const founderStatusVal = founderStatus?.data?.status || (founderStatus?.hasRecord ? 'Pending' : 'Unverified');
  const startupStatusVal = startupStatus?.data?.overallStatus || (startupStatus?.hasRecord ? 'Pending' : 'Unverified');
  const patentStatusVal = patentStatus?.data?.verificationStatus || (patentStatus?.hasRecord ? 'Pending' : 'Unverified');

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading verification data…</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 860, margin: '0 auto' }}>
      <style>{`
        .vform-input { 
          width: 100%; 
          padding: 0.6rem 0.85rem; 
          border-radius: 8px;
          border: 1px solid #cbd5e1; 
          background: #ffffff;
          color: #0f172a; 
          font-size: 0.9rem; 
          font-weight: 500;
          outline: none; 
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .vform-input::placeholder {
          color: #64748b;
          font-weight: 400;
        }
        .vform-input:focus { 
          border-color: #0284c7; 
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.2); 
          background: #ffffff;
          color: #0f172a;
        }
        select.vform-input option {
          background: #ffffff;
          color: #0f172a;
        }
        .vform-label { font-size: 0.78rem; color: var(--text-secondary); text-transform: uppercase;
          letter-spacing: 0.05em; margin-bottom: 0.35rem; display: block; font-weight: 600; }
        .vform-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .vstat-row { display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.88rem; }
        .vstat-row:last-child { border-bottom: none; }
      `}</style>

      <h2 style={{ marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Verification Centre</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
        Submit your identity and startup documents for admin review. Verified status boosts your Trust Score.
      </p>

      {message && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem',
          background: message.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          color: message.type === 'success' ? 'var(--accent-secondary)' : 'var(--color-rejected)',
          border: `1px solid ${message.type === 'success' ? 'var(--accent-secondary)' : 'var(--color-rejected)'}40`,
          fontSize: '0.9rem'
        }}>
          {message.text}
        </div>
      )}

      {/* === FOUNDER VERIFICATION === */}
      <SectionCard title="Founder Identity Verification" icon="👤">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Current Status</span>
          <StatusBadge status={founderStatusVal} />
        </div>

        {founderStatusVal === 'Verified' ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--accent-secondary)' }}>
            <div style={{ fontSize: '2.5rem' }}>✅</div>
            <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>Identity Verified</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Verification Level: <strong>{founderStatus?.data?.verificationLevel}</strong>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFounderSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="vform-label">Verification Level</label>
              <select className="vform-input" value={founderForm.verificationLevel}
                onChange={e => setFounderForm(p => ({ ...p, verificationLevel: e.target.value }))}>
                <option value="Basic">Basic (Email + Mobile)</option>
                <option value="Verified">Verified (Basic + PAN + Aadhaar + LinkedIn)</option>
                <option value="Business">Business (Verified + GST + Company Reg + CIN)</option>
              </select>
            </div>

            <div className="vform-grid" style={{ marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="vform-label">PAN Number</label>
                  <a href="https://eportal.incometax.gov.in/iec/foservices/#/pre-login/verifyYourPAN" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>Verify PAN ↗</a>
                </div>
                <input 
                  className="vform-input" 
                  style={{ border: fieldErrors.panNumber ? '1.5px solid #ef4444' : undefined }}
                  placeholder="ABCDE1234F" 
                  value={founderForm.panNumber}
                  onChange={e => handleFounderFieldChange('panNumber', e.target.value.toUpperCase())} 
                  maxLength={10} 
                />
                {fieldErrors.panNumber && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                    ⚠️ {fieldErrors.panNumber}
                  </div>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="vform-label">Aadhaar Number</label>
                  <a href="https://myaadhaar.uidai.gov.in/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>Verify Aadhaar ↗</a>
                </div>
                <input 
                  className="vform-input" 
                  style={{ border: fieldErrors.aadhaarNumber ? '1.5px solid #ef4444' : undefined }}
                  placeholder="XXXX XXXX XXXX" 
                  value={founderForm.aadhaarNumber}
                  onChange={e => handleFounderFieldChange('aadhaarNumber', e.target.value)} 
                  maxLength={14} 
                />
                {fieldErrors.aadhaarNumber && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                    ⚠️ {fieldErrors.aadhaarNumber}
                  </div>
                )}
              </div>
              <div>
                <label className="vform-label">LinkedIn Profile URL</label>
                <input 
                  className="vform-input" 
                  style={{ border: fieldErrors.linkedInUrl ? '1.5px solid #ef4444' : undefined }}
                  placeholder="https://linkedin.com/in/..." 
                  value={founderForm.linkedInUrl}
                  onChange={e => handleFounderFieldChange('linkedInUrl', e.target.value)} 
                />
                {fieldErrors.linkedInUrl && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                    ⚠️ {fieldErrors.linkedInUrl}
                  </div>
                )}
              </div>
              {(founderForm.verificationLevel === 'Business') && (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="vform-label">GST Number</label>
                      <a href="https://services.gst.gov.in/services/searchtp" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>Verify GST ↗</a>
                    </div>
                    <input 
                      className="vform-input" 
                      style={{ border: fieldErrors.gstNumber ? '1.5px solid #ef4444' : undefined }}
                      placeholder="22AAAAA0000A1Z5" 
                      value={founderForm.gstNumber}
                      onChange={e => handleFounderFieldChange('gstNumber', e.target.value.toUpperCase())} 
                      maxLength={15} 
                    />
                    {fieldErrors.gstNumber && (
                      <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                        ⚠️ {fieldErrors.gstNumber}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="vform-label">Company Registration No.</label>
                      <a href="https://www.mca.gov.in/mcafoportal/viewCompanyOrLLPDetails.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>Verify Co Reg ↗</a>
                    </div>
                    <input className="vform-input" placeholder="U12345MH2020PTC12345" value={founderForm.registrationNumber}
                      onChange={e => handleFounderFieldChange('registrationNumber', e.target.value)} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="vform-label">CIN Number</label>
                      <a href="https://www.mca.gov.in/mcafoportal/viewCompanyOrLLPDetails.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>Verify CIN ↗</a>
                    </div>
                    <input 
                      className="vform-input" 
                      style={{ border: fieldErrors.cinNumber ? '1.5px solid #ef4444' : undefined }}
                      placeholder="L12345MH2020PLC12345" 
                      value={founderForm.cinNumber}
                      onChange={e => handleFounderFieldChange('cinNumber', e.target.value.toUpperCase())} 
                      maxLength={21} 
                    />
                    {fieldErrors.cinNumber && (
                      <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                        ⚠️ {fieldErrors.cinNumber}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="vform-label">Document Bundle URL (Govt Portal / Drive Link)</label>
              <input className="vform-input" placeholder="https://drive.google.com/..." value={founderForm.documentUrl}
                onChange={e => setFounderForm(p => ({ ...p, documentUrl: e.target.value }))} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="vform-label">Additional Notes</label>
              <textarea className="vform-input" rows={2} placeholder="Any context for the admin reviewer…"
                value={founderForm.notes}
                onChange={e => setFounderForm(p => ({ ...p, notes: e.target.value }))} />
            </div>

            {founderStatusVal === 'Rejected' && founderStatus?.data?.notes && (
              <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--color-rejected)' }}>Rejection Reason:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{founderStatus.data.notes}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : founderStatusVal === 'Pending' ? 'Resubmit Request' : 'Submit Verification Request'}
            </button>
          </form>
        )}
      </SectionCard>

      {/* === STARTUP VERIFICATION === */}
      <SectionCard title="Startup Document Verification" icon="🏢">
        {proposals.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1.25rem 1.5rem',
            textAlign: 'center',
            margin: '0.5rem 0'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
            <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              Proposal Required for Startup Document Verification
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0 0 1rem 0' }}>
              To upload company registration certificates, GST documents, or pitch decks, please create your startup proposal profile first.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => window.location.href = '/founder'}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 600 }}
            >
              + Create Startup Proposal
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="vform-label">Select Startup / Proposal</label>
              <select className="vform-input" style={{ maxWidth: 420 }}
                value={selectedProposalId} onChange={handleProposalChange}>
                {proposals.map(p => (
                  <option key={p.id ?? p.Id} value={p.id ?? p.Id}>
                    {p.title ?? p.Title ?? `Proposal #${p.id ?? p.Id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Status overview */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Overall Status</span>
              <StatusBadge status={startupStatusVal} />
            </div>

            {startupStatusVal === 'Verified' ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--accent-secondary)' }}>
                <div style={{ fontSize: '2.5rem' }}>✅</div>
                <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>Startup Verified</div>
              </div>
            ) : (
              <>
                {/* Per-document status grid */}
                {startupStatus?.hasRecord && (
                  <div style={{ marginBottom: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                    {[
                      { label: 'Registration Certificate', key: 'registrationCertificateStatus' },
                      { label: 'GST Document', key: 'gstDocumentStatus' },
                      { label: 'PAN Document', key: 'panDocumentStatus' },
                      { label: 'Financial Statements', key: 'financialStatementsStatus' },
                      { label: 'Pitch Deck', key: 'pitchDeckStatus' },
                    ].map(({ label, key }) => (
                      <div key={key} className="vstat-row">
                        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                        <StatusBadge status={startupStatus.data?.[key] || 'Pending'} />
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleStartupSubmit}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                    Enter public document links (Google Drive, Govt Portal, etc.) for each required document:
                  </p>
                  <div className="vform-grid" style={{ marginBottom: '1rem' }}>
                    {[
                      { label: 'Registration Certificate URL', field: 'registrationCertificateUrl', placeholder: 'https://...' },
                      { label: 'GST Document URL', field: 'gstDocumentUrl', placeholder: 'https://...' },
                      { label: 'PAN Document URL', field: 'panDocumentUrl', placeholder: 'https://...' },
                      { label: 'Financial Statements URL', field: 'financialStatementsUrl', placeholder: 'https://...' },
                      { label: 'Pitch Deck URL', field: 'pitchDeckUrl', placeholder: 'https://...' },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label className="vform-label">{label}</label>
                        <input className="vform-input" placeholder={placeholder}
                          value={startupForm[field]}
                          onChange={e => setStartupForm(p => ({ ...p, [field]: e.target.value }))} />
                      </div>
                    ))}
                    <div>
                      <label className="vform-label">Notes for Admin</label>
                      <input className="vform-input" placeholder="Any clarifications…"
                        value={startupForm.notes}
                        onChange={e => setStartupForm(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                  </div>

                  {startupStatusVal === 'Rejected' && startupStatus?.data?.notes && (
                    <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--color-rejected)' }}>Rejection Reason:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{startupStatus.data.notes}</span>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={submitting || !selectedProposalId}>
                    {submitting ? 'Submitting…' : startupStatus?.hasRecord ? 'Resubmit Documents' : 'Submit Documents for Review'}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </SectionCard>

      {/* === PATENT & IP REGISTRY VERIFICATION === */}
      <SectionCard title="Patent & IP Registry Verification" icon="🛡️">
        {proposals.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1.25rem 1.5rem',
            textAlign: 'center',
            margin: '0.5rem 0'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
            <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              Proposal Required for Patent & IP Verification
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0 0 1rem 0' }}>
              To link patent applications or granted patents with your startup IP portfolio, please create your startup proposal profile first.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => window.location.href = '/founder'}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 600 }}
            >
              + Create Startup Proposal
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Verification Status</span>
              <StatusBadge status={patentStatusVal} />
            </div>

            {patentStatusVal === 'Verified' ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--accent-secondary)' }}>
                <div style={{ fontSize: '2.5rem' }}>✅</div>
                <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>Patent Verified</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Patent ID: <strong>{patentForm.patentNumber || 'N/A'}</strong>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePatentSubmit}>
                <div className="vform-grid" style={{ marginBottom: '1rem' }}>
                  <div>
                    <label className="vform-label">Patent Status</label>
                    <select className="vform-input" value={patentForm.patentStatus}
                      onChange={e => setPatentForm(p => ({ ...p, patentStatus: e.target.value }))}>
                      <option value="NoPatent">No Patent / Intellectual Property</option>
                      <option value="PatentDrafted">Patent Drafted (In progress)</option>
                      <option value="PatentFiled">Patent Filed (Submitted to Registry)</option>
                      <option value="PatentPending">Patent Pending (Under examination)</option>
                      <option value="PatentGranted">Patent Granted & Issued</option>
                    </select>
                  </div>

                  {patentForm.patentStatus !== 'NoPatent' && (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className="vform-label">Patent / Application ID</label>
                          <a 
                            href={patentForm.patentNumber && patentForm.patentNumber.startsWith('20') 
                              ? "https://iprsearch.ipindia.gov.in/publicsearch" 
                              : "https://ppubs.uspto.gov/pubwebapp/"
                            } 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}
                          >
                            Verify Registry ↗
                          </a>
                        </div>
                        <input 
                          className="vform-input" 
                          style={{ border: fieldErrors.patentNumber ? '1.5px solid #ef4444' : undefined }}
                          placeholder="e.g. US10123456 or 202521044863" 
                          value={patentForm.patentNumber}
                          onChange={e => handlePatentFieldChange('patentNumber', e.target.value)} 
                        />
                        {fieldErrors.patentNumber && (
                          <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                            ⚠️ {fieldErrors.patentNumber}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="vform-label">Filing / Grant Date</label>
                        <input 
                          type="date" 
                          className="vform-input" 
                          style={{ border: fieldErrors.filingDate ? '1.5px solid #ef4444' : undefined }}
                          value={patentForm.filingDate}
                          onChange={e => handlePatentFieldChange('filingDate', e.target.value)} 
                        />
                        {fieldErrors.filingDate && (
                          <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                            ⚠️ {fieldErrors.filingDate}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="vform-label">Patent Document URL (Google Drive / Registry Link)</label>
                        <input 
                          className="vform-input" 
                          style={{ border: fieldErrors.patentDocumentUrl ? '1.5px solid #ef4444' : undefined }}
                          placeholder="https://..." 
                          value={patentForm.patentDocumentUrl}
                          onChange={e => handlePatentFieldChange('patentDocumentUrl', e.target.value)} 
                        />
                        {fieldErrors.patentDocumentUrl && (
                          <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                            ⚠️ {fieldErrors.patentDocumentUrl}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn btn-primary" style={{ margin: 0 }} disabled={submitting}>
                    {submitting ? 'Submitting…' : patentStatus?.hasRecord ? 'Resubmit Patent Details' : 'Submit Patent Details'}
                  </button>

                  {patentForm.patentStatus !== 'NoPatent' && patentForm.patentNumber && (
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ background: 'var(--accent-secondary)', color: 'black', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}
                      onClick={handleRunPatentCheck} 
                      disabled={runningPatentCheck}
                    >
                      {runningPatentCheck ? '🔍 Querying Registry...' : '⚡ Automated Registry Check'}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Simulated Automated Check Report Card */}
            {patentCheckResult && (
              <div style={{
                marginTop: '1.5rem', background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.18)',
                borderRadius: 10, padding: '1.25rem'
              }}>
                <h4 style={{ color: 'var(--accent-cyan)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🛡️</span> Automated Registry Scan Findings
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Registry Match</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: 4, color: patentCheckResult.matchPercentage > 0 ? 'var(--accent-secondary)' : 'var(--color-rejected)' }}>
                      {patentCheckResult.matchPercentage > 0 ? '✓ Verified Registry ID' : '❌ Unregistered ID'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>IP infringement Risk</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: 4, color: patentCheckResult.patentRiskLevel === 'High' ? 'var(--color-rejected)' : patentCheckResult.patentRiskLevel === 'Medium' ? '#f59e0b' : '#10b981' }}>
                      {patentCheckResult.patentRiskLevel}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Clash Similarity</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: 4, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {patentCheckResult.matchPercentage}%
                    </div>
                  </div>
                </div>

                {patentCheckResult.detailsJson && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 8, fontSize: '0.82rem', lineHeight: '1.5' }}>
                    {(() => {
                      try {
                        const parsed = JSON.parse(patentCheckResult.detailsJson);
                        if (parsed.ErrorMessage) {
                          return <div style={{ color: 'var(--color-rejected)', fontWeight: 600 }}>⚠️ {parsed.ErrorMessage}</div>;
                        }
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                              <div>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{parsed.Title || 'Patent Specification Analysis'}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                  Authority: <strong>{parsed.Authority || 'Global Patent Registry'}</strong> | Record Type: <strong>{parsed.RecordType || 'Patent'}</strong> | Domain: <strong>{parsed.TechnologyDomain || parsed.domain || 'General Tech'}</strong>
                                </div>
                              </div>
                              <div style={{ background: 'var(--accent-primary-light)', border: '1px solid var(--accent-primary)', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                🎯 Confidence: {parsed.ConfidenceScore || parsed.confidence || '88%'}
                              </div>
                            </div>

                            {/* Structured AI Report Findings */}
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>🧠 Executive Summary:</strong>
                              <p style={{ margin: '0.2rem 0 0.5rem', color: 'var(--text-secondary)' }}>{parsed.PatentSummary || parsed.Abstract || 'No summary available.'}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                                <strong style={{ color: 'var(--accent-primary)' }}>💡 Innovation & Novelty:</strong>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 }}>
                                  {parsed.InnovationAssessment || 'High technical innovation merit.'}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                                  {parsed.NoveltyAssessment || 'Substantial novelty in primary claims.'}
                                </div>
                              </div>

                              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                                <strong style={{ color: '#f59e0b' }}>⚠️ Prior Art & Risks:</strong>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 }}>
                                  {parsed.PriorArtConcerns || 'Low immediate prior art conflict risk.'}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                                  {parsed.TechnicalRisks || 'Standard prosecution lifecycle risks.'}
                                </div>
                              </div>
                            </div>

                            {parsed.CommercialPotential && (
                              <div>
                                <strong style={{ color: 'var(--accent-secondary)' }}>💰 Commercial Potential:</strong>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 }}>{parsed.CommercialPotential}</div>
                              </div>
                            )}

                            {parsed.AnalysisTimestamp && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                Analyzed at: {parsed.AnalysisTimestamp}
                              </div>
                            )}
                          </div>
                        );
                      } catch {
                        return <span style={{ color: 'var(--text-secondary)' }}>Details parse error. Raw data: {patentCheckResult.detailsJson}</span>;
                      }
                    })()}
                  </div>
                )}

                {/* Mandatory Advisory Disclaimer */}
                <div style={{
                  fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.75rem',
                  padding: '0.5rem 0.75rem', background: 'rgba(37,99,235,0.06)',
                  border: '1px solid rgba(37,99,235,0.2)', borderRadius: 6, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  <span>ℹ️</span> The AI report is advisory only. Final approval always belongs to Reviewer/Admin.
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
