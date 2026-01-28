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
    RefreshControl
} from 'react-native';
import {
    Building,
    Plus,
    X,
    ChevronLeft,
    Send,
    Trash2,
    Search,
    User,
    Hash,
    Briefcase
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { college } from '../api/api';
import api from '../api/api';

const DepartmentManagement = ({ navigation }) => {
    const [departments, setDepartments] = useState([]);
    const [filteredDepts, setFilteredDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [staffList, setStaffList] = useState([]);

    // Form State
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [hod, setHod] = useState('');

    useEffect(() => {
        fetchDepartments();
        fetchStaff();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredDepts(departments);
        } else {
            const filtered = departments.filter(dept =>
                dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dept.code.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredDepts(filtered);
        }
    }, [searchQuery, departments]);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await college.getDepartments();
            setDepartments(response.data);
            setFilteredDepts(response.data);
        } catch (error) {
            console.error('Fetch departments error:', error);
            Alert.alert('Error', 'Failed to fetch departments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await api.get('/admin/users');
            const staff = response.data.filter(u => u.role === 'Staff' || u.role === 'HOD');
            setStaffList(staff);
        } catch (error) {
            console.error('Fetch staff error:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDepartments();
    };

    const handleSubmit = async () => {
        if (!name || !code) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        try {
            setSubmitting(true);
            const data = { name, code };
            if (hod) data.hod = hod;

            await college.createDepartment(data);
            Alert.alert('Success', 'Department created successfully');
            setModalVisible(false);
            resetForm();
            fetchDepartments();
        } catch (error) {
            console.error('Create department error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create department');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Department',
            'Are you sure? This may affect courses and users assigned to this department.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await college.deleteDepartment(id);
                            fetchDepartments();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete department');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setName('');
        setCode('');
        setHod('');
    };

    const renderDeptCard = (dept) => (
        <View key={dept._id} style={styles.deptCard}>
            <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                    <Hash size={12} color="#800000" />
                    <Text style={styles.codeText}>{dept.code}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(dept._id)} style={styles.deleteButton}>
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <Text style={styles.deptName}>{dept.name}</Text>

            <View style={styles.hodSection}>
                <View style={styles.hodIconWrapper}>
                    <User size={16} color="#64748b" />
                </View>
                <View>
                    <Text style={styles.hodLabel}>Head of Department</Text>
                    <Text style={styles.hodName}>{dept.hod?.name || 'Not Assigned'}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <Briefcase size={14} color="#94a3b8" />
                    <Text style={styles.footerText}>Academic Unit</Text>
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
                    <Text style={styles.headerTitle}>Departments</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search departments..."
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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />
                    }
                >
                    {filteredDepts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Building size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No Departments</Text>
                            <Text style={styles.emptySubtitle}>Start by adding a new department</Text>
                        </View>
                    ) : (
                        filteredDepts.map(renderDeptCard)
                    )}
                </ScrollView>
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
                                <Text style={styles.modalTitle}>Add Department</Text>
                                <Text style={styles.modalSubtitle}>Create a new academic unit</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Department Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Computer Science"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Department Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., CSE"
                                    value={code}
                                    onChangeText={setCode}
                                    autoCapitalize="characters"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Assign HOD (Optional)</Text>
                                <View style={styles.hodSelector}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {staffList.map(staff => (
                                            <TouchableOpacity
                                                key={staff._id}
                                                style={[
                                                    styles.staffOption,
                                                    hod === staff._id && styles.staffOptionActive
                                                ]}
                                                onPress={() => setHod(staff._id)}
                                            >
                                                <Text style={[
                                                    styles.staffOptionText,
                                                    hod === staff._id && styles.staffOptionTextActive
                                                ]}>{staff.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
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
                                        <Text style={styles.submitButtonText}>Create Department</Text>
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
    scrollContent: { padding: 20, paddingBottom: 40 },
    deptCard: {
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
        marginBottom: 12,
    },
    codeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffe4e6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    codeText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#800000',
        marginLeft: 4,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#fff1f2',
        borderRadius: 10,
    },
    deptName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    hodSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
    },
    hodIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        elevation: 1,
    },
    hodLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    hodName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    footerItem: { flexDirection: 'row', alignItems: 'center' },
    footerText: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginLeft: 6 },

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
    hodSelector: { marginTop: 5 },
    staffOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    staffOptionActive: {
        backgroundColor: '#ffe4e6',
        borderColor: '#800000'
    },
    staffOptionText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    staffOptionTextActive: { color: '#800000' },
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

export default DepartmentManagement;
