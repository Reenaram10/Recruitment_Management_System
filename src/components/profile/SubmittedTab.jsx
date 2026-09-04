import React from 'react';
import { CheckCircle2, Download, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PrintableApplicationForm } from '../PrintableApplicationForm';

export const SubmittedTab = ({ profileData, onEditTab }) => {
    const { user } = useAuth();
    const p = profileData?.personal || {};
    const edu = profileData?.education || [];
    const exp = profileData?.experience || [];
    const certs = profileData?.certifications || [];
    const phd = profileData?.phd_details || {};

    const handlePrint = () => {
        const origTitle = document.title;
        const name = p.full_name ? p.full_name.trim().replace(/\s+/g, '_') : 'Candidate';
        document.title = `Application_Form_${name}`;
        window.print();
        setTimeout(() => { document.title = origTitle; }, 1000);
    };

    return (
        <div className="form-card">
            <div
                className="submitted-banner"
                style={{
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    marginBottom: '2rem',
                }}
            >
                <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                    Application Profile Completed &amp; Saved
                </h2>
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Your details have been successfully persisted into the National Engineering College recruitment database.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
                    <button
                        type="button"
                        onClick={handlePrint}
                        style={{
                            padding: '0.65rem 1.2rem',
                            background: '#047857',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                        }}
                    >
                        <Download size={16} /> Download Application Form as PDF
                    </button>
                    <button
                        type="button"
                        onClick={() => onEditTab(1)}
                        className="submitted-edit-btn"
                        style={{
                            padding: '0.65rem 1.2rem',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                        }}
                    >
                        <Edit3 size={16} /> Edit Profile Details
                    </button>
                </div>
            </div>

            {/* Profile Overview */}
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                Submitted Candidate Summary
            </h3>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {p.photo_path && (
                    <img
                        src={p.photo_path}
                        alt="Applicant photo"
                        style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                )}
                <div style={{ flex: 1 }} className="detail-grid">
                    <div className="detail-item">
                        <div className="detail-label">Full Name</div>
                        <div className="detail-value">{p.full_name || 'N/A'}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-label">Post Applied For</div>
                        <div className="detail-value">{p.post || 'N/A'}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-label">Registered Email</div>
                        <div className="detail-value">{p.user_email || 'N/A'}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-label">Mobile Number</div>
                        <div className="detail-value">{p.phone || 'N/A'}</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-label">Date of Birth / Age</div>
                        <div className="detail-value">{p.dob ? String(p.dob).substring(0, 10) : 'N/A'} ({p.age ? `${p.age} yrs` : 'N/A'})</div>
                    </div>
                    <div className="detail-item">
                        <div className="detail-label">Community &amp; Caste</div>
                        <div className="detail-value">{p.community || 'N/A'} {p.caste ? `(${p.caste})` : ''}</div>
                    </div>
                </div>
            </div>

            {/* Qualifications list */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                Educational Background
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {edu.map((e, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', background: 'var(--color-bg-light)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <strong style={{ textTransform: 'uppercase', color: '#0284c7' }}>{e.qual_type}:</strong>{' '}
                            <span>{e.degree || e.qual_type} in {e.specialization || 'General'}</span>
                        </div>
                        <div>
                            <strong>{e.percentage ? `${e.percentage}%` : 'N/A'}</strong> — {e.institution_name || 'N/A'} ({e.year_of_passing || 'N/A'})
                        </div>
                    </div>
                ))}
                {phd.university && (
                    <div style={{ padding: '0.75rem 1rem', background: 'var(--color-bg-light)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <strong style={{ color: '#0369a1' }}>Ph.D Details:</strong> {phd.title} — {phd.university} ({phd.status})
                    </div>
                )}
            </div>

            {/* Experience list */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                    Work Experience
                </h4>
                {exp.length > 0 && exp[0].is_fresher !== 1 && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', background: 'var(--color-bg-light)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                        Total Exp: {exp.map(e => e.total_duration).filter(Boolean).join(' + ') || 'Recorded'}
                    </span>
                )}
            </div>
            {exp.length === 0 || (exp.length === 1 && exp[0].is_fresher === 1) ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Fresher Candidate (No prior experience recorded).</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {exp.map((ex, idx) => (
                        <div key={idx} style={{ padding: '0.75rem 1rem', background: 'var(--color-bg-light)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{ex.designation}</strong> at <span>{ex.org_name}</span> ({ex.exp_type})
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                                    {ex.from_date ? String(ex.from_date).substring(0, 10) : ''} to {ex.to_date ? String(ex.to_date).substring(0, 10) : 'Present'}
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.88rem' }}>
                                {ex.total_duration || 'Duration N/A'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Printable PDF Layout rendered off-screen for window.print() */}
            <PrintableApplicationForm application={profileData} />
        </div>
    );
};
