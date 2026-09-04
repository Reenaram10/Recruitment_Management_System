import React, { useEffect, useState } from 'react';
import { Search, Save, Plus, Trash2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, SlidersHorizontal, BookOpen, GraduationCap, Briefcase, Award } from 'lucide-react';

export function WeightageConfig({ initialCategory }) {
    const [items, setItems] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(initialCategory || 'all'); // 'all' | 'academics' | 'phd' | 'experience' | 'active'
    const [collapsed, setCollapsed] = useState({});

    useEffect(() => {
        if (initialCategory) {
            setCategoryFilter(initialCategory);
        }
    }, [initialCategory]);

    const load = () => {
        setLoading(true);
        fetch('/api/scoring/parameters')
            .then((r) => r.json())
            .then((d) => {
                const loadedItems = (d.parameters || []).map((p) => ({
                    ...p,
                    ranges: Array.isArray(p.ranges) ? p.ranges : []
                }));
                setItems(loadedItems);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load scoring parameters:', err);
                setLoading(false);
            });
    };

    useEffect(load, []);

    const totalWeightage = items.filter((p) => p.is_active).reduce((s, p) => s + Number(p.max_weightage || 0), 0);

    const updateItem = (i, patch) => setItems((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

    const updateRange = (i, j, patch) => {
        const currentRanges = Array.isArray(items[i]?.ranges) ? items[i].ranges : [];
        updateItem(i, { ranges: currentRanges.map((r, x) => (x === j ? { ...r, ...patch } : r)) });
    };

    const toggleCollapse = (id) => {
        setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const saveSingle = async (p) => {
        if (totalWeightage !== 100) {
            setMessage('Total active weightage must equal exactly 100% before saving.');
            return;
        }
        try {
            const res = await fetch(`/api/admin/scoring/parameters/${p.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
            });
            const d = await res.json();
            setMessage(d.success ? `Saved weightage for ${p.parameter_name}` : (d.message || 'Failed to save.'));
            if (d.success) setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to connect to backend server.');
        }
    };

    const saveAll = async () => {
        if (totalWeightage !== 100) {
            setMessage('Total active weightage must equal exactly 100% before saving.');
            return;
        }
        try {
            let errorOccurred = false;
            for (const p of items) {
                const res = await fetch(`/api/admin/scoring/parameters/${p.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(p),
                });
                const d = await res.json();
                if (!d.success) errorOccurred = true;
            }
            if (!errorOccurred) {
                setMessage('All scoring configurations saved successfully!');
                setTimeout(() => setMessage(''), 3500);
            } else {
                setMessage('Some configurations could not be saved.');
            }
        } catch (err) {
            setMessage('Failed to connect to backend server.');
        }
    };

    const removeItem = async (id, name) => {
        if (window.confirm(`Delete scoring parameter "${name}"?`)) {
            try {
                await fetch(`/api/admin/scoring/parameters/${id}`, { method: 'DELETE' });
                load();
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Filter Helper
    const getGroupCategory = (key) => {
        if (/tenth|twelfth|ug|pg|mphil/i.test(key)) return 'academics';
        if (/phd|publication|award|funded/i.test(key)) return 'phd';
        return 'experience';
    };

    const filteredItems = items.filter((p) => {
        const matchesSearch = p.parameter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.candidate_field || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        const group = getGroupCategory(p.parameter_key || p.candidate_field || '');
        if (categoryFilter === 'active') return !!p.is_active;
        if (categoryFilter !== 'all' && group !== categoryFilter) return false;
        return true;
    });

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <div className="spinner" style={{ marginBottom: '1rem' }} />
                Loading scoring configuration...
            </div>
        );
    }

    return (
        <div id="weightage-config-container" style={{ marginTop: '1rem' }}>
            {/* Live Weightage Allocation Dashboard Card - Blue & Theme Aware */}
            <div
                style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    background: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    borderLeft: `5px solid ${totalWeightage === 100 ? '#1d4ed8' : '#eab308'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {totalWeightage === 100 ? (
                            <CheckCircle2 size={22} color="#1d4ed8" />
                        ) : (
                            <AlertTriangle size={22} color="#d97706" />
                        )}
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                            Weightage Allocation: {totalWeightage}% / 100%
                        </h3>
                    </div>
                    <button
                        type="button"
                        className="nav-btn primary"
                        onClick={saveAll}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.25rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            opacity: totalWeightage === 100 ? 1 : 0.75
                        }}
                    >
                        <Save size={16} /> Save All Configurations
                    </button>
                </div>

                {/* Visual Weightage Meter */}
                <div style={{ height: '10px', background: 'var(--color-bg-light)', borderRadius: '5px', overflow: 'hidden', width: '100%' }}>
                    <div
                        style={{
                            height: '100%',
                            width: `${Math.min(totalWeightage, 100)}%`,
                            background: totalWeightage === 100 ? '#1d4ed8' : totalWeightage > 100 ? '#ef4444' : '#f59e0b',
                            transition: 'all 0.3s ease'
                        }}
                    />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.4rem', textAlign: 'right' }}>
                    {totalWeightage === 100
                        ? '✓ Ready to save. Weightages equal 100%.'
                        : totalWeightage > 100
                            ? `⚠️ Exceeds 100% by ${totalWeightage - 100}%. Please adjust active parameters.`
                            : `Remaining allocation: ${100 - totalWeightage}%`}
                </div>
            </div>

            {message && (
                <div
                    style={{
                        padding: '0.85rem 1.2rem',
                        borderRadius: '8px',
                        marginBottom: '1.25rem',
                        background: message.includes('successfully') || message.includes('Saved') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: message.includes('successfully') || message.includes('Saved') ? '#10b981' : '#ef4444',
                        border: '1px solid var(--color-border)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {message}
                </div>
            )}

            {/* Interactive Search & Quick Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search parameter (e.g. UG, Ph.D, Experience)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.3rem', width: '100%', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-card-bg)', color: 'var(--color-text-main)', height: '40px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                        { id: 'all', label: `All (${items.length})` },
                        { id: 'academics', label: 'Academics' },
                        { id: 'phd', label: 'Ph.D. & Research' },
                        { id: 'experience', label: 'Experience & Certs' },
                        { id: 'active', label: `Active (${items.filter(p => p.is_active).length})` }
                    ].map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setCategoryFilter(f.id)}
                            style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '20px',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                border: categoryFilter === f.id ? '1px solid #0284c7' : '1px solid var(--color-border)',
                                background: categoryFilter === f.id ? '#0284c7' : 'var(--color-card-bg)',
                                color: categoryFilter === f.id ? '#ffffff' : 'var(--color-text-main)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List of Parameters (Clean layout without repetitive titles) */}
            {filteredItems.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-card-bg)', borderRadius: '12px', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    No matching parameters found.
                </div>
            ) : (
                filteredItems.map((p) => {
                    const originalIdx = items.findIndex((x) => x.id === p.id);
                    const rangesList = Array.isArray(p.ranges) ? p.ranges : [];
                    const isCollapsed = !!collapsed[p.id];
                    const categoryGroup = getGroupCategory(p.parameter_key || p.candidate_field || '');

                    const isMedium = String(p.candidate_field || '').endsWith('.medium');
                    const isYesNo = ['first_attempt', 'first_class', 'completed', 'funded_projects', 'funded_consultancy', 'funded'].some(k => String(p.candidate_field || '').includes(k) || String(p.parameter_key || '').includes(k));
                    const allOptions = isMedium
                        ? ['Tamil', 'English']
                        : isYesNo
                            ? ['Yes', 'No']
                            : ['Tier 1 / Premier', 'Tier 2 / State Govt', 'Tier 3 / Private'];

                    const usedValues = rangesList.map((r) => r.category_value).filter(Boolean);
                    const remainingOptions = allOptions.filter((opt) => !usedValues.includes(opt));
                    const isAllCategoryAdded = p.value_type === 'category' && remainingOptions.length === 0;

                    return (
                        <div
                            key={p.id || originalIdx}
                            style={{
                                padding: '1.25rem 1.5rem',
                                marginBottom: '1rem',
                                background: 'var(--color-card-bg)',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)',
                                borderLeft: `5px solid ${p.is_active ? '#0284c7' : 'var(--color-border)'}`,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => toggleCollapse(p.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
                                    >
                                        {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                    </button>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 750, fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{p.parameter_name}</span>
                                            <span
                                                style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '12px',
                                                    textTransform: 'uppercase',
                                                    background: 'rgba(2, 132, 199, 0.15)',
                                                    color: '#38bdf8',
                                                    border: '1px solid rgba(56, 189, 248, 0.3)'
                                                }}
                                            >
                                                {categoryGroup === 'academics' ? 'Academic' : categoryGroup === 'phd' ? 'Research & Ph.D.' : 'Experience'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Switch + Weightage Slider Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Weightage:</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={p.max_weightage || 0}
                                            onChange={(e) => updateItem(originalIdx, { max_weightage: Number(e.target.value) })}
                                            style={{ width: '90px', accentColor: '#0284c7', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={p.max_weightage || 0}
                                            onChange={(e) => updateItem(originalIdx, { max_weightage: Number(e.target.value) })}
                                            style={{ width: '60px', padding: '0.3rem 0.4rem', textAlign: 'center', fontWeight: 700, borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-card-bg)', color: 'var(--color-text-main)' }}
                                        />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-main)' }}>%</span>
                                    </div>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: p.is_active ? '#10b981' : 'var(--color-text-muted)', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!p.is_active}
                                            onChange={(e) => updateItem(originalIdx, { is_active: e.target.checked })}
                                        />
                                        {p.is_active ? 'Active' : 'Off'}
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(p.id, p.parameter_name)}
                                        title="Delete Parameter"
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Score Breakdown Body */}
                            {!isCollapsed && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                    {rangesList.map((r, j) => {
                                        const currentVal = r.category_value || (remainingOptions[0] || allOptions[0]);
                                        return (
                                            <div
                                                key={j}
                                                style={{
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    marginTop: '0.6rem',
                                                    padding: '0.6rem 0.85rem',
                                                    background: 'var(--color-bg-light)',
                                                    borderRadius: '8px',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap',
                                                    border: '1px solid var(--color-border)'
                                                }}
                                            >
                                                {p.value_type === 'category' ? (
                                                    <select
                                                        value={currentVal}
                                                        onChange={(e) => updateRange(originalIdx, j, { category_value: e.target.value })}
                                                        style={{ padding: '0.4rem 0.65rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card-bg)', color: 'var(--color-text-main)', fontWeight: 600, minWidth: '130px' }}
                                                    >
                                                        {allOptions.map((opt) => {
                                                            const isAlreadyUsed = usedValues.includes(opt) && opt !== currentVal;
                                                            return (
                                                                <option key={opt} value={opt} disabled={isAlreadyUsed}>
                                                                    {opt} {isAlreadyUsed ? '(Added)' : ''}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Range:</span>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            placeholder="From"
                                                            value={r.min_value ?? ''}
                                                            onChange={(e) => updateRange(originalIdx, j, { min_value: e.target.value })}
                                                            style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card-bg)', color: 'var(--color-text-main)' }}
                                                        />
                                                        <span style={{ color: 'var(--color-text-muted)' }}>–</span>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            placeholder="To"
                                                            value={r.max_value ?? ''}
                                                            onChange={(e) => updateRange(originalIdx, j, { max_value: e.target.value })}
                                                            style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card-bg)', color: 'var(--color-text-main)' }}
                                                        />
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Assigned Points:</span>
                                                    <input
                                                        type="number"
                                                        value={r.assigned_score ?? 0}
                                                        onChange={(e) => updateRange(originalIdx, j, { assigned_score: Number(e.target.value) })}
                                                        style={{ width: '80px', padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-card-bg)', color: 'var(--color-text-main)', fontWeight: 700 }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItem(originalIdx, { ranges: rangesList.filter((_, x) => x !== j) })}
                                                        style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', marginLeft: '0.5rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Action Buttons inside Card */}
                                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            disabled={isAllCategoryAdded}
                                            onClick={() => {
                                                const nextCategoryVal = remainingOptions[0] || allOptions[0];
                                                updateItem(originalIdx, {
                                                    ranges: [
                                                        ...rangesList,
                                                        {
                                                            range_type: p.value_type,
                                                            min_value: '',
                                                            max_value: '',
                                                            category_value: p.value_type === 'category' ? nextCategoryVal : '',
                                                            assigned_score: 0,
                                                        },
                                                    ],
                                                });
                                            }}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                cursor: isAllCategoryAdded ? 'not-allowed' : 'pointer',
                                                border: '1px dashed #0284c7',
                                                background: 'rgba(2, 132, 199, 0.12)',
                                                color: '#38bdf8',
                                                opacity: isAllCategoryAdded ? 0.5 : 1,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.3rem'
                                            }}
                                        >
                                            <Plus size={14} /> Add {p.value_type === 'category' ? 'Option' : 'Score Range'}
                                            {isAllCategoryAdded ? ' (All Added)' : ''}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => saveSingle(p)}
                                            style={{
                                                padding: '0.4rem 0.85rem',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                background: '#0284c7',
                                                color: 'white',
                                                border: 'none'
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}


