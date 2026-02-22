import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, ScrollView,
    ActivityIndicator, StatusBar, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, BookOpen, Clock, Calendar, CheckCircle2 } from 'lucide-react-native';
import api from '../api/api';

const StudentLibrary = ({ navigation }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyBooks();
    }, []);

    const fetchMyBooks = async () => {
        try {
            const res = await api.get('/college/library/my-books');
            setBooks(res.data);
        } catch (error) {
            console.error('Error fetching library books:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Returned': return '#10b981';
            case 'Issued': return '#f59e0b';
            case 'Overdue': return '#ef4444';
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />

            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Library</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {books.length === 0 ? (
                    <View style={styles.emptyState}>
                        <BookOpen size={60} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No books issued yet</Text>
                    </View>
                ) : (
                    books.map((book) => (
                        <View key={book._id} style={styles.bookCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconContainer}>
                                    <BookOpen size={24} color="#800000" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 15 }}>
                                    <Text style={styles.bookTitle} numberOfLines={2}>{book.bookTitle}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(book.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(book.status) }]}>{book.status}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardDetails}>
                                <View style={styles.detailRow}>
                                    <Calendar size={16} color="#64748b" />
                                    <Text style={styles.detailText}>Issued: {formatDate(book.issueDate)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Clock size={16} color="#64748b" />
                                    <Text style={styles.detailText}>Due: {formatDate(book.dueDate)}</Text>
                                </View>
                                {book.status === 'Returned' && book.returnDate && (
                                    <View style={styles.detailRow}>
                                        <CheckCircle2 size={16} color="#10b981" />
                                        <Text style={styles.detailText}>Returned: {formatDate(book.returnDate)}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 45,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
    },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
    content: { padding: 20 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { color: '#94a3b8', fontSize: 16, fontWeight: '700', marginTop: 15 },
    bookCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 15 },
    iconContainer: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 15 },
    bookTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 5 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    cardDetails: { gap: 10 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    detailText: { fontSize: 14, color: '#475569', fontWeight: '600' }
});

export default StudentLibrary;
