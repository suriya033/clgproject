import React, { useState, useEffect } from 'react';
import { questionPapers as qpApi } from '../api';
import {
    BookOpen,
    Search,
    Download,
    FileText,
    Trash2,
    Filter,
    Calendar,
    GraduationCap,
    Loader2,
    RefreshCw,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const QuestionPapers = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            setLoading(true);
            const res = await qpApi.get();
            setPapers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Fetch papers error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPapers = papers.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="papers-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Question Papers</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage student examination resources</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={fetchPapers}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'white' }}
                    >
                        <RefreshCw size={20} className={loading ? 'spin' : ''} />
                        Refresh
                    </button>
                    <button className="btn-primary">
                        <Plus size={20} />
                        Upload New Paper
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search by title, subject or department..."
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {filteredPapers.length > 0 ? filteredPapers.map((paper, idx) => (
                        <motion.div
                            key={paper._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="card"
                            style={{ position: 'relative' }}
                        >
                            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '1rem',
                                    background: '#fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)'
                                }}>
                                    <FileText size={28} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{paper.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{paper.subject}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    <GraduationCap size={14} />
                                    {paper.department}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    <Calendar size={14} />
                                    {paper.examYear} • {paper.examType}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, padding: '0.6rem' }}
                                    onClick={() => window.open(`http://localhost:5002${paper.fileUrl}`, '_blank')}
                                >
                                    <Download size={18} />
                                    Download
                                </button>
                                <button style={{ padding: '0.6rem', background: 'white', border: '1px solid var(--border)', borderRadius: '0.75rem', color: '#ef4444' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No question papers found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionPapers;
