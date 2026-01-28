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
    Platform,
    SafeAreaView,
    StatusBar,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import {
    Plus,
    Trash2,
    X,
    Building2,
    BookOpen,
    Users,
    ArrowLeft,
    LogOut,
    Search,
    ChevronRight,
    Hash,
    Clock,
    LayoutDashboard,
    Briefcase,
    Banknote,
    Megaphone
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const CollegeManagement = ({ navigation }) => {
    const { user: currentUser, logout } = useContext(AuthContext);
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [officeStaff, setOfficeStaff] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('Departments');
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ name: '', code: '', duration: '', department: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterData();
    }, [searchQuery, activeTab, departments, courses, officeStaff]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [deptRes, courseRes, userRes] = await Promise.all([
                api.get('/college/departments'),
                api.get('/college/courses'),
                api.get('/admin/users')
            ]);
            setDepartments(deptRes.data);
            setCourses(courseRes.data);
            setOfficeStaff(userRes.data.filter(u => u.role === 'Office'));
        } catch (error) {
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

    const filterData = () => {
        let data;
        if (activeTab === 'Departments') data = departments;
        else if (activeTab === 'Courses') data = courses;
        else data = officeStaff;

        if (!searchQuery.trim()) {
            setFilteredData(data);
        } else {
            const filtered = data.filter(item => {
                const nameMatch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
                const codeMatch = (item.code || item.userId || '').toLowerCase().includes(searchQuery.toLowerCase());
                return nameMatch || codeMatch;
            });
            setFilteredData(filtered);
        }
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.code) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        setSubmitting(true);
        try {
            if (activeTab === 'Departments') {
                await api.post('/college/departments', { name: formData.name, code: formData.code });
            } else {
                if (!formData.duration || !formData.department) {
                    Alert.alert('Error', 'Please fill in all course details');
                    setSubmitting(false);
                    return;
                }
                await api.post('/college/courses', {
                    name: formData.name,
                    code: formData.code,
                    duration: formData.duration,
                    department: formData.department
                });
            }
            Alert.alert('Success', `${activeTab.slice(0, -1)} created successfully`);
            setModalVisible(false);
            setFormData({ name: '', code: '', duration: '', department: '' });
            fetchData();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        const itemType = activeTab === 'Incharges' ? 'incharge' : activeTab.slice(0, -1).toLowerCase();
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete this ${itemType}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            let endpoint;
                            if (activeTab === 'Departments') endpoint = `/college/departments/${id}`;
                            else if (activeTab === 'Courses') endpoint = `/college/courses/${id}`;
                            else endpoint = `/admin/users/${id}`;

                            await api.delete(endpoint);
                            fetchData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        if (activeTab === 'Incharges') {
            return (
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('UserManagement', { roleFilter: 'Office' })}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: '#f5f3ff' }]}>
                            <Users size={24} color="#8b5cf6" />
                        </View>
                        <View style={styles.cardMainInfo}>
                            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.codeRow}>
                                <Hash size={14} color="#64748b" />
                                <Text style={styles.cardCode}>{item.userId}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleDelete(item._id)}
                            style={styles.deleteBtn}
                        >
                            <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={styles.footerTag}>
                            <Megaphone size={12} color="#64748b" />
                            <Text style={styles.footerTagText}>{item.email}</Text>
                        </View>
                        <View style={{ flex: 1 }} />
                        <ChevronRight size={18} color="#cbd5e1" />
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: activeTab === 'Departments' ? '#ffe4e6' : '#f0fdf4' }]}>
                        {activeTab === 'Departments' ?
                            <Building2 size={24} color="#800000" /> :
                            <BookOpen size={24} color="#10b981" />
                        }
                    </View>
                    <View style={styles.cardMainInfo}>
                        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.codeRow}>
                            <Hash size={14} color="#64748b" />
                            <Text style={styles.cardCode}>{item.code}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleDelete(item._id)}
                        style={styles.deleteBtn}
                    >
                        <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardFooter}>
                    {activeTab === 'Courses' ? (
                        <>
                            <View style={styles.footerTag}>
                                <Clock size={12} color="#64748b" />
                                <Text style={styles.footerTagText}>{item.duration}</Text>
                            </View>
                            <View style={[styles.footerTag, { backgroundColor: '#f1f5f9' }]}>
                                <Building2 size={12} color="#64748b" />
                                <Text style={styles.footerTagText}>{item.department?.name || 'N/A'}</Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.footerTag}>
                            <Users size={12} color="#64748b" />
                            <Text style={styles.footerTagText}>{item.hod?.name || 'No HOD Assigned'}</Text>
                        </View>
                    )}
                    <View style={{ flex: 1 }} />
                    <ChevronRight size={18} color="#cbd5e1" />
                </View>
            </TouchableOpacity>
        );
    };

    const renderListHeader = () => (
        <>
            <View style={styles.tabWrapper}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Departments' && styles.activeTab]}
                    onPress={() => setActiveTab('Departments')}
                >
                    <Building2 size={18} color={activeTab === 'Departments' ? '#800000' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'Departments' && styles.activeTabText]}>Departments</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Courses' && styles.activeTab]}
                    onPress={() => setActiveTab('Courses')}
                >
                    <BookOpen size={18} color={activeTab === 'Courses' ? '#800000' : '#64748b'} />
                    <Text style={[styles.tabText, activeTab === 'Courses' && styles.activeTabText]}>Courses</Text>
                </TouchableOpacity>
                {currentUser?.role === 'Admin' && (
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Incharges' && styles.activeTab]}
                        onPress={() => setActiveTab('Incharges')}
                    >
                        <Users size={18} color={activeTab === 'Incharges' ? '#800000' : '#64748b'} />
                        <Text style={[styles.tabText, activeTab === 'Incharges' && styles.activeTabText]}>Incharges</Text>
                    </TouchableOpacity>
                )}
            </View>

            {(currentUser?.role === 'Office' || currentUser?.role === 'Admin') && (
                <View style={styles.quickActions}>
                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                    <View style={styles.actionRow}>
                        {currentUser?.role === 'Admin' ? (
                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: '#800000' }]}
                                onPress={() => navigation.navigate('UserManagement', { roleFilter: 'Office' })}
                            >
                                <Users size={20} color="#fff" />
                                <Text style={styles.actionCardText}>Manage Incharges</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: '#f59e0b' }]}
                                onPress={() => navigation.navigate('Fees')}
                            >
                                <Banknote size={20} color="#fff" />
                                <Text style={styles.actionCardText}>Manage Fees</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: '#10b981' }]}
                            onPress={() => navigation.navigate('Announcements')}
                        >
                            <Megaphone size={20} color="#fff" />
                            <Text style={styles.actionCardText}>Notices</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{activeTab} List</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => {
                        if (activeTab === 'Incharges') {
                            navigation.navigate('UserManagement', { roleFilter: 'Office' });
                        } else {
                            setModalVisible(true);
                        }
                    }}
                >
                    <Plus size={20} color="#fff" />
                    <Text style={styles.addBtnText}>Add New</Text>
                </TouchableOpacity>
            </View>
        </>
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
                        style={styles.headerIconBtn}
                    >
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Office Portal</Text>
                    <View style={{ flexDirection: 'row' }}>
                        {currentUser?.role === 'Admin' && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('UserManagement', { roleFilter: 'Office' })}
                                style={[styles.headerIconBtn, { marginRight: 10 }]}
                            >
                                <Users size={22} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={logout}
                            style={styles.headerIconBtn}
                        >
                            <LogOut size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.searchBarContainer}>
                    <Search size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${activeTab.toLowerCase()}...`}
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, currentUser?.role === 'Admin' && { flex: 0.31 }]}>
                        <View style={[styles.statIconCircle, { backgroundColor: '#ffe4e6' }]}>
                            <Building2 size={16} color="#800000" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{departments.length}</Text>
                            <Text style={styles.statLabel}>Depts</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, currentUser?.role === 'Admin' && { flex: 0.31 }]}>
                        <View style={[styles.statIconCircle, { backgroundColor: '#f0fdf4' }]}>
                            <BookOpen size={16} color="#10b981" />
                        </View>
                        <View>
                            <Text style={styles.statValue}>{courses.length}</Text>
                            <Text style={styles.statLabel}>Courses</Text>
                        </View>
                    </View>
                    {currentUser?.role === 'Admin' && (
                        <View style={[styles.statCard, { flex: 0.31 }]}>
                            <View style={[styles.statIconCircle, { backgroundColor: '#f5f3ff' }]}>
                                <Users size={16} color="#8b5cf6" />
                            </View>
                            <View>
                                <Text style={styles.statValue}>{officeStaff.length}</Text>
                                <Text style={styles.statLabel}>Staff</Text>
                            </View>
                        </View>
                    )}
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#800000" />
                        <Text style={styles.loaderText}>Loading data...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        ListHeaderComponent={renderListHeader}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <LayoutDashboard size={64} color="#cbd5e1" />
                                <Text style={styles.emptyTitle}>No {activeTab} Found</Text>
                                <Text style={styles.emptySubtitle}>Try adjusting your search or add a new one.</Text>
                            </View>
                        }
                    />
                )}
            </View>

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
                                <Text style={styles.modalTitle}>Add {activeTab.slice(0, -1)}</Text>
                                <Text style={styles.modalSubtitle}>Enter details for the new {activeTab.slice(0, -1).toLowerCase()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeBtn}
                            >
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={`e.g. ${activeTab === 'Departments' ? 'Computer Science' : 'B.Tech CSE'}`}
                                    value={formData.name}
                                    onChangeText={(val) => setFormData({ ...formData, name: val })}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={`e.g. ${activeTab === 'Departments' ? 'CSE' : 'BT-CSE'}`}
                                    value={formData.code}
                                    onChangeText={(val) => setFormData({ ...formData, code: val })}
                                    autoCapitalize="characters"
                                />
                            </View>

                            {activeTab === 'Courses' && (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Duration</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g. 4 Years"
                                            value={formData.duration}
                                            onChangeText={(val) => setFormData({ ...formData, duration: val })}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Select Department</Text>
                                        <View style={styles.deptSelector}>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                {departments.map(dept => (
                                                    <TouchableOpacity
                                                        key={dept._id}
                                                        style={[
                                                            styles.deptOption,
                                                            formData.department === dept._id && styles.deptOptionActive
                                                        ]}
                                                        onPress={() => setFormData({ ...formData, department: dept._id })}
                                                    >
                                                        <Text style={[
                                                            styles.deptOptionText,
                                                            formData.department === dept._id && styles.deptOptionTextActive
                                                        ]}>{dept.name}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                </>
                            )}

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && styles.disabledBtn]}
                                onPress={handleCreate}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Create {activeTab.slice(0, -1)}</Text>
                                )}
                            </TouchableOpacity>
                            <View style={{ height: 30 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        paddingBottom: 30,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25
    },
    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 25
    },
    searchIcon: { marginRight: 12 },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    statCard: {
        flex: 0.48,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    statIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff'
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        marginTop: 4
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: -20
    },
    tabWrapper: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        marginBottom: 25
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8
    },
    activeTab: {
        backgroundColor: '#ffe4e6',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b'
    },
    activeTabText: {
        color: '#800000'
    },
    quickActions: {
        marginBottom: 25
    },
    quickActionsTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 12,
        marginLeft: 4
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    actionCard: {
        flex: 0.48,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    actionCardText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b'
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#800000',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        gap: 6,
        elevation: 4,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14
    },
    listContainer: {
        paddingBottom: 30
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    cardMainInfo: {
        flex: 1
    },
    cardName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    cardCode: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b'
    },
    deleteBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff1f2',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
        gap: 10
    },
    footerTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        gap: 6
    },
    footerTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b'
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    },
    loaderText: {
        marginTop: 12,
        color: '#64748b',
        fontWeight: '500'
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 20
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22
    },
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
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b'
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500'
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 10,
        marginLeft: 4
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    deptSelector: {
        marginTop: 5
    },
    deptOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    deptOptionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b'
    },
    deptOptionTextActive: {
        color: '#800000'
    },
    submitBtn: {
        backgroundColor: '#800000',
        borderRadius: 18,
        padding: 20,
        alignItems: 'center',
        marginTop: 10,
        elevation: 8,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 15
    },
    disabledBtn: {
        opacity: 0.7
    },
    submitBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff'
    }
});

export default CollegeManagement;
