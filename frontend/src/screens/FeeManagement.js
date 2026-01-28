import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
    RefreshControl,
    FlatList
} from 'react-native';
import {
    Banknote,
    Plus,
    X,
    ChevronLeft,
    Send,
    Search,
    Calendar,
    User,
    CheckCircle2,
    Clock,

    AlertCircle,
    Edit2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

const FeeManagement = ({ navigation }) => {
    const [fees, setFees] = useState([]);
    const [filteredFees, setFilteredFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [editId, setEditId] = useState(null);

    // Form State
    const [studentId, setStudentId] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Tuition');
    const [dueDate, setDueDate] = useState('');
    const [remarks, setRemarks] = useState('');

    const feeTypes = ['Tuition', 'Hostel', 'Transport', 'Exam', 'Library', 'Other'];

    useEffect(() => {
        fetchFees();
        fetchStudents();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredFees(fees);
        } else {
            const filtered = fees.filter(fee =>
                fee.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                fee.student?.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                fee.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredFees(filtered);
        }
    }, [searchQuery, fees]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const response = await api.get('/college/fees');
            setFees(response.data);
            setFilteredFees(response.data);
        } catch (error) {
            console.error('Fetch fees error:', error);
            Alert.alert('Error', 'Failed to fetch fees');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get('/admin/users');
            setStudents(response.data.filter(u => u.role === 'Student'));
        } catch (error) {
            console.error('Fetch students error:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchFees();
    };

    const handleEdit = (fee) => {
        setEditId(fee._id);
        setStudentId(fee.student?._id || fee.student);
        setAmount(fee.amount.toString());
        setType(fee.type);
        setDueDate(fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '');
        setRemarks(fee.remarks || '');
        setModalVisible(true);
    };

    const openCreateModal = () => {
        setEditId(null);
        resetForm();
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!studentId || !amount || !type) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        try {
            setSubmitting(true);
            const data = {
                student: studentId,
                amount: parseFloat(amount),
                type,
                dueDate: dueDate || new Date(),
                remarks
            };

            if (editId) {
                await api.put(`/college/fees/${editId}`, data);
                Alert.alert('Success', 'Fee record updated');
            } else {
                await api.post('/college/fees', data);
                Alert.alert('Success', 'Fee record created');
            }

            setModalVisible(false);
            setEditId(null);
            resetForm();
            fetchFees();
        } catch (error) {
            console.error('Create/Update fee error:', error);
            Alert.alert('Error', `Failed to ${editId ? 'update' : 'create'} fee record`);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setStudentId('');
        setAmount('');
        setType('Tuition');
        setDueDate('');
        setRemarks('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return '#10b981';
            case 'Pending': return '#f59e0b';
            case 'Partial': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const renderFeeCard = ({ item }) => (
        <View style={styles.feeCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.amountText, { marginRight: 10 }]}>₹{item.amount.toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={{ padding: 5, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
                        <Edit2 size={16} color="#0284c7" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.studentInfo}>
                <User size={16} color="#64748b" />
                <Text style={styles.studentName}>{item.student?.name || 'Unknown Student'}</Text>
                <Text style={styles.studentId}>({item.student?.userId || 'N/A'})</Text>
            </View>

            <View style={styles.feeDetails}>
                <View style={styles.detailItem}>
                    <Banknote size={14} color="#94a3b8" />
                    <Text style={styles.detailText}>{item.type}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Calendar size={14} color="#94a3b8" />
                    <Text style={styles.detailText}>
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            {item.remarks && (
                <Text style={styles.remarksText} numberOfLines={1}>{item.remarks}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Fee Management</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={openCreateModal}
                    >
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by student or type..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={filteredFees}
                    renderItem={renderFeeCard}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <AlertCircle size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No Fee Records</Text>
                            <Text style={styles.emptySubtitle}>Start by adding a new fee entry</Text>
                        </View>
                    }
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{editId ? 'Edit Fee Record' : 'Add Fee Record'}</Text>
                                <Text style={styles.modalSubtitle}>{editId ? 'Update payment details' : 'Create a new payment request'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Select Student</Text>
                                <View style={styles.selector}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {students.map(student => (
                                            <TouchableOpacity
                                                key={student._id}
                                                style={[
                                                    styles.option,
                                                    studentId === student._id && styles.optionActive
                                                ]}
                                                onPress={() => setStudentId(student._id)}
                                            >
                                                <Text style={[
                                                    styles.optionText,
                                                    studentId === student._id && styles.optionTextActive
                                                ]}>{student.name} ({student.userId})</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Amount (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 50000"
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Fee Type</Text>
                                <View style={styles.selector}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {feeTypes.map(t => (
                                            <TouchableOpacity
                                                key={t}
                                                style={[
                                                    styles.option,
                                                    type === t && styles.optionActive
                                                ]}
                                                onPress={() => setType(t)}
                                            >
                                                <Text style={[
                                                    styles.optionText,
                                                    type === t && styles.optionTextActive
                                                ]}>{t}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 2024-06-30"
                                    value={dueDate}
                                    onChangeText={setDueDate}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Remarks (Optional)</Text>
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Any additional notes..."
                                    value={remarks}
                                    onChangeText={setRemarks}
                                    multiline
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitButtonText}>{editId ? 'Update Fee Entry' : 'Create Fee Entry'}</Text>
                                        <Send size={18} color="#fff" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 40 },
    feeCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
    },
    amountText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginLeft: 8,
    },
    studentId: {
        fontSize: 14,
        color: '#94a3b8',
        marginLeft: 4,
    },
    feeDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        marginLeft: 6,
    },
    remarksText: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 12,
        fontStyle: 'italic',
    },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
    emptySubtitle: { fontSize: 15, color: '#64748b', marginTop: 8 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 25,
        maxHeight: '90%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25
    },
    modalTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    modalSubtitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    closeButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    },
    modalForm: { marginBottom: 10 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 10 },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 15,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    selector: { marginTop: 5 },
    option: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    optionActive: {
        backgroundColor: '#ffe4e6',
        borderColor: '#800000'
    },
    optionText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    optionTextActive: { color: '#800000' },
    submitButton: {
        backgroundColor: '#800000',
        borderRadius: 18,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 8,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    disabledButton: { opacity: 0.7 },
    submitButtonText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});

export default FeeManagement;
