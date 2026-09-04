import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Banner';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';

export const AuthPage = () => {
    const { loginUser, loginAdmin, theme, toggleTheme } = useAuth();
    const [tab, setTab] = useState('login'); // 'login' | 'register'

    // Form states
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPw, setShowLoginPw] = useState(false);

    const [regEmail, setRegEmail] = useState('');
    const [regDept, setRegDept] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [showRegPw, setShowRegPw] = useState(false);
    const [showRegConfirm, setShowRegConfirm] = useState(false);

    const [banner, setBanner] = useState({ type: '', message: '' });
    const [depts, setDepts] = useState([]);

    React.useEffect(() => {
        fetch('/api/dropdowns?category=department')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    if (data.options) {
                        setDepts(data.options);
                    } else if (data.dropdowns && data.dropdowns.department) {
                        setDepts(data.dropdowns.department);
                    }
                }
            })
            .catch((err) => console.warn('Failed to load active departments:', err));
    }, []);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setBanner({ type: '', message: '' });

        if (!loginUsername || !loginPassword) {
            setBanner({ type: 'error', message: 'Please enter both username/email and password.' });
            return;
        }

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginUsername, password: loginPassword }),
            });
            const data = await res.json();

            if (data.success) {
                if (data.isAdmin) {
                    loginAdmin();
                } else {
                    loginUser(data.user);
                }
            } else {
                setBanner({ type: 'error', message: data.message || 'Login failed.' });
            }
        } catch (err) {
            setBanner({ type: 'error', message: 'Server connection error. Please check if node server.js is running.' });
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setBanner({ type: '', message: '' });

        if (!regEmail || !regDept || !regPassword || !regConfirm) {
            setBanner({ type: 'error', message: 'Please fill in all registration fields.' });
            return;
        }

        if (regPassword.length < 8) {
            setBanner({ type: 'error', message: 'Password must be at least 8 characters long.' });
            return;
        }

        if (regPassword !== regConfirm) {
            setBanner({ type: 'error', message: 'Passwords do not match.' });
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: regEmail, department: regDept, password: regPassword }),
            });
            const data = await res.json();

            if (data.success) {
                setBanner({ type: 'success', message: 'Account registered successfully! Please sign in below.' });
                setTab('login');
                setLoginUsername(regEmail);
            } else {
                setBanner({ type: 'error', message: data.message || 'Registration failed.' });
            }
        } catch (err) {
            setBanner({ type: 'error', message: 'Server connection error during registration.' });
        }
    };

    return (
        <div className="auth-stage-centered">
            {/* Theme Switcher above card */}
            <div className="theme-changer-wrap">
                <button
                    type="button"
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title="Switch Theme"
                >
                    {theme === 'light' ? (
                        <>
                            <Moon size={16} color="#0f172a" />
                            <span>Dark Mode</span>
                        </>
                    ) : (
                        <>
                            <Sun size={16} color="#f59e0b" />
                            <span>Light Mode</span>
                        </>
                    )}
                </button>
            </div>

            {/* Main Auth Card centered */}
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <img
                        src="/logo.png"
                        alt="National Engineering College Logo"
                        style={{ maxHeight: '110px', width: 'auto', objectFit: 'contain' }}
                    />
                    <h2 className="portal-title">
                        NEC Recruitment Portal
                    </h2>
                </div>

                <div className="auth-card-head">
                    <h1>{tab === 'login' ? 'Sign in to your account' : 'New Staff Registration'}</h1>
                    {tab === 'register' && <p>Provide your details to register as a new staff candidate.</p>}
                </div>

                <Banner type={banner.type} message={banner.message} />

                {tab === 'login' ? (
                    <form onSubmit={handleLoginSubmit}>
                        <div className="field">
                            <label>Username / Email</label>
                            <input
                                type="text"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                placeholder="Enter your username or email"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="field">
                            <label>Password</label>
                            <div className="input-wrap">
                                <input
                                    type={showLoginPw ? 'text' : 'password'}
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowLoginPw(!showLoginPw)}
                                >
                                    {showLoginPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>
                            Sign in
                        </button>

                        <p className="switch-line">
                            New staff candidate?{' '}
                            <button type="button" onClick={() => { setTab('register'); setBanner({ type: '', message: '' }); }}>
                                Sign up
                            </button>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit}>
                        <div className="field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                placeholder="yourname@nec.edu.in"
                                required
                            />
                        </div>

                        <div className="field">
                            <label>
                                Password <span className="hint">— at least 8 characters</span>
                            </label>
                            <div className="input-wrap">
                                <input
                                    type={showRegPw ? 'text' : 'password'}
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    placeholder="Create a password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowRegPw(!showRegPw)}
                                >
                                    {showRegPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="field">
                            <label>Confirm Password</label>
                            <div className="input-wrap">
                                <input
                                    type={showRegConfirm ? 'text' : 'password'}
                                    value={regConfirm}
                                    onChange={(e) => setRegConfirm(e.target.value)}
                                    placeholder="Re-enter password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowRegConfirm(!showRegConfirm)}
                                >
                                    {showRegConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="field">
                            <label>Department</label>
                            <select value={regDept} onChange={(e) => setRegDept(e.target.value)} required>
                                <option value="" disabled>Choose your department</option>
                                {depts.length > 0 ? (
                                    depts.map((d, idx) => (
                                        <option key={d.id || idx} value={d.value || d.option_value}>
                                            {d.label || d.option_label}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="IT">Information Technology</option>
                                        <option value="CSE">Computer Science &amp; Engineering</option>
                                        <option value="ECE">Electronics &amp; Communication</option>
                                        <option value="EEE">Electrical &amp; Electronics</option>
                                        <option value="MECH">Mechanical Engineering</option>
                                        <option value="CIVIL">Civil Engineering</option>
                                        <option value="AIDS">AI &amp; Data Science</option>
                                        <option value="MATHS">Mathematics</option>
                                        <option value="PHYSICS">Physics</option>
                                        <option value="CHEMISTRY">Chemistry</option>
                                        <option value="TAMIL">Tamil</option>
                                        <option value="ENGLISH">English</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>
                            Register Account
                        </button>

                        <p className="switch-line">
                            Already registered?{' '}
                            <button type="button" onClick={() => { setTab('login'); setBanner({ type: '', message: '' }); }}>
                                Sign in instead
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};
