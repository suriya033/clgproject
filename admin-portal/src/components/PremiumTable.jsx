import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumTable = ({ headers, rows, renderRow, loading = false, emptyMessage = 'No data available' }) => {
    return (
        <div className="premium-table-container">
            <div style={{ overflowX: 'auto' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            {headers.map((header, idx) => (
                                <th key={idx} style={header.style}>{header.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {loading ? (
                                <tr>
                                    <td colSpan={headers.length} style={{ textAlign: 'center', padding: '4rem' }}>
                                        <div className="spin-slow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderRadius: '50%', borderTopColor: 'transparent', margin: '0 auto' }} />
                                    </td>
                                </tr>
                            ) : rows.length > 0 ? (
                                rows.map((row, idx) => (
                                    <motion.tr
                                        key={row._id || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                    >
                                        {renderRow(row)}
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={headers.length} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PremiumTable;
