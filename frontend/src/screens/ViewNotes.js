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
    Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Search,
    FileText,
    Download,
    Filter,
    BookOpen,
    User,
    Calendar,
    ExternalLink
} from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ViewNotes = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            // Apply student's default filters if possible
            const params = {};
            if (user?.role === 'Student') {
                params.department = user.department;
                params.year = user.year;
            }

            const res = await api.get('/notes/fetch', { params });
            setNotes(res.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
            Alert.alert('Error', 'Failed to load notes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDownload = (item) => {
        Linking.openURL(item.fileUrl).catch(err => {
            console.error('Error opening URL:', err);
            Alert.alert('Error', 'Could not open file URL');
        });
    };

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderNote = ({ item }) => (
        <View style={styles.noteCard}>
            <View style={styles.noteIcon}>
                <FileText size={24} color="#800000" />
            </View>
            <View style={styles.noteInfo}>
                <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.noteSubject} numberOfLines={1}>{item.subject}</Text>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <User size={10} color="#64748b" />
                        <Text style={styles.metaText}>{item.uploadedBy?.name || 'Faculty'}</Text>
                    </View>
                    <Text style={styles.dot}>•</Text>
                    <View style={styles.metaItem}>
                        <Calendar size={10} color="#64748b" />
                        <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => handleDownload(item)}
            >
                <Download size={20} color="#800000" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Study Materials</Text>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Filter size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Search size={18} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by title or subject..."
                        placeholderTextColor="#94a3b8"
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
                    data={filteredNotes}
                    renderItem={renderNote}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    onRefresh={fetchNotes}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <BookOpen size={64} color="#e2e8f0" />
                            <Text style={styles.emptyTitle}>No notes found</Text>
                            <Text style={styles.emptySub}>Looks like there aren't any notes for your criteria yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingHorizontal: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#1e293b' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20 },
    noteCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    noteIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#fff1f2', justifyContent: 'center', alignItems: 'center' },
    noteInfo: { flex: 1, marginLeft: 15 },
    noteTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
    noteSubject: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    metaItem: { flexDirection: 'row', alignItems: 'center' },
    metaText: { fontSize: 10, color: '#94a3b8', marginLeft: 4, fontWeight: '600' },
    dot: { marginHorizontal: 6, color: '#e2e8f0', fontSize: 10 },
    downloadBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
    emptyState: { alignItems: 'center', paddingVertical: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#94a3b8', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#cbd5e1', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }
});

export default ViewNotes;
