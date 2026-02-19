import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Platform,
    TextInput,
    Linking,
    Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Download,
    CheckCircle2,
    User,
    FileText,
    Clock,
    Send,
    ExternalLink,
    X
} from 'lucide-react-native';
import api from '../api/api';

const SubmissionList = ({ route, navigation }) => {
    const { assignmentId, title } = route.params;
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Grading State
    const [selectedSub, setSelectedSub] = useState(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get(`/assignments/${assignmentId}/submissions`);
            setSubmissions(res.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            Alert.alert('Error', 'Failed to load submissions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleGrade = async () => {
        if (!grade) {
            Alert.alert('Error', 'Please enter a grade');
            return;
        }

        setIsUpdating(true);
        try {
            await api.put(`/assignments/submissions/${selectedSub._id}/grade`, {
                grade,
                feedback
            });
            Alert.alert('Success', 'Submission graded!');
            setSelectedSub(null);
            setGrade('');
            setFeedback('');
            fetchSubmissions();
        } catch (error) {
            Alert.alert('Error', 'Failed to update grade');
        } finally {
            setIsUpdating(false);
        }
    };

    const renderSubmission = ({ item }) => (
        <View style={styles.subCard}>
            <View style={styles.subHeader}>
                <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.student?.name}</Text>
                    <Text style={styles.studentId}>{item.student?.userId} • {item.student?.section}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Graded' ? '#dcfce7' : '#fef9c3' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Graded' ? '#166534' : '#854d0e' }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.subBody}>
                <TouchableOpacity
                    style={styles.fileBox}
                    onPress={() => Linking.openURL(item.fileUrl)}
                >
                    <FileText size={18} color="#800000" />
                    <Text style={styles.fileName} numberOfLines={1}>{item.fileName || 'Assignment.pdf'}</Text>
                    <Download size={16} color="#64748b" />
                </TouchableOpacity>

                <View style={styles.timeRow}>
                    <Clock size={12} color="#94a3b8" />
                    <Text style={styles.timeText}>Submitted: {new Date(item.submittedAt).toLocaleString()}</Text>
                </View>

                {item.status === 'Graded' && (
                    <View style={styles.gradeBox}>
                        <Text style={styles.gradeVal}>Grade: {item.grade}</Text>
                        {item.feedback && <Text style={styles.feedbackText}>{item.feedback}</Text>}
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                    setSelectedSub(item);
                    setGrade(item.grade || '');
                    setFeedback(item.feedback || '');
                }}
            >
                <Text style={styles.actionBtnText}>{item.status === 'Graded' ? 'Edit Grade' : 'Grade Submission'}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Submissions</Text>
                    <Text style={styles.headerSub} numberOfLines={1}>{title}</Text>
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={submissions}
                    renderItem={renderSubmission}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    onRefresh={fetchSubmissions}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <User size={64} color="#e2e8f0" />
                            <Text style={styles.emptyTitle}>No Submissions Yet</Text>
                            <Text style={styles.emptySub}>Student work will appear here as they submit.</Text>
                        </View>
                    }
                />
            )}

            {/* Grading Modal */}
            <Modal visible={!!selectedSub} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Grade Submission</Text>
                            <TouchableOpacity onPress={() => setSelectedSub(null)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Student: {selectedSub?.student?.name}</Text>

                        <Text style={[styles.label, { marginTop: 20 }]}>Grade / Marks</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 95/100 or A+"
                            value={grade}
                            onChangeText={setGrade}
                        />

                        <Text style={styles.label}>Feedback (Optional)</Text>
                        <TextInput
                            style={[styles.input, { height: 100 }]}
                            multiline
                            placeholder="Add constructive comments..."
                            value={feedback}
                            onChangeText={setFeedback}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[styles.primaryBtn, isUpdating && { opacity: 0.7 }]}
                            onPress={handleGrade}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Submit Grade</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingVertical: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 25, borderBottomRightRadius: 25, paddingTop: Platform.OS === 'android' ? 40 : 20 },
    headerTitleContainer: { flex: 1, marginLeft: 15 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 15 },
    subCard: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    studentName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    studentId: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700' },
    fileBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
    fileName: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#475569' },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 },
    timeText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    gradeBox: { backgroundColor: '#f0f9ff', padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#0ea5e9', marginBottom: 15 },
    gradeVal: { fontSize: 14, fontWeight: '800', color: '#0369a1' },
    feedbackText: { fontSize: 12, color: '#64748b', marginTop: 4 },
    actionBtn: { backgroundColor: '#800000', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingVertical: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#94a3b8', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#cbd5e1', textAlign: 'center', marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    label: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 8 },
    input: { backgroundColor: '#f1f5f9', borderRadius: 15, padding: 15, fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 15 },
    primaryBtn: { backgroundColor: '#800000', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});

export default SubmissionList;
