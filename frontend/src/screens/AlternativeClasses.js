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
    Dimensions,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Calendar, BookOpen, Clock, User, Building2, UserCircle } from 'lucide-react-native';
import api from '../api/api';

const AlternativeClasses = ({ navigation }) => {
    const [substitutions, setSubstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSubstitutions = async () => {
        try {
            const res = await api.get('/staff-requests/my-substitutions');
            setSubstitutions(res.data);
            
            // Mark as notified when viewed
            await api.post('/staff-requests/mark-notified');
        } catch (error) {
            console.error('Error fetching substitutions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSubstitutions();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSubstitutions();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <LinearGradient
                    colors={['#800000', '#a00000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dateTag}
                >
                    <Calendar size={14} color="#fff" />
                    <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('en-GB')}</Text>
                </LinearGradient>
                <View style={[styles.statusBadge, item.isAccepted ? styles.accepted : styles.pending]}>
                    <Text style={[styles.statusText, item.isAccepted ? styles.acceptedText : styles.pendingText]}>
                        {item.isAccepted ? 'Confirmed' : 'Assigned'}
                    </Text>
                </View>
            </View>

            <Text style={styles.subjectText}>{item.subject}</Text>
            
            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Clock size={16} color="#64748b" />
                    <Text style={styles.detailText}>{item.startTime} - {item.endTime}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Building2 size={16} color="#64748b" />
                    <Text style={styles.detailText}>{item.department?.name} • Sem {item.semester} Sec {item.section}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.originalStaffRow}>
                <View style={styles.staffIconBg}>
                    <UserCircle size={20} color="#800000" />
                </View>
                <View>
                    <Text style={styles.staffLabel}>Original Faculty</Text>
                    <Text style={styles.staffName}>{item.originalStaff?.name}</Text>
                </View>
            </View>

            <View style={styles.footerInfo}>
                <Text style={styles.footerText}>Substitution for leave request</Text>
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
                    <Text style={styles.headerTitle}>Shift Duties</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSub}>Alternative Class Assignments</Text>
            </LinearGradient>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={substitutions}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <BookOpen size={60} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No Shift Duties</Text>
                            <Text style={styles.emptySub}>You haven't been assigned any alternative classes yet.</Text>
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
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    dateTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    dateText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pending: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa' },
    accepted: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
    statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    pendingText: { color: '#9a3412' },
    acceptedText: { color: '#166534' },
    subjectText: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 15 },
    detailsRow: { gap: 10, marginBottom: 20 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    divider: { height: 1.5, backgroundColor: '#f1f5f9', marginBottom: 15 },
    originalStaffRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    staffIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', elevation: 2, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
    staffLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
    staffName: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    footerInfo: { marginTop: 15, alignSelf: 'flex-end' },
    footerText: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 120, paddingHorizontal: 40 },
    emptyTitle: { marginTop: 20, fontSize: 20, fontWeight: '900', color: '#1e293b' },
    emptySub: { marginTop: 8, fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22, fontWeight: '500' }
});

export default AlternativeClasses;
