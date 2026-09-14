import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('nec_staff_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [isAdmin, setIsAdmin] = useState(() => {
        return localStorage.getItem('nec_admin_auth') === 'true';
    });

    const [activePage, setActivePage] = useState(() => {
        if (localStorage.getItem('nec_admin_auth') === 'true') return 'admin';
        if (localStorage.getItem('nec_staff_user')) return 'profile';
        return 'auth';
    });

    const [currentStep, setCurrentStep] = useState(1);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('nec_portal_theme') || 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('nec_portal_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const loginUser = (userData) => {
        setUser(userData);
        setIsAdmin(false);
        localStorage.setItem('nec_staff_user', JSON.stringify(userData));
        localStorage.removeItem('nec_admin_auth');
        setActivePage('profile');
    };

    const loginAdmin = () => {
        const adminObj = { email: 'admin@nec.edu.in', department: 'ADMIN' };
        setUser(adminObj);
        setIsAdmin(true);
        localStorage.setItem('nec_admin_auth', 'true');
        localStorage.setItem('nec_staff_user', JSON.stringify(adminObj));
        setActivePage('admin');
    };

    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('nec_staff_user');
        localStorage.removeItem('nec_admin_auth');
        setActivePage('auth');
        setCurrentStep(1);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAdmin,
                activePage,
                setActivePage,
                currentStep,
                setCurrentStep,
                theme,
                toggleTheme,
                isSidebarOpen,
                toggleSidebar,
                loginUser,
                loginAdmin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
