import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from '../Banner';
import { Briefcase, ArrowRight, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export const ExperienceTab = ({ profileData, onSaveSuccess, onNext, onPrev }) => {
    const { user } = useAuth();
    const [banner, setBanner] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [isFresher, setIsFresher] = useState(false);
    const [activeOtherKey, setActiveOtherKey] = useState(null);

    const [entries, setEntries] = useState([
        { type: 'Teaching', org: '', from: '', to: '', total: '', designation: '', salary: '' },
    ]);

    useEffect(() => {
        if (profileData?.experience) {
            const expList = profileData.experience;
            if (expList.length > 0 && expList[0].is_fresher === 1) {
                setIsFresher(true);
                setEntries([]);
            } else if (expList.length > 0) {
                setIsFresher(false);
                setEntries(
                    expList.map((e) => ({
                        type: e.exp_type || 'Teaching',
                        org: e.org_name || '',
                        from: e.from_date ? e.from_date.substring(0, 10) : '',
                        to: e.to_date ? e.to_date.substring(0, 10) : '',
                        total: e.total_duration || '',
                        designation: e.designation || '',
                        salary: e.salary || '',
                    }))
                );
            }
        }
    }, [profileData]);

    const calculateDuration = (fromStr, toStr) => {
        if (!fromStr) return '';
        const start = new Date(fromStr);
        const end = toStr ? new Date(toStr) : new Date();

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '';

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const parts = [];
        if (years > 0) {
            parts.push(`${years} ${years === 1 ? 'Yr' : 'Yrs'}`);
        }
        if (months > 0 || years === 0) {
            parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
        }

        return parts.join(' ');
    };

    const handleEntryChange = (index, field, value) => {
        setEntries((prev) => {
            const copy = [...prev];
            copy[index][field] = value;

            if (field === 'from' || field === 'to') {
                const computed = calculateDuration(copy[index].from, copy[index].to);
                if (computed) {
                    copy[index].total = computed;
                }
            }
            if (field === 'type' && value === 'Other') {
                setActiveOtherKey(`exp-${index}-type`);
            }
            return copy;
        });
    };

    const addEntry = () => {
        setEntries((prev) => [
            ...prev,
            { type: 'Teaching', org: '', from: '', to: '', total: '', designation: '', salary: '' },
        ]);
    };

    const removeEntry = (index) => {
        setEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBanner({ type: '', message: '' });
        setLoading(true);

        try {
            const res = await fetch('/api/experience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user?.email || '',
                    is_fresher: isFresher,
                    entries: isFresher ? [] : entries,
                }),
            });

            const result = await res.json();
            if (result.success) {
                setBanner({ type: 'success', message: 'Work experience saved successfully!' });
                if (onSaveSuccess) onSaveSuccess();
            } else {
                setBanner({ type: 'error', message: result.message || 'Failed to save experience.' });
            }
        } catch (err) {
            setBanner({ type: 'error', message: 'Server connection error during save.' });
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
                        <Briefcase size={20} color="#3b82f6" /> Work &amp; Teaching Experience
                    </div>

                    <div className="fresher-box" style={{ padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isFresher}
                                onChange={(e) => {
                                    setIsFresher(e.target.checked);
                                    if (e.target.checked) setEntries([]);
                                    else if (entries.length === 0) addEntry();
                                }}
                            />
                            I am a Fresher (No Prior Work Experience)
                        </label>
                    </div>

                    {!isFresher && (
                        <div>
                            {entries.map((entry, idx) => (
                                <div key={idx} className="entry-card" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Experience Entry #{idx + 1}</span>
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
                                            <label>Experience Type</label>
                                            <select value={entry.type} onChange={(e) => handleEntryChange(idx, 'type', e.target.value)} onClick={() => { if (entry.type === 'Other') setActiveOtherKey(`exp-${idx}-type`); }}>
                                                <option value="Teaching">Teaching Experience</option>
                                                <option value="Industry">Industry / Corporate Experience</option>
                                                <option value="Research">Research Experience</option>
                                                <option value="Other">{entry.typeOther || 'Other'}</option>
                                            </select>
                                            {entry.type === 'Other' && (activeOtherKey === `exp-${idx}-type` || !entry.typeOther) && (
                                                <input
                                                    type="text"
                                                    value={entry.typeOther || ''}
                                                    onChange={(e) => handleEntryChange(idx, 'typeOther', e.target.value)}
                                                    onBlur={() => { if (entry.typeOther?.trim()) setActiveOtherKey(null); }}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherKey(null); } }}
                                                    placeholder="Type custom experience type..."
                                                    className="select-other-input"
                                                    autoFocus
                                                    required
                                                />
                                            )}
                                        </div>

                                        <div className="field">
                                            <label>Organization / Institute Name</label>
                                            <input type="text" value={entry.org} onChange={(e) => handleEntryChange(idx, 'org', e.target.value)} placeholder="Company or College name" required />
                                        </div>

                                        <div className="field">
                                            <label>Designation / Role</label>
                                            <input type="text" value={entry.designation} onChange={(e) => handleEntryChange(idx, 'designation', e.target.value)} placeholder="e.g. Assistant Professor" required />
                                        </div>

                                        <div className="field">
                                            <label>From Date</label>
                                            <input type="date" value={entry.from} onChange={(e) => handleEntryChange(idx, 'from', e.target.value)} required />
                                        </div>

                                        <div className="field">
                                            <label>To Date (or Present)</label>
                                            <input type="date" value={entry.to} onChange={(e) => handleEntryChange(idx, 'to', e.target.value)} />
                                        </div>

                                        <div className="field">
                                            <label>Total Duration</label>
                                            <input type="text" value={entry.total} onChange={(e) => handleEntryChange(idx, 'total', e.target.value)} placeholder="e.g. 2 Yrs 6 Months" />
                                        </div>

                                        <div className="field">
                                            <label>Last Drawn Monthly Salary (₹)</label>
                                            <input type="number" value={entry.salary} onChange={(e) => handleEntryChange(idx, 'salary', e.target.value)} placeholder="e.g. 45000" />
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
                                <Plus size={16} /> Add Another Experience Entry
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={onPrev} className="nav-btn secondary" style={{ borderRadius: '10px' }}>
                        <ArrowLeft size={18} /> Back: Education Details
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" disabled={loading} className="nav-btn secondary" style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Experience'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                handleSubmit({ preventDefault: () => { } }).then(() => onNext());
                            }}
                            className="nav-btn primary"
                            style={{ background: '#2563eb', padding: '0.75rem 1.5rem', borderRadius: '10px' }}
                        >
                            Next: Certifications <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
