import { useState } from 'react';

export default function LandingHome({ user, setCurrentTab }) {
  const [activePersona, setActivePersona] = useState('Founder');

  const personas = [
    {
      id: 'Founder',
      icon: '🚀',
      title: 'For Startup Founders',
      subtitle: 'Turn Your Ideas & Inventions Into Funded Ventures',
      features: [
        'Get instant AI feedback on your proposal and project strength',
        'Verify official ID documents (PAN card, Aadhaar, GST, Company details)',
        'Earn a Patent Trust Badge to build confidence with investors',
        'Receive funding step-by-step as you complete project milestones'
      ],
      ctaText: 'Submit Your Proposal',
      ctaTab: 'new-proposal'
    },
    {
      id: 'Investor',
      icon: '💼',
      title: 'For Investors',
      subtitle: 'Find Safe & Verified Startups to Invest In',
      features: [
        'Browse a curated list of checked, high-growth startups',
        'Read easy AI safety reports and patent verification results',
        'Chat directly with founders in private video & discussion rooms',
        'Track how your invested money is spent step-by-step'
      ],
      ctaText: 'Explore Marketplace',
      ctaTab: 'marketplace'
    },
    {
      id: 'Reviewer',
      icon: '⚖️',
      title: 'For Expert Reviewers',
      subtitle: 'Evaluate Proposals Fairly & Provide Guidance',
      features: [
        'View a simple list of assigned proposals waiting for your review',
        'Use AI recommendations for budget and approval guidance',
        'Talk directly with founders to clarify technical details',
        'Give clear, objective scores and feedback'
      ],
      ctaText: 'View Review Queue',
      ctaTab: 'reviews'
    },
    {
      id: 'Admin',
      icon: '🛡️',
      title: 'For Platform Admins',
      subtitle: 'Manage System Safety & Verify Identity Documents',
      features: [
        'Inspect PAN and Aadhaar identity cards in the Verification Center',
        'Check official Govt registries (Income Tax, UIDAI, GST, MCA)',
        'Assign proposals to expert reviewers',
        'Manage platform subscriptions and user permissions'
      ],
      ctaText: 'Open Verification Center',
      ctaTab: 'verification-review'
    }
  ];

  return (
    <div className="page-container" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* ── HERO SECTION ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(6,182,212,0.04))',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '3.25rem 2.25rem',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '820px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '99px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            fontWeight: '700',
            color: 'var(--accent-primary)',
            marginBottom: '1.25rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            🚀 InnovAura — Simple, Safe &amp; Smart Platform for Startups and Investors
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: '800',
            color: '#000000',
            lineHeight: '1.25',
            marginBottom: '1.15rem',
            letterSpacing: '-0.02em'
          }}>
            Connect Founders &amp; Investors with <span style={{ color: 'var(--accent-primary)' }}>AI Insights</span> &amp; Verified Trust Records.
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: '#1E293B',
            lineHeight: '1.65',
            fontWeight: '500',
            marginBottom: '2rem'
          }}>
            InnovAura helps startup founders present their business proposals, verify government identity documents, calculate trust scores with AI, and connect safely with investors to secure funding.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: '700' }}
              onClick={() => setCurrentTab(user?.role === 'Investor' ? 'marketplace' : user?.role === 'Reviewer' ? 'reviews' : 'overview')}
            >
              🚀 Launch Application
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: '600' }}
              onClick={() => setCurrentTab('marketplace')}
            >
              🏛️ Explore Startups
            </button>
            {user?.role === 'Admin' && (
              <button
                className="btn btn-success"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: '700' }}
                onClick={() => setCurrentTab('verification-review')}
              >
                🛡️ Verification Center
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── KEY NUMBERS AT A GLANCE ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem'
      }}>
        {[
          { label: 'Funding Disbursed', value: '₹12.4 Crore+', note: 'Given step-by-step', icon: '💸', color: '#16a34a' },
          { label: 'AI Check Accuracy', value: '99.4%', note: 'Smart safety score', icon: '🤖', color: '#2563eb' },
          { label: 'Verified Patents', value: '450+', note: 'Govt records matched', icon: '📜', color: '#0891b2' },
          { label: 'Average Trust Score', value: '94 / 100', note: 'High investor safety', icon: '🛡️', color: '#9333ea' },
        ].map((m, i) => (
          <div key={i} className="section-card" style={{
            padding: '1.25rem',
            margin: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase' }}>{m.label}</span>
              <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#000000', fontFamily: 'var(--font-mono)' }}>{m.value}</div>
            <div style={{ fontSize: '0.75rem', color: m.color, fontWeight: '700', marginTop: '0.25rem' }}>✓ {m.note}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN FEATURES ── */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#000000', marginBottom: '0.5rem' }}>
            Main Features Made Simple
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#1E293B', fontWeight: '500' }}>
            Everything you need to evaluate ideas, verify identity, and invest safely.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            {
              icon: '🤖',
              title: '1. Automatic AI Assistant',
              desc: 'Gives instant feedback on proposal strengths, suggests budget amounts, and detects risk factors automatically.'
            },
            {
              icon: '🛡️',
              title: '2. Identity & Govt Verification',
              desc: 'Cross-checks PAN card, Aadhaar, GST, and MCA records to ensure only genuine founders and companies get listed.'
            },
            {
              icon: '🏆',
              title: '3. Patent Trust Badge',
              desc: 'Calculates a clear safety Trust Score based on verified patents, grant dates, and background checks.'
            },
            {
              icon: '💸',
              title: '4. Startup & Investor Marketplace',
              desc: 'Allows founders to showcase their projects and lets accredited investors invest safely step-by-step.'
            },
            {
              icon: '💬',
              title: '5. Direct Chat & Video Calls',
              desc: 'Built-in private discussion rooms with video call links (Zoom/Meet) to talk directly with experts and investors.'
            },
            {
              icon: '📊',
              title: '6. Easy Charts & Reports',
              desc: 'Clean bar charts and progress bars showing how money is allocated across departments and milestones.'
            }
          ].map((item, idx) => (
            <div key={idx} className="section-card" style={{
              margin: 0,
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                border: '1px solid var(--border-color)'
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000000', marginBottom: '0.5rem' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#1E293B', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS IN 4 EASY STEPS ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2.5rem',
        marginBottom: '3.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simple Process</span>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#000000', marginTop: '0.25rem' }}>
            How It Works in 4 Easy Steps
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            { step: 'Step 1', title: 'Submit Proposal', desc: 'Founder enters project details, patent number, and ID proof.' },
            { step: 'Step 2', title: 'AI & Govt Check', desc: 'AI checks project quality, and system verifies government ID records.' },
            { step: 'Step 3', title: 'Expert Review', desc: 'Domain experts evaluate technical details and provide feedback.' },
            { step: 'Step 4', title: 'Get Funded', desc: 'Investors fund approved projects safely in milestone steps.' }
          ].map((s, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-tertiary)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: '800',
                color: 'var(--accent-primary)',
                marginBottom: '0.4rem',
                textTransform: 'uppercase'
              }}>
                {s.step}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#000000', marginBottom: '0.4rem' }}>{s.title}</h4>
              <p style={{ fontSize: '0.82rem', color: '#1E293B', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROLE SHOWCASE ── */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#000000', marginBottom: '0.5rem' }}>
            Designed for Every User Role
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#1E293B', fontWeight: '500' }}>
            Click a role below to see what each user can do:
          </p>

          <div style={{
            display: 'inline-flex',
            gap: '0.5rem',
            padding: '0.35rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '99px',
            marginTop: '1rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePersona(p.id)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '99px',
                  border: 'none',
                  background: activePersona === p.id ? 'var(--accent-primary)' : 'transparent',
                  color: activePersona === p.id ? '#000000' : '#1E293B',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {p.icon} {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Role Card */}
        {(() => {
          const p = personas.find(item => item.id === activePersona);
          return (
            <div className="section-card" style={{
              padding: '2rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)',
              margin: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{p.icon}</span>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#000000', margin: 0 }}>{p.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: '600', margin: 0 }}>{p.subtitle}</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {p.features.map((feat, fIdx) => (
                  <div key={fIdx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    background: 'var(--bg-tertiary)',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: '800', fontSize: '1rem' }}>✓</span>
                    <span style={{ fontSize: '0.88rem', color: '#000000', fontWeight: '500', lineHeight: '1.4' }}>{feat}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.5rem', fontWeight: '700' }}
                  onClick={() => setCurrentTab(p.ctaTab)}
                >
                  {p.ctaText} →
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── BOTTOM BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        borderRadius: '16px',
        padding: '2.5rem',
        color: '#000000',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#000000', marginBottom: '0.75rem' }}>
          Ready to Explore the Platform Live?
        </h2>
        <p style={{ fontSize: '1rem', color: '#000000', fontWeight: '600', maxWidth: '650px', margin: '0 auto 1.5rem auto' }}>
          Click below to log in or open the interactive workspace to see AI analysis, identity verification, and funding features in action.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{
              background: '#000000',
              color: '#ffffff',
              fontWeight: '700',
              padding: '0.75rem 1.75rem',
              fontSize: '0.95rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentTab(user?.role === 'Investor' ? 'marketplace' : user?.role === 'Reviewer' ? 'reviews' : 'overview')}
          >
            Go to Main Dashboard
          </button>
        </div>
      </div>

    </div>
  );
}
