import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, Lock, Hash, Activity, Command } from 'lucide-react';
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
            if (res.data.user.role === 'Student' || res.data.user.role === 'Driver') {
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
            backgroundColor: '#020617', // Slate 950
            backgroundImage: 'radial-gradient(circle at top right, #1e1b4b 0%, #020617 60%), radial-gradient(circle at bottom left, #3b0764 0%, transparent 50%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Grid Pattern Background */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
                opacity: 0.5
            }} />

            {/* Left Section - Presentation */}
            <div style={{
                flex: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem',
                position: 'relative',
                zIndex: 10
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ maxWidth: '600px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Command size={28} color="#a855f7" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', letterSpacing: '2px' }}>
                            ADMIN<span style={{ color: '#a855f7' }}>NEXUS</span>
                        </h1>
                    </div>

                    <h2 style={{ fontSize: '4rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                        University <br />
                        <span style={{ background: 'linear-gradient(to right, #c084fc, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Command Center
                        </span>
                    </h2>

                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '4rem' }}>
                        A centralized, highly secure portal for tracking logistics, managing academics, and orchestrating comprehensive administrative protocols.
                    </p>

                    <div style={{ display: 'flex', gap: '3rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Activity size={20} color="#10b981" />
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>99.9%</span>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Network Uptime</span>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <ShieldCheck size={20} color="#3b82f6" />
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>AES-256</span>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>End-to-End Encryption</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Section - Login Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                zIndex: 10
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        width: '100%',
                        maxWidth: '440px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: '24px',
                        padding: '3rem',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                            <ShieldCheck size={32} color="#a855f7" />
                        </div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Admin Authorization</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Enter your credentials to access the grid.</p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <Input
                            label="Operator ID"
                            type="text"
                            required
                            icon={Hash}
                            placeholder="admin01"
                            value={credentials.userId}
                            onChange={(e) => setCredentials({ ...credentials, userId: e.target.value })}
                        />
                        <Input
                            label="Security Key"
                            type="password"
                            required
                            icon={Lock}
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ accentColor: '#a855f7', width: '16px', height: '16px', borderRadius: '4px' }} />
                                Remember Device
                            </label>
                            <a href="#" style={{ color: '#a855f7', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Forgot Key?</a>
                        </div>

                        <Button
                            loading={loading}
                            type="submit"
                            style={{
                                marginTop: '1rem',
                                background: 'linear-gradient(to right, #9333ea, #a855f7)',
                                border: 'none',
                                height: '54px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                borderRadius: '12px',
                                boxShadow: '0 4px 14px 0 rgba(168, 85, 247, 0.39)'
                            }}
                        >
                            Authorize Entry
                        </Button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>
                            RESTRICTED SYSTEM<br />
                            Unauthorized access is prohibited and logged.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
