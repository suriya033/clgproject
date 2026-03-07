import React, { useState, useRef, useCallback } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
    Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { auth } from '../api/api';

// ── Defined OUTSIDE parent to prevent remount on every keystroke ──────────
const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder, returnKeyType, onSubmitEditing, inputRef }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputWrapper, value.length > 0 && styles.inputWrapperActive]}>
            <Lock size={18} color={value.length > 0 ? '#800000' : '#94a3b8'} style={styles.leftIcon} />
            <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#cbd5e1"
                secureTextEntry={!show}
                value={value}
                onChangeText={onChange}
                returnKeyType={returnKeyType || 'next'}
                onSubmitEditing={onSubmitEditing}
                blurOnSubmit={returnKeyType === 'done'}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity onPress={onToggle} style={styles.eyeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {show
                    ? <EyeOff size={20} color="#94a3b8" />
                    : <Eye size={20} color="#94a3b8" />
                }
            </TouchableOpacity>
        </View>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────
const ChangePassword = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Refs for keyboard navigation
    const newPassRef = useRef(null);
    const confirmPassRef = useRef(null);

    const passwordStrength = useCallback(() => {
        if (!newPassword) return { level: 0, label: '', color: '#e2e8f0' };
        if (newPassword.length < 6) return { level: 1, label: 'Too Short', color: '#ef4444' };
        if (newPassword.length < 8) return { level: 2, label: 'Weak', color: '#f59e0b' };
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);
        const hasSymbol = /[^a-zA-Z0-9]/.test(newPassword);
        const score = [hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
        if (score === 3) return { level: 4, label: 'Strong', color: '#10b981' };
        if (score >= 1) return { level: 3, label: 'Good', color: '#3b82f6' };
        return { level: 2, label: 'Weak', color: '#f59e0b' };
    }, [newPassword]);

    const strength = passwordStrength();
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

    const handleUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Weak Password', 'New password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Mismatch', 'New passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            await auth.changePassword({ currentPassword, newPassword });
            Alert.alert('Password Updated', 'Your password has been changed successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Update Failed', error.response?.data?.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Security</Text>
                <View style={{ width: 44 }} />
            </LinearGradient>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Icon Header */}
                    <View style={styles.iconContainer}>
                        <View style={styles.shieldWrapper}>
                            <ShieldCheck size={44} color="#800000" />
                        </View>
                        <Text style={styles.title}>Update Password</Text>
                        <Text style={styles.subtitle}>Keep your account secure with a strong, unique password</Text>
                    </View>

                    <View style={styles.card}>
                        {/* Current Password */}
                        <PasswordInput
                            label="Current Password"
                            placeholder="Enter your current password"
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            show={showCurrent}
                            onToggle={() => setShowCurrent(p => !p)}
                            returnKeyType="next"
                            onSubmitEditing={() => newPassRef.current?.focus()}
                        />

                        <View style={styles.divider} />

                        {/* New Password */}
                        <PasswordInput
                            label="New Password"
                            placeholder="Minimum 6 characters"
                            value={newPassword}
                            onChange={setNewPassword}
                            show={showNew}
                            onToggle={() => setShowNew(p => !p)}
                            inputRef={newPassRef}
                            returnKeyType="next"
                            onSubmitEditing={() => confirmPassRef.current?.focus()}
                        />

                        {/* Strength Bar */}
                        {newPassword.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthBars}>
                                    {[1, 2, 3, 4].map(i => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.strengthBar,
                                                { backgroundColor: i <= strength.level ? strength.color : '#e2e8f0' }
                                            ]}
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                            </View>
                        )}

                        {/* Confirm Password */}
                        <PasswordInput
                            label="Confirm New Password"
                            placeholder="Re-type your new password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            show={showConfirm}
                            onToggle={() => setShowConfirm(p => !p)}
                            inputRef={confirmPassRef}
                            returnKeyType="done"
                            onSubmitEditing={handleUpdate}
                        />

                        {/* Validation Checklist */}
                        <View style={styles.requirements}>
                            <View style={styles.reqItem}>
                                <CheckCircle2 size={15} color={newPassword.length >= 6 ? '#22c55e' : '#cbd5e1'} />
                                <Text style={[styles.reqText, newPassword.length >= 6 && styles.reqTextActive]}>
                                    At least 6 characters
                                </Text>
                            </View>
                            <View style={styles.reqItem}>
                                <CheckCircle2 size={15} color={passwordsMatch ? '#22c55e' : '#cbd5e1'} />
                                <Text style={[styles.reqText, passwordsMatch && styles.reqTextActive]}>
                                    Passwords match
                                </Text>
                            </View>
                        </View>

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.disabledButton]}
                            onPress={handleUpdate}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.saveButtonText}>Update Password</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 42, paddingBottom: 22,
        borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
        elevation: 10, shadowColor: '#800000', shadowOpacity: 0.25, shadowRadius: 14,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 13,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },

    scrollContent: { padding: 20, paddingBottom: 50 },

    iconContainer: { alignItems: 'center', marginVertical: 24 },
    shieldWrapper: {
        width: 84, height: 84, borderRadius: 42,
        backgroundColor: '#ffe4e6', justifyContent: 'center', alignItems: 'center',
        marginBottom: 14, elevation: 4,
        shadowColor: '#800000', shadowOpacity: 0.15, shadowRadius: 12,
    },
    title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    subtitle: {
        fontSize: 14, color: '#64748b', textAlign: 'center',
        marginTop: 6, paddingHorizontal: 24, lineHeight: 20,
    },

    card: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 15,
    },

    inputGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, letterSpacing: 0.3 },

    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f8fafc', borderRadius: 14,
        borderWidth: 1.5, borderColor: '#e2e8f0',
    },
    inputWrapperActive: { borderColor: '#800000', backgroundColor: '#fff' },
    leftIcon: { marginLeft: 14 },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    eyeBtn: { padding: 13 },

    // Strength Bar
    strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -8, marginBottom: 18 },
    strengthBars: { flex: 1, flexDirection: 'row', gap: 5 },
    strengthBar: { flex: 1, height: 4, borderRadius: 4 },
    strengthLabel: { fontSize: 12, fontWeight: '700', minWidth: 55, textAlign: 'right' },

    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8, marginBottom: 20 },

    requirements: { marginTop: 4, marginBottom: 24, gap: 8 },
    reqItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    reqText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
    reqTextActive: { color: '#22c55e', fontWeight: '600' },

    saveButton: {
        backgroundColor: '#800000', paddingVertical: 17, borderRadius: 14,
        alignItems: 'center', elevation: 5,
        shadowColor: '#800000', shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3, shadowRadius: 10,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
    disabledButton: { opacity: 0.65 },
});

export default ChangePassword;
