import React, { useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Info, Bell, Settings } from 'lucide-react-native';

const GenericDashboard = ({ route }) => {
    const { user, logout } = useContext(AuthContext);
    const roleName = user?.role || 'User';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4361ee" />

            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.welcomeText}>{roleName} Portal</Text>
                        <Text style={styles.userName}>{user?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <LogOut size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.infoBox}>
                    <View style={styles.infoIconWrapper}>
                        <Info size={24} color="#4361ee" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Welcome!</Text>
                        <Text style={styles.infoText}>
                            The {roleName} module is currently being optimized for your experience.
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Quick Links</Text>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIconWrapper, { backgroundColor: '#eef2ff' }]}>
                        <Bell size={24} color="#4361ee" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Text style={styles.menuSub}>View your recent alerts</Text>
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
        backgroundColor: '#4361ee',
        paddingTop: (Platform?.OS === 'android') ? 40 : 20,
        paddingBottom: 30,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 8,
        shadowColor: '#4361ee',
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
        backgroundColor: '#eef2ff',
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
