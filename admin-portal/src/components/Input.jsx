import React from 'react';

const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    error = '',
    icon: Icon,
    className = '',
    disabled = false,
    ...props
}) => {
    return (
        <div className={`form-group ${className}`}>
            {label && <label className="form-label">{label}{required && <span style={{ color: 'var(--error)' }}>*</span>}</label>}
            <div style={{ position: 'relative' }}>
                {Icon && (
                    <div style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    className="form-input"
                    style={{ paddingLeft: Icon ? '40px' : '1.25rem' }}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    {...props}
                />
            </div>
            {error && <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>{error}</p>}
        </div>
    );
};

export default Input;
