import React, { useState, useEffect, useContext } from 'react';
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
    ChevronDown,
    ChevronRight,
    Star,
    UserMinus,
    User
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const ClassManagement = ({ navigation, route }) => {
    const { user } = useContext(AuthContext);
    const departmentFilter = route?.params?.departmentFilter;
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [semester, setSemester] = useState('');
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
    const [advisorSearchQuery, setAdvisorSearchQuery] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        fetchData();
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/admin/classes');
            setClasses(response.data);
        } catch (error) {
            console.error('Fetch classes error:', error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await api.get('/admin/users');
            let students = response.data.filter(u => u.role === 'Student');
            let teachers = response.data.filter(u => (u.role === 'Staff' || u.role === 'HOD'));

            if (departmentFilter) {
                const deptLower = departmentFilter.toLowerCase();
                students = students.filter(s => s.department?.toLowerCase() === deptLower);
                teachers = teachers.filter(t => t.department?.toLowerCase() === deptLower);
            }

            setAllStudents(students);
            setAllStaff(teachers);
        } catch (error) {
            console.error('Fetch data error:', error);
        }
    };

    const handleCreateClass = async () => {
        if (!className || !section || !academicYear) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const classData = {
                name: className,
                section,
                semester: semester,
                academicYear: academicYear,
                coordinatorId: advisor?._id,
                id: editId
            };

            await api.post('/admin/classes', classData);

            Alert.alert('Success', editId ? 'Class updated successfully' : 'Class created successfully');
            setModalVisible(false);
            resetForm();
            fetchClasses();
        } catch (error) {
            console.error('Save class error:', error);
            Alert.alert('Error', 'Failed to save class');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cls) => {
        setEditId(cls._id);
        setClassName(cls.name);
        setSection(cls.section);
        setSemester(cls.semester);
        setAcademicYear(cls.academicYear);
        setAdvisor(cls.coordinator);
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
        setSemester('');
        setAcademicYear('');
        setAdvisor(null);
        setShowAdvisorDropdown(false);
        setEditId(null);
    };

    const openAssignModal = (cls) => {
        setSelectedClass(cls);
        // Find students who are currently in this class (matching dept, sem, sec)
        const currentlyInClass = allStudents.filter(s =>
            s.department === cls.department &&
            s.semester === cls.semester &&
            s.section === cls.section
        ).map(s => s._id);

        setSelectedStudents(currentlyInClass);
        setStudentModalVisible(true);
    };

    const toggleStudentSelection = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    const handleAssignStudents = async () => {
        if (!selectedClass) return;

        setLoading(true);
        try {
            await api.post('/admin/classes/assign-students', {
                studentIds: selectedStudents,
                semester: selectedClass.semester,
                section: selectedClass.section,
                department: selectedClass.department
            });

            setStudentModalVisible(false);
            Alert.alert('Success', `Assigned ${selectedStudents.length} students to ${selectedClass.name} - ${selectedClass.section}`);
            fetchClasses(); // Refresh
        } catch (error) {
            console.error('Assign students error:', error);
            Alert.alert('Error', 'Failed to assign students');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = allStudents.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Advisor Assignment State
    const [assignAdvisorModalVisible, setAssignAdvisorModalVisible] = useState(false);
    const [selectedClassForAdvisor, setSelectedClassForAdvisor] = useState(null);
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);

    const openAdvisorModal = (cls) => {
        setSelectedClassForAdvisor(cls);
        setSelectedAdvisor(cls.coordinator);
        setAssignAdvisorModalVisible(true);
    };

    const handleAssignAdvisor = async () => {
        if (!selectedClassForAdvisor || !selectedAdvisor) {
            Alert.alert('Error', 'Please select a staff member');
            return;
        }

        // If it was opened from the "Create New Class" flow (temp ID)
        if (selectedClassForAdvisor._id === 'temp') {
            setAdvisor(selectedAdvisor);
            setAssignAdvisorModalVisible(false);
            setModalVisible(true); // Go back to create modal
            setAdvisorSearchQuery('');
            return;
        }

        setLoading(true);
        try {
            const classData = {
                id: selectedClassForAdvisor._id,
                name: selectedClassForAdvisor.name,
                section: selectedClassForAdvisor.section,
                semester: selectedClassForAdvisor.semester,
                academicYear: selectedClassForAdvisor.academicYear,
                coordinatorId: selectedAdvisor?._id,
                department: selectedClassForAdvisor.department
            };

            await api.post('/admin/classes', classData);

            Alert.alert('Success', 'Class Advisor updated successfully');
            setAssignAdvisorModalVisible(false);
            setAdvisorSearchQuery('');
            fetchClasses();
        } catch (error) {
            console.error('Save advisor error:', error);
            Alert.alert('Error', 'Failed to update advisor');
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = allStaff.filter(s =>
        s.name.toLowerCase().includes(advisorSearchQuery.toLowerCase()) ||
        s.userId.toLowerCase().includes(advisorSearchQuery.toLowerCase()) ||
        s.department?.toLowerCase().includes(advisorSearchQuery.toLowerCase())
    );

    const renderClassCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <BookOpen size={24} color="#800000" />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.classTitle}>{item.name}</Text>
                    <Text style={styles.classSub}>Semester {item.semester} • Section {item.section}</Text>
                </View>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                    <Edit2 size={16} color="#0284c7" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={[styles.statItem, { marginRight: 16 }]}>
                    <Users size={16} color="#64748b" />
                    <Text style={styles.statText}>
                        {allStudents.filter(s =>
                            s.department === item.department &&
                            s.semester === item.semester &&
                            s.section === item.section
                        ).length} Students
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Briefcase size={16} color="#64748b" />
                    <Text style={styles.statText}>{item.academicYear}</Text>
                </View>
            </View>

            <View style={styles.advisorBox}>
                <View style={styles.advisorBoxHeader}>
                    <View style={styles.advisorLabelRow}>
                        <Star size={14} color="#800000" />
                        <Text style={styles.advisorLabel}>CLASS ADVISOR</Text>
                    </View>
                </View>
                <View style={styles.advisorBoxContent}>
                    <View style={styles.advisorAvatar}>
                        <Text style={styles.avatarText}>
                            {item.coordinator ? item.coordinator.name.charAt(0) : '?'}
                        </Text>
                    </View>
                    <View style={styles.advisorInfo}>
                        <Text style={styles.advisorName}>
                            {item.coordinator ? item.coordinator.name : 'Not Assigned'}
                        </Text>
                        <Text style={styles.advisorId}>
                            {item.coordinator ? item.coordinator.userId : 'E-------'}
                        </Text>
                    </View>
                    {user?.role === 'HOD' && (
                        <View style={styles.advisorActions}>
                            <TouchableOpacity
                                style={styles.changeAdvisorBtn}
                                onPress={() => openAdvisorModal(item)}
                            >
                                <Text style={styles.changeAdvisorBtnText}>Change</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.unassignAdvisorBtn}
                                onPress={() => {
                                    Alert.alert(
                                        'Unassign Advisor',
                                        'Are you sure you want to unassign the advisor?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Unassign',
                                                style: 'destructive',
                                                onPress: async () => {
                                                    setLoading(true);
                                                    try {
                                                        await api.post('/admin/classes', {
                                                            id: item._id,
                                                            name: item.name,
                                                            section: item.section,
                                                            semester: item.semester,
                                                            academicYear: item.academicYear,
                                                            coordinatorId: null,
                                                            department: item.department
                                                        });
                                                        fetchClasses();
                                                    } catch (e) {
                                                        console.error(e);
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }}
                            >
                                <UserMinus size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <TouchableOpacity
                style={styles.manageStudentsBtn}
                onPress={() => openAssignModal(item)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={18} color="#475569" />
                    <Text style={styles.manageStudentsBtnText}>Manage Students</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const [selectedYear, setSelectedYear] = useState(null);

    const handleYearSelect = (year) => {
        setSelectedYear(year);
    };

    const handleBackPress = () => {
        if (selectedYear) {
            setSelectedYear(null);
        } else {
            navigation.goBack();
        }
    };

    const renderYearCard = (year) => {
        const yearClasses = classes.filter(c => c.semester && Math.ceil(c.semester / 2).toString() === year);

        return (
            <TouchableOpacity
                key={year}
                style={styles.yearCard}
                onPress={() => handleYearSelect(year)}
            >
                <View style={styles.yearIconContainer}>
                    <Text style={styles.yearIconText}>{year}</Text>
                </View>
                <View style={styles.yearInfo}>
                    <Text style={styles.yearTitle}>
                        {year === '1' ? 'First' : year === '2' ? 'Second' : year === '3' ? 'Third' : 'Fourth'} Year
                    </Text>
                    <Text style={styles.yearSub}>
                        {classes.filter(c => Math.ceil(parseInt(c.semester || 0) / 2).toString() === year).length} Classes
                    </Text>
                </View>
                <ChevronRight size={24} color="#cbd5e1" />
            </TouchableOpacity>
        );
    };

    // Filter classes for the selected year
    const displayedClasses = selectedYear
        ? classes.filter(c => Math.ceil(parseInt(c.semester || 0) / 2).toString() === selectedYear)
        : [];

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {selectedYear ? `${selectedYear === '1' ? '1st' : selectedYear === '2' ? '2nd' : selectedYear === '3' ? '3rd' : '4th'} Year Classes` : 'Class Management'}
                    </Text>
                    <TouchableOpacity onPress={openCreateModal} style={styles.iconButton}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {!selectedYear ? (
                <ScrollView contentContainerStyle={styles.listContent}>
                    <View style={styles.yearGrid}>
                        {['1', '2', '3', '4'].map(year => renderYearCard(year))}
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={displayedClasses}
                    renderItem={renderClassCard}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <BookOpen size={50} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No classes found for this year</Text>
                        </View>
                    }
                />
            )}

            {/* Advisor Assignment Modal (Match Image 2) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={assignAdvisorModalVisible}
                onRequestClose={() => setAssignAdvisorModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '85%' }]}>
                        <View style={[styles.modalHeader, styles.advisorModalHeader]}>
                            <View>
                                <Text style={styles.modalTitleWhite}>Assign Advisor Staff ({allStaff.length})</Text>
                                <Text style={styles.modalSubtitleWhite}>
                                    • Sem {selectedClassForAdvisor?.semester} • Sec {selectedClassForAdvisor?.section}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setAssignAdvisorModalVisible(false)}
                                style={styles.closeButtonWhite}
                            >
                                <X size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchBarContainer}>
                            <Search size={20} color="#94a3b8" />
                            <TextInput
                                style={styles.searchBarInput}
                                placeholder="Search all staff members..."
                                value={advisorSearchQuery}
                                onChangeText={setAdvisorSearchQuery}
                            />
                        </View>

                        <FlatList
                            data={filteredStaff}
                            keyExtractor={item => item._id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected = selectedAdvisor?._id === item._id;
                                const isAlreadyCoordinator = item.isCoordinator && !isSelected;

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.staffCard,
                                            isSelected && styles.staffCardSelected
                                        ]}
                                        onPress={() => setSelectedAdvisor(item)}
                                    >
                                        <View style={[
                                            styles.staffAvatar,
                                            isSelected && styles.staffAvatarSelected
                                        ]}>
                                            <Text style={[
                                                styles.staffAvatarText,
                                                isSelected && styles.staffAvatarTextSelected
                                            ]}>
                                                {item.name.charAt(0)}
                                            </Text>
                                        </View>
                                        <View style={styles.staffInfo}>
                                            <Text style={styles.staffName}>{item.name}</Text>
                                            <Text style={styles.staffSub}>{item.userId} • {item.department}</Text>
                                            {isAlreadyCoordinator && (
                                                <View style={styles.coordinatorStatus}>
                                                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                                                    <Text style={styles.coordinatorStatusText}>Already a Coordinator</Text>
                                                </View>
                                            )}
                                        </View>
                                        {isSelected && (
                                            <View style={styles.selectionCheck}>
                                                <CheckCircle2 size={24} color="#800000" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        {selectedAdvisor && (
                            <View style={styles.assigningStatus}>
                                <User size={18} color="#166534" />
                                <Text style={styles.assigningStatusText}>
                                    Assigning: <Text style={{ fontWeight: 'bold' }}>{selectedAdvisor.name}</Text>
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.confirmAssignBtn,
                                !selectedAdvisor && styles.btnDisabled
                            ]}
                            onPress={handleAssignAdvisor}
                            disabled={!selectedAdvisor}
                        >
                            <UserCog size={20} color="#fff" />
                            <Text style={styles.confirmAssignBtnText}>Confirm & Assign</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Create/Edit Class Modal (Match Image 1) */}
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
                                <Text style={[styles.label, { color: '#334155' }]}>Class Name</Text>
                                <TextInput
                                    style={styles.modernInput}
                                    placeholder="e.g. Computer Science"
                                    value={className}
                                    onChangeText={setClassName}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: '#334155' }]}>Section</Text>
                                <TextInput
                                    style={styles.modernInput}
                                    placeholder="e.g. A"
                                    value={section}
                                    onChangeText={setSection}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: '#334155' }]}>Semester</Text>
                                <TextInput
                                    style={styles.modernInput}
                                    placeholder="e.g. 1"
                                    value={semester}
                                    onChangeText={setSemester}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: '#334155' }]}>Academic Year</Text>
                                <TextInput
                                    style={styles.modernInput}
                                    placeholder="e.g. 2024-2025"
                                    value={academicYear}
                                    onChangeText={setAcademicYear}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            {user?.role === 'HOD' && (
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: '#334155' }]}>Assign Class Advisor</Text>
                                    <TouchableOpacity
                                        style={styles.modernDropdown}
                                        onPress={() => {
                                            setModalVisible(false);
                                            // We open the dedicated advisor modal instead
                                            setSelectedClassForAdvisor({
                                                _id: editId || 'temp',
                                                name: className,
                                                section,
                                                semester,
                                                academicYear,
                                                department: user.department // Use HOD's department
                                            });
                                            setAssignAdvisorModalVisible(true);
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <UserCog size={20} color="#64748b" style={{ marginRight: 12 }} />
                                            <Text style={[
                                                styles.modernDropdownText,
                                                !advisor && { color: '#94a3b8' }
                                            ]}>
                                                {advisor ? advisor.name : 'Click to Select Staff'}
                                            </Text>
                                        </View>
                                        <ChevronDown size={20} color="#64748b" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.modernSubmitBtn,
                                    (!className || !section || !academicYear) && styles.btnDisabled
                                ]}
                                onPress={handleCreateClass}
                            >
                                <Text style={styles.modernSubmitBtnText}>
                                    {editId ? 'Update Class' : 'Create Class'}
                                </Text>
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
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
    // New Advisor Box Styles (Match Image 3)
    advisorBox: {
        backgroundColor: '#fff1f2',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ffe4e6',
    },
    advisorBoxHeader: {
        marginBottom: 10,
    },
    advisorLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    advisorLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#800000',
        letterSpacing: 0.5,
    },
    advisorBoxContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    advisorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#fb718520',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#800000',
    },
    advisorInfo: {
        flex: 1,
    },
    advisorName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    advisorId: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    advisorActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    changeAdvisorBtn: {
        backgroundColor: '#800000',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    changeAdvisorBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    unassignAdvisorBtn: {
        padding: 6,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    manageStudentsBtn: {
        backgroundColor: '#f8fafc',
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    manageStudentsBtnText: {
        color: '#475569',
        fontWeight: '700',
        fontSize: 15,
    },

    // Advisor Modal Styles (Match Image 2)
    advisorModalHeader: {
        backgroundColor: '#800000',
        marginHorizontal: -24,
        marginTop: -24,
        padding: 24,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginBottom: 20,
    },
    modalTitleWhite: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    modalSubtitleWhite: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    closeButtonWhite: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 8,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
    },
    searchBarInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    staffCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    staffCardSelected: {
        borderColor: '#800000',
        backgroundColor: '#fff1f2',
    },
    staffAvatar: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    staffAvatarSelected: {
        backgroundColor: '#ffe4e6',
    },
    staffAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#64748b',
    },
    staffAvatarTextSelected: {
        color: '#800000',
    },
    staffInfo: {
        flex: 1,
    },
    staffName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    staffSub: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    coordinatorStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    coordinatorStatusText: {
        fontSize: 11,
        color: '#d97706',
        fontWeight: '600',
    },
    selectionCheck: {
        marginLeft: 12,
    },
    assigningStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    assigningStatusText: {
        fontSize: 14,
        color: '#166534',
    },
    confirmAssignBtn: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 18,
        borderRadius: 18,
    },
    confirmAssignBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    btnDisabled: {
        opacity: 0.5,
    },

    // Modern Modal Input Styles (Match Image 1)
    modernInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
    },
    modernDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        padding: 16,
    },
    modernDropdownText: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    modernSubmitBtn: {
        backgroundColor: '#800000',
        padding: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 20,
    },
    modernSubmitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 24,
        maxHeight: '92%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
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
    yearGrid: {
        gap: 16
    },
    yearCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    yearIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        borderWidth: 1,
        borderColor: '#fecdd3'
    },
    yearIconText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#800000'
    },
    yearInfo: {
        flex: 1
    },
    yearTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    yearSub: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginTop: 4
    }
});

export default ClassManagement;
