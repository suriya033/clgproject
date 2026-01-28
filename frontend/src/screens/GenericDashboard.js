import React, { useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Info, Bell, Settings, Users, ArrowLeft } from 'lucide-react-native';

const GenericDashboard = ({ navigation, route }) => {
    const { user, logout } = useContext(AuthContext);
    const title = route?.params?.title || user?.role || 'User';

    const handleManageUsers = () => {
        let roleFilter = title;
        if (title === 'Placements') roleFilter = 'Placement';
        if (title === 'Exam Cell') roleFilter = 'ExamCell';
        navigation.navigate('UserManagement', { roleFilter });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />

            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {user?.role === 'Admin' && (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                                <ArrowLeft size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <View>
                            <Text style={styles.welcomeText}>{title} Portal</Text>
                            <Text style={styles.userName}>{user?.name}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {user?.role === 'Admin' && (
                            <TouchableOpacity onPress={handleManageUsers} style={[styles.logoutButton, { marginRight: 10 }]}>
                                <Users size={22} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                            <LogOut size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.infoBox}>
                    <View style={styles.infoIconWrapper}>
                        <Info size={24} color="#800000" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Welcome!</Text>
                        <Text style={styles.infoText}>
                            The {title} module is currently being optimized for your experience.
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Quick Links</Text>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Announcements')}
                >
                    <View style={[styles.menuIconWrapper, { backgroundColor: '#ffe4e6' }]}>
                        <Bell size={24} color="#800000" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuText}>Announcements</Text>
                        <Text style={styles.menuSub}>View and manage notices</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIconWrapper, { backgroundColor: '#f8fafc' }]}>
                        <Settings size={24} color="#64748b" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuText}>Profile Settings</Text>
                        <Text style={styles.menuSub}>Manage your account</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: {
        backgroundColor: '#800000',
        paddingTop: Platform.select({ android: 40, ios: 20, default: 20 }),
        paddingBottom: 30,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 8,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    logoutButton: {
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: { padding: 24 },
    infoBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    infoIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTextContainer: { flex: 1 },
    infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
    infoText: { color: '#64748b', lineHeight: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    menuIconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuContent: { flex: 1 },
    menuText: { fontSize: 16, fontWeight: '700', color: '#334155' },
    menuSub: { fontSize: 13, color: '#64748b', marginTop: 2 }
});

export default GenericDashboard;
