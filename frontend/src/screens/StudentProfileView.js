import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StatusBar,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    User,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    BookOpen,
    Clock,
    Award,
    TrendingUp,
    MapPin
} from 'lucide-react-native';
import api from '../api/api';

const { width } = Dimensions.get('window');

const StudentProfileView = ({ route, navigation }) => {
    const { studentId } = route.params;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('Overview'); // Overview, Attendance, Marks

    useEffect(() => {
        fetchStudentDetails();
    }, [studentId]);

    const fetchStudentDetails = async () => {
        try {
            const res = await api.get(`/admin/student-full-details/${studentId}`);
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </View>
        );
    }

    if (!data) return null;

    const { profile, attendance, marks } = data;

    const renderOverview = () => (
        <View style={styles.tabContent}>
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Basic Information</Text>
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Mail size={16} color="#64748b" />
                        <View style={styles.infoTextGroup}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{profile.email}</Text>
                        </View>
                    </View>
                    <View style={styles.infoItem}>
                        <Phone size={16} color="#64748b" />
                        <View style={styles.infoTextGroup}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{profile.mobileNo || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.infoItem}>
                        <Calendar size={16} color="#64748b" />
                        <View style={styles.infoTextGroup}>
                            <Text style={styles.infoLabel}>DOB</Text>
                            <Text style={styles.infoValue}>{profile.dob || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.infoItem}>
                        <GraduationCap size={16} color="#64748b" />
                        <View style={styles.infoTextGroup}>
                            <Text style={styles.infoLabel}>Academic Year</Text>
                            <Text style={styles.infoValue}>{profile.year || 'N/A'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.statsOverviewRow}>
                <View style={[styles.miniStat, { backgroundColor: '#fff1f2' }]}>
                    <Clock size={20} color="#800000" />
                    <Text style={styles.miniStatValue}>{attendance.percentage}%</Text>
                    <Text style={styles.miniStatLabel}>Attendance</Text>
                </View>
                <View style={[styles.miniStat, { backgroundColor: '#f0fdf4' }]}>
                    <TrendingUp size={20} color="#15803d" />
                    <Text style={styles.miniStatValue}>{marks.length > 0 ? (marks.reduce((acc, curr) => acc + curr.marks, 0) / marks.length).toFixed(1) : '0'}</Text>
                    <Text style={styles.miniStatLabel}>Avg Marks</Text>
                </View>
            </View>
        </View>
    );

    const renderAttendance = () => (
        <View style={styles.tabContent}>
            <View style={styles.attendanceSummary}>
                <View style={styles.circleProgressContainer}>
                    <View style={styles.circleOuter}>
                        <Text style={styles.progressText}>{attendance.percentage}%</Text>
                    </View>
                </View>
                <View style={styles.summaryStats}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{attendance.attended}</Text>
                        <Text style={styles.summaryLabel}>Attended</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{attendance.total}</Text>
                        <Text style={styles.summaryLabel}>Total</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.sectionHeading}>Subject-wise Breakdown</Text>
            {attendance.subjectWise.map((sub, index) => (
                <View key={index} style={styles.subjectRow}>
                    <View style={styles.subInfo}>
                        <Text style={styles.subName}>{sub._id}</Text>
                        <Text style={styles.subCount}>{sub.attended} / {sub.total} periods</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(sub.attended / sub.total) * 100}%` }]} />
                    </View>
                    <Text style={styles.subPercent}>{((sub.attended / sub.total) * 100).toFixed(0)}%</Text>
                </View>
            ))}
        </View>
    );

    const renderMarks = () => {
        const exams = [...new Set(marks.map(m => m.examType))];
        return (
            <View style={styles.tabContent}>
                {exams.map(examType => (
                    <View key={examType} style={styles.examCard}>
                        <View style={styles.examHeader}>
                            <Award size={18} color="#800000" />
                            <Text style={styles.examTitle}>{examType}</Text>
                        </View>
                        {marks.filter(m => m.examType === examType).map((mark, idx) => (
                            <View key={idx} style={styles.markItem}>
                                <Text style={styles.markSubject}>{mark.subject}</Text>
                                <View style={styles.markBadge}>
                                    <Text style={styles.markValue}>{mark.marks} / {mark.maxMarks}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
                {marks.length === 0 && (
                    <View style={styles.emptyState}>
                        <BookOpen size={40} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No marks recorded yet</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.profileSection}>
                        <View style={styles.avatarBorder}>
                            {profile.photo ? (
                                <Image source={{ uri: profile.photo }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Text style={styles.avatarInitial}>{profile.name.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.name}>{profile.name}</Text>
                        <Text style={styles.idText}>{profile.userId}</Text>
                        <View style={styles.classBadge}>
                            <Text style={styles.classText}>{profile.department} • Sec {profile.section || 'A'}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Tabs */}
                <View style={styles.tabBar}>
                    {['Overview', 'Attendance', 'Marks'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                {activeTab === 'Overview' && renderOverview()}
                {activeTab === 'Attendance' && renderAttendance()}
                {activeTab === 'Marks' && renderMarks()}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center' },
    backBtn: { alignSelf: 'flex-start', padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
    profileSection: { alignItems: 'center', marginTop: 10 },
    avatarBorder: { padding: 4, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 15 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    avatarFallback: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { fontSize: 36, fontWeight: '800', color: '#800000' },
    name: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
    idText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 12 },
    classBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    classText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    tabBar: { flexDirection: 'row', backgroundColor: '#fff', padding: 4, marginHorizontal: 20, borderRadius: 16, marginTop: -25, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: '#800000' },
    tabText: { fontWeight: '700', color: '#64748b' },
    activeTabText: { color: '#fff' },
    tabContent: { padding: 20, marginTop: 10 },
    infoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 20 },
    infoGrid: { gap: 20 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    infoTextGroup: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
    infoValue: { fontSize: 15, fontWeight: '700', color: '#334155' },
    statsOverviewRow: { flexDirection: 'row', gap: 15, marginTop: 20 },
    miniStat: { flex: 1, padding: 15, borderRadius: 20, alignItems: 'center' },
    miniStatValue: { fontSize: 18, fontWeight: '800', marginVertical: 4 },
    miniStatLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    attendanceSummary: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center' },
    circleProgressContainer: { marginBottom: 20 },
    circleOuter: { width: 120, height: 120, borderRadius: 60, borderWidth: 10, borderColor: '#800000', justifyContent: 'center', alignItems: 'center' },
    progressText: { fontSize: 24, fontWeight: '800', color: '#800000' },
    summaryStats: { flexDirection: 'row', alignItems: 'center', gap: 30 },
    summaryItem: { alignItems: 'center' },
    summaryValue: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    summaryLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    divider: { width: 1, height: 40, backgroundColor: '#f1f5f9' },
    sectionHeading: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginTop: 30, marginBottom: 15 },
    subjectRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 10 },
    subInfo: { flex: 1 },
    subName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    subCount: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    progressBarBg: { height: 8, width: 60, backgroundColor: '#f1f5f9', borderRadius: 4, marginHorizontal: 15, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#800000' },
    subPercent: { fontSize: 14, fontWeight: '800', color: '#800000', width: 40, textAlign: 'right' },
    examCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20 },
    examHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
    examTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    markItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    markSubject: { fontSize: 14, color: '#475569', fontWeight: '600' },
    markBadge: { backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    markValue: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 10, color: '#94a3b8', fontWeight: '600' }
});

export default StudentProfileView;
