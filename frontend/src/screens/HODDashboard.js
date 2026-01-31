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
    ClipboardList
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HODDashboard = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const gridItems = [
        { id: '1', title: 'Time Table', icon: <Calendar size={24} color="#800000" />, route: 'TimeTableGenerator', bg: '#ffe4e6' },
        { id: '2', title: 'Staff', icon: <Users size={24} color="#ec4899" />, route: 'StaffManagement', bg: '#fdf2f8' },
        { id: '3', title: 'Students', icon: <GraduationCap size={24} color="#6366f1" />, route: 'StudentManagement', bg: '#e0e7ff' },
        { id: '4', title: 'Subjects', icon: <BookOpen size={24} color="#10b981" />, route: 'SubjectManagement', bg: '#d1fae5' },
        { id: '5', title: 'Classes', icon: <LayoutDashboard size={24} color="#f59e0b" />, route: 'ClassManagement', bg: '#ffedd5' },
        { id: '6', title: 'Notice', icon: <Megaphone size={24} color="#06b6d4" />, route: 'Announcements', bg: '#cffafe' },
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
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.username}>{user?.name || 'Head of Department'}</Text>
                    <Text style={styles.subtitle}>{user?.department} Department</Text>
                </View>

                {/* Quick Stats for HOD */}
                <View style={styles.floatingStatsContainer}>
                    <View style={[styles.statBox, styles.statBorder]}>
                        <View style={styles.statIconWrapper}>
                            <GraduationCap size={20} color="#800000" />
                        </View>
                        <Text style={styles.statValue}>--</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                    <View style={[styles.statBox]}>
                        <View style={styles.statIconWrapper}>
                            <Users size={20} color="#800000" />
                        </View>
                        <Text style={styles.statValue}>--</Text>
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
                        </TouchableOpacity>
                    ))}
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
});

export default HODDashboard;
