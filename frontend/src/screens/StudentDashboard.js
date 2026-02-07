import React, { useContext, useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    Platform,
    Image,
    Dimensions,
    RefreshControl,
    Modal
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import {
    LogOut,
    Calendar,
    Award,
    Megaphone,
    GraduationCap,
    Eye,
    X,
    Clock,
    ChevronRight,
    ClipboardList,
    TrendingUp,
    BookOpen,
    User,
    MessageSquare,
    Bell,
    Mail,
    Phone,
    MapPin,
    Hash,
    CalendarCheck,
    Percent,
    Zap,
    FileText,
    AlertCircle,
    CreditCard,
    Menu
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StudentDashboard = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewImageModal, setViewImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [bioModalVisible, setBioModalVisible] = useState(false);

    const [attendance, setAttendance] = useState({ percentage: '0.0', attended: 0, total: 0 });
    const [performance, setPerformance] = useState({ cgpa: '0.0', percentage: '0.0', totalTests: 0 });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchAnnouncements(),
                fetchAttendance(),
                fetchPerformance()
            ]);
        } catch (error) {
            console.error('Initial fetch failed', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            const res = await api.get('/attendance/my-percentage');
            setAttendance(res.data);
        } catch (error) {
            console.error('Error fetching attendance');
        }
    };

    const fetchPerformance = async () => {
        try {
            const res = await api.get('/marks/my-performance');
            setPerformance(res.data);
        } catch (error) {
            console.error('Error fetching performance');
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/college/announcements');
            if (res.data && Array.isArray(res.data)) {
                setAnnouncements(res.data.slice(0, 4));
            }
        } catch (error) {
            console.error('Error fetching announcements');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllData();
    };

    const stats = [
        {
            id: '1',
            title: 'Attendance',
            value: `${attendance.percentage}%`,
            icon: <Clock size={22} color="#800000" />,
            bg: '#fee2e2',
            sub: `${attendance.attended}/${attendance.total} Classes`,
            route: 'Attendance'
        },
        {
            id: '2',
            title: 'Current CGPA',
            value: performance.cgpa || '0.0',
            icon: <Award size={22} color="#0891b2" />,
            bg: '#cffafe',
            sub: `Top Performance`,
            route: null
        },
    ];

    const quickActions = [
        { id: '1', title: 'Attendance', icon: <CalendarCheck size={24} color="#fff" />, start: '#059669', end: '#10b981', route: 'Attendance' },
        { id: '2', title: 'CIA Marks', icon: <Percent size={24} color="#fff" />, start: '#2563eb', end: '#3b82f6', route: 'StudentMarks' },
        { id: '3', title: 'Library', icon: <BookOpen size={24} color="#fff" />, start: '#d97706', end: '#f59e0b', route: 'StudentLibrary' },
        { id: '4', title: 'Smart Request', icon: <Zap size={24} color="#fff" />, start: '#7c3aed', end: '#8b5cf6', route: 'SmartRequest' },
        { id: '5', title: 'Assignment', icon: <FileText size={24} color="#fff" />, start: '#db2777', end: '#ec4899', route: 'Assignments' },
        { id: '6', title: 'Timetable', icon: <Calendar size={24} color="#fff" />, start: '#800000', end: '#b91c1c', route: 'TimetableViewer' },
        { id: '7', title: 'Complaint', icon: <AlertCircle size={24} color="#fff" />, start: '#dc2626', end: '#ef4444', route: 'Complaints' },
        { id: '8', title: 'Fees', icon: <CreditCard size={24} color="#fff" />, start: '#16a34a', end: '#22c55e', route: 'Fees' },
    ];

    const formatYear = (year) => {
        if (!year) return 'N/A';
        const y = String(year).trim();
        const map = {
            '1': 'I Year',
            '2': 'II Year',
            '3': 'III Year',
            '4': 'IV Year'
        };
        return map[y] || `${y} Year`;
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
                                <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                                <Text style={styles.welcomeText}>Hello Student,</Text>
                                <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
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
                                    <View style={styles.profilePicContainer}>
                                        <Image source={{ uri: user.photo }} style={styles.profilePic} />
                                        <View style={styles.activeDot} />
                                    </View>
                                ) : (
                                    <View style={styles.profilePlaceholder}>
                                        <Text style={styles.profileInitial}>{user?.name?.charAt(0)}</Text>
                                        <View style={styles.activeDot} />
                                    </View>
                                )}
                                <View style={styles.profileInfo}>
                                    <View style={styles.roleHeaderRow}>
                                        <View style={styles.roleTag}>
                                            <Text style={styles.roleText}>Student Portal</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setBioModalVisible(true)} style={styles.viewProfileBtn}>
                                            <Text style={styles.viewProfileText}>View Profile</Text>
                                            <ChevronRight size={14} color="#fff" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.deptText}>{user?.branch || user?.department || 'General'}</Text>

                                    <View style={styles.badgeRow}>
                                        <View style={styles.detailBadge}>
                                            <Text style={styles.badgeLabel}>Year</Text>
                                            <Text style={styles.badgeVal}>{formatYear(user?.year)}</Text>
                                        </View>
                                        <View style={styles.detailBadge}>
                                            <Text style={styles.badgeLabel}>Sec</Text>
                                            <Text style={styles.badgeVal}>{user?.section || 'A'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.content}>
                    <View style={styles.statsRow}>
                        {stats.map(stat => (
                            <TouchableOpacity
                                key={stat.id}
                                style={styles.statCard}
                                onPress={() => stat.route && navigation.navigate(stat.route)}
                            >
                                <View style={[styles.statIconBox, { backgroundColor: stat.bg }]}>
                                    {stat.icon}
                                </View>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                    <Text style={styles.statTitle}>{stat.title}</Text>
                                    <Text style={styles.statSub} numberOfLines={1}>{stat.sub}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Main Navigation</Text>
                    <View style={styles.gridContainer}>
                        {quickActions.map(action => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.gridItem}
                                activeOpacity={0.9}
                                onPress={() => action.route && navigation.navigate(action.route)}
                            >
                                <LinearGradient
                                    colors={[action.start, action.end]}
                                    style={styles.gridGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.gridIconBg}>
                                        {action.icon}
                                    </View>
                                    <Text style={styles.gridTitle}>{action.title}</Text>
                                    <TrendingUp size={16} color="rgba(255,255,255,0.4)" style={styles.decorIcon} />
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Campus Updates</Text>
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
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' })}
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
                                                <Text style={styles.imageOverlayText}>View Attachment</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )) : (
                                <View style={styles.emptyState}>
                                    <Megaphone size={40} color="#cbd5e1" />
                                    <Text style={styles.emptyText}>No bulletins found</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal visible={viewImageModal} transparent={true} animationType="fade" onRequestClose={() => setViewImageModal(false)}>
                <View style={styles.fullImageOverlay}>
                    <TouchableOpacity style={styles.closeFullImage} onPress={() => setViewImageModal(false)}>
                        <X size={30} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />}
                </View>
            </Modal>

            {/* Profile/Bio Modal */}
            <Modal visible={bioModalVisible} transparent={true} animationType="slide" onRequestClose={() => setBioModalVisible(false)}>
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
                        <Text style={styles.bioRole}>Register No: {user?.userId}</Text>

                        <View style={styles.bioInfoSection}>
                            <View style={styles.bioItem}>
                                <View style={styles.bioIconBg}><GraduationCap size={18} color="#800000" /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.bioLabel}>Course & Branch</Text>
                                    <Text style={styles.bioValue}>{user?.branch || user?.department}</Text>
                                </View>
                            </View>

                            <View style={styles.bioItem}>
                                <View style={styles.bioIconBg}><Hash size={18} color="#800000" /></View>
                                <View style={styles.bioGrid}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bioLabel}>Year</Text>
                                        <Text style={styles.bioValue}>{formatYear(user?.year)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bioLabel}>Semester</Text>
                                        <Text style={styles.bioValue}>{user?.semester}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bioLabel}>Section</Text>
                                        <Text style={styles.bioValue}>{user?.section}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.bioItem}>
                                <View style={styles.bioIconBg}><Mail size={18} color="#800000" /></View>
                                <View>
                                    <Text style={styles.bioLabel}>Email</Text>
                                    <Text style={styles.bioValue}>{user?.email}</Text>
                                </View>
                            </View>

                            {user?.mobileNo && (
                                <View style={styles.bioItem}>
                                    <View style={styles.bioIconBg}><Phone size={18} color="#800000" /></View>
                                    <View>
                                        <Text style={styles.bioLabel}>Mobile</Text>
                                        <Text style={styles.bioValue}>{user?.mobileNo}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={styles.closeProfileBtn} onPress={() => setBioModalVisible(false)}>
                            <Text style={styles.closeProfileText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fdfdfd' },
    headerWrapper: {
        backgroundColor: '#800000',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        elevation: 15,
        zIndex: 10,
        overflow: 'hidden'
    },
    headerContainer: {
        paddingTop: Platform.OS === 'android' ? 45 : 20,
        paddingBottom: 35,
        paddingHorizontal: 25,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
    dateText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
    welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 4, fontWeight: '600' },
    userName: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
    menuButton: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    headerIconButton: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 15, position: 'relative' },
    notifBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#800000' },

    profileCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    profileRow: { flexDirection: 'row', alignItems: 'center' },
    profilePicContainer: { position: 'relative' },
    profilePic: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#fff' },
    profilePlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    profileInitial: { fontSize: 26, color: '#800000', fontWeight: 'bold' },
    activeDot: { position: 'absolute', bottom: 2, right: 2, width: 15, height: 15, borderRadius: 8, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#800000' },

    profileInfo: { marginLeft: 16, flex: 1 },
    roleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    roleTag: { backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10 },
    roleText: { color: '#92400e', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
    viewProfileBtn: { flexDirection: 'row', alignItems: 'center', opacity: 0.9 },
    viewProfileText: { color: '#fff', fontSize: 12, fontWeight: '700', marginRight: 2 },

    deptText: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 12 },
    badgeRow: { flexDirection: 'row', gap: 10 },
    detailBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignItems: 'center', minWidth: 50 },
    badgeLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
    badgeVal: { color: '#fff', fontSize: 13, fontWeight: '900' },

    content: { paddingHorizontal: 22, paddingTop: 30 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
    statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 28, padding: 18, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 5 }, shadowRadius: 15, borderWidth: 1, borderColor: '#f1f5f9' },
    statIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    statValue: { fontSize: 26, fontWeight: '900', color: '#1e293b', marginBottom: 2 },
    statTitle: { fontSize: 14, color: '#64748b', fontWeight: '800', marginBottom: 4 },
    statSub: { fontSize: 11, color: '#059669', fontWeight: '900' },

    sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 18, letterSpacing: -0.4 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
    gridItem: { width: '48%', height: 120, marginBottom: 15, borderRadius: 28, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12 },
    gridGradient: { flex: 1, padding: 20, justifyContent: 'space-between', alignItems: 'flex-start' },
    gridIconBg: { backgroundColor: 'rgba(255,255,255,0.25)', width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    gridTitle: { color: '#fff', fontSize: 15, fontWeight: '900' },
    decorIcon: { position: 'absolute', right: 15, top: 15 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    seeAllText: { fontSize: 15, color: '#800000', fontWeight: '900' },

    announcementsList: { gap: 18 },
    announcementCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    announcementHeader: { flexDirection: 'row', marginBottom: 14 },
    announcementIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    announcementTitle: { fontSize: 17, fontWeight: '900', color: '#1e293b' },
    announcementDate: { fontSize: 12, color: '#94a3b8', marginTop: 3, fontWeight: '700' },
    announcementDesc: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 14 },
    imagePreviewContainer: { height: 200, borderRadius: 20, overflow: 'hidden', marginTop: 5 },
    imagePreview: { width: '100%', height: '100%' },
    imageOverlay: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, flexDirection: 'row', alignItems: 'center' },
    imageOverlayText: { color: '#fff', fontSize: 12, fontWeight: '800', marginLeft: 8 },

    emptyState: { alignItems: 'center', padding: 50, backgroundColor: '#fff', borderRadius: 28, borderWidth: 1, borderStyle: 'dashed', borderColor: '#cbd5e1' },
    emptyText: { color: '#94a3b8', fontWeight: '900', marginTop: 15 },
    loaderContainer: { padding: 50, alignItems: 'center' },
    fullImageOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', justifyContent: 'center', alignItems: 'center' },
    closeFullImage: { position: 'absolute', top: 55, right: 30, zIndex: 10, padding: 14, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 35 },
    fullImage: { width: '100%', height: '90%' },

    // Bio Modal
    bioModalContent: { backgroundColor: '#fff', borderRadius: 35, width: '92%', padding: 25, elevation: 30 },
    bioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
    bioAvatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: '#fff', elevation: 12, overflow: 'hidden' },
    fullBioPic: { width: '100%', height: '100%' },
    avatarText: { fontSize: 40, fontWeight: '900', color: '#800000' },
    closeBioBtn: { padding: 10, backgroundColor: '#f1f5f9', borderRadius: 15 },
    bioName: { fontSize: 26, fontWeight: '900', color: '#1e293b', textAlign: 'center' },
    bioRole: { fontSize: 14, color: '#800000', fontWeight: '800', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 25 },
    bioInfoSection: { gap: 18, backgroundColor: '#f8fafc', padding: 22, borderRadius: 28, borderWidth: 1, borderColor: '#f1f5f9' },
    bioItem: { flexDirection: 'row', alignItems: 'center', gap: 18 },
    bioIconBg: { backgroundColor: '#fff', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9' },
    bioLabel: { fontSize: 12, color: '#64748b', fontWeight: '700', marginBottom: 2, textTransform: 'uppercase' },
    bioValue: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    bioGrid: { flexDirection: 'row', gap: 10, flex: 1 },
    closeProfileBtn: { backgroundColor: '#800000', paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 25 },
    closeProfileText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});

export default StudentDashboard;
