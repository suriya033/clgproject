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
    FlatList,
    Platform,
    RefreshControl,
    Dimensions,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Plus,
    X,
    BookOpen,
    Edit2,
    Trash2,
    Search,
    Hash,
    Layers,
    Clock,
    Check,
    Calendar,
    ChevronDown
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const CustomDropdown = ({ label, value, options = [], onSelect, placeholder, icon: Icon, disabled = false }) => {
    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = (options || []).filter(opt =>
        opt?.label?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedLabel = options?.find(opt => opt?.value === value)?.label;

    return (
        <View style={styles.dropdownContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity
                style={[styles.dropdownButton, disabled && styles.disabledDropdown]}
                onPress={() => !disabled && setVisible(true)}
                activeOpacity={0.7}
            >
                <View style={styles.dropdownButtonContent}>
                    {Icon && <Icon size={20} color={disabled ? "#94a3b8" : "#800000"} style={{ marginRight: 10 }} />}
                    <Text style={[
                        styles.dropdownValue,
                        !value && styles.placeholderText,
                        disabled && { color: '#64748b' }
                    ]}>
                        {value ? selectedLabel : placeholder}
                    </Text>
                </View>
                {!disabled && <ChevronDown size={20} color="#94a3b8" />}
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {label}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchBar}>
                            <Search size={20} color="#94a3b8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <FlatList
                            data={filteredOptions}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        value === item.value && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        onSelect(item.value);
                                        setVisible(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[
                                            styles.optionText,
                                            value === item.value && styles.selectedOptionText
                                        ]}>{item.label}</Text>
                                    </View>
                                    {value === item.value && <Check size={20} color="#800000" />}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No options found</Text>
                            }
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const SubjectManagement = ({ navigation, route }) => {
    const { user } = useContext(AuthContext);
    const departmentFilter = route?.params?.departmentFilter;

    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editId, setEditId] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [credits, setCredits] = useState('');
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [semesterOptions, setSemesterOptions] = useState([]);

    const years = [
        { label: '1st Year', value: '1' },
        { label: '2nd Year', value: '2' },
        { label: '3rd Year', value: '3' },
        { label: '4th Year', value: '4' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, deptRes] = await Promise.all([
                api.get('/college/subjects'),
                api.get('/college/departments')
            ]);
            let fetchedSubjects = subRes.data;

            // Filter by department if HOD or if filter passed
            const targetDept = departmentFilter || (user?.role === 'HOD' ? user?.department : null);
            if (targetDept) {
                fetchedSubjects = fetchedSubjects.filter(sub =>
                    sub.department?.name?.toLowerCase() === targetDept.toLowerCase()
                );
            }

            setSubjects(fetchedSubjects);
            setFilteredSubjects(fetchedSubjects);
            setDepartments(deptRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Auto-select and lock department for HOD
    useEffect(() => {
        if (user?.role === 'HOD' && departments.length > 0) {
            const hDept = departments.find(d =>
                d.name.toLowerCase() === user.department?.toLowerCase()
            );
            if (hDept) setDepartment(hDept._id);
        }
    }, [user, departments, modalVisible]);

    // Update semester options based on selected year
    useEffect(() => {
        if (!year) {
            setSemesterOptions([]);
            return;
        }

        const yearInt = parseInt(year);
        const startSem = (yearInt - 1) * 2 + 1;
        const endSem = startSem + 1;

        setSemesterOptions([
            { label: `Semester ${startSem}`, value: String(startSem) },
            { label: `Semester ${endSem}`, value: String(endSem) }
        ]);

        // If current semester is invalid for new year, clear it (unless we are editing and it was set initially)
        if (semester && semester !== String(startSem) && semester !== String(endSem)) {
            setSemester('');
        }
    }, [year]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredSubjects(subjects);
        } else {
            const filtered = subjects.filter(sub =>
                sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (sub.department?.name && sub.department.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredSubjects(filtered);
        }
    }, [searchQuery, subjects]);

    const handleCreateOrUpdate = async () => {
        if (!name || !code || !credits || !department || !year || !semester) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const subjectData = {
                name,
                code,
                credits: parseInt(credits),
                department,
                year,
                semester: semester.toString()
            };

            if (editId) {
                await api.put(`/college/subjects/${editId}`, subjectData);
                Alert.alert('Success', 'Subject updated successfully');
            } else {
                await api.post('/college/subjects', subjectData);
                Alert.alert('Success', 'Subject created successfully');
            }
            setModalVisible(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving subject:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save subject');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (sub) => {
        setEditId(sub._id);
        setName(sub.name);
        setCode(sub.code);
        setCredits(sub.credits.toString());
        setDepartment(sub.department?._id || sub.department);
        setYear(sub.year);
        setSemester(sub.semester);
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Subject',
            'Are you sure you want to delete this subject?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await api.delete(`/college/subjects/${id}`);
                            Alert.alert('Success', 'Subject deleted successfully');
                            fetchData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete subject');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openCreateModal = () => {
        setEditId(null);
        resetForm();
        setModalVisible(true);
    };

    const resetForm = () => {
        setName('');
        setCode('');
        setCredits('');
        if (user?.role !== 'HOD') setDepartment('');
        setYear('');
        setSemester('');
        setEditId(null);
    };

    const renderSubjectCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                    <Hash size={12} color="#800000" />
                    <Text style={styles.codeText}>{item.code}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                        <Edit2 size={16} color="#0284c7" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}>
                        <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.subjectName}>{item.name}</Text>

            <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                    <Layers size={14} color="#64748b" />
                    <Text style={styles.infoText} numberOfLines={1}>{item.department?.name || 'N/A'}</Text>
                </View>
                <View style={[styles.infoItem, { justifyContent: 'space-between', width: '100%' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Calendar size={14} color="#64748b" />
                        <Text style={styles.infoText}>{item.year} Yr • Sem {item.semester}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Clock size={14} color="#64748b" />
                        <Text style={styles.infoText}>{item.credits} Credits</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Subject Management</Text>
                    <TouchableOpacity onPress={openCreateModal} style={styles.iconButton}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search subjects, codes, depts..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            {loading && !refreshing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            )}

            <FlatList
                data={filteredSubjects}
                renderItem={renderSubjectCard}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <BookOpen size={50} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No subjects found</Text>
                    </View>
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editId ? 'Edit Subject' : 'Add Subject'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Subject Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Data Analysis"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.label}>Code</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. DA101"
                                        value={code}
                                        onChangeText={setCode}
                                        autoCapitalize="characters"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Credits</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 4"
                                        value={credits}
                                        onChangeText={setCredits}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <CustomDropdown
                                label="Department"
                                value={department}
                                options={departments.map(d => ({ label: d.name, value: d._id }))}
                                onSelect={setDepartment}
                                placeholder="Choose Department"
                                disabled={user?.role === 'HOD'}
                            />

                            <View style={styles.rowInputs}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <CustomDropdown
                                        label="Year"
                                        value={year}
                                        options={years}
                                        onSelect={setYear}
                                        placeholder="Year"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <CustomDropdown
                                        label="Semester"
                                        value={semester}
                                        options={semesterOptions}
                                        onSelect={setSemester}
                                        placeholder="Select Semester"
                                        disabled={!year}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleCreateOrUpdate} activeOpacity={0.8}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>{editId ? 'Update Subject' : 'Create Subject'}</Text>
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
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
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
        fontSize: 20,
        fontWeight: 'bold',
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
    loadingContainer: {
        padding: 20,
        alignItems: 'center'
    },
    listContent: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    codeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffe4e6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    codeText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#800000',
        marginLeft: 5,
    },
    actionButton: {
        padding: 8,
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
    },
    subjectName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    infoGrid: {
        flexDirection: 'column',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    infoText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500'
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
    closeButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    },
    inputGroup: { marginBottom: 20 },
    rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    dropdownContainer: { marginBottom: 18 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 56,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    disabledDropdown: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
    dropdownButtonContent: { flexDirection: 'row', alignItems: 'center' },
    dropdownValue: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
    placeholderText: { color: '#94a3b8' },

    // Searchable Modal
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 15
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1e293b' },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    selectedOption: { backgroundColor: '#fff5f5' },
    optionText: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
    selectedOptionText: { color: '#800000', fontWeight: '700' },
    emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 20 },

    submitButton: {
        backgroundColor: '#800000',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        height: 56,
        justifyContent: 'center'
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default SubjectManagement;
