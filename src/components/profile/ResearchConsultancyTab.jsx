import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from '../Banner';
import { BookOpen, Briefcase, Plus, Trash2, Save, ArrowLeft, ArrowRight, FileText, X, Upload, Edit3, Award, CheckCircle } from 'lucide-react';

export const ResearchConsultancyTab = ({ profileData, isSubmitted, sectionConfig, onSaveSuccess, onNext, onPrev }) => {
    const { user } = useAuth();
    const [banner, setBanner] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    const hasLoadedRef = useRef(false);
    const isDirtyRef = useRef(false);
    const loadedEmailRef = useRef('');

    const [projects, setProjects] = useState([]);
    const [consultancies, setConsultancies] = useState([]);
    const [journals, setJournals] = useState([]);

    // Modal State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProjectIndex, setEditingProjectIndex] = useState(null);
    const [projectForm, setProjectForm] = useState(getInitialProjectForm(user));

    const [isConsultancyModalOpen, setIsConsultancyModalOpen] = useState(false);
    const [editingConsultancyIndex, setEditingConsultancyIndex] = useState(null);
    const [consultancyForm, setConsultancyForm] = useState(getInitialConsultancyForm(user));

    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [editingJournalIndex, setEditingJournalIndex] = useState(null);
    const [journalForm, setJournalForm] = useState(getInitialJournalForm());

    const [coPiInput, setCoPiInput] = useState('');

    function getInitialProjectForm(currentUser) {
        return {
            pi_name: currentUser?.name || currentUser?.full_name || '',
            co_pi_names: '',
            students_involved: 'No',
            project_title: '',
            industry: '',
            funding_agency: '',
            organization_name: '',
            from_date: '',
            to_date: '',
            amount: '',
            status: 'Ongoing',
            proof_doc: '',
            yearly_report_doc: '',
            releases: []
        };
    }

    function getInitialConsultancyForm(currentUser) {
        return {
            pi_name: currentUser?.name || currentUser?.full_name || '',
            co_pi_names: '',
            students_involved: 'No',
            consultancy_title: '',
            industry: '',
            client_org: '',
            organization_name: '',
            from_date: '',
            to_date: '',
            amount: '',
            status: 'Ongoing',
            proof_doc: '',
            yearly_report_doc: '',
            releases: []
        };
    }

    function getInitialJournalForm() {
        return {
            journal_type: 'SCI',
            journal_name: '',
            publisher: '',
            paper_title: '',
            vol_no: '',
            doi: '',
            publication_date: '',
            impact_factor: '',
            proof_doc: ''
        };
    }

    useEffect(() => {
        if (user?.email && loadedEmailRef.current !== user.email) {
            loadedEmailRef.current = user.email;
            hasLoadedRef.current = false;
            isDirtyRef.current = false;
        }

        if (profileData && !hasLoadedRef.current && !isDirtyRef.current) {
            if (profileData.research_projects?.length > 0) {
                setProjects(profileData.research_projects.map((p) => ({
                    pi_name: p.pi_name || '',
                    co_pi_names: p.co_pi_names || '',
                    students_involved: p.students_involved || 'No',
                    project_title: p.project_title || '',
                    industry: p.industry || '',
                    funding_agency: p.funding_agency || '',
                    organization_name: p.organization_name || p.funding_agency || '',
                    from_date: p.from_date ? p.from_date.split('T')[0] : '',
                    to_date: p.to_date ? p.to_date.split('T')[0] : '',
                    amount: p.amount || '',
                    year: p.year || new Date().getFullYear(),
                    status: p.status || 'Ongoing',
                    proof_doc: p.proof_doc || '',
                    yearly_report_doc: p.yearly_report_doc || '',
                    releases: p.releases || []
                })));
            }

            if (profileData.funded_consultancy?.length > 0) {
                setConsultancies(profileData.funded_consultancy.map((c) => ({
                    pi_name: c.pi_name || '',
                    co_pi_names: c.co_pi_names || '',
                    students_involved: c.students_involved || 'No',
                    consultancy_title: c.consultancy_title || '',
                    industry: c.industry || '',
                    client_org: c.client_org || '',
                    organization_name: c.organization_name || c.client_org || '',
                    from_date: c.from_date ? c.from_date.split('T')[0] : '',
                    to_date: c.to_date ? c.to_date.split('T')[0] : '',
                    amount: c.amount || '',
                    year: c.year || new Date().getFullYear(),
                    status: c.status || 'Ongoing',
                    proof_doc: c.proof_doc || '',
                    yearly_report_doc: c.yearly_report_doc || '',
                    releases: c.releases || []
                })));
            }

            if (profileData.journal_publications?.length > 0) {
                setJournals(profileData.journal_publications.map((j) => ({
                    id: j.id || '',
                    journal_type: j.journal_type || 'SCI',
                    journal_name: j.journal_name || '',
                    publisher: j.publisher || '',
                    paper_title: j.paper_title || '',
                    vol_no: j.vol_no || '',
                    doi: j.doi || '',
                    publication_date: j.publication_date ? j.publication_date.split('T')[0] : '',
                    impact_factor: j.impact_factor || '',
                    proof_doc: j.proof_doc || ''
                })));
            }
            hasLoadedRef.current = true;
        }
    }, [profileData, user]);

    const uploadDocument = async (file) => {
        if (!file) return null;
        setUploadingDoc(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload-research-doc', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            setUploadingDoc(false);
            if (result.success) return result.url;
            setBanner({ type: 'error', message: result.message || 'File upload failed.' });
            return null;
        } catch (err) {
            setUploadingDoc(false);
            setBanner({ type: 'error', message: 'Error uploading file.' });
            return null;
        }
    };

    // Project Handlers
    const openAddProjectModal = () => {
        if (isSubmitted) return;
        setEditingProjectIndex(null);
        setProjectForm(getInitialProjectForm(user));
        setCoPiInput('');
        setIsProjectModalOpen(true);
    };

    const openEditProjectModal = (index) => {
        if (isSubmitted) return;
        setEditingProjectIndex(index);
        setProjectForm({ ...projects[index], releases: projects[index].releases || [] });
        setCoPiInput('');
        setIsProjectModalOpen(true);
    };

    const saveProjectModal = () => {
        if (!projectForm.pi_name.trim() || !projectForm.project_title.trim()) {
            alert('PI Name and Project Title are required.');
            return;
        }
        isDirtyRef.current = true;
        if (editingProjectIndex !== null) {
            setProjects((prev) => {
                const copy = [...prev];
                copy[editingProjectIndex] = projectForm;
                return copy;
            });
        } else {
            setProjects((prev) => [...prev, projectForm]);
        }
        setIsProjectModalOpen(false);
    };

    // Consultancy Handlers
    const openAddConsultancyModal = () => {
        if (isSubmitted) return;
        setEditingConsultancyIndex(null);
        setConsultancyForm(getInitialConsultancyForm(user));
        setCoPiInput('');
        setIsConsultancyModalOpen(true);
    };

    const openEditConsultancyModal = (index) => {
        if (isSubmitted) return;
        setEditingConsultancyIndex(index);
        setConsultancyForm({ ...consultancies[index], releases: consultancies[index].releases || [] });
        setCoPiInput('');
        setIsConsultancyModalOpen(true);
    };

    const saveConsultancyModal = () => {
        if (!consultancyForm.pi_name.trim() || !consultancyForm.consultancy_title.trim()) {
            alert('PI Name and Consultancy Title are required.');
            return;
        }
        isDirtyRef.current = true;
        if (editingConsultancyIndex !== null) {
            setConsultancies((prev) => {
                const copy = [...prev];
                copy[editingConsultancyIndex] = consultancyForm;
                return copy;
            });
        } else {
            setConsultancies((prev) => [...prev, consultancyForm]);
        }
        setIsConsultancyModalOpen(false);
    };

    // Add release installment
    const addReleaseRow = (isProject) => {
        const newRelease = { release_date: '', amount_received: '', remarks: '' };
        if (isProject) {
            setProjectForm((prev) => ({ ...prev, releases: [...(prev.releases || []), newRelease] }));
        } else {
            setConsultancyForm((prev) => ({ ...prev, releases: [...(prev.releases || []), newRelease] }));
        }
    };

    const removeReleaseRow = (isProject, rIdx) => {
        if (isProject) {
            setProjectForm((prev) => ({ ...prev, releases: prev.releases.filter((_, i) => i !== rIdx) }));
        } else {
            setConsultancyForm((prev) => ({ ...prev, releases: prev.releases.filter((_, i) => i !== rIdx) }));
        }
    };

    const updateReleaseRow = (isProject, rIdx, field, val) => {
        if (isProject) {
            setProjectForm((prev) => {
                const updated = [...(prev.releases || [])];
                updated[rIdx] = { ...updated[rIdx], [field]: val };
                return { ...prev, releases: updated };
            });
        } else {
            setConsultancyForm((prev) => {
                const updated = [...(prev.releases || [])];
                updated[rIdx] = { ...updated[rIdx], [field]: val };
                return { ...prev, releases: updated };
            });
        }
    };

    const openAddJournalModal = () => {
        if (isSubmitted) return;
        setJournalForm(getInitialJournalForm());
        setEditingJournalIndex(null);
        setIsJournalModalOpen(true);
    };

    const openEditJournalModal = (index) => {
        if (isSubmitted) return;
        setJournalForm({ ...journals[index] });
        setEditingJournalIndex(index);
        setIsJournalModalOpen(true);
    };

    const removeJournalRow = (index) => {
        if (isSubmitted) return;
        setJournals((prev) => prev.filter((_, i) => i !== index));
        isDirtyRef.current = true;
    };

    const saveJournalModal = () => {
        if (!journalForm.paper_title?.trim() || !journalForm.journal_name?.trim()) {
            alert('Paper Title and Journal Name are required.');
            return;
        }
        if (!journalForm.doi?.trim()) {
            alert('DOI Number / Link is required.');
            return;
        }
        if (!journalForm.publication_date) {
            alert('Publication Date is required.');
            return;
        }
        isDirtyRef.current = true;
        if (editingJournalIndex !== null) {
            setJournals((prev) => {
                const copy = [...prev];
                copy[editingJournalIndex] = journalForm;
                return copy;
            });
        } else {
            setJournals((prev) => [...prev, journalForm]);
        }
        setIsJournalModalOpen(false);
    };

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (isSubmitted) return false;
        setBanner({ type: '', message: '' });
        setLoading(true);

        const email = user?.email || profileData?.personal?.email || profileData?.personal_info?.email || profileData?.email || '';

        try {
            const res1 = await fetch('/api/research-consultancy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: email,
                    projects,
                    consultancy: consultancies
                })
            });
            const result1 = await res1.json();

            const res2 = await fetch('/api/journal-publications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: email,
                    journal_publications: journals
                })
            });
            const result2 = await res2.json();

            if (result1.success && result2.success) {
                isDirtyRef.current = false;
                hasLoadedRef.current = true;
                setBanner({ type: 'success', message: 'Research, Consultancy & Journal Publications saved successfully!' });
                if (onSaveSuccess) onSaveSuccess();
                return true;
            } else {
                setBanner({ type: 'error', message: (result1.message || result2.message || 'Failed to save details.') });
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
        if (!amt) return '₹0';
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
                    {/* 1. Journal Publications (SCI & Scopus) */}
                    {(!sectionConfig || sectionConfig.sub_journals !== false) && (
                        <div id="sub-journals" className="section-card" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Award size={22} color="#5551ff" /> Journal Publications (SCI &amp; Scopus)
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600, marginTop: '0.2rem' }}>
                                        (Avoid Scopus indexed conferences)
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4f46e5', background: '#eef2ff', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                                            SCI: {journals.filter(j => j.journal_type === 'SCI').length}
                                        </span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                                            Scopus: {journals.filter(j => j.journal_type === 'Scopus').length}
                                        </span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                                            Total: {journals.length}
                                        </span>
                                    </div>
                                    {!isSubmitted && (
                                        <button
                                            type="button"
                                            onClick={openAddJournalModal}
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
                                                boxShadow: '0 2px 4px rgba(85, 81, 255, 0.2)'
                                            }}
                                        >
                                            <Plus size={16} /> Add Publication
                                        </button>
                                    )}
                                </div>
                            </div>

                            {journals.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.9rem' }}>
                                    No journal publications added yet. Click <strong>"+ Add Publication"</strong> to list your SCI and Scopus papers.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                                                <th style={{ padding: '0.75rem 0.85rem' }}>#</th>
                                                <th style={{ padding: '0.75rem 0.85rem' }}>Type</th>
                                                <th style={{ padding: '0.75rem 0.85rem' }}>Paper Title</th>
                                                <th style={{ padding: '0.75rem 0.85rem' }}>Journal &amp; Publisher</th>
                                                <th style={{ padding: '0.75rem 0.85rem' }}>Vol / DOI</th>
                                                <th style={{ padding: '0.75rem 0.85rem' }}>Date</th>
                                                <th style={{ padding: '0.75rem 0.85rem' }}>Impact Factor</th>
                                                <th style={{ padding: '0.75rem 0.85rem' }}>Proof</th>
                                                <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {journals.map((j, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem' }}>
                                                        <span style={{
                                                            padding: '0.2rem 0.6rem',
                                                            borderRadius: '6px',
                                                            fontWeight: 700,
                                                            fontSize: '0.75rem',
                                                            background: j.journal_type === 'Scopus' ? '#ecfdf5' : '#eef2ff',
                                                            color: j.journal_type === 'Scopus' ? '#047857' : '#4338ca',
                                                            border: j.journal_type === 'Scopus' ? '1px solid #a7f3d0' : '1px solid #c7d2fe'
                                                        }}>
                                                            {j.journal_type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>
                                                        {j.paper_title || '-'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#334155' }}>
                                                        <div>{j.journal_name || '-'}</div>
                                                        {j.publisher && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Pub: {j.publisher}</div>}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569', fontSize: '0.82rem' }}>
                                                        {j.vol_no && <div>Vol: {j.vol_no}</div>}
                                                        {j.doi && <div>DOI: {j.doi}</div>}
                                                        {!j.vol_no && !j.doi && '-'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>
                                                        {j.publication_date ? new Date(j.publication_date).toLocaleDateString('en-GB') : '-'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>
                                                        {j.impact_factor || '-'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem' }}>
                                                        {j.proof_doc ? (
                                                            <a href={j.proof_doc} target="_blank" rel="noopener noreferrer" style={{ color: '#5551ff', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                                                <FileText size={14} /> View
                                                            </a>
                                                        ) : '-'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                                            <button type="button" onClick={() => openEditJournalModal(idx)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button type="button" onClick={() => { if (window.confirm('Remove this publication?')) removeJournalRow(idx); }} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. Funded Research Projects */}
                    {(!sectionConfig || sectionConfig.sub_projects !== false) && (
                        <div id="sub-projects" className="section-card" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <BookOpen size={22} color="#4f46e5" /> Funded Research Projects
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                                        Manage all funded research project proposals and active grants.
                                    </p>
                                </div>
                                {!isSubmitted && (
                                    <button
                                        type="button"
                                        onClick={openAddProjectModal}
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
                                        <Plus size={18} /> Add New Project Proposal
                                    </button>
                                )}
                            </div>

                            {projects.length === 0 ? (
                                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                    {isSubmitted ? 'No funded research projects recorded.' : <>No funded research projects added yet. Click <strong style={{ color: '#5551ff' }}>"+ Add New Project Proposal"</strong> above to add an entry.</>}
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                        <thead>
                                            <tr style={{ background: '#5551ff', color: 'white', textTransform: 'uppercase', fontSize: '0.78rem' }}>
                                                <th style={{ padding: '0.9rem 0.75rem', width: '50px', textAlign: 'center' }}>S.NO</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>PI NAME</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>CO-PI NAMES</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>PROJECT TITLE</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>INDUSTRY</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>DURATION</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>AMOUNT (₹)</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>ORGANIZATION</th>
                                                <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>PROOF</th>
                                                <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>YEARLY REPORT</th>
                                                {!isSubmitted && <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>ACTIONS</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projects.map((p, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>{p.pi_name || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>{p.co_pi_names || 'None'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 500, color: '#334155' }}>{p.project_title || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>{p.industry || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569', fontSize: '0.82rem' }}>{formatDateRange(p.from_date, p.to_date)}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>{formatCurrency(p.amount)}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#334155' }}>{p.organization_name || p.funding_agency || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        {p.proof_doc ? (
                                                            <a href={p.proof_doc} target="_blank" rel="noopener noreferrer" style={{ padding: '0.3rem 0.65rem', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                                <FileText size={13} /> View Proof
                                                            </a>
                                                        ) : '-'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        {p.yearly_report_doc ? (
                                                            <a href={p.yearly_report_doc} target="_blank" rel="noopener noreferrer" style={{ padding: '0.3rem 0.65rem', borderRadius: '20px', background: '#f0fdf4', color: '#16a34a', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                                <FileText size={13} /> View Report
                                                            </a>
                                                        ) : '-'}
                                                    </td>
                                                    {!isSubmitted && (
                                                        <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                                                <button type="button" onClick={() => openEditProjectModal(idx)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
                                                                    <Edit3 size={14} />
                                                                </button>
                                                                <button type="button" onClick={() => { if (window.confirm('Remove project?')) setProjects(prev => prev.filter((_, i) => i !== idx)); }} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
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
                    )}

                    {/* 3. Funded Consultancy Assignments */}
                    {(!sectionConfig || sectionConfig.sub_consultancy !== false) && (
                        <div id="sub-consultancy" className="section-card" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Briefcase size={22} color="#5551ff" /> Funded Consultancy Assignments
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                                        Manage industry consultancy proposals and client assignments.
                                    </p>
                                </div>
                                {!isSubmitted && (
                                    <button
                                        type="button"
                                        onClick={openAddConsultancyModal}
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
                                        <Plus size={18} /> Add New Consultancy
                                    </button>
                                )}
                            </div>

                            {consultancies.length === 0 ? (
                                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                    {isSubmitted ? 'No consultancy assignments recorded.' : <>No consultancy assignments added yet. Click <strong style={{ color: '#5551ff' }}>"+ Add New Consultancy"</strong> above to add an entry.</>}
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                        <thead>
                                            <tr style={{ background: '#5551ff', color: 'white', textTransform: 'uppercase', fontSize: '0.78rem' }}>
                                                <th style={{ padding: '0.9rem 0.75rem', width: '50px', textAlign: 'center' }}>S.NO</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>PI / CONSULTANT</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>CO-PI NAMES</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>PROJECT TITLE</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>INDUSTRY</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>DURATION</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>AMOUNT (₹)</th>
                                                <th style={{ padding: '0.9rem 0.75rem' }}>ORGANIZATION</th>
                                                <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>PROOF</th>
                                                <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>YEARLY REPORT</th>
                                                {!isSubmitted && <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>ACTIONS</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consultancies.map((c, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>{c.pi_name || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>{c.co_pi_names || 'None'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 500, color: '#334155' }}>{c.consultancy_title || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>{c.industry || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#475569', fontSize: '0.82rem' }}>{formatDateRange(c.from_date, c.to_date)}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>{formatCurrency(c.amount)}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', color: '#334155' }}>{c.organization_name || c.client_org || '-'}</td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        {c.proof_doc ? (
                                                            <a href={c.proof_doc} target="_blank" rel="noopener noreferrer" style={{ padding: '0.3rem 0.65rem', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                                <FileText size={13} /> View Proof
                                                            </a>
                                                        ) : '-'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        {c.yearly_report_doc ? (
                                                            <a href={c.yearly_report_doc} target="_blank" rel="noopener noreferrer" style={{ padding: '0.3rem 0.65rem', borderRadius: '20px', background: '#f0fdf4', color: '#16a34a', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                                                                <FileText size={13} /> View Report
                                                            </a>
                                                        ) : '-'}
                                                    </td>
                                                    {!isSubmitted && (
                                                        <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                                                <button type="button" onClick={() => openEditConsultancyModal(idx)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
                                                                    <Edit3 size={14} />
                                                                </button>
                                                                <button type="button" onClick={() => { if (window.confirm('Remove consultancy assignment?')) setConsultancies(prev => prev.filter((_, i) => i !== idx)); }} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
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
                    )}

                    {sectionConfig && sectionConfig.sub_journals === false && sectionConfig.sub_projects === false && sectionConfig.sub_consultancy === false && (
                        <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b', marginBottom: '2rem' }}>
                            Research &amp; Consultancy sub-sections are currently disabled by administrator.
                        </div>
                    )}
                </fieldset>

                {/* Form Buttons */}
                <div className="profile-tab-actions">
                    <button type="button" onClick={onPrev} className="nav-btn primary" style={{ background: '#5551ff', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                        <ArrowLeft size={18} /> Back: Work Experience
                    </button>
                    {!isSubmitted ? (
                        <button type="submit" disabled={loading} className="nav-btn secondary" style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Research & Consultancy'}
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
                            try {
                                await handleSubmit(e);
                            } catch (err) {
                                console.error('Save error on next:', err);
                            }
                            if (onNext) onNext();
                        }}
                        className="nav-btn primary"
                        style={{ background: '#5551ff', padding: '0.75rem 1.5rem', borderRadius: '10px' }}
                    >
                        Next: Certifications <ArrowRight size={18} />
                    </button>
                </div>
            </form>

            {/* =========================================================
                MODAL FOR PROJECT PROPOSAL / CONSULTANCY PROPOSAL
            ========================================================= */}
            {/* Modal for Project Proposal */}
            {isProjectModalOpen && (
                <RenderProposalModal
                    isProject={true}
                    title={editingProjectIndex !== null ? 'Edit Project Proposal' : 'Add New Project Proposal'}
                    form={projectForm}
                    setForm={setProjectForm}
                    coPiInput={coPiInput}
                    setCoPiInput={setCoPiInput}
                    onClose={() => setIsProjectModalOpen(false)}
                    onSave={saveProjectModal}
                    uploadDocument={uploadDocument}
                    uploadingDoc={uploadingDoc}
                    addReleaseRow={(isProj) => addReleaseRow(isProj)}
                    removeReleaseRow={(isProj, idx) => removeReleaseRow(isProj, idx)}
                    updateReleaseRow={(isProj, idx, field, val) => updateReleaseRow(isProj, idx, field, val)}
                />
            )}

            {/* Modal for Consultancy Proposal */}
            {isConsultancyModalOpen && (
                <RenderProposalModal
                    isProject={false}
                    title={editingConsultancyIndex !== null ? 'Edit Consultancy Proposal' : 'Add New Consultancy Proposal'}
                    form={consultancyForm}
                    setForm={setConsultancyForm}
                    coPiInput={coPiInput}
                    setCoPiInput={setCoPiInput}
                    onClose={() => setIsConsultancyModalOpen(false)}
                    onSave={saveConsultancyModal}
                    uploadDocument={uploadDocument}
                    uploadingDoc={uploadingDoc}
                    addReleaseRow={(isProj) => addReleaseRow(isProj)}
                    removeReleaseRow={(isProj, idx) => removeReleaseRow(isProj, idx)}
                    updateReleaseRow={(isProj, idx, field, val) => updateReleaseRow(isProj, idx, field, val)}
                />
            )}

            {/* Modal for Journal Publication */}
            {isJournalModalOpen && (
                <RenderJournalModal
                    editingIndex={editingJournalIndex}
                    form={journalForm}
                    setForm={setJournalForm}
                    onClose={() => setIsJournalModalOpen(false)}
                    onSave={saveJournalModal}
                    uploadDocument={uploadDocument}
                    uploadingDoc={uploadingDoc}
                />
            )}
        </div>
    );
};

// Modal for Journal Publications (SCI & Scopus)
function RenderJournalModal({
    editingIndex,
    form,
    setForm,
    onClose,
    onSave,
    uploadDocument,
    uploadingDoc
}) {
    const [errors, setErrors] = useState({});
    const [flashMessage, setFlashMessage] = useState('');

    const handleValidateAndSave = () => {
        const errs = {};
        const missing = [];

        if (!form.paper_title?.trim()) {
            errs.paper_title = true;
            missing.push('Paper Title');
        }
        if (!form.journal_name?.trim()) {
            errs.journal_name = true;
            missing.push('Journal Name');
        }
        if (!form.doi?.trim()) {
            errs.doi = true;
            missing.push('DOI Number / Link');
        }
        if (!form.publication_date) {
            errs.publication_date = true;
            missing.push('Publication Date');
        }

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            setFlashMessage(`Please fill in all mandatory fields highlighted in red (${missing.join(', ')}).`);
            const firstKey = Object.keys(errs)[0];
            const el = document.getElementById(`journal-${firstKey}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
            }
            return;
        }

        setErrors({});
        setFlashMessage('');
        onSave();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1.5rem'
        }}>
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    background: '#5551ff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Award size={20} /> {editingIndex !== null ? 'Edit Journal Publication' : 'Add Journal Publication'}
                    </h3>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.2rem' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Indexing Type */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: '0.4rem' }}>
                            Indexing Type <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['SCI', 'Scopus'].map((type) => (
                                <label key={type} style={{
                                    flex: 1,
                                    padding: '0.6rem 1rem',
                                    borderRadius: '8px',
                                    border: form.journal_type === type ? '2px solid #5551ff' : '1px solid #cbd5e1',
                                    background: form.journal_type === type ? '#eef2ff' : '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    color: form.journal_type === type ? '#4338ca' : '#475569'
                                }}>
                                    <input
                                        type="radio"
                                        name="journal_type"
                                        value={type}
                                        checked={form.journal_type === type}
                                        onChange={(e) => setForm(prev => ({ ...prev, journal_type: e.target.value }))}
                                        style={{ accentColor: '#5551ff' }}
                                    />
                                    {type} Indexed
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Paper Title */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.paper_title ? '#ef4444' : '#334155', marginBottom: '0.3rem' }}>
                            Paper Title <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            id="journal-paper_title"
                            type="text"
                            value={form.paper_title || ''}
                            onChange={(e) => {
                                setForm(prev => ({ ...prev, paper_title: e.target.value }));
                                if (errors.paper_title) setErrors(prev => ({ ...prev, paper_title: false }));
                            }}
                            placeholder="Enter the title of published paper"
                            style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                border: errors.paper_title ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                background: errors.paper_title ? '#fef2f2' : '#ffffff',
                                fontSize: '0.88rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Journal Name & Publisher */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.journal_name ? '#ef4444' : '#334155', marginBottom: '0.3rem' }}>
                                Journal Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="journal-journal_name"
                                type="text"
                                value={form.journal_name || ''}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, journal_name: e.target.value }));
                                    if (errors.journal_name) setErrors(prev => ({ ...prev, journal_name: false }));
                                }}
                                placeholder="e.g. IEEE Transactions on AI"
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '8px',
                                    border: errors.journal_name ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                    background: errors.journal_name ? '#fef2f2' : '#ffffff',
                                    fontSize: '0.88rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: '0.3rem' }}>
                                Publisher
                            </label>
                            <input
                                type="text"
                                value={form.publisher || ''}
                                onChange={(e) => setForm(prev => ({ ...prev, publisher: e.target.value }))}
                                placeholder="e.g. Elsevier, Springer, IEEE"
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                            />
                        </div>
                    </div>

                    {/* Vol/Issue/Page No & DOI */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: '0.3rem' }}>
                                Vol. / Issue / Page No.
                            </label>
                            <input
                                type="text"
                                value={form.vol_no || ''}
                                onChange={(e) => setForm(prev => ({ ...prev, vol_no: e.target.value }))}
                                placeholder="e.g. Vol 12, Issue 4, pp. 100-112"
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.doi ? '#ef4444' : '#334155', marginBottom: '0.3rem' }}>
                                DOI Number / Link <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="journal-doi"
                                type="text"
                                value={form.doi || ''}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, doi: e.target.value }));
                                    if (errors.doi) setErrors(prev => ({ ...prev, doi: false }));
                                }}
                                placeholder="10.1016/j.artint.2023.103982"
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '8px',
                                    border: errors.doi ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                    background: errors.doi ? '#fef2f2' : '#ffffff',
                                    fontSize: '0.88rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Publication Date & Impact Factor */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.publication_date ? '#ef4444' : '#334155', marginBottom: '0.3rem' }}>
                                Publication Date <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="journal-publication_date"
                                type="date"
                                value={form.publication_date || ''}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, publication_date: e.target.value }));
                                    if (errors.publication_date) setErrors(prev => ({ ...prev, publication_date: false }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '8px',
                                    border: errors.publication_date ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                    background: errors.publication_date ? '#fef2f2' : '#ffffff',
                                    fontSize: '0.88rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: '0.3rem' }}>
                                Impact Factor
                            </label>
                            <input
                                type="text"
                                value={form.impact_factor || ''}
                                onChange={(e) => setForm(prev => ({ ...prev, impact_factor: e.target.value }))}
                                placeholder="e.g. 4.8"
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                            />
                        </div>
                    </div>

                    {/* Proof Document */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: '0.3rem' }}>
                            Proof Document (First page / Certificate)
                        </label>
                        <div style={{ border: '1px solid #5551ff', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
                            <label style={{ background: '#5551ff', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Upload size={14} /> Choose File
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const url = await uploadDocument(file);
                                            if (url) setForm((prev) => ({ ...prev, proof_doc: url }));
                                        }
                                    }}
                                />
                            </label>
                            <span style={{ fontSize: '0.82rem', color: form.proof_doc ? '#16a34a' : '#64748b', fontStyle: form.proof_doc ? 'normal' : 'italic' }}>
                                {uploadingDoc ? 'Uploading...' : (form.proof_doc ? 'Uploaded ✓' : 'No file chosen')}
                            </span>
                        </div>
                    </div>

                    {/* Flash Error Banner */}
                    {flashMessage && (
                        <div style={{
                            padding: '0.85rem 1.15rem',
                            borderRadius: '10px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)'
                        }}>
                            <span>⚠️ {flashMessage}</span>
                        </div>
                    )}

                    {/* Modal Footer (Inside Scroll Area) */}
                    <div style={{ paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s ease' }}>
                            Cancel
                        </button>
                        <button type="button" onClick={handleValidateAndSave} style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', background: '#2563eb', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s ease' }}>
                            Save Publication
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable Modal Component matching User Screenshots 1 & 2
function RenderProposalModal({
    isProject,
    title,
    form,
    setForm,
    coPiInput,
    setCoPiInput,
    onClose,
    onSave,
    uploadDocument,
    uploadingDoc,
    addReleaseRow,
    removeReleaseRow,
    updateReleaseRow
}) {
    const [errors, setErrors] = useState({});
    const [flashMessage, setFlashMessage] = useState('');

    const handleAddCoPi = () => {
        if (!coPiInput.trim()) return;
        const updated = form.co_pi_names ? `${form.co_pi_names}, ${coPiInput.trim()}` : coPiInput.trim();
        setForm((prev) => ({ ...prev, co_pi_names: updated }));
        setCoPiInput('');
    };

    const handleValidateAndSave = () => {
        const errs = {};
        const missing = [];

        if (!form.pi_name?.trim()) {
            errs.pi_name = true;
            missing.push('PI Name');
        }
        const titleVal = isProject ? form.project_title : form.consultancy_title;
        if (!titleVal?.trim()) {
            errs.title = true;
            missing.push(isProject ? 'Project Title' : 'Consultancy Title');
        }
        if (!form.industry?.trim()) {
            errs.industry = true;
            missing.push('Industry');
        }
        if (!form.organization_name?.trim()) {
            errs.organization_name = true;
            missing.push('Organization Name');
        }
        if (!form.from_date) {
            errs.from_date = true;
            missing.push('From Date');
        }
        if (!form.to_date) {
            errs.to_date = true;
            missing.push('To Date');
        }
        if (form.amount === '' || form.amount === null || form.amount === undefined) {
            errs.amount = true;
            missing.push(isProject ? 'Amount Sanctioned' : 'Total Amount');
        }

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            setFlashMessage(`Please fill in all mandatory fields highlighted in red (${missing.join(', ')}).`);
            const firstKey = Object.keys(errs)[0];
            const el = document.getElementById(`proposal-${firstKey}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
            }
            return;
        }

        setErrors({});
        setFlashMessage('');
        onSave();
    };

    return (
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
                maxWidth: '780px',
                maxHeight: '90vh',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Purple Header Bar matching screenshot */}
                <div style={{
                    background: '#5551ff',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#ffffff'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                        <X size={22} />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
                    {/* PI Name */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.pi_name ? '#ef4444' : '#1e293b', marginBottom: '0.4rem' }}>
                            PI Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            id="proposal-pi_name"
                            type="text"
                            value={form.pi_name}
                            onChange={(e) => {
                                setForm({ ...form, pi_name: e.target.value });
                                if (errors.pi_name) setErrors(prev => ({ ...prev, pi_name: false }));
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                border: errors.pi_name ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                background: errors.pi_name ? '#fef2f2' : '#f8fafc',
                                fontSize: '0.92rem',
                                outline: 'none'
                            }}
                            placeholder="Enter PI Name"
                        />
                    </div>

                    {/* Co-PI Names */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                            Co-PI Names
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={coPiInput}
                                onChange={(e) => setCoPiInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCoPi(); } }}
                                placeholder="Type Co-PI name and click Add..."
                                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={handleAddCoPi}
                                style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', background: '#5551ff', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.88rem' }}
                            >
                                Add Co-PI
                            </button>
                        </div>
                        {form.co_pi_names && (
                            <div style={{ fontSize: '0.82rem', color: '#5551ff', fontWeight: 600, marginTop: '0.3rem' }}>
                                Current Co-PIs: {form.co_pi_names}
                            </div>
                        )}
                    </div>

                    {/* Project Title & Industry */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.title ? '#ef4444' : '#1e293b', marginBottom: '0.4rem' }}>
                                Project Title <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="proposal-title"
                                type="text"
                                value={isProject ? form.project_title : form.consultancy_title}
                                onChange={(e) => {
                                    setForm({ ...form, [isProject ? 'project_title' : 'consultancy_title']: e.target.value });
                                    if (errors.title) setErrors(prev => ({ ...prev, title: false }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: errors.title ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                    background: errors.title ? '#fef2f2' : '#ffffff',
                                    fontSize: '0.92rem',
                                    outline: 'none'
                                }}
                                placeholder="Enter title"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.industry ? '#ef4444' : '#1e293b', marginBottom: '0.4rem' }}>
                                Industry <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="proposal-industry"
                                type="text"
                                value={form.industry}
                                onChange={(e) => {
                                    setForm({ ...form, industry: e.target.value });
                                    if (errors.industry) setErrors(prev => ({ ...prev, industry: false }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: errors.industry ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                    background: errors.industry ? '#fef2f2' : '#ffffff',
                                    fontSize: '0.92rem',
                                    outline: 'none'
                                }}
                                placeholder="Enter industry / domain"
                            />
                        </div>
                    </div>

                    {/* Organization Name & From Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.organization_name ? '#ef4444' : '#1e293b', marginBottom: '0.4rem' }}>
                                Organization Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="proposal-organization_name"
                                type="text"
                                value={form.organization_name}
                                onChange={(e) => {
                                    setForm({ ...form, organization_name: e.target.value });
                                    if (errors.organization_name) setErrors(prev => ({ ...prev, organization_name: false }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: errors.organization_name ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                    background: errors.organization_name ? '#fef2f2' : '#ffffff',
                                    fontSize: '0.92rem',
                                    outline: 'none'
                                }}
                                placeholder="Enter Organization / Client Name"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.from_date ? '#ef4444' : '#1e293b', marginBottom: '0.4rem' }}>
                                From Date <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="proposal-from_date"
                                type="date"
                                value={form.from_date}
                                onChange={(e) => {
                                    setForm({ ...form, from_date: e.target.value });
                                    if (errors.from_date) setErrors(prev => ({ ...prev, from_date: false }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: errors.from_date ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                    background: errors.from_date ? '#fef2f2' : '#ffffff',
                                    fontSize: '0.92rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* To Date & Total Consultancy Amount */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.to_date ? '#ef4444' : '#1e293b', marginBottom: '0.4rem' }}>
                                To Date <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="proposal-to_date"
                                type="date"
                                value={form.to_date}
                                onChange={(e) => {
                                    setForm({ ...form, to_date: e.target.value });
                                    if (errors.to_date) setErrors(prev => ({ ...prev, to_date: false }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: errors.to_date ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                    background: errors.to_date ? '#fef2f2' : '#ffffff',
                                    fontSize: '0.92rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: errors.amount ? '#ef4444' : '#1e293b', marginBottom: '0.4rem' }}>
                                {isProject ? 'Amount Sanctioned (₹) *' : 'Total Consultancy Amount (₹) *'}
                            </label>
                            <input
                                id="proposal-amount"
                                type="number"
                                min="0"
                                step="any"
                                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                value={form.amount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || parseFloat(val) >= 0) {
                                        setForm({ ...form, amount: val });
                                        if (errors.amount) setErrors(prev => ({ ...prev, amount: false }));
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: errors.amount ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                    background: errors.amount ? '#fef2f2' : '#ffffff',
                                    fontSize: '0.92rem',
                                    outline: 'none'
                                }}
                                placeholder="e.g. 117000"
                            />
                        </div>
                    </div>

                    {/* Amount Release Details Section matching Screenshot 2 */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#1e293b' }}>
                                    Amount Release Details
                                </h4>
                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                    Add payment installment / release dates and amounts for this proposal.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => addReleaseRow(isProject)}
                                style={{
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '8px',
                                    background: '#5551ff',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem'
                                }}
                            >
                                <Plus size={15} /> Add Release
                            </button>
                        </div>

                        {(!form.releases || form.releases.length === 0) ? (
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', background: '#f8fafc' }}>
                                No release details added yet. Click "+ Add Release" to add a release entry.
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                                            <th style={{ padding: '0.6rem', width: '40px', textAlign: 'center' }}>#</th>
                                            <th style={{ padding: '0.6rem' }}>RELEASE DATE *</th>
                                            <th style={{ padding: '0.6rem' }}>AMOUNT RECEIVED (₹) *</th>
                                            <th style={{ padding: '0.6rem' }}>REMARKS (OPTIONAL)</th>
                                            <th style={{ padding: '0.6rem', textAlign: 'center', width: '60px' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.releases.map((rel, rIdx) => (
                                            <tr key={rIdx} style={{ borderTop: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600 }}>{rIdx + 1}</td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input
                                                        type="date"
                                                        value={rel.release_date || ''}
                                                        onChange={(e) => updateReleaseRow(isProject, rIdx, 'release_date', e.target.value)}
                                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                        value={rel.amount_received || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '' || parseFloat(val) >= 0) updateReleaseRow(isProject, rIdx, 'amount_received', val);
                                                        }}
                                                        placeholder="Amount"
                                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        value={rel.remarks || ''}
                                                        onChange={(e) => updateReleaseRow(isProject, rIdx, 'remarks', e.target.value)}
                                                        placeholder="Remarks"
                                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                    <button type="button" onClick={() => removeReleaseRow(isProject, rIdx)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '0.3rem', cursor: 'pointer' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Documents & Reports (PDF only, max 10MB) matching Screenshot 2 */}
                    <div>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                            Documents & Reports (PDF only, max 10MB)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {/* Proof Document */}
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem' }}>
                                    Proof Document
                                </label>
                                <div style={{ border: '1px solid #5551ff', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
                                    <label style={{ background: '#5551ff', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Upload size={14} /> Choose File
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = await uploadDocument(file);
                                                    if (url) setForm((prev) => ({ ...prev, proof_doc: url }));
                                                }
                                            }}
                                        />
                                    </label>
                                    <span style={{ fontSize: '0.82rem', color: form.proof_doc ? '#16a34a' : '#64748b', fontStyle: form.proof_doc ? 'normal' : 'italic' }}>
                                        {uploadingDoc ? 'Uploading...' : (form.proof_doc ? 'Uploaded ✓' : 'No file chosen')}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>PDF, PNG, JPG up to 10MB</div>
                            </div>

                            {/* Yearly Report */}
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem' }}>
                                    Yearly Report
                                </label>
                                <div style={{ border: '1px solid #5551ff', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
                                    <label style={{ background: '#5551ff', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Upload size={14} /> Choose File
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = await uploadDocument(file);
                                                    if (url) setForm((prev) => ({ ...prev, yearly_report_doc: url }));
                                                }
                                            }}
                                        />
                                    </label>
                                    <span style={{ fontSize: '0.82rem', color: form.yearly_report_doc ? '#16a34a' : '#64748b', fontStyle: form.yearly_report_doc ? 'normal' : 'italic' }}>
                                        {uploadingDoc ? 'Uploading...' : (form.yearly_report_doc ? 'Uploaded ✓' : 'No file chosen')}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>PDF, PNG, JPG up to 10MB</div>
                            </div>
                        </div>
                    </div>

                    {/* Flash Error Banner */}
                    {flashMessage && (
                        <div style={{
                            margin: '1.25rem 0 0.25rem 0',
                            padding: '0.85rem 1.15rem',
                            borderRadius: '10px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)'
                        }}>
                            <span>⚠️ {flashMessage}</span>
                        </div>
                    )}

                    {/* Modal Footer (Inside Scroll Area) */}
                    <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s ease' }}>
                            Cancel
                        </button>
                        <button type="button" onClick={handleValidateAndSave} style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', background: '#2563eb', color: '#ffffff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s ease' }}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
