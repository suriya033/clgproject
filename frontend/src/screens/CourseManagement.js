import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
    RefreshControl
} from 'react-native';
import {
    BookOpen,
    Plus,
    X,
    ChevronLeft,
    Send,
    Trash2,
    Search,
    Clock,
    Hash,
    Building
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { college } from '../api/api';

const CourseManagement = ({ navigation }) => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [duration, setDuration] = useState('');
    const [department, setDepartment] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCourses(courses);
        } else {
            const filtered = courses.filter(course =>
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.department?.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCourses(filtered);
        }
    }, [searchQuery, courses]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await college.getCourses();
            setCourses(response.data);
            setFilteredCourses(response.data);
        } catch (error) {
            console.error('Fetch courses error:', error);
            Alert.alert('Error', 'Failed to fetch courses');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await college.getDepartments();
            setDepartments(response.data);
        } catch (error) {
            console.error('Fetch departments error:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCourses();
    };

    const handleSubmit = async () => {
        if (!name || !code || !duration || !department) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const data = { name, code, duration, department, description };

            await college.createCourse(data);
            Alert.alert('Success', 'Course created successfully');
            setModalVisible(false);
            resetForm();
            fetchCourses();
        } catch (error) {
            console.error('Create course error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create course');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Course',
            'Are you sure you want to delete this course?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await college.deleteCourse(id);
                            fetchCourses();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete course');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setName('');
        setCode('');
        setDuration('');
        setDepartment('');
        setDescription('');
    };

    const renderCourseCard = (course) => (
        <View key={course._id} style={styles.courseCard}>
            <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                    <Hash size={12} color="#4361ee" />
                    <Text style={styles.codeText}>{course.code}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(course._id)} style={styles.deleteButton}>
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <Text style={styles.courseName}>{course.name}</Text>

            <View style={styles.infoSection}>
                <View style={styles.infoItem}>
                    <View style={styles.iconWrapper}>
                        <Building size={14} color="#64748b" />
                    </View>
                    <View>
                        <Text style={styles.infoLabel}>Department</Text>
                        <Text style={styles.infoValue}>{course.department?.name || 'N/A'}</Text>
                    </View>
                </View>

                <View style={[styles.infoItem, { marginTop: 12 }]}>
                    <View style={styles.iconWrapper}>
                        <Clock size={14} color="#64748b" />
                    </View>
                    <View>
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>{course.duration}</Text>
                    </View>
                </View>
            </View>

            {course.description && (
                <Text style={styles.description} numberOfLines={2}>{course.description}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#4361ee', '#3f37c9']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Courses</Text>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Plus size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4361ee" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4361ee" />
                    }
                >
                    {filteredCourses.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <BookOpen size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No Courses</Text>
                            <Text style={styles.emptySubtitle}>Start by adding a new course</Text>
                        </View>
                    ) : (
                        filteredCourses.map(renderCourseCard)
                    )}
                </ScrollView>
            )}

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
                                <Text style={styles.modalTitle}>Add Course</Text>
                                <Text style={styles.modalSubtitle}>Create a new academic program</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Course Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., B.Tech Computer Science"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Course Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., BT-CSE"
                                    value={code}
                                    onChangeText={setCode}
                                    autoCapitalize="characters"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Duration</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 4 Years"
                                    value={duration}
                                    onChangeText={setDuration}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Select Department</Text>
                                <View style={styles.selector}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {departments.map(dept => (
                                            <TouchableOpacity
                                                key={dept._id}
                                                style={[
                                                    styles.option,
                                                    department === dept._id && styles.optionActive
                                                ]}
                                                onPress={() => setDepartment(dept._id)}
                                            >
                                                <Text style={[
                                                    styles.optionText,
                                                    department === dept._id && styles.optionTextActive
                                                ]}>{dept.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                    placeholder="Brief course description..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitButtonText}>Create Course</Text>
                                        <Send size={18} color="#fff" style={{ marginLeft: 8 }} />
                                    </>
                                )}
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
        paddingBottom: 25,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    courseCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    codeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    codeText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#4361ee',
        marginLeft: 4,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#fff1f2',
        borderRadius: 10,
    },
    courseName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    infoSection: {
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        elevation: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    description: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginTop: 4,
    },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
    emptySubtitle: { fontSize: 15, color: '#64748b', marginTop: 8 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 25,
        maxHeight: '90%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25
    },
    modalTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    modalSubtitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    closeButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
    },
    modalForm: { marginBottom: 10 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 10 },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 15,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    selector: { marginTop: 5 },
    option: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    optionActive: {
        backgroundColor: '#eef2ff',
        borderColor: '#4361ee'
    },
    optionText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    optionTextActive: { color: '#4361ee' },
    submitButton: {
        backgroundColor: '#4361ee',
        borderRadius: 18,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 8,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    disabledButton: { opacity: 0.7 },
    submitButtonText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});

export default CourseManagement;
