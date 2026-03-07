import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { CreditCard, Plus, Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';

const FeeManagement = () => {
    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [newFee, setNewFee] = useState({
        student: '',
        type: 'Tuition',
        amount: '',
        dueDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [feesRes, usersRes] = await Promise.all([
                api.get('/college/fees'),
                api.get('/admin/users')
            ]);

            // Only admins/hods might see everything, students shouldn't be here
            setFees(feesRes.data);

            // Filter only students for the dropdown
            const studentUsers = usersRes.data.filter(u => u.role === 'Student');
            setStudents(studentUsers);
        } catch (error) {
            toast.error('Failed to fetch data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignFee = async (e) => {
        e.preventDefault();
        if (!newFee.student || !newFee.amount || !newFee.dueDate) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post('/college/fees', newFee);
            toast.success('Fee record assigned successfully');

            // Add the new fee to the state by refetching to get populated student details
            fetchData();

            // Reset form
            setNewFee({ student: '', type: 'Tuition', amount: '', dueDate: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign fee');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Paid': return { color: '#10b981', icon: CheckCircle2, bg: 'rgba(16, 185, 129, 0.1)' };
            case 'Overdue': return { color: '#ef4444', icon: AlertCircle, bg: 'rgba(239, 68, 68, 0.1)' };
            default: return { color: '#f59e0b', icon: Clock, bg: 'rgba(245, 158, 11, 0.1)' };
        }
    };

    // Filter fees based on search term
    const filteredFees = fees.filter(fee => {
        const studentMatch = fee.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fee.student?.userId?.toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = fee.type.toLowerCase().includes(searchTerm.toLowerCase());
        return studentMatch || typeMatch;
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: '0.75rem', color: 'white' }}>
                            <CreditCard size={24} />
                        </div>
                        Fee Assignments
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Create and monitor student fee records.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>

                {/* Left side Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                >
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} color="var(--primary)" />
                        Assign New Fee
                    </h3>

                    <form onSubmit={handleAssignFee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Select Student <span style={{ color: 'red' }}>*</span></label>
                            <select
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                                value={newFee.student}
                                onChange={(e) => setNewFee({ ...newFee, student: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select a student...</option>
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} ({s.userId})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Fee Type <span style={{ color: 'red' }}>*</span></label>
                            <select
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                                value={newFee.type}
                                onChange={(e) => setNewFee({ ...newFee, type: e.target.value })}
                            >
                                <option value="Tuition">Tuition Fee</option>
                                <option value="Hostel">Hostel Fee</option>
                                <option value="Transport">Transport Fee</option>
                                <option value="Exam">Exam Fee</option>
                                <option value="Library">Library Fee</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Amount (₹) <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="number"
                                min="0"
                                required
                                placeholder="e.g. 50000"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                                value={newFee.amount}
                                onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Due Date <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="date"
                                required
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem', colorScheme: 'dark' }}
                                value={newFee.dueDate}
                                onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                            />
                        </div>

                        <Button type="submit" loading={submitting} style={{ marginTop: '1rem', width: '100%' }}>
                            Assign Fee Record
                        </Button>
                    </form>
                </motion.div>

                {/* Right side Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                >
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Fee Records Directory</h3>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search by student or fee type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(0,0,0,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Student</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Fee Type</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Amount</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Due Date</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</td></tr>
                                ) : filteredFees.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No fee records found.</td></tr>
                                ) : (
                                    filteredFees.map((fee) => {
                                        const { color, icon: StatusIcon, bg } = getStatusConfig(fee.status);
                                        return (
                                            <tr key={fee._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', ':hover': { background: 'rgba(0,0,0,0.02)' } }}>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{fee.student?.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{fee.student?.userId || 'N/A'}</div>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{fee.type} Fee</td>
                                                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>₹{fee.amount.toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    {new Date(fee.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                                        padding: '0.375rem 0.75rem', borderRadius: '2rem',
                                                        fontSize: '0.8125rem', fontWeight: 600,
                                                        color: color, background: bg
                                                    }}>
                                                        <StatusIcon size={14} />
                                                        {fee.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FeeManagement;
