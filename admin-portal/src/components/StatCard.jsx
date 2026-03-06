import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, bg, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.5 }}
            className="premium-card"
            style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: `linear-gradient(135deg, white 0%, ${bg}15 100%)` }}
        >
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '1.25rem',
                backgroundColor: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                boxShadow: `0 8px 16px -4px ${color}33`
            }}>
                <Icon size={28} />
            </div>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{title}</p>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{value}</h2>
            </div>
        </motion.div>
    );
};

export default StatCard;
