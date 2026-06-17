import { useState } from 'react';
import { api } from '../services/api';
import {
  validateUsername,
  validatePassword,
  validateEmail,
  validateFullName,
  validateContactNumber,
  getPasswordComplexityDetails
} from '../utils/validators';

export default function Register({ onRegisterSuccess, switchToLogin, goToHome }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [role, setRole] = useState('Founder');
  const [department, setDepartment] = useState('Engineering');
  const [patentId, setPatentId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const pwdDetails = getPasswordComplexityDetails(password);

  const handleFieldChange = (field, setter, validator) => (e) => {
    const val = e.target.value;
    setter(val);

    if (val && val.trim()) {
      const res = validator ? validator(val) : { isValid: true };
      setFieldErrors(prev => ({ ...prev, [field]: res.isValid ? '' : res.message }));
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validate Full Name
    const nameVal = validateFullName(fullName);
    if (!nameVal.isValid) {
      setError(nameVal.message);
      return;
    }

    // 2. Validate Email
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setError(emailVal.message);
      return;
    }

    // 3. Validate Contact Number
    const contactVal = validateContactNumber(contactNumber);
    if (!contactVal.isValid) {
      setError(contactVal.message);
      return;
    }

    // 4. Validate Username
    const userVal = validateUsername(username);
    if (!userVal.isValid) {
      setError(userVal.message);
      return;
    }

    // 5. Validate Password
    const pwdVal = validatePassword(password);
    if (!pwdVal.isValid) {
      setError(pwdVal.message);
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim(),
        role,
        department,
        patentId: role === 'Founder' ? (patentId.trim() || null) : null
      });
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        onRegisterSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Choose another username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={goToHome}
            style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0.35rem 0.75rem', borderRadius: '20px' }}
          >
            🏠 Home Overview
          </button>
          <span style={{ fontSize: '0.75rem', color: '#1E293B', fontWeight: '600' }}>InnovAura Platform</span>
        </div>

        <div className="auth-header">
          <h1>CREATE ACCOUNT</h1>
          <p>Register as Founder, Reviewer, Investor or Administrator</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '6px',
            color: 'var(--color-rejected)',
            fontSize: '0.85rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '6px',
            color: 'var(--color-approved)',
            fontSize: '0.85rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem'
          }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              style={{ border: fieldErrors.fullName ? '1.5px solid #ef4444' : undefined }}
              value={fullName}
              onChange={handleFieldChange('fullName', setFullName, validateFullName)}
              placeholder="Sarah Jenkins"
            />
            {fieldErrors.fullName && (
              <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                ⚠️ {fieldErrors.fullName}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                style={{ border: fieldErrors.email ? '1.5px solid #ef4444' : undefined }}
                value={email}
                onChange={handleFieldChange('email', setEmail, validateEmail)}
                placeholder="sjenkins@governance.com"
              />
              {fieldErrors.email && (
                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                  ⚠️ {fieldErrors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                className="form-input"
                style={{ border: fieldErrors.contactNumber ? '1.5px solid #ef4444' : undefined }}
                value={contactNumber}
                onChange={handleFieldChange('contactNumber', setContactNumber, validateContactNumber)}
                placeholder="+91 98123 45678"
              />
              {fieldErrors.contactNumber && (
                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                  ⚠️ {fieldErrors.contactNumber}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className="form-input"
                style={{ border: fieldErrors.username ? '1.5px solid #ef4444' : undefined }}
                value={username}
                onChange={handleFieldChange('username', setUsername, validateUsername)}
                placeholder="sjenkins"
              />
              {fieldErrors.username && (
                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                  ⚠️ {fieldErrors.username}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                style={{ border: fieldErrors.password ? '1.5px solid #ef4444' : undefined }}
                value={password}
                onChange={handleFieldChange('password', setPassword, validatePassword)}
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 600 }}>
                  ⚠️ {fieldErrors.password}
                </div>
              )}
            </div>
          </div>

          {/* Password Security Rules Indicator */}
          <div style={{
            background: 'var(--bg-card-secondary, rgba(255,255,255,0.03))',
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            borderRadius: '6px',
            padding: '0.6rem 0.8rem',
            marginBottom: '1rem',
            fontSize: '0.75rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Password Security Requirements:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
              <span style={{ color: pwdDetails.minLength ? '#10B981' : '#64748B' }}>
                {pwdDetails.minLength ? '✓' : '○'} At least 8 characters
              </span>
              <span style={{ color: pwdDetails.hasUpper ? '#10B981' : '#64748B' }}>
                {pwdDetails.hasUpper ? '✓' : '○'} One uppercase letter (A-Z)
              </span>
              <span style={{ color: pwdDetails.hasLower ? '#10B981' : '#64748B' }}>
                {pwdDetails.hasLower ? '✓' : '○'} One lowercase letter (a-z)
              </span>
              <span style={{ color: pwdDetails.hasDigit ? '#10B981' : '#64748B' }}>
                {pwdDetails.hasDigit ? '✓' : '○'} One number (0-9)
              </span>
              <span style={{ color: pwdDetails.hasSpecial ? '#10B981' : '#64748B', gridColumn: 'span 2' }}>
                {pwdDetails.hasSpecial ? '✓' : '○'} One special character (!@#$%^&*)
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="role">Platform Role</label>
              <select
                id="role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Founder">Founder</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Investor">Investor</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="R&D">R&D</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          {role === 'Founder' && (
            <div className="form-group mb-3">
              <label htmlFor="patentId">Patent ID <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>(Optional)</span></label>
              <input
                type="text"
                id="patentId"
                className="form-input"
                value={patentId}
                onChange={(e) => setPatentId(e.target.value)}
                placeholder="e.g. US10123456 or IN202111023456"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.2' }}>
                💡 Linking a valid patent ID grants you a <b>Verified Inventor</b> badge, adding institutional trust to your submissions.
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full mb-1" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <a onClick={switchToLogin} style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}>
            Sign In here
          </a>
        </div>
      </div>
    </div>
  );
}
