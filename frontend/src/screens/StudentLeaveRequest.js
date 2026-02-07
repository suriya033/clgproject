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
import { ChevronLeft, Send, Calendar, MessageSquare, BookOpen, SendHorizontal } from 'lucide-react-native';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Removed due to lib issues
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const StudentLeaveRequest = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const [type, setType] = useState('Leave'); // Leave or OD
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleSubmit = async () => {
        if (!subject || !content) {
            Alert.alert('Error', 'Please enter subject and content');
            return;
        }

        setLoading(true);
        try {
            await api.post('/requests/leave', {
                type,
                subject,
                content,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            Alert.alert(
                'Submited Successfully',
                'Your request has been sent to your Class Coordinator for approval.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onStartDateChange = (event, selectedDate) => {
        setShowStartPicker(false);
        // if (selectedDate) setStartDate(selectedDate);
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndPicker(false);
        // if (selectedDate) setEndDate(selectedDate);
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
                        <Text style={styles.headerTitle}>Leave / OD Request</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </LinearGradient>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        {/* Pre-filled info */}
                        <View style={styles.prefilledSection}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>From:</Text>
                                <Text style={styles.infoValue}>{user?.name} ({user?.userId})</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Class:</Text>
                                <Text style={styles.infoValue}>{user?.department} - Sec {user?.section}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Request Type Selector */}
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'Leave' && styles.typeBtnActive]}
                                onPress={() => setType('Leave')}
                            >
                                <Text style={[styles.typeBtnText, type === 'Leave' && styles.typeBtnTextActive]}>Leave Request</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'OD' && styles.typeBtnActive]}
                                onPress={() => setType('OD')}
                            >
                                <Text style={[styles.typeBtnText, type === 'OD' && styles.typeBtnTextActive]}>OD Request</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Date Pickers - Replaced with Text Inputs for reliability */}
                        <View style={styles.dateRow}>
                            <View style={styles.dateInput}>
                                <Calendar size={18} color="#800000" />
                                <View style={styles.dateTextContainer}>
                                    <Text style={styles.dateLabel}>Start Date (YYYY-MM-DD)</Text>
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

                            <View style={styles.dateInput}>
                                <Calendar size={18} color="#800000" />
                                <View style={styles.dateTextContainer}>
                                    <Text style={styles.dateLabel}>End Date (YYYY-MM-DD)</Text>
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

                        {/* Subject */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subject</Text>
                            <View style={styles.subjectInputContainer}>
                                <BookOpen size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.subjectInput}
                                    placeholder="e.g., Sick Leave / Sports Meet OD"
                                    value={subject}
                                    onChangeText={setSubject}
                                />
                            </View>
                        </View>

                        {/* Content */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Respected Mam/Sir,</Text>
                            <View style={styles.contentInputContainer}>
                                <MessageSquare size={20} color="#64748b" style={[styles.inputIcon, { marginTop: 12 }]} />
                                <TextInput
                                    style={styles.contentInput}
                                    placeholder="Write your request content here..."
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    value={content}
                                    onChangeText={setContent}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && styles.disabledBtn]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.submitBtnText}>Submit Request</Text>
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
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    content: { flex: 1, padding: 20 },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 5 },
    },
    prefilledSection: {
        paddingBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        width: 60,
    },
    infoValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700',
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 20,
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    typeBtnActive: {
        backgroundColor: '#fff',
        elevation: 2,
    },
    typeBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    typeBtnTextActive: {
        color: '#800000',
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        width: '48%',
    },
    dateTextContainer: {
        marginLeft: 10,
    },
    dateLabel: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    dateValue: {
        fontSize: 13,
        color: '#1e293b',
        fontWeight: '700',
    },
    dateValueInput: {
        fontSize: 13,
        color: '#1e293b',
        fontWeight: '700',
        padding: 0,
        height: 20
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
        marginLeft: 4,
    },
    subjectInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    subjectInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '600',
    },
    contentInputContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    contentInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1e293b',
        minHeight: 120,
        fontWeight: '500',
    },
    submitBtn: {
        flexDirection: 'row',
        backgroundColor: '#800000',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        elevation: 4,
        shadowColor: '#800000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        gap: 10
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    disabledBtn: {
        opacity: 0.7,
    },
});

export default StudentLeaveRequest;
