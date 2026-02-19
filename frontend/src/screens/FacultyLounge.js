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
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    MessageCircle,
    Heart,
    Share2,
    MoreHorizontal,
    Plus,
    X,
    Send,
    Filter,
    Paperclip,
    Image as ImageIcon,
    Smile,
    User
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const FacultyLounge = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);

    // New Post State
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostTitle, setNewPostTitle] = useState('');
    const [postCategory, setPostCategory] = useState('General');
    const [isPosting, setIsPosting] = useState(false);

    const categories = ['General', 'Resource', 'Discussion', 'Event', 'Job'];

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/faculty-lounge/posts');
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            Alert.alert('Error', 'Failed to load posts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await api.post(`/faculty-lounge/posts/${postId}/like`);
            // Update local state
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return { ...post, likes: res.data };
                }
                return post;
            }));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent || !newPostTitle) {
            Alert.alert('Empty Post', 'Please add a title and some content.');
            return;
        }

        setIsPosting(true);
        try {
            await api.post('/faculty-lounge/posts', {
                title: newPostTitle,
                content: newPostContent,
                category: postCategory
            });
            setNewPostContent('');
            setNewPostTitle('');
            setShowPostModal(false);
            fetchPosts();
            Alert.alert('Success', 'Posted to lounge!');
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    const renderPost = ({ item }) => {
        const isLiked = item.likes.includes(user?.id);

        return (
            <View style={styles.postCard}>
                <View style={styles.postHeader}>
                    <View style={styles.authorAvatar}>
                        {item.author?.photo ? (
                            <Image source={{ uri: item.author.photo }} style={styles.avatarImg} />
                        ) : (
                            <User size={20} color="#64748b" />
                        )}
                    </View>
                    <View style={styles.authorInfo}>
                        <Text style={styles.authorName}>{item.author?.name || 'Staff Member'}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.categoryTag}>{item.category}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.moreBtn}>
                        <MoreHorizontal size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                <View style={styles.postBody}>
                    <Text style={styles.postTitle}>{item.title}</Text>
                    <Text style={styles.postContent}>{item.content}</Text>
                    {item.attachments && item.attachments.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachRow}>
                            {item.attachments.map((file, idx) => (
                                <View key={idx} style={styles.fileChip}>
                                    <Paperclip size={12} color="#800000" />
                                    <Text style={styles.fileChipText} numberOfLines={1}>{file.name}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View style={styles.postFooter}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleLike(item._id)}
                    >
                        <Heart size={20} color={isLiked ? "#ef4444" : "#64748b"} fill={isLiked ? "#ef4444" : "transparent"} />
                        <Text style={[styles.actionText, isLiked && { color: '#ef4444' }]}>{item.likes.length}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <MessageCircle size={20} color="#64748b" />
                        <Text style={styles.actionText}>{item.comments.length}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <Share2 size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Faculty Lounge</Text>
                    <Text style={styles.headerSub}>Staff Community Feed</Text>
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchPosts} tintColor="#800000" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MessageCircle size={64} color="#e2e8f0" />
                            <Text style={styles.emptyTitle}>Nothing here yet</Text>
                            <Text style={styles.emptySub}>Be the first to share something with colleagues!</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowPostModal(true)}
            >
                <Plus size={30} color="#fff" />
            </TouchableOpacity>

            {/* Create Post Modal */}
            <Modal
                visible={showPostModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New Post</Text>
                            <TouchableOpacity onPress={() => setShowPostModal(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setPostCategory(cat)}
                                        style={[styles.catChip, postCategory === cat && styles.activeCatChip]}
                                    >
                                        <Text style={[styles.catText, postCategory === cat && styles.activeCatText]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.label}>Headline</Text>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="What's this about?"
                                value={newPostTitle}
                                onChangeText={setNewPostTitle}
                            />

                            <Text style={styles.label}>Details</Text>
                            <TextInput
                                style={styles.contentInput}
                                placeholder="Share resources, start a discussion..."
                                multiline
                                numberOfLines={6}
                                value={newPostContent}
                                onChangeText={setNewPostContent}
                                textAlignVertical="top"
                            />

                            <View style={styles.postTools}>
                                <TouchableOpacity style={styles.toolBtn}>
                                    <ImageIcon size={20} color="#64748b" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolBtn}>
                                    <Paperclip size={20} color="#64748b" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolBtn}>
                                    <Smile size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.publishBtn, isPosting && { opacity: 0.7 }]}
                            onPress={handleCreatePost}
                            disabled={isPosting}
                        >
                            {isPosting ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Text style={styles.publishText}>Publish Post</Text>
                                    <Send size={18} color="#fff" style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
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
    headerTitleContainer: { flex: 1, marginLeft: 15 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    filterBtn: { padding: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 15, paddingBottom: 100 },
    postCard: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    authorAvatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
    avatarImg: { width: '100%', height: '100%' },
    authorInfo: { flex: 1, marginLeft: 12 },
    authorName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    categoryTag: { fontSize: 11, fontWeight: '700', color: '#800000', backgroundColor: '#fff1f2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    dot: { marginHorizontal: 6, color: '#94a3b8' },
    timeText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    moreBtn: { padding: 5 },
    postBody: { marginBottom: 15 },
    postTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
    postContent: { fontSize: 14, color: '#475569', lineHeight: 22 },
    attachRow: { flexDirection: 'row', marginTop: 12 },
    fileChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 8 },
    fileChipText: { fontSize: 12, color: '#475569', marginLeft: 6, fontWeight: '600', maxWidth: 120 },
    postFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
    actionText: { marginLeft: 6, fontSize: 13, fontWeight: '600', color: '#64748b' },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#800000', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#800000', shadowOpacity: 0.4, shadowRadius: 10 },
    emptyState: { alignItems: 'center', paddingVertical: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#94a3b8', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#cbd5e1', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '80%', padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    modalForm: { flex: 1 },
    label: { fontSize: 14, fontWeight: '800', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    catScroll: { flexDirection: 'row', marginBottom: 20 },
    catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    activeCatChip: { backgroundColor: '#800000', borderColor: '#800000' },
    catText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    activeCatText: { color: '#fff' },
    titleInput: { backgroundColor: '#f8fafc', borderRadius: 15, paddingHorizontal: 15, height: 55, fontSize: 16, fontWeight: '700', color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
    contentInput: { backgroundColor: '#f8fafc', borderRadius: 15, paddingHorizontal: 15, paddingTop: 15, height: 150, fontSize: 15, color: '#475569', borderWidth: 1, borderColor: '#e2e8f0' },
    postTools: { flexDirection: 'row', paddingVertical: 15, gap: 15 },
    toolBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    publishBtn: { backgroundColor: '#800000', height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    publishText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});

export default FacultyLounge;
