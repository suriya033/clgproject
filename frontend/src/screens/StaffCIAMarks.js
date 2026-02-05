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
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, BookOpen, Layers, Users, Hash } from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const StaffCIAMarks = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/timetable/staff-classes');
            setClasses(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch allotted classes');
        } finally {
            setLoading(false);
        }
    };

    const renderClassItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.deptBadge}>
                    <Layers size={14} color="#800000" />
                    <Text style={styles.deptText}>{item.departmentName}</Text>
                </View>
                <View style={styles.sectionBadge}>
                    <Users size={14} color="#059669" />
                    <Text style={styles.sectionText}>Sec {item.section}</Text>
                </View>
            </View>

            <Text style={styles.subjectName}>{item.subjectName}</Text>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Hash size={14} color="#64748b" />
                    <Text style={styles.infoText}>{item.semester} Semester</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.enterMarksBtn}
                onPress={() => Alert.alert('Info', 'Marks Entry Feature Coming Soon')}
            >
                <Text style={styles.btnText}>Enter CIA Marks</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#800000', '#5a0000']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>CIA Marks Entry</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#800000" />
                    </View>
                ) : (
                    <FlatList
                        data={classes}
                        renderItem={renderClassItem}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <BookOpen size={50} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No classes allotted in timetable</Text>
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
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: { flex: 1 },
    listContent: { padding: 20 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    deptBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff1f2',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8
    },
    deptText: { color: '#800000', fontSize: 12, fontWeight: '700', marginLeft: 6 },
    sectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d1fae5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8
    },
    sectionText: { color: '#059669', fontSize: 12, fontWeight: '700', marginLeft: 6 },
    subjectName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
    infoText: { color: '#64748b', marginLeft: 6, fontWeight: '500' },
    enterMarksBtn: {
        backgroundColor: '#800000',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center'
    },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 15, color: '#94a3b8', fontSize: 16 }
});

export default StaffCIAMarks;
