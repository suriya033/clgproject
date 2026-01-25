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
            let errorMessage = 'Login failed. Please check your network connection.';

            if (error.response) {
                console.error('Response Data:', error.response.data);
                console.error('Response Status:', error.response.status);
                errorMessage = error.response.data.message || 'Server error occurred.';
            } else if (error.request) {
                console.error('No response received:', error.request);
                errorMessage = 'Network error. Cannot reach server. Check if your phone is on the same Wi-Fi as the PC.';
            } else {
                console.error('Error Message:', error.message);
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
