import React, { useEffect, useState } from 'react';
import { admin as adminApi } from '../api';
import { Users, BookOpen, Bell, TrendingUp, UserPlus, Clock, Loader2, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [statsRes, usersRes] = await Promise.all([
                adminApi.getStats(),
                adminApi.getUsers()
            ]);
            setStats(statsRes.data);
            setRecentUsers(Array.isArray(usersRes.data) ? usersRes.data.slice(0, 6) : []);
        } catch (err) {
            console.error('Fetch dashboard error:', err);
            setError('Failed to load intelligence. Please check your data link.');
        } finally {
            setLoading(false);
        }
    };

    // Dummy data for charts - in production, this should come from API
    const chartData = [
        { name: 'Mon', logins: 400, papers: 240 },
        { name: 'Tue', logins: 300, papers: 139 },
        { name: 'Wed', logins: 200, papers: 980 },
        { name: 'Thu', logins: 278, papers: 390 },
        { name: 'Fri', logins: 189, papers: 480 },
        { name: 'Sat', logins: 239, papers: 380 },
        { name: 'Sun', logins: 349, papers: 430 },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '1.5rem' }}>
                <div className="spin-slow" style={{ width: '60px', height: '60px', border: '4px solid var(--primary)', borderRadius: '50%', borderTopColor: 'transparent' }} />
                <p style={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>SYNCHRONIZING CORE DATA...</p>
            </div>
        );
    }

    const cards = [
        { title: 'Total Students', value: stats?.students || 0, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
        { title: 'Faculty Members', value: stats?.staff || 0, icon: ShieldCheck, color: '#8b5cf6', bg: '#f5f3ff' },
        { title: 'Question Bank', value: stats?.papers || '40+', icon: BookOpen, color: '#10b981', bg: '#ecfdf5' },
        { title: 'Announcements', value: stats?.notices || 0, icon: Bell, color: '#f59e0b', bg: '#fffbeb' },
    ];

    return (
        <div className="dashboard animate-fade-in">
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {cards.map((card, idx) => (
                    <StatCard key={idx} {...card} delay={idx} />
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <section className="premium-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Platform Analytics</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>User login & activity trends for this week</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.75rem' }}>
                            <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: 'white', boxShadow: 'var(--shadow-sm)' }}>Weekly</button>
                            <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: 'transparent' }}>Monthly</button>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '1rem' }}
                                />
                                <Area type="monotone" dataKey="logins" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorLogins)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="premium-card" style={{ background: '#0f172a', color: 'white', border: 'none' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'white' }}>Mission Control</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ padding: '0.5rem', background: 'var(--secondary)', borderRadius: '0.75rem', color: '#000' }}><UserPlus size={20} /></div>
                                <span style={{ fontWeight: 700 }}>Personnel Operations</span>
                            </div>
                            <button className="btn" style={{ width: '100%', background: 'white', color: 'black', fontSize: '0.875rem' }}>Create New Account</button>
                        </div>

                        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ padding: '0.5rem', background: '#38bdf8', borderRadius: '0.75rem', color: 'white' }}><Clock size={20} /></div>
                                <span style={{ fontWeight: 700 }}>Academic Scheduling</span>
                            </div>
                            <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.875rem' }}>Manage Timetables</button>
                        </div>

                        <div style={{ padding: '1.25rem', background: 'rgba(var(--primary-rgb), 0.2)', borderRadius: '1.25rem', border: '1px solid rgba(var(--primary-rgb), 0.3)', marginTop: 'auto' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>System Status</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>99.9<span style={{ fontSize: '0.875rem' }}>%</span></p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Uptime this month</p>
                                </div>
                                <TrendingUp size={32} color="var(--success)" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <section className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>Recently Onboarded</h3>
                        <button style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none' }}>VIEW ALL RECORDS</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {recentUsers.map((user, idx) => (
                                    <tr key={user._id} style={{ borderBottom: idx === recentUsers.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700
                                                }}>{user.name?.charAt(0)}</div>
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{user.name}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.userId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <span className="badge" style={{
                                                background: user.role === 'Admin' ? 'rgba(128,0,0,0.1)' : '#f1f5f9',
                                                color: user.role === 'Admin' ? 'var(--primary)' : 'var(--text-muted)'
                                            }}>{user.role}</span>
                                        </td>
                                        <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.department}</td>
                                        <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', marginRight: '0.5rem' }} />
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Active</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="premium-card">
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Departmental Distribution</h3>
                    <div style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'CS', val: 45 },
                                { name: 'IT', val: 32 },
                                { name: 'EC', val: 28 },
                                { name: 'ME', val: 15 },
                                { name: 'CE', val: 12 },
                            ]}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                                <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                                    {[0, 1, 2, 3, 4].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : '#e2e8f0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--primary)' }} />
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Computer Science</span>
                            </div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>45%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#e2e8f0' }} />
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Information Tech</span>
                            </div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>32%</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
