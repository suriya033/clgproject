import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    TextInput
} from 'react-native';
import { ArrowLeft, MessageSquare, Check, X, Search } from 'lucide-react-native';
import api from '../api/api';

const ComplaintViewer = ({ navigation }) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/admin/complaints');
            setComplaints(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/admin/complaints/${id}`, { status });
            // Optimistic update
            setComplaints(prev => prev.map(c =>
                c._id === id ? { ...c, status } : c
            ));
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.studentName}>{item.studentName}</Text>
                    <Text style={styles.deptInfo}>
                        {item.department} • Year {item.year} {item.section && `• Sec ${item.section}`}
                    </Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'Resolved' ? '#dcfce7' : item.status === 'Dismissed' ? '#fee2e2' : '#fef3c7' }
                ]}>
                    <Text style={{
                        color: item.status === 'Resolved' ? '#166534' : item.status === 'Dismissed' ? '#991b1b' : '#b45309',
                        fontSize: 12, fontWeight: '600'
                    }}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>

            {item.status === 'Pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#dcfce7' }]}
                        onPress={() => handleUpdateStatus(item._id, 'Resolved')}
                    >
                        <Check size={16} color="#166534" />
                        <Text style={[styles.actionText, { color: '#166534' }]}>Resolve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}
                        onPress={() => handleUpdateStatus(item._id, 'Dismissed')}
                    >
                        <X size={16} color="#991b1b" />
                        <Text style={[styles.actionText, { color: '#991b1b' }]}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const filteredComplaints = complaints.filter(c =>
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Complaints</Text>
            </View>

            <View style={styles.searchBox}>
                <Search size={20} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search complaints..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#800000" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredComplaints}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MessageSquare size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No complaints found</Text>
                        </View>
                    }
                />
            )}
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
        paddingTop: 40,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    deptInfo: {
        fontSize: 12,
        color: '#64748b',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    subject: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 12,
    },
    date: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 8,
        gap: 8,
    },
    actionText: {
        fontWeight: '600',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        color: '#94a3b8',
        fontSize: 16,
    }
});

export default ComplaintViewer;
