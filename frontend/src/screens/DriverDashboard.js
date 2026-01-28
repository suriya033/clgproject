import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Platform
} from 'react-native';
import {
    Bus,
    MapPin,
    Clock,
    User,
    Phone,
    LogOut,
    Navigation,
    Calendar,
    Bell,
    Settings,
    ChevronRight,
    Shield
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const DriverDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [assignedBus, setAssignedBus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchAssignedBus();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchAssignedBus = async () => {
        try {
            setLoading(true);
            const response = await api.get('/college/buses');
            // Find bus assigned to this driver
            const bus = response.data.find(b =>
                (b.driverId && (b.driverId._id === user.id || b.driverId === user.id)) ||
                b.driverName === user.name
            );
            setAssignedBus(bus);
        } catch (error) {
            console.error('Fetch assigned bus error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAssignedBus();
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#800000" />
                }
            >
                {/* Header Section */}
                <LinearGradient
                    colors={['#800000', '#5a0000']}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.name}</Text>
                        </View>
                        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                            <LogOut size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timeCard}>
                        <View style={styles.timeInfo}>
                            <Clock size={20} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                        </View>
                        <View style={styles.dateInfo}>
                            <Calendar size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Status Section */}
                    <View style={styles.statusSection}>
                        <View style={[styles.statusBadge, { backgroundColor: assignedBus ? '#dcfce7' : '#fee2e2' }]}>
                            <View style={[styles.statusDot, { backgroundColor: assignedBus ? '#22c55e' : '#ef4444' }]} />
                            <Text style={[styles.statusText, { color: assignedBus ? '#166534' : '#991b1b' }]}>
                                {assignedBus ? 'On Duty' : 'Off Duty'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.notificationBtn}>
                            <Bell size={22} color="#64748b" />
                            <View style={styles.notifBadge} />
                        </TouchableOpacity>
                    </View>

                    {/* Assigned Bus Card */}
                    <Text style={styles.sectionTitle}>Assigned Vehicle</Text>
                    {assignedBus ? (
                        <View style={styles.busCard}>
                            <View style={styles.busCardHeader}>
                                <View style={styles.busIconContainer}>
                                    <Bus size={32} color="#800000" />
                                </View>
                                <View style={styles.busInfo}>
                                    <Text style={styles.busNumber}>{assignedBus.busNumber}</Text>
                                    <Text style={styles.busRouteLabel}>Primary Route</Text>
                                </View>
                                <TouchableOpacity style={styles.navigationBtn}>
                                    <Navigation size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.routeContainer}>
                                <MapPin size={18} color="#64748b" />
                                <Text style={styles.routeText}>{assignedBus.route}</Text>
                            </View>

                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Capacity</Text>
                                    <Text style={styles.statValue}>{assignedBus.capacity || '50'} Seats</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Status</Text>
                                    <Text style={styles.statValue}>Active</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyCard}>
                            <Bus size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No bus assigned yet</Text>
                            <Text style={styles.emptySubtext}>Contact transport office for assignment</Text>
                        </View>
                    )}

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity style={styles.actionCard}>
                            <View style={[styles.actionIcon, { backgroundColor: '#ffe4e6' }]}>
                                <Navigation size={24} color="#800000" />
                            </View>
                            <Text style={styles.actionLabel}>Start Trip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard}>
                            <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
                                <Shield size={24} color="#f59e0b" />
                            </View>
                            <Text style={styles.actionLabel}>Safety Check</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard}>
                            <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
                                <Settings size={24} color="#22c55e" />
                            </View>
                            <Text style={styles.actionLabel}>Vehicle Info</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Support Section */}
                    <TouchableOpacity style={styles.supportCard}>
                        <View style={styles.supportInfo}>
                            <View style={styles.supportIcon}>
                                <Phone size={20} color="#800000" />
                            </View>
                            <View>
                                <Text style={styles.supportTitle}>Transport Office</Text>
                                <Text style={styles.supportSub}>Emergency Contact</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    userName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginTop: 4,
    },
    logoutButton: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 15,
        borderRadius: 20,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    timeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    content: {
        paddingHorizontal: 24,
        marginTop: -20,
    },
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 15,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
    },
    notificationBtn: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    notifBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 2,
        borderColor: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 15,
    },
    busCard: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        marginBottom: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
    },
    busCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    busIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    busInfo: {
        flex: 1,
        marginLeft: 15,
    },
    busNumber: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1e293b',
    },
    busRouteLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 2,
    },
    navigationBtn: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: '#800000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
    },
    routeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
        marginLeft: 10,
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#f1f5f9',
    },
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 40,
        alignItems: 'center',
        marginBottom: 25,
        borderWidth: 2,
        borderColor: '#f1f5f9',
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#475569',
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 5,
        textAlign: 'center',
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    actionCard: {
        width: '30%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 25,
        marginBottom: 40,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    supportInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    supportIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    supportTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    supportSub: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    }
});

export default DriverDashboard;
