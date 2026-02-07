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
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Clock, CheckCircle2, XCircle, Calendar, MessageSquare } from 'lucide-react-native';
import api from '../api/api';

const StudentRequestHistory = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests/my-requests');
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle2 size={16} color="#15803d" /> };
            case 'Rejected': return { bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={16} color="#b91c1c" /> };
            case 'Pending_Coordinator': return { bg: '#fef3c7', text: '#b45309', icon: <Clock size={16} color="#b45309" /> };
            case 'Pending_HOD': return { bg: '#e0e7ff', text: '#4338ca', icon: <Clock size={16} color="#4338ca" /> };
            default: return { bg: '#f1f5f9', text: '#64748b', icon: <Clock size={16} color="#64748b" /> };
        }
    };

    const renderRequestItem = ({ item }) => {
        const statusCfg = getStatusStyle(item.status);
        const displayStatus = item.status === 'Pending_Coordinator' ? 'Pending (Coordinator)' :
            item.status === 'Pending_HOD' ? 'Pending (HOD)' : item.status;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        {statusCfg.icon}
                        <Text style={[styles.statusText, { color: statusCfg.text }]}>{displayStatus}</Text>
                    </View>
                </View>

                <Text style={styles.subject}>{item.subject}</Text>

                <View style={[styles.infoRow, { marginTop: 12 }]}>
                    <Calendar size={14} color="#64748b" />
                    <Text style={styles.infoText}>
                        {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <MessageSquare size={14} color="#64748b" />
                    <Text style={styles.infoText} numberOfLines={2}>{item.content}</Text>
                </View>

                {item.status === 'Rejected' && (item.coordinatorRemarks || item.hodRemarks) && (
                    <View style={styles.remarksContainer}>
                        <Text style={styles.remarksLabel}>Remarks:</Text>
                        <Text style={styles.remarksText}>{item.hodRemarks || item.coordinatorRemarks}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Request History</Text>
                    <View style={{ width: 40 }} />
                </View>
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
                            <Clock size={50} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No requests found</Text>
                        </View>
                    }
                />
            )}
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
    listContent: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    typeBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeText: { fontSize: 11, fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 5 },
    statusText: { fontSize: 11, fontWeight: '700' },
    subject: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    infoText: { fontSize: 13, color: '#64748b', flex: 1 },
    remarksContainer: { marginTop: 12, padding: 10, backgroundColor: '#fff5f5', borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#ef4444' },
    remarksLabel: { fontSize: 11, fontWeight: '700', color: '#b91c1c', marginBottom: 2 },
    remarksText: { fontSize: 12, color: '#991b1b' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, color: '#94a3b8', fontSize: 16, fontWeight: '600' }
});

export default StudentRequestHistory;
