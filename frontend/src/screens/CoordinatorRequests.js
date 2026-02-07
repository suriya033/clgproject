import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    Alert,
    Modal,
    TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check, X, User, Calendar, MessageSquare, BookOpen } from 'lucide-react-native';
import api from '../api/api';

const CoordinatorRequests = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [actionType, setActionType] = useState(''); // 'Approved' or 'Rejected'

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests/coordinator-list');
            setRequests(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRequests();
    }, []);

    const handleAction = (req, type) => {
        setSelectedReq(req);
        setActionType(type);
        setRemarks('');
        setModalVisible(true);
    };

    const submitAction = async () => {
        try {
            await api.post('/requests/coordinator-action', {
                requestId: selectedReq._id,
                action: actionType,
                remarks: remarks
            });

            setModalVisible(false);
            Alert.alert('Success', `Request ${actionType} successfully`);
            fetchRequests();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to process request');
        }
    };

    const renderRequestItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, item.type === 'OD' && { backgroundColor: '#e0e7ff' }]}>
                    <Text style={[styles.typeText, item.type === 'OD' && { color: '#4338ca' }]}>{item.type}</Text>
                </View>
                <Text style={styles.appliedAt}>
                    {new Date(item.appliedAt).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.studentInfo}>
                <User size={16} color="#800000" />
                <Text style={styles.studentName}>{item.student.name} ({item.student.userId})</Text>
            </View>

            <Text style={styles.subject}>{item.subject}</Text>

            <View style={styles.contentContainer}>
                <Text style={styles.contentText} numberOfLines={3}>{item.content}</Text>
            </View>

            <View style={styles.dateInfo}>
                <Calendar size={14} color="#64748b" />
                <Text style={styles.dateText}>
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleAction(item, 'Rejected')}
                >
                    <X size={18} color="#ef4444" />
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleAction(item, 'Approved')}
                >
                    <Check size={18} color="#fff" />
                    <Text style={styles.approveText}>Forward to HOD</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Leave Approvals</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSub}>Pending Student Requests</Text>
            </LinearGradient>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequestItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <BookOpen size={50} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No pending requests</Text>
                        </View>
                    }
                />
            )}

            {/* Action Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{actionType} Request</Text>
                        <Text style={styles.modalSub}>Add remarks for the student (optional)</Text>

                        <TextInput
                            style={styles.remarksInput}
                            placeholder="Enter remarks here..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={remarks}
                            onChangeText={setRemarks}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSubmit, actionType === 'Rejected' ? { backgroundColor: '#ef4444' } : { backgroundColor: '#059669' }]}
                                onPress={submitAction}
                            >
                                <Text style={styles.submitText}>{actionType === 'Approved' ? 'Approve & Forward' : 'Reject'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: 50,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 5, textAlign: 'center', fontWeight: '600' },
    listContent: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    typeBadge: { backgroundColor: '#fff1f2', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
    typeText: { fontSize: 12, fontWeight: '800', color: '#800000', textTransform: 'uppercase' },
    appliedAt: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    studentName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    subject: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
    contentContainer: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 12 },
    contentText: { fontSize: 14, color: '#475569', lineHeight: 20 },
    dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
    dateText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 14, gap: 8 },
    rejectBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fee2e2' },
    approveBtn: { backgroundColor: '#059669' },
    rejectText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
    approveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, color: '#94a3b8', fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
    modalSub: { fontSize: 14, color: '#64748b', marginBottom: 15 },
    remarksInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, minHeight: 100, marginBottom: 20, fontSize: 15 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalCancel: { paddingVertical: 12, paddingHorizontal: 20 },
    cancelText: { color: '#64748b', fontWeight: '700' },
    modalSubmit: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
    submitText: { color: '#fff', fontWeight: '700' }
});

export default CoordinatorRequests;
