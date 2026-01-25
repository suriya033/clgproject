import React, { useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Platform
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
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
    LogOut
} from 'lucide-react-native';

const AdminDashboard = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);

    const gridItems = [
        { id: '1', title: 'Notice', icon: <Megaphone size={24} color="#4361ee" />, route: 'Announcements', bg: '#eef2ff' },
        { id: '2', title: 'Fee', icon: <Banknote size={24} color="#f59e0b" />, route: 'Fees', bg: '#fffbeb' },
        { id: '3', title: 'Office', icon: <Building size={24} color="#10b981" />, route: 'CollegeManagement', bg: '#f0fdf4' },
        { id: '4', title: 'Student', icon: <GraduationCap size={24} color="#6366f1" />, route: 'StudentManagement', bg: '#eef2ff' },
        { id: '5', title: 'Staff', icon: <Users size={24} color="#ec4899" />, route: 'StaffManagement', bg: '#fdf2f8' },
        { id: '6', title: 'HOD', icon: <UserCog size={24} color="#8b5cf6" />, route: 'HODManagement', bg: '#f5f3ff' },
        { id: '7', title: 'Library', icon: <Library size={24} color="#f43f5e" />, route: 'LibraryManagement', bg: '#fff1f2' },
        { id: '8', title: 'Sports', icon: <Trophy size={24} color="#d946ef" />, route: 'Sports', bg: '#fdf4ff' },
        { id: '9', title: 'Hostel', icon: <Bed size={24} color="#06b6d4" />, route: 'Hostel', bg: '#ecfeff' },
        { id: '10', title: 'Transport', icon: <Bus size={24} color="#f97316" />, route: 'Transport', bg: '#fff7ed' },
        { id: '11', title: 'Exam Cell', icon: <ClipboardList size={24} color="#14b8a6" />, route: 'ExamCell', bg: '#f0fdfa' },
        { id: '12', title: 'Placements', icon: <Briefcase size={24} color="#64748b" />, route: 'Placements', bg: '#f8fafc' },
    ];

    const bottomItems = [
        { id: '13', title: 'Track Bus', icon: <Bus size={22} color="#fff" />, route: 'TrackBus', color: '#4361ee' },
        { id: '14', title: 'Food', icon: <Utensils size={22} color="#fff" />, route: 'Food', color: '#f43f5e' },
    ];

    const handleNavigation = (item) => {
        navigation.navigate(item.route);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4361ee" />
            <View style={styles.headerContainer}>
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
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.gridContainer}>
                    {gridItems.map(item => (
                        <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => handleNavigation(item)} activeOpacity={0.8}>
                            <View style={[styles.iconWrapper, { backgroundColor: item.bg }]}>{item.icon}</View>
                            <Text style={styles.gridLabel}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.bottomRow}>
                    {bottomItems.map(item => (
                        <TouchableOpacity key={item.id} style={[styles.bottomCard, { backgroundColor: item.color }]} onPress={() => handleNavigation(item)} activeOpacity={0.9}>
                            <View style={styles.bottomIconWrapper}>{item.icon}</View>
                            <Text style={styles.bottomLabel}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: { backgroundColor: '#4361ee', paddingTop: (Platform?.OS === 'android') ? 40 : 20, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 8, shadowColor: '#4361ee', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, marginBottom: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    menuButton: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative' },
    badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#4361ee' },
    headerContent: { paddingLeft: 4 },
    username: { fontSize: 28, color: '#fff', fontWeight: '800', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginTop: 2 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '31%', backgroundColor: '#fff', borderRadius: 24, paddingVertical: 20, alignItems: 'center', marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    iconWrapper: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    gridLabel: { fontSize: 13, fontWeight: '700', color: '#334155', textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginTop: 10, marginBottom: 16, marginLeft: 4 },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
    bottomCard: { width: '48%', borderRadius: 24, paddingVertical: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
    bottomIconWrapper: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    bottomLabel: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

export default AdminDashboard;
