import React, { useEffect, useState } from 'react';
import { admin as adminApi } from '../api';
import { Users, BookOpen, Bell, TrendingUp, UserPlus, Clock, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

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
            // Ensure data is an array before slicing
            setRecentUsers(Array.isArray(usersRes.data) ? usersRes.data.slice(0, 5) : []);
        } catch (err) {
            console.error('Fetch dashboard error:', err);
            setError('Failed to load dashboard data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="spin" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading intelligence...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '1.5rem' }}>
                <div style={{ padding: '2rem', background: '#fee2e2', borderRadius: '1rem', color: '#ef4444', textAlign: 'center', maxWidth: '400px' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Error Loading Dashboard</h3>
                    <p>{error || 'Unable to retrieve statistics.'}</p>
                </div>
                <button onClick={fetchDashboardData} className="btn-primary">
                    <RefreshCw size={18} />
                    Try Again
                </button>
            </div>
        );
    }

    const cards = [
        { title: 'Total Students', value: stats.students, icon: Users, color: '#2563eb', bg: '#dbeafe' },
        { title: 'Faculty Members', value: stats.staff, icon: Users, color: '#8b5cf6', bg: '#ede9fe' },
        { title: 'Question Papers', value: stats.papers || '40+', icon: BookOpen, color: '#059669', bg: '#d1fae5' }, // Backend might not have 'papers' in stats yet, but we have question-papers route
        { title: 'Announcements', value: stats.notices, icon: Bell, color: '#800000', bg: '#fee2e2' },
    ];

    return (
        <div className="dashboard">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Overview</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome back to your administration command center.</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card"
                        style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '1rem',
                            backgroundColor: card.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: card.color
                        }}>
                            <card.icon size={28} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{card.title}</p>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{card.value}</h2>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Recently Joined Users</h3>
                        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View All</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>User</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Role</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((user) => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '10px',
                                                    background: 'var(--primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {user.name?.charAt(0) || 'U'}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                background: user.role === 'Admin' ? '#fee2e2' : '#f1f5f9',
                                                color: user.role === 'Admin' ? 'var(--primary)' : 'var(--text-muted)',
                                                fontSize: '0.75rem',
                                                fontWeight: '700'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.department}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="card" style={{ background: 'var(--primary)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <button style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
                            <div style={{ padding: '0.5rem', background: 'var(--secondary)', borderRadius: '0.5rem', color: '#000' }}><UserPlus size={18} /></div>
                            Add New User
                        </button>
                        <button style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
                            <div style={{ padding: '0.5rem', background: 'var(--secondary)', borderRadius: '0.5rem', color: '#000' }}><Clock size={18} /></div>
                            Generate Timetable
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
