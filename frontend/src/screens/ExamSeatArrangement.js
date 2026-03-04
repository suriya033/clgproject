import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity,
    ScrollView, Alert, ActivityIndicator, Modal, FlatList, Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Plus, Cpu, Users, LayoutDashboard, Calendar, School, Edit2, Trash2 } from 'lucide-react-native';
import api from '../api/api';

const ExamSeatArrangement = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Generate'); // Generate, Halls, Exams
    const [loading, setLoading] = useState(false);

    // Halls State
    const [halls, setHalls] = useState([]);
    const [newHall, setNewHall] = useState({ hallName: '', benches: '', seatsPerBench: '2', building: '', floor: '' });
    const [isEditingHall, setIsEditingHall] = useState(false);
    const [editHallId, setEditHallId] = useState(null);

    // Exams State
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
    const [studentCount, setStudentCount] = useState(null);
    const [newExam, setNewExam] = useState({ examName: '', subjectName: '', subjectCode: '', date: '', session: 'Forenoon', year: '', semester: '', section: '', participatingDepartments: '' });

    // Generation State
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [selectedHallIds, setSelectedHallIds] = useState([]);
    const [generatedSeating, setGeneratedSeating] = useState(null);
    const [seatingStats, setSeatingStats] = useState(null);

    useEffect(() => {
        fetchHalls();
        fetchExams();
        fetchSubjects();
    }, []);

    useEffect(() => {
        const fetchStudentCount = async () => {
            if (newExam.participatingDepartments || newExam.year || newExam.semester || newExam.section) {
                try {
                    const res = await api.post('/exam-room/student-count', {
                        department: newExam.participatingDepartments,
                        year: newExam.year,
                        semester: newExam.semester,
                        section: newExam.section
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
    }, [newExam.participatingDepartments, newExam.year, newExam.semester, newExam.section]);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/college/subjects');
            setSubjects(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchHalls = async () => {
        try {
            const res = await api.get('/exam-room/halls');
            if (res.data.success) setHalls(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchExams = async () => {
        try {
            const res = await api.get('/exam-room/exams');
            if (res.data.success) setExams(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateOrUpdateHall = async () => {
        if (!newHall.hallName || !newHall.benches || !newHall.seatsPerBench) return Alert.alert('Error', 'Fill required hall fields');
        try {
            setLoading(true);
            if (isEditingHall) {
                await api.put(`/exam-room/hall/${editHallId}`, newHall);
                Alert.alert('Success', 'Hall updated successfully');
            } else {
                await api.post('/exam-room/hall', newHall);
                Alert.alert('Success', 'Hall created successfully');
            }
            setNewHall({ hallName: '', benches: '', seatsPerBench: '2', building: '', floor: '' });
            setIsEditingHall(false);
            setEditHallId(null);
            fetchHalls();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save hall');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (hall) => {
        setNewHall({
            hallName: hall.hallName,
            benches: hall.benches.toString(),
            seatsPerBench: hall.seatsPerBench.toString(),
            building: hall.building || '',
            floor: hall.floor || ''
        });
        setIsEditingHall(true);
        setEditHallId(hall._id);
        setActiveTab('Halls');
    };

    const handleDeleteHall = async (id) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this hall?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setLoading(true);
                        await api.delete(`/exam-room/hall/${id}`);
                        Alert.alert('Success', 'Hall deleted successfully');
                        fetchHalls();
                    } catch (error) {
                        Alert.alert('Error', error.response?.data?.message || 'Failed to delete hall');
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    const handleCreateExam = async () => {
        if (!newExam.examName || !newExam.subjectCode || !newExam.date || !newExam.participatingDepartments) {
            return Alert.alert('Error', 'Fill required exam fields');
        }
        try {
            setLoading(true);
            const deptArray = newExam.participatingDepartments.split(',').map(d => d.trim());
            await api.post('/exam-room/exam', { ...newExam, participatingDepartments: deptArray });
            setNewExam({ examName: '', subjectName: '', subjectCode: '', date: '', session: 'Forenoon', year: '', semester: '', section: '', participatingDepartments: '' });
            setSubjectSearch('');
            fetchExams();
            Alert.alert('Success', 'Exam created successfully');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create exam');
        } finally {
            setLoading(false);
        }
    };

    const toggleHallSelection = (id) => {
        if (selectedHallIds.includes(id)) {
            setSelectedHallIds(selectedHallIds.filter(hid => hid !== id));
        } else {
            setSelectedHallIds([...selectedHallIds, id]);
        }
    };

    const handleGenerate = async () => {
        if (!selectedExamId) return Alert.alert('Error', 'Please select an exam');
        if (selectedHallIds.length === 0) return Alert.alert('Error', 'Please select at least one hall');

        try {
            setLoading(true);
            const res = await api.post('/exam-room/generate', {
                examId: selectedExamId,
                selectedHallIds: selectedHallIds
            });
            if (res.data.success) {
                setGeneratedSeating(res.data.arrangement);
                setSeatingStats({ exam: res.data.exam, totalAssigned: res.data.totalStudentsAssigned });
                Alert.alert('Success', 'Seating Arrangement Generated Successfully');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to generate seating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1e3a8a', '#1d4ed8']} style={styles.headerGradient}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Seat Optimizer</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'Generate' && styles.activeTab]} onPress={() => setActiveTab('Generate')}>
                    <Cpu size={18} color={activeTab === 'Generate' ? '#1d4ed8' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'Generate' && styles.activeTabText]}>Generate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'Halls' && styles.activeTab]} onPress={() => setActiveTab('Halls')}>
                    <LayoutDashboard size={18} color={activeTab === 'Halls' ? '#1d4ed8' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'Halls' && styles.activeTabText]}>Halls</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'Exams' && styles.activeTab]} onPress={() => setActiveTab('Exams')}>
                    <Calendar size={18} color={activeTab === 'Exams' ? '#1d4ed8' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'Exams' && styles.activeTabText]}>Exams</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'Halls' && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{isEditingHall ? 'Edit Exam Hall' : 'Add New Exam Hall'}</Text>
                        <TextInput style={styles.input} placeholder="Hall Name (e.g. A-101)" value={newHall.hallName} onChangeText={t => setNewHall({ ...newHall, hallName: t })} />
                        <TextInput style={styles.input} placeholder="Number of Benches" keyboardType="numeric" value={newHall.benches} onChangeText={t => setNewHall({ ...newHall, benches: t })} />
                        <TextInput style={styles.input} placeholder="Seats per Bench" keyboardType="numeric" value={newHall.seatsPerBench} onChangeText={t => setNewHall({ ...newHall, seatsPerBench: t })} />
                        <TextInput style={styles.input} placeholder="Block (Optional)" value={newHall.building} onChangeText={t => setNewHall({ ...newHall, building: t })} />
                        <TextInput style={styles.input} placeholder="Floor (Optional)" value={newHall.floor} onChangeText={t => setNewHall({ ...newHall, floor: t })} />

                        <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateOrUpdateHall} disabled={loading}>
                            <Text style={styles.primaryBtnText}>{isEditingHall ? 'Update Hall' : 'Create Hall'}</Text>
                        </TouchableOpacity>

                        {isEditingHall && (
                            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#64748b', marginTop: 10 }]} onPress={() => { setIsEditingHall(false); setNewHall({ hallName: '', benches: '', seatsPerBench: '2', building: '', floor: '' }); setEditHallId(null); }}>
                                <Text style={styles.primaryBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        )}

                        <Text style={[styles.cardTitle, { marginTop: 30 }]}>Registered Halls</Text>
                        {halls.map(h => (
                            <View key={h._id} style={styles.listItem}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.listItemTitle}>{h.hallName}</Text>
                                    <Text style={styles.listItemSub}>Capacity: {h.totalSeats} ({h.benches} benches x {h.seatsPerBench})</Text>
                                    {(h.building || h.floor) && (
                                        <Text style={styles.listItemSub}>
                                            {h.building ? `Block: ${h.building}` : ''} {h.floor ? `| Floor: ${h.floor}` : ''}
                                        </Text>
                                    )}
                                </View>
                                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => handleEditClick(h)} style={{ padding: 5 }}>
                                        <Edit2 size={18} color="#3b82f6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteHall(h._id)} style={{ padding: 5 }}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'Exams' && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Add New Exam</Text>

                        {/* 1) Exam Name */}
                        <TextInput style={styles.input} placeholder="1. Exam Name" value={newExam.examName} onChangeText={t => setNewExam({ ...newExam, examName: t })} />

                        <View style={{ zIndex: 10 }}>
                            <TextInput
                                style={[styles.input, { marginBottom: showSubjectDropdown && subjectSearch.length > 0 ? 0 : 12 }]}
                                placeholder="🔍 Search Subject to Auto-fill..."
                                value={subjectSearch}
                                onChangeText={t => {
                                    setSubjectSearch(t);
                                    setShowSubjectDropdown(true);
                                }}
                                onFocus={() => setShowSubjectDropdown(true)}
                            />
                            {showSubjectDropdown && subjectSearch.length > 0 && (
                                <View style={styles.dropdownContainer}>
                                    {subjects.filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase()) || s.code.toLowerCase().includes(subjectSearch.toLowerCase())).slice(0, 5).map(s => (
                                        <TouchableOpacity key={s._id} style={styles.dropdownItem} onPress={() => {
                                            setSubjectSearch('');
                                            setNewExam({ ...newExam, subjectName: s.name, subjectCode: s.code });
                                            setShowSubjectDropdown(false);
                                        }}>
                                            <Text style={styles.dropdownText}>{s.name} ({s.code})</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* 2) Subject Name */}
                        <TextInput style={styles.input} placeholder="2. Subject Name" value={newExam.subjectName} onChangeText={t => setNewExam({ ...newExam, subjectName: t })} />

                        {/* 3) Subject Code */}
                        <TextInput style={styles.input} placeholder="3. Subject Code (e.g. CS101)" value={newExam.subjectCode} onChangeText={t => setNewExam({ ...newExam, subjectCode: t })} />

                        {/* 4) Date */}
                        <TextInput style={styles.input} placeholder="4. Date (YYYY-MM-DD)" value={newExam.date} onChangeText={t => setNewExam({ ...newExam, date: t })} />

                        {/* 5) Session */}
                        <View style={styles.sessionToggleContainer}>
                            <Text style={styles.sessionToggleLabel}>5. Session:</Text>
                            <View style={styles.sessionToggleOptions}>
                                <TouchableOpacity style={[styles.sessionOption, newExam.session === 'Forenoon' && styles.sessionOptionActive]} onPress={() => setNewExam({ ...newExam, session: 'Forenoon' })}>
                                    <Text style={[styles.sessionOptionText, newExam.session === 'Forenoon' && styles.sessionOptionTextActive]}>Forenoon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.sessionOption, newExam.session === 'Afternoon' && styles.sessionOptionActive]} onPress={() => setNewExam({ ...newExam, session: 'Afternoon' })}>
                                    <Text style={[styles.sessionOptionText, newExam.session === 'Afternoon' && styles.sessionOptionTextActive]}>Afternoon</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 6) Department */}
                        <TextInput style={styles.input} placeholder="6. Departments (e.g. CSE,IT)" value={newExam.participatingDepartments} onChangeText={t => setNewExam({ ...newExam, participatingDepartments: t })} />

                        {/* 7, 8, 9) Year, Semester, Section */}
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TextInput style={[styles.input, { flex: 1.2 }]} placeholder="7. Year (e.g. 2)" value={newExam.year} onChangeText={t => setNewExam({ ...newExam, year: t })} />
                            <TextInput style={[styles.input, { flex: 1.2 }]} placeholder="8. Sem (e.g. 4)" value={newExam.semester} onChangeText={t => setNewExam({ ...newExam, semester: t })} />
                            <TextInput style={[styles.input, { flex: 1 }]} placeholder="9. Sec (e.g. A)" value={newExam.section} onChangeText={t => setNewExam({ ...newExam, section: t })} />
                        </View>

                        {/* Student Count Display */}
                        {studentCount !== null && (
                            <View style={{ backgroundColor: '#e0f2fe', padding: 15, borderRadius: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}>
                                <Users size={20} color="#0284c7" style={{ marginRight: 10 }} />
                                <View>
                                    <Text style={{ color: '#0369a1', fontWeight: '800', fontSize: 16 }}>Expected Headcount</Text>
                                    <Text style={{ color: '#0284c7', fontSize: 14 }}>{studentCount} {studentCount === 1 ? 'student' : 'students'} match this criteria</Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateExam} disabled={loading}>
                            <Text style={styles.primaryBtnText}>Create Exam</Text>
                        </TouchableOpacity>

                        <Text style={[styles.cardTitle, { marginTop: 30 }]}>Generated Exams</Text>
                        {exams.map(e => (
                            <View key={e._id} style={styles.listItem}>
                                <Text style={styles.listItemTitle}>{e.examName} | {e.subjectCode}</Text>
                                <Text style={styles.listItemSub}>Depts: {e.participatingDepartments.join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'Generate' && (
                    <View>
                        {!generatedSeating ? (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Step 1: Select Exam</Text>
                                {exams.map(e => (
                                    <TouchableOpacity
                                        key={e._id}
                                        style={[styles.selectableItem, selectedExamId === e._id && styles.selectedItem]}
                                        onPress={() => setSelectedExamId(e._id)}
                                    >
                                        <Text style={[styles.selectableTitle, selectedExamId === e._id && { color: '#1d4ed8' }]}>{e.examName} ({e.subjectCode})</Text>
                                        <Text style={styles.listItemSub}>Depts: {e.participatingDepartments.join(', ')}</Text>
                                    </TouchableOpacity>
                                ))}

                                <Text style={[styles.cardTitle, { marginTop: 20 }]}>Step 2: Select Halls to Allocate</Text>
                                {halls.map(h => (
                                    <View key={h._id} style={styles.checkboxRow}>
                                        <Switch
                                            value={selectedHallIds.includes(h._id)}
                                            onValueChange={() => toggleHallSelection(h._id)}
                                            trackColor={{ false: "#cbd5e1", true: "#bfdbfe" }}
                                            thumbColor={selectedHallIds.includes(h._id) ? "#1d4ed8" : "#f1f5f9"}
                                        />
                                        <View style={{ marginLeft: 10 }}>
                                            <Text style={styles.selectableTitle}>{h.hallName}</Text>
                                            <Text style={styles.listItemSub}>Capacity: {h.totalSeats}</Text>
                                        </View>
                                    </View>
                                ))}

                                <TouchableOpacity style={[styles.primaryBtn, { marginTop: 30 }]} onPress={handleGenerate} disabled={loading}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Generate AI Seating Arrangement</Text>}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.resultsContainer}>
                                <View style={styles.resHeader}>
                                    <Text style={styles.resTitle}>Success: {seatingStats.exam.name}</Text>
                                    <Text style={styles.resSub}>Allocated Students: {seatingStats.totalAssigned}</Text>
                                    <TouchableOpacity style={styles.resetBtn} onPress={() => setGeneratedSeating(null)}>
                                        <Text style={styles.resetBtnText}>Start Over</Text>
                                    </TouchableOpacity>
                                </View>

                                {generatedSeating.map((hall, hIdx) => (
                                    <View key={hIdx} style={styles.hallCard}>
                                        <View style={styles.hallCardHeader}>
                                            <School size={20} color="#1d4ed8" />
                                            <Text style={styles.hallTitle}>{hall.hallName}</Text>
                                        </View>
                                        <Text style={styles.hallSub}>Filled: {hall.filledSeats} / {hall.totalCapacity} Seats</Text>

                                        <View style={styles.benchesContainer}>
                                            {hall.benches.map((bench, bIdx) => (
                                                <View key={bIdx} style={styles.benchRow}>
                                                    <View style={styles.benchNoBox}><Text style={styles.benchNoText}>B{bench.benchNo}</Text></View>
                                                    <View style={styles.seatsContainer}>
                                                        {bench.seats.map((seat, sIdx) => (
                                                            <View key={sIdx} style={styles.seatBox}>
                                                                <Text style={styles.seatDept}>{seat.student.department}</Text>
                                                                <Text style={styles.seatRegNo}>{seat.student.name || seat.student.userId}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerGradient: {
        paddingTop: 45, paddingBottom: 25, paddingHorizontal: 20,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconButton: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
    tabContainer: {
        flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginTop: -20,
        borderRadius: 16, padding: 6, elevation: 4, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 12, borderRadius: 12, gap: 8
    },
    activeTab: { backgroundColor: '#dbeafe' },
    tabText: { fontWeight: '600', color: '#64748b', fontSize: 13 },
    activeTabText: { color: '#1d4ed8', fontWeight: '800' },
    content: { padding: 20, paddingBottom: 60 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 2, marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 15 },
    input: {
        backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15, fontSize: 15,
        color: '#1e293b', marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0'
    },
    primaryBtn: {
        backgroundColor: '#1d4ed8', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10
    },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    listItem: {
        backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 10,
        borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    listItemTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
    listItemSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
    selectableItem: {
        backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 10,
        borderWidth: 2, borderColor: '#e2e8f0'
    },
    selectedItem: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
    selectableTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
    checkboxRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    resultsContainer: { paddingBottom: 40 },
    resHeader: { backgroundColor: '#1d4ed8', padding: 20, borderRadius: 20, marginBottom: 20, alignItems: 'center' },
    resTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 5 },
    resSub: { fontSize: 14, color: '#bfdbfe', marginBottom: 15 },
    resetBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    resetBtnText: { color: '#fff', fontWeight: '600' },
    hallCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3 },
    hallCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 10 },
    hallTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    hallSub: { fontSize: 13, color: '#64748b', marginBottom: 20 },
    benchesContainer: { gap: 12 },
    benchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    benchNoBox: { backgroundColor: '#e2e8f0', width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    benchNoText: { fontWeight: '700', color: '#475569' },
    seatsContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    seatBox: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', flex: 1, minWidth: '40%' },
    seatDept: { fontWeight: '800', color: '#1d4ed8', fontSize: 12, marginBottom: 2 },
    seatRegNo: { color: '#475569', fontSize: 12 },
    dropdownContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: 12 },
    dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    dropdownText: { color: '#334155', fontWeight: '600' },
    sessionToggleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    sessionToggleLabel: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    sessionToggleOptions: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, overflow: 'hidden' },
    sessionOption: { paddingVertical: 8, paddingHorizontal: 15 },
    sessionOptionActive: { backgroundColor: '#1d4ed8' },
    sessionOptionText: { color: '#64748b', fontWeight: '600' },
    sessionOptionTextActive: { color: '#fff' }
});

export default ExamSeatArrangement;
