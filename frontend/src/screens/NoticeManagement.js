import React, { useState, useEffect, useContext } from 'react';
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
    Image,
    Dimensions,
    RefreshControl
} from 'react-native';
import {
    Megaphone,
    Plus,
    X,
    FileText,
    Image as ImageIcon,
    File as FileIcon,
    ChevronLeft,
    Send,
    Trash2,
    CheckCircle2,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    User,
    Download,
    Eye
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { college } from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const NoticeManagement = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [filteredNotices, setFilteredNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetRoles, setTargetRoles] = useState(['All']);
    const [attachment, setAttachment] = useState(null);

    const roles = ['All', 'Student', 'Staff', 'HOD', 'Transport', 'Library', 'Hostel', 'Placement', 'Sports', 'Office', 'ExamCell'];

    useEffect(() => {
        fetchNotices();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredNotices(notices);
        } else {
            const filtered = notices.filter(notice =>
                notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notice.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredNotices(filtered);
        }
    }, [searchQuery, notices]);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await college.getAnnouncements();
            setNotices(response.data);
            setFilteredNotices(response.data);
        } catch (error) {
            console.error('Fetch notices error:', error);
            Alert.alert('Error', 'Failed to fetch notices');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotices();
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            });

            if (!result.canceled) {
                setAttachment(result.assets[0]);
            }
        } catch (err) {
            console.error('Pick document error:', err);
        }
    };

    const toggleRole = (role) => {
        if (role === 'All') {
            setTargetRoles(['All']);
        } else {
            let newRoles = [...targetRoles].filter(r => r !== 'All');
            if (newRoles.includes(role)) {
                newRoles = newRoles.filter(r => r !== role);
                if (newRoles.length === 0) newRoles = ['All'];
            } else {
                newRoles.push(role);
            }
            setTargetRoles(newRoles);
        }
    };

    const handleSubmit = async () => {
        if (!title || !content) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('targetRoles', JSON.stringify(targetRoles));

            if (attachment) {
                formData.append('attachment', {
                    uri: attachment.uri,
                    name: attachment.name,
                    type: attachment.mimeType || 'application/octet-stream',
                });
            }

            await college.createAnnouncement(formData);
            Alert.alert('Success', 'Notice posted successfully');
            setModalVisible(false);
            resetForm();
            fetchNotices();
        } catch (error) {
            console.error('Post notice error:', error);
            Alert.alert('Error', 'Failed to post notice');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Notice',
            'Are you sure you want to delete this notice?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await college.deleteAnnouncement(id);
                            fetchNotices();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete notice');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setTargetRoles(['All']);
        setAttachment(null);
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'image': return <ImageIcon size={20} color="#4361ee" />;
            case 'pdf': return <FileText size={20} color="#ef4444" />;
            case 'document': return <FileIcon size={20} color="#10b981" />;
            default: return <FileIcon size={20} color="#64748b" />;
        }
    };

    const renderNoticeCard = (notice) => (
        <View key={notice._id} style={styles.noticeCard}>
            <View style={styles.cardHeader}>
                <View style={styles.roleBadges}>
                    {notice.targetRoles.map(role => (
                        <View key={role} style={[styles.roleBadge, { backgroundColor: role === 'All' ? '#eef2ff' : '#f0fdf4' }]}>
                            <Text style={[styles.roleBadgeText, { color: role === 'All' ? '#4361ee' : '#10b981' }]}>{role}</Text>
                        </View>
                    ))}
                </View>
                {(user?.role === 'Admin' || user?.id === notice.createdBy?._id || (user?.role === 'Office' && notice.createdBy?._id === user?.id)) && (
                    <TouchableOpacity onPress={() => handleDelete(notice._id)} style={styles.deleteButton}>
                        <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.noticeContent}>{notice.content}</Text>

            {notice.attachmentUrl && (
                <View style={styles.attachmentSection}>
                    {notice.attachmentType === 'image' ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: notice.attachmentUrl }} style={styles.imagePreview} resizeMode="cover" />
                            <TouchableOpacity style={styles.viewOverlay}>
                                <Eye size={20} color="#fff" />
                                <Text style={styles.viewText}>View Image</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.fileAttachment}>
                            <View style={styles.fileIconWrapper}>
                                {getIconForType(notice.attachmentType)}
                            </View>
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {notice.attachmentType.toUpperCase()} Document
                                </Text>
                                <Text style={styles.fileSize}>Click to download</Text>
                            </View>
                            <Download size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <User size={14} color="#94a3b8" />
                    <Text style={styles.footerText}>{notice.createdBy?.name || 'Admin'}</Text>
                </View>
                <View style={styles.footerItem}>
                    <Calendar size={14} color="#94a3b8" />
                    <Text style={styles.footerText}>
                        {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                </View>
            </View>
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
                    <Text style={styles.headerTitle}>Notice Board</Text>
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
                        placeholder="Search notices..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4361ee" />
                    <Text style={styles.loadingText}>Fetching latest updates...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4361ee" />
                    }
                >
                    {filteredNotices.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconWrapper}>
                                <Megaphone size={48} color="#cbd5e1" />
                            </View>
                            <Text style={styles.emptyTitle}>No Notices Found</Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery ? "We couldn't find any notices matching your search." : "There are no announcements posted yet."}
                            </Text>
                        </View>
                    ) : (
                        filteredNotices.map(renderNoticeCard)
                    )}
                </ScrollView>
            )}

            {/* Post Notice Modal */}
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
                                <Text style={styles.modalTitle}>Create Notice</Text>
                                <Text style={styles.modalSubtitle}>Share important updates</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Notice Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Semester Exam Schedule"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Content Details</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Write the announcement details here..."
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    numberOfLines={6}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Target Audience</Text>
                                <View style={styles.roleSelector}>
                                    {roles.map(role => (
                                        <TouchableOpacity
                                            key={role}
                                            style={[
                                                styles.roleOption,
                                                targetRoles.includes(role) && styles.roleOptionActive
                                            ]}
                                            onPress={() => toggleRole(role)}
                                        >
                                            <Text style={[
                                                styles.roleOptionText,
                                                targetRoles.includes(role) && styles.roleOptionTextActive
                                            ]}>{role}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Attachments</Text>
                                <TouchableOpacity
                                    style={[styles.filePicker, attachment && styles.filePickerActive]}
                                    onPress={handlePickDocument}
                                >
                                    {attachment ? (
                                        <View style={styles.selectedFile}>
                                            <View style={styles.successIconWrapper}>
                                                <CheckCircle2 size={16} color="#fff" />
                                            </View>
                                            <Text style={styles.fileName} numberOfLines={1}>{attachment.name}</Text>
                                            <TouchableOpacity onPress={() => setAttachment(null)} style={styles.removeFile}>
                                                <X size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.pickerPlaceholder}>
                                            <View style={styles.plusIconWrapper}>
                                                <Plus size={18} color="#4361ee" />
                                            </View>
                                            <Text style={styles.pickerText}>Add Image, PDF, or Document</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
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
                                        <Text style={styles.submitButtonText}>Publish Notice</Text>
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
        letterSpacing: 0.5,
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
        fontWeight: '500',
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#64748b', fontWeight: '500' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    noticeCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    roleBadges: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 8,
        marginBottom: 6
    },
    roleBadgeText: { fontSize: 12, fontWeight: '700' },
    deleteButton: {
        padding: 8,
        backgroundColor: '#fff1f2',
        borderRadius: 10,
    },
    noticeTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 10,
        lineHeight: 26
    },
    noticeContent: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 20
    },
    attachmentSection: {
        marginBottom: 20,
    },
    imagePreviewContainer: {
        width: '100%',
        height: 200,
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    viewOverlay: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    viewText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 6 },
    fileAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    fileIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        elevation: 1,
    },
    fileInfo: { flex: 1 },
    fileName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    fileSize: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 15,
    },
    footerItem: { flexDirection: 'row', alignItems: 'center' },
    footerText: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginLeft: 6 },

    // Empty State
    emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
    emptySubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 },

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
        maxHeight: '92%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25
    },
    modalTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    modalSubtitle: { fontSize: 14, color: '#64748b', fontWeight: '500', marginTop: 2 },
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
    textArea: { height: 120, textAlignVertical: 'top' },
    roleSelector: { flexDirection: 'row', flexWrap: 'wrap' },
    roleOption: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    roleOptionActive: {
        backgroundColor: '#eef2ff',
        borderColor: '#4361ee'
    },
    roleOptionText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    roleOptionTextActive: { color: '#4361ee' },
    filePicker: {
        backgroundColor: '#f8fafc',
        borderRadius: 15,
        padding: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center'
    },
    filePickerActive: {
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4',
        borderStyle: 'solid'
    },
    pickerPlaceholder: { alignItems: 'center' },
    plusIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    pickerText: { fontSize: 14, color: '#4361ee', fontWeight: '700' },
    selectedFile: { flexDirection: 'row', alignItems: 'center', width: '100%' },
    successIconWrapper: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    fileName: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '700' },
    removeFile: { padding: 5 },
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

export default NoticeManagement;
