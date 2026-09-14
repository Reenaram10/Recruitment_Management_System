import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Banner } from '../Banner';
import { GraduationCap, ArrowRight, ArrowLeft, Save } from 'lucide-react';

const ugSpecializationMap = {
    'B.E.': [
        'Computer Science and Engineering',
        'Electronics and Communication Engineering',
        'Electrical and Electronics Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Information Technology',
        'Artificial Intelligence and Data Science',
        'Chemical Engineering',
        'Biomedical Engineering',
        'Mechatronics Engineering',
        'Automobile Engineering',
        'Other'
    ],
    'B.Tech.': [
        'Computer Science and Engineering',
        'Information Technology',
        'Electronics and Communication Engineering',
        'Electrical and Electronics Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Artificial Intelligence and Data Science',
        'Artificial Intelligence and Machine Learning',
        'Chemical Engineering',
        'Biomedical Engineering',
        'Other'
    ],
    'B.Sc.': [
        'Computer Science',
        'Information Technology',
        'Physics',
        'Chemistry',
        'Mathematics',
        'Biotechnology',
        'Microbiology',
        'Biochemistry',
        'Statistics',
        'Botany',
        'Zoology',
        'Electronics',
        'Other'
    ],
    'B.A.': [
        'English Literature',
        'Tamil Literature',
        'History',
        'Economics',
        'Political Science',
        'Sociology',
        'Psychology',
        'Other'
    ],
    'B.Com.': [
        'General Commerce',
        'Accounting and Finance',
        'Banking and Insurance',
        'Computer Applications',
        'Corporate Secretaryship',
        'Other'
    ],
    'B.C.A.': [
        'Computer Applications',
        'Software Engineering',
        'Data Science',
        'Cyber Security',
        'Other'
    ],
    'Other': ['Other']
};

const pgSpecializationMap = {
    'M.E.': [
        // ECE
        'Embedded Systems',
        'VLSI Design',
        'Communication Systems',
        'Signal Processing & AI',
        'Wireless & Mobile Technologies',
        'Robotics & Automation',
        // CSE / IT
        'Computational Intelligence',
        'Blockchain Technology',
        'AR / VR (Augmented & Virtual Reality)',
        'Full Stack Web Development',
        'Business Analytics',
        'Cyber Security & Digital Forensics',
        'Artificial Intelligence & Machine Learning',
        'Data Science & Analytics',
        'Cloud Computing & DevOps',
        // EEE
        'Power Electronics & Drives',
        'Power Systems Engineering',
        'Renewable Energy Systems',
        'Electric Vehicle (EV) Technology',
        // MECH
        'CAD / CAM & Product Design',
        'Thermal Engineering',
        'Mechatronics & Automation',
        // CIVIL
        'Structural Engineering',
        'Environmental Engineering',
        'Construction Engineering & Management',
        'Other'
    ],
    'M.Tech.': [
        // ECE
        'Embedded Systems',
        'VLSI Design',
        'Communication Systems & Signal Processing',
        // CSE / IT
        'Computational Intelligence',
        'Blockchain Technology',
        'AR / VR (Augmented & Virtual Reality)',
        'Full Stack Web Development',
        'Business Analytics',
        'Cyber Security & Digital Forensics',
        'Artificial Intelligence & Machine Learning',
        'Data Science & Analytics',
        'Cloud Computing & DevOps',
        'Biotechnology & Bioinformatics',
        'Other'
    ],
    'M.Sc.': [
        'Computer Science',
        'Information Technology',
        'Physics / Applied Electronics',
        'Chemistry / Organic Chemistry',
        'Mathematics / Applied Mathematics',
        'Biotechnology',
        'Data Science & Analytics',
        'Other'
    ],
    'M.A.': [
        'English Literature',
        'Tamil Literature',
        'History',
        'Economics',
        'Other'
    ],
    'M.Com.': [
        'General Commerce',
        'Accounting & Finance',
        'Banking & Insurance',
        'Other'
    ],
    'M.C.A.': [
        'Computer Applications',
        'Software Engineering',
        'Cloud & Web Technologies',
        'Data Science',
        'Other'
    ],
    'M.B.A.': [
        'Finance Management',
        'Marketing Management',
        'Human Resource Management (HR)',
        'Systems / Information Technology',
        'Operations & Supply Chain Management',
        'Other'
    ],
    'Other': ['Other']
};

const getDepartmentPgSpecializations = (degree, dept) => {
    const rawDept = (dept || '').toUpperCase().trim();

    const isCseItAids = rawDept.includes('CSE') ||
        rawDept.includes('IT') ||
        rawDept.includes('AIDS') ||
        rawDept.includes('COMPUTER') ||
        rawDept.includes('INFORMATION TECHNOLOGY') ||
        rawDept.includes('ARTIFICIAL INTELLIGENCE') ||
        rawDept.includes('DATA SCIENCE');

    const isEce = rawDept.includes('ECE') ||
        rawDept.includes('ELECTRONICS') ||
        rawDept.includes('COMMUNICATION');

    const isEee = rawDept.includes('EEE') ||
        rawDept.includes('ELECTRICAL');

    const isMech = rawDept.includes('MECH') ||
        rawDept.includes('MECHANICAL');

    const isCivil = rawDept.includes('CIVIL');

    if (isCseItAids) {
        return [
            'Computational Intelligence',
            'Blockchain Technology',
            'AR / VR (Augmented & Virtual Reality)',
            'Full Stack Web Development',
            'Business Analytics',
            'Cyber Security & Digital Forensics',
            'Artificial Intelligence & Machine Learning',
            'Data Science & Analytics',
            'Cloud Computing & DevOps',
            'Computer Science and Engineering',
            'Information Technology',
            'Software Engineering',
            'Computer Applications'
        ];
    }

    if (isEce) {
        return [
            'Embedded Systems',
            'VLSI Design',
            'Communication Systems',
            'Signal Processing & AI',
            'Wireless & Mobile Technologies',
            'Robotics & Automation',
            'Communication Systems & Signal Processing'
        ];
    }

    if (isEee) {
        return [
            'Power Electronics & Drives',
            'Power Systems Engineering',
            'Renewable Energy Systems',
            'Electric Vehicle (EV) Technology'
        ];
    }

    if (isMech) {
        return [
            'CAD / CAM & Product Design',
            'Thermal Engineering',
            'Mechatronics & Automation'
        ];
    }

    if (isCivil) {
        return [
            'Structural Engineering',
            'Environmental Engineering',
            'Construction Engineering & Management'
        ];
    }

    return pgSpecializationMap[degree] || ['Other'];
};

const generateYearOptions = (startYear = 1960, endYear = new Date().getFullYear() + 2) => {
    const years = [];
    for (let y = endYear; y >= startYear; y--) {
        years.push(y);
    }
    return years;
};

export const EducationTab = ({ profileData, onSaveSuccess, onNext, onPrev }) => {
    const { user } = useAuth();
    const formRef = useRef(null);
    const [banner, setBanner] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [activeOtherField, setActiveOtherField] = useState(null);
    const hasLoadedRef = useRef(false);
    const isDirtyRef = useRef(false);
    const [collegesList, setCollegesList] = useState([]);
    const [files, setFiles] = useState({});
    const [dynamicPgDomains, setDynamicPgDomains] = useState([]);

    const [edu, setEdu] = useState({
        // 10th
        tenthNA: false,
        tenthPercentage: '',
        tenthYear: '',
        tenthMedium: 'Tamil',
        tenthMediumOther: '',
        tenthAttempt: 'Yes',
        tenthClass: 'Yes',
        tenthInstitution: '',

        // 12th
        twelfthNA: false,
        twelfthPercentage: '',
        twelfthYear: '',
        twelfthMedium: 'Tamil',
        twelfthMediumOther: '',
        twelfthAttempt: 'Yes',
        twelfthClass: 'Yes',
        twelfthInstitution: '',

        // UG
        ugNA: false,
        ugDegree: 'B.E.',
        ugDegreeOther: '',
        ugSpecialization: 'Computer Science and Engineering',
        ugSpecializationOther: '',
        ugPercentage: '',
        ugYear: '',
        ugAttempt: 'Yes',
        ugClass: 'Yes',
        ugInstitution: '',
        ugInstitutionOther: '',
        ugGateScore: '',
        ugNetSletScore: '',

        // PG
        pgNA: false,
        pgDegree: 'M.E.',
        pgDegreeOther: '',
        pgSpecialization: 'Computer Science and Engineering',
        pgSpecializationOther: '',
        pgPercentage: '',
        pgYear: '',
        pgAttempt: 'Yes',
        pgClass: 'Yes',
        pgInstitution: '',
        pgInstitutionOther: '',

        // M.Phil
        mphilNA: true,
        mphilDegree: 'M.Phil',
        mphilSpecialization: '',
        mphilPercentage: '',
        mphilYear: '',
        mphilAttempt: 'Yes',
        mphilClass: 'Yes',
        mphilInstitution: '',
        mphilInstitutionOther: '',

        // Ph.D
        phdNA: true,
        phdStatus: 'Completed',
        phdTopic: '',
        phdInstitution: '',
        phdInstitutionOther: '',
        phdGuideName: '',
        phdGuideCollege: '',
        phdYearRegistration: '',
        phdYear: '',
        phdPublicationsDuring: '',
        phdPublicationsPost: '',
        phdAwards: '',
        phdFundedProjects: '',
        phdFundedConsultancy: '',
        phdPostExperience: '',
    });

    useEffect(() => {
        fetch('/api/institutions')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.institutions) {
                    setCollegesList(data.institutions);
                }
            })
            .catch(err => console.warn('Failed to fetch institutions:', err));
    }, []);

    useEffect(() => {
        const targetDept = profileData?.user?.department || user?.department;
        if (targetDept) {
            fetch(`/api/departments/${encodeURIComponent(targetDept)}/pg-domains`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setDynamicPgDomains(data.data.map(d => d.name));
                    } else {
                        setDynamicPgDomains([]);
                    }
                })
                .catch(err => console.warn('Failed to fetch pg-domains:', err));
        }
    }, [profileData, user]);

    const loadedEmailRef = useRef('');

    useEffect(() => {
        if (user?.email && loadedEmailRef.current !== user.email) {
            loadedEmailRef.current = user.email;
            hasLoadedRef.current = false;
            isDirtyRef.current = false;
        }

        if (profileData?.education && !hasLoadedRef.current && !isDirtyRef.current) {
            const edList = profileData.education;
            const getQual = (type) => edList.find((e) => e.qual_type === type) || {};

            const tenth = getQual('tenth');
            const twelfth = getQual('twelfth');
            const ug = getQual('ug');
            const pg = getQual('pg');
            const mphil = getQual('mphil');
            const phd = getQual('phd');
            const phdDet = profileData.phd_details || {};

            const ugDeg = ug.degree || 'B.E.';
            const ugOpts = ugSpecializationMap[ugDeg] || ['Other'];
            const ugIsCustom = ug.specialization && !ugOpts.includes(ug.specialization);
            const ugSpec = ugIsCustom ? 'Other' : (ug.specialization || ugOpts[0]);
            const ugSpecOther = ugIsCustom ? ug.specialization : (ug.specialization_other || '');

            const pgDeg = pg.degree || 'M.E.';
            const pgOpts = pgSpecializationMap[pgDeg] || ['Other'];
            const pgIsCustom = pg.specialization && !pgOpts.includes(pg.specialization);
            const pgSpec = pgIsCustom ? 'Other' : (pg.specialization || pgOpts[0]);
            const pgSpecOther = pgIsCustom ? pg.specialization : (pg.specialization_other || '');

            setEdu((prev) => ({
                ...prev,
                tenthNA: tenth.is_na === 1,
                tenthPercentage: tenth.percentage || '',
                tenthYear: tenth.year_of_passing || '',
                tenthMedium: tenth.medium || 'Tamil',
                tenthAttempt: tenth.first_attempt || 'Yes',
                tenthClass: tenth.first_class || 'Yes',
                tenthInstitution: tenth.institution_name || '',

                twelfthNA: twelfth.is_na === 1,
                twelfthPercentage: twelfth.percentage || '',
                twelfthYear: twelfth.year_of_passing || '',
                twelfthMedium: twelfth.medium || 'Tamil',
                twelfthAttempt: twelfth.first_attempt || 'Yes',
                twelfthClass: twelfth.first_class || 'Yes',
                twelfthInstitution: twelfth.institution_name || '',

                ugNA: ug.is_na === 1,
                ugDegree: ugDeg,
                ugSpecialization: ugSpec,
                ugSpecializationOther: ugSpecOther,
                ugPercentage: ug.percentage || '',
                ugYear: ug.year_of_passing || '',
                ugAttempt: ug.first_attempt || 'Yes',
                ugClass: ug.first_class || 'Yes',
                ugInstitution: ug.institution_name || ug.institution_other || '',
                ugGateScore: ug.ug_gate_score || '',
                ugNetSletScore: ug.ug_net_slet_score || '',

                pgNA: pg.is_na === 1,
                pgDegree: pgDeg,
                pgSpecialization: pgSpec,
                pgSpecializationOther: pgSpecOther,
                pgPercentage: pg.percentage || '',
                pgYear: pg.year_of_passing || '',
                pgAttempt: pg.first_attempt || 'Yes',
                pgClass: pg.first_class || 'Yes',
                pgInstitution: pg.institution_name || pg.institution_other || '',

                mphilNA: mphil.is_na !== undefined ? mphil.is_na === 1 : true,
                mphilDegree: mphil.degree || 'M.Phil',
                mphilSpecialization: mphil.specialization || '',
                mphilPercentage: mphil.percentage || '',
                mphilYear: mphil.year_of_passing || '',
                mphilAttempt: mphil.first_attempt || 'Yes',
                mphilClass: mphil.first_class || 'Yes',
                mphilInstitution: mphil.institution_name || mphil.institution_other || '',

                phdNA: phd.is_na !== undefined ? phd.is_na === 1 : true,
                phdStatus: phdDet.status || 'Completed',
                phdTopic: phdDet.title || phd.topic || '',
                phdInstitution: phdDet.university || phd.institution_name || phd.institution_other || '',
                phdGuideName: phdDet.guide_name || '',
                phdGuideCollege: phdDet.guide_college || '',
                phdYearRegistration: phdDet.year_of_registration || '',
                phdYear: phdDet.year_of_completion || phd.year_of_passing || '',
                phdPublicationsDuring: phdDet.no_of_publications_during_phd || '',
                phdPublicationsPost: phdDet.no_of_publications_post_phd || '',
                phdAwards: phdDet.no_of_awards || '',
                phdFundedProjects: phdDet.no_of_funded_projects || '',
                phdFundedConsultancy: phdDet.no_of_funded_consultancy || '',
                phdPostExperience: phdDet.post_phd_experience || '',
            }));
            hasLoadedRef.current = true;
        }
    }, [profileData]);

    const handleChange = (e) => {
        isDirtyRef.current = true;
        const { name, value, type, checked } = e.target;
        setEdu((prev) => {
            const next = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            };
            if (name === 'ugDegree') {
                const list = ugSpecializationMap[value] || ['Other'];
                next.ugSpecialization = list[0];
                next.ugSpecializationOther = '';
            }
            if (name === 'pgDegree') {
                const userDept = profileData?.user?.department || user?.department || '';
                const list = getDepartmentPgSpecializations(value, userDept);
                next.pgSpecialization = list[0] || 'Other';
                next.pgSpecializationOther = '';
            }
            return next;
        });
        if (value === 'Other') {
            setActiveOtherField(name);
        }
    };

    const handleFileChange = (e, field) => {
        if (e.target.files && e.target.files[0]) {
            isDirtyRef.current = true;
            setFiles((prev) => ({ ...prev, [field]: e.target.files[0] }));
        }
    };

    const saveEducationData = async () => {
        setBanner({ type: '', message: '' });
        setLoading(true);

        try {
            const data = new FormData();
            data.append('user_email', user?.email || '');

            const payload = {
                ...edu,
                ugSpecialization: edu.ugSpecialization === 'Other' ? edu.ugSpecializationOther : edu.ugSpecialization,
                pgSpecialization: edu.pgSpecialization === 'Other' ? edu.pgSpecializationOther : edu.pgSpecialization,
            };

            Object.keys(payload).forEach((key) => {
                data.append(key, payload[key]);
            });

            Object.keys(files).forEach((key) => {
                data.append(key, files[key]);
            });

            const res = await fetch('/api/education', {
                method: 'POST',
                body: data,
            });

            const result = await res.json();
            if (result.success) {
                isDirtyRef.current = false;
                hasLoadedRef.current = true;
                setBanner({ type: 'success', message: 'Education details saved successfully!' });
                if (onSaveSuccess) onSaveSuccess();
                return true;
            } else {
                setBanner({ type: 'error', message: result.message || 'Failed to save education details.' });
                return false;
            }
        } catch (err) {
            setBanner({ type: 'error', message: 'Server connection error during saving education.' });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        await saveEducationData();
    };

    const handleNextClick = async () => {
        if (formRef.current && !formRef.current.reportValidity()) {
            setBanner({ type: 'error', message: 'Please fill out all mandatory educational fields before advancing.' });
            return;
        }
        const saved = await saveEducationData();
        if (saved && onNext) {
            onNext();
        }
    };

    return (
        <div>
            <Banner type={banner.type} message={banner.message} />

            <form ref={formRef} onSubmit={handleSubmit}>
                {/* 10th Standard Block */}
                <div id="sub-sslc" className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="section-card-header">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <GraduationCap size={20} color="#3b82f6" /> 10th Standard (SSLC)
                        </span>
                        <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 500 }}>
                            <input type="checkbox" name="tenthNA" checked={edu.tenthNA} onChange={handleChange} /> Not Applicable
                        </label>
                    </div>

                    {!edu.tenthNA && (
                        <>
                            <div className="grid-2">
                                <div className="field">
                                    <label>Percentage / CGPA <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="number" step="0.01" name="tenthPercentage" value={edu.tenthPercentage} onChange={handleChange} required />
                                </div>
                                <div className="field">
                                    <label>Year of Passing <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="tenthYear" value={edu.tenthYear} onChange={handleChange} required>
                                        <option value="" disabled>Select Year</option>
                                        {generateYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>First Attempt? <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="tenthAttempt" value={edu.tenthAttempt} onChange={handleChange} required>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label>First Class? <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="tenthClass" value={edu.tenthClass} onChange={handleChange} required>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Medium of Instruction</label>
                                    <select name="tenthMedium" value={edu.tenthMedium} onChange={handleChange} onClick={() => { if (edu.tenthMedium === 'Other') setActiveOtherField('tenthMedium'); }}>
                                        <option value="Tamil">Tamil</option>
                                        <option value="English">English</option>
                                        <option value="Other">{edu.tenthMediumOther || 'Other'}</option>
                                    </select>
                                    {edu.tenthMedium === 'Other' && (activeOtherField === 'tenthMedium' || !edu.tenthMediumOther) && (
                                        <input
                                            type="text"
                                            name="tenthMediumOther"
                                            value={edu.tenthMediumOther || ''}
                                            onChange={handleChange}
                                            onBlur={() => { if (edu.tenthMediumOther?.trim()) setActiveOtherField(null); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                            placeholder="Type custom medium..."
                                            className="select-other-input"
                                            autoFocus
                                            required
                                        />
                                    )}
                                </div>
                                <div className="field">
                                    <label>School Name &amp; Location <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        name="tenthInstitution"
                                        value={edu.tenthInstitution}
                                        onChange={handleChange}
                                        placeholder="Enter School Name & Location"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field" style={{ marginTop: '1rem' }}>
                                <label>10th Marksheet Upload (Optional)</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'tenthDoc')} accept=".pdf,image/*" />
                            </div>
                        </>
                    )}
                </div>

                {/* 12th Standard Block */}
                <div id="sub-hsc" className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>12th Standard / HSC / Diploma</h3>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                            <input type="checkbox" name="twelfthNA" checked={edu.twelfthNA} onChange={handleChange} /> Not Applicable
                        </label>
                    </div>

                    {!edu.twelfthNA && (
                        <>
                            <div className="grid-2">
                                <div className="field">
                                    <label>Percentage / CGPA <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="number" step="0.01" name="twelfthPercentage" value={edu.twelfthPercentage} onChange={handleChange} required />
                                </div>
                                <div className="field">
                                    <label>Year of Passing <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="twelfthYear" value={edu.twelfthYear} onChange={handleChange} required>
                                        <option value="" disabled>Select Year</option>
                                        {generateYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>First Attempt? <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="twelfthAttempt" value={edu.twelfthAttempt} onChange={handleChange} required>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label>First Class? <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="twelfthClass" value={edu.twelfthClass} onChange={handleChange} required>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Medium of Instruction</label>
                                    <select name="twelfthMedium" value={edu.twelfthMedium} onChange={handleChange} onClick={() => { if (edu.twelfthMedium === 'Other') setActiveOtherField('twelfthMedium'); }}>
                                        <option value="Tamil">Tamil</option>
                                        <option value="English">English</option>
                                        <option value="Other">{edu.twelfthMediumOther || 'Other'}</option>
                                    </select>
                                    {edu.twelfthMedium === 'Other' && (activeOtherField === 'twelfthMedium' || !edu.twelfthMediumOther) && (
                                        <input
                                            type="text"
                                            name="twelfthMediumOther"
                                            value={edu.twelfthMediumOther || ''}
                                            onChange={handleChange}
                                            onBlur={() => { if (edu.twelfthMediumOther?.trim()) setActiveOtherField(null); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                            placeholder="Type custom medium..."
                                            className="select-other-input"
                                            autoFocus
                                            required
                                        />
                                    )}
                                </div>
                                <div className="field">
                                    <label>School / Polytechnic Institute Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        name="twelfthInstitution"
                                        value={edu.twelfthInstitution}
                                        onChange={handleChange}
                                        placeholder="Enter School / Institution Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field" style={{ marginTop: '1rem' }}>
                                <label>12th / Diploma Marksheet Upload (Optional)</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'twelfthDoc')} accept=".pdf,image/*" />
                            </div>
                        </>
                    )}
                </div>

                {/* UG Degree Block */}
                <div id="sub-ug" className="section-card">
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '1rem' }}>Undergraduate (UG) Degree</h3>
                    <div className="grid-2">
                        <div className="field">
                            <label>Degree <span style={{ color: '#ef4444' }}>*</span></label>
                            <select name="ugDegree" value={edu.ugDegree} onChange={handleChange} onClick={() => { if (edu.ugDegree === 'Other') setActiveOtherField('ugDegree'); }} required>
                                <option value="B.E.">B.E.</option>
                                <option value="B.Tech.">B.Tech.</option>
                                <option value="B.Sc.">B.Sc.</option>
                                <option value="B.A.">B.A.</option>
                                <option value="B.Com.">B.Com.</option>
                                <option value="B.C.A.">B.C.A.</option>
                                <option value="Other">{edu.ugDegreeOther || 'Other'}</option>
                            </select>
                            {edu.ugDegree === 'Other' && (activeOtherField === 'ugDegree' || !edu.ugDegreeOther) && (
                                <input
                                    type="text"
                                    name="ugDegreeOther"
                                    value={edu.ugDegreeOther || ''}
                                    onChange={handleChange}
                                    onBlur={() => { if (edu.ugDegreeOther?.trim()) setActiveOtherField(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                    placeholder="Type custom degree..."
                                    className="select-other-input"
                                    autoFocus
                                    required
                                />
                            )}
                        </div>

                        <div className="field">
                            <label>Branch / Specialization <span style={{ color: '#ef4444' }}>*</span></label>
                            <select name="ugSpecialization" value={edu.ugSpecialization} onChange={handleChange} onClick={() => { if (edu.ugSpecialization === 'Other') setActiveOtherField('ugSpecialization'); }} required>
                                {(ugSpecializationMap[edu.ugDegree] || ['Other']).map((spec, idx) => (
                                    <option key={idx} value={spec}>
                                        {spec === 'Other' && edu.ugSpecializationOther ? edu.ugSpecializationOther : spec}
                                    </option>
                                ))}
                            </select>
                            {edu.ugSpecialization === 'Other' && (activeOtherField === 'ugSpecialization' || !edu.ugSpecializationOther) && (
                                <input
                                    type="text"
                                    name="ugSpecializationOther"
                                    value={edu.ugSpecializationOther || ''}
                                    onChange={handleChange}
                                    onBlur={() => { if (edu.ugSpecializationOther?.trim()) setActiveOtherField(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                    placeholder="Type custom specialization..."
                                    className="select-other-input"
                                    autoFocus
                                    required
                                />
                            )}
                        </div>

                        <div className="field">
                            <label>Percentage / CGPA <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="number" step="0.01" name="ugPercentage" value={edu.ugPercentage} onChange={handleChange} required />
                        </div>

                        <div className="field">
                            <label>Year of Passing <span style={{ color: '#ef4444' }}>*</span></label>
                            <select name="ugYear" value={edu.ugYear} onChange={handleChange} required>
                                <option value="" disabled>Select Year</option>
                                {generateYearOptions().map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>First Attempt? <span style={{ color: '#ef4444' }}>*</span></label>
                            <select name="ugAttempt" value={edu.ugAttempt} onChange={handleChange} required>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>First Class? <span style={{ color: '#ef4444' }}>*</span></label>
                            <select name="ugClass" value={edu.ugClass} onChange={handleChange} required>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>College / Institution Name <span style={{ color: '#ef4444' }}>*</span></label>
                            <select
                                name="ugInstitutionSelect"
                                value={collegesList.includes(edu.ugInstitution) ? edu.ugInstitution : (edu.ugInstitution ? 'Other' : '')}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEdu(prev => ({
                                        ...prev,
                                        ugInstitution: val === 'Other' ? (prev.ugInstitutionOther || '') : val
                                    }));
                                    if (val === 'Other') setActiveOtherField('ugInstitution');
                                }}
                                required
                            >
                                <option value="" disabled>Select College / Institution</option>
                                {collegesList.map((c, idx) => (
                                    <option key={idx} value={c}>{c}</option>
                                ))}
                                <option value="Other">Other (Custom College Name)</option>
                            </select>
                            {(!collegesList.includes(edu.ugInstitution) || activeOtherField === 'ugInstitution') && (
                                <input
                                    type="text"
                                    name="ugInstitutionOther"
                                    value={edu.ugInstitutionOther || (collegesList.includes(edu.ugInstitution) ? '' : edu.ugInstitution)}
                                    onChange={(e) => {
                                        const customVal = e.target.value;
                                        setEdu(prev => ({ ...prev, ugInstitutionOther: customVal, ugInstitution: customVal }));
                                    }}
                                    placeholder="Enter Custom College / Institution Name"
                                    className="select-other-input"
                                    style={{ marginTop: '0.5rem' }}
                                    required
                                />
                            )}
                        </div>

                        {['B.E.', 'B.Tech.'].includes(edu.ugDegree) ? (
                            <div className="field">
                                <label>GATE Score (if applicable)</label>
                                <input type="text" name="ugGateScore" value={edu.ugGateScore} onChange={handleChange} placeholder="e.g. 650" />
                            </div>
                        ) : (
                            <div className="field">
                                <label>NET / SLET Score (if applicable)</label>
                                <input type="text" name="ugNetSletScore" value={edu.ugNetSletScore} onChange={handleChange} placeholder="e.g. Qualified 2023" />
                            </div>
                        )}
                    </div>

                    <div className="field" style={{ marginTop: '1rem' }}>
                        <label>UG Degree Certificate Upload (Optional)</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'ugDoc')} accept=".pdf,image/*" />
                    </div>
                </div>

                {/* PG Degree Block */}
                <div id="sub-pg" className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Postgraduate (PG) Degree</h3>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                            <input type="checkbox" name="pgNA" checked={edu.pgNA} onChange={handleChange} /> Not Applicable
                        </label>
                    </div>

                    {!edu.pgNA && (
                        <>
                            <div className="grid-2">
                                <div className="field">
                                    <label>Degree <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="pgDegree" value={edu.pgDegree} onChange={handleChange} onClick={() => { if (edu.pgDegree === 'Other') setActiveOtherField('pgDegree'); }} required>
                                        <option value="M.E.">M.E.</option>
                                        <option value="M.Tech.">M.Tech.</option>
                                        <option value="M.Sc.">M.Sc.</option>
                                        <option value="M.A.">M.A.</option>
                                        <option value="M.Com.">M.Com.</option>
                                        <option value="M.C.A.">M.C.A.</option>
                                        <option value="M.B.A.">M.B.A.</option>
                                        <option value="Other">{edu.pgDegreeOther || 'Other'}</option>
                                    </select>
                                    {edu.pgDegree === 'Other' && (activeOtherField === 'pgDegree' || !edu.pgDegreeOther) && (
                                        <input
                                            type="text"
                                            name="pgDegreeOther"
                                            value={edu.pgDegreeOther || ''}
                                            onChange={handleChange}
                                            onBlur={() => { if (edu.pgDegreeOther?.trim()) setActiveOtherField(null); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                            placeholder="Type custom degree..."
                                            className="select-other-input"
                                            autoFocus
                                            required
                                        />
                                    )}
                                </div>

                                <div className="field">
                                    <label>Branch / Specialization <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="pgSpecialization" value={edu.pgSpecialization} onChange={handleChange} onClick={() => { if (edu.pgSpecialization === 'Other') setActiveOtherField('pgSpecialization'); }} required>
                                        {Array.from(new Set([
                                            ...getDepartmentPgSpecializations(edu.pgDegree, profileData?.user?.department || user?.department || ''),
                                            ...(dynamicPgDomains.length > 0 ? dynamicPgDomains : []),
                                            'Other'
                                        ])).map((spec, idx) => (
                                            <option key={idx} value={spec}>
                                                {spec === 'Other' && edu.pgSpecializationOther ? edu.pgSpecializationOther : spec}
                                            </option>
                                        ))}
                                    </select>
                                    {edu.pgSpecialization === 'Other' && (activeOtherField === 'pgSpecialization' || !edu.pgSpecializationOther) && (
                                        <input
                                            type="text"
                                            name="pgSpecializationOther"
                                            value={edu.pgSpecializationOther || ''}
                                            onChange={handleChange}
                                            onBlur={() => { if (edu.pgSpecializationOther?.trim()) setActiveOtherField(null); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setActiveOtherField(null); } }}
                                            placeholder="Type custom specialization..."
                                            className="select-other-input"
                                            autoFocus
                                            required
                                        />
                                    )}
                                </div>

                                <div className="field">
                                    <label>Percentage / CGPA <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="number" step="0.01" name="pgPercentage" value={edu.pgPercentage} onChange={handleChange} required />
                                </div>

                                <div className="field">
                                    <label>Year of Passing <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="pgYear" value={edu.pgYear} onChange={handleChange} required>
                                        <option value="" disabled>Select Year</option>
                                        {generateYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label>First Attempt? <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="pgAttempt" value={edu.pgAttempt} onChange={handleChange} required>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>

                                <div className="field">
                                    <label>First Class? <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="pgClass" value={edu.pgClass} onChange={handleChange} required>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>

                                <div className="field" style={{ gridColumn: 'span 2' }}>
                                    <label>College / Institution Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select
                                        name="pgInstitutionSelect"
                                        value={collegesList.includes(edu.pgInstitution) ? edu.pgInstitution : (edu.pgInstitution ? 'Other' : '')}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setEdu(prev => ({
                                                ...prev,
                                                pgInstitution: val === 'Other' ? (prev.pgInstitutionOther || '') : val
                                            }));
                                            if (val === 'Other') setActiveOtherField('pgInstitution');
                                        }}
                                        required
                                    >
                                        <option value="" disabled>Select College / Institution</option>
                                        {collegesList.map((c, idx) => (
                                            <option key={idx} value={c}>{c}</option>
                                        ))}
                                        <option value="Other">Other (Custom College Name)</option>
                                    </select>
                                    {(!collegesList.includes(edu.pgInstitution) || activeOtherField === 'pgInstitution') && (
                                        <input
                                            type="text"
                                            name="pgInstitutionOther"
                                            value={edu.pgInstitutionOther || (collegesList.includes(edu.pgInstitution) ? '' : edu.pgInstitution)}
                                            onChange={(e) => {
                                                const customVal = e.target.value;
                                                setEdu(prev => ({ ...prev, pgInstitutionOther: customVal, pgInstitution: customVal }));
                                            }}
                                            placeholder="Enter Custom College / Institution Name"
                                            className="select-other-input"
                                            style={{ marginTop: '0.5rem' }}
                                            required
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="field" style={{ marginTop: '1rem' }}>
                                <label>PG Degree Certificate Upload (Optional)</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'pgDoc')} accept=".pdf,image/*" />
                            </div>
                        </>
                    )}
                </div>

                {/* M.Phil Degree Block */}
                <div id="sub-mphil" className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>M.Phil Degree</h3>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                            <input type="checkbox" name="mphilNA" checked={edu.mphilNA} onChange={handleChange} /> Not Applicable
                        </label>
                    </div>

                    {!edu.mphilNA && (
                        <>
                            <div className="grid-2">
                                <div className="field">
                                    <label>Specialization <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="text" name="mphilSpecialization" value={edu.mphilSpecialization} onChange={handleChange} placeholder="e.g. Physics, Chemistry..." required />
                                </div>

                                <div className="field">
                                    <label>Percentage / CGPA <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="number" step="0.01" name="mphilPercentage" value={edu.mphilPercentage} onChange={handleChange} required />
                                </div>

                                <div className="field">
                                    <label>Year of Passing <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="mphilYear" value={edu.mphilYear} onChange={handleChange} required>
                                        <option value="" disabled>Select Year</option>
                                        {generateYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label>First Attempt? <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="mphilAttempt" value={edu.mphilAttempt} onChange={handleChange} required>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>

                                <div className="field">
                                    <label>First Class? <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="mphilClass" value={edu.mphilClass} onChange={handleChange} required>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>

                                <div className="field" style={{ gridColumn: 'span 2' }}>
                                    <label>College / Institution Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select
                                        name="mphilInstitutionSelect"
                                        value={collegesList.includes(edu.mphilInstitution) ? edu.mphilInstitution : (edu.mphilInstitution ? 'Other' : '')}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setEdu(prev => ({
                                                ...prev,
                                                mphilInstitution: val === 'Other' ? (prev.mphilInstitutionOther || '') : val
                                            }));
                                            if (val === 'Other') setActiveOtherField('mphilInstitution');
                                        }}
                                        required
                                    >
                                        <option value="" disabled>Select College / Institution</option>
                                        {collegesList.map((c, idx) => (
                                            <option key={idx} value={c}>{c}</option>
                                        ))}
                                        <option value="Other">Other (Custom College Name)</option>
                                    </select>
                                    {(!collegesList.includes(edu.mphilInstitution) || activeOtherField === 'mphilInstitution') && (
                                        <input
                                            type="text"
                                            name="mphilInstitutionOther"
                                            value={edu.mphilInstitutionOther || (collegesList.includes(edu.mphilInstitution) ? '' : edu.mphilInstitution)}
                                            onChange={(e) => {
                                                const customVal = e.target.value;
                                                setEdu(prev => ({ ...prev, mphilInstitutionOther: customVal, mphilInstitution: customVal }));
                                            }}
                                            placeholder="Enter Custom College / Institution Name"
                                            className="select-other-input"
                                            style={{ marginTop: '0.5rem' }}
                                            required
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Ph.D Details Block */}
                <div id="sub-phd" className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Ph.D Details</h3>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                            <input type="checkbox" name="phdNA" checked={edu.phdNA} onChange={handleChange} /> Not Applicable
                        </label>
                    </div>

                    {!edu.phdNA && (
                        <>
                            <div className="grid-2">
                                <div className="field">
                                    <label>Ph.D Status</label>
                                    <select name="phdStatus" value={edu.phdStatus} onChange={handleChange}>
                                        <option value="Completed">Completed</option>
                                        <option value="Thesis Submitted">Thesis Submitted</option>
                                        <option value="Ongoing / Registered">Ongoing / Registered</option>
                                    </select>
                                </div>

                                <div className="field">
                                    <label>University / College Institution <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select
                                        name="phdInstitutionSelect"
                                        value={collegesList.includes(edu.phdInstitution) ? edu.phdInstitution : (edu.phdInstitution ? 'Other' : '')}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setEdu(prev => ({
                                                ...prev,
                                                phdInstitution: val === 'Other' ? (prev.phdInstitutionOther || '') : val
                                            }));
                                            if (val === 'Other') setActiveOtherField('phdInstitution');
                                        }}
                                        required
                                    >
                                        <option value="" disabled>Select College / Institution</option>
                                        {collegesList.map((c, idx) => (
                                            <option key={idx} value={c}>{c}</option>
                                        ))}
                                        <option value="Other">Other (Custom College Name)</option>
                                    </select>
                                    {(!collegesList.includes(edu.phdInstitution) || activeOtherField === 'phdInstitution') && (
                                        <input
                                            type="text"
                                            name="phdInstitutionOther"
                                            value={edu.phdInstitutionOther || (collegesList.includes(edu.phdInstitution) ? '' : edu.phdInstitution)}
                                            onChange={(e) => {
                                                const customVal = e.target.value;
                                                setEdu(prev => ({ ...prev, phdInstitutionOther: customVal, phdInstitution: customVal }));
                                            }}
                                            placeholder="Enter Custom College / Institution Name"
                                            className="select-other-input"
                                            style={{ marginTop: '0.5rem' }}
                                            required
                                        />
                                    )}
                                </div>

                                <div className="field">
                                    <label>Thesis / Research Title <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="text" name="phdTopic" value={edu.phdTopic} onChange={handleChange} placeholder="Title of Ph.D thesis" required />
                                </div>

                                <div className="field">
                                    <label>Research Guide Name</label>
                                    <input type="text" name="phdGuideName" value={edu.phdGuideName} onChange={handleChange} />
                                </div>

                                <div className="field">
                                    <label>Guide Organization / College</label>
                                    <input type="text" name="phdGuideCollege" value={edu.phdGuideCollege} onChange={handleChange} />
                                </div>

                                <div className="field">
                                    <label>Year of Registration</label>
                                    <select name="phdYearRegistration" value={edu.phdYearRegistration} onChange={handleChange}>
                                        <option value="">Select Registration Year</option>
                                        {generateYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label>Year of Viva / Completion</label>
                                    <select name="phdYear" value={edu.phdYear} onChange={handleChange}>
                                        <option value="">Select Completion Year</option>
                                        {generateYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label>No. of Publications During Ph.D</label>
                                    <input type="number" name="phdPublicationsDuring" value={edu.phdPublicationsDuring} onChange={handleChange} />
                                </div>

                                <div className="field">
                                    <label>No. of Publications Post Ph.D</label>
                                    <input type="number" name="phdPublicationsPost" value={edu.phdPublicationsPost} onChange={handleChange} />
                                </div>

                                <div className="field">
                                    <label>No. of Awards</label>
                                    <input type="number" min="0" name="phdAwards" value={edu.phdAwards} onChange={handleChange} />
                                </div>

                                <div className="field">
                                    <label>No. of Funded Projects</label>
                                    <input type="number" min="0" name="phdFundedProjects" value={edu.phdFundedProjects} onChange={handleChange} />
                                </div>

                                <div className="field">
                                    <label>No. of Funded Consultancy</label>
                                    <input type="number" min="0" name="phdFundedConsultancy" value={edu.phdFundedConsultancy} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="field" style={{ marginTop: '1rem' }}>
                                <label>Ph.D Degree / Provisional Certificate Upload (Optional)</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'phdDoc')} accept=".pdf,image/*" />
                            </div>
                        </>
                    )}
                </div>

                {/* Navigation Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem' }}>
                    <button type="button" onClick={onPrev} className="nav-btn secondary">
                        <ArrowLeft size={18} /> Back: Personal Info
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" disabled={loading} className="nav-btn secondary" style={{ background: 'var(--color-brand-dark)', color: 'white', padding: '0.75rem 1.5rem' }}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Education Details'}
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleNextClick}
                            className="nav-btn primary"
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            Next: Work Experience <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </form >
        </div >
    );
};
