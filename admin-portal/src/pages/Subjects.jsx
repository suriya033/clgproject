import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    BookOpen, Search, Plus, Edit2, Trash2, Loader2, RefreshCw, FileUp, Hash, Layers, Bookmark, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import PremiumTable from '../components/PremiumTable';
import toast from 'react-hot-toast';

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchSubjects(); }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/college/subjects');
            setSubjects(Array.isArray(res.data) ? res.data.reverse() : []);
        } catch (err) {
            toast.error('Data Fetch Error: Catalog unavailable');
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
                return headers.reduce((obj, header, i) => { obj[header] = values[i]; return obj; }, {});
            });
            if (data.length === 0) return toast.error('Check CSV format');
            if (window.confirm(`Import ${data.length} curricular assets?`)) {
                try {
                    setLoading(true);
                    const response = await api.post('/college/subjects/bulk', data);
                    toast.success(`Imported ${response.data.stats.created} subjects.`);
                    fetchSubjects();
                } catch (err) { toast.error('Import failed'); } finally { setLoading(false); }
            }
        };
        reader.readAsText(file);
    };

    const filteredSubjects = subjects.filter(sub =>
        sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const headers = [
        { label: 'Subject / Catalog', style: { paddingLeft: '2rem' } },
        { label: 'Course Code' },
        { label: 'Administrative Sector' },
        { label: 'Academic Cycle' },
        { label: 'Asset Type' },
        { label: 'Credits' },
        { label: 'Actions', style: { textAlign: 'right', paddingRight: '2rem' } }
    ];

    const renderSubject = (sub) => (
        <>
            <td style={{ paddingLeft: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Bookmark size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>{sub.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sub.shortName}</div>
                    </div>
                </div>
            </td>
            <td>
                <span className="badge" style={{ background: '#f8fafc', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.7rem' }}>
                    <Hash size={10} style={{ marginRight: '4px' }} />
                    {sub.code}
                </span>
            </td>
            <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{sub.department?.name || 'GEN-EDU'}</td>
            <td style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 700 }}>
                Y{sub.year} / S{sub.semester}
            </td>
            <td>
                <span className="badge" style={{
                    background: sub.type === 'Theory' ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: sub.type === 'Theory' ? 'var(--primary)' : 'var(--success)'
                }}>
                    {sub.type}
                </span>
            </td>
            <td style={{ fontWeight: 800 }}>{sub.credits} <span style={{ fontSize: '0.625rem', opacity: 0.5 }}>CR</span></td>
            <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'white', border: '1px solid var(--border)' }}><Edit2 size={16} /></button>
                    <button className="btn" style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'white', border: '1px solid var(--border)', color: '#ef4444' }}><Trash2 size={16} /></button>
                </div>
            </td>
        </>
    );

    return (
        <div className="subjects-view animate-fade-in">
            <div className="premium-card" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
                <div style={{ position: 'relative', width: '400px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search academic catalog by name or code..."
                        className="form-input"
                        style={{ paddingLeft: '3rem', backgroundColor: '#f8fafc', borderStyle: 'dashed' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1.25rem',
                        borderRadius: '1rem', background: 'white', border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.875rem'
                    }}>
                        <FileUp size={18} />
                        Bulk Sync
                        <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                    </label>
                    <Button icon={Plus}>Register Subject</Button>
                </div>
            </div>

            <PremiumTable
                headers={headers}
                rows={filteredSubjects}
                renderRow={renderSubject}
                loading={loading}
                emptyMessage="No curricular assets synchronized."
            />
        </div>
    );
};

export default Subjects;
