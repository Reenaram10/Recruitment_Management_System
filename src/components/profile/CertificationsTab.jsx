import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from '../Banner';
import { Award, ArrowRight, ArrowLeft, Save, Plus, Trash2, Edit3, X, FileText } from 'lucide-react';

const generateYearOptions = (startYear = 1960, endYear = new Date().getFullYear() + 2) => {
    const years = [];
    for (let y = endYear; y >= startYear; y--) {
        years.push(y);
    }
    return years;
};

export const CertificationsTab = ({ profileData, isSubmitted, onSaveSuccess, onNext, onPrev }) => {
    const { user } = useAuth();
    const [banner, setBanner] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const hasLoadedRef = useRef(false);
    const isDirtyRef = useRef(false);
    const loadedEmailRef = useRef('');

    const [entries, setEntries] = useState([]);

    // Modal state for adding/editing a certification entry
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [certForm, setCertForm] = useState(getInitialCertForm());

    function getInitialCertForm() {
        return {
            category: 'NPTEL / SWAYAM',
            categoryOther: '',
            title: '',
            organization: 'IIT Madras / NPTEL',
            score: '',
            year: new Date().getFullYear().toString(),
            certDocPath: null,
            file: null
        };
    }

    useEffect(() => {
        if (user?.email && loadedEmailRef.current !== user.email) {
            loadedEmailRef.current = user.email;
            hasLoadedRef.current = false;
            isDirtyRef.current = false;
        }

        if (profileData?.certifications && profileData.certifications.length > 0 && !hasLoadedRef.current && !isDirtyRef.current) {
            setEntries(
                profileData.certifications.map((c) => ({
                    title: c.title || '',
                    score: c.score || '',
                    category: c.category || 'NPTEL / SWAYAM',
                    categoryOther: '',
                    organization: c.organization || '',
                    year: c.year || '',
                    certDocPath: c.cert_doc || null,
                    file: null,
                }))
            );
            hasLoadedRef.current = true;
        }
    }, [profileData, user]);

    const openAddModal = () => {
        if (isSubmitted) return;
        setEditingIndex(null);
        setCertForm(getInitialCertForm());
        setIsModalOpen(true);
    };

    const openEditModal = (index) => {
        if (isSubmitted) return;
        setEditingIndex(index);
        setCertForm({ ...entries[index] });
        setIsModalOpen(true);
    };

    const saveCertModal = () => {
        if (!certForm.title.trim() || !certForm.organization.trim()) {
            alert('Course Title and Issuing Organization are required.');
            return;
        }

        isDirtyRef.current = true;
        const entryToSave = {
            ...certForm,
            category: certForm.category === 'Other' && certForm.categoryOther.trim() ? certForm.categoryOther.trim() : certForm.category
        };

        if (editingIndex !== null) {
            setEntries((prev) => {
                const copy = [...prev];
                copy[editingIndex] = entryToSave;
                return copy;
            });
        } else {
            setEntries((prev) => [...prev, entryToSave]);
        }

        setIsModalOpen(false);
    };

    const removeEntry = (index) => {
        if (isSubmitted) return;
        if (window.confirm('Remove this certification entry?')) {
            isDirtyRef.current = true;
            setEntries((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isSubmitted) return false;
        setBanner({ type: '', message: '' });
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('user_email', user?.email || '');

            const entriesMeta = entries.map((e) => ({
                title: e.title,
                score: e.score,
                category: e.category,
                organization: e.organization,
                year: e.year,
            }));

            formData.append('entries', JSON.stringify(entriesMeta));

            entries.forEach((e, idx) => {
                if (e.file) {
                    formData.append(`certDoc_${idx}`, e.file);
                }
            });

            const res = await fetch('/api/certifications', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();
            if (result.success) {
                isDirtyRef.current = false;
                hasLoadedRef.current = true;
                setBanner({ type: 'success', message: 'Certifications saved successfully!' });
                if (onSaveSuccess) onSaveSuccess();
                return true;
            } else {
                setBanner({ type: 'error', message: result.message || 'Failed to save certifications.' });
                return false;
            }
        } catch (err) {
            setBanner({ type: 'error', message: 'Server connection error during saving certifications.' });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            <Banner type={banner.type} message={banner.message} onClose={() => setBanner({ type: '', message: '' })} />

            <form onSubmit={handleSubmit}>
                <fieldset disabled={isSubmitted} style={{ border: 'none', padding: 0, margin: 0 }}>
                    <div className="section-card" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                                    <Award size={22} color="#5551ff" /> Certifications &amp; NPTEL / SWAYAM Details
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem', marginBottom: 0 }}>
                                    Manage your NPTEL, SWAYAM, Coursera, or industrial professional certifications.
                                </p>
                            </div>
                            {!isSubmitted && (
                                <button
                                    type="button"
                                    onClick={openAddModal}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.88rem',
                                        background: '#5551ff',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        boxShadow: '0 4px 6px -1px rgba(85, 81, 255, 0.3)'
                                    }}
                                >
                                    <Plus size={18} /> Add New Certification
                                </button>
                            )}
                        </div>

                        {entries.length === 0 ? (
                            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                {isSubmitted ? 'No certifications recorded.' : <>No certifications added yet. Click <strong style={{ color: '#5551ff' }}>"+ Add New Certification"</strong> above to add an entry.</>}
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                    <thead>
                                        <tr style={{ background: '#5551ff', color: 'white', textTransform: 'uppercase', fontSize: '0.78rem' }}>
                                            <th style={{ padding: '0.9rem 0.75rem', width: '50px', textAlign: 'center' }}>S.NO</th>
                                            <th style={{ padding: '0.9rem 0.75rem' }}>CATEGORY</th>
                                            <th style={{ padding: '0.9rem 0.75rem' }}>COURSE / CERTIFICATION TITLE</th>
                                            <th style={{ padding: '0.9rem 0.75rem' }}>ISSUING ORGANIZATION</th>
                                            <th style={{ padding: '0.9rem 0.75rem' }}>SCORE / GRADE</th>
                                            <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>YEAR</th>
                                            <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>PROOF</th>
                                            {!isSubmitted && <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>ACTIONS</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map((entry, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>{entry.category || '-'}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 500, color: '#334155' }}>{entry.title || '-'}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>{entry.organization || '-'}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#475569' }}>{entry.score || 'N/A'}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#334155' }}>{entry.year || '-'}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                    {entry.file ? (
                                                        <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>{entry.file.name}</span>
                                                    ) : entry.certDocPath ? (
                                                        <a href={entry.certDocPath} target="_blank" rel="noopener noreferrer" style={{ padding: '0.3rem 0.65rem', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                                            <FileText size={13} /> View Proof
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                                {!isSubmitted && (
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                                            <button type="button" onClick={() => openEditModal(idx)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button type="button" onClick={() => removeEntry(idx)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </fieldset>

                <div className="profile-tab-actions">
                    <button type="button" onClick={onPrev} className="nav-btn primary" style={{ background: '#5551ff', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                        <ArrowLeft size={18} /> Back: Research &amp; Consultancy
                    </button>
                    {!isSubmitted ? (
                        <button type="submit" disabled={loading} className="nav-btn secondary" style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Certifications'}
                        </button>
                    ) : (
                        <span style={{ padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#64748b', borderRadius: '10px', fontWeight: 600, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                            🔒 Application Submitted (Edits Locked)
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={async (e) => {
                            if (isSubmitted) {
                                if (onNext) onNext();
                                return;
                            }
                            const ok = await handleSubmit(e);
                            if (ok && onNext) onNext();
                        }}
                        className="nav-btn primary"
                        style={{ background: '#5551ff', padding: '0.75rem 1.5rem', borderRadius: '10px' }}
                    >
                        {isSubmitted ? 'Next: Other Details' : 'Complete & Submit Profile'} <ArrowRight size={18} />
                    </button>
                </div>
            </form>

            {/* Modal Dialog for Adding/Editing Certification */}
            {
                isModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem'
                    }}>
                        <div style={{
                            background: '#ffffff',
                            width: '100%',
                            maxWidth: '680px',
                            maxHeight: '90vh',
                            borderRadius: '16px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Header Bar */}
                            <div style={{
                                background: '#5551ff',
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                color: '#ffffff'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                                    {editingIndex !== null ? 'Edit Certification' : 'Add New Certification'}
                                </h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                            Category <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <select
                                            value={['NPTEL / SWAYAM', 'Coursera / edX', 'Industrial Training'].includes(certForm.category) ? certForm.category : 'Other'}
                                            onChange={(e) => setCertForm({ ...certForm, category: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                        >
                                            <option value="NPTEL / SWAYAM">NPTEL / SWAYAM Course</option>
                                            <option value="Coursera / edX">Coursera / edX / Udemy</option>
                                            <option value="Industrial Training">Industrial / Professional Certification</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {(!['NPTEL / SWAYAM', 'Coursera / edX', 'Industrial Training'].includes(certForm.category) || certForm.category === 'Other') && (
                                            <input
                                                type="text"
                                                value={certForm.categoryOther}
                                                onChange={(e) => setCertForm({ ...certForm, categoryOther: e.target.value })}
                                                placeholder="Type custom category..."
                                                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.5rem', fontSize: '0.88rem' }}
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                            Course / Certification Title <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={certForm.title}
                                            onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                                            placeholder="e.g. Deep Learning for Computer Vision"
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                            Issuing Organization <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={certForm.organization}
                                            onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                                            placeholder="e.g. IIT Madras / NPTEL"
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                            Score / Percentage / Grade
                                        </label>
                                        <input
                                            type="text"
                                            value={certForm.score}
                                            onChange={(e) => setCertForm({ ...certForm, score: e.target.value })}
                                            placeholder="e.g. 85% or Elite / Gold"
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                            Year of Completion <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <select
                                            value={certForm.year}
                                            onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                        >
                                            <option value="" disabled>Select Year</option>
                                            {generateYearOptions().map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                            Upload Certificate (PDF / Image)
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => setCertForm({ ...certForm, file: e.target.files[0] })}
                                            accept=".pdf,image/*"
                                            style={{ width: '100%', padding: '0.55rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                borderTop: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                display: 'flex',
                                justify: 'flex-end',
                                gap: '0.75rem'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={saveCertModal}
                                    style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', background: '#2563eb', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s ease' }}
                                >
                                    {editingIndex !== null ? 'Update Certification' : 'Save Certification'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
