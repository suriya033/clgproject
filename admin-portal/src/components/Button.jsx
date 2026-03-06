import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    onClick,
    icon: Icon,
    loading = false,
    disabled = false,
    className = '',
    type = 'button'
}) => {
    const baseClass = `btn btn-${variant} ${className}`;

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={baseClass}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
        >
            {loading ? (
                <span className="animate-spin mr-2">◌</span>
            ) : Icon && (
                <Icon size={18} />
            )}
            {children}
        </motion.button>
    );
};

export default Button;
