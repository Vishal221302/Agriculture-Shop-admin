import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';


export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    if (isLoggedIn) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) { setError('Please enter username and password'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                login(data.token);
                navigate('/dashboard', { replace: true });
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch {
            setError('Cannot connect to server. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="login-logo">
                    <span>🌾</span>
                    <h1>Kisan Krishi Kendra</h1>
                    <p>Admin Panel — किसान कृषि केंद्र</p>
                </div>
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="admin-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="admin-input"
                            placeholder="admin"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label className="admin-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="admin-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <div className="login-error">⚠️ {error}</div>}
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : '🔑 Login'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                    Default: admin / admin123
                </p>
            </div>
        </div>
    );
}
