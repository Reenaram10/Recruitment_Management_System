import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PersonalTab } from '../components/profile/PersonalTab';
import { EducationTab } from '../components/profile/EducationTab';
import { ExperienceTab } from '../components/profile/ExperienceTab';
import { ResearchConsultancyTab } from '../components/profile/ResearchConsultancyTab';
import { CertificationsTab } from '../components/profile/CertificationsTab';
import { OtherDetailsTab } from '../components/profile/OtherDetailsTab';
import { SubmittedTab } from '../components/profile/SubmittedTab';
import {
    User,
    GraduationCap,
    Briefcase,
    BookOpen,
    Award,
    Sparkles,
    FileCheck,
    Check,
    Lock,
    LogOut,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    LayoutDashboard,
    Edit3,
    Menu
} from 'lucide-react';

export const ProfilePage = () => {
    const { user, logout, currentStep, setCurrentStep, isSidebarOpen, toggleSidebar } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
    const [warningMsg, setWarningMsg] = useState('');
    const [activityOpen, setActivityOpen] = useState(true);
    const [sectionConfig, setSectionConfig] = useState({
        experience: true,
        research: true,
        certifications: true,
        sub_journals: true,
        sub_projects: true,
        sub_consultancy: true
    });

    const fetchSectionConfig = async () => {
        try {
            const res = await fetch('/api/admin/dropdowns');
            const data = await res.json();
            if (data.success && data.options) {
                const secOpts = data.options.filter(o => o.category === 'app_section');
                const expActive = !secOpts.some(s => s.option_value === 'section_experience' && (s.is_active === 0 || s.is_active === false || s.is_active === '0'));
                const resActive = !secOpts.some(s => s.option_value === 'section_research' && (s.is_active === 0 || s.is_active === false || s.is_active === '0'));
                const certActive = !secOpts.some(s => s.option_value === 'section_certifications' && (s.is_active === 0 || s.is_active === false || s.is_active === '0'));

                const jourActive = !secOpts.some(s => s.option_value === 'sub_section_journals' && (s.is_active === 0 || s.is_active === false || s.is_active === '0'));
                const projActive = !secOpts.some(s => s.option_value === 'sub_section_projects' && (s.is_active === 0 || s.is_active === false || s.is_active === '0'));
                const consActive = !secOpts.some(s => s.option_value === 'sub_section_consultancy' && (s.is_active === 0 || s.is_active === false || s.is_active === '0'));

                setSectionConfig({
                    experience: expActive,
                    research: resActive,
                    certifications: certActive,
                    sub_journals: jourActive,
                    sub_projects: projActive,
                    sub_consultancy: consActive
                });
            }
        } catch (err) {
            console.error('Error loading section config:', err);
        }
    };

    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`/api/profile?email=${encodeURIComponent(user.email)}`);
            const data = await res.json();
            if (data.success) {
                setProfileData(data);

                let unlocked = 1;
                if (data.personal && data.personal.full_name) {
                    unlocked = Math.max(unlocked, 2);
                }
                if (unlocked >= 2 && data.education && data.education.length > 0) {
                    unlocked = Math.max(unlocked, 3);
                }
                if (unlocked >= 3 && ((data.experience && data.experience.length > 0) || maxUnlockedStep >= 4)) {
                    unlocked = Math.max(unlocked, 4);
                }
                if (
                    unlocked >= 4 && (
                        (data.journal_publications && data.journal_publications.length > 0) ||
                        (data.research_projects && data.research_projects.length > 0) ||
                        (data.funded_consultancy && data.funded_consultancy.length > 0) ||
                        maxUnlockedStep >= 5
                    )
                ) {
                    unlocked = Math.max(unlocked, 5);
                }
                if (unlocked >= 5 && ((data.certifications && data.certifications.length > 0) || maxUnlockedStep >= 6)) {
                    unlocked = Math.max(unlocked, 6);
                }
                if (unlocked >= 6 && (data.other_details || (data.awards && data.awards.length > 0) || maxUnlockedStep >= 7)) {
                    unlocked = Math.max(unlocked, 7);
                }

                // If already submitted, unlock all steps for viewing
                if (data.personal && data.personal.applied_date) {
                    unlocked = 7;
                }

                setMaxUnlockedStep((prev) => Math.max(prev, unlocked));
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSectionConfig();
        fetchProfile();
    }, [user]);

    const allTabs = [
        { id: 1, label: 'Personal', icon: User, title: 'Personal Details', key: 'personal' },
        { id: 2, label: 'Education', icon: GraduationCap, title: 'Educational Qualifications', key: 'education' },
        { id: 3, label: 'Experience', icon: Briefcase, title: 'Work & Teaching Experience (Optional)', key: 'section_experience' },
        { id: 4, label: 'Research & Consultancy', icon: BookOpen, title: 'Research & Consultancy Projects (Optional)', key: 'section_research' },
        { id: 5, label: 'Certifications', icon: Award, title: 'Certifications & Achievements (Optional)', key: 'section_certifications' },
        { id: 6, label: 'Other Details', icon: Sparkles, title: 'Awards, Family Details & References', key: 'other' },
        { id: 7, label: 'Submitted View', icon: FileCheck, title: 'Submitted Application Review', key: 'submitted' },
    ];

    const tabs = allTabs.filter(t => {
        if (t.key === 'section_experience') return sectionConfig.experience;
        if (t.key === 'section_research') return sectionConfig.research;
        if (t.key === 'section_certifications') return sectionConfig.certifications;
        return true;
    });

    const currentTabObj = tabs.find((t) => t.id === currentStep) || tabs[0];

    const handleStepClick = (stepId) => {
        setWarningMsg('');
        if (stepId > maxUnlockedStep) {
            setWarningMsg(`Please complete the current tab and click 'Save & Proceed' before advancing to step ${stepId}.`);
            return;
        }
        setCurrentStep(stepId);
    };

    const handleSaveOnly = (completedStepId) => {
        setWarningMsg('');
        const nextStep = completedStepId + 1;
        setMaxUnlockedStep((prev) => Math.max(prev, nextStep));
        fetchProfile();
    };

    const handleSaveAndAdvance = (completedStepId) => {
        setWarningMsg('');
        let nextStep = completedStepId + 1;
        // Skip disabled steps
        while (nextStep <= 6) {
            if (nextStep === 3 && !sectionConfig.experience) nextStep++;
            else if (nextStep === 4 && !sectionConfig.research) nextStep++;
            else if (nextStep === 5 && !sectionConfig.certifications) nextStep++;
            else break;
        }
        setMaxUnlockedStep((prev) => Math.max(prev, nextStep));
        setCurrentStep(nextStep);
        fetchProfile();
    };

    const candidateName = profileData?.personal?.full_name || user?.email?.split('@')[0] || 'Kalaiselvi';
    const photoUrl = profileData?.personal?.photo_path;

    const researchSubItems = [];
    if (sectionConfig.sub_journals !== false) researchSubItems.push({ id: 'sub-journals', label: 'Journal Publications (SCI & Scopus)' });
    if (sectionConfig.sub_projects !== false) researchSubItems.push({ id: 'sub-projects', label: 'Funded Research Projects' });
    if (sectionConfig.sub_consultancy !== false) researchSubItems.push({ id: 'sub-consultancy', label: 'Funded Consultancy Works' });

    const tabSubDivisions = {
        1: [
            { id: 'sub-basic', label: 'Identification & Basic Info' },
            { id: 'sub-contact', label: 'Contact Information' },
            { id: 'sub-address', label: 'Address' }
        ],
        2: [
            { id: 'sub-sslc', label: 'SSLC (10th Standard)' },
            { id: 'sub-hsc', label: 'HSC (12th) / Diploma' },
            { id: 'sub-ug', label: 'UG Degree Details' },
            { id: 'sub-pg', label: 'PG Degree Details' },
            { id: 'sub-phd', label: 'Ph.D. Research Details' }
        ],
        4: researchSubItems
    };

    const handleSubClick = (tabId, subId) => {
        handleStepClick(tabId);
        setTimeout(() => {
            const el = document.getElementById(subId);
            if (el) {
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - 150;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const isTabCompleted = (tabId) => {
        if (!profileData) return false;
        switch (tabId) {
            case 1: // Personal
                return !!(profileData.personal && profileData.personal.full_name && profileData.personal.full_name.trim() !== '');
            case 2: // Education
                return !!(profileData.education && profileData.education.length > 0);
            case 3: // Experience
                return !!(profileData.experience && profileData.experience.length > 0);
            case 4: // Research & Consultancy
                return !!(
                    (profileData.journal_publications && profileData.journal_publications.length > 0) ||
                    (profileData.research_projects && profileData.research_projects.length > 0) ||
                    (profileData.funded_consultancy && profileData.funded_consultancy.length > 0) ||
                    (profileData.phd_details && (Number(profileData.phd_details.no_of_funded_projects) > 0 || Number(profileData.phd_details.no_of_funded_consultancy) > 0))
                );
            case 5: // Certifications
                return !!(profileData.certifications && profileData.certifications.length > 0);
            case 6: // Other Details
                return !!(
                    (profileData.other_details && (
                        profileData.other_details.no_of_awards !== undefined ||
                        profileData.other_details.ref1_name ||
                        profileData.other_details.father_occupation
                    )) || (profileData.awards && profileData.awards.length > 0)
                );
            case 7: // Submitted View
                return !!(profileData.personal && profileData.personal.applied_date);
            default:
                return false;
        }
    };

    const isSubItemCompleted = (tabId, subId) => {
        if (!profileData) return false;
        const p = profileData.personal || {};
        const edu = profileData.education || [];
        const phd = profileData.phd_details || {};

        if (tabId === 1) {
            if (subId === 'sub-basic') return !!(p.full_name && p.dob && p.gender);
            if (subId === 'sub-contact') return !!(p.phone && p.email);
            if (subId === 'sub-address') return !!(p.permanent_address || p.communication_address);
        }
        if (tabId === 2) {
            if (subId === 'sub-sslc') return edu.some(e => e.qual_type === 'tenth');
            if (subId === 'sub-hsc') return edu.some(e => e.qual_type === 'twelfth');
            if (subId === 'sub-ug') return edu.some(e => e.qual_type === 'ug');
            if (subId === 'sub-pg') return edu.some(e => e.qual_type === 'pg');
            if (subId === 'sub-phd') return !!(phd.university || edu.some(e => e.qual_type === 'phd'));
        }
        if (tabId === 4) {
            if (subId === 'sub-journals') return (profileData.journal_publications && profileData.journal_publications.length > 0);
            if (subId === 'sub-projects') return (Number(phd.no_of_funded_projects) > 0 || (profileData.research_projects && profileData.research_projects.length > 0));
            if (subId === 'sub-consultancy') return (Number(phd.no_of_funded_consultancy) > 0 || (profileData.funded_consultancy && profileData.funded_consultancy.length > 0));
        }
        return false;
    };

    const isSubmitted = !!(profileData?.personal?.applied_date);

    return (
        <div className="profile-page-wrapper">
            {/* Left Fixed Vertical Sidebar */}
            <aside className={`profile-sidebar ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
                <div>
                    {/* User Profile Card Header */}
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
                        {photoUrl ? (
                            <img src={photoUrl} alt="Candidate Profile" className="profile-avatar-img" />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                <User size={40} />
                            </div>
                        )}
                        <h3 className="profile-user-name">{candidateName}</h3>
                        <span className="profile-role-badge">STAFF</span>
                    </div>

                    {/* Vertical Navigation Menu */}
                    <div className="sidebar-menu">
                        <div className="sidebar-menu-header" style={{ marginBottom: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                <LayoutDashboard size={16} /> Main Dashboard
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = currentStep === tab.id;
                                const isDone = isTabCompleted(tab.id);
                                const isLocked = tab.id > maxUnlockedStep;
                                const subItems = tabSubDivisions[tab.id] || [];

                                return (
                                    <div key={tab.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                        <button
                                            type="button"
                                            className={`sidebar-menu-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                            onClick={() => handleStepClick(tab.id)}
                                            style={isLocked ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Icon size={15} color={isActive ? '#1d4ed8' : (isLocked ? '#94a3b8' : '#64748b')} />
                                                {tab.label}
                                            </span>
                                            {isDone ? (
                                                <Check size={14} color="#10b981" strokeWidth={2.5} />
                                            ) : isLocked ? (
                                                <Lock size={13} color="#94a3b8" />
                                            ) : null}
                                        </button>

                                        {isActive && subItems.length > 0 && (
                                            <div className="sidebar-sub-division-list">
                                                {subItems.map((sub) => {
                                                    const isSubDone = isSubItemCompleted(tab.id, sub.id);
                                                    return (
                                                        <button
                                                            key={sub.id}
                                                            type="button"
                                                            className="sidebar-sub-item"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSubClick(tab.id, sub.id);
                                                            }}
                                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                                                        >
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                <span className="sidebar-sub-bullet">•</span> {sub.label}
                                                            </span>
                                                            {isSubDone && <Check size={12} color="#10b981" strokeWidth={2.5} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Solid Red Logout Button at Bottom */}
                <button type="button" className="sidebar-logout-btn" onClick={logout}>
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            {/* Main Right Content Panel */}
            <main className={`profile-main-content ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
                {/* Horizontal Progress Stepper Bar */}
                <div className="candidate-stepper-wrapper">
                    <div className="candidate-stepper-container">
                        {tabs.map((step, idx) => {
                            const isCompleted = step.id < currentStep;
                            const isActive = step.id === currentStep;
                            const isLocked = step.id > maxUnlockedStep;

                            return (
                                <React.Fragment key={step.id}>
                                    {idx > 0 && (
                                        <div
                                            className={`stepper-line ${step.id <= maxUnlockedStep ? 'completed' : ''
                                                }`}
                                        />
                                    )}

                                    <div
                                        className={`stepper-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                        onClick={() => handleStepClick(step.id)}
                                        style={isLocked ? { cursor: 'not-allowed', opacity: 0.7 } : { cursor: 'pointer' }}
                                    >
                                        <div className="stepper-circle">
                                            {isCompleted ? (
                                                <Check size={18} strokeWidth={2.5} />
                                            ) : isLocked ? (
                                                <Lock size={14} />
                                            ) : (
                                                <span>{step.id}</span>
                                            )}
                                        </div>
                                        <span className="stepper-label">{step.label}</span>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Page Title Header Bar */}
                <div className="profile-page-header">
                    <div>
                        <h1 className="profile-page-title">{currentTabObj.title}</h1>
                        <p className="profile-page-sub">
                            Comprehensive staff profile, credentials, and application details
                        </p>
                    </div>
                </div>

                {isSubmitted && (
                    <div
                        style={{
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#065f46',
                            padding: '0.9rem 1.25rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            fontWeight: 600,
                            fontSize: '0.92rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    >
                        <Lock size={20} color="#059669" />
                        <div>
                            <span style={{ fontWeight: 700 }}>Application Submitted &amp; Locked</span> — Your application was submitted on{' '}
                            {new Date(profileData.personal.applied_date).toLocaleDateString()}. Profile editing is now locked and read-only.
                        </div>
                    </div>
                )}

                {warningMsg && (
                    <div
                        style={{
                            background: '#fffbebfb',
                            border: '1px solid #fcd34d',
                            color: '#92400e',
                            padding: '0.85rem 1.25rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <Lock size={18} /> {warningMsg}
                    </div>
                )}

                {/* Tab Forms Rendering */}
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: '#ffffff', borderRadius: '16px' }}>
                        Loading application details...
                    </div>
                ) : (
                    <>
                        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                            <PersonalTab
                                profileData={profileData}
                                isSubmitted={isSubmitted}
                                onSaveSuccess={() => handleSaveOnly(1)}
                                onNext={() => handleSaveAndAdvance(1)}
                            />
                        </div>

                        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                            <EducationTab
                                profileData={profileData}
                                isSubmitted={isSubmitted}
                                onSaveSuccess={() => handleSaveOnly(2)}
                                onNext={() => handleSaveAndAdvance(2)}
                                onPrev={() => setCurrentStep(1)}
                            />
                        </div>

                        <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                            <ExperienceTab
                                profileData={profileData}
                                isSubmitted={isSubmitted}
                                onSaveSuccess={() => handleSaveOnly(3)}
                                onNext={() => handleSaveAndAdvance(3)}
                                onPrev={() => setCurrentStep(2)}
                            />
                        </div>

                        <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
                            <ResearchConsultancyTab
                                profileData={profileData}
                                isSubmitted={isSubmitted}
                                sectionConfig={sectionConfig}
                                onSaveSuccess={() => handleSaveOnly(4)}
                                onNext={() => handleSaveAndAdvance(4)}
                                onPrev={() => setCurrentStep(3)}
                            />
                        </div>

                        <div style={{ display: currentStep === 5 ? 'block' : 'none' }}>
                            <CertificationsTab
                                profileData={profileData}
                                isSubmitted={isSubmitted}
                                onSaveSuccess={() => handleSaveOnly(5)}
                                onNext={() => handleSaveAndAdvance(5)}
                                onPrev={() => setCurrentStep(4)}
                            />
                        </div>

                        <div style={{ display: currentStep === 6 ? 'block' : 'none' }}>
                            <OtherDetailsTab
                                profileData={profileData}
                                isSubmitted={isSubmitted}
                                onSaveSuccess={() => handleSaveOnly(6)}
                                onNext={() => handleSaveAndAdvance(6)}
                                onPrev={() => setCurrentStep(5)}
                            />
                        </div>

                        <div style={{ display: currentStep === 7 ? 'block' : 'none' }}>
                            <SubmittedTab
                                profileData={profileData}
                                isSubmitted={isSubmitted}
                                onEditTab={(tabNum) => setCurrentStep(tabNum)}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

