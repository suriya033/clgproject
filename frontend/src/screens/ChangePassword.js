import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { auth } from '../api/api';

const ChangePassword = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            await auth.changePassword({ currentPassword, newPassword });
            Alert.alert(
                'Success',
                'Your password has been updated successfully',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update password';
            Alert.alert('Update Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Lock size={20} color="#94a3b8" style={styles.leftIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!show}
                    value={value}
                    onChangeText={onChange}
                />
                <TouchableOpacity onPress={onToggle} style={styles.eyeIcon}>
                    {show ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Account Security</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.iconContainer}>
                        <View style={styles.shieldWrapper}>
                            <ShieldCheck size={48} color="#800000" />
                        </View>
                        <Text style={styles.title}>Update Password</Text>
                        <Text style={styles.subtitle}>Keep your account secure with a strong password</Text>
                    </View>

                    <View style={styles.card}>
                        <PasswordInput
                            label="Current Password"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            show={showCurrent}
                            onToggle={() => setShowCurrent(!showCurrent)}
                        />

                        <View style={styles.divider} />

                        <PasswordInput
                            label="New Password"
                            placeholder="Min. 6 characters"
                            value={newPassword}
                            onChange={setNewPassword}
                            show={showNew}
                            onToggle={() => setShowNew(!showNew)}
                        />

                        <PasswordInput
                            label="Confirm New Password"
                            placeholder="Re-type new password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            show={showConfirm}
                            onToggle={() => setShowConfirm(!showConfirm)}
                        />

                        <View style={styles.requirements}>
                            <View style={styles.reqItem}>
                                <CheckCircle2 size={16} color={newPassword.length >= 6 ? '#22c55e' : '#cbd5e1'} />
                                <Text style={[styles.reqText, newPassword.length >= 6 && styles.reqTextActive]}>At least 6 characters</Text>
                            </View>
                            <View style={styles.reqItem}>
                                <CheckCircle2 size={16} color={newPassword && newPassword === confirmPassword ? '#22c55e' : '#cbd5e1'} />
                                <Text style={[styles.reqText, newPassword && newPassword === confirmPassword && styles.reqTextActive]}>Passwords match</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.disabledButton]}
                            onPress={handleUpdate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Update Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
        paddingTop: Platform.OS === 'ios' ? 10 : 30,
        paddingBottom: 25,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 24,
    },
    iconContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    shieldWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 5,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    leftIcon: {
        marginLeft: 15,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    eyeIcon: {
        padding: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 10,
        marginBottom: 30,
    },
    requirements: {
        marginTop: 5,
        marginBottom: 25,
    },
    reqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    reqText: {
        fontSize: 12,
        color: '#94a3b8',
        marginLeft: 8,
        fontWeight: '500',
    },
    reqTextActive: {
        color: '#22c55e',
    },
    saveButton: {
        backgroundColor: '#800000',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default ChangePassword;
