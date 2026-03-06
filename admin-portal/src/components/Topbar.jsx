import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Topbar = () => {
    const location = useLocation();

    // Get page title from path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Command Center';
        if (path === '/users') return 'User Hub';
        if (path === '/papers') return 'Question Papers';
        if (path === '/colleges') return 'Department Hub';
        if (path === '/exam-halls') return 'Seat Allocation';
        if (path === '/transport') return 'Logistics & Transport';
        return 'Admin Portal';
    };

    return (
        <header className="glass-effect" style={{
            height: 'var(--topbar-height)',
            padding: '0 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 900,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
        }}>
            <div>
                <motion.h2
                    key={location.pathname}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}
                >
                    {getPageTitle()}
                </motion.h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        style={{
                            padding: '0.625rem 1rem 0.625rem 2.5rem',
                            borderRadius: '1rem',
                            border: '1px solid var(--border)',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            width: '240px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border)',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <Bell size={18} color="var(--text-muted)" />
                        <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '8px',
                            height: '8px',
                            background: 'var(--primary)',
                            borderRadius: '50%',
                            border: '2px solid white'
                        }} />
                    </button>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem',
                        borderRadius: '1rem',
                        border: '1px solid var(--border)',
                        background: 'white',
                        cursor: 'pointer'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '0.5rem',
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <User size={18} />
                        </div>
                        <div style={{ marginRight: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 }}>Administrator</p>
                            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', lineHeight: 1, marginTop: '2px' }}>Super User</p>
                        </div>
                        <ChevronDown size={14} color="var(--text-muted)" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
