import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Plus,
    X,
    Users,
    BookOpen,
    CheckCircle2,
    Briefcase,
    Search,
    Edit2,
    UserCog,
    ChevronDown
} from 'lucide-react-native';
import api from '../api/api';

const ClassManagement = ({ navigation, route }) => {
    const departmentFilter = route?.params?.departmentFilter;
    const [classes, setClasses] = useState([
        { id: '1', name: 'Computer Science', section: 'A', year: '1st Year', students: [], advisor: null },
        { id: '2', name: 'Computer Science', section: 'B', year: '1st Year', students: [], advisor: null },
    ]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [advisor, setAdvisor] = useState(null);
    const [showAdvisorDropdown, setShowAdvisorDropdown] = useState(false);
    const [editId, setEditId] = useState(null);

    // Student Assignment State
    const [studentModalVisible, setStudentModalVisible] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [allStudents, setAllStudents] = useState([]);
    const [allStaff, setAllStaff] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/admin/users');
            let students = response.data.filter(u => u.role === 'Student');
            let teachers = response.data.filter(u => u.role === 'Staff' || u.role === 'HOD');

            if (departmentFilter) {
                const deptLower = departmentFilter.toLowerCase();
                students = students.filter(s => s.department?.toLowerCase() === deptLower);
                teachers = teachers.filter(t => t.department?.toLowerCase() === deptLower);

                // Also filter initial hardcoded classes as an example, 
                // though in a real app these would come from an API
                setClasses(prev => prev.filter(c => c.name.toLowerCase().includes(deptLower)));
            }

            setAllStudents(students);
            setAllStaff(teachers);
        } catch (error) {
            console.error('Fetch data error:', error);
        }
    };

    const handleCreateClass = () => {
        if (!className || !section || !academicYear) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (editId) {
            setClasses(classes.map(c => c.id === editId ? {
                ...c,
                name: className,
                section,
                year: academicYear,
                advisor: advisor
            } : c));
            Alert.alert('Success', 'Class updated successfully');
        } else {
            const newClass = {
                id: Date.now().toString(),
                name: className,
                section,
                year: academicYear,
                advisor: advisor,
                students: []
            };
            setClasses([...classes, newClass]);
            Alert.alert('Success', 'Class created successfully');
        }

        setModalVisible(false);
        resetForm();
    };

    const handleEdit = (cls) => {
        setEditId(cls.id);
        setClassName(cls.name);
        setSection(cls.section);
        setAcademicYear(cls.year);
        setAdvisor(cls.advisor);
        setModalVisible(true);
    };

    const openCreateModal = () => {
        setEditId(null);
        resetForm();
        setModalVisible(true);
    };

    const resetForm = () => {
        setClassName('');
        setSection('');
        setAcademicYear('');
        setAdvisor(null);
        setShowAdvisorDropdown(false);
        setEditId(null);
    };

    const openAssignModal = (cls) => {
        setSelectedClass(cls);
        setSelectedStudents(cls.students.map(s => s._id)); // Assuming student objects have _id
        setStudentModalVisible(true);
    };

    const toggleStudentSelection = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    const handleAssignStudents = () => {
        if (!selectedClass) return;

        const updatedStudents = allStudents.filter(s => selectedStudents.includes(s._id));

        setClasses(classes.map(c => c.id === selectedClass.id ? {
            ...c,
            students: updatedStudents
        } : c));

        setStudentModalVisible(false);
        Alert.alert('Success', `Assigned ${updatedStudents.length} students to ${selectedClass.name} - ${selectedClass.section}`);
    };

    const filteredStudents = allStudents.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderClassCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <BookOpen size={24} color="#800000" />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.classTitle}>{item.name}</Text>
                    <Text style={styles.classSub}>{item.year} • Section {item.section}</Text>
                </View>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                    <Edit2 size={16} color="#0284c7" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Users size={16} color="#64748b" />
                    <Text style={styles.statText}>{item.students.length} Students</Text>
                </View>
            </View>

            <View style={styles.advisorSection}>
                <Text style={styles.advisorLabel}>Class Advisor</Text>
                <View style={styles.advisorInfo}>
                    <UserCog size={16} color="#800000" />
                    <Text style={styles.advisorName}>{item.advisor ? item.advisor.name : 'Not Assigned'}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.assignButton}
                onPress={() => openAssignModal(item)}
            >
                <Text style={styles.assignButtonText}>Manage Students</Text>
            </TouchableOpacity>
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
                    <Text style={styles.headerTitle}>Class Management</Text>
                    <TouchableOpacity onPress={openCreateModal} style={styles.iconButton}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <FlatList
                data={classes}
                renderItem={renderClassCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <BookOpen size={50} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No classes found</Text>
                    </View>
                }
            />

            {/* Create/Edit Class Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editId ? 'Edit Class' : 'Create New Class'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Class Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Computer Science"
                                    value={className}
                                    onChangeText={setClassName}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Section</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. A"
                                    value={section}
                                    onChangeText={setSection}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Academic Year</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 2024-2025"
                                    value={academicYear}
                                    onChangeText={setAcademicYear}
                                />
                            </View>

                            <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                                <Text style={styles.label}>Assign Class Advisor</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowAdvisorDropdown(!showAdvisorDropdown)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <UserCog size={20} color="#64748b" style={{ marginRight: 10 }} />
                                        <Text style={[styles.dropdownText, !advisor && { color: '#94a3b8' }]}>
                                            {advisor ? advisor.name : 'Select a Teacher'}
                                        </Text>
                                    </View>
                                    <ChevronDown size={20} color="#64748b" />
                                </TouchableOpacity>

                                {showAdvisorDropdown && (
                                    <View style={styles.dropdownList}>
                                        <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
                                            {allStaff.length === 0 ? (
                                                <Text style={styles.emptyDropdownText}>No teachers found</Text>
                                            ) : (
                                                allStaff.map(staff => (
                                                    <TouchableOpacity
                                                        key={staff._id}
                                                        style={[
                                                            styles.dropdownItem,
                                                            advisor?._id === staff._id && styles.dropdownItemActive
                                                        ]}
                                                        onPress={() => {
                                                            setAdvisor(staff);
                                                            setShowAdvisorDropdown(false);
                                                        }}
                                                    >
                                                        <Text style={[
                                                            styles.dropdownItemText,
                                                            advisor?._id === staff._id && styles.dropdownItemTextActive
                                                        ]}>{staff.name}</Text>
                                                        {advisor?._id === staff._id && <CheckCircle2 size={16} color="#800000" />}
                                                    </TouchableOpacity>
                                                ))
                                            )}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleCreateClass}>
                                <Text style={styles.submitButtonText}>{editId ? 'Update Class' : 'Create Class'}</Text>
                            </TouchableOpacity>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Assign Students Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={studentModalVisible}
                onRequestClose={() => setStudentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Assign Students</Text>
                                <Text style={styles.modalSubtitle}>{selectedClass?.name} - {selectedClass?.section}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setStudentModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchBox}>
                            <Search size={20} color="#94a3b8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search students..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <FlatList
                            data={filteredStudents}
                            keyExtractor={item => item._id}
                            renderItem={({ item }) => {
                                const isSelected = selectedStudents.includes(item._id);
                                return (
                                    <TouchableOpacity
                                        style={[styles.studentItem, isSelected && styles.studentItemActive]}
                                        onPress={() => toggleStudentSelection(item._id)}
                                    >
                                        <View>
                                            <Text style={[styles.studentName, isSelected && styles.studentTextActive]}>{item.name}</Text>
                                            <Text style={[styles.studentId, isSelected && styles.studentTextActive]}>{item.userId}</Text>
                                        </View>
                                        {isSelected && <CheckCircle2 size={20} color="#800000" />}
                                    </TouchableOpacity>
                                );
                            }}
                            style={{ marginVertical: 10 }}
                        />

                        <TouchableOpacity style={styles.submitButton} onPress={handleAssignStudents}>
                            <Text style={styles.submitButtonText}>Save Assignments ({selectedStudents.length})</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerGradient: {
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: { flex: 1 },
    classTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    classSub: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    editButton: {
        padding: 8,
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
    advisorSection: {
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    advisorLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase'
    },
    advisorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    advisorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569'
    },
    assignButton: {
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    assignButtonText: {
        color: '#1e293b',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
        color: '#94a3b8',
        fontSize: 16,
    },
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
        maxHeight: '90%',
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
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
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
    advisorScroll: {
        flexDirection: 'row',
        marginTop: 5
    },
    advisorOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    advisorOptionActive: {
        backgroundColor: '#ffe4e6',
        borderColor: '#800000'
    },
    advisorText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b'
    },
    advisorTextActive: {
        color: '#800000'
    },
    submitButton: {
        backgroundColor: '#800000',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
    },
    dropdownText: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500'
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 4,
        maxHeight: 200,
        zIndex: 5000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    dropdownItemActive: {
        backgroundColor: '#ffe4e6'
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#64748b'
    },
    dropdownItemTextActive: {
        color: '#800000',
        fontWeight: '600'
    },
    emptyDropdownText: {
        padding: 20,
        textAlign: 'center',
        color: '#94a3b8'
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#1e293b',
    },
    studentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    studentItemActive: {
        backgroundColor: '#ffe4e6',
        borderColor: '#800000',
    },
    studentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    studentId: {
        fontSize: 12,
        color: '#64748b',
    },
    studentTextActive: {
        color: '#800000',
    },
});

export default ClassManagement;
