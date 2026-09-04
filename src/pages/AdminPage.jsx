import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Banner';
import { Search, Eye, Plus, Trash2, CheckCircle, XCircle, Download, X, Settings, Users, Sliders, Edit2, Check, ToggleLeft, ToggleRight, ShieldCheck, LogOut } from 'lucide-react';
import { WeightageConfig } from '../components/WeightageConfig';
import { PrintableApplicationForm } from '../components/PrintableApplicationForm';

export const AdminPage = () => {
    const { logout } = useAuth();
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
                const opts = data.options || [];
                setDropdownOptions(opts);

                const masterDepts = opts
                    .filter((d) => d.category === 'department' && d.is_active !== 0)
                    .map((d) => d.option_label || d.option_value);

                const masterPosts = opts
                    .filter((d) => d.category === 'post' && d.is_active !== 0)
                    .map((d) => d.option_label || d.option_value);

                setDeptsList(masterDepts);
                setPostsList(masterPosts);
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

    return (
        <div className="profile-page-wrapper">
            {/* Left Fixed Vertical Sidebar */}
            <aside className="profile-sidebar">
                <div>
                    {/* Admin Profile Header Badge */}
                    <div className="profile-avatar-wrap">
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
                                <Settings size={18} /> Dropdown Manager
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
            <main className="profile-main-content">
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

                {/* TAB 2: Dropdown Options Manager & Position Call Control */}
                {
                    activeTab === 'dropdowns' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>System Dropdowns &amp; Job Calls Manager</h3>
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                        Manage active recruitment job calls, department-wise PG specialization domains, posts, and departments.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAddOptModalOpen(true)}
                                    className="nav-btn primary"
                                >
                                    <Plus size={16} /> Add Dropdown Option / Job Call
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {[
                                    { key: 'pg_domain_ece', title: '📡 ECE PG Specializations', desc: 'Embedded Systems, VLSI Design, Communication Systems, etc.' },
                                    { key: 'pg_domain_cse', title: '💻 CSE / IT PG Specializations', desc: 'Computational Intelligence, AI, Blockchain, Full Stack, etc.' },
                                    { key: 'pg_domain_eee', title: '⚡ EEE PG Specializations', desc: 'Power Electronics, Power Systems, EV Tech, etc.' },
                                    { key: 'pg_domain_mech', title: '⚙️ MECH PG Specializations', desc: 'CAD / CAM, Thermal Engineering, Mechatronics, etc.' },
                                    { key: 'pg_domain_civil', title: '🏗️ CIVIL PG Specializations', desc: 'Structural, Environmental, Construction Management, etc.' },
                                    { key: 'department', title: '🏢 Departments', desc: 'Active academic & administrative departments' },
                                    { key: 'post', title: '💼 Posts / Designations', desc: 'Faculty & staff designations' },
                                    { key: 'phd_status', title: '📜 Ph.D Statuses', desc: 'Ph.D completion states' },
                                ].map((categoryItem) => {
                                    const catOpts = dropdownOptions.filter((d) => d.category === categoryItem.key);
                                    return (
                                        <div key={categoryItem.key} className="form-card" style={{ padding: '1.25rem' }}>
                                            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-brand-primary)', textTransform: 'uppercase', marginBottom: '0.3rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }}>
                                                {categoryItem.title} ({catOpts.length})
                                            </h4>
                                            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{categoryItem.desc}</p>

                                            {/* Inline Quick-Add Typing Form */}
                                            <form onSubmit={(e) => handleInlineAdd(e, categoryItem.key)} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder={`+ Type new option...`}
                                                    value={inlineInputs[categoryItem.key] || ''}
                                                    onChange={(e) => setInlineInputs({ ...inlineInputs, [categoryItem.key]: e.target.value })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.45rem 0.75rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--color-border)',
                                                        fontSize: '0.85rem',
                                                        background: 'var(--color-bg-light)',
                                                        color: 'var(--color-text-main)'
                                                    }}
                                                />
                                                <button
                                                    type="submit"
                                                    className="nav-btn primary"
                                                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                >
                                                    <Plus size={14} /> Add
                                                </button>
                                            </form>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                                                {catOpts.length === 0 ? (
                                                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>No options defined yet.</div>
                                                ) : (
                                                    catOpts.map((opt) => (
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
                                                                        {/* Modern Labeled Toggle Switch Button */}
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
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                }

                {activeTab === 'weightage' && <WeightageConfig initialCategory={weightageCategory} />}
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
