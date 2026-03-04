import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Building,
    Save,
    Plus,
    Loader2,
    Settings,
    Users,
    AlertTriangle,
    CheckCircle,
    Edit,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

const ExamHallAllocation = () => {
    const [activeTab, setActiveTab] = useState('generator');
    const [halls, setHalls] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Tab 1: Hall Setup State ---
    const [hallForm, setHallForm] = useState({ hallName: '', benches: '', seatsPerBench: 2, building: '', floor: '' });
    const [isEditingHall, setIsEditingHall] = useState(false);
    const [editHallId, setEditHallId] = useState(null);

    // --- Tab 2: Generator State --- // Subject & Session details included here
    const [examForm, setExamForm] = useState({
        examName: '',
        subjectName: '',
        subjectCode: '',
        date: '',
        session: 'Forenoon',
        year: '',
        semester: '',
        section: '',
        participatingDepartments: ''
    });
    const [selectedHalls, setSelectedHalls] = useState([]);
    const [studentCount, setStudentCount] = useState(null);

    // --- Tab 3: Tweaker State (The Generated Grid) ---
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [selectedSeatToSwap, setSelectedSeatToSwap] = useState(null); // { hallId, benchNo, seatNo }

    useEffect(() => {
        fetchHalls();
        fetchSubjects();
    }, []);

    useEffect(() => {
        const fetchStudentCount = async () => {
            if (examForm.participatingDepartments || examForm.year || examForm.semester || examForm.section) {
                try {
                    const res = await api.post('/exam-room/student-count', {
                        department: examForm.participatingDepartments,
                        year: examForm.year,
                        semester: examForm.semester,
                        section: examForm.section
                    });
                    if (res.data.success) {
                        setStudentCount(res.data.count);
                    }
                } catch (error) {
                    console.error("Failed to fetch student count:", error);
                }
            } else {
                setStudentCount(null);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchStudentCount();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [examForm.participatingDepartments, examForm.year, examForm.semester, examForm.section]);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/college/subjects');
            setSubjects(res.data);
        } catch (err) {
            console.error('Fetch subjects error:', err);
        }
    };

    const fetchHalls = async () => {
        try {
            const res = await api.get('/exam-room/halls');
            setHalls(res.data.data);
        } catch (err) {
            console.error('Fetch halls error:', err);
        }
    };

    // ----- HALL CREATION / UPDATE -----
    const handleCreateOrUpdateHall = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isEditingHall) {
                await api.put(`/exam-room/hall/${editHallId}`, hallForm);
                alert('Hall updated successfully!');
            } else {
                await api.post('/exam-room/hall', hallForm);
                alert('Hall added successfully!');
            }
            fetchHalls();
            setHallForm({ hallName: '', benches: '', seatsPerBench: 2, building: '', floor: '' });
            setIsEditingHall(false);
            setEditHallId(null);
        } catch (err) {
            alert('Error saving hall: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (hall) => {
        setHallForm({
            hallName: hall.hallName,
            benches: hall.benches,
            seatsPerBench: hall.seatsPerBench,
            building: hall.building || '',
            floor: hall.floor || ''
        });
        setIsEditingHall(true);
        setEditHallId(hall._id);
        setActiveTab('setup');
    };

    const handleDeleteHall = async (id) => {
        if (!window.confirm("Are you sure you want to delete this hall?")) return;
        try {
            setLoading(true);
            await api.delete(`/exam-room/hall/${id}`);
            alert('Hall deleted successfully!');
            fetchHalls();
        } catch (err) {
            alert('Error deleting hall: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleHallSelectClick = (hallId) => {
        setSelectedHalls(prev =>
            prev.includes(hallId) ? prev.filter(h => h !== hallId) : [...prev, hallId]
        );
    };

    // ----- CSP GENERATION (Step 1 A + 2 A) -----
    const handleGenerate = async (e) => {
        e.preventDefault();
        setError(null);
        if (selectedHalls.length === 0) {
            alert("Please select at least one physical exam hall to use.");
            return;
        }

        try {
            setLoading(true);

            // 1. Create the Exam Details object
            const depts = examForm.participatingDepartments.split(',').map(d => d.trim()).filter(d => !!d);
            const createdExam = await api.post('/exam-room/exam', {
                examName: examForm.examName,
                subjectName: examForm.subjectName,
                subjectCode: examForm.subjectCode,
                date: examForm.date,
                session: examForm.session,
                year: examForm.year,
                semester: examForm.semester,
                section: examForm.section,
                participatingDepartments: depts
            });

            // 2. Generate CSP Seating
            const generateRes = await api.post('/exam-room/generate', {
                examId: createdExam.data.data._id,
                selectedHallIds: selectedHalls
            });

            setGeneratedPlan({
                examId: createdExam.data.data._id,
                totalStudentsAssigned: generateRes.data.totalStudentsAssigned,
                arrangement: generateRes.data.arrangement
            });

            setActiveTab('tweaker');

        } catch (err) {
            // Option 2A: Block allocation if overflow and prompt admin
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError("Error generating allocation.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ----- TWEAKER: Click to Swap (Step 3 A) -----
    const handleSeatClick = (hallId, benchNo, seatNo) => {
        if (!selectedSeatToSwap) {
            // First click
            setSelectedSeatToSwap({ hallId, benchNo, seatNo });
        } else {
            // Second click - Perform Swap
            const planCopy = { ...generatedPlan };

            // Find first position
            let firstHall = planCopy.arrangement.find(h => h.hallId === selectedSeatToSwap.hallId);
            let firstBench = firstHall.benches.find(b => b.benchNo === selectedSeatToSwap.benchNo);
            let firstSeatIdx = firstBench.seats.findIndex(s => s.seatNo === selectedSeatToSwap.seatNo);
            let firstStudent = firstBench.seats[firstSeatIdx].student;

            // Find second position
            let secondHall = planCopy.arrangement.find(h => h.hallId === hallId);
            let secondBench = secondHall.benches.find(b => b.benchNo === benchNo);
            let secondSeatIdx = secondBench.seats.findIndex(s => s.seatNo === seatNo);
            let secondStudent = secondBench.seats[secondSeatIdx].student;

            // Swap them
            firstBench.seats[firstSeatIdx].student = secondStudent;
            secondBench.seats[secondSeatIdx].student = firstStudent;

            setGeneratedPlan(planCopy);
            setSelectedSeatToSwap(null); // Reset selection
        }
    };

    // ----- SAVE FINAL PLAN -----
    const handleSavePlan = async () => {
        try {
            setLoading(true);
            await api.post('/exam-room/save-plan', {
                examId: generatedPlan.examId,
                arrangement: generatedPlan.arrangement,
                totalStudentsAssigned: generatedPlan.totalStudentsAssigned
            });
            alert('Final Allocation Saved Successfully!');
        } catch (err) {
            alert('Error saving plan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="header-icon">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h2 className="page-title">AI Exam Hall Allocation (CSP)</h2>
                        <p className="page-subtitle">Automatically generate zig-zag seating avoiding overlap</p>
                    </div>
                </div>
            </header>

            {/* TAB NAVIGATION */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn-${activeTab === 'generator' ? 'primary' : 'secondary'}`}
                    onClick={() => setActiveTab('generator')}
                >
                    <Settings size={18} /> Allocation Generator
                </button>
                <button
                    className={`btn-${activeTab === 'setup' ? 'primary' : 'secondary'}`}
                    onClick={() => setActiveTab('setup')}
                >
                    <Building size={18} /> Hall database
                </button>
                {generatedPlan && (
                    <button
                        className={`btn-${activeTab === 'tweaker' ? 'primary' : 'secondary'}`}
                        onClick={() => setActiveTab('tweaker')}
                    >
                        <Users size={18} /> Finalize & Tweak Grid
                    </button>
                )}
            </div>

            {error && (
                <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            {/* TAB 1: GENERATOR */}
            {activeTab === 'generator' && (
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>1. Generate AI Allocation</h3>
                    <form onSubmit={handleGenerate} style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>

                        {/* 1) Exam Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>1. Exam Name</label>
                            <input required type="text" value={examForm.examName} onChange={e => setExamForm({ ...examForm, examName: e.target.value })} placeholder="e.g. Midterms 2026" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                        </div>

                        {/* 2 & 3) Subject Search, Subject Name, Subject Code */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>2. Subject Name</label>
                                <input required type="text" value={examForm.subjectName} onChange={e => setExamForm({ ...examForm, subjectName: e.target.value })} placeholder="e.g. Data Structures" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>3. Subject Code (Search to Auto-fill)</label>
                                <input list="subjects-list" required type="text" value={examForm.subjectCode} onChange={e => {
                                    const val = e.target.value;
                                    setExamForm({ ...examForm, subjectCode: val });
                                    // Make a simple check to auto fill subject name if picked directly from datalist
                                    const matched = subjects.find(s => s.code === val);
                                    if (matched) setExamForm(prev => ({ ...prev, subjectName: matched.name }));
                                }} placeholder="Search Subject Code" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                                <datalist id="subjects-list">
                                    {subjects.map(s => <option key={s._id} value={s.code}>{s.name} ({s.code})</option>)}
                                </datalist>
                            </div>
                        </div>

                        {/* 4 & 5) Date and Session */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>4. Date</label>
                                <input required type="date" value={examForm.date} onChange={e => setExamForm({ ...examForm, date: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>5. Session</label>
                                <select value={examForm.session} onChange={e => setExamForm({ ...examForm, session: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}>
                                    <option value="Forenoon">Forenoon</option>
                                    <option value="Afternoon">Afternoon</option>
                                </select>
                            </div>
                        </div>

                        {/* 6) Department */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>6. Participating Departments</label>
                            <input required type="text" value={examForm.participatingDepartments} onChange={e => setExamForm({ ...examForm, participatingDepartments: e.target.value })} placeholder="e.g. CSE, IT" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                        </div>

                        {/* 7, 8, 9) Year, Semester, Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>7. Year</label>
                                <input type="text" value={examForm.year} onChange={e => setExamForm({ ...examForm, year: e.target.value })} placeholder="e.g. 2" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>8. Semester</label>
                                <input type="text" value={examForm.semester} onChange={e => setExamForm({ ...examForm, semester: e.target.value })} placeholder="e.g. 4" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>9. Section</label>
                                <input type="text" value={examForm.section} onChange={e => setExamForm({ ...examForm, section: e.target.value })} placeholder="e.g. A" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                            </div>
                        </div>

                        {/* Preview Student Count */}
                        {studentCount !== null && (
                            <div style={{ backgroundColor: '#e0f2fe', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0369a1' }}>
                                <Users size={20} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Expected Headcount</div>
                                    <div style={{ fontSize: '0.9rem' }}>{studentCount} {studentCount === 1 ? 'student' : 'students'} match this criteria</div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Select Halls to use (Physical Capacity)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {halls.length === 0 ? <p style={{ color: 'red' }}>No halls in DB. Please go to Setup Tab.</p> : halls.map(hall => (
                                    <label key={hall._id} style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '2rem',
                                        cursor: 'pointer',
                                        backgroundColor: selectedHalls.includes(hall._id) ? 'var(--primary)' : 'white',
                                        color: selectedHalls.includes(hall._id) ? 'white' : 'black'
                                    }}>
                                        <input type="checkbox" style={{ display: 'none' }}
                                            checked={selectedHalls.includes(hall._id)}
                                            onChange={() => handleHallSelectClick(hall._id)}
                                        />
                                        {hall.hallName} ({hall.totalSeats} seats)
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button disabled={loading} type="submit" className="btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }}>
                            {loading ? <Loader2 className="spin" /> : <Settings size={20} />}
                            {loading ? 'Running AI...' : 'Run CSP Allocator'}
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 2: SETUP DB HALLS */}
            {activeTab === 'setup' && (
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>{isEditingHall ? 'Edit Hall' : 'Create New Hall (Physical Interface)'}</h3>
                    <form onSubmit={handleCreateOrUpdateHall} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '600px', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Hall Name</label>
                            <input required type="text" value={hallForm.hallName} onChange={e => setHallForm({ ...hallForm, hallName: e.target.value })} placeholder="E.g. LH-101" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Total Benches Available</label>
                            <input required type="number" value={hallForm.benches} onChange={e => setHallForm({ ...hallForm, benches: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Seats per Bench</label>
                            <input required type="number" min="1" value={hallForm.seatsPerBench} onChange={e => setHallForm({ ...hallForm, seatsPerBench: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Block (Optional)</label>
                            <input type="text" value={hallForm.building} onChange={e => setHallForm({ ...hallForm, building: e.target.value })} placeholder="E.g. Engineering Block" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label>Floor (Optional)</label>
                            <input type="text" value={hallForm.floor} onChange={e => setHallForm({ ...hallForm, floor: e.target.value })} placeholder="E.g. 2nd Floor" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                                {isEditingHall ? <><Save size={18} /> Update Hall</> : <><Plus size={18} /> Add Hall</>}
                            </button>
                            {isEditingHall && (
                                <button type="button" className="btn-secondary" onClick={() => { setIsEditingHall(false); setHallForm({ hallName: '', benches: '', seatsPerBench: 2, building: '', floor: '' }); setEditHallId(null); }} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Existing Halls</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Hall Name</th>
                                <th>Block & Floor</th>
                                <th>Benches</th>
                                <th>Seats/Bench</th>
                                <th>Total Capacity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {halls.map((h, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600 }}>{h.hallName}</td>
                                    <td>
                                        {h.building ? `Block: ${h.building}` : ''}
                                        {h.building && h.floor ? ' | ' : ''}
                                        {h.floor ? `Floor: ${h.floor}` : ''}
                                        {!h.building && !h.floor ? '-' : ''}
                                    </td>
                                    <td>{h.benches}</td>
                                    <td>{h.seatsPerBench}</td>
                                    <td><span className="badge badge-success">{h.totalSeats}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEditClick(h)} className="btn-secondary" style={{ padding: '0.5rem' }} title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteHall(h._id)} className="btn-secondary" style={{ padding: '0.5rem', color: '#dc2626' }} title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 3: TWEAKER & DISPLAY */}
            {activeTab === 'tweaker' && generatedPlan && (
                <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Review & Tweak AI Output</h3>
                            <p style={{ color: '#64748b' }}>{generatedPlan.totalStudentsAssigned} students have been allocated. Click two seats to swap them if needed manually.</p>
                        </div>
                        <button disabled={loading} onClick={handleSavePlan} className="btn-success" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            {loading ? <Loader2 className="spin" size={20} /> : <CheckCircle size={20} />}
                            Save Final Allocation
                        </button>
                    </div>

                    {generatedPlan.arrangement.map(hall => (
                        <div key={hall.hallId} className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Hall: {hall.hallName}</h4>
                                <span className="badge badge-primary">Capacity: {hall.filledSeats} / {hall.totalCapacity} utilized</span>
                            </div>

                            {/* Grid format: Benches as rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {hall.benches.map(bench => (
                                    <div key={bench.benchNo} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '80px', fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>Bench #{bench.benchNo}</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem' }}>
                                            {bench.seats.map(seat => {
                                                const isSelected = selectedSeatToSwap?.hallId === hall.hallId &&
                                                    selectedSeatToSwap?.benchNo === bench.benchNo &&
                                                    selectedSeatToSwap?.seatNo === seat.seatNo;

                                                return (
                                                    <div
                                                        key={seat.seatNo}
                                                        onClick={() => handleSeatClick(hall.hallId, bench.benchNo, seat.seatNo)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            backgroundColor: isSelected ? 'var(--secondary)' : 'white',
                                                            color: isSelected ? 'white' : 'black',
                                                            border: isSelected ? '2px solid var(--secondary)' : '1px solid #cbd5e1',
                                                            borderRadius: '0.25rem',
                                                            minWidth: '150px',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                        }}
                                                    >
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Seat {seat.seatNo}</div>
                                                        <div style={{ fontSize: '0.9rem' }}>{seat.student.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: isSelected ? 'rgba(255,255,255,0.8)' : '#64748b' }}>{seat.student.department} / {seat.student.userId}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExamHallAllocation;
