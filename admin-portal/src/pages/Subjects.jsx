import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    BookOpen,
    Search,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    RefreshCw,
    FileUp,
    Hash,
    Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/college/subjects');
            setSubjects(Array.isArray(res.data) ? res.data.reverse() : []);
        } catch (err) {
            console.error('Fetch subjects error:', err);
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

            if (window.confirm(`Found ${data.length} subjects. Import them now?`)) {
                try {
                    setLoading(true);
                    const response = await api.post('/college/subjects/bulk', data);
                    const { created, errors } = response.data.stats;
                    alert(`Imported ${created} subjects successfully.${errors.length > 0 ? `\nFailed to import ${errors.length} subjects.` : ''}`);
                    fetchSubjects();
                } catch (err) {
                    alert('Error importing subjects: ' + (err.response?.data?.message || err.message));
                } finally {
                    setLoading(false);
                }
            }
        };
        reader.readAsText(file);
    };

    const filteredSubjects = subjects.filter(sub =>
        sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="header-icon">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h2 className="page-title">Subject Management</h2>
                        <p className="page-subtitle">Manage college subjects and courses</p>
                    </div>
                </div>

                <div className="header-actions">
                    <button className="btn-secondary" onClick={fetchSubjects}>
                        <RefreshCw size={20} className={loading ? 'spin' : ''} />
                        Refresh
                    </button>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                        <FileUp size={20} />
                        Import CSV
                        <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                    </label>
                    <button className="btn-primary">
                        <Plus size={20} />
                        Add Subject
                    </button>
                </div>
            </header>

            <section className="filters-section card" style={{ marginBottom: '2rem' }}>
                <div className="search-bar">
                    <Search size={20} color="#64748b" />
                    <input
                        type="text"
                        placeholder="Search subjects by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </section>

            {loading ? (
                <div className="loader-container">
                    <Loader2 size={40} className="spin" color="var(--primary)" />
                    <p>Loading subjects...</p>
                </div>
            ) : (
                <div className="table-card card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Subject Name</th>
                                <th>Code</th>
                                <th>Department</th>
                                <th>Year/Sem</th>
                                <th>Type</th>
                                <th>Credits</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubjects.map((sub, index) => (
                                <motion.tr
                                    key={sub._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{sub.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{sub.shortName}</div>
                                    </td>
                                    <td>
                                        <span className="badge badge-secondary">
                                            <Hash size={12} />
                                            {sub.code}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Layers size={14} />
                                            {sub.department?.name || 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        {sub.year} Yr / Sem {sub.semester}
                                    </td>
                                    <td>
                                        <span className={`badge ${sub.type === 'Theory' ? 'badge-primary' : 'badge-success'}`}>
                                            {sub.type}
                                        </span>
                                    </td>
                                    <td>{sub.credits}</td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="icon-btn edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="icon-btn delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Subjects;
