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
    const sectionOptions = [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' }
    ];

    // Inputs
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [semester, setSemester] = useState('');
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [section, setSection] = useState('');

    // Current Subject being added
    const [currentSubject, setCurrentSubject] = useState({
        subjectId: '',
        staffId: '',
        hoursPerWeek: '4',
        duration: '1'
    });

    // Added subjects list
    const [addedSubjects, setAddedSubjects] = useState([]);

    // Batch Generation State
    const [pendingClasses, setPendingClasses] = useState([]);
    const [batchResults, setBatchResults] = useState([]);
    const [currentClassIndex, setCurrentClassIndex] = useState(0);

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
                label: `${s.code} - ${s.name} ${s.shortName ? `(${s.shortName})` : ''}`,
                value: s._id,
                name: s.name,
                shortName: s.shortName,
                dept: s.department?._id || s.department,
                year: s.year,
                semester: s.semester,
                type: s.type || 'Theory',
                duration: s.duration || 1
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

    // Update semester options based on selected year
    useEffect(() => {
        if (!selectedYear) {
            setSemesterOptions([]);
            setSemester('');
            return;
        }

        const yearInt = parseInt(selectedYear);
        const startSem = (yearInt - 1) * 2 + 1;
        const endSem = startSem + 1;

        setSemesterOptions([
            { label: `Semester ${startSem}`, value: String(startSem) },
            { label: `Semester ${endSem}`, value: String(endSem) }
        ]);

        // Reset semester selection when year changes
        setSemester('');
    }, [selectedYear]);

    const filteredSubjectsList = subjectsList.filter(s => {
        const matchesDept = !selectedDept || s.dept === selectedDept;

        // Filter based on Year -> Semester Range (e.g. Year 1 shows Sems 1 & 2)
        // We ignore strict 'semester' equality so user can pick subjects from the other semester of the same year if needed.
        let matchesYearRange = true;
        if (selectedYear) {
            const y = parseInt(selectedYear);
            const minSem = (y - 1) * 2 + 1;
            const maxSem = minSem + 1;
            const sSem = parseInt(s.semester);
            matchesYearRange = (sSem === minSem || sSem === maxSem);
        }

        return matchesDept && matchesYearRange;
    });

    // Reset current subject if filters change and it's no longer in the list
    useEffect(() => {
        if (currentSubject.subjectId && !filteredSubjectsList.find(s => s.value === currentSubject.subjectId)) {
            setCurrentSubject(prev => ({ ...prev, subjectId: '', duration: '1' }));
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
            name: subObj.shortName || subObj.name,
            staffId: currentSubject.staffId,
            staffName: staffObj.label,
            hoursPerWeek: currentSubject.hoursPerWeek,
            type: subObj.type,
            duration: parseInt(currentSubject.duration)
        };

        setAddedSubjects([...addedSubjects, newEntry]);
        setCurrentSubject({ subjectId: '', staffId: '', hoursPerWeek: '4', duration: '1' });
    };

    const removeSubject = (id) => {
        setAddedSubjects(addedSubjects.filter(s => s.id !== id));
    };

    const generateTimeTable = async () => {
        let classesToGenerate = [...pendingClasses];

        // If current form has data, offer to include it or validate it's needed
        if (selectedDept && selectedYear && semester && addedSubjects.length > 0) {
            classesToGenerate.push({
                metadata: {
                    department: selectedDept,
                    deptName: departments.find(d => d.value === selectedDept)?.label,
                    semester: `${selectedYear} Year - Sem ${semester}`,
                    section: section || 'A',
                    year: selectedYear,
                    semVal: semester
                },
                subjects: addedSubjects
            });
        }

        if (classesToGenerate.length === 0) {
            Alert.alert('Error', 'Add at least one class to generate timetables');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/timetable/generate', {
                classes: classesToGenerate,
                days: 5,
                slotsPerDay: 7
            });
            setBatchResults(res.data);
            setCurrentClassIndex(0);
            setStep(2);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate timetables');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (!selectedDept || !selectedYear || !semester || addedSubjects.length === 0) {
            Alert.alert('Error', 'Please fill class details and add subjects');
            return;
        }

        const newClass = {
            metadata: {
                department: selectedDept,
                deptName: departments.find(d => d.value === selectedDept)?.label,
                semester: `${selectedYear} Year - Sem ${semester}`,
                section: section || 'A',
                year: selectedYear,
                semVal: semester
            },
            subjects: addedSubjects
        };

        // Check for duplicate class in batch
        const isDuplicate = pendingClasses.find(c =>
            c.metadata.department === newClass.metadata.department &&
            c.metadata.semester === newClass.metadata.semester &&
            c.metadata.section === newClass.metadata.section
        );

        if (isDuplicate) {
            Alert.alert('Error', 'This class is already in the batch');
            return;
        }

        setPendingClasses([...pendingClasses, newClass]);

        // Reset specific fields for next entry
        setAddedSubjects([]);
        setSelectedYear('');
        setSemester('');
        setSection('');
        setCurrentSubject({ subjectId: '', staffId: '', hoursPerWeek: '4', duration: '1' });

        Alert.alert('Success', 'Class added to batch. You can enter another or click Submit to generate all.');
    };

    const removeClassFromBatch = (index) => {
        const updated = [...pendingClasses];
        updated.splice(index, 1);
        setPendingClasses(updated);
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

    const saveTimeTable = async () => {
        setLoading(true);
        try {
            // Save all generated timetables in the batch
            const savePromises = batchResults.map(res =>
                api.post('/timetable/save', {
                    department: res.metadata.department,
                    semester: res.metadata.semester,
                    section: res.metadata.section,
                    schedule: res.schedule
                })
            );

            await Promise.all(savePromises);

            Alert.alert(
                'Success',
                'All timetables saved successfully',
                [{ text: 'Exit', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save timetables');
        } finally {
            setLoading(false);
        }
    };

    const openEditSlot = (day, slotIndex, currentData) => {
        if (currentData.isFixed) return; // Prevent editing breaks/lunch
        setSelectedSlot({ day, index: slotIndex, ...currentData });

        // Pre-select current subject ID if possible, else empty
        const currentSubjects = batchResults[currentClassIndex]?.subjects || [];
        const foundSub = currentSubjects.find(s => (s.name || s.label) === currentData.subject);
        setNewSubjectForSlot(foundSub ? (foundSub.subjectId || foundSub.id) : '');
        setEditSlotModalVisible(true);
    };

    const handleSaveSlot = () => {
        if (!selectedSlot) return;

        const newResults = [...batchResults];
        const currentRes = newResults[currentClassIndex];
        const newSchedule = { ...currentRes.schedule };
        const daySlots = [...newSchedule[selectedSlot.day]];

        if (newSubjectForSlot === 'FREE') {
            daySlots[selectedSlot.index] = {
                ...daySlots[selectedSlot.index],
                subject: 'Free',
                staff: '-',
                room: '-'
            };
        } else {
            const subDetails = currentRes.subjects.find(s => (s.subjectId || s.id) === newSubjectForSlot);
            if (subDetails) {
                daySlots[selectedSlot.index] = {
                    ...daySlots[selectedSlot.index],
                    subject: subDetails.name || subDetails.label,
                    staff: subDetails.staffName || subDetails.staffId,
                    room: 'Room 101'
                };
            }
        }

        newSchedule[selectedSlot.day] = daySlots;
        currentRes.schedule = newSchedule;
        setBatchResults(newResults);
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

    const groupSlots = (slots) => {
        if (!slots || slots.length === 0) return [];
        const groups = [];
        let currentGroup = null;

        slots.forEach((slot, idx) => {
            // Determine if this slot should be merged with the previous one
            const isPracticalBlock = slot.subject !== 'Free' && !slot.isFixed &&
                currentGroup &&
                currentGroup.subject === slot.subject &&
                currentGroup.staff === slot.staff;

            // Also check for Breaks in between the same subject
            const isBreakInsideBlock = slot.subject === 'Break' &&
                idx > 0 && idx < slots.length - 1 &&
                slots[idx - 1].subject === slots[idx + 1].subject &&
                slots[idx - 1].staff === slots[idx + 1].staff &&
                slots[idx - 1].subject !== 'Free' && !slots[idx - 1].isFixed;

            if (isPracticalBlock || isBreakInsideBlock) {
                currentGroup.endTime = slot.endTime;
                currentGroup.slots.push({ ...slot, originalIndex: idx });
                if (isBreakInsideBlock) currentGroup.hasBreak = true;
            } else {
                currentGroup = {
                    ...slot,
                    slots: [{ ...slot, originalIndex: idx }],
                    hasBreak: false
                };
                groups.push(currentGroup);
            }
        });
        return groups;
    };

    const renderDaySchedule = (day, slots) => {
        const groupedSlots = groupSlots(slots);
        return (
            <View key={day} style={styles.daySection}>
                <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>{day}</Text>
                </LinearGradient>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsRow}>
                    {groupedSlots.map((group, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.slotCard,
                                group.isFixed && styles.fixedSlot,
                                group.slots.length > 1 && { width: 145 + (group.slots.length - 1) * 40, borderColor: '#800000', borderWidth: 1.5, backgroundColor: '#fffcfc' }
                            ]}
                            onPress={() => !group.isFixed && openEditSlot(day, group.slots[0].originalIndex, group)}
                            activeOpacity={group.isFixed ? 1 : 0.7}
                        >
                            <View style={styles.slotHeader}>
                                <Clock size={12} color={group.slots.length > 1 ? "#800000" : "#64748b"} />
                                <Text style={[styles.timeText, group.slots.length > 1 && { color: '#800000' }]}>
                                    {group.startTime} - {group.endTime}
                                </Text>
                            </View>
                            <Text style={[styles.subjectText, group.isFixed && { color: '#94a3b8' }]} numberOfLines={1}>
                                {group.subject}
                            </Text>
                            {group.staff !== '-' && (
                                <View style={styles.staffRow}>
                                    <Users size={12} color="#94a3b8" />
                                    <Text style={styles.staffText} numberOfLines={1}>{group.staff}</Text>
                                </View>
                            )}
                            {group.slots.length > 1 && (
                                <View style={styles.spanBadge}>
                                    <Text style={styles.spanBadgeText}>{group.slots.filter(s => !s.isFixed).length} Periods</Text>
                                </View>
                            )}
                            {!group.isFixed && <Edit3 size={12} color="#cbd5e1" style={{ position: 'absolute', bottom: 8, right: 8 }} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

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
                                <View style={{ flex: 1.4, marginRight: 8 }}>
                                    <CustomDropdown
                                        label="Year"
                                        value={selectedYear}
                                        options={years}
                                        onSelect={setSelectedYear}
                                        placeholder="Year"
                                    />
                                </View>
                                <View style={{ flex: 2, marginRight: 8 }}>
                                    <CustomDropdown
                                        label="Semester"
                                        value={semester}
                                        options={semesterOptions}
                                        onSelect={setSemester}
                                        placeholder="Semester"
                                        disabled={!selectedYear}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <CustomDropdown
                                        label="Section"
                                        value={section}
                                        options={sectionOptions}
                                        onSelect={setSection}
                                        placeholder="Sec"
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
                                    onSelect={(val) => {
                                        const sub = subjectsList.find(s => s.value === val);
                                        const defaultDur = sub?.duration || 2;
                                        setCurrentSubject({
                                            ...currentSubject,
                                            subjectId: val,
                                            duration: sub?.type === 'Practical' ? String(defaultDur) : '1',
                                            hoursPerWeek: sub?.type === 'Practical' ? String(defaultDur) : currentSubject.hoursPerWeek
                                        });
                                    }}
                                    placeholder={selectedDept && selectedYear && semester ? "Select Subject" : "Fill class info details"}
                                    icon={BookOpen}
                                />
                                <CustomDropdown
                                    label="Staff"
                                    value={currentSubject.staffId}
                                    options={staffList}
                                    onSelect={(val) => {
                                        setCurrentSubject({ ...currentSubject, staffId: val });
                                    }}
                                    placeholder="Select Staff"
                                    icon={Users}
                                />
                                {currentSubject.subjectId && subjectsList.find(s => s.value === currentSubject.subjectId)?.type === 'Practical' && (
                                    <View style={{ marginBottom: 15 }}>
                                        <CustomDropdown
                                            label="Continuous Periods (Practical)"
                                            value={currentSubject.duration}
                                            options={[
                                                { label: '2 Periods', value: '2' },
                                                { label: '3 Periods', value: '3' },
                                                { label: '4 Periods', value: '4' }
                                            ]}
                                            onSelect={(val) => setCurrentSubject({
                                                ...currentSubject,
                                                duration: val,
                                                hoursPerWeek: val // Auto-sync hours with duration for typical lab use
                                            })}
                                            placeholder="Select Duration"
                                            icon={Clock}
                                        />
                                        <View style={styles.practicalInfo}>
                                            <Sparkles size={16} color="#0891b2" />
                                            <Text style={styles.practicalInfoText}>
                                                {parseInt(currentSubject.hoursPerWeek) >= parseInt(currentSubject.duration) ? (
                                                    `Logic: ${Math.floor(parseInt(currentSubject.hoursPerWeek) / parseInt(currentSubject.duration))} Block(s) of ${currentSubject.duration} continuous periods will be scheduled.`
                                                ) : (
                                                    `Warning: Total hours (${currentSubject.hoursPerWeek}) is less than block duration (${currentSubject.duration}).`
                                                )}
                                            </Text>
                                        </View>
                                    </View>
                                )}
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
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Text style={styles.subItemName}>{item.name}</Text>
                                                    <View style={[styles.typeBadge, item.type === 'Practical' ? styles.practicalBadge : styles.theoryBadge]}>
                                                        <Clock size={10} color={item.type === 'Practical' ? '#0891b2' : '#64748b'} />
                                                        <Text style={styles.typeBadgeText}>{item.type}</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.subItemDetail}>
                                                    {item.staffName} • {item.hoursPerWeek} hrs {item.type === 'Practical' ? `(${item.duration} periods block)` : ''}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => removeSubject(item.id)} style={styles.removeBtn}>
                                                <X size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Pending Classes Batch */}
                            {pendingClasses.length > 0 && (
                                <View style={styles.batchSection}>
                                    <View style={styles.sectionHeader}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Sparkles size={20} color="#800000" style={{ marginRight: 8 }} />
                                            <Text style={styles.sectionTitle}>Batch Queue ({pendingClasses.length})</Text>
                                        </View>
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.batchContainer}>
                                        {pendingClasses.map((item, idx) => (
                                            <View key={idx} style={styles.batchCard}>
                                                <View style={styles.batchCardContent}>
                                                    <Text style={styles.batchCardTitle}>{item.metadata.deptName}</Text>
                                                    <Text style={styles.batchCardSubtitle}>{item.metadata.semester} • Sec {item.metadata.section}</Text>
                                                    <Text style={styles.batchCardCount}>{item.subjects.length} Subjects</Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.batchRemoveBtn}
                                                    onPress={() => removeClassFromBatch(idx)}
                                                >
                                                    <X size={14} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={{ height: 100 }} />
                        </ScrollView>

                        {/* Bottom Buttons */}
                        <View style={styles.bottomActions}>
                            <TouchableOpacity
                                style={styles.nextBtn}
                                onPress={handleNext}
                            >
                                <Plus size={20} color="#800000" style={{ marginRight: 8 }} />
                                <Text style={styles.nextBtnText}>Add to Batch</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={generateTimeTable}
                            >
                                <Sparkles size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitBtnText}>Generate All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <View style={styles.resultHeader}>
                            <View>
                                <Text style={styles.resultTitle}>Preview Schedules</Text>
                                <Text style={styles.resultSubtitle}>
                                    Showing {currentClassIndex + 1} of {batchResults.length} classes
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setStep(1)} style={styles.editBtnSmall}>
                                <Text style={styles.editBtnTextSmall}>Add More</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Tabs for multiple classes */}
                        <View style={styles.tabsContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {batchResults.map((res, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.tab, currentClassIndex === idx && styles.activeTab]}
                                        onPress={() => setCurrentClassIndex(idx)}
                                    >
                                        <Text style={[styles.tabText, currentClassIndex === idx && styles.activeTabText]}>
                                            {res.metadata.section} ({res.metadata.semester.split(' ')[0]} Yr)
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <Text style={styles.classDetailHeader}>
                            {batchResults[currentClassIndex].metadata.deptName} - {batchResults[currentClassIndex].metadata.semester} Section {batchResults[currentClassIndex].metadata.section}
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {batchResults[currentClassIndex].schedule &&
                                Object.entries(batchResults[currentClassIndex].schedule).map(([day, slots]) => renderDaySchedule(day, slots))}
                            <View style={{ height: 100 }} />
                        </ScrollView>

                        <View style={styles.bottomActions}>
                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 10 }]}
                                onPress={() => setStep(1)}
                            >
                                <Edit3 size={20} color="#64748b" style={{ marginRight: 8 }} />
                                <Text style={[styles.submitBtnText, { color: '#64748b' }]}>Edit Batch</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.submitBtn} onPress={saveTimeTable}>
                                <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitBtnText}>Save All</Text>
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
                                options={[
                                    { label: 'Free Period', value: 'FREE' },
                                    ...(batchResults[currentClassIndex]?.subjects || []).map(s => ({
                                        label: `${s.name || s.label} (${s.staffName || s.staffId})`,
                                        value: s.subjectId || s.id
                                    }))
                                ]}
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
    subItemDetail: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: '500' },
    removeBtn: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 10 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    theoryBadge: { backgroundColor: '#f1f5f9' },
    practicalBadge: { backgroundColor: '#ecfeff' },
    typeBadgeText: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },

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
    },

    batchSection: { marginTop: 20 },
    batchContainer: { paddingVertical: 10 },
    batchCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        width: width * 0.45,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    batchCardContent: { flex: 1 },
    batchCardTitle: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
    batchCardSubtitle: { fontSize: 10, color: '#64748b', marginTop: 2 },
    batchCardCount: { fontSize: 10, color: '#800000', fontWeight: '700', marginTop: 4 },
    batchRemoveBtn: { position: 'absolute', top: 8, right: 8, padding: 4 },

    tabsContainer: { marginBottom: 20 },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    activeTab: { backgroundColor: '#800000', borderColor: '#800000' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    activeTabText: { color: '#fff' },
    activeTabText: { color: '#fff' },
    classDetailHeader: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 15, textAlign: 'center' },
    spanBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#800000',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6
    },
    spanBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase'
    },
    practicalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecfeff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#cffafe'
    },
    practicalInfoText: {
        fontSize: 12,
        color: '#0891b2',
        fontWeight: '700',
        marginLeft: 8,
        flex: 1
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    theoryBadge: {
        backgroundColor: '#f1f5f9',
    },
    practicalBadge: {
        backgroundColor: '#ecfeff',
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#475569',
        textTransform: 'uppercase'
    }
});

export default TimeTableGenerator;
