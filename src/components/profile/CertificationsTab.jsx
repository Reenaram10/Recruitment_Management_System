import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from '../Banner';
import { Award, ArrowRight, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

const generateYearOptions = (startYear = 1960, endYear = new Date().getFullYear() + 2) => {
    const years = [];
    for (let y = endYear; y >= startYear; y--) {
        years.push(y);
    }
    return years;
};

export const CertificationsTab = ({ profileData, onSaveSuccess, onNext, onPrev }) => {
    const { user } = useAuth();
    const [banner, setBanner] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [activeOtherKey, setActiveOtherKey] = useState(null);
    const hasLoadedRef = useRef(false);
    const isDirtyRef = useRef(false);

    const [entries, setEntries] = useState([
        { title: '', score: '', category: 'NPTEL / SWAYAM', organization: 'IIT Madras / NPTEL', year: '', file: null },
    ]);

    const loadedEmailRef = useRef('');

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
                    organization: c.organization || '',
                    year: c.year || '',
                    certDocPath: c.cert_doc || null,
                    file: null,
                }))
            );
            hasLoadedRef.current = true;
        }
    }, [profileData, user]);

    const handleEntryChange = (index, field, value) => {
        isDirtyRef.current = true;
        setEntries((prev) => {
            const copy = [...prev];
            copy[index][field] = value;
            return copy;
        });
        if (field === 'category' && value === 'Other') {
            setActiveOtherKey(`cert-${index}-category`);
        }
    };

    const handleFileChange = (index, file) => {
        isDirtyRef.current = true;
        setEntries((prev) => {
            const copy = [...prev];
            copy[index].file = file;
            return copy;
        });
    };

    const addEntry = () => {
        isDirtyRef.current = true;
        setEntries((prev) => [
            ...prev,
            { title: '', score: '', category: 'NPTEL / SWAYAM', organization: 'NPTEL', year: '', file: null },
        ]);
    };

    const removeEntry = (index) => {
        isDirtyRef.current = true;
        setEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
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
        <div>
            <Banner type={banner.type} message={banner.message} />

            <form onSubmit={handleSubmit}>
                <div className="section-card">
                    <div className="section-card-header">
                        <Award size={20} color="#3b82f6" /> Certifications &amp; NPTEL / SWAYAM Details
                    </div>

                    {entries.map((entry, idx) => (
                        <div key={idx} className="entry-card" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Certification #{idx + 1}</span>
                                {entries.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeEntry(idx)}
                                        style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                        <Trash2 size={14} /> Remove
                                    </button>
                                )}
                            </div>

                            <div className="grid-2">
                                <div className="field">
                                    <label>Certification Category</label>
                                    <select value={entry.category} onChange={(e) => handleEntryChange(idx, 'category', e.target.value)} onClick={() => { if (entry.category === 'Other') setActiveOtherKey(`cert-${idx}-category`); }}>
                                        <option value="NPTEL / SWAYAM">NPTEL / SWAYAM Course</option>
                                        <option value="Coursera / edX">Coursera / edX / Udemy</option>
                                        <option value="Industrial Training">Industrial / Professional Certification</option>
                                        <option value="Other">{entry.categoryOther || 'Other Certificate'}</option>
                                    </select>
                                    {entry.category === 'Other' && (activeOtherKey === `cert-${idx}-category` || !entry.categoryOther) && (
                                        <input
                                            type="text"
                                            value={entry.categoryOther || ''}
                                            onChange={(e) => handleEntryChange(idx, 'categoryOther', e.target.value)}
                                            onBlur={() => { if (entry.categoryOther?.trim()) setActiveOtherKey(null); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherKey(null); } }}
                                            placeholder="Type custom category..."
                                            className="select-other-input"
                                            autoFocus
                                            required
                                        />
                                    )}
                                </div>

                                <div className="field">
                                    <label>Course / Certification Title</label>
                                    <input type="text" value={entry.title} onChange={(e) => handleEntryChange(idx, 'title', e.target.value)} placeholder="e.g. Deep Learning for Computer Vision" required />
                                </div>

                                <div className="field">
                                    <label>Issuing Organization</label>
                                    <input type="text" value={entry.organization} onChange={(e) => handleEntryChange(idx, 'organization', e.target.value)} placeholder="e.g. IIT Madras / NPTEL" required />
                                </div>

                                <div className="field">
                                    <label>Score / Percentage / Grade (Optional)</label>
                                    <input type="text" value={entry.score || ''} onChange={(e) => handleEntryChange(idx, 'score', e.target.value)} placeholder="e.g. 85% or Elite / Gold" />
                                </div>

                                <div className="field">
                                    <label>Year of Completion</label>
                                    <select value={entry.year} onChange={(e) => handleEntryChange(idx, 'year', e.target.value)} required>
                                        <option value="" disabled>Select Year</option>
                                        {generateYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label>Upload Certificate (PDF / Image)</label>
                                    <input type="file" onChange={(e) => handleFileChange(idx, e.target.files[0])} accept=".pdf,image/*" />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addEntry}
                        className="add-entry-btn"
                        style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}
                    >
                        <Plus size={16} /> Add Another Certification
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={onPrev} className="nav-btn secondary" style={{ borderRadius: '10px' }}>
                        <ArrowLeft size={18} /> Back: Work Experience
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" disabled={loading} className="nav-btn secondary" style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Certifications'}
                        </button>
                        <button
                            type="button"
                            onClick={async (e) => {
                                const ok = await handleSubmit(e);
                                if (ok && onNext) onNext();
                            }}
                            className="nav-btn primary"
                            style={{ background: '#2563eb', padding: '0.75rem 1.5rem', borderRadius: '10px' }}
                        >
                            Complete &amp; Submit Profile <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
