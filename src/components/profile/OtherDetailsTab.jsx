import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from '../Banner';
import { Trophy, Users, UserCheck, FileText, ArrowRight, ArrowLeft, Save, Plus, Trash2, Edit3, X, ExternalLink, Upload, Award, Eye, Printer, CheckCircle2 } from 'lucide-react';
import { PrintableApplicationForm } from '../PrintableApplicationForm';

const generateYearOptions = (startYear = 1970, endYear = new Date().getFullYear()) => {
    const years = [];
    for (let y = endYear; y >= startYear; y--) {
        years.push(y);
    }
    return years;
};

export const OtherDetailsTab = ({ profileData, isSubmitted, onSaveSuccess, onNext, onPrev }) => {
    const { user } = useAuth();
    const [banner, setBanner] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [wasValidated, setWasValidated] = useState(false);
    const formRef = useRef(null);
    const loadedEmailRef = useRef('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // State for main form
    const [noOfAwards, setNoOfAwards] = useState('0');
    const [awards, setAwards] = useState([]);

    // Family details
    const [familyForm, setFamilyForm] = useState({
        spouse_name: '',
        spouse_occupation: '',
        spouse_org: '',
        no_of_children: '0',
        no_of_dependents: '0',
        father_occupation: '',
        mother_occupation: ''
    });

    // References
    const [ref1, setRef1] = useState({
        name: '',
        designation: '',
        org: '',
        phone: '',
        email: '',
        relation: ''
    });

    const [ref2, setRef2] = useState({
        name: '',
        designation: '',
        org: '',
        phone: '',
        email: '',
        relation: ''
    });

    // Additional info
    const [otherAchievements, setOtherAchievements] = useState('');
    const [specialRemarks, setSpecialRemarks] = useState('');

    // Modal state for Awards
    const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
    const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
    const [editingAwardIdx, setEditingAwardIdx] = useState(null);
    const [awardForm, setAwardForm] = useState(getInitialAwardForm());
    const [modalValidated, setModalValidated] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    function getInitialAwardForm() {
        return {
            title: '',
            organization: '',
            category: 'National',
            year: new Date().getFullYear().toString(),
            prize: '',
            proof_doc: ''
        };
    }

    // Load initial profile data
    useEffect(() => {
        if (user?.email && loadedEmailRef.current !== user.email) {
            loadedEmailRef.current = user.email;
        }

        if (profileData) {
            if (Array.isArray(profileData.awards)) {
                setAwards(profileData.awards);
                setNoOfAwards(profileData.other_details?.no_of_awards !== undefined
                    ? String(profileData.other_details.no_of_awards)
                    : String(profileData.awards.length));
            }

            if (profileData.other_details) {
                const od = profileData.other_details;
                setFamilyForm({
                    spouse_name: od.spouse_name || '',
                    spouse_occupation: od.spouse_occupation || '',
                    spouse_org: od.spouse_org || '',
                    no_of_children: od.no_of_children !== undefined ? String(od.no_of_children) : '0',
                    no_of_dependents: od.no_of_dependents !== undefined ? String(od.no_of_dependents) : '0',
                    father_occupation: od.father_occupation || '',
                    mother_occupation: od.mother_occupation || ''
                });

                setRef1({
                    name: od.ref1_name || '',
                    designation: od.ref1_designation || '',
                    org: od.ref1_org || '',
                    phone: od.ref1_phone || '',
                    email: od.ref1_email || '',
                    relation: od.ref1_relation || ''
                });

                setRef2({
                    name: od.ref2_name || '',
                    designation: od.ref2_designation || '',
                    org: od.ref2_org || '',
                    phone: od.ref2_phone || '',
                    email: od.ref2_email || '',
                    relation: od.ref2_relation || ''
                });

                setOtherAchievements(od.other_achievements || '');
                setSpecialRemarks(od.special_remarks || '');
            }
        }
    }, [profileData, user]);

    // Keep award count in sync when awards list changes
    const openAddAwardModal = () => {
        if (isSubmitted) return;
        setEditingAwardIdx(null);
        setAwardForm(getInitialAwardForm());
        setModalValidated(false);
        setIsAwardModalOpen(true);
    };

    const openEditAwardModal = (idx) => {
        if (isSubmitted) return;
        setEditingAwardIdx(idx);
        setAwardForm({ ...awards[idx] });
        setModalValidated(false);
        setIsAwardModalOpen(true);
    };

    const handleAwardFileUpload = async (e) => {
        if (isSubmitted) return;
        const file = e.target.files[0];
        if (!file) return;

        setUploadingDoc(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload-award-doc', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setAwardForm(prev => ({ ...prev, proof_doc: data.url }));
            } else {
                alert('File upload failed: ' + data.message);
            }
        } catch (err) {
            console.error('File upload error:', err);
            alert('Error uploading award document.');
        } finally {
            setUploadingDoc(false);
        }
    };

    const saveAwardModal = () => {
        if (isSubmitted) return;
        setModalValidated(true);
        if (!awardForm.title.trim() || !awardForm.organization.trim()) {
            return;
        }

        if (editingAwardIdx !== null) {
            setAwards(prev => {
                const next = [...prev];
                next[editingAwardIdx] = awardForm;
                return next;
            });
        } else {
            setAwards(prev => {
                const next = [...prev, awardForm];
                setNoOfAwards(String(next.length));
                return next;
            });
        }

        setIsAwardModalOpen(false);
    };

    const deleteAward = (idx) => {
        if (isSubmitted) return;
        if (window.confirm('Are you sure you want to remove this award entry?')) {
            setAwards(prev => {
                const next = prev.filter((_, i) => i !== idx);
                setNoOfAwards(String(next.length));
                return next;
            });
        }
    };

    const scrollToFirstInvalid = () => {
        if (!formRef.current) return;
        setTimeout(() => {
            const invalidEl = formRef.current.querySelector(':invalid, .is-invalid');
            if (invalidEl) {
                invalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (typeof invalidEl.focus === 'function') invalidEl.focus();
            }
        }, 50);
    };

    const initiateFinalSubmit = () => {
        if (isSubmitted) return;
        setWasValidated(true);
        setBanner({ type: '', message: '' });

        if (!formRef.current.checkValidity()) {
            scrollToFirstInvalid();
            setBanner({ type: 'error', message: 'Please complete all required fields correctly before submitting.' });
            return;
        }
        setIsSubmitConfirmOpen(true);
    };

    const saveOtherData = async (advance = false, isFinalSubmit = false) => {
        if (isSubmitted) return;
        setWasValidated(true);
        setBanner({ type: '', message: '' });

        if (!formRef.current.checkValidity()) {
            scrollToFirstInvalid();
            setBanner({ type: 'error', message: 'Please complete all required fields correctly before saving.' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                user_email: user?.email,
                no_of_awards: parseInt(noOfAwards, 10) || awards.length,
                awards: awards,
                spouse_name: familyForm.spouse_name,
                spouse_occupation: familyForm.spouse_occupation,
                spouse_org: familyForm.spouse_org,
                no_of_children: parseInt(familyForm.no_of_children, 10) || 0,
                no_of_dependents: parseInt(familyForm.no_of_dependents, 10) || 0,
                father_occupation: familyForm.father_occupation,
                mother_occupation: familyForm.mother_occupation,
                ref1_name: ref1.name,
                ref1_designation: ref1.designation,
                ref1_org: ref1.org,
                ref1_phone: ref1.phone,
                ref1_email: ref1.email,
                ref1_relation: ref1.relation,
                ref2_name: ref2.name,
                ref2_designation: ref2.designation,
                ref2_org: ref2.org,
                ref2_phone: ref2.phone,
                ref2_email: ref2.email,
                ref2_relation: ref2.relation,
                other_achievements: otherAchievements,
                special_remarks: specialRemarks,
                is_final_submit: isFinalSubmit
            };

            const res = await fetch('/api/other-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setBanner({ type: 'success', message: 'Other details saved successfully!' });
                if (onSaveSuccess) onSaveSuccess(6);
                if (advance && onNext) onNext(6);
            } else {
                setBanner({ type: 'error', message: data.message || 'Failed to save details.' });
            }
        } catch (err) {
            console.error('Save error:', err);
            setBanner({ type: 'error', message: 'Network error while saving details.' });
        } finally {
            setLoading(false);
            setIsSubmitConfirmOpen(false);
        }
    };

    return (
        <div className="form-card" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="form-card-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={28} color="#0284c7" />
                <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Awards, Family, References &amp; Additional Information</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        Provide details of awards won, family background, academic/professional references, and any additional achievements.
                    </p>
                </div>
            </div>

            {banner.message && <Banner type={banner.type} message={banner.message} onClose={() => setBanner({ type: '', message: '' })} />}

            <form ref={formRef} className={wasValidated ? 'was-validated' : ''} noValidate onSubmit={(e) => e.preventDefault()}>
                <fieldset disabled={isSubmitted} style={{ border: 'none', padding: 0, margin: 0 }}>
                    {/* SECTION 1: AWARDS & HONORS */}
                    <div id="sub-awards" className="section-card" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                                    <Trophy size={22} color="#5551ff" /> Award Details &amp; Honors
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem', marginBottom: 0 }}>
                                    Manage academic honors, fellowship awards, and recognition won.
                                </p>
                            </div>
                            {!isSubmitted && (
                                <button
                                    type="button"
                                    onClick={openAddAwardModal}
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
                                    <Plus size={18} /> Add New Award
                                </button>
                            )}
                        </div>

                        {awards.length === 0 ? (
                            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                {isSubmitted ? 'No awards recorded.' : <>No awards added yet. Click <button type="button" onClick={openAddAwardModal} style={{ background: 'none', border: 'none', color: '#5551ff', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}>"+ Add New Award"</button> above to add an entry.</>}
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                    <thead>
                                        <tr style={{ background: '#5551ff', color: 'white', textTransform: 'uppercase', fontSize: '0.78rem' }}>
                                            <th style={{ padding: '0.9rem 0.75rem', width: '50px', textAlign: 'center' }}>S.NO</th>
                                            <th style={{ padding: '0.9rem 0.75rem' }}>AWARD TITLE</th>
                                            <th style={{ padding: '0.9rem 0.75rem' }}>ISSUING ORGANIZATION</th>
                                            <th style={{ padding: '0.9rem 0.75rem' }}>CATEGORY</th>
                                            <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>YEAR</th>
                                            <th style={{ padding: '0.9rem 0.75rem' }}>PRIZE / DETAILS</th>
                                            <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>PROOF</th>
                                            {!isSubmitted && <th style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>ACTIONS</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {awards.map((a, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>{a.title || '-'}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>{a.organization || '-'}</td>
                                                <td style={{ padding: '0.85rem 0.75rem' }}>
                                                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
                                                        {a.category || 'National'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#334155' }}>{a.year || '-'}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>{a.prize || 'Memento'}</td>
                                                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                    {a.proof_doc ? (
                                                        <a href={a.proof_doc} target="_blank" rel="noopener noreferrer" style={{ padding: '0.3rem 0.65rem', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                                            <FileText size={13} /> View Proof
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                                {!isSubmitted && (
                                                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                                            <button type="button" onClick={() => openEditAwardModal(idx)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button type="button" onClick={() => deleteAward(idx)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
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

                    {/* SECTION 2: FAMILY DETAILS */}
                    < div style={{ background: 'var(--color-bg-light)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--color-border)', marginBottom: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Users size={20} color="#0284c7" />
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>2. Family Details</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.1rem' }}>
                            <div>
                                <label className="form-label">Spouse Name (If Married)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={familyForm.spouse_name}
                                    onChange={(e) => setFamilyForm({ ...familyForm, spouse_name: e.target.value })}
                                    placeholder="Enter spouse full name"
                                />
                            </div>
                            <div>
                                <label className="form-label">Spouse Occupation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={familyForm.spouse_occupation}
                                    onChange={(e) => setFamilyForm({ ...familyForm, spouse_occupation: e.target.value })}
                                    placeholder="e.g. Software Engineer / Teacher"
                                />
                            </div>
                            <div>
                                <label className="form-label">Spouse Organization / Employer</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={familyForm.spouse_org}
                                    onChange={(e) => setFamilyForm({ ...familyForm, spouse_org: e.target.value })}
                                    placeholder="Employer organization name"
                                />
                            </div>

                            <div>
                                <label className="form-label">Number of Children</label>
                                <input
                                    type="number"
                                    min="0"
                                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                    className="form-control"
                                    value={familyForm.no_of_children}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || parseFloat(val) >= 0) setFamilyForm({ ...familyForm, no_of_children: val });
                                    }}
                                />
                            </div>
                            <div>
                                <label className="form-label">Number of Dependents</label>
                                <input
                                    type="number"
                                    min="0"
                                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                    className="form-control"
                                    value={familyForm.no_of_dependents}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || parseFloat(val) >= 0) setFamilyForm({ ...familyForm, no_of_dependents: val });
                                    }}
                                />
                            </div>

                            <div>
                                <label className="form-label">Father's Occupation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={familyForm.father_occupation}
                                    onChange={(e) => setFamilyForm({ ...familyForm, father_occupation: e.target.value })}
                                    placeholder="Father's profession"
                                />
                            </div>
                            <div>
                                <label className="form-label">Mother's Occupation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={familyForm.mother_occupation}
                                    onChange={(e) => setFamilyForm({ ...familyForm, mother_occupation: e.target.value })}
                                    placeholder="Mother's profession"
                                />
                            </div>
                        </div>
                    </div >

                    {/* SECTION 3: REFERENCES */}
                    < div id="sub-references" className="section-card" style={{ marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                                <UserCheck size={22} color="#5551ff" /> 3. References (Academic / Professional Referees)
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem', marginBottom: 0 }}>
                                Provide details of academic or professional referees who can attest to your academic &amp; professional background (Optional).
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                            {/* REFERENCE 1 */}
                            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', margin: '0 0 0.8rem 0' }}>Reference 1 (Optional)</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    <div>
                                        <label className="form-label">Referee Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={ref1.name}
                                            onChange={(e) => setRef1({ ...ref1, name: e.target.value })}
                                            placeholder="e.g. Dr. K. Ramasamy"
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label className="form-label">Designation</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={ref1.designation}
                                                onChange={(e) => setRef1({ ...ref1, designation: e.target.value })}
                                                placeholder="Professor & HOD"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Organization</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={ref1.org}
                                                onChange={(e) => setRef1({ ...ref1, org: e.target.value })}
                                                placeholder="Anna University / IIT"
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label className="form-label">Contact Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={ref1.phone}
                                                onChange={(e) => setRef1({ ...ref1, phone: e.target.value })}
                                                placeholder="9876543210"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={ref1.email}
                                                onChange={(e) => setRef1({ ...ref1, email: e.target.value })}
                                                placeholder="referee@university.edu"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Relationship / Capacity Known</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={ref1.relation}
                                            onChange={(e) => setRef1({ ...ref1, relation: e.target.value })}
                                            placeholder="e.g. Ph.D Guide / Former HOD"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* REFERENCE 2 */}
                            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', margin: '0 0 0.8rem 0' }}>Reference 2 (Optional)</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    <div>
                                        <label className="form-label">Referee Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={ref2.name}
                                            onChange={(e) => setRef2({ ...ref2, name: e.target.value })}
                                            placeholder="e.g. Dr. S. Sundaram"
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label className="form-label">Designation</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={ref2.designation}
                                                onChange={(e) => setRef2({ ...ref2, designation: e.target.value })}
                                                placeholder="Principal / Senior Scientist"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Organization</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={ref2.org}
                                                onChange={(e) => setRef2({ ...ref2, org: e.target.value })}
                                                placeholder="CSIR Lab / College Name"
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label className="form-label">Contact Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={ref2.phone}
                                                onChange={(e) => setRef2({ ...ref2, phone: e.target.value })}
                                                placeholder="Contact phone"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={ref2.email}
                                                onChange={(e) => setRef2({ ...ref2, email: e.target.value })}
                                                placeholder="Email address"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Relationship / Capacity Known</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={ref2.relation}
                                            onChange={(e) => setRef2({ ...ref2, relation: e.target.value })}
                                            placeholder="e.g. Research Mentor / Employer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: ANY OTHER INFORMATION */}
                    <div style={{ background: 'var(--color-bg-light)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <FileText size={20} color="#9333ea" />
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>4. Any Other Information &amp; Special Remarks</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Professional Memberships, Patents, Co-Curricular &amp; Other Accomplishments
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={otherAchievements}
                                    onChange={(e) => setOtherAchievements(e.target.value)}
                                    placeholder="List any professional memberships (IEEE/ISTE), patents filed/granted, extra-curricular accomplishments, sports, workshops organized, etc."
                                />
                            </div>

                            <div>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Special Remarks / Additional Information for Selection Committee
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={specialRemarks}
                                    onChange={(e) => setSpecialRemarks(e.target.value)}
                                    placeholder="Enter any other relevant details or remarks to convey to the recruitment scrutiny committee."
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* ACTION BUTTONS matching previous tabs */}
                <div className="profile-tab-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button type="button" onClick={onPrev} className="nav-btn primary" style={{ background: '#5551ff', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                        <ArrowLeft size={18} /> Back: Certifications
                    </button>
                    {!isSubmitted ? (
                        <button
                            type="button"
                            onClick={() => saveOtherData(false)}
                            disabled={loading}
                            className="nav-btn secondary"
                            style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}
                        >
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Other Details'}
                        </button>
                    ) : (
                        <span style={{ padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#64748b', borderRadius: '10px', fontWeight: 600, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                            🔒 Application Submitted (Edits Locked)
                        </span>
                    )}
                    {!isSubmitted ? (
                        <button
                            type="button"
                            onClick={initiateFinalSubmit}
                            disabled={loading}
                            className="nav-btn primary"
                            style={{ background: '#059669', padding: '0.75rem 1.5rem', borderRadius: '10px' }}
                        >
                            {loading ? 'Submitting...' : 'Submit Application Profile'} <ArrowRight size={18} />
                        </button>
                    ) : (
                        <span style={{ padding: '0.75rem 1.25rem', background: '#dcfce7', color: '#15803d', borderRadius: '10px', fontWeight: 600, border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <CheckCircle2 size={18} /> Application Submitted
                        </span>
                    )}
                </div>
            </form>

            {/* FINAL SUBMIT CONFIRMATION MODAL */}
            {
                isSubmitConfirmOpen && (
                    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                        <div className="modal-card" style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ background: '#fef3c7', padding: '0.65rem', borderRadius: '12px', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={28} color="#d97706" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                                        Confirm Final Application Submission
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        National Engineering College Staff Portal
                                    </span>
                                </div>
                            </div>

                            <div style={{ background: '#fffbebfb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', lineHeight: 1.5, fontWeight: 600 }}>
                                    ⚠️ Important Notice:
                                </p>
                                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.86rem', color: '#78350f', lineHeight: 1.5 }}>
                                    Are you sure you want to submit your application? Once submitted, your profile details will be <strong>locked and cannot be edited</strong>. Please verify all entries before proceeding.
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsSubmitConfirmOpen(false)}
                                    style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                                >
                                    Cancel &amp; Review
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSubmitConfirmOpen(false);
                                        setIsPreviewOpen(true);
                                    }}
                                    style={{ padding: '0.65rem 1.1rem', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                    <Eye size={17} /> Preview Application
                                </button>
                                <button
                                    type="button"
                                    onClick={() => saveOtherData(true, true)}
                                    disabled={loading}
                                    style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)' }}
                                >
                                    {loading ? 'Submitting...' : 'Yes, Confirm & Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* APPLICATION PREVIEW MODAL */}
            {
                isPreviewOpen && (
                    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
                        <div className="modal-card" style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '920px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>

                            {/* Preview Header */}
                            <div style={{ padding: '1.1rem 1.5rem', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: '#2563eb', padding: '0.45rem', borderRadius: '10px', display: 'flex' }}>
                                        <Eye size={20} color="#ffffff" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>Full Application Form Preview</h3>
                                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Review complete candidate profile details prior to submission</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                    >
                                        <Printer size={15} /> Print / Save PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsPreviewOpen(false)}
                                        style={{ padding: '0.45rem', borderRadius: '8px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Preview Body */}
                            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>

                                {/* Printable PDF Hook */}
                                <PrintableApplicationForm application={{
                                    personal: profileData?.personal || {},
                                    education: profileData?.education || [],
                                    experience: profileData?.experience || [],
                                    journal_publications: profileData?.journal_publications || [],
                                    research_projects: profileData?.research_projects || [],
                                    funded_consultancy: profileData?.funded_consultancy || [],
                                    certifications: profileData?.certifications || [],
                                    phd_details: profileData?.phd_details || {},
                                    awards: awards && awards.length > 0 ? awards : (profileData?.awards || []),
                                    other_details: {
                                        ...(profileData?.other_details || {}),
                                        spouse_name: familyForm.spouse_name,
                                        spouse_occupation: familyForm.spouse_occupation,
                                        spouse_org: familyForm.spouse_org,
                                        no_of_children: familyForm.no_of_children,
                                        no_of_dependents: familyForm.no_of_dependents,
                                        father_occupation: familyForm.father_occupation,
                                        mother_occupation: familyForm.mother_occupation,
                                        ref1_name: ref1.name,
                                        ref1_designation: ref1.designation,
                                        ref1_org: ref1.org,
                                        ref1_phone: ref1.phone,
                                        ref1_email: ref1.email,
                                        ref1_relation: ref1.relation,
                                        ref2_name: ref2.name,
                                        ref2_designation: ref2.designation,
                                        ref2_org: ref2.org,
                                        ref2_phone: ref2.phone,
                                        ref2_email: ref2.email,
                                        ref2_relation: ref2.relation,
                                        professional_memberships: profileData?.other_details?.professional_memberships || '',
                                        other_achievements: otherAchievements || specialRemarks || ''
                                    }
                                }} />

                                {/* Banner Overview */}
                                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.1rem', border: '1px solid #e2e8f0', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '75px', height: '85px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {profileData?.personal?.photo_path ? (
                                            <img src={profileData.personal.photo_path} alt="Candidate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>No Photo</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                                {profileData?.personal?.full_name || 'N/A'}
                                            </h2>
                                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                Pre-Submission Preview
                                            </span>
                                        </div>
                                        <p style={{ margin: '0.2rem 0 0.4rem 0', fontSize: '0.85rem', color: '#1e3a8a', fontWeight: 600 }}>
                                            Post Applied: {profileData?.personal?.post || 'Assistant Professor'} | Department: {profileData?.personal?.department || 'N/A'}
                                        </p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.4rem', fontSize: '0.8rem', color: '#475569' }}>
                                            <div><strong>Email:</strong> {profileData?.personal?.user_email || profileData?.personal?.email || user?.email || 'N/A'}</div>
                                            <div><strong>Phone:</strong> {profileData?.personal?.phone || 'N/A'}</div>
                                            <div><strong>DOB:</strong> {profileData?.personal?.dob ? String(profileData.personal.dob).substring(0, 10) : 'N/A'}</div>
                                            <div><strong>Community:</strong> {profileData?.personal?.community || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 1. Personal Info */}
                                <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d4ed8', borderBottom: '2px solid #eff6ff', paddingBottom: '0.4rem', marginTop: 0, marginBottom: '0.6rem' }}>
                                        1. Personal &amp; Contact Information
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.83rem', color: '#334155' }}>
                                        <div><strong>Father's Name:</strong> {profileData?.personal?.father_name || 'N/A'}</div>
                                        <div><strong>Mother's Name:</strong> {profileData?.personal?.mother_name || 'N/A'}</div>
                                        <div><strong>Gender / Blood Group:</strong> {profileData?.personal?.gender || 'N/A'} {profileData?.personal?.blood_group ? `(${profileData.personal.blood_group})` : ''}</div>
                                        <div><strong>Marital Status:</strong> {profileData?.personal?.marital_status || 'N/A'}</div>
                                        <div><strong>Aadhaar No:</strong> {profileData?.personal?.aadhaar || 'N/A'}</div>
                                        <div><strong>Religion / Nationality:</strong> {profileData?.personal?.religion || 'N/A'} / {profileData?.personal?.nationality || 'Indian'}</div>
                                        <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {profileData?.personal?.communication_address || profileData?.personal?.permanent_address || 'N/A'}</div>
                                    </div>
                                </div>

                                {/* 2. Education */}
                                <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d4ed8', borderBottom: '2px solid #eff6ff', paddingBottom: '0.4rem', marginTop: 0, marginBottom: '0.6rem' }}>
                                        2. Educational Qualifications &amp; Ph.D
                                    </h4>
                                    {(!profileData?.education || profileData.education.length === 0) ? (
                                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>No educational details recorded.</p>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                            <thead>
                                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                                    <th style={{ padding: '0.4rem' }}>Level</th>
                                                    <th style={{ padding: '0.4rem' }}>Degree &amp; Specialization</th>
                                                    <th style={{ padding: '0.4rem' }}>Institution / Board</th>
                                                    <th style={{ padding: '0.4rem', textAlign: 'center' }}>Year</th>
                                                    <th style={{ padding: '0.4rem', textAlign: 'center' }}>Percentage</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profileData.education.map((e, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>{e.qual_type}</td>
                                                        <td style={{ padding: '0.4rem' }}>{e.degree} {e.specialization ? `(${e.specialization})` : ''}</td>
                                                        <td style={{ padding: '0.4rem' }}>{e.institution_name || 'N/A'}</td>
                                                        <td style={{ padding: '0.4rem', textAlign: 'center' }}>{e.year_of_passing || 'N/A'}</td>
                                                        <td style={{ padding: '0.4rem', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{e.percentage ? `${e.percentage}%` : 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    {profileData?.phd_details?.university && (
                                        <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.82rem' }}>
                                            <strong>Ph.D Status:</strong> {profileData.phd_details.phd_status} | <strong>University:</strong> {profileData.phd_details.university}
                                            {profileData.phd_details.title && <div><strong>Thesis Title:</strong> <em>"{profileData.phd_details.title}"</em></div>}
                                        </div>
                                    )}
                                </div>

                                {/* 3. Experience */}
                                <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d4ed8', borderBottom: '2px solid #eff6ff', paddingBottom: '0.4rem', marginTop: 0, marginBottom: '0.6rem' }}>
                                        3. Professional Work Experience
                                    </h4>
                                    {(!profileData?.experience || profileData.experience.length === 0) ? (
                                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>Fresher Candidate (No prior experience recorded).</p>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                            <thead>
                                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                                    <th style={{ padding: '0.4rem' }}>Designation</th>
                                                    <th style={{ padding: '0.4rem' }}>Organization</th>
                                                    <th style={{ padding: '0.4rem' }}>Type</th>
                                                    <th style={{ padding: '0.4rem' }}>Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profileData.experience.map((ex, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '0.4rem', fontWeight: 700 }}>{ex.designation}</td>
                                                        <td style={{ padding: '0.4rem' }}>{ex.org_name}</td>
                                                        <td style={{ padding: '0.4rem' }}>{ex.exp_type || 'Teaching'}</td>
                                                        <td style={{ padding: '0.4rem' }}>
                                                            {ex.from_date ? String(ex.from_date).substring(0, 10) : ''} to {ex.to_date ? String(ex.to_date).substring(0, 10) : 'Present'}{' '}
                                                            <span style={{ color: '#0284c7', fontWeight: 600 }}>({ex.total_duration || 'N/A'})</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* 4. Research & Consultancy */}
                                <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d4ed8', borderBottom: '2px solid #eff6ff', paddingBottom: '0.4rem', marginTop: 0, marginBottom: '0.6rem' }}>
                                        4. Research Contributions &amp; Publications
                                    </h4>
                                    {profileData?.journal_publications && profileData.journal_publications.length > 0 ? (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <strong style={{ fontSize: '0.82rem', color: '#6d28d9' }}>Journal Publications (SCI/Scopus):</strong>
                                            <ul style={{ margin: '0.2rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: '#334155' }}>
                                                {profileData.journal_publications.map((p, idx) => (
                                                    <li key={idx}>
                                                        <strong>[{p.journal_type || 'SCI'}]</strong> "{p.paper_title}" — <em>{p.journal_name}</em>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}
                                    {profileData?.research_projects && profileData.research_projects.length > 0 ? (
                                        <div>
                                            <strong style={{ fontSize: '0.82rem', color: '#1e3a8a' }}>Funded Research Projects:</strong>
                                            <ul style={{ margin: '0.2rem 0 0 1rem', padding: 0, fontSize: '0.82rem', color: '#334155' }}>
                                                {profileData.research_projects.map((proj, idx) => (
                                                    <li key={idx}>
                                                        "{proj.project_title}" — ₹{proj.amount ? parseFloat(proj.amount).toLocaleString('en-IN') : '0'}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}
                                    {(!profileData?.journal_publications?.length && !profileData?.research_projects?.length && !profileData?.funded_consultancy?.length) && (
                                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>No research publications or project entries recorded.</p>
                                    )}
                                </div>

                                {/* 5. Certifications & Awards */}
                                <div style={{ background: '#ffffff', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d4ed8', borderBottom: '2px solid #eff6ff', paddingBottom: '0.4rem', marginTop: 0, marginBottom: '0.6rem' }}>
                                        5. Certifications, Awards &amp; References
                                    </h4>
                                    {awards && awards.length > 0 && (
                                        <div style={{ marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                                            <strong style={{ color: '#d97706' }}>Honors &amp; Awards:</strong> {awards.map(a => a.title).join(', ')}
                                        </div>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                                        <div><strong>Spouse Name:</strong> {familyForm.spouse_name || 'N/A'} ({familyForm.spouse_occupation || 'N/A'})</div>
                                        <div><strong>Children / Dependents:</strong> {familyForm.no_of_children || 0} / {familyForm.no_of_dependents || 0}</div>
                                        <div><strong>Father's Occ.:</strong> {familyForm.father_occupation || 'N/A'}</div>
                                        <div><strong>Mother's Occ.:</strong> {familyForm.mother_occupation || 'N/A'}</div>
                                    </div>
                                    {ref1.name && (
                                        <div style={{ marginTop: '0.4rem', paddingTop: '0.3rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.81rem' }}>
                                            <strong>Referee 1:</strong> {ref1.name} ({ref1.designation}, {ref1.org}) — Ph: {ref1.phone || 'N/A'}
                                        </div>
                                    )}
                                    {ref2.name && (
                                        <div style={{ marginTop: '0.2rem', fontSize: '0.81rem' }}>
                                            <strong>Referee 2:</strong> {ref2.name} ({ref2.designation}, {ref2.org}) — Ph: {ref2.phone || 'N/A'}
                                        </div>
                                    )}
                                </div>

                                {/* Declaration */}
                                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem', color: '#1e3a8a', fontSize: '0.81rem', lineHeight: 1.4 }}>
                                    <strong>Declaration:</strong> I hereby declare that all information provided in this application is true, complete and correct.
                                </div>
                            </div>

                            {/* Preview Footer */}
                            <div style={{ padding: '0.9rem 1.5rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsPreviewOpen(false)}
                                    style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Close Preview
                                </button>
                                <div style={{ display: 'flex', gap: '0.6rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                    >
                                        <Printer size={15} /> Print / Save PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPreviewOpen(false);
                                            saveOtherData(true, true);
                                        }}
                                        disabled={loading}
                                        style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)' }}
                                    >
                                        <CheckCircle2 size={17} /> Confirm &amp; Submit Application
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* AWARD MODAL */}
            {
                isAwardModalOpen && (
                    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
                        <div className="modal-card" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '550px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Trophy size={18} color="#d97706" /> {editingAwardIdx !== null ? 'Edit Award Entry' : 'Add Award Entry'}
                                </h3>
                                <button type="button" onClick={() => setIsAwardModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form className={modalValidated ? 'was-validated' : ''} noValidate onSubmit={(e) => e.preventDefault()}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label">Award / Distinction Title <span className="mandatory-star">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={awardForm.title}
                                            onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })}
                                            placeholder="e.g. Best Researcher Award / Young Scientist Honor"
                                        />
                                    </div>

                                    <div>
                                        <label className="form-label">Awarding Body / Organization <span className="mandatory-star">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={awardForm.organization}
                                            onChange={(e) => setAwardForm({ ...awardForm, organization: e.target.value })}
                                            placeholder="e.g. DST / IEEE / Anna University / Institution"
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label className="form-label">Category</label>
                                            <select
                                                className="form-control"
                                                value={awardForm.category}
                                                onChange={(e) => setAwardForm({ ...awardForm, category: e.target.value })}
                                            >
                                                <option value="International">International</option>
                                                <option value="National">National</option>
                                                <option value="State">State</option>
                                                <option value="Institutional">Institutional</option>
                                                <option value="Academic">Academic</option>
                                                <option value="Industry">Industry</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Year of Award</label>
                                            <select
                                                className="form-control"
                                                value={awardForm.year}
                                                onChange={(e) => setAwardForm({ ...awardForm, year: e.target.value })}
                                            >
                                                {generateYearOptions().map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label">Prize / Cash Amount / Memento</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={awardForm.prize}
                                            onChange={(e) => setAwardForm({ ...awardForm, prize: e.target.value })}
                                            placeholder="e.g. Gold Medal & ₹10,000 / Citation & Trophy"
                                        />
                                    </div>

                                    <div>
                                        <label className="form-label">Award Certificate Proof (PDF / Image)</label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            className="form-control"
                                            onChange={handleAwardFileUpload}
                                        />
                                        {uploadingDoc && <span style={{ fontSize: '0.8rem', color: '#0284c7' }}>Uploading document...</span>}
                                        {awardForm.proof_doc && (
                                            <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#16a34a' }}>
                                                ✓ Document attached:{' '}
                                                <a href={awardForm.proof_doc} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                                                    View Document
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsAwardModalOpen(false)}
                                        className="btn btn-secondary"
                                        style={{
                                            padding: '0.65rem 1.25rem',
                                            borderRadius: '8px',
                                            border: '1px solid #bfdbfe',
                                            background: '#eff6ff',
                                            color: '#1d4ed8',
                                            fontWeight: 600,
                                            fontSize: '0.88rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={saveAwardModal}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '0.65rem 1.35rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#2563eb',
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '0.88rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        Save Award
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
