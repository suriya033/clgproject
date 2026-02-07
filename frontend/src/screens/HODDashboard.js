import React, { useContext, useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Platform,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import {
    Megaphone,
    GraduationCap,
    Users,
    BookOpen,
    Menu,
    Bell,
    LogOut,
    Calendar,
    LayoutDashboard,
    ClipboardList,
    Building2,
    X,
    ChevronRight,
    Search,
    Info,
    User,
    Mail,
    Phone,
    Briefcase,
    Hash,
    MessageSquare
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Modal } from 'react-native';
import api from '../api/api';

const HODDashboard = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [yearModalVisible, setYearModalVisible] = useState(false);
    const [bioModalVisible, setBioModalVisible] = useState(false);
    const [stats, setStats] = useState({ students: 0, staff: 0, courses: 0, studentsByYear: [] });

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (user?.department) {
                fetchStats();
            }
        });

        if (user?.department) {
            fetchStats();
        }

        return unsubscribe;
    }, [navigation, user]);

    const fetchStats = async () => {
        if (!user?.department) return;
        try {
            const response = await api.get(`/admin/hod-stats/${user.department}`);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching HOD stats:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    const gridItems = [
        { id: '1', title: 'Generator', icon: <Calendar size={24} color="#800000" />, route: 'TimeTableGenerator', bg: '#ffe4e6' },
        { id: '1b', title: 'My Schedule', icon: <BookOpen size={24} color="#800000" />, route: 'StaffTimetable', bg: '#fee2e2' },
        { id: '1c', title: 'View All', icon: <Search size={24} color="#06b6d4" />, route: 'TimetableViewer', bg: '#cffafe' },
        { id: '1d', title: 'Attendance', icon: <ClipboardList size={24} color="#059669" />, route: 'StaffAttendance', bg: '#d1fae5' },
        { id: '1e', title: 'CIA Marks', icon: <Hash size={24} color="#f59e0b" />, route: 'StaffCIAMarks', bg: '#ffedd5' },
        { id: '2', title: 'Staff', icon: <Users size={24} color="#ec4899" />, route: 'StaffManagement', bg: '#fdf2f8', params: { departmentFilter: user?.department }, subtitle: `${stats.staff} Members` },
        { id: '3', title: 'Students', icon: <GraduationCap size={24} color="#6366f1" />, action: 'openYears', bg: '#e0e7ff', subtitle: `${stats.students} Students` },
        { id: '4', title: 'Subjects', icon: <BookOpen size={24} color="#10b981" />, route: 'SubjectManagement', bg: '#d1fae5', params: { departmentFilter: user?.department }, subtitle: `${stats.courses} Subjects` },

        { id: '6', title: 'Notice', icon: <Megaphone size={24} color="#06b6d4" />, route: 'Announcements', bg: '#cffafe' },
        { id: 'hod-leave', title: 'Approvals', icon: <ClipboardList size={24} color="#800000" />, route: 'HODRequests', bg: '#fee2e2' },
        { id: 'complaints', title: 'Complaints', icon: <MessageSquare size={24} color="#ef4444" />, route: 'ComplaintViewer', bg: '#fee2e2' },
        { id: 'bulk-leave', title: 'Bulk Leave', icon: <Calendar size={24} color="#db2777" />, route: 'BulkLeaveManagement', bg: '#fdf2f8' },
        { id: '7', title: 'Department', icon: <Building2 size={24} color="#8b5cf6" />, action: 'openYears', bg: '#f5f3ff' },
    ];

    const handleNavigation = (item) => {
        if (item.action === 'openYears') {
            setYearModalVisible(true);
        } else {
            navigation.navigate(item.route, {
                title: item.title,
                ...item.params
            });
        }
    };

    const handleYearSelection = (year) => {
        setYearModalVisible(false);
        navigation.navigate('StudentManagement', {
            departmentFilter: user?.department,
            yearFilter: year
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.headerContainer}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                        <Menu size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Announcements')}
                            style={styles.iconButton}
                        >
                            <Bell size={24} color="#fff" />
                            <View style={styles.badge} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.username}>{user?.name || 'Head of Department'}</Text>
                    <View style={styles.deptRow}>
                        <View style={styles.deptBadge}>
                            <Building2 size={18} color="#fff" />
                            <Text style={styles.deptBadgeText}>{user?.department} Department</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.viewBioBtn}
                            onPress={() => setBioModalVisible(true)}
                        >
                            <Text style={styles.viewBioText}>View Details</Text>
                            <ChevronRight size={14} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats for HOD */}
                <View style={styles.floatingStatsContainer}>
                    <View style={[styles.statBox, styles.statBorder]}>
                        <View style={styles.statIconWrapper}>
                            <GraduationCap size={20} color="#800000" />
                        </View>
                        <Text style={styles.statValue}>{stats.students}</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                    <View style={[styles.statBox]}>
                        <View style={styles.statIconWrapper}>
                            <Users size={20} color="#800000" />
                        </View>
                        <Text style={styles.statValue}>{stats.staff}</Text>
                        <Text style={styles.statLabel}>Staff</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />
                }
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Department Management</Text>
                </View>

                <View style={styles.gridContainer}>
                    {gridItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => handleNavigation(item)} activeOpacity={0.7}>
                            <View style={[styles.iconWrapper, { backgroundColor: item.bg }]}>{item.icon}</View>
                            <Text style={styles.gridLabel}>{item.title}</Text>
                            {/* Proactively display counts on grid items if enabled */}
                            {item.subtitle && (
                                <Text style={styles.gridSubtitle}>{item.subtitle}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Year Selection Modal */}
            <Modal
                visible={yearModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setYearModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setYearModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Select Year</Text>
                                <Text style={styles.modalSubtitle}>{user?.department} Department</Text>
                            </View>
                            <TouchableOpacity onPress={() => setYearModalVisible(false)} style={styles.closeButton}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.yearList}>
                            {['1', '2', '3', '4'].map((year) => {
                                const yearCount = stats.studentsByYear?.find(s => String(s._id) === String(year))?.count || 0;
                                return (
                                    <TouchableOpacity
                                        key={year}
                                        style={styles.yearItem}
                                        onPress={() => handleYearSelection(year)}
                                    >
                                        <View style={styles.yearInfo}>
                                            <View style={styles.yearIconWrapper}>
                                                <Calendar size={20} color="#800000" />
                                            </View>
                                            <View>
                                                <Text style={styles.yearText}>
                                                    {year === '1' ? '1st' : year === '2' ? '2nd' : year === '3' ? '3rd' : '4th'} Year
                                                </Text>
                                                <Text style={styles.studentCountText}>{yearCount} Students</Text>
                                            </View>
                                        </View>
                                        <ChevronRight size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Bio Data Modal */}
            <Modal
                visible={bioModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setBioModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.bioModalContent}>
                        <View style={styles.bioHeader}>
                            <View style={styles.bioAvatar}>
                                <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setBioModalVisible(false)} style={styles.closeBioBtn}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.bioName}>{user?.name}</Text>
                        <Text style={styles.bioRole}>Head of Department</Text>

                        <View style={styles.bioInfoSection}>
                            <View style={styles.bioItem}>
                                <User size={20} color="#800000" style={styles.bioIcon} />
                                <View>
                                    <Text style={styles.bioLabel}>User ID</Text>
                                    <Text style={styles.bioValue}>{user?.userId}</Text>
                                </View>
                            </View>

                            <View style={styles.bioItem}>
                                <Mail size={20} color="#800000" style={styles.bioIcon} />
                                <View>
                                    <Text style={styles.bioLabel}>Email Address</Text>
                                    <Text style={styles.bioValue}>{user?.email}</Text>
                                </View>
                            </View>

                            <View style={styles.bioItem}>
                                <Phone size={20} color="#800000" style={styles.bioIcon} />
                                <View>
                                    <Text style={styles.bioLabel}>Contact Number</Text>
                                    <Text style={styles.bioValue}>{user?.mobileNo || 'Not provided'}</Text>
                                </View>
                            </View>

                            <View style={styles.bioItem}>
                                <Briefcase size={20} color="#800000" style={styles.bioIcon} />
                                <View>
                                    <Text style={styles.bioLabel}>Department</Text>
                                    <Text style={styles.bioValue}>{user?.department}</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeProfileBtn}
                            onPress={() => setBioModalVisible(false)}
                        >
                            <Text style={styles.closeProfileText}>Close Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerContainer: {
        zIndex: 100,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 80,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    menuButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ef4444',
        borderWidth: 2,
        borderColor: '#5a0000',
    },
    headerContent: {
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    username: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    floatingStatsContainer: {
        position: 'absolute',
        bottom: -40,
        left: 24,
        right: 24,
        backgroundColor: '#fff',
        borderRadius: 24,
        flexDirection: 'row',
        padding: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
    },
    statIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    scrollContent: {
        flex: 1,
        marginTop: 50,
        paddingHorizontal: 24,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    gridItem: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    gridLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
        textAlign: 'center',
    },
    gridSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: '100%',
        padding: 24,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
        fontWeight: '500',
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
    },
    yearList: {
        gap: 12,
    },
    yearItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    yearInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    yearIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    yearText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    studentCountText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 2
    },
    // New Styles for Department prominence and Bio Modal
    deptRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    deptBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    deptBadgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    viewBioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
    },
    viewBioText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    bioModalContent: {
        backgroundColor: '#fff',
        borderRadius: 32,
        width: '100%',
        padding: 24,
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
    },
    bioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    bioAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        elevation: 8,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#800000',
    },
    closeBioBtn: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 14,
    },
    bioName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        textAlign: 'center',
    },
    bioRole: {
        fontSize: 14,
        color: '#800000',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 24,
    },
    bioInfoSection: {
        gap: 16,
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    bioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    bioIcon: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    bioLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    bioValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    closeProfileBtn: {
        backgroundColor: '#800000',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    closeProfileText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default HODDashboard;
