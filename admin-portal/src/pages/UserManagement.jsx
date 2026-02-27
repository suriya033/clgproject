import React, { useState, useEffect } from 'react';
import { admin as adminApi } from '../api';
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    User as UserIcon,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getUsers();
            // Ensure it's an array and sort by newest
            setUsers(Array.isArray(res.data) ? res.data.reverse() : []);
        } catch (err) {
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="user-management">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>User Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Create, manage and audit university accounts</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={fetchUsers}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'white' }}
                    >
                        <RefreshCw size={20} className={loading ? 'spin' : ''} />
                        Refresh
                    </button>
                    <button className="btn-primary">
                        <Plus size={20} />
                        Create New User
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.8rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border)',
                            background: '#f8fafc'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'white' }}>
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                    <Loader2 className="spin" size={40} color="var(--primary)" />
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full Name</th>
                                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>User ID</th>
                                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Role</th>
                                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Department</th>
                                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((user, idx) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ borderBottom: '1px solid var(--border)' }}
                                >
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                background: 'var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                <UserIcon size={20} />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', fontWeight: 500 }}>{user.userId}</td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <span style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            background: user.role === 'Admin' ? '#fee2e2' : '#f1f5f9',
                                            color: user.role === 'Admin' ? 'var(--primary)' : 'var(--text-muted)'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>{user.department}</td>
                                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white' }}><Edit2 size={16} /></button>
                                            <button style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', color: '#ef4444' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
