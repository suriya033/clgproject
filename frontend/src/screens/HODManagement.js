import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    SafeAreaView,
    StatusBar,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import {
    Users,
    ArrowLeft,
    Search,
    Building2,
    CheckCircle2,
    X,
    UserCog,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const HODManagement = ({ navigation }) => {
    const { user: currentUser } = useContext(AuthContext);
    const [departments, setDepartments] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [staffSearchQuery, setStaffSearchQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, userRes] = await Promise.all([
                api.get('/college/departments'),
                api.get('/admin/users')
            ]);
            setDepartments(deptRes.data);
            // Filter users who are Staff or HOD
            const teachers = userRes.data.filter(u => u.role === 'Staff' || u.role === 'HOD');
            setStaff(teachers);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleAssignHOD = async () => {
        if (!selectedDept || !selectedStaff) {
            Alert.alert('Error', 'Please select a department and a teacher');
            return;
        }

        setSubmitting(true);
        try {
            // Update Department with new HOD
            await api.put(`/college/departments/${selectedDept._id}`, {
                hod: selectedStaff._id
            });

            Alert.alert('Success', `HOD Assigned successfully to ${selectedDept.name}`);
            setModalVisible(false);
            setSelectedDept(null);
            setSelectedStaff(null);
            fetchData();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to assign HOD');
        } finally {
            setSubmitting(false);
        }
    };

    const openAssignModal = (dept) => {
        setSelectedDept(dept);
        setSelectedStaff(null);
        setStaffSearchQuery('');
        setModalVisible(true);
    };

    const filteredFilteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        s.userId.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        (s.department && s.department.toLowerCase().includes(staffSearchQuery.toLowerCase()))
    );

    const renderDepartmentItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Building2 size={24} color="#800000" />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.deptName}>{item.name}</Text>
                    <Text style={styles.deptCode}>Code: {item.code}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.hodSection}>
                <Text style={styles.hodLabel}>Head of Department</Text>
                {item.hod ? (
                    <View style={styles.hodInfo}>
                        <UserCog size={18} color="#5a0000" />
                        <Text style={styles.hodName}>{item.hod.name}</Text>
                    </View>
                ) : (
                    <Text style={styles.noHod}>No HOD Assigned</Text>
                )}
            </View>

            <TouchableOpacity
                style={styles.assignButton}
                onPress={() => openAssignModal(item)}
            >
                <Text style={styles.assignButtonText}>{item.hod ? 'Change HOD' : 'Assign HOD'}</Text>
                <ChevronRight size={16} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>HOD Management</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchBar}>
                    <Search size={20} color="rgba(255,255,255,0.6)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search departments..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={filteredFilteredDepartments}
                    renderItem={renderDepartmentItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No Departments Found</Text>
                        </View>
                    }
                />
            )}

            {/* Assign HOD Modal */}
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
                                <Text style={styles.modalTitle}>Assign HOD</Text>
                                <Text style={styles.modalSubtitle}>
                                    Select a teacher for {selectedDept?.name}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalSearch}>
                            <SearchIcon size={20} color="#94a3b8" />
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder="Search teachers..."
                                value={staffSearchQuery}
                                onChangeText={setStaffSearchQuery}
                            />
                        </View>

                        <FlatList
                            data={filteredStaff}
                            keyExtractor={item => item._id}
                            style={styles.staffList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.staffItem,
                                        selectedStaff?._id === item._id && styles.selectedStaffItem
                                    ]}
                                    onPress={() => setSelectedStaff(item)}
                                >
                                    <View style={styles.staffInfo}>
                                        <Text style={[
                                            styles.staffName,
                                            selectedStaff?._id === item._id && styles.selectedStaffText
                                        ]}>{item.name}</Text>
                                        <Text style={[
                                            styles.staffDept,
                                            selectedStaff?._id === item._id && styles.selectedStaffSubText
                                        ]}>{item.department || 'No Dept'} • {item.userId}</Text>
                                    </View>
                                    {selectedStaff?._id === item._id && (
                                        <CheckCircle2 size={20} color="#800000" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.noResultText}>No teachers found</Text>
                            }
                        />

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.submitButton, (!selectedStaff || submitting) && styles.disabledButton]}
                                onPress={handleAssignHOD}
                                disabled={!selectedStaff || submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Confirm Assignment</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: 50,
        paddingBottom: 25,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff'
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#fff',
        fontSize: 16
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContent: {
        padding: 20
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    cardContent: { flex: 1 },
    deptName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b'
    },
    deptCode: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500'
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 12
    },
    hodSection: {
        marginBottom: 15
    },
    hodLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 5
    },
    hodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    hodName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b'
    },
    noHod: {
        fontSize: 14,
        color: '#94a3b8',
        fontStyle: 'italic'
    },
    assignButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#800000',
        padding: 12,
        borderRadius: 12,
        gap: 8
    },
    assignButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        padding: 24
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b'
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 50
    },
    modalSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 20
    },
    modalSearchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#1e293b'
    },
    staffList: {
        flex: 1
    },
    staffItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    selectedStaffItem: {
        backgroundColor: '#ffe4e6',
        borderColor: '#800000'
    },
    staffName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b'
    },
    selectedStaffText: {
        color: '#800000'
    },
    staffDept: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2
    },
    selectedStaffSubText: {
        color: '#5a0000'
    },
    noResultText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 20
    },
    modalFooter: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    submitButton: {
        backgroundColor: '#800000',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center'
    },
    disabledButton: {
        opacity: 0.5
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    }
});

export default HODManagement;
