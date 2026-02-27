import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    Alert,
    Image,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check, X, UserMinus, Clock, Calendar } from 'lucide-react-native';
import api from '../api/api';

const MarkAttendance = ({ navigation, route }) => {
    const { classDetails } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/attendance/students', {
                params: {
                    department: classDetails.department,
                    semester: classDetails.semester,
                    section: classDetails.section,
                    subject: classDetails.subject,
                    period: classDetails.period,
                    date: classDetails.date
                }
            });
            // Default to present if status not set
            const data = (res.data || []).map(s => ({ ...s, status: s.status || 'P' }));
            setStudents(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch student list');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = (studentId, newStatus) => {
        setStudents(prev => prev.map(s =>
            s._id === studentId ? { ...s, status: newStatus } : s
        ));
    };

    const stats = {
        present: students.filter(s => s.status === 'P').length,
        absent: students.filter(s => s.status === 'A').length,
        od: students.filter(s => s.status === 'OD').length
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const attendanceData = students.map(s => ({
                studentId: s._id,
                status: s.status
            }));

            await api.post('/attendance/bulk-update', {
                attendanceData,
                classDetails
            });

            Alert.alert('Success', 'Attendance updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStudentItem = ({ item, index }) => (
        <View style={styles.studentCard}>
            <View style={styles.studentInfo}>
                <View style={styles.indexCircle}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </View>
                )}
                <View style={styles.nameContainer}>
                    <Text style={styles.studentName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.rollNo}>{item.userId}</Text>
                </View>
            </View>

            <View style={styles.statusToggle}>
                <TouchableOpacity
                    onPress={() => updateStatus(item._id, 'P')}
                    style={[styles.toggleOption, item.status === 'P' && styles.pActive]}
                >
                    <Text style={[styles.toggleLabel, item.status === 'P' && styles.activeLabel]}>P</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => updateStatus(item._id, 'A')}
                    style={[styles.toggleOption, item.status === 'A' && styles.aActive]}
                >
                    <Text style={[styles.toggleLabel, item.status === 'A' && styles.activeLabel]}>A</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => updateStatus(item._id, 'OD')}
                    style={[styles.toggleOption, item.status === 'OD' && styles.odActive]}
                >
                    <Text style={[styles.toggleLabel, item.status === 'OD' && styles.activeLabel]}>OD</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />
            <LinearGradient
                colors={['#800000', '#600000']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mark Attendance</Text>
                    <View style={styles.classBadge}>
                        <Text style={styles.classBadgeText}>SEC {classDetails.section}</Text>
                    </View>
                </View>

                <View style={styles.classMainInfo}>
                    <Text style={styles.className}>{classDetails.subject}</Text>
                    <View style={styles.metaRow}>
                        <Clock size={12} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.metaText}>{classDetails.startTime} - {classDetails.endTime}</Text>
                        <View style={styles.metaDivider} />
                        <Calendar size={12} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.metaText}>Sem {classDetails.semester}</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#800000" />
                    </View>
                ) : (
                    <>
                        <View style={styles.statsContainer}>
                            <View style={styles.statBox}>
                                <Text style={styles.statNum}>{students.length}</Text>
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                            <View style={[styles.statBox, styles.statBorder]}>
                                <Text style={[styles.statNum, { color: '#10b981' }]}>{stats.present}</Text>
                                <Text style={styles.statLabel}>Present</Text>
                            </View>
                            <View style={[styles.statBox, styles.statBorder]}>
                                <Text style={[styles.statNum, { color: '#ef4444' }]}>{stats.absent}</Text>
                                <Text style={styles.statLabel}>Absent</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={[styles.statNum, { color: '#3b82f6' }]}>{stats.od}</Text>
                                <Text style={styles.statLabel}>OD</Text>
                            </View>
                        </View>

                        <FlatList
                            data={students}
                            renderItem={renderStudentItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && styles.disabledBtn]}
                                onPress={handleSubmit}
                                disabled={submitting}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#800000', '#600000']}
                                    style={styles.btnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={styles.submitText}>Finalize Attendance</Text>
                                            <Check size={20} color="#fff" style={{ marginLeft: 8 }} />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        paddingBottom: 25,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    classBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    classBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    classMainInfo: {
        marginTop: 5
    },
    className: { color: '#fff', fontSize: 22, fontWeight: '800' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    metaText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginLeft: 4 },
    metaDivider: { width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 10 },
    content: { flex: 1 },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: -25,
        borderRadius: 20,
        paddingVertical: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    statBox: { flex: 1, alignItems: 'center' },
    statBorder: { borderRightWidth: 1, borderRightColor: '#f1f5f9' },
    statNum: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
    statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
    listContent: { padding: 20, paddingTop: 25, paddingBottom: 100 },
    studentCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    indexCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    indexText: { fontSize: 10, color: '#64748b', fontWeight: '800' },
    avatar: { width: 44, height: 44, borderRadius: 15 },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: { fontSize: 18, fontWeight: '900', color: '#800000' },
    nameContainer: { marginLeft: 12, flex: 1 },
    studentName: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    rollNo: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '600' },
    statusToggle: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    toggleOption: {
        width: 32,
        height: 32,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center'
    },
    toggleLabel: { fontSize: 11, fontWeight: '900', color: '#cbd5e1' },
    activeLabel: { color: '#fff' },
    pActive: { backgroundColor: '#10b981' },
    aActive: { backgroundColor: '#ef4444' },
    odActive: { backgroundColor: '#3b82f6' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 25,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    submitBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#800000',
        shadowOpacity: 0.3,
        shadowRadius: 12
    },
    btnGradient: {
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
    disabledBtn: { opacity: 0.7 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default MarkAttendance;
