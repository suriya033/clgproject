import React, { useState, useEffect } from 'react';
import api, { admin as adminApi } from '../api';
import {
    Users, Search, Filter, Plus, Edit2, Trash2, User as UserIcon, Loader2, RefreshCw, FileUp, MoreVertical, CheckCircle2, AlertCircle, X, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import PremiumTable from '../components/PremiumTable';
import Modal from '../components/Modal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [selectedRole, setSelectedRole] = useState('All');

    const [newUser, setNewUser] = useState({
        userId: '', name: '', email: '', password: '', role: 'Student', department: '', year: '', semester: '', mobileNo: ''
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
            toast.error('Failed to retrieve user library');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await adminApi.createUser(newUser);
            toast.success(`User Account Created: ${newUser.name}`);
            setModalOpen(false);
            setNewUser({
                userId: '', name: '', email: '', password: '', role: 'Student', department: '', year: '', semester: '', mobileNo: ''
            });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unauthorized: Contact Grid Admin');
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
                toast.error('Manifest empty: Check CSV format');
                return;
            }

            const confirmImport = window.confirm(`Found ${data.length} user records. Proceed with bulk onboarding?`);
            if (confirmImport) {
                const loadingToast = toast.loading('Synchronizing bulk records...');
                try {
                    setLoading(true);
                    const response = await api.post('/admin/users/bulk', data);
                    const { created, errors } = response.data.stats;
                    toast.dismiss(loadingToast);
                    toast.success(`Successfully Onboarded ${created} users.`);
                    if (errors.length > 0) toast.error(`${errors.length} records rejected by gateway.`);
                    fetchUsers();
                } catch (err) {
                    toast.dismiss(loadingToast);
                    toast.error('Gateway Error: Upload failed.');
                } finally {
                    setLoading(false);
                }
            }
        };
        reader.readAsText(file);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'All' || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const headers = [
        { label: 'Personnel', style: { paddingLeft: '2rem' } },
        { label: 'Identification' },
        { label: 'Classification' },
        { label: 'Department' },
        { label: 'Security Status', style: { textAlign: 'center' } },
        { label: 'Actions', style: { textAlign: 'right', paddingRight: '2rem' } }
    ];

    const renderUser = (user) => (
        <>
            <td style={{ paddingLeft: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.875rem'
                    }}>
                        {user.name?.charAt(0)}
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.025em' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                </div>
            </td>
            <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem' }}>{user.userId}</td>
            <td>
                <span className="badge" style={{
                    background: user.role === 'Admin' ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    color: user.role === 'Admin' ? 'var(--primary)' : 'var(--text-muted)'
                }}>
                    {user.role}
                </span>
            </td>
            <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{user.department}</td>
            <td style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', background: '#f0fdf4', borderRadius: '2rem', color: '#10b981' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Verified</span>
                </div>
            </td>
            <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'white', border: '1px solid var(--border)' }} title="Edit Profile">
                        <Edit2 size={16} />
                    </button>
                    <button className="btn" style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'white', border: '1px solid var(--border)', color: '#ef4444' }} title="Revoke Permissions">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </>
    );

    return (
        <div className="user-hub animate-fade-in">
            {/* Action Bar */}
            <div className="premium-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Find identification or name..."
                            className="form-input"
                            style={{ paddingLeft: '3rem', backgroundColor: '#f8fafc', borderStyle: 'dashed' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['All', 'Student', 'Staff', 'HOD', 'Admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 700,
                                    background: selectedRole === role ? 'var(--primary)' : '#f8fafc',
                                    color: selectedRole === role ? 'white' : 'var(--text-muted)',
                                    border: selectedRole === role ? 'none' : '1px solid var(--border)',
                                    transition: 'var(--transition-fast)'
                                }}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1.25rem',
                        borderRadius: '1rem', background: 'white', border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.875rem'
                    }}>
                        <FileUp size={18} />
                        Bulk Import
                        <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                    </label>
                    <Button onClick={() => setModalOpen(true)} icon={Plus}>Create Account</Button>
                </div>
            </div>

            {/* Main Table */}
            <PremiumTable
                headers={headers}
                rows={filteredUsers}
                renderRow={renderUser}
                loading={loading}
                emptyMessage="No personnel records found in current scan."
            />

            {/* User Account Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Establish New Personnel Record"
                size="lg"
                footer={(
                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <Button variant="secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>Abort Process</Button>
                        <Button onClick={handleCreateUser} style={{ flex: 1 }} loading={loading}>Finalize Enrollment</Button>
                    </div>
                )}
            >
                <form onSubmit={handleCreateUser}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input
                            label="Identification ID"
                            required
                            placeholder="e.g. CORE-STU-001"
                            value={newUser.userId}
                            onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })}
                        />
                        <Input
                            label="Legal Full Name"
                            required
                            placeholder="Enter personnel name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Input
                            label="Gateway Email"
                            type="email"
                            required
                            placeholder="university@node.com"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <Input
                            label="Internal Access Code"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Classification <span style={{ color: 'var(--error)' }}>*</span></label>
                            <select
                                className="form-input"
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="Student">Student Operative</option>
                                <option value="Staff">Faculty / Staff</option>
                                <option value="HOD">Director / HOD</option>
                                <option value="Office">Office Admin</option>
                                <option value="Admin">System Administrator</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sector / Department <span style={{ color: 'var(--error)' }}>*</span></label>
                            <select
                                className="form-input"
                                value={newUser.department}
                                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                            >
                                <option value="">Select Sector</option>
                                {departments.map(dept => <option key={dept._id} value={dept.name}>{dept.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {newUser.role === 'Student' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}
                        >
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Cycle / Year</label>
                                <select
                                    className="form-input"
                                    style={{ background: 'white' }}
                                    value={newUser.year}
                                    onChange={(e) => setNewUser({ ...newUser, year: e.target.value, semester: '' })}
                                >
                                    <option value="">Choose Cycle</option>
                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Active Phase (Sem)</label>
                                <select
                                    className="form-input"
                                    disabled={!newUser.year}
                                    style={{ background: 'white' }}
                                    value={newUser.semester}
                                    onChange={(e) => setNewUser({ ...newUser, semester: e.target.value })}
                                >
                                    <option value="">Choose Phase</option>
                                    {newUser.year && [parseInt(newUser.year) * 2 - 1, parseInt(newUser.year) * 2].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </motion.div>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
