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
    GraduationCap,
    Bus
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'User Management', path: '/users', icon: Users },
        { name: 'Question Papers', path: '/papers', icon: BookOpen },
        { name: 'Announcements', path: '/announcements', icon: Bell },
        { name: 'Subjects', path: '/colleges', icon: Building },
        { name: 'Transport', path: '/transport', icon: Bus },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="sidebar" style={{
            width: 'var(--sidebar-width)',
            backgroundColor: 'var(--primary)',
            color: 'white',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            <div className="logo" style={{ marginBottom: '3rem', padding: '0 1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>
                    ADMIN<span style={{ color: 'white' }}>PORTAL</span>
                </h1>
            </div>

            <nav style={{ flex: 1 }}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '0.5rem',
                            transition: 'all 0.3s ease',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            color: isActive ? 'var(--secondary)' : 'white',
                            fontWeight: isActive ? '700' : '500'
                        })}
                    >
                        <item.icon size={20} />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    border: 'none',
                    width: '100%'
                }}
            >
                <LogOut size={20} />
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
