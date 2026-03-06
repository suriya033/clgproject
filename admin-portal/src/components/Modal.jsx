import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    showClose = true
}) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const sizes = {
        sm: '400px',
        md: '600px',
        lg: '850px',
        xl: '1100px',
        full: '95vw'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '1.5rem'
                }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)'
                        }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: sizes[size],
                            maxHeight: '90vh',
                            background: 'white',
                            borderRadius: '2rem',
                            boxShadow: 'var(--shadow-premium)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f8fafc'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h3>
                            {showClose && (
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'white',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0.75rem',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'var(--transition-fast)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <X size={20} color="var(--text-muted)" />
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div style={{
                            padding: '2rem',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div style={{
                                padding: '1.25rem 2rem',
                                borderTop: '1px solid var(--border)',
                                background: '#f8fafc',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem'
                            }}>
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
