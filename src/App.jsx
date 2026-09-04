import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import './index.css';

import ChatbotWidget from './components/ChatbotWidget';

const MainContent = () => {
    const { activePage } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
            <Header />
            <main style={{ flex: 1 }}>
                {activePage === 'auth' && <AuthPage />}
                {activePage === 'profile' && <ProfilePage />}
                {activePage === 'admin' && <AdminPage />}
            </main>
            {activePage !== 'auth' && <ChatbotWidget activePage={activePage} />}
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <MainContent />
        </AuthProvider>
    );
}
