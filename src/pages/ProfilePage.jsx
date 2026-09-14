import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PersonalTab } from '../components/profile/PersonalTab';
import { EducationTab } from '../components/profile/EducationTab';
import { ExperienceTab } from '../components/profile/ExperienceTab';
import { CertificationsTab } from '../components/profile/CertificationsTab';
import { SubmittedTab } from '../components/profile/SubmittedTab';
import {
    User,
    GraduationCap,
    Briefcase,
    Award,
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

    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            const res = await fetch(`/api/profile?email=${encodeURIComponent(user.email)}`);
            const data = await res.json();
            if (data.success) {
                setProfileData(data);

                let unlocked = 1;
                if (data.personal && data.personal.full_name) {
                    unlocked = 2;
                }
                if (data.education && data.education.length > 0) {
                    unlocked = 3;
                }
                if (data.experience && data.experience.length > 0) {
                    unlocked = 4;
                }
                if (data.certifications && data.certifications.length > 0) {
                    unlocked = 5;
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
        fetchProfile();
    }, [user]);

    const tabs = [
        { id: 1, label: 'Personal', icon: User, title: 'Personal Details' },
        { id: 2, label: 'Education', icon: GraduationCap, title: 'Educational Qualifications' },
        { id: 3, label: 'Experience', icon: Briefcase, title: 'Work & Teaching Experience' },
        { id: 4, label: 'Certifications', icon: Award, title: 'Certifications & Achievements' },
        { id: 5, label: 'Submitted View', icon: FileCheck, title: 'Submitted Application Review' },
    ];

    const currentTabObj = tabs.find((t) => t.id === currentStep) || tabs[0];

    const handleStepClick = (stepId) => {
        setWarningMsg('');
        if (stepId > maxUnlockedStep) {
            setWarningMsg(`Please complete and save step ${maxUnlockedStep} before advancing to step ${stepId}.`);
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
        const nextStep = completedStepId + 1;
        setMaxUnlockedStep((prev) => Math.max(prev, nextStep));
        setCurrentStep(nextStep);
        fetchProfile();
    };

    const candidateName = profileData?.personal?.full_name || user?.email?.split('@')[0] || 'Kalaiselvi';
    const photoUrl = profileData?.personal?.photo_path;

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
        ]
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
                                const isDone = tab.id < maxUnlockedStep;
                                const isLocked = tab.id > maxUnlockedStep;
                                const subItems = tabSubDivisions[tab.id] || [];

                                return (
                                    <div key={tab.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                        <button
                                            type="button"
                                            className={`sidebar-menu-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                            onClick={() => handleStepClick(tab.id)}
                                            style={isLocked ? { opacity: 0.6 } : {}}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Icon size={15} color={isActive ? '#1d4ed8' : (isLocked ? '#94a3b8' : '#64748b')} />
                                                {tab.label}
                                            </span>
                                            {isDone && <Check size={14} color="#10b981" />}
                                            {isLocked && <Lock size={13} color="#94a3b8" />}
                                        </button>

                                        {isActive && subItems.length > 0 && (
                                            <div className="sidebar-sub-division-list">
                                                {subItems.map((sub) => (
                                                    <button
                                                        key={sub.id}
                                                        type="button"
                                                        className="sidebar-sub-item"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSubClick(tab.id, sub.id);
                                                        }}
                                                    >
                                                        <span className="sidebar-sub-bullet">•</span> {sub.label}
                                                    </button>
                                                ))}
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
                        {[
                            { id: 1, label: 'Personal Info' },
                            { id: 2, label: 'Education & Documents' },
                            { id: 3, label: 'Work Experience' },
                            { id: 4, label: 'Certifications' },
                            { id: 5, label: 'Submit & Preview' },
                        ].map((step, idx) => {
                            const isCompleted = step.id < currentStep || (step.id < maxUnlockedStep && step.id !== currentStep);
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
                                onSaveSuccess={() => handleSaveOnly(1)}
                                onNext={() => handleSaveAndAdvance(1)}
                            />
                        </div>

                        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                            <EducationTab
                                profileData={profileData}
                                onSaveSuccess={() => handleSaveOnly(2)}
                                onNext={() => handleSaveAndAdvance(2)}
                                onPrev={() => setCurrentStep(1)}
                            />
                        </div>

                        <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                            <ExperienceTab
                                profileData={profileData}
                                onSaveSuccess={() => handleSaveOnly(3)}
                                onNext={() => handleSaveAndAdvance(3)}
                                onPrev={() => setCurrentStep(2)}
                            />
                        </div>

                        <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
                            <CertificationsTab
                                profileData={profileData}
                                onSaveSuccess={() => handleSaveOnly(4)}
                                onNext={() => handleSaveAndAdvance(4)}
                                onPrev={() => setCurrentStep(3)}
                            />
                        </div>

                        <div style={{ display: currentStep === 5 ? 'block' : 'none' }}>
                            <SubmittedTab
                                profileData={profileData}
                                onEditTab={(tabNum) => setCurrentStep(tabNum)}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

