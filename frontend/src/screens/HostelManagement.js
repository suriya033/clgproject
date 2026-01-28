import React, { useState, useContext, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    Modal,
    Platform,
    Dimensions,
    FlatList,
    ActivityIndicator
} from 'react-native';
import {
    ChevronLeft,
    Plus,
    X,
    Bed,
    MessageCircle,
    ClipboardCheck,
    LogOut,
    LogIn,
    User,
    Calendar,
    Clock,
    Search,
    CheckCircle2,
    AlertCircle,
    Check,
    Edit2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const { width } = Dimensions.get('window');

const HostelManagement = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Rooms');
    const [modalVisible, setModalVisible] = useState(false);
    const [editId, setEditId] = useState(null);

    // Mock Data
    const [rooms, setRooms] = useState([
        { id: 1, number: '101', type: 'Single', capacity: 1, occupied: 1, status: 'Full', students: [{ name: 'John Doe', id: '123' }] },
        { id: 2, number: '102', type: 'Double', capacity: 2, occupied: 1, status: 'Available', students: [{ name: 'Alice Smith', id: '124' }] },
        { id: 3, number: '103', type: 'Dormitory', capacity: 4, occupied: 3, status: 'Available', students: [] },
    ]);

    const [queries, setQueries] = useState([
        { id: 1, student: 'Alice Smith', room: '102', issue: 'Fan not working', status: 'Pending', date: '2024-03-10' },
        { id: 2, student: 'Bob Jones', room: '205', issue: 'Water leakage', status: 'Resolved', date: '2024-03-08' },
    ]);

    const [attendance, setAttendance] = useState([
        { id: 1, name: 'Alice Smith', room: '102', status: 'Present' },
        { id: 2, name: 'Bob Jones', room: '205', status: 'Absent' },
        { id: 3, name: 'Charlie Brown', room: '103', status: 'Present' },
    ]);

    const [outPasses, setOutPasses] = useState([
        { id: 1, student: 'David Lee', room: '105', reason: 'Family Function', from: '2024-03-15', to: '2024-03-17', status: 'Approved' },
        { id: 2, student: 'Eva Green', room: '106', reason: 'Medical', from: '2024-03-16', to: '2024-03-16', status: 'Pending' },
    ]);

    const [returns, setReturns] = useState([
        { id: 1, student: 'David Lee', actualReturn: '2024-03-17 18:00', status: 'On Time' },
    ]);

    // Form States
    const [roomNumber, setRoomNumber] = useState('');
    const [roomType, setRoomType] = useState('Double');
    const [roomCapacity, setRoomCapacity] = useState('');

    // Assignment States
    const [allStudents, setAllStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoadingStudents(true);
            const response = await api.get('/admin/users');
            // In a real app, you might filter by a 'hosteller' flag if it exists
            const students = response.data.filter(u => u.role === 'Student');
            setAllStudents(students);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const tabs = [
        { id: 'Rooms', label: 'Rooms', icon: <Bed size={18} /> },
        { id: 'Queries', label: 'Queries', icon: <MessageCircle size={18} /> },
        { id: 'Attendance', label: 'Attendance', icon: <ClipboardCheck size={18} /> },
        { id: 'OutPass', label: 'Out Pass', icon: <LogOut size={18} /> },
        { id: 'Returns', label: 'Returns', icon: <LogIn size={18} /> },
    ];

    const handleEdit = (room) => {
        setEditId(room.id);
        setRoomNumber(room.number);
        setRoomCapacity(room.capacity.toString());
        setRoomType(room.type);
        setSelectedStudents(room.students || []);
        setModalVisible(true);
    };

    const openAddModal = () => {
        setEditId(null);
        resetForm();
        setModalVisible(true);
    };

    const handleAddRoom = () => {
        if (!roomNumber || !roomCapacity) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        const capacity = parseInt(roomCapacity);
        if (selectedStudents.length > capacity) {
            Alert.alert('Error', `You can only assign up to ${capacity} students.`);
            return;
        }

        if (editId) {
            setRooms(rooms.map(room => room.id === editId ? {
                ...room,
                number: roomNumber,
                type: roomType,
                capacity: capacity,
                occupied: selectedStudents.length,
                status: selectedStudents.length >= capacity ? 'Full' : 'Available',
                students: selectedStudents
            } : room));
        } else {
            const newRoom = {
                id: Date.now(),
                number: roomNumber,
                type: roomType,
                capacity: capacity,
                occupied: selectedStudents.length,
                status: selectedStudents.length >= capacity ? 'Full' : 'Available',
                students: selectedStudents
            };
            setRooms([...rooms, newRoom]);
        }
        setModalVisible(false);
        setEditId(null);
        resetForm();
    };

    const resetForm = () => {
        setRoomNumber('');
        setRoomCapacity('');
        setSelectedStudents([]);
        setStudentSearchQuery('');
        setIsDropdownVisible(false);
    }

    const markAttendance = (id) => {
        const updated = attendance.map(item =>
            item.id === id ? { ...item, status: item.status === 'Present' ? 'Absent' : 'Present' } : item
        );
        setAttendance(updated);
    };

    const toggleStudentSelection = (student) => {
        const isSelected = selectedStudents.some(s => s._id === student._id);
        if (isSelected) {
            setSelectedStudents(selectedStudents.filter(s => s._id !== student._id));
        } else {
            if (roomCapacity && selectedStudents.length >= parseInt(roomCapacity)) {
                Alert.alert('Limit Reached', 'Cannot add more students than room capacity.');
                return;
            }
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    const filteredStudents = allStudents.filter(student =>
        student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        student.userId.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );

    const renderRoomCard = (item) => (
        <View key={item.id} style={styles.card}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#e0f2fe' }]}>
                <Bed size={24} color="#0284c7" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Room {item.number}</Text>
                <Text style={styles.cardSubtitle}>{item.type} Occupancy</Text>

                {/* Show assigned students if any */}
                {item.students && item.students.length > 0 && (
                    <View style={{ marginTop: 6, flexDirection: 'row', flexWrap: 'wrap' }}>
                        {item.students.map((s, idx) => (
                            <Text key={idx} style={styles.assignedStudentText}>• {s.name}</Text>
                        ))}
                    </View>
                )}

                <View style={styles.cardFooter}>
                    <Text style={styles.cardStatus}>{item.occupied}/{item.capacity} Occupied</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'Full' ? '#fee2e2' : '#dcfce7' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'Full' ? '#ef4444' : '#16a34a' }]}>{item.status}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={{ padding: 6, backgroundColor: '#f0f9ff', borderRadius: 6, marginLeft: 8 }}>
                        <Edit2 size={16} color="#0284c7" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderQueryCard = (item) => (
        <View key={item.id} style={styles.card}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#fef3c7' }]}>
                <AlertCircle size={24} color="#d97706" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.issue}</Text>
                <Text style={styles.cardSubtitle}>By: {item.student} (Room {item.room})</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'Pending' ? '#fff7ed' : '#dcfce7' }]}>
                <Text style={[styles.statusText, { color: item.status === 'Pending' ? '#f97316' : '#16a34a' }]}>{item.status}</Text>
            </View>
        </View>
    );

    const renderAttendanceCard = (item) => (
        <View key={item.id} style={styles.card}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#f3e8ff' }]}>
                <User size={24} color="#9333ea" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>Room {item.room}</Text>
            </View>
            <TouchableOpacity onPress={() => markAttendance(item.id)}>
                <View style={[styles.attendanceBadge, { backgroundColor: item.status === 'Present' ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Present' ? '#16a34a' : '#ef4444' }]}>{item.status}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderOutPassCard = (item) => (
        <View key={item.id} style={styles.card}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#ffe4e6' }]}>
                <LogOut size={24} color="#e11d48" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.student}</Text>
                <Text style={styles.cardSubtitle}>{item.reason}</Text>
                <View style={styles.datesRow}>
                    <Calendar size={12} color="#64748b" />
                    <Text style={styles.dateText}>{item.from} - {item.to}</Text>
                </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'Approved' ? '#dcfce7' : '#ffedd5' }]}>
                <Text style={[styles.statusText, { color: item.status === 'Approved' ? '#16a34a' : '#f97316' }]}>{item.status}</Text>
            </View>
        </View>
    );

    const renderReturnCard = (item) => (
        <View key={item.id} style={styles.card}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#ecfccb' }]}>
                <LogIn size={24} color="#65a30d" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.student}</Text>
                <View style={styles.datesRow}>
                    <Clock size={12} color="#64748b" />
                    <Text style={styles.dateText}>Returned: {item.actualReturn}</Text>
                </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.statusText, { color: '#16a34a' }]}>{item.status}</Text>
            </View>
        </View>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Rooms': return rooms.map(renderRoomCard);
            case 'Queries': return queries.map(renderQueryCard);
            case 'Attendance': return attendance.map(renderAttendanceCard);
            case 'OutPass': return outPasses.map(renderOutPassCard);
            case 'Returns': return returns.map(renderReturnCard);
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#5a0000', '#800000']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hostel Management</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Scrollable Tabs */}
                <View style={styles.tabsWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContainer}
                    >
                        {tabs.map(tab => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {React.cloneElement(tab.icon, { color: activeTab === tab.id ? '#800000' : 'rgba(255,255,255,0.8)' })}
                                    <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{tabs.find(t => t.id === activeTab)?.label} List</Text>
                    {activeTab === 'Rooms' && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={openAddModal}
                        >
                            <Plus size={20} color="#fff" />
                            <Text style={styles.addButtonText}>Add Room</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {renderContent()}

            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editId ? 'Edit Room' : 'Add New Room'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Room Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 101"
                                    value={roomNumber}
                                    onChangeText={setRoomNumber}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Capacity</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Number of beds"
                                    keyboardType="numeric"
                                    value={roomCapacity}
                                    onChangeText={setRoomCapacity}
                                />
                            </View>

                            {/* Section to Assign Students */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Assign Students ({selectedStudents.length}{roomCapacity ? `/${roomCapacity}` : ''})</Text>

                                {/* Chips for selected students */}
                                <View style={styles.chipsContainer}>
                                    {selectedStudents.map(student => (
                                        <View key={student._id} style={styles.chip}>
                                            <Text style={styles.chipText}>{student.name}</Text>
                                            <TouchableOpacity onPress={() => toggleStudentSelection(student)}>
                                                <X size={14} color="#800000" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>

                                {/* Search Box */}
                                <View style={styles.searchBox}>
                                    <Search size={18} color="#94a3b8" />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search student by Name or ID..."
                                        value={studentSearchQuery}
                                        onChangeText={(text) => {
                                            setStudentSearchQuery(text);
                                            setIsDropdownVisible(true);
                                        }}
                                        onFocus={() => setIsDropdownVisible(true)}
                                    />
                                </View>

                                {/* Dropdown List */}
                                {isDropdownVisible && (
                                    <View style={styles.dropdownList}>
                                        {loadingStudents ? (
                                            <ActivityIndicator color="#800000" style={{ padding: 20 }} />
                                        ) : filteredStudents.length === 0 ? (
                                            <Text style={styles.noResultText}>No students found</Text>
                                        ) : (
                                            filteredStudents.slice(0, 10).map(student => {
                                                const isSelected = selectedStudents.some(s => s._id === student._id);
                                                return (
                                                    <TouchableOpacity
                                                        key={student._id}
                                                        style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                                        onPress={() => toggleStudentSelection(student)}
                                                    >
                                                        <View>
                                                            <Text style={[styles.dropdownName, isSelected && styles.selectedText]}>{student.name}</Text>
                                                            <Text style={[styles.dropdownId, isSelected && styles.selectedTextSub]}>{student.userId}</Text>
                                                        </View>
                                                        {isSelected && <Check size={18} color="#800000" />}
                                                    </TouchableOpacity>
                                                );
                                            })
                                        )}
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleAddRoom}>
                                <Text style={styles.submitButtonText}>{editId ? 'Update Room' : 'Create Room & Assign'}</Text>
                            </TouchableOpacity>
                            <View style={{ height: 20 }} />
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
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 20,
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
    tabsWrapper: {
        marginBottom: 5,
    },
    tabsContainer: {
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 10,
    },
    activeTab: {
        backgroundColor: '#fff',
    },
    tabText: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '700',
        marginLeft: 6,
        fontSize: 13,
    },
    activeTabText: {
        color: '#800000',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    addButton: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 6,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardIconWrapper: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
    cardSubtitle: { fontSize: 13, color: '#64748b' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
    cardStatus: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700' },
    cardDate: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
    datesRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    dateText: { fontSize: 12, color: '#64748b', marginLeft: 4 },
    attendanceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    assignedStudentText: { fontSize: 11, color: '#800000', marginRight: 8, marginTop: 4, fontWeight: '500' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '90%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    submitButton: {
        backgroundColor: '#5a0000',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Search & Dropdown Styles
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, height: 50 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1e293b' },
    dropdownList: { marginTop: 6, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', maxHeight: 200, padding: 0 },
    dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    dropdownItemSelected: { backgroundColor: '#ffe4e6' },
    dropdownName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    dropdownId: { fontSize: 12, color: '#64748b' },
    selectedText: { color: '#800000' },
    selectedTextSub: { color: '#5a0000' },
    noResultText: { padding: 16, textAlign: 'center', color: '#94a3b8' },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffe4e6', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#cffafe' },
    chipText: { fontSize: 12, color: '#800000', fontWeight: '600', marginRight: 6 },
});

export default HostelManagement;
