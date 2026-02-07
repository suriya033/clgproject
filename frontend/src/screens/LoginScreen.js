import React, { useState, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    StatusBar,
    ScrollView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, ArrowRight, Wifi } from 'lucide-react-native';
import { testAPIConnection } from '../utils/testAPI';

const LoginScreen = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const { login } = useContext(AuthContext);

    const handleTestConnection = async () => {
        setTesting(true);
        const result = await testAPIConnection();
        setTesting(false);

        if (result.success) {
            Alert.alert('✅ Connection Test', 'Server is reachable! You can now login.');
        } else {
            Alert.alert('❌ Connection Failed', 'Cannot reach server. Check console for details.');
        }
    };

    const handleLogin = async () => {
        if (!userId || !password) {
            Alert.alert('Error', 'Please enter both User ID and Password');
            return;
        }

        setLoading(true);
        const result = await login(userId, password);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Login Failed', result.message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform?.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.inner}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logoImage}
                            />
                        </View>
                        <Text style={styles.title}>RED'S UNIVERSITY</Text>
                        <Text style={styles.subtitle}>Smart College Management System</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Sign In</Text>
                        <Text style={styles.formSubtitle}>Enter your credentials to access your portal</Text>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>User ID</Text>
                            <View style={styles.inputContainer}>
                                <User size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your ID"
                                    placeholderTextColor="#94a3b8"
                                    value={userId}
                                    onChangeText={setUserId}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#94a3b8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={true}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                    <ArrowRight size={20} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.testButton}
                            onPress={handleTestConnection}
                            disabled={testing}
                            activeOpacity={0.8}
                        >
                            {testing ? (
                                <ActivityIndicator color="#800000" size="small" />
                            ) : (
                                <>
                                    <Wifi size={18} color="#800000" />
                                    <Text style={styles.testButtonText}>Test Connection</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Having trouble signing in?</Text>
                        <TouchableOpacity>
                            <Text style={styles.contactAdmin}>Contact Administrator</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    inner: {
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 10,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        borderWidth: 4,
        borderColor: '#800000'
    },
    logoImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        resizeMode: 'cover'
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#800000',
        borderRadius: 16,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        elevation: 4,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 8,
    },
    testButton: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        height: 48,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1.5,
        borderColor: '#800000',
    },
    testButtonText: {
        color: '#800000',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        color: '#64748b',
        fontSize: 14,
    },
    contactAdmin: {
        color: '#800000',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4,
    }
});

export default LoginScreen;
