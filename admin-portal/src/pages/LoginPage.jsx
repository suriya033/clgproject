import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth as authApi } from '../api';
import { ShieldCheck, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [formData, setFormData] = useState({ userId: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await authApi.login(formData);
            if (res.data.user.role !== 'Admin') {
                setError('Access denied: Unauthorized role');
                return;
            }
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #800000 0%, #400000 100%)',
            padding: '1rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 16px rgba(128,0,0,0.2)'
                    }}>
                        <ShieldCheck size={40} color="var(--secondary)" />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Login</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Secure access to college management</p>
                </div>

                {error ? (
                    <div style={{
                        padding: '1rem',
                        background: '#fee2e2',
                        color: '#ef4444',
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                ) : null}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>User ID</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Enter your ID"
                                style={{ paddingLeft: '2.8rem' }}
                                value={formData.userId}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                style={{ paddingLeft: '2.8rem' }}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="spin" size={20} /> : (
                            <>
                                Sign In
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;
