
import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    FlatList,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const StudentAttendance = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [displayDate, setDisplayDate] = useState(new Date()); // For month navigation

    // Stats for the month
    const [monthStats, setMonthStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0
    });

    useEffect(() => {
        fetchAttendanceForMonth(displayDate.getMonth(), displayDate.getFullYear());
    }, [displayDate]);

    const fetchAttendanceForMonth = async (month, year) => {
        setLoading(true);
        try {
            const res = await api.get('/attendance/my-record', {
                params: { month, year }
            });
            setAttendanceRecords(res.data);
            calculateStats(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (records) => {
        const total = records.length;
        const present = records.filter(r => r.status === 'P' || r.status === 'OD').length;
        const absent = records.filter(r => r.status === 'A').length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        setMonthStats({ total, present, absent, percentage });
    };

    const changeMonth = (increment) => {
        const newDate = new Date(displayDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setDisplayDate(newDate);
    };

    // Helper to get days in month
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Helper to get day of week for 1st of month
    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(displayDate.getMonth(), displayDate.getFullYear());
        const firstDay = getFirstDayOfMonth(displayDate.getMonth(), displayDate.getFullYear());
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = new Date(displayDate.getFullYear(), displayDate.getMonth(), i).toDateString();
            const isSelected = selectedDate.toDateString() === dateStr;
            const isToday = new Date().toDateString() === dateStr;

            // Check status for this day
            const recordsForDay = attendanceRecords.filter(r => new Date(r.date).getDate() === i);
            let dayStatus = null;
            if (recordsForDay.length > 0) {
                const hasAbsent = recordsForDay.some(r => r.status === 'A');
                dayStatus = hasAbsent ? 'absent' : 'present';
            }

            days.push(
                <TouchableOpacity
                    key={i}
                    style={[
                        styles.calendarDay,
                        isSelected && styles.selectedDay,
                        isToday && !isSelected && styles.todayDay
                    ]}
                    onPress={() => setSelectedDate(new Date(displayDate.getFullYear(), displayDate.getMonth(), i))}
                >
                    <Text style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isToday && !isSelected && styles.todayDayText
                    ]}>{i}</Text>

                    {dayStatus && (
                        <View style={[
                            styles.dot,
                            { backgroundColor: dayStatus === 'present' ? '#10b981' : '#ef4444' }
                        ]} />
                    )}
                </TouchableOpacity>
            );
        }

        return <View style={styles.calendarGrid}>{days}</View>;
    };

    const getDailyDetails = () => {
        const filtered = attendanceRecords.filter(r =>
            new Date(r.date).toDateString() === selectedDate.toDateString()
        ).sort((a, b) => a.period - b.period); // Sort by period

        if (filtered.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Clock size={40} color="#cbd5e1" />
                    <Text style={styles.emptyText}>No classes recorded for this date</Text>
                </View>
            );
        }

        return filtered.map((item, index) => (
            <View key={index} style={styles.classCard}>
                <View style={styles.timeLineContainer}>
                    <View style={styles.periodBadge}>
                        <Text style={styles.periodText}>{item.period}</Text>
                    </View>
                    <View style={styles.verticalLine} />
                </View>
                <View style={styles.classContent}>
                    <View style={styles.classHeader}>
                        <Text style={styles.subjectName}>{item.subject}</Text>
                        <View style={[
                            styles.statusBadge,
                            item.status === 'A' ? styles.statusAbsent : styles.statusPresent
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: item.status === 'A' ? '#b91c1c' : '#047857' }
                            ]}>
                                {item.status === 'P' ? 'Present' : item.status === 'A' ? 'Absent' : 'On Duty'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.staffName}>Recorded at: {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
            </View>
        ));
    };

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
                    <Text style={styles.headerTitle}>Attendance</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Month Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total</Text>
                        <Text style={styles.statValue}>{monthStats.total}</Text>
                    </View>
                    <View style={styles.dictator} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Present</Text>
                        <Text style={[styles.statValue, { color: '#4ade80' }]}>{monthStats.present}</Text>
                    </View>
                    <View style={styles.dictator} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Absent</Text>
                        <Text style={[styles.statValue, { color: '#f87171' }]}>{monthStats.absent}</Text>
                    </View>
                    <View style={styles.dictator} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Percent</Text>
                        <Text style={[styles.statValue, { color: '#fbbf24' }]}>{monthStats.percentage}%</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Calendar Section */}
                <View style={styles.calendarContainer}>
                    <View style={styles.monthSelector}>
                        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthBtn}>
                            <ChevronLeft size={20} color="#64748b" />
                        </TouchableOpacity>
                        <Text style={styles.monthText}>
                            {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthBtn}>
                            <ChevronRight size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekDays}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <Text key={i} style={styles.weekDayText}>{day}</Text>
                        ))}
                    </View>

                    {loading ? (
                        <ActivityIndicator style={{ padding: 20 }} color="#800000" />
                    ) : renderCalendar()}
                </View>

                {/* Daily Details Section */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.detailsHeader}>
                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                    {getDailyDetails()}
                </View>
            </ScrollView>
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
        elevation: 8
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textTransform: 'uppercase', marginBottom: 4, fontWeight: '700' },
    statValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
    dictator: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.2)' },

    scrollContent: { flex: 1 },

    calendarContainer: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 25,
        borderRadius: 24,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    monthBtn: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12
    },
    monthText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b'
    },
    weekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10
    },
    weekDayText: {
        color: '#94a3b8',
        fontWeight: '700',
        width: 35,
        textAlign: 'center'
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
    },
    calendarDay: {
        width: '14.28%', // 100% / 7
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155'
    },
    selectedDay: {
        backgroundColor: '#800000',
        borderRadius: 12,
        elevation: 3
    },
    selectedDayText: {
        color: '#fff',
        fontWeight: '800'
    },
    todayDay: {
        backgroundColor: '#fee2e2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#800000'
    },
    todayDayText: {
        color: '#800000',
        fontWeight: '800'
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4
    },

    detailsContainer: {
        padding: 22,
        paddingTop: 0,
        paddingBottom: 40
    },
    detailsHeader: {
        fontSize: 18,
        fontWeight: '800',
        color: '#334155',
        marginBottom: 15,
        marginLeft: 4
    },
    classCard: {
        flexDirection: 'row',
        marginBottom: 0
    },
    timeLineContainer: {
        alignItems: 'center',
        width: 50,
        marginRight: 10
    },
    periodBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        borderWidth: 2,
        borderColor: '#cbd5e1'
    },
    periodText: {
        fontWeight: '800',
        color: '#64748b'
    },
    verticalLine: {
        flex: 1,
        width: 2,
        backgroundColor: '#f1f5f9',
        marginBottom: 5
    },
    classContent: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 5
    },
    classHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    subjectName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        flex: 1
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    statusPresent: { backgroundColor: '#dcfce7' },
    statusAbsent: { backgroundColor: '#fee2e2' },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    staffName: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },

    emptyState: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderStyle: 'dashed'
    },
    emptyText: {
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: 10
    }
});

export default StudentAttendance;
