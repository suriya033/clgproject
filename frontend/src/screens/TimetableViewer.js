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
    Dimensions,
    Alert,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Search,
    Clock,
    Calendar,
    Users,
    ChevronDown,
    X,
    Filter
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Simple Dropdown Component (Reuse logic from TimeTableGenerator)
const SimplifiedDropdown = ({ label, value, options = [], onSelect, placeholder, visible, setVisible }) => {
    const selectedLabel = options.find(opt => opt.value === value)?.label;

    return (
        <View style={styles.dropdownWrapper}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.dropdownValue, !value && styles.placeholderText]}>
                    {value ? selectedLabel : placeholder}
                </Text>
                <ChevronDown size={18} color="#94a3b8" />
            </TouchableOpacity>
        </View>
    );
};

const TimetableViewer = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [timetable, setTimetable] = useState(null);

    // Filter states
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSem, setSelectedSem] = useState('');
    const [selectedSec, setSelectedSec] = useState('A');

    // UI States
    const [activeDay, setActiveDay] = useState('Monday');
    const [showFilters, setShowFilters] = useState(user?.role !== 'Student');

    const years = [
        { label: '1st Year', value: '1' },
        { label: '2nd Year', value: '2' },
        { label: '3rd Year', value: '3' },
        { label: '4th Year', value: '4' },
    ];

    const sectionOptions = [
        { label: 'Section A', value: 'A' },
        { label: 'Section B', value: 'B' },
        { label: 'Section C', value: 'C' }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/college/departments');
            const depts = res.data.map(d => ({ label: d.name, value: d._id }));
            setDepartments(depts);

            // Auto-select for HOD
            if (user?.role === 'HOD') {
                const myDept = depts.find(d => d.label === user.department);
                if (myDept) setSelectedDept(myDept.value);
            }

            // Auto-select for Student
            if (user?.role === 'Student') {
                const myDept = depts.find(d => d.label === user.department);
                if (myDept) setSelectedDept(myDept.value);
                setSelectedYear(user.year || '1');
                setSelectedSem(user.semester || '1');
                setSelectedSec(user.section || 'A');
                setShowFilters(false);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    // Effect to auto-fetch for students once criteria are set
    useEffect(() => {
        if (user?.role === 'Student' && selectedDept && selectedYear && selectedSem && selectedSec && departments.length > 0) {
            fetchTimetable();
        }
    }, [selectedDept, selectedYear, selectedSem, selectedSec, departments]);

    const fetchTimetable = async () => {
        if (!selectedDept || !selectedYear || !selectedSem) {
            Alert.alert('Selection Required', 'Please select department, year and semester.');
            return;
        }

        setLoading(true);
        try {
            const semStr = `${selectedYear} Year - Sem ${selectedSem}`;
            const res = await api.get(`/timetable/${selectedDept}/${semStr}/${selectedSec}`);
            setTimetable(res.data);
            setShowFilters(false);
        } catch (error) {
            console.error('Error fetching timetable:', error);
            setTimetable(null);
            Alert.alert('Not Found', 'No timetable found for the selected criteria.');
        } finally {
            setLoading(false);
        }
    };

    const groupSlots = (slots) => {
        if (!slots || slots.length === 0) return [];
        const groups = [];
        let currentGroup = null;

        slots.forEach((slot, idx) => {
            const isPracticalBlock = slot.subject !== 'Free' && slot.subject !== 'Break' && slot.subject !== 'Lunch' &&
                currentGroup &&
                currentGroup.subject === slot.subject &&
                currentGroup.staff === slot.staff;

            const isBreakInsideBlock = slot.subject === 'Break' &&
                idx > 0 && idx < slots.length - 1 &&
                slots[idx - 1].subject === slots[idx + 1].subject &&
                slots[idx - 1].staff === slots[idx + 1].staff &&
                slots[idx - 1].subject !== 'Free' && slots[idx - 1].subject !== 'Break' && slots[idx - 1].subject !== 'Lunch';

            if (isPracticalBlock || isBreakInsideBlock) {
                currentGroup.endTime = slot.endTime;
                currentGroup.slots.push(slot);
            } else {
                currentGroup = {
                    ...slot,
                    slots: [slot]
                };
                groups.push(currentGroup);
            }
        });
        return groups;
    };

    const renderSlot = (slot, index) => {
        const isSpanned = slot.slots && slot.slots.filter(s => s.subject !== 'Break').length > 1;

        return (
            <View key={index} style={[
                styles.slotCard,
                slot.subject === 'Break' || slot.subject === 'Lunch' ? styles.fixedSlot : null,
                isSpanned && styles.spannedCard
            ]}>
                <View style={[styles.slotTime, isSpanned && styles.spannedTime]}>
                    <Text style={[styles.timeText, isSpanned && styles.spannedTimeText]}>{slot.startTime}</Text>
                    <View style={styles.timeLine} />
                    <Text style={[styles.timeText, { color: isSpanned ? '#fee2e2' : '#94a3b8' }]}>{slot.endTime}</Text>
                </View>
                <View style={styles.slotContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[styles.subjectText, isSpanned && styles.spannedSubjectText]}>{slot.subject}</Text>
                        {isSpanned && (
                            <View style={styles.spanBadge}>
                                <Text style={styles.spanBadgeText}>{slot.slots.filter(s => s.subject !== 'Break').length} Periods</Text>
                            </View>
                        )}
                    </View>
                    {slot.staff !== '-' && (
                        <View style={styles.staffRow}>
                            <Users size={12} color={isSpanned ? "#fee2e2" : "#64748b"} />
                            <Text style={[styles.staffText, isSpanned && styles.spannedStaffText]}>{slot.staff}</Text>
                        </View>
                    )}
                </View>
                {slot.room && slot.room !== '-' && (
                    <View style={[styles.roomBadge, isSpanned && styles.spannedRoomBadge]}>
                        <Text style={[styles.roomText, isSpanned && styles.spannedRoomText]}>{slot.room}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>View Timetable</Text>
                    {user?.role !== 'Student' && (
                        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterBtn}>
                            <Filter size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {(!showFilters || user?.role === 'Student') && timetable && (
                    <View style={styles.activeFilterInfo}>
                        <Text style={styles.filterShortText}>
                            {departments.find(d => d.value === selectedDept)?.label} • {selectedYear} Yr • Sem {selectedSem} • Sec {selectedSec}
                        </Text>
                    </View>
                )}
            </LinearGradient>

            {showFilters ? (
                <ScrollView style={styles.filterContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.filterCard}>
                        <Text style={styles.filterTitle}>Selection Criteria</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Department</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                {departments.map(dept => (
                                    <TouchableOpacity
                                        key={dept.value}
                                        onPress={() => setSelectedDept(dept.value)}
                                        style={[styles.chip, selectedDept === dept.value && styles.activeChip, (user?.role === 'HOD' && departments.find(d => d.value === selectedDept)?.label !== user.department) && styles.disabledChip]}
                                        disabled={user?.role === 'HOD' && dept.label !== user.department}
                                    >
                                        <Text style={[styles.chipText, selectedDept === dept.value && styles.activeChipText]}>{dept.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Academic Year</Text>
                            <View style={styles.row}>
                                {years.map(y => (
                                    <TouchableOpacity
                                        key={y.value}
                                        onPress={() => setSelectedYear(y.value)}
                                        style={[styles.yearChip, selectedYear === y.value && styles.activeYearChip]}
                                    >
                                        <Text style={[styles.chipText, selectedYear === y.value && styles.activeChipText]}>{y.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Semester</Text>
                            <View style={styles.row}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={() => setSelectedSem(String(s))}
                                        style={[styles.semChip, selectedSem === String(s) && styles.activeSemChip]}
                                    >
                                        <Text style={[styles.chipText, selectedSem === String(s) && styles.activeChipText]}>S{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Section</Text>
                            <View style={styles.row}>
                                {['A', 'B', 'C'].map(sec => (
                                    <TouchableOpacity
                                        key={sec}
                                        onPress={() => setSelectedSec(sec)}
                                        style={[styles.secChip, selectedSec === sec && styles.activeSecChip]}
                                    >
                                        <Text style={[styles.chipText, selectedSec === sec && styles.activeChipText]}>Section {sec}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.searchBtn} onPress={fetchTimetable}>
                            <Search size={20} color="#fff" />
                            <Text style={styles.searchBtnText}>Search Timetable</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.daysTabRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {days.map(day => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => setActiveDay(day)}
                                    style={[styles.dayTab, activeDay === day && styles.activeDayTab]}
                                >
                                    <Text style={[styles.dayTabText, activeDay === day && styles.activeDayTabText]}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <ScrollView style={styles.timetableContent} showsVerticalScrollIndicator={false}>
                        {timetable?.schedule?.[activeDay] ? (
                            groupSlots(timetable.schedule[activeDay]).map((group, index) => renderSlot(group, index))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Calendar size={50} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No classes scheduled for this day</Text>
                            </View>
                        )}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            )}

            {loading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingBottom: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    activeFilterInfo: { alignItems: 'center' },
    filterShortText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },

    filterContainer: { flex: 1, padding: 20 },
    filterCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    filterTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 10 },
    chipScroll: { flexDirection: 'row' },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    activeChip: { backgroundColor: '#800000', borderColor: '#800000' },
    disabledChip: { opacity: 0.5 },
    chipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    activeChipText: { color: '#fff' },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    yearChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    activeYearChip: { backgroundColor: '#800000', borderColor: '#800000' },
    semChip: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    activeSemChip: { backgroundColor: '#800000', borderColor: '#800000' },
    secChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    activeSecChip: { backgroundColor: '#800000', borderColor: '#800000' },
    searchBtn: { backgroundColor: '#800000', paddingVertical: 16, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    searchBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', marginLeft: 10 },

    daysTabRow: { backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 10, elevation: 2 },
    dayTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
    activeDayTab: { backgroundColor: '#fee2e2' },
    dayTabText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    activeDayTabText: { color: '#800000' },

    timetableContent: { flex: 1, padding: 20 },
    slotCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    fixedSlot: { backgroundColor: '#f8fafc', opacity: 0.8 },
    slotTime: { width: 70, borderRightWidth: 1, borderRightColor: '#f1f5f9', paddingRight: 10, justifyContent: 'center', alignItems: 'center' },
    timeText: { fontSize: 12, fontWeight: '800', color: '#1e293b' },
    timeLine: { width: 15, height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },
    slotContent: { flex: 1, paddingLeft: 15, justifyContent: 'center' },
    subjectText: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
    staffRow: { flexDirection: 'row', alignItems: 'center' },
    staffText: { fontSize: 12, color: '#64748b', fontWeight: '600', marginLeft: 5 },
    roomBadge: { position: 'absolute', top: 15, right: 15, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    roomText: { fontSize: 10, fontWeight: '700', color: '#64748b' },

    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginTop: 15 },
    loader: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },

    // Spanned Card Styles
    spannedCard: { backgroundColor: '#800000', borderColor: '#5a0000', elevation: 8 },
    spannedTime: { borderRightColor: 'rgba(255,255,255,0.2)' },
    spannedTimeText: { color: '#fff' },
    spannedSubjectText: { color: '#fff' },
    spannedStaffText: { color: 'rgba(255,255,255,0.8)' },
    spannedRoomBadge: { backgroundColor: 'rgba(255,255,255,0.2)' },
    spannedRoomText: { color: '#fff' },
    spanBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    spanBadgeText: { color: '#800000', fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }
});

export default TimetableViewer;
