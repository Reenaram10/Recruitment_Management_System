import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, User, Sun, Moon } from 'lucide-react';

export const Header = () => {
    const { user, isAdmin, activePage, setActivePage, logout, theme, toggleTheme } = useAuth();

    // If on Auth page and not logged in, don't show the header bar
    if (activePage === 'auth' && !user && !isAdmin) {
        return null;
    }

    const hasSidebar = user || isAdmin;

    return (
        <header className={`top-nav ${hasSidebar ? 'has-sidebar' : ''}`}>
            <div className="wrap nav-content">
                <div className="brand" style={{ cursor: 'pointer' }} onClick={() => setActivePage(isAdmin ? 'admin' : 'profile')}>
                    <div className="logo-box">NEC</div>
                    <div>
                        <div className="brand-title">National Engineering College</div>
                        <div className="brand-sub">Faculty &amp; Staff Recruitment Portal</div>
                    </div>
                </div>

                <div className="nav-links">
                    <button
                        type="button"
                        className="nav-btn secondary theme-header-toggle-btn"
                        onClick={toggleTheme}
                        title="Toggle Theme"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon size={15} color="#38bdf8" />
                                <span>Dark</span>
                            </>
                        ) : (
                            <>
                                <Sun size={15} color="#f59e0b" />
                                <span>Light</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};
