import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Platform, Image, Dimensions, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { LogOut, Users, FileText, CheckSquare, Bell, Calendar, Megaphone, GraduationCap, Eye, X, ImageIcon, Award, BookOpen, Clock, ChevronRight, ClipboardList, Menu } from 'lucide-react-native';
import { Modal } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StaffDashboard = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewImageModal, setViewImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [classesCount, setClassesCount] = useState('00');
    const [nextClassInfo, setNextClassInfo] = useState('No classes');
    const [bioModalVisible, setBioModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchAnnouncements(),
                fetchScheduleStats()
            ]);
        } catch (error) {
            console.error('Initial fetch failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchScheduleStats = async () => {
        try {
            const res = await api.get('/timetable/my-schedule');
            const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const todayClasses = res.data[day] || [];

            // Handle null/undefined gracefully
            if (todayClasses) {
                setClassesCount(String(todayClasses.length).padStart(2, '0'));

                // Find next class
                const now = new Date();
                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                // Sort just in case
                const sorted = [...todayClasses].sort((a, b) => a.startTime.localeCompare(b.startTime));

                const upcoming = sorted.find(c => c.startTime > currentTime);
                if (upcoming) {
                    setNextClassInfo(`Next: ${upcoming.startTime} (${upcoming.subject})`);
                } else if (todayClasses.length > 0) {
                    setNextClassInfo('All classes done');
                } else {
                    setNextClassInfo('No classes today');
                }
            }
        } catch (error) {
            console.error('Error fetching schedule stats:', error);
            setNextClassInfo('Schedule unavailable');
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/college/announcements');
            // Show only latest 3
            if (res.data && Array.isArray(res.data)) {
                setAnnouncements(res.data.slice(0, 3));
            }
        } catch (error) {
            console.error('Error fetching announcements', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllData();
    };

    const stats = [
        { id: '1', title: 'Classes Today', value: classesCount, icon: <Calendar size={24} color="#800000" />, bg: '#fee2e2', sub: nextClassInfo },
        { id: '2', title: 'Students', value: '120+', icon: <Users size={24} color="#0891b2" />, bg: '#cffafe', sub: 'Total Active' },
    ];

    const managementLinks = [
        { id: '0', title: 'My Timetable', icon: <Calendar size={24} color="#fff" />, startColor: '#800000', endColor: '#b91c1c', route: 'StaffTimetable' },
        ...(user?.isCoordinator ? [
            { id: 'my-class', title: 'My Class', icon: <GraduationCap size={24} color="#fff" />, startColor: '#4f46e5', endColor: '#6366f1', route: 'CoordinatorClassView' },
            { id: 'approvals', title: 'Leave Approvals', icon: <ClipboardList size={24} color="#fff" />, startColor: '#db2777', endColor: '#f472b6', route: 'CoordinatorRequests' }
        ] : []),
        ...(user?.role === 'HOD' ? [
            { id: 'hod-approvals', title: 'HOD Approvals', icon: <CheckSquare size={24} color="#fff" />, startColor: '#800000', endColor: '#b91c1c', route: 'HODRequests' }
        ] : []),
        { id: '0b', title: 'Class Search', icon: <BookOpen size={24} color="#fff" />, startColor: '#0f172a', endColor: '#334155', route: 'TimetableViewer' },
        { id: '1', title: 'Attendance', icon: <CheckSquare size={24} color="#fff" />, startColor: '#059669', endColor: '#10b981', route: 'StaffAttendance' },
        { id: '3', title: 'CIA Marks', icon: <Award size={24} color="#fff" />, startColor: '#d97706', endColor: '#f59e0b', route: 'StaffCIAMarks' },
        { id: '2', title: 'Upload Notes', icon: <FileText size={24} color="#fff" />, startColor: '#2563eb', endColor: '#3b82f6', route: null },
        { id: '4', title: 'Faculty Lounge', icon: <Users size={24} color="#fff" />, startColor: '#7c3aed', endColor: '#8b5cf6', route: null },
    ];

    const getDateString = () => {
        const date = new Date();
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />
                }
            >
                {/* Modern Header */}
                <View style={styles.headerWrapper}>
                    <LinearGradient
                        colors={['#800000', '#600000', '#400000']}
                        style={styles.headerContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                                <Menu size={26} color="#fff" />
                            </TouchableOpacity>
                            <View style={{ flex: 1, marginLeft: 15 }}>
                                <Text style={styles.dateText}>{getDateString()}</Text>
                                <Text style={styles.welcomeText}>Welcome back,</Text>
                                <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Staff'}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Announcements')}
                                style={styles.headerIconButton}
                            >
                                <Bell size={22} color="#fff" />
                                <View style={styles.notifBadge} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.profileCard}>
                            <View style={styles.profileRow}>
                                {user?.photo ? (
                                    <Image source={{ uri: user.photo }} style={styles.profilePic} />
                                ) : (
                                    <View style={styles.profilePlaceholder}>
                                        <Text style={styles.profileInitial}>{user?.name?.charAt(0)}</Text>
                                    </View>
                                )}
                                <View style={styles.profileInfo}>
                                    <View style={styles.roleTag}>
                                        <Text style={styles.roleText}>{user?.role || 'Staff'}</Text>
                                    </View>
                                    <Text style={styles.deptText}>{user?.department || 'Department'}</Text>
                                    <TouchableOpacity
                                        style={styles.viewProfileBtn}
                                        onPress={() => setBioModalVisible(true)}
                                    >
                                        <Text style={styles.viewProfileText}>View Full Profile</Text>
                                        <ChevronRight size={12} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.content}>
                    {/* Stats Overview */}
                    <View style={styles.statsRow}>
                        {stats.map(stat => (
                            <View key={stat.id} style={styles.statCard}>
                                <View style={[styles.statIconBox, { backgroundColor: stat.bg }]}>
                                    {stat.icon}
                                </View>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                    <Text style={styles.statTitle}>{stat.title}</Text>
                                    <Text style={styles.statSub} numberOfLines={1}>{stat.sub}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Management Grid */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.gridContainer}>
                        {managementLinks.map(link => (
                            <TouchableOpacity
                                key={link.id}
                                style={styles.gridItem}
                                activeOpacity={0.9}
                                onPress={() => {
                                    if (link.route) navigation.navigate(link.route);
                                }}
                            >
                                <LinearGradient
                                    colors={[link.startColor, link.endColor]}
                                    style={styles.gridGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.gridIconBg}>
                                        {link.icon}
                                    </View>
                                    <Text style={styles.gridTitle}>{link.title}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Campus Updates Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Announcements</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                            <Text style={styles.seeAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator color="#800000" size="large" />
                        </View>
                    ) : (
                        <View style={styles.announcementsList}>
                            {announcements.length > 0 ? announcements.map(item => (
                                <View key={item._id} style={styles.announcementCard}>
                                    <View style={styles.announcementHeader}>
                                        <View style={styles.announcementIcon}>
                                            <Bell size={18} color="#800000" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.announcementTitle} numberOfLines={1}>{item.title}</Text>
                                            <Text style={styles.announcementDate}>
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.announcementDesc} numberOfLines={3}>{item.content}</Text>

                                    {item.attachmentUrl && item.attachmentType === 'image' && (
                                        <TouchableOpacity
                                            style={styles.imagePreviewContainer}
                                            onPress={() => {
                                                setSelectedImage(item.attachmentUrl);
                                                setViewImageModal(true);
                                            }}
                                        >
                                            <Image source={{ uri: item.attachmentUrl }} style={styles.imagePreview} resizeMode="cover" />
                                            <View style={styles.imageOverlay}>
                                                <Eye size={12} color="#fff" />
                                                <Text style={styles.imageOverlayText}>Preview</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )) : (
                                <View style={styles.emptyState}>
                                    <Megaphone size={40} color="#cbd5e1" />
                                    <Text style={styles.emptyText}>No recent updates</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Full Image View Modal */}
            <Modal
                visible={viewImageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewImageModal(false)}
            >
                <View style={styles.fullImageOverlay}>
                    <TouchableOpacity
                        style={styles.closeFullImage}
                        onPress={() => setViewImageModal(false)}
                    >
                        <X size={30} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
            {/* Profile Details Modal */}
            <Modal
                visible={bioModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setBioModalVisible(false)}
            >
                <View style={styles.fullImageOverlay}>
                    <View style={styles.bioModalContent}>
                        <View style={styles.bioHeader}>
                            <View style={styles.bioAvatar}>
                                {user?.photo ? (
                                    <Image source={{ uri: user.photo }} style={styles.fullBioPic} />
                                ) : (
                                    <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => setBioModalVisible(false)} style={styles.closeBioBtn}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.bioName}>{user?.name}</Text>
                        <Text style={styles.bioRole}>{user?.role || 'Faculty Member'}</Text>

                        <View style={styles.bioInfoSection}>
                            <View style={styles.bioItem}>
                                <View style={styles.bioIconBg}><Calendar size={18} color="#800000" /></View>
                                <View>
                                    <Text style={styles.bioLabel}>User ID</Text>
                                    <Text style={styles.bioValue}>{user?.userId}</Text>
                                </View>
                            </View>

                            <View style={styles.bioItem}>
                                <View style={styles.bioIconBg}><Bell size={18} color="#800000" /></View>
                                <View>
                                    <Text style={styles.bioLabel}>Email Address</Text>
                                    <Text style={styles.bioValue}>{user?.email}</Text>
                                </View>
                            </View>

                            <View style={styles.bioItem}>
                                <View style={styles.bioIconBg}><Users size={18} color="#800000" /></View>
                                <View>
                                    <Text style={styles.bioLabel}>Department</Text>
                                    <Text style={styles.bioValue}>{user?.department}</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeProfileBtn}
                            onPress={() => setBioModalVisible(false)}
                        >
                            <Text style={styles.closeProfileText}>Close Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    headerWrapper: {
        backgroundColor: '#800000',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
        zIndex: 10,
        overflow: 'hidden'
    },
    headerContainer: {
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20
    },
    dateText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 4 },
    userName: { color: '#fff', fontSize: 26, fontWeight: '800' },
    menuButton: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    headerIconButton: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 15, position: 'relative' },
    notifBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#800000' },
    profileCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)'
    },
    profileRow: { flexDirection: 'row', alignItems: 'center' },
    profilePic: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },
    profilePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    profileInitial: { fontSize: 22, color: '#800000', fontWeight: 'bold' },
    profileInfo: { marginLeft: 15 },
    roleTag: { backgroundColor: '#fcd34d', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
    roleText: { color: '#78350f', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    deptText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    viewProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        paddingVertical: 2,
    },
    viewProfileText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '700',
        textDecorationLine: 'underline',
        marginRight: 4
    },

    content: { paddingHorizontal: 20, paddingTop: 25 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10
    },
    statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statValue: { fontSize: 22, fontWeight: '900', color: '#1e293b' },
    statTitle: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 4 },
    statSub: { fontSize: 11, color: '#059669', fontWeight: '700' },

    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 15 },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 25
    },
    gridItem: {
        width: '48%',
        height: 100,
        marginBottom: 15,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    gridGradient: {
        flex: 1,
        padding: 15,
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    gridIconBg: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    gridTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    seeAllText: { fontSize: 14, color: '#800000', fontWeight: '700' },

    announcementsList: { gap: 15 },
    announcementCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    announcementHeader: { flexDirection: 'row', marginBottom: 10 },
    announcementIcon: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: '#fee2e2',
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    announcementTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    announcementDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    announcementDesc: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 10 },

    imagePreviewContainer: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 5,
        position: 'relative'
    },
    imagePreview: { width: '100%', height: '100%' },
    imageOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },
    imageOverlayText: { color: '#fff', fontSize: 10, fontWeight: '700', marginLeft: 4 },

    emptyState: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderRadius: 16 },
    emptyText: { color: '#cbd5e1', fontWeight: 'bold', marginTop: 10 },

    loaderContainer: { padding: 30 },

    fullImageOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeFullImage: {
        position: 'absolute',
        top: 50,
        right: 25,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 30
    },
    fullImage: { width: '100%', height: '100%' },

    // Bio Modal Styles
    bioModalContent: {
        backgroundColor: '#fff',
        borderRadius: 32,
        width: '90%',
        padding: 24,
        elevation: 25,
    },
    bioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    bioAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        elevation: 8,
        overflow: 'hidden'
    },
    fullBioPic: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#800000',
    },
    closeBioBtn: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 14,
    },
    bioName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        textAlign: 'center',
    },
    bioRole: {
        fontSize: 14,
        color: '#800000',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 24,
    },
    bioInfoSection: {
        gap: 16,
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    bioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    bioIconBg: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    bioLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    bioValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    closeProfileBtn: {
        backgroundColor: '#800000',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    closeProfileText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default StaffDashboard;
