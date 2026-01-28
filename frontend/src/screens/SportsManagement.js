import React, { useState, useContext, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    Modal,
    Platform,
    Dimensions,
    ActivityIndicator,
    FlatList
} from 'react-native';
import {
    ChevronLeft,
    Plus,
    X,
    Trophy,
    Users,
    Calendar,
    MapPin,
    Clock,
    Search,
    Check
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const { width } = Dimensions.get('window');

const SportsManagement = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Events'); // 'Events' or 'Teams'
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Data
    const [events, setEvents] = useState([
        { id: 1, title: 'Inter-College Football', date: '2024-03-15', time: '10:00 AM', venue: 'Main Ground' },
        { id: 2, title: 'Annual Sports Day', date: '2024-04-20', time: '09:00 AM', venue: 'Sports Complex' },
    ]);

    const [teams, setTeams] = useState([
        { id: 1, name: 'College Football Team', captain: 'John Doe', members: 15, playerList: [] },
        { id: 2, name: 'Basketball Squad', captain: 'Mike Ross', members: 12, playerList: [] },
    ]);

    const [allStudents, setAllStudents] = useState([]);

    // Form States
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventVenue, setEventVenue] = useState('');

    const [teamName, setTeamName] = useState('');
    const [teamCaptain, setTeamCaptain] = useState('');

    // Team Member Selection
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    useEffect(() => {
        if (activeTab === 'Teams') {
            fetchStudents();
        }
    }, [activeTab]);

    const fetchStudents = async () => {
        try {
            setLoadingStudents(true);
            const response = await api.get('/admin/users');
            const students = response.data.filter(u => u.role === 'Student');
            setAllStudents(students);
        } catch (error) {
            console.error('Error fetching students:', error);
            // Alert.alert('Error', 'Failed to fetch students list');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleSubmit = () => {
        if (activeTab === 'Events') {
            if (!eventName || !eventDate || !eventVenue) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }
            const newEvent = {
                id: Date.now(),
                title: eventName,
                date: eventDate,
                time: eventTime,
                venue: eventVenue
            };
            setEvents([...events, newEvent]);
        } else {
            if (!teamName || !teamCaptain) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }
            const newTeam = {
                id: Date.now(),
                name: teamName,
                captain: teamCaptain,
                members: selectedStudents.length,
                playerList: selectedStudents
            };
            setTeams([...teams, newTeam]);
        }
        setModalVisible(false);
        resetForm();
    };

    const resetForm = () => {
        setEventName('');
        setEventDate('');
        setEventTime('');
        setEventVenue('');
        setTeamName('');
        setTeamCaptain('');
        setSelectedStudents([]);
        setStudentSearchQuery('');
        setIsDropdownVisible(false);
    };

    const toggleStudentSelection = (student) => {
        const isSelected = selectedStudents.some(s => s._id === student._id);
        if (isSelected) {
            setSelectedStudents(selectedStudents.filter(s => s._id !== student._id));
        } else {
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    const filteredStudents = allStudents.filter(student =>
        student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        student.userId.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );

    const renderEventCard = (event) => (
        <View key={event.id} style={styles.card}>
            <View style={styles.cardIconWrapper}>
                <Calendar size={24} color="#800000" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <View style={styles.cardRow}>
                    <Clock size={14} color="#64748b" />
                    <Text style={styles.cardText}>{event.date} • {event.time}</Text>
                </View>
                <View style={styles.cardRow}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.cardText}>{event.venue}</Text>
                </View>
            </View>
        </View>
    );

    const renderTeamCard = (team) => (
        <View key={team.id} style={styles.card}>
            <View style={[styles.cardIconWrapper, { backgroundColor: '#fdf2f8' }]}>
                <Users size={24} color="#ec4899" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{team.name}</Text>
                <View style={styles.cardRow}>
                    <Trophy size={14} color="#64748b" />
                    <Text style={styles.cardText}>Captain: {team.captain}</Text>
                </View>
                <View style={styles.cardRow}>
                    <Users size={14} color="#64748b" />
                    <Text style={styles.cardText}>{team.members} Members</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#5a0000', '#800000']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sports Management</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Events' && styles.activeTab]}
                        onPress={() => setActiveTab('Events')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Events' && styles.activeTabText]}>Events</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Teams' && styles.activeTab]}
                        onPress={() => setActiveTab('Teams')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Teams' && styles.activeTabText]}>Teams</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{activeTab} List</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Plus size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Add {activeTab === 'Events' ? 'Event' : 'Team'}</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'Events' ? (
                    events.map(renderEventCard)
                ) : (
                    teams.map(renderTeamCard)
                )}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add {activeTab === 'Events' ? 'New Event' : 'New Team'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} nestedScrollEnabled={true}>
                            {activeTab === 'Events' ? (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Event Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g., Annual Sports Day"
                                            value={eventName}
                                            onChangeText={setEventName}
                                        />
                                    </View>
                                    <View style={styles.row}>
                                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                            <Text style={styles.label}>Date</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="YYYY-MM-DD"
                                                value={eventDate}
                                                onChangeText={setEventDate}
                                            />
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>Time</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="HH:MM AM/PM"
                                                value={eventTime}
                                                onChangeText={setEventTime}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Venue</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g., College Ground"
                                            value={eventVenue}
                                            onChangeText={setEventVenue}
                                        />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Team Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g., Football Team"
                                            value={teamName}
                                            onChangeText={setTeamName}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Captain Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g., John Doe"
                                            value={teamCaptain}
                                            onChangeText={setTeamCaptain}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Team Members ({selectedStudents.length})</Text>

                                        {/* Selected Students Chips */}
                                        <View style={styles.chipsContainer}>
                                            {selectedStudents.map(student => (
                                                <View key={student._id} style={styles.chip}>
                                                    <Text style={styles.chipText}>{student.name}</Text>
                                                    <TouchableOpacity onPress={() => toggleStudentSelection(student)}>
                                                        <X size={14} color="#800000" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>

                                        {/* Search Box */}
                                        <View style={styles.searchBox}>
                                            <Search size={18} color="#94a3b8" />
                                            <TextInput
                                                style={styles.searchInput}
                                                placeholder="Search student by Name or ID..."
                                                value={studentSearchQuery}
                                                onChangeText={(text) => {
                                                    setStudentSearchQuery(text);
                                                    setIsDropdownVisible(true);
                                                }}
                                                onFocus={() => setIsDropdownVisible(true)}
                                            />
                                        </View>

                                        {/* Dropdown List */}
                                        {isDropdownVisible && (
                                            <View style={styles.dropdownList}>
                                                {loadingStudents ? (
                                                    <ActivityIndicator color="#800000" style={{ padding: 20 }} />
                                                ) : filteredStudents.length === 0 ? (
                                                    <Text style={styles.noResultText}>No students found</Text>
                                                ) : (
                                                    filteredStudents.slice(0, 10).map(student => {
                                                        const isSelected = selectedStudents.some(s => s._id === student._id);
                                                        return (
                                                            <TouchableOpacity
                                                                key={student._id}
                                                                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                                                onPress={() => toggleStudentSelection(student)}
                                                            >
                                                                <View>
                                                                    <Text style={[styles.dropdownName, isSelected && styles.selectedText]}>{student.name}</Text>
                                                                    <Text style={[styles.dropdownId, isSelected && styles.selectedTextSub]}>{student.userId}</Text>
                                                                </View>
                                                                {isSelected && <Check size={18} color="#800000" />}
                                                            </TouchableOpacity>
                                                        );
                                                    })
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </>
                            )}

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                <Text style={styles.submitButtonText}>Create {activeTab === 'Events' ? 'Event' : 'Team'}</Text>
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 10 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 15,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#fff',
    },
    tabText: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '700',
    },
    activeTabText: {
        color: '#800000',
    },
    scrollContent: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    addButton: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 6,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardIconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: '#ffe4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    cardText: {
        fontSize: 13,
        color: '#64748b',
        marginLeft: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    row: {
        flexDirection: 'row',
    },
    submitButton: {
        backgroundColor: '#800000',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    // New Styles for Student Search
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#1e293b',
    },
    dropdownList: {
        marginTop: 6,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        maxHeight: 200,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemSelected: {
        backgroundColor: '#ffe4e6',
    },
    dropdownName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    dropdownId: {
        fontSize: 12,
        color: '#64748b',
    },
    selectedText: {
        color: '#800000',
    },
    selectedTextSub: {
        color: '#5a0000',
    },
    noResultText: {
        padding: 16,
        textAlign: 'center',
        color: '#94a3b8',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffe4e6',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f0abfc',
    },
    chipText: {
        fontSize: 12,
        color: '#800000',
        fontWeight: '600',
        marginRight: 6,
    },
});

export default SportsManagement;

