import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from '../Banner';
import { User, Camera, ArrowRight, Save, Phone } from 'lucide-react';

export const PersonalTab = ({ profileData, onSaveSuccess, onNext }) => {
    const { user } = useAuth();
    const formRef = useRef(null);
    const [banner, setBanner] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [jobCalls, setJobCalls] = useState([]);

    useEffect(() => {
        fetch('/api/dropdowns?category=post')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    if (data.options) {
                        setPosts(data.options);
                    } else if (data.dropdowns && data.dropdowns.post) {
                        setPosts(data.dropdowns.post);
                    }
                }
            })
            .catch((err) => console.warn('Failed to fetch active posts:', err));

        fetch('/api/dropdowns?category=job_call')
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.options) {
                    setJobCalls(data.options);
                }
            })
            .catch((err) => console.warn('Failed to fetch job calls:', err));
    }, []);
    const formatDateValue = (val) => {
        if (!val) return '';
        if (typeof val === 'string') {
            const match = val.match(/^\d{4}-\d{2}-\d{2}/);
            if (match) return match[0];
        }
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [photoPreview, setPhotoPreview] = useState(profileData?.personal?.photo_path || null);
    const [activeOtherField, setActiveOtherField] = useState(null);

    const [formData, setFormData] = useState({
        appliedDate: formatDateValue(profileData?.personal?.applied_date) || formatDateValue(new Date()),
        post: profileData?.personal?.post || '',
        postOther: profileData?.personal?.post_other || '',
        fullName: profileData?.personal?.full_name || '',
        dob: formatDateValue(profileData?.personal?.dob),
        age: profileData?.personal?.age || '',
        fatherName: profileData?.personal?.father_name || '',
        motherName: profileData?.personal?.mother_name || '',
        gender: profileData?.personal?.gender || 'Male',
        genderOther: profileData?.personal?.gender_other || '',
        bloodGroup: profileData?.personal?.blood_group || 'O+',
        bloodGroupOther: profileData?.personal?.blood_group_other || '',
        maritalStatus: profileData?.personal?.marital_status || 'Single',
        spouseName: profileData?.personal?.spouse_name || '',
        maritalStatusOther: profileData?.personal?.marital_status_other || '',
        nationality: profileData?.personal?.nationality || 'Indian',
        religion: profileData?.personal?.religion || 'Hindu',
        religionOther: profileData?.personal?.religion_other || '',
        community: profileData?.personal?.community || 'BC',
        communityOther: profileData?.personal?.community_other || '',
        caste: profileData?.personal?.caste || '',
        email: profileData?.personal?.email || user?.email || '',
        altEmail: profileData?.personal?.alt_email || '',
        phone: profileData?.personal?.phone || '',
        whatsapp: profileData?.personal?.whatsapp || '',
        emergencyName: profileData?.personal?.emergency_name || '',
        emergencyRelation: profileData?.personal?.emergency_relation || '',
        emergencyPhone: profileData?.personal?.emergency_phone || '',
        aadhaar: profileData?.personal?.aadhaar || '',
        permanentAddress: profileData?.personal?.permanent_address || '',
        communicationAddress: profileData?.personal?.communication_address || '',
        state: profileData?.personal?.state || 'Tamil Nadu',
        district: profileData?.personal?.district || 'Thoothukudi',
        pincode: profileData?.personal?.pincode || '',
    });

    const [photoFile, setPhotoFile] = useState(null);

    useEffect(() => {
        if (profileData?.personal) {
            const p = profileData.personal;
            setFormData({
                appliedDate: formatDateValue(p.applied_date) || formatDateValue(new Date()),
                post: p.post || 'Assistant Professor',
                postOther: p.post_other || '',
                fullName: p.full_name || '',
                dob: formatDateValue(p.dob),
                age: p.age || '',
                fatherName: p.father_name || '',
                motherName: p.mother_name || '',
                gender: p.gender || 'Male',
                genderOther: p.gender_other || '',
                bloodGroup: p.blood_group || 'O+',
                bloodGroupOther: p.blood_group_other || '',
                maritalStatus: p.marital_status || 'Single',
                spouseName: p.spouse_name || '',
                maritalStatusOther: p.marital_status_other || '',
                nationality: p.nationality || 'Indian',
                religion: p.religion || 'Hindu',
                religionOther: p.religion_other || '',
                community: p.community || 'BC',
                communityOther: p.community_other || '',
                caste: p.caste || '',
                email: p.email || user?.email || '',
                altEmail: p.alt_email || '',
                phone: p.phone || '',
                whatsapp: p.whatsapp || '',
                emergencyName: p.emergency_name || '',
                emergencyRelation: p.emergency_relation || '',
                emergencyPhone: p.emergency_phone || '',
                aadhaar: p.aadhaar || '',
                permanentAddress: p.permanent_address || '',
                communicationAddress: p.communication_address || '',
                state: p.state || 'Tamil Nadu',
                district: p.district || 'Thoothukudi',
                pincode: p.pincode || '',
            });
            if (p.photo_path) setPhotoPreview(p.photo_path);
        }
    }, [profileData, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === 'dob' && value) {
                const parts = value.split('-');
                if (parts.length === 3) {
                    const birthDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                    updated.age = age > 0 ? age.toString() : '0';
                }
            }
            return updated;
        });
        if (value === 'Other') {
            setActiveOtherField(name);
        }
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const savePersonalData = async () => {
        setBanner({ type: '', message: '' });
        setLoading(true);

        try {
            const data = new FormData();
            data.append('user_email', user?.email || '');
            Object.keys(formData).forEach((key) => {
                data.append(key, formData[key]);
            });
            if (photoFile) {
                data.append('photoDoc', photoFile);
            }

            const res = await fetch('/api/personal', {
                method: 'POST',
                body: data,
            });

            const result = await res.json();
            if (result.success) {
                setBanner({ type: 'success', message: 'Personal details saved successfully!' });
                if (result.photo_path) setPhotoPreview(result.photo_path);
                if (onSaveSuccess) onSaveSuccess();
                return true;
            } else {
                setBanner({ type: 'error', message: result.message || 'Failed to save personal details.' });
                return false;
            }
        } catch (err) {
            setBanner({ type: 'error', message: 'Server connection error.' });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        await savePersonalData();
    };

    const handleNextClick = async () => {
        if (formRef.current && !formRef.current.reportValidity()) {
            setBanner({ type: 'error', message: 'Please fill out all mandatory fields before proceeding to the next tab.' });
            return;
        }
        const saved = await savePersonalData();
        if (saved && onNext) {
            onNext();
        }
    };

    return (
        <div>
            <Banner type={banner.type} message={banner.message} />

            <form ref={formRef} onSubmit={handleSubmit}>
                {/* Card 1: Identification & Basic Info */}
                <div id="sub-basic" className="section-card">
                    <div className="section-card-header">
                        <User size={20} color="#3b82f6" /> Identification &amp; Basic Info
                    </div>

                    <div className="grid-2">
                        <div className="field">
                            <label>Full Name (as in certificates) <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Dr. / Mr. / Ms." required />
                        </div>

                        <div className="field">
                            <label>
                                Upload Passport Photo {!photoPreview && <span style={{ color: '#ef4444' }}>*</span>}
                            </label>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                                <label
                                    htmlFor="passport-photo-upload"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '0.45rem 0.85rem',
                                        background: 'var(--color-bg-light)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        color: 'var(--color-text-main)',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        userSelect: 'none'
                                    }}
                                >
                                    Choose File
                                </label>
                                <input
                                    id="passport-photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    style={{ display: 'none' }}
                                    required={!photoPreview && !photoFile}
                                />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: (photoFile || photoPreview) ? '#10b981' : 'var(--color-text-muted)' }}>
                                    {photoFile ? photoFile.name : photoPreview ? '✓ Photo Uploaded' : 'No file chosen'}
                                </span>
                            </div>
                        </div>

                        <div className="field">
                            <label>Applied Date <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="date" name="appliedDate" value={formData.appliedDate} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <label>Post Applied For <span style={{ color: '#ef4444' }}>*</span></label>
                            <select name="post" value={formData.post} onChange={handleChange} onClick={() => { if (formData.post === 'Other') setActiveOtherField('post'); }} required>
                                <option value="" disabled>Select post</option>
                                {posts.length > 0 ? (
                                    posts.map((p, idx) => (
                                        <option key={p.id || idx} value={p.value || p.option_value}>
                                            {p.label || p.option_label}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="Assistant Professor">Assistant Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Lab Assistant">Lab Assistant</option>
                                        <option value="Administrative Staff">Administrative Staff</option>
                                        <option value="Other">{formData.postOther || 'Other'}</option>
                                    </>
                                )}
                            </select>
                            {formData.post === 'Other' && (activeOtherField === 'post' || !formData.postOther) && (
                                <input
                                    type="text"
                                    name="postOther"
                                    value={formData.postOther || ''}
                                    onChange={handleChange}
                                    onBlur={() => { if (formData.postOther?.trim()) setActiveOtherField(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                    placeholder="Type custom post here..."
                                    className="select-other-input"
                                    autoFocus
                                    required
                                />
                            )}
                        </div>

                        <div className="field">
                            <label>Date of Birth <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <label>Age (years)</label>
                            <input type="number" name="age" value={formData.age} readOnly />
                        </div>

                        <div className="field">
                            <label>Gender <span style={{ color: '#ef4444' }}>*</span></label>
                            <select name="gender" value={formData.gender} onChange={handleChange} onClick={() => { if (formData.gender === 'Other') setActiveOtherField('gender'); }} required>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Transgender">Transgender</option>
                                <option value="Other">{formData.genderOther || 'Other'}</option>
                            </select>
                            {formData.gender === 'Other' && (activeOtherField === 'gender' || !formData.genderOther) && (
                                <input
                                    type="text"
                                    name="genderOther"
                                    value={formData.genderOther || ''}
                                    onChange={handleChange}
                                    onBlur={() => { if (formData.genderOther?.trim()) setActiveOtherField(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                    placeholder="Type custom gender here..."
                                    className="select-other-input"
                                    autoFocus
                                    required
                                />
                            )}
                        </div>

                        <div className="field">
                            <label>Father's Name <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <label>Mother's Name <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <label>Blood Group</label>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} onClick={() => { if (formData.bloodGroup === 'Other') setActiveOtherField('bloodGroup'); }}>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="Other">{formData.bloodGroupOther || 'Other'}</option>
                            </select>
                            {formData.bloodGroup === 'Other' && (activeOtherField === 'bloodGroup' || !formData.bloodGroupOther) && (
                                <input
                                    type="text"
                                    name="bloodGroupOther"
                                    value={formData.bloodGroupOther || ''}
                                    onChange={handleChange}
                                    onBlur={() => { if (formData.bloodGroupOther?.trim()) setActiveOtherField(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                    placeholder="Type custom blood group..."
                                    className="select-other-input"
                                    autoFocus
                                    required
                                />
                            )}
                        </div>

                        <div className="field">
                            <label>Marital Status</label>
                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Divorced">Divorced</option>
                            </select>
                        </div>

                        {formData.maritalStatus === 'Married' && (
                            <div className="field">
                                <label>Spouse Name</label>
                                <input type="text" name="spouseName" value={formData.spouseName} onChange={handleChange} />
                            </div>
                        )}

                        <div className="field">
                            <label>Nationality <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <label>Religion <span style={{ color: '#ef4444' }}>*</span></label>
                            <select name="religion" value={formData.religion} onChange={handleChange} onClick={() => { if (formData.religion === 'Other') setActiveOtherField('religion'); }} required>
                                <option value="Hindu">Hindu</option>
                                <option value="Christian">Christian</option>
                                <option value="Muslim">Muslim</option>
                                <option value="Sikh">Sikh</option>
                                <option value="Jain">Jain</option>
                                <option value="Other">{formData.religionOther || 'Other'}</option>
                            </select>
                            {formData.religion === 'Other' && (activeOtherField === 'religion' || !formData.religionOther) && (
                                <input
                                    type="text"
                                    name="religionOther"
                                    value={formData.religionOther || ''}
                                    onChange={handleChange}
                                    onBlur={() => { if (formData.religionOther?.trim()) setActiveOtherField(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                    placeholder="Type custom religion..."
                                    className="select-other-input"
                                    autoFocus
                                    required
                                />
                            )}
                        </div>

                        <div className="field">
                            <label>Community <span style={{ color: '#ef4444' }}>*</span></label>
                            <select name="community" value={formData.community} onChange={handleChange} onClick={() => { if (formData.community === 'Other') setActiveOtherField('community'); }} required>
                                <option value="OC">OC (Open Category)</option>
                                <option value="BC">BC (Backward Class)</option>
                                <option value="BCM">BCM (Backward Class Muslim)</option>
                                <option value="MBC">MBC / DNC</option>
                                <option value="SC">SC (Scheduled Caste)</option>
                                <option value="SCA">SCA (SC Arunthathiyar)</option>
                                <option value="ST">ST (Scheduled Tribe)</option>
                                <option value="Other">{formData.communityOther || 'Other'}</option>
                            </select>
                            {formData.community === 'Other' && (activeOtherField === 'community' || !formData.communityOther) && (
                                <input
                                    type="text"
                                    name="communityOther"
                                    value={formData.communityOther || ''}
                                    onChange={handleChange}
                                    onBlur={() => { if (formData.communityOther?.trim()) setActiveOtherField(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                    placeholder="Type custom community..."
                                    className="select-other-input"
                                    autoFocus
                                    required
                                />
                            )}
                        </div>

                        <div className="field">
                            <label>Caste <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" name="caste" value={formData.caste} onChange={handleChange} placeholder="e.g. Nadar, Pillai..." required />
                        </div>
                    </div>
                </div>

                {/* Card 2: Contact Information */}
                <div id="sub-contact" className="section-card">
                    <div className="section-card-header">
                        <Phone size={20} color="#3b82f6" /> Contact Information
                    </div>
                    <div className="grid-2">
                        <div className="field">
                            <label>Email Address (Primary) <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <label>Personal / Alternate Mail ID</label>
                            <input type="email" name="altEmail" value={formData.altEmail} onChange={handleChange} />
                        </div>

                        <div className="field">
                            <label>Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" required />
                        </div>

                        <div className="field">
                            <label>WhatsApp Number</label>
                            <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
                        </div>

                        <div className="field">
                            <label>Emergency Contact Name</label>
                            <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} />
                        </div>

                        <div className="field">
                            <label>Emergency Contact No</label>
                            <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} />
                        </div>

                        <div className="field">
                            <label>Aadhaar Card Number</label>
                            <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} placeholder="12-digit Aadhaar" />
                        </div>
                    </div>
                </div>

                {/* Card 3: Address Information */}
                <div id="sub-address" className="section-card">
                    <div className="section-card-header">
                        📍 Address Information
                    </div>
                    <div className="grid-2" style={{ marginBottom: '1rem' }}>
                        <div className="field">
                            <label>Permanent Address <span style={{ color: '#ef4444' }}>*</span></label>
                            <textarea name="permanentAddress" rows={3} value={formData.permanentAddress} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <label style={{ margin: 0 }}>Communication Address <span style={{ color: '#ef4444' }}>*</span></label>
                                <label style={{ fontSize: '0.8rem', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData((prev) => ({ ...prev, communicationAddress: prev.permanentAddress }));
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    Same as Permanent Address
                                </label>
                            </div>
                            <textarea name="communicationAddress" rows={3} value={formData.communicationAddress} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="field">
                            <label>State <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <label>District <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" name="district" value={formData.district} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <label>Pincode <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {/* Bottom Action Buttons Bar */}
                < div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" disabled={loading} className="nav-btn secondary" style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Personal Details'}
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleNextClick}
                        className="nav-btn primary"
                        style={{ background: '#2563eb', padding: '0.75rem 1.5rem', borderRadius: '10px' }}
                    >
                        Next: Education Details <ArrowRight size={18} />
                    </button>
                </div >
            </form >
        </div >
    );
};
