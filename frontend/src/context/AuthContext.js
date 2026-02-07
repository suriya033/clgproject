import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to load user', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userId, password) => {
        try {
            const res = await api.post('/auth/login', { userId, password });
            const { token, user: userData } = res.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error('Login Error:', error);
            let errorMessage = 'Login failed.';

            if (error.response) {
                // Server responded with an error
                errorMessage = error.response.data.message || 'Invalid userId or password.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Connection timeout. The server is taking too long to respond.';
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = `Network error. Cannot reach server at ${api.defaults.baseURL}. \n\n1. Ensure backend is running.\n2. Check if your phone/emulator is on the same network.\n3. Verify the IP address in src/api/api.js.`;
            } else {
                errorMessage = error.message;
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
