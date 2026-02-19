import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    Dimensions,
    RefreshControl,
    Modal,
    TextInput,
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Plus,
    FileText,
    Calendar,
    BookOpen,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    Upload,
    X,
    Send,
    User,
    ChevronRight,
    FileUp
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const AssignmentsScreen = ({ navigation, route }) => {
    const { dept, deptName, semester, section, subject } = route.params || {};
    const { user } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Create Mode
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        subject: subject || '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalPoints: '100',
        section: section || user?.section || 'A'
    });
    const [attachment, setAttachment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Submission Mode
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/assignments');
            setAssignments(res.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            Alert.alert('Error', 'Failed to load assignments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handlePickAttachment = async (type) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                if (type === 'create') setAttachment(result.assets[0]);
                else setSubmissionFile(result.assets[0]);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const handleCreateAssignment = async () => {
        const { title, description, subject, dueDate } = newAssignment;
        if (!title || !description || !subject || !dueDate) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        Object.keys(newAssignment).forEach(key => formData.append(key, newAssignment[key]));
        formData.append('department', dept || user.department);
        formData.append('year', semester || user.year || '1');
        formData.append('semester', semester || user.semester || '1');

        if (attachment) {
            formData.append('attachment', {
                uri: Platform.OS === 'ios' ? attachment.uri.replace('file://', '') : attachment.uri,
                name: attachment.name,
                type: attachment.mimeType || 'application/pdf'
            });
        }

        try {
            await api.post('/assignments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowCreateModal(false);
            setNewAssignment({ title: '', description: '', subject: '', dueDate: '', totalPoints: '100', section: 'A' });
            setAttachment(null);
            fetchAssignments();
            Alert.alert('Success', 'Assignment created!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create assignment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitAssignment = async () => {
        if (!submissionFile) {
            Alert.alert('Error', 'Please select a file to submit');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('submissionFile', {
            uri: Platform.OS === 'ios' ? submissionFile.uri.replace('file://', '') : submissionFile.uri,
            name: submissionFile.name,
            type: submissionFile.mimeType || 'application/pdf'
        });

        try {
            await api.post(`/assignments/${selectedAssignment._id}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowSubmitModal(false);
            setSubmissionFile(null);
            fetchAssignments();
            Alert.alert('Success', 'Assignment submitted successfully!');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit assignment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderAssignment = ({ item }) => {
        const isPastDue = new Date(item.dueDate) < new Date();
        const statusColor = item.isSubmitted ? '#10b981' : (isPastDue ? '#ef4444' : '#f59e0b');
        const StatusIcon = item.isSubmitted ? CheckCircle2 : (isPastDue ? AlertCircle : Clock);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => {
                    if (user.role === 'Staff' || user.role === 'HOD') {
                        navigation.navigate('SubmissionList', {
                            assignmentId: item._id,
                            title: item.title
                        });
                    } else if (!item.isSubmitted && !isPastDue) {
                        setSelectedAssignment(item);
                        setShowSubmitModal(true);
                    }
                }}
            >
                <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.subjectRow}>
                            <BookOpen size={14} color="#64748b" />
                            <Text style={styles.subjectText}>{item.subject}</Text>
                        </View>
                        <View style={styles.pointsBadge}>
                            <Text style={styles.pointsText}>{item.totalPoints} pts</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.metaInfo}>
                            <Calendar size={14} color="#94a3b8" />
                            <Text style={styles.dateText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <StatusIcon size={12} color={statusColor} />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {user.role === 'Staff' ? 'View Submissions' : (item.isSubmitted ? 'Submitted' : (isPastDue ? 'Past Due' : 'Pending'))}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Assignments</Text>
                    {subject && <Text style={styles.headerSub}>{subject} - Sec {section}</Text>}
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={subject ? assignments.filter(a => a.subject === subject && a.section === section) : assignments}
                    renderItem={renderAssignment}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchAssignments} tintColor="#800000" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <FileText size={64} color="#e2e8f0" />
                            <Text style={styles.emptyTitle}>No Assignments</Text>
                            <Text style={styles.emptySub}>Assigned work will appear here.</Text>
                        </View>
                    }
                />
            )}

            {(user.role === 'Staff' || user.role === 'HOD') && (
                <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
                    <Plus size={30} color="#fff" />
                </TouchableOpacity>
            )}

            {/* Create Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Assignment</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Subject</Text>
                            <TextInput
                                style={styles.input}
                                value={newAssignment.subject}
                                onChangeText={(t) => setNewAssignment({ ...newAssignment, subject: t })}
                                placeholder="e.g. Mathematics II"
                            />
                            <Text style={styles.label}>Assignment Title</Text>
                            <TextInput
                                style={styles.input}
                                value={newAssignment.title}
                                onChangeText={(t) => setNewAssignment({ ...newAssignment, title: t })}
                                placeholder="e.g. Problem Set 1"
                            />
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, { height: 100 }]}
                                multiline
                                value={newAssignment.description}
                                onChangeText={(t) => setNewAssignment({ ...newAssignment, description: t })}
                                placeholder="Instructions..."
                            />
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={styles.label}>Due Date</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newAssignment.dueDate}
                                        onChangeText={(t) => setNewAssignment({ ...newAssignment, dueDate: t })}
                                        placeholder="YYYY-MM-DD"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Points</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newAssignment.totalPoints}
                                        onChangeText={(t) => setNewAssignment({ ...newAssignment, totalPoints: t })}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.filePicker, attachment && styles.filePickerActive]}
                                onPress={() => handlePickAttachment('create')}
                            >
                                <FileUp size={20} color={attachment ? "#800000" : "#64748b"} />
                                <Text style={[styles.filePickerText, attachment && { color: '#800000' }]}>
                                    {attachment ? attachment.name : 'Add Attachment (PDF/Image)'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.primaryBtn, isSubmitting && { opacity: 0.7 }]}
                                onPress={handleCreateAssignment}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Assign to Students</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Submit Modal */}
            <Modal visible={showSubmitModal} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.miniModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Submit Work</Text>
                            <TouchableOpacity onPress={() => setShowSubmitModal(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.subTitle}>{selectedAssignment?.title}</Text>

                        <TouchableOpacity
                            style={[styles.dropZone, submissionFile && styles.dropZoneActive]}
                            onPress={() => handlePickAttachment('submit')}
                        >
                            <Upload size={32} color={submissionFile ? "#10b981" : "#94a3b8"} />
                            <Text style={styles.dropZoneText}>
                                {submissionFile ? submissionFile.name : 'Select File (PDF Only)'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.primaryBtn, (!submissionFile || isSubmitting) && { backgroundColor: '#cbd5e1' }]}
                            onPress={handleSubmitAssignment}
                            disabled={!submissionFile || isSubmitting}
                        >
                            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Finish Submission</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingHorizontal: 20,
        paddingBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginTop: 2 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        flexDirection: 'row'
    },
    statusStrip: { width: 6 },
    cardContent: { flex: 1, padding: 18 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    subjectText: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
    pointsBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    pointsText: { fontSize: 10, fontWeight: '800', color: '#475569' },
    title: { fontSize: 17, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
    description: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 15 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
    metaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '700' },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#800000', justifyContent: 'center', alignItems: 'center', elevation: 8 },
    emptyState: { alignItems: 'center', paddingVertical: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#94a3b8', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#cbd5e1', textAlign: 'center', marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%', padding: 25 },
    miniModal: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    subTitle: { fontSize: 15, fontWeight: '700', color: '#475569', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 8, marginLeft: 5 },
    input: { backgroundColor: '#f1f5f9', borderRadius: 15, padding: 15, fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 15 },
    row: { flexDirection: 'row' },
    filePicker: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 15, borderRadius: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: '#cbd5e1', marginBottom: 20 },
    filePickerActive: { backgroundColor: '#fff1f2', borderColor: '#800000' },
    filePickerText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    primaryBtn: { backgroundColor: '#800000', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    dropZone: { height: 150, borderWidth: 2, borderStyle: 'dashed', borderColor: '#e2e8f0', borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', marginBottom: 25 },
    dropZoneActive: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
    dropZoneText: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }
});

export default AssignmentsScreen;
