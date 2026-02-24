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

    const renderClassItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
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
            <View style={styles.cardContent}>
                <View style={styles.timeSection}>
                    <Text style={styles.startTimeText}>{item.startTime}</Text>
                    <View style={styles.timeDivider} />
                    <Text style={styles.endTimeText}>{item.endTime}</Text>
                </View>

                <View style={styles.mainInfo}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.subjectName} numberOfLines={1}>{item.subject}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: item.isMarked ? '#ecfeff' : '#fff7ed' }]}>
                            <View style={[styles.statusDot, { backgroundColor: item.isMarked ? '#0891b2' : '#f97316' }]} />
                            <Text style={[styles.statusText, { color: item.isMarked ? '#0891b2' : '#f97316' }]}>
                                {item.isMarked ? 'Finalized' : 'Pending'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={styles.detailBadge}>
                            <Layers size={12} color="#64748b" />
                            <Text style={styles.detailText}>{item.department}</Text>
                        </View>
                        <View style={styles.detailBadge}>
                            <Users size={12} color="#64748b" />
                            <Text style={styles.detailText}>Sec {item.section}</Text>
                        </View>
                        <View style={styles.detailBadge}>
                            <BookOpen size={12} color="#64748b" />
                            <Text style={styles.detailText}>{item.semester}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                    <Clock size={14} color="#94a3b8" />
                    <Text style={styles.footerText}>Period {item.period || index + 1}</Text>
                </View>
                <View style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>{item.isMarked ? 'Update' : 'Mark Now'}</Text>
                    <ChevronLeft size={16} color="#800000" style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />
            <LinearGradient
                colors={['#800000', '#600000']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Daily Attendance</Text>
                    <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowPicker(true)}>
                        <Calendar size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.dateSelector}>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dayText}>
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </Text>
                        <Text style={styles.fullDateText}>
                            {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                    {selectedDate.toDateString() === new Date().toDateString() && (
                        <View style={styles.todayBadge}>
                            <Text style={styles.todayBadgeText}>TODAY</Text>
                        </View>
                    )}
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
                        <Text style={styles.loadingText}>Syncing schedule...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={classes}
                        renderItem={renderClassItem}
                        keyExtractor={(item, index) => item.id || String(index)}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconBg}>
                                    <BookOpen size={40} color="#94a3b8" />
                                </View>
                                <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
                                <Text style={styles.emptySub}>There are no classes assigned to you for this date.</Text>
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
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        paddingBottom: 30,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 15
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarBtn: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5
    },
    dateSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInfo: {
        flex: 1
    },
    dayText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5
    },
    fullDateText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        marginTop: 4
    },
    todayBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    todayBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1
    },
    content: { flex: 1, marginTop: -20 },
    listContent: { padding: 20, paddingTop: 30, paddingBottom: 40 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, color: '#64748b', fontWeight: '700', fontSize: 13 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 20,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardContent: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center'
    },
    timeSection: {
        alignItems: 'center',
        paddingRight: 18,
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
        minWidth: 75
    },
    startTimeText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1e293b'
    },
    timeDivider: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
        marginVertical: 6
    },
    endTimeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b'
    },
    mainInfo: {
        flex: 1,
        paddingLeft: 18
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    subjectName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1e293b',
        flex: 1,
        marginRight: 10
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase'
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    detailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    detailText: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 5
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fafafa',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fee2e2'
    },
    actionBtnText: {
        color: '#800000',
        fontSize: 12,
        fontWeight: '800',
        marginRight: 4
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40
    },
    emptyIconBg: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8
    },
    emptySub: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22
    }
});

export default StaffAttendance;
