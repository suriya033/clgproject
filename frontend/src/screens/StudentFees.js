import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, ScrollView,
    ActivityIndicator, StatusBar, TouchableOpacity, Linking, RefreshControl, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, CreditCard, Calendar, Receipt, CalendarClock, CheckCircle2, Clock, AlertCircle, Download } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { API_URL } from '../api/api';

const StudentFees = ({ navigation }) => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchMyFees();
    }, []);

    const fetchMyFees = async () => {
        try {
            const res = await api.get('/college/fees');
            setFees(res.data);
        } catch (error) {
            console.error('Error fetching fees:', error);
            Alert.alert('Error', 'Failed to fetch fee records.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMyFees();
    }, []);

    const handleDownloadReceipt = async (payment) => {
        try {
            const token = await AsyncStorage.getItem('token');
            // Open the receipt URL in the device browser/PDF viewer
            const receiptUrl = `${API_URL}/payments/receipt/${payment._id}?token=${token}`;
            const canOpen = await Linking.canOpenURL(receiptUrl);
            if (canOpen) {
                await Linking.openURL(receiptUrl);
            } else {
                Alert.alert('Error', 'Unable to open receipt. Please try again.');
            }
        } catch (error) {
            console.error('Receipt download error:', error);
            Alert.alert('Error', 'Failed to download receipt.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Paid': return { color: '#10b981', bg: '#dcfce7', Icon: CheckCircle2 };
            case 'Overdue': return { color: '#ef4444', bg: '#fee2e2', Icon: AlertCircle };
            default: return { color: '#f59e0b', bg: '#fef3c7', Icon: Clock };
        }
    };

    const paidTotal = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0);
    const pendingTotal = fees.filter(f => f.status !== 'Paid').reduce((s, f) => s + f.amount, 0);

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
                <Text style={styles.headerTitle}>My Fees</Text>
                <View style={{ width: 44 }} />
            </LinearGradient>

            {/* Summary Banner */}
            {fees.length > 0 && (
                <View style={styles.summaryRow}>
                    <LinearGradient colors={['#10b981', '#059669']} style={styles.summaryCard}>
                        <CheckCircle2 size={20} color="#fff" />
                        <Text style={styles.summaryLabel}>Paid</Text>
                        <Text style={styles.summaryAmount}>₹{paidTotal.toLocaleString('en-IN')}</Text>
                    </LinearGradient>
                    <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.summaryCard}>
                        <Clock size={20} color="#fff" />
                        <Text style={styles.summaryLabel}>Pending</Text>
                        <Text style={styles.summaryAmount}>₹{pendingTotal.toLocaleString('en-IN')}</Text>
                    </LinearGradient>
                </View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />}
            >
                {fees.length === 0 ? (
                    <View style={styles.emptyState}>
                        <CreditCard size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No fee records found</Text>
                        <Text style={styles.emptySubText}>Your fee assignments will appear here.</Text>
                    </View>
                ) : (
                    fees.map((fee) => {
                        const { color, bg, Icon } = getStatusConfig(fee.status);
                        return (
                            <View key={fee._id} style={styles.feeCard}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconContainer, { backgroundColor: bg }]}>
                                        <Receipt size={22} color={color} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 14 }}>
                                        <Text style={styles.feeType}>{fee.type || fee.feeType} Fee</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                                            <Icon size={11} color={color} />
                                            <Text style={[styles.statusText, { color }]}>{fee.status}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.amountContainer}>
                                        <Text style={styles.amountLabel}>TOTAL</Text>
                                        <Text style={[styles.amountText, { color }]}>₹{fee.amount.toLocaleString('en-IN')}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardDetails}>
                                    <View style={styles.detailRow}>
                                        <CalendarClock size={15} color="#94a3b8" />
                                        <Text style={styles.detailText}>Due: {formatDate(fee.dueDate)}</Text>
                                    </View>
                                    {fee.status === 'Paid' && fee.paidDate && (
                                        <View style={styles.detailRow}>
                                            <Calendar size={15} color="#10b981" />
                                            <Text style={[styles.detailText, { color: '#10b981' }]}>Paid: {formatDate(fee.paidDate)}</Text>
                                        </View>
                                    )}
                                    {fee.transactionId && (
                                        <View style={styles.detailRow}>
                                            <CreditCard size={15} color="#94a3b8" />
                                            <Text style={styles.detailText}>TXN: {fee.transactionId}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.actionsContainer}>
                                    {fee.status !== 'Paid' ? (
                                        <TouchableOpacity
                                            style={styles.payButton}
                                            onPress={() => navigation.navigate('RazorpayCheckout', { feeId: fee._id })}
                                        >
                                            <CreditCard size={18} color="#fff" style={{ marginRight: 8 }} />
                                            <Text style={styles.payButtonText}>Pay Now</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.receiptButton}
                                            onPress={() => handleDownloadReceipt(fee)}
                                        >
                                            <Download size={16} color="#800000" style={{ marginRight: 8 }} />
                                            <Text style={styles.receiptButtonText}>Download Receipt</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        elevation: 10,
        shadowColor: '#800000',
        shadowOpacity: 0.25,
        shadowRadius: 14,
    },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.18)', padding: 10, borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.4 },
    summaryRow: { flexDirection: 'row', padding: 16, gap: 12 },
    summaryCard: {
        flex: 1,
        borderRadius: 18,
        padding: 16,
        alignItems: 'center',
        gap: 4,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
    },
    summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryAmount: { color: '#fff', fontSize: 18, fontWeight: '900' },
    content: { padding: 16, paddingBottom: 40 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 30 },
    emptyText: { color: '#475569', fontSize: 18, fontWeight: '800', marginTop: 18, textAlign: 'center' },
    emptySubText: { color: '#94a3b8', fontSize: 14, fontWeight: '500', marginTop: 6, textAlign: 'center' },
    feeCard: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 18,
        marginBottom: 14,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    iconContainer: { padding: 11, borderRadius: 14 },
    feeType: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
    statusBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 7
    },
    statusText: { fontSize: 11, fontWeight: '700' },
    amountContainer: { alignItems: 'flex-end', marginLeft: 10 },
    amountLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    amountText: { fontSize: 20, fontWeight: '900' },
    cardDetails: { gap: 8, marginBottom: 2 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    detailText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    actionsContainer: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    payButton: {
        backgroundColor: '#800000',
        padding: 13,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#800000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    payButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    receiptButton: {
        backgroundColor: '#ffe4e6',
        padding: 13,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fecdd3'
    },
    receiptButtonText: { color: '#800000', fontWeight: '800', fontSize: 15 }
});

export default StudentFees;
