import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from '../Banner';
import { Briefcase, ArrowRight, ArrowLeft, Save, Plus, Trash2, Edit3, X } from 'lucide-react';

export const ExperienceTab = ({ profileData, isSubmitted, onSaveSuccess, onNext, onPrev }) => {
    const { user } = useAuth();
    const [banner, setBanner] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [isFresher, setIsFresher] = useState(false);
    const hasLoadedRef = useRef(false);
    const isDirtyRef = useRef(false);
    const loadedEmailRef = useRef('');

    const [entries, setEntries] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [activeOtherKey, setActiveOtherKey] = useState(null);
    const [entryForm, setEntryForm] = useState(getInitialEntryForm());

    function getInitialEntryForm() {
        return {
            type: 'Teaching',
            typeOther: '',
            org: '',
            designation: '',
            from: '',
            to: '',
            total: '',
            salary: ''
        };
    }

    useEffect(() => {
        if (user?.email && loadedEmailRef.current !== user.email) {
            loadedEmailRef.current = user.email;
            hasLoadedRef.current = false;
            isDirtyRef.current = false;
        }

        if (profileData?.experience && !hasLoadedRef.current && !isDirtyRef.current) {
            const expList = profileData.experience;
            if (expList.length > 0 && expList[0].is_fresher === 1) {
                setIsFresher(true);
                setEntries([]);
            } else if (expList.length > 0) {
                setIsFresher(false);
                setEntries(
                    expList.map((e) => ({
                        type: e.exp_type || 'Teaching',
                        typeOther: '',
                        org: e.org_name || '',
                        from: e.from_date ? e.from_date.substring(0, 10) : '',
                        to: e.to_date ? e.to_date.substring(0, 10) : '',
                        total: e.total_duration || '',
                        designation: e.designation || '',
                        salary: e.salary || '',
                    }))
                );
            }
            hasLoadedRef.current = true;
        }
    }, [profileData, user]);

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

    const handleFormChange = (field, value) => {
        setEntryForm((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === 'from' || field === 'to') {
                const computed = calculateDuration(updated.from, updated.to);
                if (computed) {
                    updated.total = computed;
                }
            }
            if (field === 'type' && value === 'Other') {
                setActiveOtherKey('modal-type-other');
            }
            return updated;
        });
    };

    const openAddModal = () => {
        if (isSubmitted) return;
        setEditingIndex(null);
        setEntryForm(getInitialEntryForm());
        setActiveOtherKey(null);
        setIsModalOpen(true);
    };

    const openEditModal = (index) => {
        if (isSubmitted) return;
        setEditingIndex(index);
        setEntryForm({ ...entries[index] });
        setActiveOtherKey(null);
        setIsModalOpen(true);
    };

    const saveEntryModal = () => {
        if (!entryForm.org.trim() || !entryForm.designation.trim()) {
            alert('Organization Name and Designation / Role are required.');
            return;
        }

        isDirtyRef.current = true;
        const entryToSave = {
            ...entryForm,
            type: entryForm.type === 'Other' && entryForm.typeOther.trim() ? entryForm.typeOther.trim() : entryForm.type
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
        if (window.confirm('Remove this work experience entry?')) {
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
            const res = await fetch('/api/experience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: user?.email || profileData?.personal?.email || profileData?.personal_info?.email || profileData?.email || '',
                    is_fresher: isFresher,
                    entries: isFresher ? [] : entries,
                }),
            });

            const result = await res.json();
            if (result.success) {
                isDirtyRef.current = false;
                hasLoadedRef.current = true;
                setBanner({ type: 'success', message: 'Work experience saved successfully!' });
                if (onSaveSuccess) onSaveSuccess();
                return true;
            } else {
                setBanner({ type: 'error', message: result.message || 'Failed to save experience.' });
                return false;
            }
        } catch (err) {
            setBanner({ type: 'error', message: 'Server connection error during save.' });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amt) => {
        if (!amt) return '-';
        const num = parseFloat(amt);
        return isNaN(num) ? `₹${amt}` : `₹${num.toLocaleString('en-IN')}`;
    };

    const formatDateRange = (from, to) => {
        if (!from && !to) return '-';
        const f = from ? new Date(from).toLocaleDateString('en-GB') : '';
        const t = to ? new Date(to).toLocaleDateString('en-GB') : 'Present';
        return f ? `${f} - ${t}` : t;
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
                                    <Briefcase size={22} color="#5551ff" /> Work &amp; Teaching Experience
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem', marginBottom: 0 }}>
                                    Add and manage your past academic, industry, or research experience entries.
                                </p>
                            </div>
                            {!isFresher && !isSubmitted && (
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
                                    <Plus size={18} /> Add New Experience Entry
                                </button>
                            )}
                        </div>

                        <div className="fresher-box" style={{ padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', fontWeight: 600, cursor: isSubmitted ? 'default' : 'pointer', color: '#334155' }}>
                                <input
                                    type="checkbox"
                                    checked={isFresher}
                                    disabled={isSubmitted}
                                    onChange={(e) => {
                                        setIsFresher(e.target.checked);
                                        if (e.target.checked) setEntries([]);
                                    }}
                                />
                                I am a Fresher (No Prior Work Experience)
                            </label>
                        </div>

                        {!isFresher && (
                            entries.length === 0 ? (
                                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                    {isSubmitted ? 'No work experience entries recorded.' : <>No work experience entries added yet. Click <strong style={{ color: '#5551ff' }}>"+ Add New Experience Entry"</strong> above to add an entry.</>}
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                        <thead>
                                            <tr style={{ background: '#5551ff', color: 'white', textTransform: 'uppercase', fontSize: '0.78rem' }}>
                                                <th style={{ padding: '0.9rem 0.75rem', width: '50px', textAlign: 'center' }}>S.NO</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>EXPERIENCE TYPE</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>ORGANIZATION / INSTITUTE</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>DESIGNATION / ROLE</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>DURATION</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>TOTAL DURATION</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>MONTHLY SALARY (₹)</th>
                                                {!isSubmitted && <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>ACTIONS</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entries.map((entry, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>{entry.type || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 500, color: '#334155' }}>{entry.org || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>{entry.designation || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569', fontSize: '0.82rem' }}>{formatDateRange(entry.from, entry.to)}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#334155' }}>{entry.total || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>{formatCurrency(entry.salary)}</td>
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
                            )
                        )}
                    </div>
                </fieldset>

                {/* Form Buttons */}
                <div className="profile-tab-actions">
                    <button type="button" onClick={onPrev} className="nav-btn primary" style={{ background: '#5551ff', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                        <ArrowLeft size={18} /> Back: Education Details
                    </button>
                    {!isSubmitted ? (
                        <button type="submit" disabled={loading} className="nav-btn secondary" style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Experience'}
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
                        Next: Research &amp; Consultancy <ArrowRight size={18} />
                    </button>
                </div>
            </form>

            {/* Modal Dialog */}
            {isModalOpen && (
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
                                {editingIndex !== null ? 'Edit Experience Entry' : 'Add New Experience Entry'}
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
                                        Experience Type <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <select
                                        value={['Teaching', 'Industry', 'Research'].includes(entryForm.type) ? entryForm.type : 'Other'}
                                        onChange={(e) => handleFormChange('type', e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                    >
                                        <option value="Teaching">Teaching Experience</option>
                                        <option value="Industry">Industry / Corporate Experience</option>
                                        <option value="Research">Research Experience</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {(!['Teaching', 'Industry', 'Research'].includes(entryForm.type) || entryForm.type === 'Other') && (
                                        <input
                                            type="text"
                                            value={entryForm.typeOther || (['Teaching', 'Industry', 'Research'].includes(entryForm.type) ? '' : entryForm.type)}
                                            onChange={(e) => handleFormChange('typeOther', e.target.value)}
                                            placeholder="Specify experience type..."
                                            style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.5rem', fontSize: '0.88rem' }}
                                            autoFocus
                                        />
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                        Organization / Institute Name <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={entryForm.org}
                                        onChange={(e) => handleFormChange('org', e.target.value)}
                                        placeholder="Company or College name"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                    Designation / Role <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={entryForm.designation}
                                    onChange={(e) => handleFormChange('designation', e.target.value)}
                                    placeholder="e.g. Assistant Professor, Software Engineer"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={entryForm.from}
                                        onChange={(e) => handleFormChange('from', e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                        To Date (or Leave Empty for Present)
                                    </label>
                                    <input
                                        type="date"
                                        value={entryForm.to}
                                        onChange={(e) => handleFormChange('to', e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                        Total Duration
                                    </label>
                                    <input
                                        type="text"
                                        value={entryForm.total}
                                        onChange={(e) => handleFormChange('total', e.target.value)}
                                        placeholder="e.g. 2 Yrs 6 Months"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                        Last Drawn Monthly Salary (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                        value={entryForm.salary}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) handleFormChange('salary', val);
                                        }}
                                        placeholder="e.g. 45000"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
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
                            justifyContent: 'flex-end',
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
                                onClick={saveEntryModal}
                                style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', background: '#2563eb', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s ease' }}
                            >
                                {editingIndex !== null ? 'Update Entry' : 'Save Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
