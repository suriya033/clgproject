import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { LogOut, BookOpen, Calendar, Clock, Award, Bell } from 'lucide-react-native';

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
        { id: '1', title: 'Attendance', value: '85%', icon: <Clock size={24} color="#4361ee" />, sub: 'Good' },
        { id: '2', title: 'GPA', value: '3.8', icon: <Award size={24} color="#f72585" />, sub: 'Excellent' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4361ee" />

            <View style={styles.headerContainer}>
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
                        <Text style={styles.headerStatLabel}>Course</Text>
                        <Text style={styles.headerStatValue}>B.Tech CSE</Text>
                    </View>
                    <View style={styles.headerStatDivider} />
                    <View style={styles.headerStatItem}>
                        <Text style={styles.headerStatLabel}>Semester</Text>
                        <Text style={styles.headerStatValue}>6th Sem</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {cards.map(card => (
                        <View key={card.id} style={styles.card}>
                            <View style={styles.cardIconWrapper}>
                                {card.icon}
                            </View>
                            <Text style={styles.cardValue}>{String(card.value)}</Text>
                            <Text style={styles.cardTitle}>{card.title}</Text>
                            <Text style={styles.cardSub}>{card.sub}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Announcements</Text>
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
                                    <Text style={styles.announceTitle}>{item.title}</Text>
                                </View>
                                <Text style={styles.announceContent}>{item.content}</Text>
                            </View>
                        )) : (
                            <Text style={styles.noData}>No new announcements</Text>
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
        marginBottom: 24,
    },
    welcomeText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    logoutButton: {
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 16,
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
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    headerStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    content: { padding: 24 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    card: {
        width: '47%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 24,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardValue: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    cardTitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    cardSub: { fontSize: 12, color: '#10b981', fontWeight: '600', marginTop: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16, marginTop: 8 },
    announceContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    announceItem: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16 },
    announceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    bellIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    announceTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    announceContent: { fontSize: 14, color: '#64748b', lineHeight: 20 },
    noData: { textAlign: 'center', color: '#64748b', padding: 20 },
    menuGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    menuItem: {
        width: '47%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    menuIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    menuText: { fontSize: 15, fontWeight: '700', color: '#334155' }
});

export default StudentDashboard;
