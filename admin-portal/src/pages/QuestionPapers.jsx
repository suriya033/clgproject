import React, { useState, useEffect } from 'react';
import { questionPapers as qpApi } from '../api';
import {
    BookOpen, Search, Download, FileText, Trash2, Filter, Calendar, GraduationCap, Loader2, RefreshCw, Plus, FileVideo, Layers, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

const QuestionPapers = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            setLoading(true);
            const res = await qpApi.get();
            setPapers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast.error('Manifest Error: Could not synchronize question bank');
        } finally {
            setLoading(false);
        }
    };

    const filteredPapers = papers.filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.subject?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDept === 'All' || p.department === selectedDept;
        return matchesSearch && matchesDept;
    });

    const departments = ['All', ...new Set(papers.map(p => p.department))];

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '1.5rem' }}>
                <Layers className="spin-slow" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>INDEXING REPOSITORY...</p>
            </div>
        );
    }

    return (
        <div className="papers-view animate-fade-in">
            {/* Control Bar */}
            <div className="premium-card" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                    <div style={{ position: 'relative', width: '360px' }}>
                        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Find subject or paper title..."
                            className="form-input"
                            style={{ paddingLeft: '3rem', backgroundColor: '#f8fafc', borderStyle: 'dashed' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => setSelectedDept(dept)}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap',
                                    background: selectedDept === dept ? '#0f172a' : '#f8fafc',
                                    color: selectedDept === dept ? 'white' : 'var(--text-muted)',
                                    border: selectedDept === dept ? 'none' : '1px solid var(--border)',
                                    transition: 'var(--transition-fast)'
                                }}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="secondary" onClick={fetchPapers} icon={RefreshCw}>Rescan</Button>
                    <Button icon={Plus}>Upload Manifest</Button>
                </div>
            </div>

            {/* Papers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
                <AnimatePresence mode="popLayout">
                    {filteredPapers.length > 0 ? filteredPapers.map((paper, idx) => (
                        <motion.div
                            key={paper._id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="premium-card"
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '1.25rem',
                                    background: 'rgba(var(--primary-rgb), 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--primary)', boxShadow: '0 8px 16px -4px rgba(var(--primary-rgb), 0.1)'
                                }}>
                                    <FileText size={32} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                                            {paper.examType || 'Term End'}
                                        </span>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ID: {paper._id?.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>{paper.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{paper.subject}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                                    <GraduationCap size={14} color="var(--primary)" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{paper.department}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                                    <Calendar size={14} color="var(--primary)" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{paper.examYear}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <Button
                                    style={{ flex: 1, height: '48px' }}
                                    onClick={() => {
                                        toast.success(`Accessing Archive: ${paper.title}`);
                                        window.open(`http://localhost:5002${paper.fileUrl}`, '_blank');
                                    }}
                                    icon={Download}
                                >
                                    Access File
                                </Button>
                                <button className="btn" style={{ width: '48px', height: '48px', padding: 0, background: '#fee2e2', color: '#ef4444', borderRadius: '1rem', border: 'none' }} title="Purge Record">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '2rem', border: '2px dashed var(--border)' }}>
                            <BookOpen size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <h4 style={{ fontWeight: 800, color: 'var(--text-muted)' }}>NO ASSETS DETECTED</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>The question bank is currently empty for this sector.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default QuestionPapers;
