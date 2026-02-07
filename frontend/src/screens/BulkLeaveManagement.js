import React, { useState, useContext, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    ActivityIndicator,
    FlatList,
    StatusBar
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Calendar,
    Users,
    BookOpen,
    CheckCircle2,
    Plus,
    X,
    LayoutDashboard,
    AlertCircle
} from 'lucide-react-native';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Removed due to lib issues
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const BulkLeaveManagement = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [existingLeaves, setExistingLeaves] = useState([]);

    // Form State
    const [scope, setScope] = useState('Department'); // Department, Year, Class
    const [year, setYear] = useState('1');
    const [section, setSection] = useState('A');
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchExistingLeaves();
    }, []);

    const fetchExistingLeaves = async () => {
        try {
            const res = await api.get('/bulk-leave/my-dept');
            setExistingLeaves(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async () => {
        if (!reason) {
            Alert.alert('Error', 'Please enter a reason for the leave');
            return;
        }

        setLoading(true);
        try {
            await api.post('/bulk-leave', {
                scope,
                year: scope !== 'Department' ? year : null,
                section: scope === 'Class' ? section : null,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                reason,
                type: 'Leave'
            });

            Alert.alert('Success', 'Bulk leave has been declared successfully');
            setShowModal(false);
            resetForm();
            fetchExistingLeaves();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save bulk leave');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setScope('Department');
        setReason('');
        setStartDate(new Date());
        setEndDate(new Date());
    };

    const renderLeaveItem = ({ item }) => (
        <View style={styles.leaveCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.scopeBadge,
                item.scope === 'Department' ? { backgroundColor: '#fee2e2' } :
                    item.scope === 'Year' ? { backgroundColor: '#e0e7ff' } : { backgroundColor: '#dcfce7' }
                ]}>
                    <Text style={[styles.scopeText,
                    item.scope === 'Department' ? { color: '#800000' } :
                        item.scope === 'Year' ? { color: '#4338ca' } : { color: '#15803d' }
                    ]}>{item.scope}</Text>
                </View>
                <Text style={styles.dateRangeText}>
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </Text>
            </View>
            <Text style={styles.leaveReason}>{item.reason}</Text>
            {item.scope !== 'Department' && (
                <View style={styles.targetRow}>
                    <Text style={styles.targetText}>Year {item.year}{item.section ? ` • Sec ${item.section}` : ''}</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bulk Leave Control</Text>
                    <TouchableOpacity onPress={() => setShowModal(true)} style={styles.iconBtn}>
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.deptSub}>{user?.department} Department</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recently Declared</Text>
                </View>

                {fetching ? (
                    <ActivityIndicator size="large" color="#800000" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={existingLeaves}
                        renderItem={renderLeaveItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={{ paddingBottom: 30 }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Calendar size={60} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No bulk leaves declared yet</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Create Leave Modal */}
            {showModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Declare Bulk Leave</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Select Scope</Text>
                            <View style={styles.scopeSelector}>
                                {['Department', 'Year', 'Class'].map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        style={[styles.scopeBtn, scope === s && styles.scopeBtnActive]}
                                        onPress={() => setScope(s)}
                                    >
                                        <Text style={[styles.scopeBtnText, scope === s && styles.scopeBtnTextActive]}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {scope !== 'Department' && (
                                <View style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Text style={styles.label}>Select Year</Text>
                                        <View style={styles.pickerContainer}>
                                            {['1', '2', '3', '4'].map(y => (
                                                <TouchableOpacity
                                                    key={y}
                                                    style={[styles.miniBtn, year === y && styles.miniBtnActive]}
                                                    onPress={() => setYear(y)}
                                                >
                                                    <Text style={[styles.miniBtnText, year === y && styles.miniBtnTextActive]}>{y}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                    {scope === 'Class' && (
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.label}>Section</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={section}
                                                onChangeText={setSection}
                                                placeholder="e.g. A"
                                            />
                                        </View>
                                    )}
                                </View>
                            )}

                            <View style={styles.dateGrid}>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateLabel}>Start Date (YYYY-MM-DD)</Text>
                                    <View style={styles.dateValueRow}>
                                        <Calendar size={16} color="#800000" />
                                        <TextInput
                                            style={styles.dateValueInput}
                                            value={startDate.toISOString().split('T')[0]}
                                            onChangeText={(text) => {
                                                const d = new Date(text);
                                                if (!isNaN(d)) setStartDate(d);
                                            }}
                                        />
                                    </View>
                                </View>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateLabel}>End Date (YYYY-MM-DD)</Text>
                                    <View style={styles.dateValueRow}>
                                        <Calendar size={16} color="#800000" />
                                        <TextInput
                                            style={styles.dateValueInput}
                                            value={endDate.toISOString().split('T')[0]}
                                            onChangeText={(text) => {
                                                const d = new Date(text);
                                                if (!isNaN(d)) setEndDate(d);
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Picker modals disabled due to library issues */}

                            <Text style={styles.label}>Reason / Event Name</Text>
                            <TextInput
                                style={[styles.input, { minHeight: 80 }]}
                                value={reason}
                                onChangeText={setReason}
                                placeholder="e.g. Annual Sports Meet / Local Holiday"
                                multiline
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Text style={styles.submitBtnText}>Declare Leave</Text>
                                        <CheckCircle2 size={20} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    deptSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', marginTop: 8, fontWeight: '600' },
    content: { flex: 1, padding: 20 },
    sectionHeader: { marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    leaveCard: {
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    scopeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    scopeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    dateRangeText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    leaveReason: { fontSize: 15, fontWeight: '700', color: '#334155' },
    targetRow: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#f8fafc', paddingTop: 8 },
    targetText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, color: '#cbd5e1', fontSize: 16, fontWeight: '600' },
    // Modal
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    closeBtn: { padding: 5 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 15 },
    scopeSelector: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
    scopeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    scopeBtnActive: { backgroundColor: '#fff', elevation: 2 },
    scopeBtnText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    scopeBtnTextActive: { color: '#800000' },
    row: { flexDirection: 'row', marginTop: 5 },
    pickerContainer: { flexDirection: 'row', gap: 8 },
    miniBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    miniBtnActive: { backgroundColor: '#800000' },
    miniBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    miniBtnTextActive: { color: '#fff' },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 15 },
    dateGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    dateBox: { width: '48%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12 },
    dateLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    dateValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateValue: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
    dateValueInput: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1e293b',
        padding: 0,
        height: 20,
        flex: 1
    },
    submitBtn: { flexDirection: 'row', backgroundColor: '#800000', borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 10, elevation: 5, shadowColor: '#800000', shadowOpacity: 0.3, shadowRadius: 10 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});

export default BulkLeaveManagement;
