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
    Platform,
    Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Clock,
    Calendar,
    BookOpen,
    Users,
    Layout,
    Layers,
    X,
    ChevronRight,
    MapPinIcon
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const StaffTimetable = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchMySchedule();
    }, []);

    const fetchMySchedule = async () => {
        try {
            const res = await api.get('/timetable/my-schedule');
            setSchedule(res.data);

            const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            if (!res.data[currentDay] || res.data[currentDay].length === 0) {
                const firstDayWithClasses = days.find(d => res.data[d] && res.data[d].length > 0);
                if (firstDayWithClasses) setActiveDay(firstDayWithClasses);
                else setActiveDay('Monday');
            } else {
                setActiveDay(currentDay);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderSlot = (slot, index) => {
        // Determine status (mock logic for demo, as we need real dates)
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        // Simple string comparison for HH:MM
        const isCurrent = activeDay === new Date().toLocaleDateString('en-US', { weekday: 'long' }) &&
            slot.startTime <= currentTime && slot.endTime >= currentTime;

        return (
            <TouchableOpacity
                key={index}
                style={[styles.slotCard, isCurrent && styles.activeSlotCard]}
                onPress={() => {
                    setSelectedSlot(slot);
                    setDetailModalVisible(true);
                }}
                activeOpacity={0.7}
            >
                <View style={[styles.timeStrip, isCurrent ? styles.activeTimeStrip : null]}>
                    <Text style={[styles.startTimeText, isCurrent && styles.activeTimeText]}>{slot.startTime}</Text>
                    <View style={[styles.timeConnectorLine, isCurrent && styles.activeTimeLine]} />
                    <Text style={[styles.endTimeText, isCurrent && styles.activeTimeText]}>{slot.endTime}</Text>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.headerRow}>
                        <Text style={styles.subjectText} numberOfLines={1}>{slot.subject}</Text>
                        {isCurrent && (
                            <View style={styles.liveBadge}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>NOW</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                            <Users size={12} color="#64748b" />
                            <Text style={styles.tagText}>{slot.department}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Layers size={12} color="#64748b" />
                            <Text style={styles.tagText}>Sem {slot.semester}</Text>
                        </View>
                    </View>

                    <View style={styles.footerRow}>
                        <View style={styles.locationContainer}>
                            <MapPinIcon size={14} color={slot.room && slot.room !== '-' ? "#dc2626" : "#94a3b8"} />
                            <Text style={[styles.locationText, (!slot.room || slot.room === '-') && { color: '#94a3b8' }]}>
                                {slot.room && slot.room !== '-' ? slot.room : 'No location'}
                            </Text>
                        </View>

                        <View style={styles.viewDetailsBtnCompact}>
                            <Text style={styles.viewDetailsTextCompact}>Details</Text>
                            <ChevronRight size={14} color="#800000" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#800000" />
                <Text style={styles.loadingText}>Syncing schedule...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />

            {/* Premium Header */}
            <View style={styles.headerWrapper}>
                <LinearGradient
                    colors={['#800000', '#600000', '#420000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.8}
                        >
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Timetable</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.daysScroll}
                    >
                        {days.map(day => {
                            const isActive = activeDay === day;
                            const hasClasses = schedule && schedule[day] && schedule[day].length > 0;
                            return (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => setActiveDay(day)}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.dayTab,
                                        isActive && styles.activeDayTab
                                    ]}
                                >
                                    <Text style={[
                                        styles.dayTabText,
                                        isActive && styles.activeDayTabText
                                    ]}>
                                        {day.substring(0, 3)}
                                    </Text>
                                    {isActive && <View style={styles.activeDot} />}
                                    {!isActive && hasClasses && <View style={styles.hasClassDot} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </LinearGradient>
            </View>

            <View style={styles.content}>
                <View style={styles.dateHeader}>
                    <View>
                        <Text style={styles.selectedDayTitle}>{activeDay}</Text>
                        <Text style={styles.dateSubtext}>
                            {schedule && schedule[activeDay] ? `${schedule[activeDay].length} Classes Scheduled` : 'No classes'}
                        </Text>
                    </View>
                    <Calendar size={24} color="#cbd5e1" />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                >
                    {schedule && schedule[activeDay] && schedule[activeDay].length > 0 ? (
                        schedule[activeDay].map((slot, index) => renderSlot(slot, index))
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconCircle}>
                                <Clock size={40} color="#94a3b8" />
                            </View>
                            <Text style={styles.emptyTitle}>Free Day!</Text>
                            <Text style={styles.emptySubtitle}>No classes scheduled for {activeDay}.</Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Class Detail Modal */}
            <Modal
                visible={detailModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDetailModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Class Details</Text>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.closeButton}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {selectedSlot && (
                            <View style={styles.detailContainer}>
                                <View style={styles.detailCard}>
                                    <Text style={styles.detailSubject}>{selectedSlot.subject}</Text>
                                    <View style={styles.detailRow}>
                                        <Clock size={16} color="#800000" />
                                        <Text style={styles.detailTime}>{selectedSlot.startTime} - {selectedSlot.endTime}</Text>
                                    </View>
                                </View>

                                <View style={styles.infoGrid}>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Department</Text>
                                        <Text style={styles.infoValue}>{selectedSlot.department}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Semester / Section</Text>
                                        <Text style={styles.infoValue}>Sem {selectedSlot.semester} - Sec {selectedSlot.section}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Room / Lab</Text>
                                        <Text style={styles.infoValue}>{selectedSlot.room || '-'}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Session Type</Text>
                                        <Text style={styles.infoValue}>{selectedSlot.type || 'Lecture'}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.closeModalBtn}
                                    onPress={() => setDetailModalVisible(false)}
                                >
                                    <Text style={styles.closeModalBtnText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loadingText: { marginTop: 15, color: '#64748b', fontWeight: '600', fontSize: 16 },

    headerWrapper: {
        backgroundColor: '#800000',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        zIndex: 10
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 25
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },

    daysScroll: { paddingHorizontal: 20 },
    dayTab: {
        width: 65,
        height: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    activeDayTab: {
        backgroundColor: '#fff',
        borderColor: '#fff',
        transform: [{ scale: 1.05 }],
        elevation: 5
    },
    dayTabText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600' },
    activeDayTabText: { color: '#800000', fontWeight: '800', fontSize: 16 },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#800000',
        marginTop: 8
    },
    hasClassDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginTop: 8
    },

    content: { flex: 1 },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16
    },
    selectedDayTitle: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    dateSubtext: { fontSize: 14, color: '#64748b', fontWeight: '500', marginTop: 4 },

    listContent: { paddingHorizontal: 20, paddingBottom: 40 },

    slotCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    activeSlotCard: {
        borderColor: '#fecaca',
        backgroundColor: '#fef2f2'
    },
    timeStrip: {
        width: 85,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9'
    },
    activeTimeStrip: {
        backgroundColor: '#fee2e2',
        borderRightColor: '#fecaca'
    },
    startTimeText: { fontSize: 16, fontWeight: '800', color: '#334155' },
    endTimeText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
    activeTimeText: { color: '#7f1d1d' },
    timeConnectorLine: {
        width: 2,
        height: 20,
        backgroundColor: '#e2e8f0',
        marginVertical: 6,
        borderRadius: 1
    },
    activeTimeLine: { backgroundColor: '#fca5a5' },

    cardContent: { flex: 1, padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    subjectText: { fontSize: 17, fontWeight: '800', color: '#1e293b', flex: 1, marginRight: 8 },

    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#dc2626', marginRight: 4 },
    liveText: { fontSize: 10, fontWeight: '800', color: '#991b1b' },

    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8
    },
    tagText: { fontSize: 12, fontWeight: '600', color: '#475569', marginLeft: 6 },

    divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 },

    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    locationContainer: { flexDirection: 'row', alignItems: 'center' },
    locationText: { marginLeft: 6, fontSize: 13, fontWeight: '600', color: '#475569' },

    typeContainer: { backgroundColor: '#e0f2fe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    typeLabel: { fontSize: 10, fontWeight: '700', color: '#0284c7', textTransform: 'uppercase' },

    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#64748b' },
    emptySubtitle: { fontSize: 15, color: '#94a3b8', marginTop: 8 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 32,
        width: '100%',
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b'
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#f1f5f9',
        borderRadius: 10
    },
    detailContainer: {
        gap: 20
    },
    detailCard: {
        backgroundColor: '#fef2f2',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fee2e2'
    },
    detailSubject: {
        fontSize: 22,
        fontWeight: '800',
        color: '#800000',
        marginBottom: 8
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    detailTime: {
        fontSize: 16,
        fontWeight: '700',
        color: '#991b1b'
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16
    },
    infoItem: {
        width: '47%',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 4
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b'
    },
    closeModalBtn: {
        backgroundColor: '#800000',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10
    },
    closeModalBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    },
    viewDetailsBtnCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff5f5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fee2e2'
    },
    viewDetailsTextCompact: {
        fontSize: 12,
        fontWeight: '700',
        color: '#800000',
        marginRight: 4
    }
});

export default StaffTimetable;
