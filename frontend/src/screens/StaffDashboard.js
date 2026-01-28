import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Platform, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { LogOut, Users, FileText, CheckSquare, Bell, Calendar, Megaphone } from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';

const StaffDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/college/announcements');
            setAnnouncements(res.data);
        } catch (error) {
            console.error('Error fetching announcements', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { id: '1', title: 'Classes Today', value: '4', icon: <Calendar size={24} color="#800000" />, sub: 'Next: 10:00 AM', bg: '#ffe4e6' },
        { id: '2', title: 'Total Students', value: '120', icon: <Users size={24} color="#f72585" />, sub: 'Across 3 sections', bg: '#fdf2f8' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.headerContainer}
            >
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.welcomeText}>Staff Portal</Text>
                        <Text style={styles.userName}>{user?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <LogOut size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerStats}>
                    <View style={styles.headerStatItem}>
                        <Text style={styles.headerStatLabel}>Department</Text>
                        <Text style={styles.headerStatValue}>{user?.department || 'General'}</Text>
                    </View>
                    <View style={styles.headerStatDivider} />
                    <View style={styles.headerStatItem}>
                        <Text style={styles.headerStatLabel}>Role</Text>
                        <Text style={styles.headerStatValue}>{user?.role || 'Staff'}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {stats.map(stat => (
                        <View key={stat.id} style={styles.card}>
                            <View style={[styles.cardIconWrapper, { backgroundColor: stat.bg }]}>
                                {stat.icon}
                            </View>
                            <Text style={styles.cardValue}>{String(stat.value)}</Text>
                            <Text style={styles.cardTitle}>{stat.title}</Text>
                            <Text style={styles.cardSub}>{stat.sub}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Announcements</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator animating={true} color="#800000" style={{ marginVertical: 20 }} />
                ) : (
                    <View style={styles.announceContainer}>
                        {announcements && announcements.length > 0 ? announcements.map(item => (
                            <View key={item._id} style={styles.announceItem}>
                                <View style={styles.announceHeader}>
                                    <View style={styles.bellIconWrapper}>
                                        <Bell size={16} color="#800000" />
                                    </View>
                                    <View style={styles.announceHeaderText}>
                                        <Text style={styles.announceTitle}>{item.title}</Text>
                                        <Text style={styles.announceDate}>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.announceContent} numberOfLines={3}>{item.content}</Text>
                                {item.attachmentUrl && item.attachmentType === 'image' && (
                                    <Image source={{ uri: item.attachmentUrl }} style={styles.announceImage} />
                                )}
                            </View>
                        )) : (
                            <View style={styles.noDataContainer}>
                                <Megaphone size={40} color="#cbd5e1" />
                                <Text style={styles.noData}>No new announcements</Text>
                            </View>
                        )}
                    </View>
                )}

                <Text style={styles.sectionTitle}>Management</Text>
                <View style={styles.menuList}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconWrapper, { backgroundColor: '#ffe4e6' }]}>
                            <Users size={24} color="#800000" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuText}>Mark Attendance</Text>
                            <Text style={styles.menuSub}>Daily student attendance</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconWrapper, { backgroundColor: '#f0fdf4' }]}>
                            <FileText size={24} color="#22c55e" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuText}>Upload Notes</Text>
                            <Text style={styles.menuSub}>Share study materials</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconWrapper, { backgroundColor: '#fff7ed' }]}>
                            <CheckSquare size={24} color="#f97316" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuText}>Internal Marks</Text>
                            <Text style={styles.menuSub}>Manage student grades</Text>
                        </View>
                    </TouchableOpacity>
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
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        elevation: 10,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeText: { fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
    userName: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    logoutButton: {
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    headerStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 4,
        fontWeight: '600',
    },
    headerStatValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    content: { padding: 24, paddingBottom: 40 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
    card: {
        width: '47%',
        padding: 22,
        backgroundColor: '#fff',
        borderRadius: 28,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    cardIconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardValue: { fontSize: 26, fontWeight: '900', color: '#1e293b' },
    cardTitle: { fontSize: 14, color: '#64748b', marginTop: 6, fontWeight: '600' },
    cardSub: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: '500' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    seeAll: { fontSize: 14, color: '#800000', fontWeight: '700' },

    announceContainer: {
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 20,
        marginBottom: 28,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    announceItem: { marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 20 },
    announceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    bellIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    announceHeaderText: { flex: 1 },
    announceTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
    announceDate: { fontSize: 12, color: '#94a3b8', marginTop: 2, fontWeight: '500' },
    announceContent: { fontSize: 14, color: '#475569', lineHeight: 22 },
    announceImage: { width: '100%', height: 150, borderRadius: 16, marginTop: 15 },
    noDataContainer: { alignItems: 'center', padding: 30 },
    noData: { textAlign: 'center', color: '#94a3b8', marginTop: 12, fontWeight: '500' },

    menuList: { gap: 15 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 28,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    menuIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
    },
    menuContent: { flex: 1 },
    menuText: { fontSize: 17, fontWeight: '800', color: '#334155' },
    menuSub: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: '500' }
});

export default StaffDashboard;
