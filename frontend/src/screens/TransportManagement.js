import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
    RefreshControl,
    FlatList
} from 'react-native';
import {
    Bus,
    Plus,
    X,
    ChevronLeft,
    Send,
    Search,
    MapPin,
    User,
    Phone,
    Trash2,
    Users,
    Clock,
    LogOut
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const TransportManagement = ({ navigation }) => {
    const { user: currentUser, logout } = useContext(AuthContext);
    const [buses, setBuses] = useState([]);
    const [filteredBuses, setFilteredBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [busNumber, setBusNumber] = useState('');
    const [route, setRoute] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverContact, setDriverContact] = useState('');
    const [capacity, setCapacity] = useState('');

    useEffect(() => {
        fetchBuses();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredBuses(buses);
        } else {
            const filtered = buses.filter(bus =>
                bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bus.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bus.driverName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBuses(filtered);
        }
    }, [searchQuery, buses]);

    const fetchBuses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/college/buses');
            setBuses(response.data);
            setFilteredBuses(response.data);
        } catch (error) {
            console.error('Fetch buses error:', error);
            Alert.alert('Error', 'Failed to fetch transport data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchBuses();
    };

    const handleSubmit = async () => {
        if (!busNumber || !route) {
            Alert.alert('Error', 'Please fill in required fields (Bus Number, Route)');
            return;
        }

        try {
            setSubmitting(true);
            const data = {
                busNumber,
                route,
                driverName,
                driverContact,
                capacity: parseInt(capacity) || 0
            };

            await api.post('/college/buses', data);
            Alert.alert('Success', 'Bus record created');
            setModalVisible(false);
            resetForm();
            fetchBuses();
        } catch (error) {
            console.error('Create bus error:', error);
            Alert.alert('Error', 'Failed to create bus record');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Bus',
            'Are you sure you want to delete this bus record?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/college/buses/${id}`);
                            fetchBuses();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete bus');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setBusNumber('');
        setRoute('');
        setDriverName('');
        setDriverContact('');
        setCapacity('');
    };

    const renderBusCard = ({ item }) => (
        <View style={styles.busCard}>
            <View style={styles.cardHeader}>
                <View style={styles.busBadge}>
                    <Bus size={16} color="#4361ee" />
                    <Text style={styles.busNumberText}>{item.busNumber}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.routeSection}>
                <MapPin size={18} color="#64748b" />
                <Text style={styles.routeText}>{item.route}</Text>
            </View>

            <View style={styles.driverSection}>
                <View style={styles.driverInfo}>
                    <User size={14} color="#94a3b8" />
                    <Text style={styles.driverName}>{item.driverName || 'No Driver Assigned'}</Text>
                </View>
                {item.driverContact && (
                    <View style={styles.driverInfo}>
                        <Phone size={14} color="#94a3b8" />
                        <Text style={styles.driverContact}>{item.driverContact}</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <Clock size={14} color="#94a3b8" />
                    <Text style={styles.footerText}>Capacity: {item.capacity || 'N/A'}</Text>
                </View>
                <TouchableOpacity style={styles.trackButton}>
                    <Text style={styles.trackButtonText}>Track Live</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#4361ee', '#3f37c9']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    {currentUser?.role === 'Admin' ? (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                    <Text style={styles.headerTitle}>Transport Portal</Text>
                    <View style={{ flexDirection: 'row' }}>
                        {currentUser?.role === 'Admin' && (
                            <TouchableOpacity
                                style={[styles.iconButton, { marginRight: 10 }]}
                                onPress={() => navigation.navigate('UserManagement', { roleFilter: 'Transport' })}
                            >
                                <Users size={22} color="#fff" />
                            </TouchableOpacity>
                        )}
                        {currentUser?.role === 'Transport' && (
                            <TouchableOpacity
                                style={[styles.iconButton, { marginRight: 10 }]}
                                onPress={logout}
                            >
                                <LogOut size={22} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Plus size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by bus no, route, driver..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4361ee" />
                </View>
            ) : (
                <FlatList
                    data={filteredBuses}
                    renderItem={renderBusCard}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4361ee" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Bus size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No Buses Found</Text>
                            <Text style={styles.emptySubtitle}>Add your first college bus record</Text>
                        </View>
                    }
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Add Bus</Text>
                                <Text style={styles.modalSubtitle}>Register a new transport vehicle</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bus Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. TN-01-AB-1234"
                                    value={busNumber}
                                    onChangeText={setBusNumber}
                                    autoCapitalize="characters"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Route Description</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. City Center to College Campus"
                                    value={route}
                                    onChangeText={setRoute}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Driver Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter driver name"
                                    value={driverName}
                                    onChangeText={setDriverName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Driver Contact</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter contact number"
                                    value={driverContact}
                                    onChangeText={setDriverContact}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Capacity</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 50"
                                    value={capacity}
                                    onChangeText={setCapacity}
                                    keyboardType="numeric"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitButtonText}>Register Bus</Text>
                                        <Send size={18} color="#fff" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 40 },
    busCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    busBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    busNumberText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#4361ee',
        marginLeft: 8,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#fff1f2',
        borderRadius: 10,
    },
    routeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    routeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginLeft: 10,
        flex: 1,
    },
    driverSection: {
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 16,
        marginBottom: 15,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    driverName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginLeft: 8,
    },
    driverContact: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 15,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94a3b8',
        marginLeft: 6,
    },
    trackButton: {
        backgroundColor: '#4361ee',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    trackButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
    emptySubtitle: { fontSize: 15, color: '#64748b', marginTop: 8 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 25,
        maxHeight: '90%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25
    },
    modalTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    modalSubtitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    closeButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    },
    modalForm: { marginBottom: 10 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 10 },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 15,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    submitButton: {
        backgroundColor: '#4361ee',
        borderRadius: 18,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 8,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    disabledButton: { opacity: 0.7 },
    submitButtonText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});

export default TransportManagement;
