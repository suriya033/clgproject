import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import {
    ChevronLeft,
    Upload,
    FileText,
    X,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    FileUp
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const UploadNotes = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [selectedDept, setSelectedDept] = useState(user?.department || '');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const departments = [
        'Artificial intelligence and data science',
        'Information Technology',
        'Computer Science and Engineering',
        'Electronics and Communication Engineering',
        'Mechanical Engineering',
        'Electrical and Electronics Engineering',
        'Civil Engineering'
    ];

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                setFile(result.assets[0]);
            }
        } catch (err) {
            console.error('Document picking error:', err);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleUpload = async () => {
        if (!title || !subject || !selectedDept || !year || !semester || !file) {
            Alert.alert('Missing Fields', 'Please fill all details and select a file.');
            return;
        }

        setLoading(true);
        const formData = new FormData();

        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('department', selectedDept);
        formData.append('year', year);
        formData.append('semester', semester);

        const fileUri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
        formData.append('noteFile', {
            uri: fileUri,
            name: file.name,
            type: file.mimeType || 'application/pdf'
        });

        try {
            await api.post('/notes/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Alert.alert('Success', 'Notes uploaded successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Study Material</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.uploadCard}>
                    <TouchableOpacity
                        style={[styles.dropZone, file && styles.dropZoneActive]}
                        onPress={pickDocument}
                    >
                        {file ? (
                            <View style={styles.fileSelected}>
                                <FileText size={48} color="#800000" />
                                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                <Text style={styles.fileSize}>{(file.size / (1024 * 1024)).toFixed(2)} MB</Text>
                                <TouchableOpacity onPress={() => setFile(null)} style={styles.removeFile}>
                                    <X size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.filePlaceholder}>
                                <View style={styles.iconCircle}>
                                    <FileUp size={32} color="#800000" />
                                </View>
                                <Text style={styles.uploadPrompt}>Pick a Document</Text>
                                <Text style={styles.uploadSubPrompt}>Tap to browse files (PDF, DOC, Images)</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Note Title</Text>
                            <View style={styles.inputWrapper}>
                                <FileText size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Unit 1 - Introduction to AI"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subject Name/Code</Text>
                            <View style={styles.inputWrapper}>
                                <BookOpen size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. CS3491 Artificial Intelligence"
                                    value={subject}
                                    onChangeText={setSubject}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Department</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                {departments.map(dept => (
                                    <TouchableOpacity
                                        key={dept}
                                        onPress={() => setSelectedDept(dept)}
                                        style={[styles.chip, selectedDept === dept && styles.activeChip]}
                                    >
                                        <Text style={[styles.chipText, selectedDept === dept && styles.activeChipText]}>{dept}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Year</Text>
                                <View style={styles.inputWrapper}>
                                    <Calendar size={20} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1"
                                        keyboardType="numeric"
                                        value={year}
                                        onChangeText={setYear}
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Semester</Text>
                                <View style={styles.inputWrapper}>
                                    <CheckCircle2 size={20} color="#64748b" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="S1"
                                        value={semester}
                                        onChangeText={setSemester}
                                    />
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.uploadBtn, (loading || !file) && styles.disabledBtn]}
                            onPress={handleUpload}
                            disabled={loading || !file}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Upload size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.uploadBtnText}>Upload Notes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        paddingTop: Platform.OS === 'android' ? 40 : 20
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    uploadCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    dropZone: {
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 20,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        marginBottom: 25
    },
    dropZoneActive: {
        borderColor: '#800000',
        backgroundColor: '#fff1f2',
        borderStyle: 'solid'
    },
    iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', elevation: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    uploadPrompt: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    uploadSubPrompt: { fontSize: 12, color: '#64748b', marginTop: 4 },
    fileSelected: { alignItems: 'center', width: '100%', paddingHorizontal: 20 },
    fileName: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginTop: 10, textAlign: 'center' },
    fileSize: { fontSize: 12, color: '#64748b', marginTop: 2 },
    removeFile: { position: 'absolute', top: -10, right: 10, backgroundColor: '#fff', padding: 5, borderRadius: 15, elevation: 3 },
    form: { gap: 15 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: '#1e293b', fontWeight: '600', fontSize: 15 },
    chipScroll: { flexDirection: 'row', marginBottom: 5 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    activeChip: { backgroundColor: '#800000', borderColor: '#800000' },
    chipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    activeChipText: { color: '#fff' },
    row: { flexDirection: 'row' },
    uploadBtn: {
        backgroundColor: '#800000',
        height: 60,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 5,
        shadowColor: '#800000',
        shadowOpacity: 0.3,
        shadowRadius: 10
    },
    disabledBtn: { backgroundColor: '#cbd5e1', shadowOpacity: 0 },
    uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});

export default UploadNotes;
