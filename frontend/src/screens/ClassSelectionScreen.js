import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Platform,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    BookOpen,
    ChevronRight,
    Users,
    GraduationCap
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ClassSelectionScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            // For Staff/HOD, get classes they take from the timetable
            const res = await api.get('/timetable/staff-classes');
            setClasses(res.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderClass = ({ item }) => (
        <TouchableOpacity
            style={styles.classCard}
            onPress={() => navigation.navigate('Assignments', {
                dept: item.departmentId,
                deptName: item.departmentName,
                semester: item.semester,
                section: item.section,
                subject: item.subjectName
            })}
        >
            <View style={styles.cardInfo}>
                <View style={styles.iconContainer}>
                    <BookOpen size={24} color="#800000" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.subjectName}>{item.subjectName}</Text>
                    <Text style={styles.classDetails}>
                        {item.departmentName} • Sem {item.semester} • Sec {item.section}
                    </Text>
                </View>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Class</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.infoBox}>
                    <Users size={20} color="#64748b" />
                    <Text style={styles.infoText}>Select a class to manage assignments</Text>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#800000" />
                    </View>
                ) : (
                    <FlatList
                        data={classes}
                        renderItem={renderClass}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <GraduationCap size={64} color="#e2e8f0" />
                                <Text style={styles.emptyTitle}>No Classes Found</Text>
                                <Text style={styles.emptySub}>You are not assigned to any classes in the timetable.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingHorizontal: 20,
        paddingBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, padding: 20 },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    infoText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 20 },
    classCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10
    },
    cardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#fff1f2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    subjectName: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
    classDetails: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: '600' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#94a3b8', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#cbd5e1', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }
});

export default ClassSelectionScreen;
