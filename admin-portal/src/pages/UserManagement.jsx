import React, { useState, useEffect } from 'react';
import api, { admin as adminApi } from '../api';
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    User as UserIcon,
    Loader2,
    RefreshCw,
    FileUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [newUser, setNewUser] = useState({
        userId: '',
        name: '',
        email: '',
        password: '',
        role: 'Student',
        department: '',
        year: '',
        semester: '',
        mobileNo: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/college/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error('Fetch departments error:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getUsers();
            setUsers(Array.isArray(res.data) ? res.data.reverse() : []);
        } catch (err) {
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await adminApi.createUser(newUser);
            alert('User created successfully!');
            setModalOpen(false);
            setNewUser({
                userId: '',
                name: '',
                email: '',
                password: '',
                role: 'Student',
                department: '',
                year: '',
                semester: '',
                mobileNo: ''
            });
            fetchUsers();
        } catch (err) {
            alert('Error creating user: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleImportCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) return;

            const headers = lines[0].split(',').map(h => h.trim());
            const data = lines.slice(1).map(line => {
                const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
                return headers.reduce((obj, header, i) => {
                    obj[header] = values[i];
                    return obj;
                }, {});
            });

            if (data.length === 0) {
                alert('No data found in CSV');
                return;
            }

            if (window.confirm(`Found ${data.length} users. Import them now?`)) {
                try {
                    setLoading(true);
                    const response = await api.post('/admin/users/bulk', data);
                    const { created, errors } = response.data.stats;
                    alert(`Imported ${created} users successfully.${errors.length > 0 ? `\nFailed to import ${errors.length} users.` : ''}`);
                    fetchUsers();
                } catch (err) {
                    alert('Error importing users: ' + (err.response?.data?.message || err.message));
                } finally {
                    setLoading(false);
                }
            }
        };
        reader.readAsText(file);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="user-management" style={{ position: 'relative' }}>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                        <FileUp size={20} />
                        Import CSV
                        <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                    </label>
                    <button className="btn-primary" onClick={() => setModalOpen(true)}>
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
            </div>

            {loading && !modalOpen ? (
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

            {/* Add User Modal */}
            {modalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card"
                        style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>Create New User</h2>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                                <RefreshCw size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>User ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.userId}
                                        onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })}
                                        placeholder="e.g. STU001"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        placeholder="college@email.com"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>Role</label>
                                    <select
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: '#f1f5f9' }}
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Staff">Staff</option>
                                        <option value="HOD">HOD</option>
                                        <option value="Office">Office</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Department</label>
                                    <select
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: '#f1f5f9' }}
                                        value={newUser.department}
                                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {newUser.role === 'Student' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Academic Year</label>
                                        <select
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'white' }}
                                            value={newUser.year}
                                            onChange={(e) => setNewUser({ ...newUser, year: e.target.value, semester: '' })}
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Semester</label>
                                        <select
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'white' }}
                                            value={newUser.semester}
                                            disabled={!newUser.year}
                                            onChange={(e) => setNewUser({ ...newUser, semester: e.target.value })}
                                        >
                                            <option value="">Select Semester</option>
                                            {newUser.year && (
                                                <>
                                                    <option value={parseInt(newUser.year) * 2 - 1}>Semester {parseInt(newUser.year) * 2 - 1}</option>
                                                    <option value={parseInt(newUser.year) * 2}>Semester {parseInt(newUser.year) * 2}</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'white' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

