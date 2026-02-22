import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, ScrollView,
    ActivityIndicator, StatusBar, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, CreditCard, Calendar, Receipt, CalendarClock } from 'lucide-react-native';
import api from '../api/api';

const StudentFees = ({ navigation }) => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyFees();
    }, []);

    const fetchMyFees = async () => {
        try {
            const res = await api.get('/college/fees');
            setFees(res.data);
        } catch (error) {
            console.error('Error fetching fees:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return '#10b981';
            case 'Pending': return '#f59e0b';
            case 'Overdue': return '#ef4444';
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />

            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fee Payments</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {fees.length === 0 ? (
                    <View style={styles.emptyState}>
                        <CreditCard size={60} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No fee records found</Text>
                    </View>
                ) : (
                    fees.map((fee) => (
                        <View key={fee._id} style={styles.feeCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconContainer}>
                                    <Receipt size={24} color="#800000" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 15 }}>
                                    <Text style={styles.feeType} numberOfLines={2}>{fee.feeType}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fee.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(fee.status) }]}>{fee.status}</Text>
                                    </View>
                                </View>
                                <View style={styles.amountContainer}>
                                    <Text style={styles.amountLabel}>Total Due</Text>
                                    <Text style={styles.amountText}>₹{fee.amount}</Text>
                                </View>
                            </View>

                            <View style={styles.cardDetails}>
                                <View style={styles.detailRow}>
                                    <CalendarClock size={16} color="#64748b" />
                                    <Text style={styles.detailText}>Due Date: {formatDate(fee.dueDate)}</Text>
                                </View>
                                {fee.status === 'Paid' && fee.paidDate && (
                                    <View style={styles.detailRow}>
                                        <Calendar size={16} color="#10b981" />
                                        <Text style={styles.detailText}>Paid Date: {formatDate(fee.paidDate)}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 45,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
    },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
    content: { padding: 20 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { color: '#94a3b8', fontSize: 16, fontWeight: '700', marginTop: 15 },
    feeCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 15 },
    iconContainer: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 15 },
    feeType: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 5 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    amountContainer: { alignItems: 'flex-end', marginLeft: 10 },
    amountLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    amountText: { fontSize: 18, fontWeight: '900', color: '#800000' },
    cardDetails: { gap: 10 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    detailText: { fontSize: 14, color: '#475569', fontWeight: '600' }
});

export default StudentFees;
