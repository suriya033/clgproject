import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Bell,
    LogOut,
    ShieldCheck,
    Building,
    Bus,
    Settings,
    ChevronRight,
    CreditCard,
    Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'User Hub', path: '/users', icon: Users },
        { name: 'Question Papers', path: '/papers', icon: BookOpen },
        { name: 'Subject Hub', path: '/colleges', icon: Building },
        { name: 'Seat Allocation', path: '/exam-halls', icon: ShieldCheck },
        { name: 'Transport', path: '/transport', icon: Bus },
        { name: 'Fee Management', path: '/fees', icon: Receipt },
        { name: 'Payments', path: '/payments', icon: CreditCard },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <aside className="sidebar glass-dark" style={{
            width: 'var(--sidebar-width)',
            backgroundColor: '#0f172a', /* Dark slate/black instead of maroon */
            color: 'white',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            padding: '2.5rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            borderRight: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div className="logo" style={{ marginBottom: '4rem', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: '12px', color: 'white' }}><ShieldCheck size={24} /></div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.025em' }}>
                    ADMIN<span style={{ color: 'var(--secondary)' }}>HUB</span>
                </h1>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="sidebar-link"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.25rem',
                            borderRadius: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            backgroundColor: isActive ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                            color: isActive ? 'var(--secondary)' : 'rgba(255,255,255,0.7)',
                            fontWeight: isActive ? '700' : '600',
                            border: isActive ? '1px solid rgba(var(--primary-rgb), 0.3)' : '1px solid transparent'
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <item.icon size={22} style={{ opacity: 0.9 }} />
                                    <span style={{ fontSize: '0.9375rem' }}>{item.name}</span>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -5 }}
                                >
                                    <ChevronRight size={16} />
                                </motion.div>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 1.25rem',
                        borderRadius: '1rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        fontWeight: '700',
                        fontSize: '0.9375rem',
                        transition: 'var(--transition-normal)'
                    }}
                >
                    <LogOut size={20} />
                    Logout Account
                </button>
            </div>

            <style>{`
                .sidebar-link:hover {
                    color: white !important;
                    background: rgba(255,255,255,0.05) !important;
                }
                .active.sidebar-link:hover {
                    background: rgba(var(--primary-rgb), 0.25) !important;
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
