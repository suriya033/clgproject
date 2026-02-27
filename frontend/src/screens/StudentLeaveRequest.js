import React, { useState, useContext } from 'react';
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
    KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Send, Calendar, MessageSquare, BookOpen, SendHorizontal, User as UserIcon, Building2, GraduationCap } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const StudentLeaveRequest = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const [type, setType] = useState('Leave'); // Leave or OD
    const [targetRecipient, setTargetRecipient] = useState('Class Advisor'); // Class Advisor, HOD, Principal
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const generateLetter = () => {
        const start = startDate.toLocaleDateString('en-GB');
        const end = endDate.toLocaleDateString('en-GB');
        const days = start === end ? `on ${start}` : `from ${start} to ${end}`;

        let addressTo = "";
        if (targetRecipient === 'Class Advisor') addressTo = "The Class Advisor";
        else if (targetRecipient === 'HOD') addressTo = "The Head of Department";
        else addressTo = "The Principal";

        return `To,
${addressTo},
${user?.department} Department,

Respected Sir/Madam,

I am writing to formally request you to grant me ${type === 'Leave' ? 'leave' : 'On-Duty (OD) permission'} ${days}. 

The reason for my request is: ${reason || '[Please specify reason]'}.

I request you to kindly approve my application and grant me permission.

Thank you,

Yours sincerely,
${user?.name}
Roll No: ${user?.userId}
${user?.department} - ${user?.semester}th Semester`;
    };

    const handleSubmit = async () => {
        if (!reason) {
            Alert.alert('Error', 'Please enter a reason for your request');
            return;
        }

        setLoading(true);
        try {
            await api.post('/requests/leave', {
                type,
                targetRecipient,
                subject: `${type} Request - ${user?.name}`,
                content: generateLetter(),
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            Alert.alert(
                'Submitted Successfully',
                `Your request has been sent to your Class Advisor for initial approval.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit request. Please try again.');
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Smart Request</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </LinearGradient>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        {/* Recipient Selection */}
                        <Text style={styles.sectionLabel}>Apply To</Text>
                        <View style={styles.recipientContainer}>
                            <TouchableOpacity
                                style={[styles.recipientBtn, targetRecipient === 'Class Advisor' && styles.recipientBtnActive]}
                                onPress={() => setTargetRecipient('Class Advisor')}
                            >
                                <UserIcon size={24} color={targetRecipient === 'Class Advisor' ? '#fff' : '#800000'} />
                                <Text style={[styles.recipientText, targetRecipient === 'Class Advisor' && styles.recipientTextActive]}>Advisor</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.recipientBtn, targetRecipient === 'HOD' && styles.recipientBtnActive]}
                                onPress={() => setTargetRecipient('HOD')}
                            >
                                <Building2 size={24} color={targetRecipient === 'HOD' ? '#fff' : '#800000'} />
                                <Text style={[styles.recipientText, targetRecipient === 'HOD' && styles.recipientTextActive]}>HOD</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.recipientBtn, targetRecipient === 'Principal' && styles.recipientBtnActive]}
                                onPress={() => setTargetRecipient('Principal')}
                            >
                                <GraduationCap size={24} color={targetRecipient === 'Principal' ? '#fff' : '#800000'} />
                                <Text style={[styles.recipientText, targetRecipient === 'Principal' && styles.recipientTextActive]}>Principal</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Request Type */}
                        <View style={styles.typeToggle}>
                            <TouchableOpacity
                                style={[styles.typeOption, type === 'Leave' && styles.typeOptionActive]}
                                onPress={() => setType('Leave')}
                            >
                                <Text style={[styles.typeOptionText, type === 'Leave' && styles.typeOptionTextActive]}>Leave</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeOption, type === 'OD' && styles.typeOptionActive]}
                                onPress={() => setType('OD')}
                            >
                                <Text style={[styles.typeOptionText, type === 'OD' && styles.typeOptionTextActive]}>On-Duty</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Date Pickers */}
                        <View style={styles.dateRow}>
                            <TouchableOpacity
                                style={styles.dateBox}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <Calendar size={18} color="#800000" />
                                <View style={styles.dateBoxInfo}>
                                    <Text style={styles.dateBoxLabel}>From Date</Text>
                                    <Text style={styles.dateBoxValue}>{startDate.toLocaleDateString('en-GB')}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dateBox}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <Calendar size={18} color="#800000" />
                                <View style={styles.dateBoxInfo}>
                                    <Text style={styles.dateBoxLabel}>To Date</Text>
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
                            <Text style={styles.label}>Reason for Request</Text>
                            <View style={styles.textAreaContainer}>
                                <MessageSquare size={20} color="#94a3b8" style={styles.textAreaIcon} />
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Briefly explain your reason..."
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={reason}
                                    onChangeText={setReason}
                                />
                            </View>
                        </View>

                        {/* Formal Letter Output */}
                        <View style={styles.outputSection}>
                            <Text style={styles.outputLabel}>Generated Formal Letter</Text>
                            <View style={styles.letterPaper}>
                                <View style={styles.letterDecoration} />
                                <Text style={styles.letterText}>{generateLetter()}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.sendBtn, loading && styles.disabledBtn]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.sendBtnText}>Send Request</Text>
                                    <SendHorizontal size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
    content: { flex: 1, padding: 15 },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
    },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    recipientContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
    recipientBtn: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent'
    },
    recipientBtnActive: { backgroundColor: '#800000', borderColor: '#5a0000' },
    recipientText: { fontSize: 12, fontWeight: '700', color: '#1e293b', marginTop: 8 },
    recipientTextActive: { color: '#fff' },
    typeToggle: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20
    },
    typeOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    typeOptionActive: { backgroundColor: '#fff', elevation: 2 },
    typeOptionText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    typeOptionTextActive: { color: '#800000' },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
    dateBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 12,
    },
    dateBoxInfo: { marginLeft: 10 },
    dateBoxLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
    dateBoxValue: { fontSize: 13, color: '#1e293b', fontWeight: '700' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
    textAreaContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        paddingHorizontal: 15,
    },
    textAreaIcon: { marginTop: 15 },
    textArea: { flex: 1, paddingVertical: 12, paddingLeft: 10, fontSize: 15, color: '#1e293b', minHeight: 100 },
    outputSection: { marginBottom: 25 },
    outputLabel: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12, textTransform: 'uppercase' },
    letterPaper: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        minHeight: 200,
        position: 'relative',
        overflow: 'hidden'
    },
    letterDecoration: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        backgroundColor: '#800000'
    },
    letterText: { fontSize: 14, color: '#334155', lineHeight: 22, fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif' },
    sendBtn: {
        flexDirection: 'row',
        backgroundColor: '#800000',
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        elevation: 8,
        shadowColor: '#800000',
        shadowOpacity: 0.4,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
    },
    sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    disabledBtn: { opacity: 0.7 }
});

export default StudentLeaveRequest;
