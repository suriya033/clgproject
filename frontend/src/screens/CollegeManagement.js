import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    Platform
} from 'react-native';
import api from '../api/api';
import { Plus, Trash2, X, Building2, BookOpen } from 'lucide-react-native';

const CollegeManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('Departments');
    const [formData, setFormData] = useState({ name: '', code: '', duration: '', department: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [deptRes, courseRes] = await Promise.all([
                api.get('/college/departments'),
                api.get('/college/courses')
            ]);
            setDepartments(deptRes.data);
            setCourses(courseRes.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            if (activeTab === 'Departments') {
                await api.post('/college/departments', { name: formData.name, code: formData.code });
            } else {
                await api.post('/college/courses', {
                    name: formData.name,
                    code: formData.code,
                    duration: formData.duration,
                    department: formData.department
                });
            }
            Alert.alert('Success', `${activeTab.slice(0, -1)} created successfully`);
            setModalVisible(false);
            fetchData();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Departments' && styles.activeTab]}
                    onPress={() => setActiveTab('Departments')}
                >
                    <Text style={[styles.tabText, activeTab === 'Departments' && styles.activeTabText]}>Departments</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Courses' && styles.activeTab]}
                    onPress={() => setActiveTab('Courses')}
                >
                    <Text style={[styles.tabText, activeTab === 'Courses' && styles.activeTabText]}>Courses</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>{activeTab}</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Plus size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add {activeTab.slice(0, -1)}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator animating={true} size="large" color="#4361ee" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={activeTab === 'Departments' ? departments : courses}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardIcon}>
                                {activeTab === 'Departments' ? <Building2 color="#4361ee" /> : <BookOpen color="#4361ee" />}
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardName}>{item.name}</Text>
                                <Text style={styles.cardCode}>{item.code}</Text>
                                {item.department && <Text style={styles.cardDept}>{item.department.name}</Text>}
                            </View>
                        </View>
                    )}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={!!modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add {activeTab.slice(0, -1)}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#6c757d" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <TextInput
                                style={styles.input}
                                placeholder="Name"
                                onChangeText={(val) => setFormData({ ...formData, name: val })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Code"
                                onChangeText={(val) => setFormData({ ...formData, code: val })}
                            />
                            {activeTab === 'Courses' && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Duration (e.g. 4 Years)"
                                        onChangeText={(val) => setFormData({ ...formData, duration: val })}
                                    />
                                    <Text style={styles.label}>Select Department ID</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Department ID"
                                        onChangeText={(val) => setFormData({ ...formData, department: val })}
                                    />
                                </>
                            )}

                            <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
                                <Text style={styles.submitButtonText}>Create</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 6,
        marginBottom: 24,
        marginTop: (Platform?.OS === 'android') ? 20 : 0,
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    activeTab: {
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabText: { fontWeight: '700', color: '#64748b', fontSize: 15 },
    activeTabText: { color: '#4361ee' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#1e293b', letterSpacing: -0.5 },
    addButton: {
        backgroundColor: '#4361ee',
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    addButtonText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
    card: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    cardContent: { flex: 1 },
    cardName: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
    cardCode: { fontSize: 14, color: '#64748b', marginTop: 2, fontWeight: '500' },
    cardDept: { fontSize: 12, color: '#4361ee', marginTop: 6, fontWeight: '700' },
    modalContainer: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '80%',
        elevation: 20,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
    input: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        fontSize: 16,
        color: '#1e293b'
    },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#475569', marginLeft: 4 },
    submitButton: {
        backgroundColor: '#4361ee',
        padding: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});

export default CollegeManagement;
