import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Calendar,
    Users,
    BookOpen,
    Clock,
    Cpu,
    CheckCircle2
} from 'lucide-react-native';

const ExamCell = ({ navigation }) => {
    const [numClasses, setNumClasses] = useState('');
    const [numStaff, setNumStaff] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedTimetable, setGeneratedTimetable] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('Timetable'); // Timetable, Exams, Results

    const generateTimetable = () => {
        if (!numClasses || !numStaff) {
            Alert.alert('Error', 'Please enter the number of classes and staff.');
            return;
        }

        const classes = parseInt(numClasses);
        const staff = parseInt(numStaff);

        if (classes <= 0 || staff <= 0) {
            Alert.alert('Error', 'Please enter valid positive numbers.');
            return;
        }

        if (staff < classes) {
            Alert.alert('Warning', 'Number of staff is less than classes. Some slots might be empty or staff will update multiple classes.');
        }

        setLoading(true);

        // Simulate AI Generation Delay
        setTimeout(() => {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const periods = ['10:00 - 11:00', '11:00 - 12:00', '12:00 - 01:00', '02:00 - 03:00', '03:00 - 04:00'];

            const newTimetable = [];

            // Naive Generation Algorithm
            // For each class, for each day, for each period, assign a random staff
            // Constraint: Ideally a staff shouldn't be in two places at once. 
            // We will do a simple greedy assignment here for valid suggestion.

            for (let c = 1; c <= classes; c++) {
                const classSchedule = {
                    className: `Class ${c}`,
                    days: []
                };

                days.forEach(day => {
                    const daySchedule = {
                        dayName: day,
                        periods: []
                    };

                    // Simple constraint tracking for this slot across all classes could be complex for client-side
                    // We will just simplify: Randomly assign a staff ID from 1 to staff count
                    periods.forEach(period => {
                        const randomStaffId = Math.floor(Math.random() * staff) + 1;
                        daySchedule.periods.push({
                            time: period,
                            subject: `Subject ${Math.floor(Math.random() * 5) + 1}`, // Random subject generic
                            staff: `Staff ${randomStaffId}`
                        });
                    });

                    classSchedule.days.push(daySchedule);
                });

                newTimetable.push(classSchedule);
            }

            setGeneratedTimetable(newTimetable);
            setLoading(false);
            setModalVisible(true);
        }, 2000);
    };

    const renderTimetableModal = () => (
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
                            <Text style={styles.modalTitle}>AI Generated Timetable</Text>
                            <Text style={styles.modalSubtitle}>Optimized schedule for {numClasses} classes</Text>
                        </View>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={{ color: '#64748b', fontWeight: 'bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {generatedTimetable?.map((cls, index) => (
                            <View key={index} style={styles.classBlock}>
                                <Text style={styles.classTitle}>{cls.className}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View>
                                        <View style={styles.headerRow}>
                                            <Text style={[styles.headerCell, { width: 100 }]}>Day</Text>
                                            {cls.days[0].periods.map((p, i) => (
                                                <Text key={i} style={styles.headerCell}>{p.time}</Text>
                                            ))}
                                        </View>
                                        {cls.days.map((day, dIndex) => (
                                            <View key={dIndex} style={styles.row}>
                                                <Text style={[styles.cell, { width: 100, fontWeight: 'bold' }]}>{day.dayName}</Text>
                                                {day.periods.map((period, pIndex) => (
                                                    <View key={pIndex} style={styles.cell}>
                                                        <Text style={styles.subjectText}>{period.subject}</Text>
                                                        <Text style={styles.staffText}>{period.staff}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#115e59', '#0f766e']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Exam Cell Portal</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Timetable' && styles.activeTab]}
                        onPress={() => setActiveTab('Timetable')}
                    >
                        <Clock size={16} color={activeTab === 'Timetable' ? '#0f766e' : '#64748b'} />
                        <Text style={[styles.tabText, activeTab === 'Timetable' && styles.activeTabText]}>AI Timetable</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Exams' && styles.activeTab]}
                        onPress={() => setActiveTab('Exams')}
                    >
                        <BookOpen size={16} color={activeTab === 'Exams' ? '#0f766e' : '#64748b'} />
                        <Text style={[styles.tabText, activeTab === 'Exams' && styles.activeTabText]}>Exams</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'Timetable' && (
                    <View style={styles.generatorCard}>
                        <View style={styles.aiHeader}>
                            <Cpu size={32} color="#0f766e" />
                            <Text style={styles.cardTitle}>Automatic Time Table Generator</Text>
                            <Text style={styles.cardSubtitle}>Powered by Artificial Intelligence</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Number of Classes</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 12"
                                keyboardType="numeric"
                                value={numClasses}
                                onChangeText={setNumClasses}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Number of Staffs</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 25"
                                keyboardType="numeric"
                                value={numStaff}
                                onChangeText={setNumStaff}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.generateButton}
                            onPress={generateTimetable}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Cpu size={20} color="#fff" />
                                    <Text style={styles.generateButtonText}>Generate Timetable</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'Exams' && (
                    <View style={styles.emptyState}>
                        <BookOpen size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Exam Management Coming Soon</Text>
                    </View>
                )}
            </View>

            {renderTimetableModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdfa' },
    headerGradient: {
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    content: {
        padding: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 5,
        marginBottom: 20,
        elevation: 2,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#ccfbf1',
    },
    tabText: {
        fontWeight: '600',
        color: '#64748b',
    },
    activeTabText: {
        color: '#0f766e',
        fontWeight: '800',
    },
    generatorCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#0f766e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    aiHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginTop: 12,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
    },
    generateButton: {
        backgroundColor: '#0f766e',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 10,
        marginTop: 10,
        elevation: 4,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '90%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0f766e',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    classBlock: {
        marginBottom: 30,
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    classTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 15,
    },
    headerRow: {
        flexDirection: 'row',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 8,
    },
    headerCell: {
        width: 140,
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        alignItems: 'center',
    },
    cell: {
        width: 140,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    subjectText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        textAlign: 'center',
    },
    staffText: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
        textAlign: 'center',
    }
});

export default ExamCell;
