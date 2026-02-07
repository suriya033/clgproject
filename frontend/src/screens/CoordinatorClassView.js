import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Users,
    Search,
    Filter,
    Phone,
    Mail,
    Info,
    LayoutDashboard,
    PieChart,
    UserCircle2
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const CoordinatorClassView = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ presentAvg: 0, totalStudents: 0 });

    const classInfo = user?.coordinatorDetails;

    useEffect(() => {
        if (classInfo) {
            fetchClassData();
        } else {
            setLoading(false);
            Alert.alert('Error', 'You are not assigned as a coordinator for any class.');
            navigation.goBack();
        }
    }, []);

    const fetchClassData = async () => {
        try {
            setRefreshing(true);
            const response = await api.get('/admin/coordinator/students');
            setStudents(response.data);
            setStats({
                totalStudents: response.data.length,
                pendingTasks: 4 // Mock
            });
        } catch (error) {
            console.error('Fetch class data error:', error);
            Alert.alert('Error', 'Failed to load class details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const renderStudentCard = ({ item }) => (
        <TouchableOpacity
            style={styles.studentCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('StudentProfileView', { studentId: item._id })}
        >
            <View style={styles.studentInfo}>
                {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </View>
                )}
                <View style={styles.nameContainer}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentId}>{item.userId}</Text>
                </View>
            </View>
            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.miniAction, { backgroundColor: '#f0f9ff' }]}>
                    <Phone size={16} color="#0284c7" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.miniAction, { backgroundColor: '#fdf2f8' }]}>
                    <Mail size={16} color="#db2777" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.miniAction, { backgroundColor: '#f8fafc' }]}
                    onPress={() => navigation.navigate('StudentProfileView', { studentId: item._id })}
                >
                    <Info size={16} color="#64748b" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#800000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Coordinator Class</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.classBanner}>
                    <View style={styles.classBannerRow}>
                        <View style={styles.bannerIcon}>
                            <LayoutDashboard size={24} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.bannerDept}>{classInfo?.department}</Text>
                            <Text style={styles.bannerDetails}>
                                Sem {classInfo?.semester} • Section {classInfo?.section}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Students</Text>
                        <Text style={styles.statValue}>{stats.totalStudents}</Text>
                    </View>
                    <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#f1f5f9' }]}>
                        <Text style={styles.statLabel}>Avg Attendance</Text>
                        <Text style={[styles.statValue, { color: '#059669' }]}>85%</Text>
                    </View>
                </View>

                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Enrolled Students ({students.length})</Text>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Filter size={18} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={students}
                    renderItem={renderStudentCard}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listPadding}
                    refreshing={refreshing}
                    onRefresh={fetchClassData}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <UserCircle2 size={60} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No students assigned to this class.</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: StatusBar.currentHeight || 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    classBanner: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    classBannerRow: { flexDirection: 'row', alignItems: 'center' },
    bannerIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    bannerDept: { color: '#fff', fontSize: 18, fontWeight: '700' },
    bannerDetails: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
    content: { flex: 1, marginTop: -20 },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    statBox: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 12
    },
    listTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    filterBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    listPadding: { paddingHorizontal: 20, paddingBottom: 30 },
    studentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 44, height: 44, borderRadius: 14 },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: { fontSize: 18, fontWeight: '800', color: '#800000' },
    nameContainer: { marginLeft: 12 },
    studentName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    studentId: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 8 },
    miniAction: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#94a3b8', fontSize: 15, marginTop: 12 }
});

export default CoordinatorClassView;
