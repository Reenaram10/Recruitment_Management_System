import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Banner';
import { Search, Eye, Plus, Trash2, CheckCircle, XCircle, Download, X, Settings, Users, Sliders, Edit2, Check, ToggleLeft, ToggleRight, ShieldCheck, LogOut, BookOpen, ChevronLeft, ChevronRight, Menu, Upload, Award, RefreshCw } from 'lucide-react';
import { WeightageConfig } from '../components/WeightageConfig';
import { PrintableApplicationForm } from '../components/PrintableApplicationForm';

const InstitutionRankingsManager = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingCategory, setUploadingCategory] = useState(null);
    const [engCsvText, setEngCsvText] = useState('');
    const [artsCsvText, setArtsCsvText] = useState('');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [dragOverCategory, setDragOverCategory] = useState(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 15;

    const fetchInstitutions = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/institutions');
            const data = await res.json();
            if (data.success) {
                setInstitutions(data.institutions || []);
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Failed to load institution rankings.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const processCategoryCsvUpload = async (content, category) => {
        if (!content || !content.trim()) return;
        try {
            setUploadingCategory(category);
            setStatusMsg({ type: 'info', text: `Uploading and updating ${category} institution database records...` });
            const res = await fetch('/api/admin/institutions/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csvContent: content, category })
            });
            const data = await res.json();
            if (data.success) {
                setInstitutions(data.institutions || []);
                setStatusMsg({ type: 'success', text: `✅ ${data.message}` });
                if (category === 'Engineering') setEngCsvText('');
                if (category === 'Arts & Science') setArtsCsvText('');
            } else {
                setStatusMsg({ type: 'error', text: `❌ ${data.message}` });
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Upload failed: ' + err.message });
        } finally {
            setUploadingCategory(null);
        }
    };

    const handleFileUploadForCategory = (e, category) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            if (evt.target?.result) processCategoryCsvUpload(evt.target.result, category);
        };
        reader.readAsText(file);
    };

    const handleDropForCategory = (e, category) => {
        e.preventDefault();
        setDragOverCategory(null);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            if (evt.target?.result) processCategoryCsvUpload(evt.target.result, category);
        };
        reader.readAsText(file);
    };

    const engCount = institutions.filter(i => (i.category || '').toLowerCase().includes('eng')).length;
    const artsCount = institutions.filter(i => (i.category || '').toLowerCase().includes('art')).length;

    const filtered = institutions.filter(i => {
        const matchSearch = !search || (i.college_name || '').toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'all' || (categoryFilter === 'Engineering' ? (i.category || '').toLowerCase().includes('eng') : (i.category || '').toLowerCase().includes('art'));
        return matchSearch && matchCategory;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Title Card */}
            <div className="panel-toolbar-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Award size={22} color="#0284c7" /> UG &amp; PG Institution Rankings Manager
                            </h2>
                            <span style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.76rem', fontWeight: 700, border: '1px solid #7dd3fc' }}>
                                🎓 Shared Set for UG &amp; PG Applications
                            </span>
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0.35rem 0 0 0' }}>
                            Manage Engineering and Arts &amp; Science college rankings &amp; band ranges. Both UG &amp; PG degree scoring utilize this unified dataset.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={fetchInstitutions}
                        className="nav-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', fontSize: '0.84rem' }}
                    >
                        <RefreshCw size={15} /> Refresh List
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--color-card-bg)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Ranked Institutions</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-brand-primary)', marginTop: '0.2rem' }}>{institutions.length}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>UG &amp; PG Shared Pool</div>
                </div>
                <div style={{ background: 'var(--color-card-bg)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase' }}>Engineering Colleges</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>{engCount}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Band Ranges Dataset</div>
                </div>
                <div style={{ background: 'var(--color-card-bg)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a855f7', textTransform: 'uppercase' }}>Arts &amp; Science Colleges</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', marginTop: '0.2rem' }}>{artsCount}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Band Ranges Dataset</div>
                </div>
            </div>

            {/* Alert Status Banner */}
            {statusMsg.text && (
                <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    background: statusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : (statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 132, 199, 0.12)'),
                    color: statusMsg.type === 'error' ? '#ef4444' : (statusMsg.type === 'success' ? '#10b981' : '#0284c7'),
                    border: `1px solid ${statusMsg.type === 'error' ? '#fca5a5' : (statusMsg.type === 'success' ? '#6ee7b7' : '#7dd3fc')}`
                }}>
                    {statusMsg.text}
                </div>
            )}

            {/* Dual CSV Upload Cards on the Same Page */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {/* ⚙️ SECTION 1: Engineering Institutions CSV Upload */}
                <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            ⚙️ Engineering Institutions CSV Upload
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>
                            Upload CSV sheet with Engineering College Names &amp; Band Ranges. Updates Engineering records.
                        </p>
                    </div>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOverCategory('Engineering'); }}
                        onDragLeave={() => setDragOverCategory(null)}
                        onDrop={(e) => handleDropForCategory(e, 'Engineering')}
                        style={{
                            background: dragOverCategory === 'Engineering' ? 'rgba(2, 132, 199, 0.08)' : 'var(--color-bg-light)',
                            border: `2px dashed ${dragOverCategory === 'Engineering' ? '#0284c7' : 'var(--color-border)'}`,
                            borderRadius: '10px',
                            padding: '1.25rem 1rem',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Upload size={24} color="#0284c7" style={{ margin: '0 auto 0.4rem auto' }} />
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                            {uploadingCategory === 'Engineering' ? 'Uploading Engineering CSV...' : 'Select or Drag Engineering CSV File'}
                        </div>
                        <label style={{
                            background: '#0284c7',
                            color: 'white',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            marginTop: '0.6rem'
                        }}>
                            <Upload size={14} /> Upload Engineering CSV
                            <input type="file" accept=".csv, .txt" onChange={(e) => handleFileUploadForCategory(e, 'Engineering')} style={{ display: 'none' }} />
                        </label>
                        <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Format: <code>College Name, Band Range (e.g. 1-50, 51-100)</code>
                        </div>
                    </div>

                    <details style={{ background: 'var(--color-bg-light)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#0284c7' }}>
                            📋 Or Paste Engineering CSV Text
                        </summary>
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                                rows={3}
                                placeholder="College Name, Band Range&#10;IIT Madras, 1-50&#10;Anna University, 1-50"
                                value={engCsvText}
                                onChange={(e) => setEngCsvText(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'monospace' }}
                            />
                            <button
                                type="button"
                                onClick={() => processCategoryCsvUpload(engCsvText, 'Engineering')}
                                disabled={uploadingCategory === 'Engineering' || !engCsvText.trim()}
                                style={{ alignSelf: 'flex-start', background: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Submit Engineering CSV
                            </button>
                        </div>
                    </details>
                </div>

                {/* 🎨 SECTION 2: Arts & Science Institutions CSV Upload */}
                <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#a855f7', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            🎨 Arts &amp; Science Institutions CSV Upload
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>
                            Upload CSV sheet with Arts &amp; Science College Names &amp; Band Ranges. Updates Arts records.
                        </p>
                    </div>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOverCategory('Arts & Science'); }}
                        onDragLeave={() => setDragOverCategory(null)}
                        onDrop={(e) => handleDropForCategory(e, 'Arts & Science')}
                        style={{
                            background: dragOverCategory === 'Arts & Science' ? 'rgba(168, 85, 247, 0.08)' : 'var(--color-bg-light)',
                            border: `2px dashed ${dragOverCategory === 'Arts & Science' ? '#a855f7' : 'var(--color-border)'}`,
                            borderRadius: '10px',
                            padding: '1.25rem 1rem',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Upload size={24} color="#a855f7" style={{ margin: '0 auto 0.4rem auto' }} />
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                            {uploadingCategory === 'Arts & Science' ? 'Uploading Arts & Science CSV...' : 'Select or Drag Arts & Science CSV File'}
                        </div>
                        <label style={{
                            background: '#a855f7',
                            color: 'white',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            marginTop: '0.6rem'
                        }}>
                            <Upload size={14} /> Upload Arts &amp; Science CSV
                            <input type="file" accept=".csv, .txt" onChange={(e) => handleFileUploadForCategory(e, 'Arts & Science')} style={{ display: 'none' }} />
                        </label>
                        <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Format: <code>College Name, Band Range (e.g. 1-50, 51-100)</code>
                        </div>
                    </div>

                    <details style={{ background: 'var(--color-bg-light)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#a855f7' }}>
                            📋 Or Paste Arts &amp; Science CSV Text
                        </summary>
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <textarea
                                rows={3}
                                placeholder="College Name, Band Range&#10;Loyola College, 1-50&#10;Presidency College, 1-50"
                                value={artsCsvText}
                                onChange={(e) => setArtsCsvText(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'monospace' }}
                            />
                            <button
                                type="button"
                                onClick={() => processCategoryCsvUpload(artsCsvText, 'Arts & Science')}
                                disabled={uploadingCategory === 'Arts & Science' || !artsCsvText.trim()}
                                style={{ alignSelf: 'flex-start', background: '#a855f7', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Submit Arts &amp; Science CSV
                            </button>
                        </div>
                    </details>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="panel-toolbar-card" style={{ padding: '0.85rem 1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '220px' }} className="search-wrap">
                        <input
                            type="text"
                            placeholder="Search college name..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Stream Category:</label>
                        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                            <option value="all">All Streams</option>
                            <option value="Engineering">Engineering Institutions</option>
                            <option value="Arts & Science">Arts &amp; Science Institutions</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div style={{ background: 'var(--color-card-bg)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden', overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading ranked institutions...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No institution rankings match filter criteria.</div>
                ) : (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left', tableLayout: 'fixed' }}>
                            <colgroup>
                                <col style={{ width: '60px' }} />
                                <col style={{ width: 'auto' }} />
                                <col style={{ width: '200px' }} />
                                <col style={{ width: '180px' }} />
                            </colgroup>
                            <thead>
                                <tr style={{ background: 'var(--color-bg-light)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <th style={{ padding: '0.75rem 1rem', width: '60px' }}>#</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>College / Institution Name</th>
                                    <th style={{ padding: '0.75rem 1rem', width: '200px' }}>Stream Category</th>
                                    <th style={{ padding: '0.75rem 1rem', width: '180px' }}>Band Range / Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((inst, index) => {
                                    const itemIdx = (page - 1) * itemsPerPage + index + 1;
                                    const isArts = (inst.category || '').toLowerCase().includes('art');
                                    return (
                                        <tr key={inst.id || index} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s ease' }}>
                                            <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{itemIdx}</td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-main)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{inst.college_name}</td>
                                            <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.7rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.76rem',
                                                    fontWeight: 700,
                                                    background: isArts ? 'rgba(2, 132, 199, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                                                    color: isArts ? '#0284c7' : '#2563eb',
                                                    border: `1px solid ${isArts ? '#bae6fd' : '#bfdbfe'}`,
                                                    display: 'inline-block'
                                                }}>
                                                    {isArts ? '🎨 Arts & Science' : '⚙️ Engineering'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                                                {inst.band_range ? (
                                                    <span style={{ fontWeight: 700, color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', padding: '0.2rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(2, 132, 199, 0.25)', display: 'inline-block' }}>
                                                        {inst.band_range}
                                                    </span>
                                                ) : inst.nirf_rank ? (
                                                    <span style={{ fontWeight: 700, color: '#0284c7', background: 'rgba(2, 132, 199, 0.1)', padding: '0.2rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(2, 132, 199, 0.25)', display: 'inline-block' }}>#{inst.nirf_rank}</span>
                                                ) : (
                                                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Unranked</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination Bar - 140px right padding gutter to prevent chatbot widget overlap */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', paddingRight: '140px', borderTop: '1px solid var(--color-border)', fontSize: '0.84rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ color: 'var(--color-text-muted)' }}>
                                Showing {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length} colleges
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-light)', color: 'var(--color-text-main)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                                >
                                    Previous
                                </button>
                                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Page {page} of {totalPages}</span>
                                <button
                                    type="button"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-light)', color: 'var(--color-text-main)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                                >
                                    Next
                                </button>
                            </div>
                        </div >
                    </>
                )}
            </div >
        </div >
    );
};

export const AdminPage = () => {
    const { logout, isSidebarOpen, toggleSidebar } = useAuth();
    const [activeTab, setActiveTab] = useState('apps'); // 'apps' | 'dropdowns' | 'weightage'
    const [weightageCategory, setWeightageCategory] = useState('all');
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({ totalApps: 0, totalDepts: 0, totalInsts: 0 });
    const [loading, setLoading] = useState(true);
    const [banner, setBanner] = useState({ type: '', message: '' });

    // Search & Filter & Sorting
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('score'); // 'score' | 'date' | 'name'
    const [deptFilter, setDeptFilter] = useState('all');
    const [postFilter, setPostFilter] = useState('all');
    const [deptsList, setDeptsList] = useState([]);
    const [postsList, setPostsList] = useState([]);
    const [postDeptFilter, setPostDeptFilter] = useState('');
    // Candidate Modal
    const [selectedApp, setSelectedApp] = useState(null);
    const [selectedAppScore, setSelectedAppScore] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Dropdown Management State
    const [dropdownOptions, setDropdownOptions] = useState([]);
    const [optCategoryFilter, setOptCategoryFilter] = useState('all');
    const [addOptModalOpen, setAddOptModalOpen] = useState(false);
    const [newOptCategory, setNewOptCategory] = useState('department');
    const [newOptLabel, setNewOptLabel] = useState('');
    const [newOptValue, setNewOptValue] = useState('');

    // Dynamic CSV Export State
    const [exportDept, setExportDept] = useState('all');
    const [exportPost, setExportPost] = useState('all');
    const [exportFromDate, setExportFromDate] = useState('');
    const [exportToDate, setExportToDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const handleExportCSV = async () => {
        // Validation: From Date cannot be greater than To Date
        if (exportFromDate && exportToDate && new Date(exportFromDate) > new Date(exportToDate)) {
            setBanner({ type: 'error', message: 'From Date cannot be greater than To Date.' });
            return;
        }

        setIsExporting(true);
        setBanner({ type: '', message: '' });

        try {
            const params = new URLSearchParams();
            if (exportDept) params.append('department', exportDept);
            if (exportPost) params.append('post', exportPost);
            if (exportFromDate) params.append('fromDate', exportFromDate);
            if (exportToDate) params.append('toDate', exportToDate);

            const response = await fetch(`/api/applicants/export-csv?${params.toString()}`);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Export failed.' }));
                setBanner({ type: 'error', message: errData.message || 'No applicants found for the selected filters.' });
                return;
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = `Applicants_${exportDept && exportDept !== 'all' ? exportDept : 'All'}_${exportPost && exportPost !== 'all' ? exportPost.replace(/\s+/g, '_') : 'All_Posts'}.csv`;
            if (contentDisposition && contentDisposition.includes('filename=')) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) fileName = match[1];
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setBanner({ type: 'success', message: `✅ Dynamic CSV exported successfully: ${fileName}` });
        } catch (err) {
            setBanner({ type: 'error', message: 'CSV export error: ' + err.message });
        } finally {
            setIsExporting(false);
        }
    };

    // Inline Typing & Editing State
    const [inlineInputs, setInlineInputs] = useState({});
    const [editingOptId, setEditingOptId] = useState(null);
    const [editingOptLabel, setEditingOptLabel] = useState('');
    const [deleteConfirmOpt, setDeleteConfirmOpt] = useState(null);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/admin/applications');
            const data = await res.json();
            if (data.success) {
                const apps = data.applications || [];
                setApplications(apps);
            }
        } catch (err) {
            setBanner({ type: 'error', message: 'Failed to fetch staff applications.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminDropdowns = async () => {
        try {
            const res = await fetch('/api/admin/dropdowns');
            const data = await res.json();
            if (data.success) {
                const rawOpts = data.options || [];
                const seen = new Set();
                const opts = rawOpts.filter(o => {
                    const key = `${o.category}_${(o.option_value || o.option_label || '').toLowerCase()}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                setDropdownOptions(opts);

                const masterDepts = [];
                const masterPosts = [];
                try {
                    const deptRes = await fetch('/api/departments');
                    const deptData = await deptRes.json();
                    if (deptData.success) {
                        masterDepts.push(...deptData.data.map(d => d.code || d.name));
                    }
                    const postRes = await fetch('/api/departments/ALL/designations'); // generic failover
                    const postData = await postRes.json();
                    if (postData.success) {
                        masterPosts.push(...postData.data.map(d => d.name));
                    }
                } catch (e) { }

                setDeptsList(masterDepts.length ? masterDepts : ['CSE', 'ECE', 'IT', 'MECH', 'EEE', 'CIVIL']);
                setPostsList(masterPosts.length ? masterPosts : ['Assistant Professor', 'Associate Professor', 'Professor']);
            }
        } catch (err) {
            console.error('Failed to load admin dropdown options:', err);
        }
    };

    useEffect(() => {
        fetchApplications();
        fetchAdminDropdowns();
    }, []);

    useEffect(() => {
        const handleOpenCandidateEvent = (e) => {
            if (e.detail && e.detail.email) {
                setActiveTab('apps');
                openCandidateModal(e.detail.email);
            }
        };
        window.addEventListener('openCandidateModal', handleOpenCandidateEvent);
        return () => window.removeEventListener('openCandidateModal', handleOpenCandidateEvent);
    }, [applications]);

    useEffect(() => {
        if (deptFilter === 'all') {
            fetch('/api/departments/ALL/designations')
                .then(r => r.json())
                .then(d => setPostsList(d.data ? d.data.map(x => x.name) : []));
        } else {
            fetch('/api/departments/' + encodeURIComponent(deptFilter) + '/designations')
                .then(r => r.json())
                .then(d => setPostsList(d.data ? d.data.map(x => x.name) : []));
        }
    }, [deptFilter]);

    useEffect(() => {
        setStats({
            totalApps: applications.length,
            totalDepts: deptsList.length,
        });
    }, [applications, deptsList]);

    // Multi-dimensional Applicant Ranking Logic (Global, Department-wise, Designation/Post-wise, Combo)
    const sortedGlobal = [...applications].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));

    const deptMap = {};
    const postMap = {};
    const comboMap = {};

    applications.forEach((app) => {
        const dept = app.department || 'General';
        const post = app.post || 'Staff';
        const combo = `${dept} || ${post}`;

        if (!deptMap[dept]) deptMap[dept] = [];
        deptMap[dept].push(app);

        if (!postMap[post]) postMap[post] = [];
        postMap[post].push(app);

        if (!comboMap[combo]) comboMap[combo] = [];
        comboMap[combo].push(app);
    });

    Object.keys(deptMap).forEach((k) => deptMap[k].sort((a, b) => Number(b.score || 0) - Number(a.score || 0)));
    Object.keys(postMap).forEach((k) => postMap[k].sort((a, b) => Number(b.score || 0) - Number(a.score || 0)));
    Object.keys(comboMap).forEach((k) => comboMap[k].sort((a, b) => Number(b.score || 0) - Number(a.score || 0)));

    const rankedAppsList = applications.map((app) => {
        const dept = app.department || 'General';
        const post = app.post || 'Staff';
        const combo = `${dept} || ${post}`;

        const globalRank = sortedGlobal.findIndex((x) => x.email === app.email) + 1;
        const deptRank = deptMap[dept] ? deptMap[dept].findIndex((x) => x.email === app.email) + 1 : 1;
        const deptTotal = deptMap[dept] ? deptMap[dept].length : 1;

        const postRank = postMap[post] ? postMap[post].findIndex((x) => x.email === app.email) + 1 : 1;
        const postTotal = postMap[post] ? postMap[post].length : 1;

        const comboRank = comboMap[combo] ? comboMap[combo].findIndex((x) => x.email === app.email) + 1 : 1;
        const comboTotal = comboMap[combo] ? comboMap[combo].length : 1;

        return {
            ...app,
            rank: globalRank,
            globalRank,
            deptRank,
            deptTotal,
            postRank,
            postTotal,
            comboRank,
            comboTotal,
        };
    });

    // Filter & Sort applications
    const filteredApps = rankedAppsList.filter((app) => {
        const matchesSearch =
            !search ||
            (app.full_name && app.full_name.toLowerCase().includes(search.toLowerCase())) ||
            (app.email && app.email.toLowerCase().includes(search.toLowerCase())) ||
            (app.post && app.post.toLowerCase().includes(search.toLowerCase())) ||
            (app.department && app.department.toLowerCase().includes(search.toLowerCase()));

        const matchesDept =
            deptFilter === 'all' ||
            app.department === deptFilter ||
            (app.department && deptFilter && (
                app.department.toLowerCase().includes(deptFilter.toLowerCase()) ||
                deptFilter.toLowerCase().includes(app.department.toLowerCase())
            ));

        const matchesPost =
            postFilter === 'all' ||
            app.post === postFilter ||
            (app.post && postFilter && (
                app.post.toLowerCase().includes(postFilter.toLowerCase()) ||
                postFilter.toLowerCase().includes(app.post.toLowerCase())
            ));

        return matchesSearch && matchesDept && matchesPost;
    });

    const sortedApps = [...filteredApps].sort((a, b) => {
        if (sortBy === 'score') return Number(b.score || 0) - Number(a.score || 0);
        if (sortBy === 'name') return (a.full_name || '').localeCompare(b.full_name || '');
        return new Date(b.registered_at || 0) - new Date(a.registered_at || 0);
    });

    // Open Candidate Detail Modal
    const openCandidateModal = async (email) => {
        setModalLoading(true);
        setSelectedAppScore(null);
        try {
            const appObj = applications.find(a => a.email === email) || {};
            const res = await fetch(`/api/profile?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            if (data.success) {
                setSelectedApp({ ...appObj, ...data });
            }
            const scoreRes = await fetch(`/api/scoring/candidate?email=${encodeURIComponent(email)}`);
            const scoreData = await scoreRes.json();
            if (scoreData.success) {
                setSelectedAppScore(scoreData);
            }
        } catch (err) {
            setBanner({ type: 'error', message: 'Failed to fetch applicant details.' });
        } finally {
            setModalLoading(false);
        }
    };

    // Toggle Dropdown Option Active Status
    const handleToggleOpt = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/admin/dropdowns/${id}/toggle`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus }),
            });
            const data = await res.json();
            if (data.success) {
                fetchAdminDropdowns();
            }
        } catch (err) {
            console.error('Error toggling dropdown:', err);
        }
    };

    // Trigger Delete Confirmation Modal
    const handleDeleteOpt = (opt) => {
        setDeleteConfirmOpt(opt);
    };

    // Confirmed Delete Execution
    const confirmDeleteOpt = async () => {
        if (!deleteConfirmOpt) return;
        const targetId = deleteConfirmOpt.id;

        // Optimistically remove from local state
        setDropdownOptions((prev) => prev.filter((d) => d.id !== targetId));
        setDeleteConfirmOpt(null);

        try {
            const res = await fetch(`/api/admin/dropdowns/${targetId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchAdminDropdowns();
            } else {
                fetchAdminDropdowns();
            }
        } catch (err) {
            console.error('Error deleting option:', err);
            fetchAdminDropdowns();
        }
    };

    // Inline Quick-Add Typing Handler per Category
    const handleInlineAdd = async (e, category) => {
        e.preventDefault();
        let labelVal = inlineInputs[category] ? inlineInputs[category].trim() : '';
        if (!labelVal) return;

        try {
            const res = await fetch('/api/admin/dropdowns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    option_label: labelVal,
                    option_value: labelVal,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setInlineInputs({ ...inlineInputs, [category]: '' });
                fetchAdminDropdowns();
            }
        } catch (err) {
            console.error('Error adding inline option:', err);
        }
    };

    // Inline Edit Save Handler
    const handleSaveEditOpt = async (id) => {
        const newLabel = editingOptLabel.trim();
        if (!newLabel) return;

        // Optimistically update UI state immediately
        setDropdownOptions((prev) =>
            prev.map((d) => (d.id === id ? { ...d, option_label: newLabel, option_value: newLabel } : d))
        );
        setEditingOptId(null);
        setEditingOptLabel('');

        try {
            const res = await fetch(`/api/admin/dropdowns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    option_label: newLabel,
                    option_value: newLabel
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchAdminDropdowns();
            } else {
                fetchAdminDropdowns();
            }
        } catch (err) {
            console.error('Error updating option label:', err);
            fetchAdminDropdowns();
        }
    };

    // Add Option Form Submission
    const handleAddOptSubmit = async (e) => {
        e.preventDefault();
        if (!newOptLabel) return;
        try {
            const res = await fetch('/api/admin/dropdowns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: newOptCategory,
                    option_label: newOptLabel,
                    option_value: newOptValue || newOptLabel,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setAddOptModalOpen(false);
                setNewOptLabel('');
                setNewOptValue('');
                fetchAdminDropdowns();
            }
        } catch (err) {
            console.error('Error adding option:', err);
        }
    };

    const renderCategoryCardMap = (categories) => categories.map((categoryItem) => {
        const catOpts = dropdownOptions.filter((d) => d.category === categoryItem.key);

        const renderOptionRow = (opt) => (
            <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--color-bg-light)', borderRadius: '6px', border: '1px solid var(--color-border)', gap: '0.5rem' }}>
                {editingOptId === opt.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                        <input
                            type="text"
                            value={editingOptLabel}
                            onChange={(e) => setEditingOptLabel(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditOpt(opt.id);
                                if (e.key === 'Escape') setEditingOptId(null);
                            }}
                            style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #1d4ed8', background: 'var(--color-card-bg)', color: 'var(--color-text-main)' }}
                        />
                        <button type="button" onClick={() => handleSaveEditOpt(opt.id)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Check size={14} /> Save
                        </button>
                        <button type="button" onClick={() => setEditingOptId(null)} style={{ background: '#64748b', color: 'white', border: 'none', borderRadius: '4px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: opt.is_active ? 'var(--color-text-main)' : 'var(--color-text-muted)', textDecoration: opt.is_active ? 'none' : 'line-through' }}>
                                {opt.option_label}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => handleToggleOpt(opt.id, opt.is_active)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: opt.is_active ? '1px solid #86efac' : '1px solid #cbd5e1',
                                    background: opt.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                                    color: opt.is_active ? '#10b981' : '#94a3b8',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                title={opt.is_active ? 'Click to Disable this option' : 'Click to Enable this option'}
                            >
                                {opt.is_active ? <ToggleRight size={16} color="#10b981" /> : <ToggleLeft size={16} color="#94a3b8" />}
                                {opt.is_active ? 'Active' : 'Disabled'}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDeleteOpt(opt)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem' }}
                                title="Delete option"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        );

        return (
            <div key={categoryItem.key} className="form-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-brand-primary)', textTransform: 'uppercase', marginBottom: '0.3rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                    {categoryItem.title} {categoryItem.key !== 'post' && `(${catOpts.length})`}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{categoryItem.desc}</p>

                {categoryItem.key !== 'post' ? (
                    <form onSubmit={(e) => handleInlineAdd(e, categoryItem.key)} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
                        <input
                            type="text"
                            placeholder={`+ Type new option...`}
                            value={inlineInputs[categoryItem.key] || ''}
                            onChange={(e) => setInlineInputs({ ...inlineInputs, [categoryItem.key]: e.target.value })}
                            style={{
                                flex: 1, padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem', background: 'var(--color-bg-light)', color: 'var(--color-text-main)'
                            }}
                        />
                        <button type="submit" className="nav-btn primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Plus size={14} /> Add
                        </button>
                    </form>
                ) : (
                    <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{ marginBottom: '1rem', background: 'var(--color-bg-light)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '0.4rem' }}>Filter by Department:</label>
                            <select
                                value={postDeptFilter}
                                onChange={(e) => setPostDeptFilter(e.target.value)}
                                style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #94a3b8', fontSize: '0.85rem' }}
                            >
                                <option value="">-- No Department Filter (Show Global Defaults) --</option>
                                {dropdownOptions.filter(d => d.category === 'department').map(d => (
                                    <option key={d.id} value={d.id}>{d.option_label || d.option_value}</option>
                                ))}
                            </select>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const label = inlineInputs['post'];
                            if (!label) return;
                            fetch('/api/admin/dropdowns', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ category: 'post', option_label: label, option_value: label, parent_id: postDeptFilter || null })
                            }).then(r => r.json()).then(d => { if (d.success) { fetchAdminDropdowns(); setInlineInputs({ ...inlineInputs, post: '' }); } });
                        }} style={{ display: 'flex', gap: '0.4rem' }}>
                            <input
                                type="text"
                                placeholder={postDeptFilter ? `+ Type new post & press Enter...` : `+ Type new default post...`}
                                value={inlineInputs['post'] || ''}
                                onChange={(e) => setInlineInputs({ ...inlineInputs, post: e.target.value })}
                                style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem', background: 'var(--color-bg-light)', color: 'var(--color-text-main)' }}
                            />
                            <button type="submit" className="nav-btn primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Plus size={14} /> Add
                            </button>
                        </form>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                    {catOpts.length === 0 ? (
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>No options defined yet.</div>
                    ) : categoryItem.key === 'post' ? (
                        <>
                            {postDeptFilter ? (
                                dropdownOptions.filter(d => d.category === 'department' && String(d.id) === String(postDeptFilter)).map(dept => {
                                    const deptPosts = catOpts.filter(p => String(p.parent_id) === String(dept.id));
                                    const defaultPosts = catOpts.filter(p => !p.parent_id);
                                    if (deptPosts.length === 0) {
                                        return (
                                            <div key={`empty-${dept.id}`} style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', marginBottom: '0.6rem', background: 'var(--color-bg-light)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', borderLeft: '3px solid #0284c7' }}>
                                                    ℹ️ No custom posts defined explicitly for <strong>{dept.option_label || dept.option_value}</strong>. Using <strong>Global Default Posts</strong>:
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {defaultPosts.map(renderOptionRow)}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={dept.id} style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-brand-primary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                                🏢 Custom Posts for {dept.option_label || dept.option_value}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.8rem', borderLeft: '2px solid var(--color-brand-primary)' }}>
                                                {deptPosts.map(renderOptionRow)}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                (() => {
                                    const defaultPosts = catOpts.filter(p => !p.parent_id);
                                    if (defaultPosts.length === 0) return (
                                        <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', padding: '0.5rem', textAlign: 'center' }}>No default posts defined.</div>
                                    );
                                    return (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {defaultPosts.map(renderOptionRow)}
                                            </div>
                                        </div>
                                    );
                                })()
                            )}
                        </>
                    ) : (
                        catOpts.map(renderOptionRow)
                    )}
                </div>
            </div>
        );
    });

    return (
        <div className="profile-page-wrapper">
            {/* Left Fixed Vertical Sidebar */}
            <aside className={`profile-sidebar ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
                <div>
                    {/* Admin Profile Header Badge */}
                    <div className="profile-avatar-wrap">
                        <div style={{ width: '100%', display: 'flex', justifyContent: isSidebarOpen ? 'flex-end' : 'center', marginBottom: '0.4rem' }}>
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                className="sidebar-hamburger-btn"
                                title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                            >
                                <Menu size={18} />
                            </button>
                        </div>
                        <div className="profile-avatar-placeholder">
                            <ShieldCheck size={40} />
                        </div>
                        <h3 className="profile-user-name">Admin Portal</h3>
                        <span className="profile-role-badge">RECRUITMENT ADMIN</span>
                    </div>

                    {/* Quick Stats Widget - Positioned Above Navigation Menu */}
                    <div style={{ marginBottom: '1rem', padding: '0.75rem 0.25rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div className="admin-stat-box" style={{ marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Total Applications</span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>{stats.totalApps}</span>
                        </div>
                        <div className="admin-stat-box">
                            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Active Departments</span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>{stats.totalDepts}</span>
                        </div>
                    </div>

                    {/* Vertical Navigation Menu */}
                    <div className="sidebar-menu">
                        <button
                            type="button"
                            className={`sidebar-menu-item ${activeTab === 'apps' ? 'active' : ''}`}
                            onClick={() => setActiveTab('apps')}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                                <Users size={18} /> Staff Applications
                            </span>
                            <span className="admin-nav-badge">{filteredApps.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`sidebar-menu-item ${activeTab === 'dropdowns' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dropdowns')}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                                <Settings size={18} /> Core Dropdowns
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`sidebar-menu-item ${activeTab === 'specializations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('specializations')}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                                <BookOpen size={18} /> PG Specializations
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`sidebar-menu-item ${activeTab === 'institutions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('institutions')}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                                <Award size={18} /> Institution Rankings
                            </span>
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <button
                                type="button"
                                className={`sidebar-menu-item ${activeTab === 'weightage' ? 'active' : ''}`}
                                onClick={() => setActiveTab('weightage')}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                                    <Sliders size={18} /> Weightage &amp; Scoring
                                </span>
                            </button>

                            {activeTab === 'weightage' && (
                                <div className="sidebar-sub-division-list">
                                    {[
                                        { id: 'all', label: 'All Scoring Parameters' },
                                        { id: 'academics', label: 'Academic Qualifications' },
                                        { id: 'phd', label: 'Ph.D. & Research' },
                                        { id: 'experience', label: 'Experience & Certifications' },
                                        { id: 'active', label: 'Active Weightage Rules' }
                                    ].map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="sidebar-sub-item"
                                            onClick={() => {
                                                setActiveTab('weightage');
                                                setWeightageCategory(sub.id);
                                                setTimeout(() => {
                                                    const el = document.getElementById('weightage-config-container');
                                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }, 100);
                                            }}
                                        >
                                            <span className="sidebar-sub-bullet">•</span>
                                            <span>{sub.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Solid Red Logout Button */}
                <button type="button" className="sidebar-logout-btn" onClick={logout}>
                    <LogOut size={18} /> Logout Admin
                </button>
            </aside>

            {/* Main Content Area */}
            <main className={`profile-main-content ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
                <Banner type={banner.type} message={banner.message} />

                {/* TAB 1: Applications Viewer */}
                {
                    activeTab === 'apps' && (
                        <div>
                            {/* Search and Filters Card Container */}
                            <div className="panel-toolbar-card">
                                <div className="panel-toolbar">
                                    <div className="search-wrap">
                                        <input
                                            type="text"
                                            placeholder="Search by candidate name, email, department, or post..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>

                                    <div className="filter-group">
                                        <label className="filter-label">Sort By:</label>
                                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                            <option value="score">🏆 Rank: Highest Score First</option>
                                            <option value="date">📅 Date Registered (Newest)</option>
                                            <option value="name">👤 Name (A - Z)</option>
                                        </select>
                                    </div>

                                    <div className="filter-group">
                                        <label className="filter-label">Department:</label>
                                        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                                            <option value="all">All Departments ({deptsList.length})</option>
                                            {deptsList.map((d, i) => (
                                                <option key={i} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="filter-group">
                                        <label className="filter-label">Designation / Post Call:</label>
                                        <select value={postFilter} onChange={(e) => setPostFilter(e.target.value)}>
                                            <option value="all">All Designations ({postsList.length})</option>
                                            {postsList.map((p, i) => (
                                                <option key={i} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic CSV Export Toolbar Panel */}
                            <div className="panel-toolbar-card" style={{ marginBottom: '1rem', padding: '1.1rem 1.25rem', border: '1px solid #7dd3fc', background: 'rgba(2, 132, 199, 0.03)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Download size={18} color="#0284c7" /> Dynamic Database Applicant CSV Export
                                    </h3>
                                    <span style={{ fontSize: '0.76rem', color: '#0284c7', background: 'rgba(2, 132, 199, 0.12)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700, border: '1px solid #7dd3fc' }}>
                                        📊 Database Source of Truth
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem', alignItems: 'end' }}>
                                    <div className="filter-group" style={{ margin: 0 }}>
                                        <label className="filter-label" style={{ fontWeight: 700 }}>Department Filter:</label>
                                        <select value={exportDept} onChange={(e) => setExportDept(e.target.value)} style={{ width: '100%', height: '38px' }}>
                                            <option value="all">All Departments ({deptsList.length})</option>
                                            {deptsList.map((d, i) => (
                                                <option key={i} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="filter-group" style={{ margin: 0 }}>
                                        <label className="filter-label" style={{ fontWeight: 700 }}>Designation Filter:</label>
                                        <select value={exportPost} onChange={(e) => setExportPost(e.target.value)} style={{ width: '100%', height: '38px' }}>
                                            <option value="all">All Designations ({postsList.length})</option>
                                            {postsList.map((p, i) => (
                                                <option key={i} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="filter-group" style={{ margin: 0 }}>
                                        <label className="filter-label" style={{ fontWeight: 700 }}>From Date:</label>
                                        <input
                                            type="date"
                                            value={exportFromDate}
                                            onChange={(e) => setExportFromDate(e.target.value)}
                                            style={{ width: '100%', height: '38px', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem', background: 'var(--color-card-bg)', color: 'var(--color-text-main)' }}
                                        />
                                    </div>

                                    <div className="filter-group" style={{ margin: 0 }}>
                                        <label className="filter-label" style={{ fontWeight: 700 }}>To Date:</label>
                                        <input
                                            type="date"
                                            value={exportToDate}
                                            onChange={(e) => setExportToDate(e.target.value)}
                                            style={{ width: '100%', height: '38px', padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.85rem', background: 'var(--color-card-bg)', color: 'var(--color-text-main)' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button
                                            type="button"
                                            onClick={handleExportCSV}
                                            disabled={isExporting}
                                            className="nav-btn primary"
                                            style={{ flex: 1, height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.86rem', whiteSpace: 'nowrap' }}
                                        >
                                            <Download size={16} /> {isExporting ? 'Generating CSV...' : 'Export CSV'}
                                        </button>
                                        {(exportFromDate || exportToDate || exportDept !== 'all' || exportPost !== 'all') && (
                                            <button
                                                type="button"
                                                onClick={() => { setExportDept('all'); setExportPost('all'); setExportFromDate(''); setExportToDate(''); }}
                                                className="nav-btn"
                                                style={{ height: '38px', padding: '0 0.65rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
                                                title="Reset Export Filters"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Filter Summary Banner */}
                            <div style={{ background: 'var(--color-card-bg)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                <div>
                                    <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>Filtered View: </span>
                                    <span style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                                        {deptFilter === 'all' ? 'All Departments' : `Dept: ${deptFilter}`}
                                    </span>
                                    <span style={{ color: 'var(--color-text-muted)', margin: '0 0.5rem' }}>•</span>
                                    <span style={{ color: '#0284c7', fontWeight: 600 }}>
                                        {postFilter === 'all' ? 'All Designations' : `Post: ${postFilter}`}
                                    </span>
                                    <span style={{ color: 'var(--color-text-muted)', margin: '0 0.5rem' }}>•</span>
                                    <span style={{ color: 'var(--color-text-muted)' }}>
                                        Found <strong>{sortedApps.length}</strong> applicant(s)
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                    Sorted by: <strong>{sortBy === 'score' ? 'Score & Ranks' : sortBy === 'name' ? 'Name A-Z' : 'Registration Date'}</strong>
                                </span>
                            </div>

                            <div className="table-card">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Candidate Ranks &amp; Score</th>
                                            <th>Applicant</th>
                                            <th>Department</th>
                                            <th>Post Applied</th>
                                            <th>Mobile</th>
                                            <th>Registration Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading staff applications...</td>
                                            </tr>
                                        ) : sortedApps.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                                    No staff applications found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedApps.map((app) => (
                                                <tr key={app.user_id}>
                                                    <td>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span
                                                                    style={{
                                                                        fontSize: '0.78rem',
                                                                        fontWeight: '800',
                                                                        padding: '0.2rem 0.5rem',
                                                                        borderRadius: '10px',
                                                                        background: app.globalRank === 1 ? '#fef08a' : app.globalRank === 2 ? '#e2e8f0' : app.globalRank === 3 ? '#ffedd5' : '#f1f5f9',
                                                                        color: app.globalRank === 1 ? '#854d0e' : app.globalRank === 2 ? '#334155' : app.globalRank === 3 ? '#9a3412' : '#475569',
                                                                        border: '1px solid #cbd5e1'
                                                                    }}
                                                                >
                                                                    🏆 Global #{app.globalRank}
                                                                </span>
                                                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>
                                                                    {app.score || 0} pts
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '0.72rem', background: 'rgba(29, 78, 216, 0.15)', color: 'var(--color-brand-primary)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600, border: '1px solid rgba(29, 78, 216, 0.25)' }}>
                                                                    🏢 Dept Rank: #{app.deptRank}/{app.deptTotal}
                                                                </span>
                                                                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                                                    💼 Post Rank: #{app.postRank}/{app.postTotal}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{app.full_name || 'Incomplete Profile'}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{app.email}</div>
                                                    </td>
                                                    <td>
                                                        <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(29, 78, 216, 0.15)', color: 'var(--color-brand-primary)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(29, 78, 216, 0.25)' }}>
                                                            {app.department || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{app.post || 'N/A'}</span>
                                                    </td>
                                                    <td style={{ color: 'var(--color-text-main)' }}>{app.phone || 'N/A'}</td>
                                                    <td style={{ color: 'var(--color-text-main)' }}>{app.registered_at ? app.registered_at.substring(0, 10) : 'N/A'}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => openCandidateModal(app.email)}
                                                            className="nav-btn primary"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {/* TAB 2: Core Dropdown Options Manager */}
                {
                    activeTab === 'dropdowns' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Core Dropdowns Manager</h3>
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Manage overarching departments, posts, and general job call criteria.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAddOptModalOpen(true)}
                                    className="nav-btn primary"
                                >
                                    <Plus size={16} /> Add Dropdown Option
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {renderCategoryCardMap([
                                    { key: 'department', title: '🏢 Departments', desc: 'Active academic & administrative departments' },
                                    { key: 'post', title: '💼 Posts / Designations', desc: 'Faculty & staff designations' },
                                    { key: 'phd_status', title: '📜 Ph.D Statuses', desc: 'Ph.D completion states' },
                                ])}
                            </div>
                        </div>
                    )
                }

                {/* TAB 3: PG Specializations */}
                {
                    activeTab === 'specializations' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>PG Specializations Manager</h3>
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Manage department-wise PG specialization options for applicant profiles.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAddOptModalOpen(true)}
                                    className="nav-btn primary"
                                >
                                    <Plus size={16} /> Add Domain Option
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {renderCategoryCardMap([
                                    { key: 'pg_domain_ece', title: '📡 ECE PG Specializations', desc: 'Embedded Systems, VLSI Design, Communication Systems, etc.' },
                                    { key: 'pg_domain_cse', title: '💻 CSE / IT PG Specializations', desc: 'Computational Intelligence, AI, Blockchain, Full Stack, etc.' },
                                    { key: 'pg_domain_eee', title: '⚡ EEE PG Specializations', desc: 'Power Electronics, Power Systems, EV Tech, etc.' },
                                    { key: 'pg_domain_mech', title: '⚙️ MECH PG Specializations', desc: 'CAD / CAM, Thermal Engineering, Mechatronics, etc.' },
                                    { key: 'pg_domain_civil', title: '🏗️ CIVIL PG Specializations', desc: 'Structural, Environmental, Construction Management, etc.' },
                                ])}
                            </div>
                        </div>
                    )
                }

                {activeTab === 'weightage' && <WeightageConfig initialCategory={weightageCategory} />}

                {activeTab === 'institutions' && <InstitutionRankingsManager />}
            </main >

            {/* MODAL: Candidate Detail View */}
            {
                selectedApp && (
                    <div className="modal-backdrop">
                        <div className="modal-card modal-lg">
                            <div className="modal-header">
                                <h2>Candidate Full Application Details</h2>
                                <button type="button" className="modal-close" onClick={() => setSelectedApp(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* Candidate Multi-Rank Breakdown Badges - Theme Aware */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div style={{ background: 'var(--color-bg-light)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', borderTop: '3px solid #1d4ed8' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.4px' }}>OVERALL GLOBAL RANK</div>
                                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '0.2rem' }}>
                                            Rank #{selectedApp.globalRank || selectedApp.rank || 1}
                                        </div>
                                    </div>
                                    <div style={{ background: 'var(--color-bg-light)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', borderTop: '3px solid #2563eb' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.4px' }}>DEPT RANK ({selectedApp.department || 'N/A'})</div>
                                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                                            Rank #{selectedApp.deptRank || 1} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>of {selectedApp.deptTotal || 1}</span>
                                        </div>
                                    </div>
                                    <div style={{ background: 'var(--color-bg-light)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', borderTop: '3px solid #3b82f6' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.4px' }}>DESIGNATION RANK ({selectedApp.post || 'N/A'})</div>
                                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                                            Rank #{selectedApp.postRank || 1} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>of {selectedApp.postTotal || 1}</span>
                                        </div>
                                    </div>
                                    <div style={{ background: 'var(--color-bg-light)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', borderTop: '3px solid #0284c7' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.4px' }}>POSITION CALL RANK</div>
                                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                                            Rank #{selectedApp.comboRank || 1} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>of {selectedApp.comboTotal || 1}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Candidate Evaluated Score & Rank Banner - Theme Aware */}
                                {selectedAppScore && (
                                    <div
                                        style={{
                                            padding: '1rem 1.25rem',
                                            borderRadius: '8px',
                                            marginBottom: '1.25rem',
                                            background: 'var(--color-card-bg)',
                                            border: '1px solid var(--color-border)',
                                            borderLeft: '4px solid #1d4ed8'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                Automated Scoring Engine Evaluation
                                            </h3>
                                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                                                Score: {selectedAppScore.total || 0} / 100 pts
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                                            {(selectedAppScore.breakdown || []).map((b, idx) => (
                                                <div key={idx} style={{ padding: '0.45rem 0.65rem', background: 'var(--color-bg-light)', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{b.parameter_name}:</span>
                                                    <span style={{ fontWeight: 800, color: b.score > 0 ? '#38bdf8' : 'var(--color-text-muted)' }}>+{b.score} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Personal Info */}
                                <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                                    👤 Personal & Contact Details
                                </h4>
                                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                    {selectedApp.personal?.photo_path && (
                                        <img
                                            src={selectedApp.personal.photo_path}
                                            alt="Candidate"
                                            style={{ width: '110px', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
                                        />
                                    )}
                                    <div style={{ flex: 1 }} className="detail-grid">
                                        <div className="detail-item">
                                            <div className="detail-label">Full Name</div>
                                            <div className="detail-value">{selectedApp.personal?.full_name || 'N/A'}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Post Applied</div>
                                            <div className="detail-value">{selectedApp.personal?.post || 'N/A'}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Email</div>
                                            <div className="detail-value">{selectedApp.personal?.user_email || 'N/A'}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Phone / WhatsApp</div>
                                            <div className="detail-value">{selectedApp.personal?.phone || 'N/A'} {selectedApp.personal?.whatsapp ? `/ ${selectedApp.personal.whatsapp}` : ''}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Date of Birth / Age</div>
                                            <div className="detail-value">
                                                {selectedApp.personal?.dob ? String(selectedApp.personal.dob).substring(0, 10) : 'N/A'}{' '}
                                                {selectedApp.personal?.age ? `(${selectedApp.personal.age} yrs)` : ''}
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Gender / Father's Name</div>
                                            <div className="detail-value">{selectedApp.personal?.gender || 'N/A'} {selectedApp.personal?.father_name ? `/ ${selectedApp.personal.father_name}` : ''}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Community / Native Place</div>
                                            <div className="detail-value">{selectedApp.personal?.community || 'N/A'} {selectedApp.personal?.native_place ? `/ ${selectedApp.personal.native_place}` : ''}</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">Applied Date</div>
                                            <div className="detail-value">
                                                {selectedApp.personal?.applied_date ? String(selectedApp.personal.applied_date).substring(0, 10) : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Educational Qualifications */}
                                <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                                    🎓 Educational Qualifications
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {(selectedApp.education || []).length === 0 ? (
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No educational records submitted.</p>
                                    ) : (
                                        (selectedApp.education || []).map((e, idx) => (
                                            <div key={idx} style={{ padding: '0.65rem 0.85rem', background: 'var(--color-bg-light)', borderRadius: '8px', fontSize: '0.88rem', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <div>
                                                    <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#38bdf8', marginRight: '0.5rem' }}>[{e.qual_type || 'QUAL'}]:</span>
                                                    <strong style={{ color: 'var(--color-text-main)' }}>{e.degree || e.qual_type}</strong> — Score: <span style={{ fontWeight: 700, color: '#10b981' }}>{e.percentage}%</span>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                                                        Institution: {e.institution_name || 'N/A'} | Medium: {e.medium || 'English'} | Year: {e.year_of_passing || 'N/A'}
                                                    </div>
                                                </div>
                                                {e.cert_path && (
                                                    <a href={e.cert_path} target="_blank" rel="noreferrer" style={{ padding: '0.3rem 0.6rem', background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                        📄 View Certificate &rarr;
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Research & Ph.D Details */}
                                <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                                    🔬 Ph.D & Research Contributions
                                </h4>
                                <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
                                    <div className="detail-item">
                                        <div className="detail-label">Ph.D Status</div>
                                        <div className="detail-value">{selectedApp.phd_details?.phd_status || (selectedApp.personal?.phd_status) || 'N/A'}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Awards Received</div>
                                        <div className="detail-value">{selectedApp.phd_details?.no_of_awards ?? 0}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Funded Projects</div>
                                        <div className="detail-value">{selectedApp.phd_details?.no_of_funded_projects ?? 0}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Funded Consultancy</div>
                                        <div className="detail-value">{selectedApp.phd_details?.no_of_funded_consultancy ?? 0}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Patents Granted/Filed</div>
                                        <div className="detail-value">{selectedApp.phd_details?.patents ?? 0}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Publications (SCI/Scopus)</div>
                                        <div className="detail-value">{selectedApp.phd_details?.publications ?? 0}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Guided Ph.D Scholars</div>
                                        <div className="detail-value">{selectedApp.phd_details?.guided_phd_scholars ?? 0}</div>
                                    </div>
                                </div>

                                {/* Work Experience */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                                    <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>💼 Work Experience</h4>
                                    {selectedApp.experience && selectedApp.experience.length > 0 && (
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(2, 132, 199, 0.2)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                                            Total Exp: {selectedApp.experience[0]?.is_fresher === 1 ? 'Fresher (0 Yrs)' : `${selectedApp.experience.map(e => e.total_duration).filter(Boolean).join(' + ') || 'Recorded'}`}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                                    {(selectedApp.experience || []).length === 0 || (selectedApp.experience.length === 1 && selectedApp.experience[0].is_fresher === 1) ? (
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Fresher Candidate (No prior work experience recorded).</p>
                                    ) : (
                                        selectedApp.experience.map((ex, idx) => (
                                            <div key={idx} style={{ padding: '0.6rem 0.8rem', background: 'var(--color-bg-light)', borderRadius: '6px', fontSize: '0.88rem', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong style={{ color: 'var(--color-text-main)' }}>{ex.designation}</strong> at <span style={{ color: 'var(--color-text-main)' }}>{ex.org_name}</span> ({ex.exp_type})
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                                                        Period: {ex.from_date ? String(ex.from_date).substring(0, 10) : 'N/A'} to {ex.to_date ? String(ex.to_date).substring(0, 10) : 'Present'}
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem' }}>
                                                    {ex.total_duration || 'Duration N/A'}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Certifications & NPTEL */}
                                <h4 style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                                    📜 Certifications & NPTEL Courses
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                                    {(selectedApp.certifications || []).length === 0 ? (
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No certifications or NPTEL course records submitted.</p>
                                    ) : (
                                        selectedApp.certifications.map((c, idx) => (
                                            <div key={idx} style={{ padding: '0.6rem 0.8rem', background: 'var(--color-bg-light)', borderRadius: '6px', fontSize: '0.88rem', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong style={{ color: 'var(--color-text-main)' }}>{c.title}</strong> {c.category ? `(${c.category})` : ''}
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                                                        Org: {c.organization || 'N/A'} | Year: {c.year || 'N/A'} {c.score ? `| Score: ${c.score}` : ''}
                                                    </div>
                                                </div>
                                                {c.cert_doc && (
                                                    <a href={c.cert_doc} target="_blank" rel="noreferrer" style={{ padding: '0.3rem 0.6rem', background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                        📄 View Document &rarr;
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const origTitle = document.title;
                                            const name = selectedApp.personal?.full_name ? selectedApp.personal.full_name.trim().replace(/\s+/g, '_') : 'Candidate';
                                            document.title = `Application_Form_${name}`;
                                            window.print();
                                            setTimeout(() => { document.title = origTitle; }, 1000);
                                        }}
                                        className="nav-btn primary"
                                    >
                                        <Download size={16} /> Download Application as PDF
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Printable PDF Layout rendered off-screen for window.print() */}
                        <PrintableApplicationForm application={selectedApp} score={selectedAppScore} />
                    </div>
                )
            }

            {/* MODAL: Add Dropdown Option */}
            {
                addOptModalOpen && (
                    <div className="modal-backdrop">
                        <div className="modal-card">
                            <div className="modal-header">
                                <h2>Add New Dropdown Option</h2>
                                <button type="button" className="modal-close" onClick={() => setAddOptModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAddOptSubmit}>
                                    <div className="field">
                                        <label>Dropdown Category</label>
                                        <select value={newOptCategory} onChange={(e) => setNewOptCategory(e.target.value)}>
                                            <option value="pg_domain">🎓 PG Specialization Domains</option>
                                            <option value="department">🏢 Departments</option>
                                            <option value="post">💼 Posts / Designations</option>
                                            <option value="phd_status">📜 Ph.D Statuses</option>
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label>Option Display Label</label>
                                        <input
                                            type="text"
                                            value={newOptLabel}
                                            onChange={(e) => setNewOptLabel(e.target.value)}
                                            placeholder="e.g. Artificial Intelligence & Data Science"
                                            required
                                        />
                                    </div>
                                    <div className="field">
                                        <label>Option Code / Value (Optional)</label>
                                        <input
                                            type="text"
                                            value={newOptValue}
                                            onChange={(e) => setNewOptValue(e.target.value)}
                                            placeholder="e.g. AIDS"
                                        />
                                    </div>
                                    <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>
                                        Save Dropdown Option
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* MODAL: Delete Confirmation Popup Tab */}
            {
                deleteConfirmOpt && (
                    <div className="modal-backdrop" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="modal-card" style={{ maxWidth: '400px', width: '90%', padding: '1.5rem', textAlign: 'center', borderRadius: '12px', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                <Trash2 size={24} />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                                Delete Dropdown Option?
                            </h3>
                            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                                Are you sure you want to delete <strong style={{ color: 'var(--color-brand-primary)' }}>"{deleteConfirmOpt.option_label}"</strong>? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirmOpt(null)}
                                    className="nav-btn"
                                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.88rem', background: 'var(--color-bg-light)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDeleteOpt}
                                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.88rem', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
