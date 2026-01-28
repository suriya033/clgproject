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
    FlatList,
    Platform,
    RefreshControl
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
    Clock
} from 'lucide-react-native';
import api from '../api/api';

const SubjectManagement = ({ navigation }) => {
    // MOCK DATA - Replace with API calls
    const [subjects, setSubjects] = useState([
        { id: '1', name: 'Data Structures', code: 'CS101', credits: '4', department: 'Computer Science' },
        { id: '2', name: 'Thermodynamics', code: 'ME201', credits: '3', department: 'Mechanical' },
        { id: '3', name: 'Digital Logic', code: 'EC301', credits: '4', department: 'Electronics' },
    ]);
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

    useEffect(() => {
        setFilteredSubjects(subjects);
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredSubjects(subjects);
        } else {
            const filtered = subjects.filter(sub =>
                sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.code.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredSubjects(filtered);
        }
    }, [searchQuery, subjects]);

    const fetchDepartments = async () => {
        try {
            // MOCK FETCH
            const response = await api.get('/college/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Fetch departments error (using mock data):', error);
            // Fallback mock data if API fails or doesn't exist
            setDepartments([
                { _id: '1', name: 'Computer Science' },
                { _id: '2', name: 'Mechanical' },
                { _id: '3', name: 'Electronics' },
            ]);
        }
    };

    const handleCreateOrUpdate = () => {
        if (!name || !code || !credits || !department) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (editId) {
            setSubjects(subjects.map(s => s.id === editId ? {
                ...s,
                name,
                code,
                credits,
                department: departments.find(d => d._id === department)?.name || department
            } : s));
            Alert.alert('Success', 'Subject updated successfully');
        } else {
            const newSubject = {
                id: Date.now().toString(),
                name,
                code,
                credits,
                department: departments.find(d => d._id === department)?.name || department
            };
            setSubjects([...subjects, newSubject]);
            Alert.alert('Success', 'Subject created successfully');
        }

        setModalVisible(false);
        resetForm();
    };

    const handleEdit = (sub) => {
        setEditId(sub.id);
        setName(sub.name);
        setCode(sub.code);
        setCredits(sub.credits);
        // Reverse lookup for department ID if needed, simplified here
        const deptObj = departments.find(d => d.name === sub.department);
        setDepartment(deptObj ? deptObj._id : '');
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Subject',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setSubjects(subjects.filter(s => s.id !== id));
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
        setDepartment('');
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
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}>
                        <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.subjectName}>{item.name}</Text>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Layers size={14} color="#64748b" />
                    <Text style={styles.infoText}>{item.department}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Clock size={14} color="#64748b" />
                    <Text style={styles.infoText}>{item.credits} Credits</Text>
                </View>
            </View>
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
                    <Text style={styles.headerTitle}>Subjects</Text>
                    <TouchableOpacity onPress={openCreateModal} style={styles.iconButton}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search subjects..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            <FlatList
                data={filteredSubjects}
                renderItem={renderSubjectCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
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

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Department</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptScroll}>
                                    {departments.map(dept => (
                                        <TouchableOpacity
                                            key={dept._id}
                                            style={[
                                                styles.deptOption,
                                                department === dept._id && styles.deptOptionActive
                                            ]}
                                            onPress={() => setDepartment(dept._id)}
                                        >
                                            <Text style={[
                                                styles.deptText,
                                                department === dept._id && styles.deptTextActive
                                            ]}>{dept.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleCreateOrUpdate}>
                                <Text style={styles.submitButtonText}>{editId ? 'Update Subject' : 'Create Subject'}</Text>
                            </TouchableOpacity>
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
        paddingTop: 40,
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
        gap: 15
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
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
    deptScroll: { flexDirection: 'row', marginTop: 5 },
    deptOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    deptOptionActive: {
        backgroundColor: '#ffe4e6',
        borderColor: '#800000'
    },
    deptText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b'
    },
    deptTextActive: {
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
});

export default SubjectManagement;
