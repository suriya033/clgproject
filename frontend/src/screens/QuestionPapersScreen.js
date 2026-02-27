import React, { useState, useEffect, useContext } from 'react';
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
    SafeAreaView,
    StatusBar,
    Platform,
    ScrollView,
} from 'react-native';
import {
    ChevronLeft,
    Search,
    Plus,
    FileText,
    Download,
    X,
    Filter,
    BookOpen,
    Calendar,
    GraduationCap,
    Send,
    Menu,
    Trash2
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { college } from '../api/api';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import api from '../api/api';

const QuestionPapersScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [papers, setPapers] = useState([]);
    const [filteredPapers, setFilteredPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        department: '',
        year: '',
        semester: '',
        examType: 'Internal',
        examYear: new Date().getFullYear().toString(),
        file: null
    });

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            setLoading(true);
            const res = await college.getQuestionPapers();
            setPapers(res.data);
            setFilteredPapers(res.data);
        } catch (error) {
            console.error('Fetch papers error:', error);
            Alert.alert('Error', 'Failed to load question papers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = papers.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.subject.toLowerCase().includes(query) ||
            p.department.toLowerCase().includes(query)
        );
        setFilteredPapers(filtered);
    }, [searchQuery, papers]);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
            });
            if (!result.canceled) {
                setFormData({ ...formData, file: result.assets[0] });
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const handleUpload = async () => {
        if (!formData.title || !formData.subject || !formData.department || !formData.file) {
            Alert.alert('Error', 'Please fill in all required fields and select a PDF file');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('subject', formData.subject);
        data.append('department', formData.department);
        data.append('year', formData.year);
        data.append('semester', formData.semester);
        data.append('examType', formData.examType);
        data.append('examYear', formData.examYear);
        data.append('file', {
            uri: formData.file.uri,
            name: formData.file.name,
            type: 'application/pdf'
        });

        try {
            setUploading(true);
            await college.uploadQuestionPaper(data);
            Alert.alert('Success', 'Question paper uploaded successfully');
            setModalVisible(false);
            setFormData({
                title: '',
                subject: '',
                department: '',
                year: '',
                semester: '',
                examType: 'Internal',
                examYear: new Date().getFullYear().toString(),
                file: null
            });
            fetchPapers();
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload question paper');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (fileUrl, fileName) => {
        const url = `${api.defaults.baseURL.replace('/api', '')}${fileUrl}`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        try {
            const downloadRes = await FileSystem.downloadAsync(url, fileUri);
            if (downloadRes.status === 200) {
                await Sharing.shareAsync(downloadRes.uri);
            } else {
                Alert.alert('Error', 'Failed to download file');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download or share file');
        }
    };

    const renderPaperItem = ({ item }) => (
        <View style={styles.paperCard}>
            <View style={styles.cardHeader}>
                <View style={styles.iconWrapper}>
                    <FileText size={24} color="#800000" />
                </View>
                <View style={styles.paperInfo}>
                    <Text style={styles.paperTitle}>{item.title}</Text>
                    <Text style={styles.paperSub}>{item.subject}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleDownload(item.fileUrl, `${item.title}.pdf`)}
                    style={styles.downloadBtn}
                >
                    <Download size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailTag}>
                    <GraduationCap size={14} color="#64748b" />
                    <Text style={styles.tagText}>{item.department}</Text>
                </View>
                <View style={styles.detailTag}>
                    <Calendar size={14} color="#64748b" />
                    <Text style={styles.tagText}>{item.examYear} • {item.examType}</Text>
                </View>
            </View>
            <View style={styles.footerRow}>
                <Text style={styles.yearText}>{item.year} Year • Sem {item.semester}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
                        <Menu size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Question Papers</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchBar}>
                    <Search size={20} color="rgba(255,255,255,0.6)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search papers, subjects, departments..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={filteredPapers}
                    renderItem={renderPaperItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <BookOpen size={64} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No question papers found</Text>
                        </View>
                    }
                />
            )}

            {(user?.role === 'Library' || user?.role === 'Admin') && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                >
                    <Plus size={30} color="#fff" />
                </TouchableOpacity>
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Upload Question Paper</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Paper Title *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Data Structures 2023"
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Subject Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Computer Science"
                                    value={formData.subject}
                                    onChangeText={(text) => setFormData({ ...formData, subject: text })}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.label}>Department *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. CSE"
                                        value={formData.department}
                                        onChangeText={(text) => setFormData({ ...formData, department: text })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Exam Year *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="2024"
                                        keyboardType="numeric"
                                        value={formData.examYear}
                                        onChangeText={(text) => setFormData({ ...formData, examYear: text })}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.label}>Year (1-4)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1"
                                        keyboardType="numeric"
                                        value={formData.year}
                                        onChangeText={(text) => setFormData({ ...formData, year: text })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Semester (1-8)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1"
                                        keyboardType="numeric"
                                        value={formData.semester}
                                        onChangeText={(text) => setFormData({ ...formData, semester: text })}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Exam Type</Text>
                                <View style={styles.typeSelector}>
                                    {['Internal', 'Model', 'Semester'].map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[styles.typeBtn, formData.examType === type && styles.activeTypeBtn]}
                                            onPress={() => setFormData({ ...formData, examType: type })}
                                        >
                                            <Text style={[styles.typeText, formData.examType === type && styles.activeTypeText]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.fileBtn, formData.file && styles.fileBtnSelected]}
                                onPress={handlePickDocument}
                            >
                                <FileText size={20} color={formData.file ? '#800000' : '#64748b'} />
                                <Text style={[styles.fileBtnText, formData.file && { color: '#800000' }]}>
                                    {formData.file ? formData.file.name : 'Select PDF File'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.submitBtn, uploading && { opacity: 0.7 }]}
                                onPress={handleUpload}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitBtnText}>Upload Paper</Text>
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
    header: { padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    menuBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 15, paddingHorizontal: 15, height: 45 },
    searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontSize: 14 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 100 },
    paperCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconWrapper: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#fff1f2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    paperInfo: { flex: 1 },
    paperTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    paperSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
    downloadBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#800000', justifyContent: 'center', alignItems: 'center' },
    detailsRow: { flexDirection: 'row', marginTop: 15, gap: 10 },
    detailTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
    tagText: { fontSize: 11, color: '#64748b', fontWeight: '600' },
    footerRow: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
    yearText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#800000', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#800000', shadowOpacity: 0.3, shadowRadius: 10 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#94a3b8', fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '90%', padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    formContainer: { flex: 1 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, fontSize: 15, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
    row: { flexDirection: 'row', marginBottom: 0 },
    typeSelector: { flexDirection: 'row', gap: 10 },
    typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    activeTypeBtn: { backgroundColor: '#fff1f2', borderColor: '#800000' },
    typeText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    activeTypeText: { color: '#800000' },
    fileBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', marginBottom: 25 },
    fileBtnSelected: { borderColor: '#800000', backgroundColor: '#fff1f2' },
    fileBtnText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    submitBtn: { backgroundColor: '#800000', paddingVertical: 16, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default QuestionPapersScreen;
