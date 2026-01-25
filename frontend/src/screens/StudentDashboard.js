import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Platform, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { LogOut, BookOpen, Calendar, Clock, Award, Bell, Megaphone } from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';

const StudentDashboard = () => {
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

    const cards = [
        { id: '1', title: 'Attendance', value: '85%', icon: <Clock size={24} color="#4361ee" />, sub: 'Good', bg: '#eef2ff' },
        { id: '2', title: 'GPA', value: '3.8', icon: <Award size={24} color="#f72585" />, sub: 'Excellent', bg: '#fdf2f8' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#4361ee', '#3f37c9']}
                style={styles.headerContainer}
            >
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.userName}>{user?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <LogOut size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerStats}>
                    <View style={styles.headerStatItem}>
                        <Text style={styles.headerStatLabel}>Branch</Text>
                        <Text style={styles.headerStatValue}>{user?.branch || 'Not Set'}</Text>
                    </View>
                    <View style={styles.headerStatDivider} />
                    <View style={styles.headerStatItem}>
                        <Text style={styles.headerStatLabel}>Year</Text>
                        <Text style={styles.headerStatValue}>{user?.year || 'Not Set'}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {cards.map(card => (
                        <View key={card.id} style={styles.card}>
                            <View style={[styles.cardIconWrapper, { backgroundColor: card.bg }]}>
                                {card.icon}
                            </View>
                            <Text style={styles.cardValue}>{String(card.value)}</Text>
                            <Text style={styles.cardTitle}>{card.title}</Text>
                            <Text style={styles.cardSub}>{card.sub}</Text>
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
                    <ActivityIndicator animating={true} color="#4361ee" style={{ marginVertical: 20 }} />
                ) : (
                    <View style={styles.announceContainer}>
                        {announcements && announcements.length > 0 ? announcements.map(item => (
                            <View key={item._id} style={styles.announceItem}>
                                <View style={styles.announceHeader}>
                                    <View style={styles.bellIconWrapper}>
                                        <Bell size={16} color="#4361ee" />
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

                <Text style={styles.sectionTitle}>Quick Access</Text>
                <View style={styles.menuGrid}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconWrapper, { backgroundColor: '#eef2ff' }]}>
                            <BookOpen size={24} color="#4361ee" />
                        </View>
                        <Text style={styles.menuText}>My Courses</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconWrapper, { backgroundColor: '#fff1f2' }]}>
                            <Calendar size={24} color="#f43f5e" />
                        </View>
                        <Text style={styles.menuText}>Timetable</Text>
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
        shadowColor: '#4361ee',
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
    cardSub: { fontSize: 12, color: '#10b981', fontWeight: '700', marginTop: 4 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    seeAll: { fontSize: 14, color: '#4361ee', fontWeight: '700' },

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
        backgroundColor: '#eef2ff',
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

    menuGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    menuItem: {
        width: '47%',
        backgroundColor: '#fff',
        padding: 22,
        borderRadius: 28,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    menuIconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    menuText: { fontSize: 15, fontWeight: '800', color: '#334155' }
});

export default StudentDashboard;
