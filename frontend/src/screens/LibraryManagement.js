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
    ScrollView
} from 'react-native';
import { ArrowLeft, Search, Plus, Trash2, X, BookOpen, Library, Users, LogOut, RotateCcw, Calendar, CheckCircle } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const LibraryManagement = ({ navigation }) => {
    const { user: currentUser, logout } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newItem, setNewItem] = useState({
        title: '',
        author: '',
        category: '',
        quantity: '1',
        isbn: ''
    });

    const [activeTab, setActiveTab] = useState('books'); // 'books' or 'issued'
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [issueModalVisible, setIssueModalVisible] = useState(false);
    const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
    const [studentIdToIssue, setStudentIdToIssue] = useState('');

    useEffect(() => {
        if (activeTab === 'books') {
            fetchItems();
        } else {
            fetchIssuedBooks();
        }
    }, [activeTab]);

    const fetchItems = async () => {
        try {
            const response = await api.get('/admin/library');
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching library items:', error);
            Alert.alert('Error', 'Failed to fetch library items');
        } finally {
            setLoading(false);
        }
    };

    const fetchIssuedBooks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/library/issued');
            setIssuedBooks(response.data);
        } catch (error) {
            console.error('Error fetching issued books:', error);
            Alert.alert('Error', 'Failed to fetch issued books');
        } finally {
            setLoading(false);
        }
    };

    const handleIssueBook = async () => {
        if (!studentIdToIssue) {
            Alert.alert('Error', 'Please enter Student ID');
            return;
        }

        try {
            await api.post('/admin/library/issue', {
                bookId: selectedBookForIssue._id,
                studentId: studentIdToIssue
            });
            Alert.alert('Success', 'Book issued successfully');
            setIssueModalVisible(false);
            setStudentIdToIssue('');
            setSelectedBookForIssue(null);
            fetchItems(); // Refresh books to update quantity
        } catch (error) {
            console.error('Error issuing book:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to issue book');
        }
    };

    const handleReturnBook = async (id) => {
        Alert.alert(
            'Confirm Return',
            'Mark this book as returned?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await api.post(`/admin/library/return/${id}`);
                            fetchIssuedBooks();
                            Alert.alert('Success', 'Book returned successfully');
                        } catch (error) {
                            console.error('Error returning book:', error);
                            Alert.alert('Error', 'Failed to return book');
                        }
                    }
                }
            ]
        );
    };

    const openIssueModal = (item) => {
        setSelectedBookForIssue(item);
        setIssueModalVisible(true);
    };

    const handleAddItem = async () => {
        if (!newItem.title || !newItem.author || !newItem.category) {
            Alert.alert('Error', 'Please fill in required fields (Title, Author, Category)');
            return;
        }

        try {
            await api.post('/admin/library', newItem);
            Alert.alert('Success', 'Item added successfully');
            setModalVisible(false);
            fetchItems();
            setNewItem({
                title: '',
                author: '',
                category: '',
                quantity: '1',
                isbn: ''
            });
        } catch (error) {
            console.error('Error adding item:', error);
            Alert.alert('Error', 'Failed to add item');
        }
    };

    const handleDeleteItem = async (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/library/${id}`);
                            fetchItems();
                        } catch (error) {
                            console.error('Error deleting item:', error);
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <BookOpen size={24} color="#4361ee" />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.author} • {item.category}</Text>
                    <Text style={styles.itemMeta}>Qty: {item.quantity} {item.isbn ? `• ISBN: ${item.isbn}` : ''}</Text>
                </View>
                <View style={styles.actionButtons}>
                    {item.quantity > 0 && (
                        <TouchableOpacity onPress={() => openIssueModal(item)} style={[styles.actionButton, { backgroundColor: '#e0f2fe', marginRight: 8 }]}>
                            <CheckCircle size={20} color="#0ea5e9" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteItem(item._id)} style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}>
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderIssuedItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#fff7ed' }]}>
                    <Users size={24} color="#f97316" />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.bookTitle}</Text>
                    <Text style={styles.itemSubtitle}>Student: {item.studentName} ({item.studentId})</Text>
                    <Text style={styles.itemMeta}>
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => handleReturnBook(item._id)} style={[styles.actionButton, { backgroundColor: '#dcfce7' }]}>
                    <RotateCcw size={20} color="#22c55e" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4361ee" />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    {currentUser?.role === 'Admin' ? (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ArrowLeft size={24} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                    <Text style={styles.headerTitle}>Library Portal</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {currentUser?.role === 'Admin' && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('UserManagement', { roleFilter: 'Library' })}
                                style={[styles.backButton, { marginRight: 10 }]}
                            >
                                <Users size={22} color="#fff" />
                            </TouchableOpacity>
                        )}
                        {currentUser?.role === 'Library' && (
                            <TouchableOpacity
                                onPress={logout}
                                style={[styles.backButton, { marginRight: 10 }]}
                            >
                                <LogOut size={22} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'books' && styles.activeTab]}
                    onPress={() => setActiveTab('books')}
                >
                    <Text style={[styles.tabText, activeTab === 'books' && styles.activeTabText]}>All Books</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'issued' && styles.activeTab]}
                    onPress={() => setActiveTab('issued')}
                >
                    <Text style={[styles.tabText, activeTab === 'issued' && styles.activeTabText]}>Issued Books</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'books' && (
                <View style={styles.searchWrapper}>
                    <View style={styles.searchContainer}>
                        <Search size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search books, authors..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4361ee" />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'books' ? filteredItems : issuedBooks}
                    renderItem={activeTab === 'books' ? renderItem : renderIssuedItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No items found</Text>
                        </View>
                    }
                />
            )}

            {activeTab === 'books' && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.9}
                >
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
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
                            <Text style={styles.modalTitle}>Add New Item</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Title *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newItem.title}
                                        onChangeText={(text) => setNewItem({ ...newItem, title: text })}
                                        placeholder="Enter Book Title"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Author *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newItem.author}
                                        onChangeText={(text) => setNewItem({ ...newItem, author: text })}
                                        placeholder="Enter Author Name"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Category *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newItem.category}
                                        onChangeText={(text) => setNewItem({ ...newItem, category: text })}
                                        placeholder="e.g. Science, Fiction"
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                        <Text style={styles.label}>Quantity</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={newItem.quantity}
                                            onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
                                            placeholder="1"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>ISBN</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={newItem.isbn}
                                            onChangeText={(text) => setNewItem({ ...newItem, isbn: text })}
                                            placeholder="ISBN / Unique Book No"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.submitButton} onPress={handleAddItem}>
                                    <Text style={styles.submitButtonText}>Add Item</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={issueModalVisible}
                onRequestClose={() => setIssueModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Issue Book</Text>
                            <TouchableOpacity onPress={() => setIssueModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.bookTitlePreview}>
                            {selectedBookForIssue?.title}
                        </Text>
                        <Text style={styles.bookAuthorPreview}>
                            by {selectedBookForIssue?.author}
                        </Text>

                        <View style={[styles.inputGroup, { marginTop: 20 }]}>
                            <Text style={styles.label}>Student ID *</Text>
                            <TextInput
                                style={styles.input}
                                value={studentIdToIssue}
                                onChangeText={setStudentIdToIssue}
                                placeholder="Enter Student ID"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleIssueBook}>
                            <Text style={styles.submitButtonText}>Confirm Issue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#4361ee',
        paddingTop: (Platform?.OS === 'android') ? 40 : 20,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 8,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 2,
    },
    itemMeta: {
        fontSize: 12,
        color: '#94a3b8',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#fee2e2',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 8,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
        marginTop: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#4361ee',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94a3b8',
    },
    activeTabText: {
        color: '#4361ee',
    },
    searchWrapper: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    bookTitlePreview: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    bookAuthorPreview: {
        fontSize: 14,
        color: '#64748b',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4361ee',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
    },
    form: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    submitButton: {
        backgroundColor: '#4361ee',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        elevation: 4,
        shadowColor: '#4361ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
    },
});

export default LibraryManagement;
