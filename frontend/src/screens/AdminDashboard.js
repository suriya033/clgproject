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
    RefreshControl
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
    BookOpen
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';

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
        { id: '1', title: 'Notice', icon: <Megaphone size={24} color="#4361ee" />, route: 'Announcements', bg: '#eef2ff' },
        { id: '2', title: 'Fee', icon: <Banknote size={24} color="#f59e0b" />, route: 'Fees', bg: '#fffbeb' },
        { id: '4', title: 'Student', icon: <GraduationCap size={24} color="#6366f1" />, route: 'StudentManagement', bg: '#eef2ff' },
        { id: '5', title: 'Staff', icon: <Users size={24} color="#ec4899" />, route: 'StaffManagement', bg: '#fdf2f8' },
        { id: '6', title: 'HOD', icon: <UserCog size={24} color="#8b5cf6" />, route: 'HODManagement', bg: '#f5f3ff' },
        { id: '7', title: 'Library', icon: <Library size={24} color="#f43f5e" />, route: 'LibraryManagement', bg: '#fff1f2' },
        { id: '8', title: 'Sports', icon: <Trophy size={24} color="#d946ef" />, route: 'Sports', bg: '#fdf4ff' },
        { id: '9', title: 'Hostel', icon: <Bed size={24} color="#06b6d4" />, route: 'Hostel', bg: '#ecfeff' },
        { id: '10', title: 'Transport', icon: <Bus size={24} color="#f97316" />, route: 'Transport', bg: '#fff7ed' },
        { id: '11', title: 'Exam Cell', icon: <ClipboardList size={24} color="#14b8a6" />, route: 'ExamCell', bg: '#f0fdfa' },
        { id: '12', title: 'Placements', icon: <Briefcase size={24} color="#64748b" />, route: 'Placements', bg: '#f8fafc' },
        { id: '13', title: 'Department', icon: <Building size={24} color="#8b5cf6" />, route: 'DepartmentManagement', bg: '#f5f3ff' },

        { id: '15', title: 'Office Incharge', icon: <UserCog size={24} color="#f59e0b" />, route: 'OfficeManagement', bg: '#fffbeb' },
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
            <LinearGradient
                colors={['#4361ee', '#3f37c9']}
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
                    <Text style={styles.username}>{user?.name || 'Administrator'}</Text>
                    <Text style={styles.subtitle}>College Management Portal</Text>
                </View>

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
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Management</Text>

                </View>

                <View style={styles.gridContainer}>
                    {gridItems.map(item => (
                        <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => handleNavigation(item)} activeOpacity={0.7}>
                            <View style={[styles.iconWrapper, { backgroundColor: item.bg }]}>{item.icon}</View>
                            <Text style={styles.gridLabel}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.bottomRow}>
                        <TouchableOpacity style={[styles.bottomCard, { backgroundColor: '#4361ee' }]} activeOpacity={0.9}>
                            <View style={styles.bottomIconWrapper}><Bus size={22} color="#fff" /></View>
                            <Text style={styles.bottomLabel}>Track Bus</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.bottomCard, { backgroundColor: '#f43f5e' }]} activeOpacity={0.9}>
                            <View style={styles.bottomIconWrapper}><Utensils size={22} color="#fff" /></View>
                            <Text style={styles.bottomLabel}>Food Menu</Text>
                        </TouchableOpacity>
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
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    menuButton: { padding: 10, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { padding: 10, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    badge: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#4361ee' },
    headerContent: { marginBottom: 25 },
    welcomeText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    username: { fontSize: 32, color: '#fff', fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
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
    seeAll: { fontSize: 14, color: '#4361ee', fontWeight: '700' },

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

    quickActionsSection: { marginTop: 15 },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    bottomCard: {
        width: '48%',
        borderRadius: 28,
        paddingVertical: 22,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    bottomIconWrapper: { width: 46, height: 46, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    bottomLabel: { fontSize: 17, fontWeight: '800', color: '#fff' },
});

export default AdminDashboard;
