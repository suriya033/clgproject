import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
    Dimensions,
    TextInput,
    StatusBar,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Plus,
    X,
    Search,
    ChevronDown,
    BookOpen,
    Users,
    Clock,
    Sparkles,
    Check,
    Save,
    RotateCcw,
    Edit3
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const CustomDropdown = ({ label, value, options = [], onSelect, placeholder, icon: Icon, disabled = false }) => {
    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = (options || []).filter(opt =>
        opt?.label?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedLabel = options?.find(opt => opt?.value === value)?.label;

    return (
        <View style={styles.dropdownContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity
                style={[styles.dropdownButton, disabled && styles.disabledDropdown]}
                onPress={() => !disabled && setVisible(true)}
                activeOpacity={0.7}
            >
                <View style={styles.dropdownButtonContent}>
                    {Icon && <Icon size={20} color={disabled ? "#94a3b8" : "#800000"} style={{ marginRight: 10 }} />}
                    <Text style={[
                        styles.dropdownValue,
                        !value && styles.placeholderText,
                        disabled && { color: '#64748b' }
                    ]}>
                        {value ? selectedLabel : placeholder}
                    </Text>
                </View>
                {!disabled && <ChevronDown size={20} color="#94a3b8" />}
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {label}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchBar}>
                            <Search size={20} color="#94a3b8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <FlatList
                            data={filteredOptions}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        value === item.value && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        onSelect(item.value);
                                        setVisible(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[
                                            styles.optionText,
                                            value === item.value && styles.selectedOptionText
                                        ]}>{item.label}</Text>
                                        {item.subLabel && <Text style={styles.optionSubText}>{item.subLabel}</Text>}
                                    </View>
                                    {value === item.value && <Check size={20} color="#800000" />}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No options found</Text>
                            }
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const TimeTableGenerator = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data for dropdowns
    const [departments, setDepartments] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const years = [
        { label: '1st Year', value: '1' },
        { label: '2nd Year', value: '2' },
        { label: '3rd Year', value: '3' },
        { label: '4th Year', value: '4' },
    ];

    // Inputs
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [semester, setSemester] = useState('');
    const [section, setSection] = useState('');

    // Current Subject being added
    const [currentSubject, setCurrentSubject] = useState({
        subjectId: '',
        staffId: '',
        hoursPerWeek: '4'
    });

    // Added subjects list
    const [addedSubjects, setAddedSubjects] = useState([]);

    // Generated Schedule
    const [schedule, setSchedule] = useState(null);

    // Edit Slot State
    const [editSlotModalVisible, setEditSlotModalVisible] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [newSubjectForSlot, setNewSubjectForSlot] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [deptRes, subRes, staffRes] = await Promise.all([
                api.get('/college/departments'),
                api.get('/college/subjects'),
                api.get('/admin/users')
            ]);

            setDepartments(deptRes.data.map(d => ({ label: d.name, value: d._id })));
            setSubjectsList(subRes.data.map(s => ({
                label: `${s.code} - ${s.name}`,
                value: s._id,
                name: s.name,
                dept: s.department?._id || s.department,
                year: s.year,
                semester: s.semester
            })));
            setStaffList(staffRes.data
                .filter(u => u.role === 'Staff' || u.role === 'HOD')
                .map(u => ({ label: u.name, value: u._id, subLabel: u.department }))
            );
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load dropdown data');
        } finally {
            setLoading(false);
        }
    };

    // Auto-select and lock department for HOD
    useEffect(() => {
        if (user?.role === 'HOD' && departments.length > 0) {
            const hDept = departments.find(d =>
                d.label.toLowerCase() === user.department?.toLowerCase()
            );
            if (hDept) setSelectedDept(hDept.value);
        }
    }, [user, departments]);

    const filteredSubjectsList = subjectsList.filter(s => {
        const matchesDept = !selectedDept || s.dept === selectedDept;
        const matchesYear = !selectedYear || s.year === selectedYear;
        const matchesSem = !semester || parseInt(s.semester) === parseInt(semester);
        return matchesDept && matchesYear && matchesSem;
    });

    // Reset current subject if filters change and it's no longer in the list
    useEffect(() => {
        if (currentSubject.subjectId && !filteredSubjectsList.find(s => s.value === currentSubject.subjectId)) {
            setCurrentSubject(prev => ({ ...prev, subjectId: '' }));
        }
    }, [selectedDept, selectedYear, semester]);

    const handleAddSubject = () => {
        if (!currentSubject.subjectId || !currentSubject.staffId || !currentSubject.hoursPerWeek) {
            Alert.alert('Error', 'Please select a subject, staff and hours');
            return;
        }

        const subObj = subjectsList.find(s => s.value === currentSubject.subjectId);
        const staffObj = staffList.find(s => s.value === currentSubject.staffId);

        const newEntry = {
            id: Date.now().toString(),
            subjectId: currentSubject.subjectId,
            name: subObj.name,
            staffId: currentSubject.staffId,
            staffName: staffObj.label,
            hoursPerWeek: currentSubject.hoursPerWeek
        };

        setAddedSubjects([...addedSubjects, newEntry]);
        setCurrentSubject({ subjectId: '', staffId: '', hoursPerWeek: '4' });
    };

    const removeSubject = (id) => {
        setAddedSubjects(addedSubjects.filter(s => s.id !== id));
    };

    const generateTimeTable = async () => {
        if (!selectedDept || !selectedYear || !semester || addedSubjects.length === 0) {
            Alert.alert('Error', 'Please fill class details and add subjects');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/timetable/generate', {
                subjects: addedSubjects,
                days: 5,
                slotsPerDay: 7
            });
            setSchedule(res.data);
            setStep(2);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate timetable');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setSchedule(null);
        setAddedSubjects([]);
        setEditSlotModalVisible(false);

        // Reset inputs
        setSelectedYear('');
        setSemester('');
        setSection('');
        setCurrentSubject({ subjectId: '', staffId: '', hoursPerWeek: '4' });

        // Only clear department if NOT HOD
        // If HOD, the useEffect will keep it locked/set
        if (user?.role !== 'HOD') {
            setSelectedDept('');
        }
    };

    const saveTimeTable = async (createNew = false) => {
        setLoading(true);
        try {
            await api.post('/timetable/save', {
                department: selectedDept,
                semester: `${selectedYear} Year - Sem ${semester}`,
                section: section || 'A',
                schedule
            });

            if (createNew) {
                resetForm();
                Alert.alert('Success', 'Previous timetable saved. Enter details for next department.');
            } else {
                Alert.alert(
                    'Timetable Saved',
                    'What would you like to do next?',
                    [
                        {
                            text: 'Exit',
                            style: 'cancel',
                            onPress: () => navigation.goBack()
                        },
                        {
                            text: 'Create Another',
                            onPress: resetForm
                        }
                    ]
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save timetable');
        } finally {
            setLoading(false);
        }
    };

    const openEditSlot = (day, slotIndex, currentData) => {
        if (currentData.isFixed) return; // Prevent editing breaks/lunch
        setSelectedSlot({ day, index: slotIndex, ...currentData });

        // Pre-select current subject ID if possible, else empty
        const foundSub = addedSubjects.find(s => s.name === currentData.subject);
        setNewSubjectForSlot(foundSub ? foundSub.subjectId : '');
        setEditSlotModalVisible(true);
    };

    const handleSaveSlot = () => {
        if (!selectedSlot) return;

        const newSchedule = { ...schedule };
        const daySlots = [...newSchedule[selectedSlot.day]];

        if (newSubjectForSlot === 'FREE') {
            daySlots[selectedSlot.index] = {
                ...daySlots[selectedSlot.index],
                subject: 'Free',
                staff: '-',
                room: '-'
            };
        } else {
            const subDetails = addedSubjects.find(s => s.subjectId === newSubjectForSlot);
            if (subDetails) {
                daySlots[selectedSlot.index] = {
                    ...daySlots[selectedSlot.index],
                    subject: subDetails.name,
                    staff: subDetails.staffName,
                    room: 'Room 101'
                };
            }
        }

        newSchedule[selectedSlot.day] = daySlots;
        setSchedule(newSchedule);
        setEditSlotModalVisible(false);
    };

    const renderSlot = (slot, index, day) => (
        <TouchableOpacity
            key={index}
            style={[styles.slotCard, slot.isFixed && styles.fixedSlot]}
            onPress={() => openEditSlot(day, index, slot)}
            activeOpacity={slot.isFixed ? 1 : 0.7}
        >
            <View style={styles.slotHeader}>
                <Clock size={12} color="#64748b" />
                <Text style={styles.timeText}>{slot.startTime} - {slot.endTime}</Text>
            </View>
            <Text style={[styles.subjectText, slot.isFixed && { color: '#94a3b8' }]} numberOfLines={1}>
                {slot.subject}
            </Text>
            {slot.staff !== '-' && (
                <View style={styles.staffRow}>
                    <Users size={12} color="#94a3b8" />
                    <Text style={styles.staffText} numberOfLines={1}>{slot.staff}</Text>
                </View>
            )}
            {!slot.isFixed && <Edit3 size={12} color="#cbd5e1" style={{ position: 'absolute', bottom: 8, right: 8 }} />}
        </TouchableOpacity>
    );

    const renderDaySchedule = (day, slots) => (
        <View key={day} style={styles.daySection}>
            <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{day}</Text>
            </LinearGradient>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsRow}>
                {slots.map((slot, index) => renderSlot(slot, index, day))}
            </ScrollView>
        </View>
    );

    // Options for edit modal
    const editOptions = [
        { label: 'Free Period', value: 'FREE' },
        ...addedSubjects.map(s => ({ label: `${s.name} (${s.staffName})`, value: s.subjectId }))
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>AI Timetable Generator</Text>
                    {step === 2 ? (
                        <TouchableOpacity onPress={generateTimeTable} style={styles.backButton}>
                            <RotateCcw size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {step === 1 ? (
                    <View style={{ flex: 1 }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Dropdowns for Class Info */}
                            <CustomDropdown
                                label="Department"
                                value={selectedDept}
                                options={departments}
                                onSelect={setSelectedDept}
                                placeholder="Choose Department"
                                disabled={user?.role === 'HOD'}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <CustomDropdown
                                        label="Year"
                                        value={selectedYear}
                                        options={years}
                                        onSelect={setSelectedYear}
                                        placeholder="Year"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Semester</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="e.g. 5"
                                        value={semester}
                                        onChangeText={setSemester}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Manage Subjects</Text>
                            </View>

                            {/* Add Subject Card */}
                            <View style={styles.addSubjectCard}>
                                <CustomDropdown
                                    label="Subject"
                                    value={currentSubject.subjectId}
                                    options={filteredSubjectsList}
                                    onSelect={(val) => setCurrentSubject({ ...currentSubject, subjectId: val })}
                                    placeholder={selectedDept && selectedYear && semester ? "Select Subject" : "Fill class info details"}
                                    icon={BookOpen}
                                />
                                <CustomDropdown
                                    label="Staff"
                                    value={currentSubject.staffId}
                                    options={staffList}
                                    onSelect={(val) => setCurrentSubject({ ...currentSubject, staffId: val })}
                                    placeholder="Select Staff"
                                    icon={Users}
                                />
                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Total Hours / Week</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="4"
                                            value={currentSubject.hoursPerWeek}
                                            onChangeText={(t) => setCurrentSubject({ ...currentSubject, hoursPerWeek: t })}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.addBtn}
                                    onPress={handleAddSubject}
                                >
                                    <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.addBtnText}>Add Subject</Text>
                                </TouchableOpacity>
                            </View>

                            {/* List of Added Subjects */}
                            {addedSubjects.length > 0 && (
                                <View style={styles.addedList}>
                                    {addedSubjects.map((item) => (
                                        <View key={item.id} style={styles.subjectItem}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.subItemName}>{item.name}</Text>
                                                <Text style={styles.subItemDetail}>{item.staffName} • {item.hoursPerWeek} hrs</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => removeSubject(item.id)}>
                                                <X size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <View style={{ height: 100 }} />
                        </ScrollView>

                        {/* Bottom Buttons */}
                        <View style={styles.bottomActions}>
                            <TouchableOpacity
                                style={styles.nextBtn}
                                onPress={() => {
                                    if (addedSubjects.length > 0) generateTimeTable();
                                    else Alert.alert('Error', 'Add at least one subject');
                                }}
                            >
                                <Text style={styles.nextBtnText}>Next</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={generateTimeTable}
                            >
                                <Text style={styles.submitBtnText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <View style={styles.resultHeader}>
                            <View>
                                <Text style={styles.resultTitle}>Preview Schedule</Text>
                                <Text style={styles.resultSubtitle}>
                                    Tap on any slot to edit • {selectedYear} Yr
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setStep(1)} style={styles.editBtnSmall}>
                                <Text style={styles.editBtnTextSmall}>Edit Input</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {schedule && Object.entries(schedule).map(([day, slots]) => renderDaySchedule(day, slots))}
                            <View style={{ height: 100 }} />
                        </ScrollView>

                        <View style={styles.bottomActions}>
                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 10 }]}
                                onPress={() => saveTimeTable(true)}
                            >
                                <Plus size={20} color="#64748b" style={{ marginRight: 8 }} />
                                <Text style={[styles.submitBtnText, { color: '#64748b' }]}>Save & Next</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.submitBtn} onPress={() => saveTimeTable(false)}>
                                <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            )}

            {/* Edit Slot Modal */}
            <Modal
                transparent={true}
                visible={editSlotModalVisible}
                animationType="fade"
                onRequestClose={() => setEditSlotModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setEditSlotModalVisible(false)}
                >
                    <View style={styles.modalContentSmall}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Slot</Text>
                            <TouchableOpacity onPress={() => setEditSlotModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.inputLabel}>
                                {selectedSlot?.day} • {selectedSlot?.startTime}
                            </Text>

                            <CustomDropdown
                                label="Select Subject"
                                value={newSubjectForSlot}
                                options={editOptions}
                                onSelect={setNewSubjectForSlot}
                                placeholder="Select Subject or Free"
                            />
                        </View>

                        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveSlot}>
                            <Text style={styles.submitBtnText}>Update Slot</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    content: { flex: 1, padding: 20 },

    dropdownContainer: { marginBottom: 18 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8, marginLeft: 4 },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    disabledDropdown: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
    dropdownButtonContent: { flexDirection: 'row', alignItems: 'center' },
    dropdownValue: { fontSize: 16, color: '#1e293b', fontWeight: '500', maxWidth: '85%' },
    placeholderText: { color: '#94a3b8' },

    textInput: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    row: { flexDirection: 'row', marginBottom: 18 },

    sectionHeader: { marginBottom: 15, marginTop: 10 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b' },

    addSubjectCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10
    },
    addBtn: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        marginTop: 10
    },
    addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    addedList: { marginTop: 20 },
    subjectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    subItemName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    subItemDetail: { fontSize: 12, color: '#64748b', marginTop: 2 },

    bottomActions: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        gap: 12
    },
    nextBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center'
    },
    nextBtnText: { color: '#64748b', fontSize: 16, fontWeight: 'bold' },
    submitBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#800000',
        alignItems: 'center',
        justifyContent: 'center'
    },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        padding: 24
    },
    modalContentSmall: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '40%',
        padding: 24
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 15
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1e293b' },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    selectedOption: { backgroundColor: '#fff5f5' },
    optionText: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
    optionSubText: { fontSize: 12, color: '#64748b', marginTop: 2 },
    selectedOptionText: { color: '#800000', fontWeight: '700' },
    emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 20 },

    // Results
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    resultTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
    resultSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    editBtnSmall: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f1f5f9', borderRadius: 8 },
    editBtnTextSmall: { fontSize: 12, color: '#64748b', fontWeight: '600' },

    daySection: { marginBottom: 20 },
    dayHeader: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, marginBottom: 10 },
    dayTitle: { fontSize: 14, fontWeight: '800', color: '#334155' },
    slotsRow: { paddingLeft: 5 },
    slotCard: {
        width: 145,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 3
    },
    fixedSlot: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0'
    },
    slotHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
    timeText: { fontSize: 10, color: '#64748b', fontWeight: '700' },
    subjectText: { fontSize: 14, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
    staffRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    staffText: { fontSize: 11, color: '#64748b' },

    bottomSingleAction: { position: 'absolute', bottom: 10, left: 0, right: 0 },
    saveBtn: {
        backgroundColor: '#059669',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    }
});

export default TimeTableGenerator;
