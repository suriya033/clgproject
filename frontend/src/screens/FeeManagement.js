import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView,
    TextInput, Alert, ActivityIndicator, Modal, Platform, RefreshControl, FlatList
} from 'react-native';
import {
    Banknote, Plus, X, ChevronLeft, Search, Calendar, User,
    CheckCircle2, Clock, AlertCircle, Edit2, ChevronDown, Check, IndianRupee
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

// ─── Fee types with colours ────────────────────────────────────────────────
const FEE_TYPES = [
    { key: 'Tuition', label: 'Tuition', color: '#6366f1' },
    { key: 'Hostel', label: 'Hostel', color: '#0ea5e9' },
    { key: 'Transport', label: 'Transport', color: '#f59e0b' },
    { key: 'Exam', label: 'Exam', color: '#8b5cf6' },
    { key: 'Library', label: 'Library', color: '#10b981' },
    { key: 'Other', label: 'Other', color: '#64748b' },
];

const getStatusColor = (s) =>
    s === 'Paid' ? '#10b981' : s === 'Overdue' ? '#ef4444' : '#f59e0b';


// ─── Student Search Modal ──────────────────────────────────────────────────
const StudentSearchModal = ({ visible, students, onSelect, onClose }) => {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() =>
        students.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            (s.userId || '').toLowerCase().includes(query.toLowerCase()) ||
            (s.department || '').toLowerCase().includes(query.toLowerCase())
        ), [students, query]);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={ss.backdrop}>
                <View style={ss.sheet}>
                    <View style={ss.sheetHandle} />
                    <Text style={ss.sheetTitle}>Select Student</Text>

                    <View style={ss.searchBox}>
                        <Search size={18} color="#94a3b8" />
                        <TextInput
                            style={ss.searchInput}
                            placeholder="Search by name, ID or department..."
                            placeholderTextColor="#94a3b8"
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <X size={16} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        data={filtered}
                        keyExtractor={i => i._id}
                        style={{ maxHeight: 380 }}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity style={ss.studentRow} onPress={() => { onSelect(item); setQuery(''); onClose(); }}>
                                <View style={ss.studentAvatar}>
                                    <Text style={ss.avatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={ss.studentRowName}>{item.name}</Text>
                                    <Text style={ss.studentRowSub}>{item.userId} · {item.department || 'N/A'}</Text>
                                </View>
                                <ChevronDown size={16} color="#cbd5e1" style={{ transform: [{ rotate: '-90deg' }] }} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={ss.noResults}>No students found</Text>}
                    />

                    <TouchableOpacity style={ss.cancelBtn} onPress={onClose}>
                        <Text style={ss.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


// ─── Main Screen ───────────────────────────────────────────────────────────
const FeeManagement = ({ navigation }) => {
    const [fees, setFees] = useState([]);
    const [filteredFees, setFilteredFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [studentPickerVisible, setStudentPickerVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [editId, setEditId] = useState(null);

    // Form State
    const [selectedStudent, setSelectedStudent] = useState(null);
    // feeLines: [{ key: 'Tuition', amount: '' }, ...]
    const [feeLines, setFeeLines] = useState([]);
    const [dueDate, setDueDate] = useState('');
    const [remarks, setRemarks] = useState('');

    const totalAmount = useMemo(() =>
        feeLines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0),
        [feeLines]);

    useEffect(() => { fetchFees(); fetchStudents(); }, []);
    useEffect(() => {
        const q = searchQuery.toLowerCase();
        setFilteredFees(
            q ? fees.filter(f =>
                f.student?.name?.toLowerCase().includes(q) ||
                f.student?.userId?.toLowerCase().includes(q) ||
                f.type?.toLowerCase().includes(q)
            ) : fees
        );
    }, [searchQuery, fees]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const r = await api.get('/college/fees');
            setFees(r.data); setFilteredFees(r.data);
        } catch { Alert.alert('Error', 'Failed to fetch fees'); }
        finally { setLoading(false); setRefreshing(false); }
    };

    const fetchStudents = async () => {
        try {
            const r = await api.get('/admin/users');
            setStudents(r.data.filter(u => u.role === 'Student'));
        } catch { console.error('Fetch students error'); }
    };

    const toggleFeeType = (key) => {
        setFeeLines(prev => {
            const exists = prev.find(l => l.key === key);
            if (exists) return prev.filter(l => l.key !== key);
            return [...prev, { key, amount: '' }];
        });
    };

    const updateLineAmount = (key, val) => {
        setFeeLines(prev => prev.map(l => l.key === key ? { ...l, amount: val } : l));
    };

    const handleEdit = (fee) => {
        setEditId(fee._id);
        const s = students.find(u => u._id === (fee.student?._id || fee.student));
        setSelectedStudent(s || { name: fee.student?.name, userId: fee.student?.userId, _id: fee.student?._id || fee.student });
        setFeeLines([{ key: fee.type, amount: fee.amount.toString() }]);
        setDueDate(fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '');
        setRemarks(fee.remarks || '');
        setModalVisible(true);
    };

    const openCreateModal = () => {
        setEditId(null); setSelectedStudent(null);
        setFeeLines([]); setDueDate(''); setRemarks('');
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!selectedStudent) { Alert.alert('Validation', 'Please select a student'); return; }
        if (feeLines.length === 0) { Alert.alert('Validation', 'Select at least one fee type'); return; }
        const invalid = feeLines.find(l => !l.amount || parseFloat(l.amount) <= 0);
        if (invalid) { Alert.alert('Validation', `Enter valid amount for ${invalid.key} fee`); return; }
        if (!dueDate) { Alert.alert('Validation', 'Please set a due date'); return; }

        try {
            setSubmitting(true);
            if (editId) {
                await api.put(`/college/fees/${editId}`, {
                    student: selectedStudent._id, amount: parseFloat(feeLines[0].amount),
                    type: feeLines[0].key, dueDate, remarks
                });
            } else {
                // Create one record per fee type
                await Promise.all(feeLines.map(l =>
                    api.post('/college/fees', {
                        student: selectedStudent._id,
                        amount: parseFloat(l.amount),
                        type: l.key,
                        dueDate, remarks
                    })
                ));
            }
            Alert.alert('Success', editId ? 'Fee updated successfully' : `${feeLines.length} fee record(s) created`);
            setModalVisible(false);
            fetchFees();
        } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to save fee record');
        } finally { setSubmitting(false); }
    };

    const renderFeeCard = ({ item }) => {
        const color = getStatusColor(item.status);
        const typeConf = FEE_TYPES.find(t => t.key === item.type) || FEE_TYPES[5];
        return (
            <View style={styles.feeCard}>
                <View style={styles.cardTop}>
                    <View style={[styles.typePill, { backgroundColor: typeConf.color + '18', borderColor: typeConf.color + '40' }]}>
                        <View style={[styles.typeDot, { backgroundColor: typeConf.color }]} />
                        <Text style={[styles.typePillText, { color: typeConf.color }]}>{item.type}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={styles.cardAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                            <Edit2 size={14} color="#0284c7" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardMid}>
                    <User size={14} color="#94a3b8" />
                    <Text style={styles.cardStudentName}>{item.student?.name || 'Unknown'}</Text>
                    <Text style={styles.cardStudentId}>({item.student?.userId || 'N/A'})</Text>
                </View>

                <View style={styles.cardBottom}>
                    <View style={styles.cardDateRow}>
                        <Calendar size={13} color="#94a3b8" />
                        <Text style={styles.cardDate}>Due: {new Date(item.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: color + '18' }]}>
                        <View style={[styles.statusDot, { backgroundColor: color }]} />
                        <Text style={[styles.statusChipText, { color }]}>{item.status}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fee Management</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={openCreateModal}>
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Search Bar */}
            <View style={styles.searchRow}>
                <Search size={18} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search student or fee type..."
                    placeholderTextColor="#94a3b8"
                    value={searchQuery} onChangeText={setSearchQuery}
                />
                {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><X size={16} color="#94a3b8" /></TouchableOpacity> : null}
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={filteredFees}
                    renderItem={renderFeeCard}
                    keyExtractor={i => i._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFees(); }} tintColor="#800000" />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Banknote size={64} color="#e2e8f0" />
                            <Text style={styles.emptyTitle}>No Fee Records</Text>
                            <Text style={styles.emptySub}>Tap + to assign a new fee</Text>
                        </View>
                    }
                />
            )}

            {/* Student Picker Modal */}
            <StudentSearchModal
                visible={studentPickerVisible}
                students={students}
                onSelect={setSelectedStudent}
                onClose={() => setStudentPickerVisible(false)}
            />

            {/* Add / Edit Modal */}
            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.sheetHandle} />

                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{editId ? 'Edit Fee' : 'Assign Fee'}</Text>
                                <Text style={styles.modalSub}>{editId ? 'Update payment record' : 'Create new fee entries'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {/* Student Dropdown */}
                            <Text style={styles.label}>Student <Text style={{ color: '#ef4444' }}>*</Text></Text>
                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setStudentPickerVisible(true)}>
                                {selectedStudent ? (
                                    <View style={styles.selectedStudent}>
                                        <View style={[styles.studentAvatar, { width: 36, height: 36 }]}>
                                            <Text style={[styles.avatarText, { fontSize: 14 }]}>{selectedStudent.name?.charAt(0)?.toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.selectedStudentName}>{selectedStudent.name}</Text>
                                            <Text style={styles.selectedStudentId}>{selectedStudent.userId}</Text>
                                        </View>
                                        <X size={16} color="#94a3b8" onPress={(e) => { e.stopPropagation?.(); setSelectedStudent(null); }} />
                                    </View>
                                ) : (
                                    <View style={styles.dropdownPlaceholder}>
                                        <User size={18} color="#94a3b8" />
                                        <Text style={styles.dropdownPlaceholderText}>Search and select a student</Text>
                                        <ChevronDown size={16} color="#94a3b8" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Fee Types Multi-Select */}
                            <Text style={[styles.label, { marginTop: 20 }]}>
                                Fee Types <Text style={{ color: '#ef4444' }}>*</Text>
                                <Text style={styles.labelHint}> (select one or more)</Text>
                            </Text>
                            <View style={styles.typesGrid}>
                                {FEE_TYPES.map(ft => {
                                    const selected = feeLines.some(l => l.key === ft.key);
                                    return (
                                        <TouchableOpacity
                                            key={ft.key}
                                            style={[styles.typeChip, selected && { backgroundColor: ft.color, borderColor: ft.color }]}
                                            onPress={() => toggleFeeType(ft.key)}
                                        >
                                            {selected && <Check size={13} color="#fff" style={{ marginRight: 4 }} />}
                                            <Text style={[styles.typeChipText, selected && { color: '#fff' }]}>{ft.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Per-type Amount Inputs */}
                            {feeLines.length > 0 && (
                                <View style={styles.amountsBox}>
                                    <Text style={[styles.label, { marginBottom: 12 }]}>Enter Amount per Type</Text>
                                    {feeLines.map(l => {
                                        const conf = FEE_TYPES.find(t => t.key === l.key);
                                        return (
                                            <View key={l.key} style={styles.amountRow}>
                                                <View style={[styles.amountLabel, { backgroundColor: conf.color + '18' }]}>
                                                    <View style={[styles.typeDot, { backgroundColor: conf.color }]} />
                                                    <Text style={[styles.amountLabelText, { color: conf.color }]}>{l.key}</Text>
                                                </View>
                                                <View style={styles.amountInputWrap}>
                                                    <Text style={styles.rupeeSymbol}>₹</Text>
                                                    <TextInput
                                                        style={styles.amountInput}
                                                        placeholder="0"
                                                        placeholderTextColor="#cbd5e1"
                                                        value={l.amount}
                                                        onChangeText={v => updateLineAmount(l.key, v)}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        );
                                    })}

                                    {/* Total */}
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Grand Total</Text>
                                        <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Due Date */}
                            <Text style={[styles.label, { marginTop: 20 }]}>Due Date <Text style={{ color: '#ef4444' }}>*</Text></Text>
                            <View style={styles.dateInput}>
                                <Calendar size={18} color="#94a3b8" />
                                <TextInput
                                    style={styles.dateTextInput}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94a3b8"
                                    value={dueDate}
                                    onChangeText={setDueDate}
                                />
                            </View>

                            {/* Remarks */}
                            <Text style={[styles.label, { marginTop: 16 }]}>Remarks <Text style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</Text></Text>
                            <TextInput
                                style={styles.remarksInput}
                                placeholder="Any additional info..."
                                placeholderTextColor="#94a3b8"
                                value={remarks}
                                onChangeText={setRemarks}
                                multiline
                                numberOfLines={3}
                            />

                            {/* Submit */}
                            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting}>
                                {submitting
                                    ? <ActivityIndicator color="#fff" />
                                    : <>
                                        <IndianRupee size={18} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.submitText}>
                                            {editId ? 'Update Fee' : `Assign ${feeLines.length > 1 ? `${feeLines.length} Fees` : 'Fee'} · ₹${totalAmount.toLocaleString('en-IN')}`}
                                        </Text>
                                    </>
                                }
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// ─── Student Search Modal Styles ─────────────────────────────────────────
const ss = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '80%' },
    sheetHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 16 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 10, marginBottom: 12 },
    searchInput: { flex: 1, fontSize: 15, color: '#1e293b' },
    studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12 },
    studentAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#800000', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    studentRowName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    studentRowSub: { fontSize: 12, color: '#94a3b8', fontWeight: '500', marginTop: 2 },
    noResults: { textAlign: 'center', color: '#94a3b8', paddingVertical: 30, fontWeight: '600' },
    cancelBtn: { marginTop: 16, backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    cancelText: { fontSize: 16, fontWeight: '700', color: '#64748b' },
});

// ─── Main Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 42, paddingBottom: 22,
        borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
        elevation: 10, shadowColor: '#800000', shadowOpacity: 0.3, shadowRadius: 14,
    },
    iconBtn: { backgroundColor: 'rgba(255,255,255,0.18)', padding: 10, borderRadius: 12 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },

    searchRow: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, marginBottom: 6,
        backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
        gap: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    },
    searchInput: { flex: 1, fontSize: 15, color: '#1e293b' },

    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16, paddingBottom: 50 },
    empty: { alignItems: 'center', marginTop: 80 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 6 },

    // Card
    feeCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    typePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    typeDot: { width: 7, height: 7, borderRadius: 4 },
    typePillText: { fontSize: 12, fontWeight: '700' },
    cardAmount: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
    editBtn: { backgroundColor: '#e0f2fe', padding: 7, borderRadius: 9 },
    cardMid: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
    cardStudentName: { fontSize: 14, fontWeight: '700', color: '#334155', flex: 1 },
    cardStudentId: { fontSize: 12, color: '#94a3b8' },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
    cardDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    cardDate: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusChipText: { fontSize: 12, fontWeight: '700' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
        padding: 24, maxHeight: '92%',
    },
    sheetHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 4, alignSelf: 'center', marginBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    modalSub: { fontSize: 13, color: '#94a3b8', marginTop: 3 },
    closeBtn: { backgroundColor: '#f1f5f9', padding: 9, borderRadius: 12 },

    label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 10 },
    labelHint: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

    // Dropdown
    dropdownBtn: {
        backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    selectedStudent: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
    studentAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#800000', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    selectedStudentName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    selectedStudentId: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    dropdownPlaceholder: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
    dropdownPlaceholderText: { flex: 1, fontSize: 15, color: '#94a3b8' },

    // Fee Types
    typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    typeChip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 30,
        borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
    },
    typeChipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },

    // Amounts
    amountsBox: {
        marginTop: 16, backgroundColor: '#f8fafc', borderRadius: 18,
        padding: 16, borderWidth: 1, borderColor: '#e2e8f0',
    },
    amountRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    amountLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, minWidth: 100 },
    amountLabelText: { fontSize: 13, fontWeight: '700' },
    amountInputWrap: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0',
        paddingHorizontal: 12, paddingVertical: 10,
    },
    rupeeSymbol: { fontSize: 16, fontWeight: '700', color: '#64748b', marginRight: 4 },
    amountInput: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1e293b' },
    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 8, paddingTop: 14,
    },
    totalLabel: { fontSize: 15, fontWeight: '700', color: '#64748b' },
    totalAmount: { fontSize: 22, fontWeight: '900', color: '#800000' },

    // Date
    dateInput: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0',
        paddingHorizontal: 14, paddingVertical: 12,
    },
    dateTextInput: { flex: 1, fontSize: 15, color: '#1e293b' },

    // Remarks
    remarksInput: {
        backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0',
        padding: 14, fontSize: 15, color: '#1e293b', textAlignVertical: 'top', height: 90,
    },

    // Submit
    submitBtn: {
        backgroundColor: '#800000', borderRadius: 18, paddingVertical: 18, marginTop: 24,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        elevation: 8, shadowColor: '#800000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 14,
    },
    submitText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

export default FeeManagement;
