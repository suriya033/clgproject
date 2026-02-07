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
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import {
    Megaphone,
    Banknote,
    Building,
    GraduationCap,
    Users,
    UserCog,
    Library,
    Bus,
    Menu,
    Bell,
    LogOut,
    LayoutDashboard,
    Trophy,
    Bed,
    ClipboardList,
    Briefcase,
    BookOpen,
    Calendar
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const OfficeDashboard = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [statsData, setStatsData] = useState({
        students: 0,
        staff: 0,
        departments: 0,
        courses: 0,
        libraryItems: 0,
        buses: 0,
        notices: 0,
        pendingFees: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStatsData(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const gridItems = [
        { id: '1', title: 'Notice', icon: <Megaphone size={24} color="#800000" />, route: 'Announcements', bg: '#ffe4e6' },
        { id: '2', title: 'Fee', icon: <Banknote size={24} color="#f59e0b" />, route: 'Fees', bg: '#fffbeb' },
        { id: '3', title: 'Student', icon: <GraduationCap size={24} color="#6366f1" />, route: 'StudentManagement', bg: '#ffe4e6' },
        { id: '4', title: 'Staff', icon: <Users size={24} color="#ec4899" />, route: 'StaffManagement', bg: '#fdf2f8' },
        { id: '5', title: 'HOD', icon: <UserCog size={24} color="#8b5cf6" />, route: 'HODManagement', bg: '#f5f3ff' },
        { id: '6', title: 'Library', icon: <Library size={24} color="#f43f5e" />, route: 'LibraryManagement', bg: '#fff1f2' },
        { id: '7', title: 'Transport', icon: <Bus size={24} color="#f97316" />, route: 'Transport', bg: '#fff7ed' },
        { id: '8', title: 'Department', icon: <Building size={24} color="#8b5cf6" />, route: 'DepartmentManagement', bg: '#f5f3ff' },
        { id: '9', title: 'Course', icon: <BookOpen size={24} color="#10b981" />, route: 'CourseManagement', bg: '#f0fdf4' },
        { id: '10', title: 'Sports', icon: <Trophy size={24} color="#d946ef" />, route: 'Sports', bg: '#fdf4ff' },
        { id: '11', title: 'Hostel', icon: <Bed size={24} color="#06b6d4" />, route: 'Hostel', bg: '#ecfeff' },
        { id: '12', title: 'Exam Cell', icon: <ClipboardList size={24} color="#14b8a6" />, route: 'ExamCell', bg: '#f0fdfa' },
        { id: '13', title: 'Placements', icon: <Briefcase size={24} color="#64748b" />, route: 'Placements', bg: '#f8fafc' },
        { id: '14', title: 'Start AI Gen', icon: <Calendar size={24} color="#800000" />, route: 'TimeTableGenerator', bg: '#ffe4e6' },
        { id: '15', title: 'View Timetable', icon: <BookOpen size={24} color="#0284c7" />, route: 'TimetableViewer', bg: '#e0f2fe' },
    ];

    const handleNavigation = (item) => {
        navigation.navigate(item.route, { title: item.title });
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
                        <TouchableOpacity style={styles.iconButton}>
                            <Bell size={24} color="#fff" />
                            <View style={styles.badge} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.username}>{user?.name || 'Office Incharge'}</Text>
                    <Text style={styles.subtitle}>Office Administration Dashboard</Text>
                </View>

                <View style={styles.floatingStatsContainer}>
                    <View style={[styles.statBox, styles.statBorder]}>
                        <View style={styles.statIconWrapper}>
                            <Users size={20} color="#800000" />
                        </View>
                        <Text style={styles.statValue}>{statsData.students}</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                    <View style={[styles.statBox, styles.statBorder]}>
                        <View style={styles.statIconWrapper}>
                            <Users size={20} color="#800000" />
                        </View>
                        <Text style={styles.statValue}>{statsData.staff}</Text>
                        <Text style={styles.statLabel}>Staff</Text>
                    </View>
                    <View style={[styles.statBox, styles.statBorder]}>
                        <View style={styles.statIconWrapper}>
                            <Building size={20} color="#800000" />
                        </View>
                        <Text style={styles.statValue}>{statsData.departments}</Text>
                        <Text style={styles.statLabel}>Depts</Text>
                    </View>
                    <View style={styles.statBox}>
                        <View style={styles.statIconWrapper}>
                            <Banknote size={20} color="#800000" />
                        </View>
                        <Text style={styles.statValue}>{statsData.pendingFees}</Text>
                        <Text style={styles.statLabel}>Fees</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Management Services</Text>
                </View>

                <View style={styles.gridContainer}>
                    {gridItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => handleNavigation(item)} activeOpacity={0.7}>
                            <View style={[styles.iconWrapper, { backgroundColor: item.bg }]}>{item.icon}</View>
                            <Text style={styles.gridLabel}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.bottomRow}>
                        <TouchableOpacity
                            style={[styles.bottomCard, { backgroundColor: '#800000' }]}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('Fees')}
                        >
                            <View style={styles.bottomIconWrapper}>
                                <Banknote size={24} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.bottomLabel}>Collect Fees</Text>
                                <Text style={styles.bottomSubLabel}>Process Payments</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.bottomCard, { backgroundColor: '#0f172a' }]}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('Announcements')}
                        >
                            <View style={styles.bottomIconWrapper}>
                                <Megaphone size={24} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.bottomLabel}>Post Notice</Text>
                                <Text style={styles.bottomSubLabel}>Send Updates</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerContainer: {
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
        width: '31%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    gridLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
    },
    quickActionsSection: {
        marginBottom: 30,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    bottomCard: {
        width: '48%',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bottomIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bottomLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    bottomSubLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
});

export default OfficeDashboard;
