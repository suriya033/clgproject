import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react-native';
import api from '../api/api';

const StudentComplaint = ({ navigation }) => {
    const [recipient, setRecipient] = useState('HOD'); // HOD or Admin
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/admin/complaints', {
                recipient,
                subject,
                message
            });
            Alert.alert('Success', 'Complaint submitted successfully');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Submit Complaint</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.warningBox}>
                        <AlertTriangle size={24} color="#d97706" style={{ marginBottom: 8 }} />
                        <Text style={styles.warningText}>
                            Please use this form responsibly.
                            Your complaints are sent directly to the selected authority.
                        </Text>
                    </View>

                    <Text style={styles.label}>To:</Text>
                    <View style={styles.roleSelector}>
                        {['HOD', 'Admin'].map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={[
                                    styles.roleButton,
                                    recipient === role && styles.roleButtonActive
                                ]}
                                onPress={() => setRecipient(role)}
                            >
                                <Text style={[
                                    styles.roleButtonText,
                                    recipient === role && styles.roleButtonTextActive
                                ]}>{role}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Subject:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Brief subject of your complaint"
                        value={subject}
                        onChangeText={setSubject}
                    />

                    <Text style={styles.label}>Message:</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your issue in detail..."
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Send size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Sending...' : 'Send Complaint'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#800000',
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    warningBox: {
        backgroundColor: '#fffbeb',
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#d97706',
        marginBottom: 24,
        alignItems: 'center'
    },
    warningText: {
        color: '#92400e',
        fontSize: 14,
        textAlign: 'center'
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    roleSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12
    },
    roleButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    roleButtonActive: {
        backgroundColor: '#800000',
        borderColor: '#800000'
    },
    roleButtonText: {
        color: '#64748b',
        fontWeight: '600'
    },
    roleButtonTextActive: {
        color: '#fff'
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#0f172a',
        marginBottom: 20,
    },
    textArea: {
        height: 150,
    },
    submitButton: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7
    }
});

export default StudentComplaint;
