import React, { useState, useEffect, useContext, useRef } from 'react';
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
    LogOut,

    UserPlus,
    Edit2,
    RefreshCw,
    Menu
} from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const TransportManagement = ({ navigation }) => {
    const { user: currentUser, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('buses'); // 'buses' or 'drivers'
    const [buses, setBuses] = useState([]);
    const [filteredBuses, setFilteredBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editId, setEditId] = useState(null);

    // Tracking State
    const [trackingBus, setTrackingBus] = useState(null);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [busLocation, setBusLocation] = useState(null);
    const mapRef = useRef(null);

    // Form State
    const [busNumber, setBusNumber] = useState('');
    const [route, setRoute] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverContact, setDriverContact] = useState('');
    const [capacity, setCapacity] = useState('');

    // Driver Form State
    const [driverModalVisible, setDriverModalVisible] = useState(false);
    const [driverSubmitting, setDriverSubmitting] = useState(false);
    const [driverUserId, setDriverUserId] = useState('');
    const [driverPassword, setDriverPassword] = useState('');
    const [driverNameInput, setDriverNameInput] = useState('');
    const [driverEmail, setDriverEmail] = useState('');
    const [driverContactInput, setDriverContactInput] = useState('');

    // Drivers List for Selection
    const [drivers, setDrivers] = useState([]);
    const [selectedDriverId, setSelectedDriverId] = useState('');

    useEffect(() => {
        fetchBuses();
        if (currentUser?.role === 'Admin' || currentUser?.role === 'Transport') {
            fetchDrivers();
        }
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await api.get('/admin/users');
            const driverUsers = response.data.filter(u => u.role === 'Driver');
            setDrivers(driverUsers);
        } catch (error) {
            console.error('Fetch drivers error:', error);
        }
    };

    // Polling for live location when map is open
    useEffect(() => {
        let interval;
        if (mapModalVisible && trackingBus) {
            fetchBusLocation(); // Initial fetch
            interval = setInterval(fetchBusLocation, 5000); // Poll every 5 seconds
        }
        return () => clearInterval(interval);
    }, [mapModalVisible, trackingBus]);

    const fetchBusLocation = async () => {
        if (!trackingBus) return;
        try {
            const response = await api.get(`/transport/bus/${trackingBus._id}/location`);
            if (response.data.location && response.data.location.lat) {
                setBusLocation({
                    latitude: response.data.location.lat,
                    longitude: response.data.location.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            }
        } catch (error) {
            console.error('Error fetching bus location', error);
        }
    };

    const handleTrack = (bus) => {
        setTrackingBus(bus);
        setBusLocation(null); // Reset previous location
        setMapModalVisible(true);
    };

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
        if (activeTab === 'buses') {
            fetchBuses();
        } else {
            fetchDrivers();
        }
    };

    const handleEdit = (bus) => {
        setEditId(bus._id);
        setBusNumber(bus.busNumber);
        setRoute(bus.route);
        setDriverName(bus.driverName || bus.driverId?.name || '');
        setDriverContact(bus.driverContact || bus.driverId?.mobileNo || '');
        setSelectedDriverId(bus.driverId?._id || '');
        setCapacity(bus.capacity ? bus.capacity.toString() : '');
        setModalVisible(true);
    };

    const openCreateModal = () => {
        setEditId(null);
        resetForm();
        setModalVisible(true);
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
                driverId: selectedDriverId || null,
                capacity: parseInt(capacity) || 0
            };

            if (editId) {
                await api.put(`/college/buses/${editId}`, data);
                Alert.alert('Success', 'Bus record updated');
            } else {
                await api.post('/college/buses', data);
                Alert.alert('Success', 'Bus record created');
            }

            setModalVisible(false);
            resetForm();
            setEditId(null);
            fetchBuses();
        } catch (error) {
            console.error('Create/Update bus error:', error);
            Alert.alert('Error', `Failed to ${editId ? 'update' : 'create'} bus record`);
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

    const handleDeleteDriver = (id) => {
        Alert.alert(
            'Delete Driver',
            'Are you sure you want to delete this driver account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/users/${id}`);
                            fetchDrivers();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete driver');
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
        setSelectedDriverId('');
    };

    const handleCreateDriver = async () => {
        if (!driverUserId || !driverPassword || !driverNameInput || !driverEmail) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setDriverSubmitting(true);
            const data = {
                userId: driverUserId,
                password: driverPassword,
                name: driverNameInput,
                email: driverEmail,
                mobileNo: driverContactInput,
                role: 'Driver'
            };

            await api.post('/admin/users', data);
            Alert.alert('Success', 'Driver account created successfully');
            setDriverModalVisible(false);
            resetDriverForm();
            fetchDrivers();
        } catch (error) {
            console.error('Create driver error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create driver account');
        } finally {
            setDriverSubmitting(false);
        }
    };

    const resetDriverForm = () => {
        setDriverUserId('');
        setDriverPassword('');
        setDriverNameInput('');
        setDriverEmail('');
        setDriverContactInput('');
    };

    const renderBusCard = ({ item }) => (
        <View style={styles.busCard}>
            <View style={styles.cardHeader}>
                <View style={styles.busBadge}>
                    <Bus size={16} color="#800000" />
                    <Text style={styles.busNumberText}>{item.busNumber}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.deleteButton, { backgroundColor: '#f0f9ff', marginRight: 8 }]}>
                        <Edit2 size={18} color="#0284c7" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
                        <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.routeSection}>
                <MapPin size={18} color="#64748b" />
                <Text style={styles.routeText}>{item.route}</Text>
            </View>

            <View style={styles.driverSection}>
                <View style={styles.driverInfo}>
                    <User size={14} color="#94a3b8" />
                    <Text style={styles.driverName}>
                        {item.driverId?.name || item.driverName || 'No Driver Assigned'}
                    </Text>
                </View>
                {(item.driverId?.mobileNo || item.driverContact) && (
                    <View style={styles.driverInfo}>
                        <Phone size={14} color="#94a3b8" />
                        <Text style={styles.driverContact}>
                            {item.driverId?.mobileNo || item.driverContact}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <Clock size={14} color="#94a3b8" />
                    <Text style={styles.footerText}>Capacity: {item.capacity || 'N/A'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => handleTrack(item)}
                >
                    <Text style={styles.trackButtonText}>Track Live</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDriverCard = ({ item }) => (
        <View style={styles.busCard}>
            <View style={styles.cardHeader}>
                <View style={styles.busBadge}>
                    <User size={16} color="#800000" />
                    <Text style={styles.busNumberText}>{item.name}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteDriver(item._id)} style={styles.deleteButton}>
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.driverSection}>
                <View style={styles.driverInfo}>
                    <User size={14} color="#94a3b8" />
                    <Text style={styles.driverName}>ID: {item.userId}</Text>
                </View>
                <View style={styles.driverInfo}>
                    <Send size={14} color="#94a3b8" />
                    <Text style={styles.driverContact}>{item.email}</Text>
                </View>
                {item.mobileNo && (
                    <View style={styles.driverInfo}>
                        <Phone size={14} color="#94a3b8" />
                        <Text style={styles.driverContact}>{item.mobileNo}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    {currentUser?.role === 'Admin' ? (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
                            <Menu size={24} color="#fff" />
                        </TouchableOpacity>
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
                        {(currentUser?.role === 'Admin' || currentUser?.role === 'Transport') && (
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => activeTab === 'buses' ? openCreateModal() : setDriverModalVisible(true)}
                            >
                                <Plus size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {(currentUser?.role === 'Admin' || currentUser?.role === 'Transport') && (
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'buses' && styles.activeTab]}
                            onPress={() => setActiveTab('buses')}
                        >
                            <Text style={[styles.tabText, activeTab === 'buses' && styles.activeTabText]}>Buses</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'drivers' && styles.activeTab]}
                            onPress={() => setActiveTab('drivers')}
                        >
                            <Text style={[styles.tabText, activeTab === 'drivers' && styles.activeTabText]}>Drivers</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.searchContainer}>
                    <Search size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={activeTab === 'buses' ? "Search by bus no, route, driver..." : "Search drivers..."}
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            {
                loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#800000" />
                    </View>
                ) : (
                    <FlatList
                        data={activeTab === 'buses' ? filteredBuses : drivers.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.userId.toLowerCase().includes(searchQuery.toLowerCase()))}
                        renderItem={activeTab === 'buses' ? renderBusCard : renderDriverCard}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                {activeTab === 'buses' ? <Bus size={64} color="#cbd5e1" /> : <User size={64} color="#cbd5e1" />}
                                <Text style={styles.emptyTitle}>{activeTab === 'buses' ? 'No Buses Found' : 'No Drivers Found'}</Text>
                                <Text style={styles.emptySubtitle}>{activeTab === 'buses' ? 'Add your first college bus record' : 'Create a driver account to assign to buses'}</Text>
                            </View>
                        }
                    />
                )
            }

            {/* Bus Creation Modal */}
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
                                <Text style={styles.modalTitle}>{editId ? 'Edit Bus' : 'Add Bus'}</Text>
                                <Text style={styles.modalSubtitle}>{editId ? 'Update details' : 'Register a new transport vehicle'}</Text>
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
                                <Text style={styles.label}>Select Driver (Optional)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.driverSelector}>
                                    {drivers.map(driver => (
                                        <TouchableOpacity
                                            key={driver._id}
                                            style={[
                                                styles.driverChip,
                                                selectedDriverId === driver._id && styles.selectedDriverChip
                                            ]}
                                            onPress={() => {
                                                setSelectedDriverId(driver._id);
                                                setDriverName(driver.name);
                                                setDriverContact(driver.mobileNo || '');
                                            }}
                                        >
                                            <Text style={[
                                                styles.driverChipText,
                                                selectedDriverId === driver._id && styles.selectedDriverChipText
                                            ]}>{driver.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    {drivers.length === 0 && (
                                        <Text style={styles.noDriversText}>No driver accounts found. Create one first.</Text>
                                    )}
                                </ScrollView>
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
                                        <Text style={styles.submitButtonText}>{editId ? 'Update Bus' : 'Register Bus'}</Text>
                                        <Send size={18} color="#fff" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Driver Creation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={driverModalVisible}
                onRequestClose={() => setDriverModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Add Driver</Text>
                                <Text style={styles.modalSubtitle}>Create a new driver login account</Text>
                            </View>
                            <TouchableOpacity onPress={() => setDriverModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Login ID (User ID)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. DRV001"
                                    value={driverUserId}
                                    onChangeText={setDriverUserId}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter login password"
                                    value={driverPassword}
                                    onChangeText={setDriverPassword}
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter driver's full name"
                                    value={driverNameInput}
                                    onChangeText={setDriverNameInput}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="driver@college.com"
                                    value={driverEmail}
                                    onChangeText={setDriverEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Contact Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter mobile number"
                                    value={driverContactInput}
                                    onChangeText={setDriverContactInput}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, driverSubmitting && styles.disabledButton]}
                                onPress={handleCreateDriver}
                                disabled={driverSubmitting}
                            >
                                {driverSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitButtonText}>Create Driver Login</Text>
                                        <Send size={18} color="#fff" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Map Tracking Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={mapModalVisible}
                onRequestClose={() => setMapModalVisible(false)}
            >
                <View style={styles.fullScreenModal}>
                    <View style={styles.mapHeader}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setMapModalVisible(false)}
                        >
                            <ChevronLeft size={24} color="#1e293b" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.mapTitle}>Live Tracking</Text>
                            <Text style={styles.mapSubtitle}>
                                {trackingBus?.busNumber} • {trackingBus?.route}
                            </Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>

                    {busLocation ? (
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            provider={PROVIDER_DEFAULT}
                            initialRegion={busLocation}
                            region={busLocation}
                        >
                            <Marker
                                coordinate={busLocation}
                                title={trackingBus?.busNumber}
                                description={`Driver: ${trackingBus?.driverName || 'Unknown'}`}
                            >
                                <View style={styles.busMarker}>
                                    <Bus size={20} color="#fff" />
                                </View>
                            </Marker>
                        </MapView>
                    ) : (
                        <View style={styles.mapLoading}>
                            <ActivityIndicator size="large" color="#800000" />
                            <Text style={styles.mapLoadingText}>Locating Bus...</Text>
                        </View>
                    )}

                    <View style={styles.mapFooter}>
                        <View style={styles.driverCard}>
                            <View style={styles.driverAvatar}>
                                <Text style={styles.driverInitials}>
                                    {(trackingBus?.driverName || 'D').charAt(0)}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.driverNameMap}>{trackingBus?.driverName || 'No Driver'}</Text>
                                <Text style={styles.driverStatus}>
                                    {busLocation ? '● Live Updates' : '○ Connecting...'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={fetchBusLocation} style={styles.refreshBtn}>
                                <RefreshCw size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
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
        marginBottom: 15,
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 15,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#fff',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
    },
    activeTabText: {
        color: '#800000',
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
        backgroundColor: '#ffe4e6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    busNumberText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#800000',
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
        backgroundColor: '#800000',
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
        backgroundColor: '#800000',
        borderRadius: 18,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 8,
        shadowColor: '#800000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    disabledButton: { opacity: 0.7 },
    submitButtonText: { fontSize: 18, fontWeight: '800', color: '#fff' },
    driverSelector: { flexDirection: 'row', marginBottom: 5 },
    driverChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    selectedDriverChip: {
        backgroundColor: '#800000',
        borderColor: '#800000',
    },
    driverChipText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    selectedDriverChipText: {
        color: '#fff',
    },
    noDriversText: {
        fontSize: 14,
        color: '#94a3b8',
        fontStyle: 'italic',
        paddingVertical: 5,
    },

    // Map Modal Styles
    fullScreenModal: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        zIndex: 10,
        elevation: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        textAlign: 'center',
    },
    mapSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
        textAlign: 'center',
    },
    map: {
        flex: 1,
    },
    mapLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    mapLoadingText: {
        marginTop: 10,
        color: '#64748b',
        fontWeight: '600',
    },
    busMarker: {
        backgroundColor: '#800000',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    mapFooter: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    },
    driverCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    driverAvatar: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    driverInitials: {
        fontSize: 18,
        fontWeight: '800',
        color: '#800000',
    },
    driverNameMap: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    driverStatus: {
        fontSize: 12,
        color: '#22c55e',
        fontWeight: '600',
        marginTop: 2,
    },
    refreshBtn: {
        padding: 10,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    }
});

export default TransportManagement;
