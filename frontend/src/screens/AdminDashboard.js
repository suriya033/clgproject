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
    Image
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
    Trophy,
    Bed,
    Bus,
    ClipboardList,
    Briefcase,
    Utensils,
    Menu,
    Bell,
    LogOut,
    BookOpen,
    Calendar
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';
import AnimateOnScroll from '../components/AnimateOnScroll';

const AdminDashboard = ({ navigation }) => {
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
        { id: '4', title: 'Student', icon: <GraduationCap size={24} color="#6366f1" />, route: 'StudentManagement', bg: '#ffe4e6' },
        { id: '5', title: 'Staff', icon: <Users size={24} color="#ec4899" />, route: 'StaffManagement', bg: '#fdf2f8' },
        { id: '6', title: 'HOD', icon: <UserCog size={24} color="#8b5cf6" />, route: 'HODManagement', bg: '#f5f3ff' },
        { id: '7', title: 'Library', icon: <Library size={24} color="#f43f5e" />, route: 'LibraryManagement', bg: '#fff1f2' },
        { id: '8', title: 'Sports', icon: <Trophy size={24} color="#d946ef" />, route: 'Sports', bg: '#fdf4ff' },
        { id: '9', title: 'Hostel', icon: <Bed size={24} color="#06b6d4" />, route: 'Hostel', bg: '#ecfeff' },
        { id: '10', title: 'Transport', icon: <Bus size={24} color="#f97316" />, route: 'Transport', bg: '#fff7ed' },
        { id: '11', title: 'Exam Cell', icon: <ClipboardList size={24} color="#14b8a6" />, route: 'ExamCell', bg: '#f0fdfa' },
        { id: '12', title: 'Placements', icon: <Briefcase size={24} color="#64748b" />, route: 'Placements', bg: '#f8fafc' },
        { id: '13', title: 'Department', icon: <Building size={24} color="#8b5cf6" />, route: 'DepartmentManagement', bg: '#f5f3ff' },
        { id: '14', title: 'Subjects', icon: <BookOpen size={24} color="#f97316" />, route: 'SubjectManagement', bg: '#fff7ed' },

        { id: '15', title: 'Office Incharge', icon: <UserCog size={24} color="#f59e0b" />, route: 'OfficeManagement', bg: '#fffbeb' },
        { id: '16', title: 'Classes', icon: <BookOpen size={24} color="#0284c7" />, route: 'ClassManagement', bg: '#e0f2fe' },
        { id: '17', title: 'Start AI Gen', icon: <Calendar size={24} color="#800000" />, route: 'TimeTableGenerator', bg: '#ffe4e6' },
    ];

    const stats = [
        { label: 'Students', value: statsData.students.toString(), icon: <GraduationCap size={16} color="#fff" /> },
        { label: 'Staff', value: statsData.staff.toString(), icon: <Users size={16} color="#fff" /> },
        { label: 'Depts', value: statsData.departments.toString(), icon: <Building size={16} color="#fff" /> },
    ];

    const handleNavigation = (item) => {
        navigation.navigate(item.route, { title: item.title });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
            >
                <LinearGradient
                    colors={['#800000', '#5a0000']}
                    style={styles.headerContainer}
                >
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.toggleDrawer?.()}>
                            <Menu size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Bell size={24} color="#fff" />
                                <View style={styles.badge} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.iconButton, { marginLeft: 12 }]} onPress={logout}>
                                <LogOut size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.headerContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={{
                                    width: 70,
                                    height: 70,
                                    marginRight: 15,
                                    borderRadius: 35,
                                    borderWidth: 2,
                                    borderColor: '#fff',
                                    resizeMode: 'cover'
                                }}
                            />
                            <Text style={styles.username}>{user?.name || 'Administrator'}</Text>
                        </View>
                        <Text style={styles.subtitle}>College Management Portal</Text>
                    </View>

                    <AnimateOnScroll delay={100}>
                        <View style={styles.statsGrid}>
                            {loading ? (
                                <ActivityIndicator color="#fff" style={{ flex: 1 }} />
                            ) : (
                                stats.map((stat, index) => (
                                    <View key={index} style={styles.statBox}>
                                        <View style={styles.statHeader}>
                                            {stat.icon}
                                            <Text style={styles.statValue}>{stat.value}</Text>
                                        </View>
                                        <Text style={styles.statLabel}>{stat.label}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </AnimateOnScroll>
                </LinearGradient>

                <View style={styles.scrollContent}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Management</Text>
                    </View>

                    <View style={styles.gridContainer}>
                        {gridItems.map((item, index) => (
                            <AnimateOnScroll key={item.id} delay={index * 50} style={{ width: '31%' }}>
                                <TouchableOpacity style={[styles.gridItem, { width: '100%' }]} onPress={() => handleNavigation(item)} activeOpacity={0.7}>
                                    <View style={[styles.iconWrapper, { backgroundColor: item.bg }]}>{item.icon}</View>
                                    <Text style={styles.gridLabel}>{item.title}</Text>
                                </TouchableOpacity>
                            </AnimateOnScroll>
                        ))}
                    </View>

                    <View style={styles.quickActionsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>
                            <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                            <TouchableOpacity style={[styles.actionCard]} activeOpacity={0.9}>
                                <LinearGradient colors={['#800000', '#a52a2a']} style={styles.actionGradient}>
                                    <Bus size={28} color="#fff" />
                                    <Text style={styles.actionLabel}>Track Bus</Text>
                                    <Text style={styles.actionSub}>Real-time location</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionCard]} activeOpacity={0.9}>
                                <LinearGradient colors={['#f43f5e', '#fb7185']} style={styles.actionGradient}>
                                    <Utensils size={28} color="#fff" />
                                    <Text style={styles.actionLabel}>Cafeteria</Text>
                                    <Text style={styles.actionSub}>Today's menu</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionCard]} activeOpacity={0.9}>
                                <LinearGradient colors={['#6366f1', '#818cf8']} style={styles.actionGradient}>
                                    <UserCog size={28} color="#fff" />
                                    <Text style={styles.actionLabel}>Security</Text>
                                    <Text style={styles.actionSub}>Access logs</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: {
        paddingTop: (Platform?.OS === 'android') ? 40 : 20,
        paddingBottom: 35,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        elevation: 15,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    menuButton: { padding: 10, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { padding: 10, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    badge: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#800000' },
    headerContent: { marginBottom: 25 },
    welcomeText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    username: { fontSize: 25, color: '#fff', fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 28,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)'
    },
    statBox: {
        width: '23%',
        alignItems: 'center',
        paddingVertical: 12,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
        marginLeft: 6,
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center'
    },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 25 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
    seeAll: { fontSize: 14, color: '#800000', fontWeight: '700' },

    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: {
        width: '31%',
        backgroundColor: '#fff',
        borderRadius: 28,
        paddingVertical: 24,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    iconWrapper: { width: 60, height: 60, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    gridLabel: { fontSize: 13, fontWeight: '700', color: '#334155', textAlign: 'center', lineHeight: 18 },

    quickActionsSection: { marginTop: 25, marginBottom: 20 },
    horizontalScroll: { paddingRight: 20 },
    actionCard: {
        width: 160,
        height: 79,
        marginRight: 16,
        borderRadius: 30,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
    },
    actionGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-end',
    },
    actionLabel: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginTop: 12,
        letterSpacing: -0.5,
    },
    actionSub: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});

export default AdminDashboard;
