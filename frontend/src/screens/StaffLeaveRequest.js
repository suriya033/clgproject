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
    KeyboardAvoidingView,
    Dimensions,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Send, Calendar, MessageSquare, BookOpen, SendHorizontal, User as UserIcon, Building2, GraduationCap, ClipboardCheck, Info } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const StaffLeaveRequest = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const [leaveType, setLeaveType] = useState('Casual Leave');
    const [subject, setSubject] = useState('');
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        if (user) {
            setSubject(`Leave Application - ${user.name}`);
        }
    }, [user]);

    const leaveTypes = ['Casual Leave', 'Sick Leave', 'On Duty (OD)', 'Emergency Leave', 'Others'];

    const generateLetter = () => {
        const start = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const end = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const days = start === end ? `on ${start}` : `from ${start} to ${end}`;

        return `To,
The Head of Department,
Department of ${user?.department},
College Management System.

Subject: ${subject || 'Leave Application'}

Respected Sir/Madam,

I am writing to formally request ${leaveType} ${days}. 

Reason for Leave:
${reason || '[Please specify the reason for your leave]'}

I request you to kindly grant me permission for the same. I will ensure that my duties are covered and will resume work on ${new Date(endDate.getTime() + 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.

Thank you.

Yours sincerely,
${user?.name}
Faculty ID: ${user?.userId}
Department: ${user?.department}`;
    };

    const handleSubmit = async () => {
        if (!reason || !subject) {
            Alert.alert('Missing Information', 'Please fill in the subject and reason for your leave.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/staff-requests/leave', {
                leaveType,
                subject,
                reason,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                alternateArrangement: 'Will be organized with HOD'
            });

            Alert.alert(
                'Application Submitted',
                'Your leave request has been sent to the HOD for approval.',
                [{ text: 'Great', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert('Submission Failed', 'We couldn\'t submit your request. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event, selectedDate, isStart) => {
        if (isStart) {
            setShowStartPicker(Platform.OS === 'ios');
            if (selectedDate) setStartDate(selectedDate);
        } else {
            setShowEndPicker(Platform.OS === 'ios');
            if (selectedDate) setEndDate(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Leave Application</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <Text style={styles.headerSub}>Professional Staff Leave Request</Text>
                </LinearGradient>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        {/* Leave Type Selector */}
                        <Text style={styles.sectionLabel}>Leave Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                            {leaveTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeBadge, leaveType === type && styles.typeBadgeActive]}
                                    onPress={() => setLeaveType(type)}
                                >
                                    <Text style={[styles.typeBadgeText, leaveType === type && styles.typeBadgeTextActive]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Subject */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subject</Text>
                            <View style={styles.inputWrapper}>
                                <Info size={18} color="#94a3b8" />
                                <TextInput
                                    style={styles.input}
                                    value={subject}
                                    onChangeText={setSubject}
                                    placeholder="Enter application subject"
                                />
                            </View>
                        </View>

                        {/* Date Selection */}
                        <View style={styles.dateRow}>
                            <TouchableOpacity
                                style={styles.dateBox}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <Calendar size={18} color="#800000" />
                                <View style={styles.dateBoxInfo}>
                                    <Text style={styles.dateBoxLabel}>Starts From</Text>
                                    <Text style={styles.dateBoxValue}>{startDate.toLocaleDateString('en-GB')}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dateBox}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <Calendar size={18} color="#800000" />
                                <View style={styles.dateBoxInfo}>
                                    <Text style={styles.dateBoxLabel}>Ends On</Text>
                                    <Text style={styles.dateBoxValue}>{endDate.toLocaleDateString('en-GB')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="default"
                                onChange={(event, date) => handleDateChange(event, date, true)}
                            />
                        )}

                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="default"
                                onChange={(event, date) => handleDateChange(event, date, false)}
                            />
                        )}

                        {/* Reason Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Reason for Leave</Text>
                            <View style={styles.textAreaContainer}>
                                <MessageSquare size={18} color="#94a3b8" style={styles.textAreaIcon} />
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Detailed reason for your absence..."
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={reason}
                                    onChangeText={setReason}
                                />
                            </View>
                        </View>

                        {/* Professional Preview */}
                        <View style={styles.previewContainer}>
                            <View style={styles.previewHeader}>
                                <Text style={styles.previewTitle}>Document Preview</Text>
                                <View style={styles.previewBadge}>
                                    <Text style={styles.previewBadgeText}>Auto-Generated</Text>
                                </View>
                            </View>
                            <View style={styles.letterContent}>
                                <View style={styles.letterheadStrip} />
                                <Text style={styles.letterText}>{generateLetter()}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && styles.disabledBtn]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#800000', '#a00000']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitText}>Submit Application</Text>
                                        <SendHorizontal size={20} color="#fff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        elevation: 15,
        shadowColor: '#800000',
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    content: { flex: 1, padding: 20 },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
    },
    sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5 },
    typeScroll: { marginBottom: 25 },
    typeBadge: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        marginRight: 10,
        borderWidth: 1.5,
        borderColor: 'transparent'
    },
    typeBadgeActive: {
        backgroundColor: '#fee2e2',
        borderColor: '#800000',
    },
    typeBadgeText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    typeBadgeTextActive: { color: '#800000' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 10, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 15,
        paddingHorizontal: 15,
    },
    input: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 15, color: '#1e293b', fontWeight: '600' },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, gap: 12 },
    dateBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
        borderRadius: 18,
        padding: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    dateBoxInfo: { marginLeft: 12 },
    dateBoxLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
    dateBoxValue: { fontSize: 13, color: '#1e293b', fontWeight: '800' },
    textAreaContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 18,
        paddingHorizontal: 15,
    },
    textAreaIcon: { marginTop: 15 },
    textArea: { flex: 1, paddingVertical: 12, paddingLeft: 10, fontSize: 15, color: '#1e293b', minHeight: 100, fontWeight: '500' },
    previewContainer: { marginBottom: 30, backgroundColor: '#fcfcfc', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', padding: 15 },
    previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    previewTitle: { fontSize: 13, fontWeight: '800', color: '#64748b' },
    previewBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    previewBadgeText: { fontSize: 9, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
    letterContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    letterheadStrip: { height: 4, backgroundColor: '#800000', width: '30%', borderRadius: 2, marginBottom: 15 },
    letterText: { fontSize: 13, color: '#475569', lineHeight: 22, fontStyle: 'italic' },
    submitBtn: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#800000',
        shadowOpacity: 0.4,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
    },
    submitGradient: {
        flexDirection: 'row',
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    submitText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
    disabledBtn: { opacity: 0.7 }
});

export default StaffLeaveRequest;
