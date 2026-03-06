import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ userId: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', credentials);
            if (res.data.user.role !== 'Admin') {
                toast.error('Access Denied: Administrative Credentials Required');
                return;
            }
            localStorage.setItem('token', res.data.token);
            toast.success(`Access Granted: Welcome, ${res.data.user.name}`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication Failed: Check Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#0f172a', /* Dark Navy Base */
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Design Elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(128,0,0,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />

            {/* Left Side: Branding/Visual */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '5rem',
                color: 'white',
                position: 'relative',
                zIndex: 1,
                borderRight: '1px solid rgba(255,255,255,0.05)'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}
                >
                    <div style={{ padding: '0.75rem', background: 'var(--primary)', borderRadius: '1.25rem' }}><ShieldCheck size={32} /></div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>ADMIN<span style={{ color: 'var(--secondary)' }}>HUB</span></h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 style={{ fontSize: '3.5rem', lineHeight: 1.1, fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
                        University <br />
                        <span style={{ color: 'var(--secondary)' }}>Command Center</span>
                    </h2>
                    <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.6)', maxWidth: '480px', lineHeight: 1.6 }}>
                        Monitor campus logistics, manage academic records, and orchestrate student services from one unified administrative terminal.
                    </p>
                </motion.div>

                <div style={{ marginTop: '5rem', display: 'flex', gap: '3rem' }}>
                    <div>
                        <p style={{ fontSize: '2rem', fontWeight: 800 }}>99.9%</p>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Uptime</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '2rem', fontWeight: 800 }}>Encryption</p>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>256-bit AES</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div style={{
                width: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                zIndex: 1
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="premium-card"
                    style={{ width: '420px', padding: '3rem' }}
                >
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Secure Login</h3>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>Authenticate to access the administrative grid.</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <Input
                            label="Operator Identity (User ID)"
                            type="text"
                            required
                            icon={Hash}
                            placeholder="admin"
                            value={credentials.userId}
                            onChange={(e) => setCredentials({ ...credentials, userId: e.target.value })}
                        />
                        <Input
                            label="Security Key (Password)"
                            type="password"
                            required
                            icon={Lock}
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                                Stay Synchronized
                            </label>
                            <a href="#" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700 }}>Key Recovery?</a>
                        </div>

                        <Button
                            loading={loading}
                            style={{ width: '100%', height: '54px', fontSize: '1rem' }}
                            type="submit"
                        >
                            Authorize Entry
                        </Button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            Internal System: Authorized Personnel Only. <br />
                            All interactions are logged for security audits.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
