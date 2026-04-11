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
    TextInput,
    Image,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check, X, User, Calendar, MessageSquare, BookOpen, ClipboardCheck } from 'lucide-react-native';
import api from '../api/api';

const StaffLeaveApprovals = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [actionType, setActionType] = useState('');

    const [approvalStage, setApprovalStage] = useState('decision'); // decision, substitution
    const [staffSchedule, setStaffSchedule] = useState([]);
    const [substitutions, setSubstitutions] = useState({}); // { slotId: replacementStaffId }
    const [freeStaffMap, setFreeStaffMap] = useState({}); // { slotId: [staff] }
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/staff-requests/hod-list');
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

    const handleAction = async (req, type) => {
        setSelectedReq(req);
        setActionType(type);
        setRemarks('');
        
        if (type === 'Approved') {
            setApprovalStage('substitution');
            setModalVisible(true);
            fetchStaffSchedule(req);
        } else {
            setApprovalStage('decision');
            setModalVisible(true);
        }
    };

    const fetchStaffSchedule = async (req) => {
        setLoadingSchedule(true);
        try {
            const res = await api.get(`/staff-requests/leave-schedule/${req._id}`);
            const schedule = res.data;
            setStaffSchedule(schedule);

            // For each class in schedule, fetch free staff
            const freeMap = {};
            for (const slot of schedule) {
                const day = slot.day;
                const startTime = slot.startTime;
                const freeRes = await api.get(`/staff-requests/free-staff?day=${day}&startTime=${startTime}`);
                freeMap[`${slot.startTime}-${slot.subject}`] = freeRes.data;
            }
            setFreeStaffMap(freeMap);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            Alert.alert('Error', 'Failed to fetch staff schedule and free faculty.');
        } finally {
            setLoadingSchedule(false);
        }
    };

    const submitAction = async () => {
        // Validate substitutions if approving
        if (actionType === 'Approved') {
            const unassigned = staffSchedule.some(slot => !substitutions[`${slot.startTime}-${slot.subject}`]);
            if (unassigned && staffSchedule.length > 0) {
                Alert.alert('Incomplete Assignment', 'Please assign a replacement staff for all classes.');
                return;
            }
        }

        try {
            const subData = staffSchedule.map(slot => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
                subject: slot.subject,
                departmentId: slot.departmentId,
                semester: slot.semester,
                section: slot.section,
                replacementStaffId: substitutions[`${slot.startTime}-${slot.subject}`]
            }));

            await api.post('/staff-requests/hod-action', {
                requestId: selectedReq._id,
                action: actionType,
                remarks: remarks,
                substitutions: subData
            });

            setModalVisible(false);
            Alert.alert('Action Taken', `The application has been ${actionType.toLowerCase()} successfully.`);
            fetchRequests();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to process the request. Please try again.');
        }
    };

    const renderSubstitutionSlot = (slot) => {
        const key = `${slot.startTime}-${slot.subject}`;
        const freeStaff = freeStaffMap[key] || [];
        const selectedSub = substitutions[key];

        return (
            <View key={key} style={styles.subSlotCard}>
                <View style={styles.subSlotHeader}>
                    <Text style={styles.subSlotTime}>{slot.startTime} - {slot.endTime}</Text>
                    <Text style={styles.subSlotClass}>{slot.semester} Sem {slot.section}</Text>
                </View>
                <Text style={styles.subSlotSubject}>{slot.subject}</Text>
                
                <Text style={styles.subSlotLabel}>Assign Replacement:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subStaffScroll}>
                    {freeStaff.length === 0 ? (
                        <Text style={styles.noStaffText}>No free faculty found for this slot</Text>
                    ) : (
                        freeStaff.map(staff => (
                            <TouchableOpacity
                                key={staff._id}
                                style={[styles.subStaffBadge, selectedSub === staff._id && styles.subStaffBadgeActive]}
                                onPress={() => setSubstitutions(prev => ({ ...prev, [key]: staff._id }))}
                            >
                                <Text style={[styles.subStaffName, selectedSub === staff._id && styles.subStaffNameActive]}>
                                    {staff.name}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>
        );
    };

    const renderRequestItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.leaveType}</Text>
                </View>
                <Text style={styles.appliedAt}>
                    Applied: {new Date(item.appliedAt).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.staffInfo}>
                {item.staff.photo ? (
                    <Image source={{ uri: item.staff.photo }} style={styles.staffAvatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <User size={18} color="#800000" />
                    </View>
                )}
                <View>
                    <Text style={styles.staffName}>{item.staff.name}</Text>
                    <Text style={styles.staffId}>{item.staff.userId} • {item.staff.department}</Text>
                </View>
            </View>

            <Text style={styles.subject}>{item.subject}</Text>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionLabel}>Reason for Leave</Text>
                <Text style={styles.sectionText}>{item.reason}</Text>
            </View>

            <View style={[styles.sectionContainer, { borderLeftColor: '#3b82f6' }]}>
                <Text style={[styles.sectionLabel, { color: '#3b82f6' }]}>Alternate Arrangement</Text>
                <Text style={styles.sectionText}>{item.alternateArrangement}</Text>
            </View>

            <View style={styles.dateRow}>
                <Calendar size={14} color="#64748b" />
                <Text style={styles.dateText}>
                    Date: {new Date(item.startDate).toLocaleDateString('en-GB')}
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
                    <Text style={styles.approveText}>Assign & Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Staff Leaves</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSub}>Review Faculty Leave Applications</Text>
            </LinearGradient>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#1e293b" />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequestItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e293b" />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <ClipboardCheck size={60} color="#cbd5e1" />
                            <Text style={styles.emptyText}>All staff are present!</Text>
                            <Text style={styles.emptySub}>No pending leave requests found.</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)} >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, approvalStage === 'substitution' && { height: '85%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {approvalStage === 'decision' ? `${actionType} Application` : 'Class Substitutions'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                            {approvalStage === 'decision' ? (
                                <>
                                    <Text style={styles.modalLabel}>Action Remarks</Text>
                                    <TextInput
                                        style={styles.remarksInput}
                                        placeholder="Add your remarks for the faculty member..."
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        value={remarks}
                                        onChangeText={setRemarks}
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={styles.modalSub}>Assign replacement staff for {selectedReq?.staff?.name}'s classes on {new Date(selectedReq?.startDate).toLocaleDateString()}</Text>
                                    
                                    {loadingSchedule ? (
                                        <ActivityIndicator size="large" color="#800000" style={{ marginTop: 40 }} />
                                    ) : (
                                        <>
                                            {staffSchedule.length === 0 ? (
                                                <View style={styles.noClassesContainer}>
                                                    <Info size={40} color="#94a3b8" />
                                                    <Text style={styles.noClassesText}>No classes scheduled for this day.</Text>
                                                </View>
                                            ) : (
                                                staffSchedule.map(slot => renderSubstitutionSlot(slot))
                                            )}
                                            
                                            <View style={styles.remarksSection}>
                                                <Text style={styles.modalLabel}>Approval Remarks (Optional)</Text>
                                                <TextInput
                                                    style={styles.remarksInputSmall}
                                                    placeholder="Remarks for the leave approval..."
                                                    value={remarks}
                                                    onChangeText={setRemarks}
                                                />
                                            </View>
                                        </>
                                    )}
                                </>
                            )}
                        </ScrollView>

                        <View style={styles.modalActions}>
                            {approvalStage === 'substitution' && (
                                <TouchableOpacity style={styles.modalBack} onPress={() => setApprovalStage('decision')}>
                                    <Text style={styles.backActionText}>Back</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.modalSubmit, actionType === 'Rejected' ? { backgroundColor: '#ef4444' } : { backgroundColor: '#059669' }]}
                                onPress={submitAction}
                                disabled={loadingSchedule}
                            >
                                <Text style={styles.submitText}>
                                    {approvalStage === 'substitution' ? 'Confirm Approval & Assignments' : `Confirm ${actionType}`}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 5, textAlign: 'center', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    listContent: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    typeBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    typeText: { fontSize: 11, fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
    appliedAt: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
    staffInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
    staffAvatar: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1, borderColor: '#f1f5f9' },
    avatarPlaceholder: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },
    staffName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    staffId: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    subject: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 15 },
    sectionContainer: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#800000' },
    sectionLabel: { fontSize: 11, fontWeight: '800', color: '#800000', textTransform: 'uppercase', marginBottom: 5, letterSpacing: 0.5 },
    sectionText: { fontSize: 14, color: '#334155', lineHeight: 20, fontWeight: '500' },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, backgroundColor: '#fff', alignSelf: 'flex-start' },
    dateText: { fontSize: 13, color: '#64748b', fontWeight: '700' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, gap: 8 },
    rejectBtn: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#fee2e2' },
    approveBtn: { backgroundColor: '#059669' },
    rejectText: { color: '#ef4444', fontWeight: '800', fontSize: 15 },
    approveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 120 },
    emptyText: { marginTop: 20, color: '#1e293b', fontSize: 20, fontWeight: '900' },
    emptySub: { marginTop: 8, color: '#94a3b8', fontSize: 14, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, elevation: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '900', color: '#1e293b' },
    modalSub: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 20, lineHeight: 18 },
    modalLabel: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 },
    remarksInput: { backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 16, padding: 18, minHeight: 120, marginBottom: 24, fontSize: 16, color: '#334155' },
    remarksInputSmall: { backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 14, color: '#334155', marginBottom: 20 },
    subSlotCard: { backgroundColor: '#f8fafc', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    subSlotHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    subSlotTime: { fontSize: 12, fontWeight: '800', color: '#800000' },
    subSlotClass: { fontSize: 11, fontWeight: '700', color: '#64748b' },
    subSlotSubject: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 15 },
    subSlotLabel: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 10 },
    subStaffScroll: { flexDirection: 'row' },
    subStaffBadge: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 10, marginRight: 8, borderWidth: 1.5, borderColor: '#f1f5f9' },
    subStaffBadgeActive: { backgroundColor: '#fee2e2', borderColor: '#800000' },
    subStaffName: { fontSize: 12, fontWeight: '700', color: '#64748b' },
    subStaffNameActive: { color: '#800000' },
    noStaffText: { fontSize: 11, color: '#ef4444', fontStyle: 'italic' },
    noClassesContainer: { alignItems: 'center', padding: 40 },
    noClassesText: { marginTop: 15, color: '#94a3b8', fontWeight: '600', fontSize: 14 },
    remarksSection: { marginTop: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, paddingBottom: 20 },
    modalBack: { paddingVertical: 12, paddingHorizontal: 15 },
    backActionText: { color: '#64748b', fontWeight: '800', fontSize: 15 },
    modalSubmit: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    submitText: { color: '#fff', fontWeight: '800', fontSize: 15 }
});

export default StaffLeaveApprovals;
