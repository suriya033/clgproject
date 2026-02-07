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
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check, X, UserMinus } from 'lucide-react-native';
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
            setStudents(res.data);
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

    const renderStudentItem = ({ item }) => (
        <View style={styles.studentCard}>
            <View style={styles.studentInfo}>
                {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </View>
                )}
                <View style={styles.nameContainer}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.rollNo}>{item.userId}</Text>
                </View>
            </View>

            <View style={styles.optionsContainer}>
                <TouchableOpacity
                    style={[styles.optionBtn, item.status === 'P' && styles.presentBtn]}
                    onPress={() => updateStatus(item._id, 'P')}
                >
                    <Text style={[styles.optionText, item.status === 'P' && styles.activeText]}>P</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.optionBtn, item.status === 'A' && styles.absentBtn]}
                    onPress={() => updateStatus(item._id, 'A')}
                >
                    <Text style={[styles.optionText, item.status === 'A' && styles.activeText]}>A</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.optionBtn, item.status === 'OD' && styles.odBtn]}
                    onPress={() => updateStatus(item._id, 'OD')}
                >
                    <Text style={[styles.optionText, item.status === 'OD' && styles.activeText]}>OD</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mark Attendance</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.classInfo}>
                    <Text style={styles.className}>{classDetails.subject}</Text>
                    <Text style={styles.classSub}>{new Date(classDetails.date).toDateString()} • Sem {classDetails.semester} • Sec {classDetails.section}</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#800000" />
                    </View>
                ) : (
                    <>
                        <View style={styles.listHeader}>
                            <Text style={styles.countText}>{students.length} Students</Text>
                            <View style={styles.legend}>
                                <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#10b981' }]} /><Text style={styles.legendText}>Present</Text></View>
                                <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendText}>Absent</Text></View>
                            </View>
                        </View>
                        <FlatList
                            data={students}
                            renderItem={renderStudentItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.listContent}
                        />
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && styles.disabledBtn]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitText}>Submit Attendance</Text>
                                )}
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
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    classInfo: {
        marginTop: 5
    },
    className: { color: '#fff', fontSize: 18, fontWeight: '700' },
    classSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    content: { flex: 1 },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10
    },
    countText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    legend: { flexDirection: 'row' },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 15 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
    legendText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    listContent: { padding: 15, paddingBottom: 100 },
    studentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: '#800000' },
    nameContainer: { marginLeft: 12 },
    studentName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    rollNo: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
    optionsContainer: { flexDirection: 'row', gap: 8 },
    optionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
    },
    optionText: { fontSize: 12, fontWeight: '800', color: '#94a3b8' },
    presentBtn: { backgroundColor: '#10b981', borderColor: '#10b981' },
    absentBtn: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    odBtn: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    activeText: { color: '#fff' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    submitBtn: {
        backgroundColor: '#800000',
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#800000',
        shadowOpacity: 0.2,
        shadowRadius: 8
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    disabledBtn: { opacity: 0.7 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default MarkAttendance;
