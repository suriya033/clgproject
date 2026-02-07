import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    Platform
} from 'react-native';
import {
    Bus,
    Utensils,
    Settings,
    FileText,
    BookOpen,
    MessageSquare,
    LogOut,
    ChevronRight,
    User,
    Heart,
    Home
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const Sidebar = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);

    const getHomeRoute = (role) => {
        switch (role) {
            case 'Admin': return 'AdminDashboard';
            case 'Student': return 'StudentDashboard';
            case 'Staff': return 'StaffDashboard';
            case 'HOD': return 'HODDashboard';
            case 'Transport': return 'TransportDashboard';
            case 'Library': return 'LibraryDashboard';
            case 'Office': return 'OfficeDashboard';
            case 'Driver': return 'DriverDashboard';
            default: return 'DefaultDashboard';
        }
    };

    const menuItems = [
        { id: '0', title: 'Home', icon: <Home size={22} color="#800000" />, route: getHomeRoute(user?.role) },
        { id: '1', title: 'Bus Track', icon: <Bus size={22} color="#800000" />, route: 'Transport' },
        { id: '2', title: 'Food Availability', icon: <Utensils size={22} color="#800000" />, route: 'GenericDashboard', params: { title: 'Cafeteria' } },
        { id: '3', title: 'Notes', icon: <FileText size={22} color="#800000" />, route: 'GenericDashboard', params: { title: 'Notes' } },
        { id: '4', title: 'Question Papers', icon: <BookOpen size={22} color="#800000" />, route: 'GenericDashboard', params: { title: 'Exam Papers' } },
        { id: '5', title: 'App Feedback', icon: <MessageSquare size={22} color="#800000" />, route: 'GenericDashboard', params: { title: 'Feedback' } },
        { id: '6', title: 'Settings', icon: <Settings size={22} color="#800000" />, route: 'GenericDashboard', params: { title: 'Settings' } },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.drawerHeader}
            >
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        {user?.photo ? (
                            <Image source={{ uri: user.photo }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={styles.onlineBadge} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
                        <Text style={styles.userRole}>{user?.role} • {user?.department || 'General'}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Main Menu</Text>
                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.menuItem}
                        onPress={() => {
                            navigation.closeDrawer();
                            navigation.navigate(item.route, item.params);
                        }}
                    >
                        <View style={styles.iconWrapper}>{item.icon}</View>
                        <Text style={styles.menuLabel}>{item.title}</Text>
                        <ChevronRight size={16} color="#cbd5e1" />
                    </TouchableOpacity>
                ))}

                <View style={styles.divider} />

                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutItem]}
                    onPress={() => {
                        navigation.closeDrawer();
                        logout();
                    }}
                >
                    <View style={[styles.iconWrapper, { backgroundColor: '#fee2e2' }]}>
                        <LogOut size={22} color="#ef4444" />
                    </View>
                    <Text style={[styles.menuLabel, { color: '#ef4444' }]}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Version 2.4.0</Text>
                <View style={styles.madeWith}>
                    <Text style={styles.madeWithText}>Made with </Text>
                    <Heart size={12} color="#ef4444" fill="#ef4444" />
                    <Text style={styles.madeWithText}> for Students</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    drawerHeader: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        borderBottomRightRadius: 30,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#800000',
    },
    userInfo: {
        marginLeft: 15,
        flex: 1,
    },
    userName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userRole: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 2,
    },
    menuContainer: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
        marginTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 5,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: '#334155',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 20,
    },
    logoutItem: {
        marginTop: 10,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    madeWith: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    madeWithText: {
        fontSize: 10,
        color: '#cbd5e1',
    }
});

export default Sidebar;
