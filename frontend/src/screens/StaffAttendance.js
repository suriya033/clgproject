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
    Alert,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, BookOpen, Layers, Users, Clock, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const StaffAttendance = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        fetchClassesForDate(selectedDate);
    }, [selectedDate]);

    const fetchClassesForDate = async (date) => {
        setLoading(true);
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const res = await api.get(`/attendance/staff-classes-today?date=${dateStr}`);
            setClasses(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event, date) => {
        setShowPicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const renderClassItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.deptBadge}>
                    <Layers size={14} color="#800000" />
                    <Text style={styles.deptText}>{item.department}</Text>
                </View>
                <View style={styles.sectionBadge}>
                    <Users size={14} color="#059669" />
                    <Text style={styles.sectionText}>Sec {item.section}</Text>
                </View>
            </View>

            <Text style={styles.subjectName}>{item.subject}</Text>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Clock size={14} color="#64748b" />
                    <Text style={styles.infoText}>{item.startTime} - {item.endTime}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Calendar size={14} color="#64748b" />
                    <Text style={styles.infoText}>Sem {item.semester}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.markAttendanceBtn}
                onPress={() => {
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    navigation.navigate('MarkAttendance', {
                        classDetails: { ...item, date: dateStr }
                    });
                }}
            >
                <Text style={styles.btnText}>Mark Attendance</Text>
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
                    <Text style={styles.headerTitle}>Daily Attendance</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.dateInfo}>
                    <View style={styles.dateRow}>
                        <View>
                            <Text style={styles.todayLabel}>{selectedDate.toDateString() === new Date().toDateString() ? "Today's Schedule" : "Selected Date"}</Text>
                            <Text style={styles.dateText}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                        </View>
                        <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowPicker(true)}>
                            <Calendar size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
                {showPicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                    />
                )}
            </LinearGradient>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#800000" />
                        <Text style={styles.loadingText}>Loading today's classes...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={classes}
                        renderItem={renderClassItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <BookOpen size={50} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No classes scheduled for today</Text>
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
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
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
    dateInfo: {
        marginTop: 5
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    calendarBtn: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12
    },
    todayLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
    dateText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 2 },
    content: { flex: 1 },
    listContent: { padding: 20 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, color: '#64748b', fontWeight: '600' },
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
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    infoText: { color: '#64748b', marginLeft: 6, fontWeight: '500', fontSize: 13 },
    markAttendanceBtn: {
        backgroundColor: '#800000',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center'
    },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, color: '#94a3b8', fontSize: 16, fontWeight: '600' }
});

export default StaffAttendance;
