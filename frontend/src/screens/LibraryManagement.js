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
    Image
} from 'react-native';
import { ArrowLeft, Search, Plus, Trash2, X, BookOpen, Library, Users, LogOut, RotateCcw, Calendar, CheckCircle, Edit2 } from 'lucide-react-native';
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

    const [activeTab, setActiveTab] = useState('books'); // 'books', 'issued', 'returned'
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [returnedBooks, setReturnedBooks] = useState([]);
    const [issueModalVisible, setIssueModalVisible] = useState(false);
    const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);

    const [studentIdToIssue, setStudentIdToIssue] = useState('');
    const [editId, setEditId] = useState(null);

    // Connection State
    const [isConnected, setIsConnected] = useState(true);

    // Student Search State
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);

    useEffect(() => {
        checkConnection();
        fetchStudents();
        if (activeTab === 'books') {
            fetchItems();
        } else if (activeTab === 'issued') {
            fetchIssuedBooks();
        } else if (activeTab === 'returned') {
            fetchReturnedBooks();
        }
    }, [activeTab]);

    const checkConnection = async () => {
        try {
            // Try to fetch users or any light endpoint
            await api.get('/admin/stats');
            setIsConnected(true);
        } catch (error) {
            console.error('Connection check failed:', error);
            setIsConnected(false);
            Alert.alert('Connection Error', 'Cannot reach the server. Please check if your phone is on the same Wi-Fi as your PC.');
        }
    };

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

    const fetchStudents = async () => {
        try {
            const response = await api.get('/admin/library/students');
            console.log('Fetched students:', response.data.length);
            setStudents(response.data);
            setFilteredStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to load students list';
            Alert.alert('Error loading students', errorMessage + '\n\n' + 'Check if backend is running.');
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

    const fetchReturnedBooks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/library/returned');
            setReturnedBooks(response.data);
        } catch (error) {
            console.error('Error fetching returned books:', error);
            Alert.alert('Error', 'Failed to fetch returned books');
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
                            console.log('Returning book with ID:', id);
                            await api.post(`/admin/library/return/${id}`);
                            await fetchIssuedBooks(); // Wait for fetch
                            Alert.alert('Success', 'Book returned successfully');
                        } catch (error) {
                            console.error('Error returning book:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to return book');
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

    const handleEdit = (item) => {
        setEditId(item._id);
        setNewItem({
            title: item.title,
            author: item.author,
            category: item.category,
            quantity: item.quantity.toString(),
            isbn: item.isbn || ''
        });
        setModalVisible(true);
    };

    const openAddModal = () => {
        setEditId(null);
        setNewItem({
            title: '',
            author: '',
            category: '',
            quantity: '1',
            isbn: ''
        });
        setModalVisible(true);
    };

    const handleAddItem = async () => {
        if (!newItem.title || !newItem.author || !newItem.category) {
            Alert.alert('Error', 'Please fill in required fields (Title, Author, Category)');
            return;
        }

        try {
            if (editId) {
                await api.put(`/admin/library/${editId}`, newItem);
                Alert.alert('Success', 'Item updated successfully');
            } else {
                await api.post('/admin/library', newItem);
                Alert.alert('Success', 'Item added successfully');
            }

            setModalVisible(false);
            fetchItems();
            setNewItem({
                title: '',
                author: '',
                category: '',
                quantity: '1',
                isbn: ''
            });
            setEditId(null);
        } catch (error) {
            console.error('Error adding/updating item:', error);
            Alert.alert('Error', `Failed to ${editId ? 'update' : 'add'} item`);
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
                <View style={[styles.iconContainer, { backgroundColor: '#fff1f2' }]}>
                    <BookOpen size={24} color="#800000" />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.author} • {item.category}</Text>
                    <Text style={styles.itemMeta}>Qty: {item.quantity} {item.isbn ? `• ISBN: ${item.isbn}` : ''}</Text>
                </View>
                <View style={styles.actionButtons}>
                    {item.quantity > 0 && (
                        <TouchableOpacity onPress={() => openIssueModal(item)} style={[styles.actionButton, { backgroundColor: '#fee2e2', marginRight: 8 }]}>
                            <CheckCircle size={20} color="#dc2626" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.actionButton, { backgroundColor: '#f0f9ff' }]}>
                        <Edit2 size={20} color="#0284c7" />
                    </TouchableOpacity>
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
                <View style={[styles.iconContainer, { backgroundColor: '#fff1f2' }]}>
                    <Users size={24} color="#800000" />
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

    const renderReturnedItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
                    <BookOpen size={24} color="#166534" />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.bookTitle}</Text>
                    <Text style={styles.itemSubtitle}>Returned by: {item.studentName}</Text>
                    <Text style={[styles.itemMeta, { color: '#16a34a' }]}>
                        Returned on: {new Date(item.returnDate).toLocaleDateString()}
                    </Text>
                </View>
                <View style={[styles.actionButton, { backgroundColor: '#dcfce7' }]}>
                    <CheckCircle size={20} color="#22c55e" />
                </View>
            </View>
        </View>
    );

    const getFilteredData = () => {
        const query = searchQuery.toLowerCase();
        if (activeTab === 'books') {
            return items.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.author.toLowerCase().includes(query)
            );
        } else if (activeTab === 'issued') {
            return issuedBooks.filter(item =>
                item.bookTitle.toLowerCase().includes(query) ||
                item.studentName.toLowerCase().includes(query) ||
                item.studentId.includes(query)
            );
        } else {
            return returnedBooks.filter(item =>
                item.bookTitle.toLowerCase().includes(query) ||
                item.studentName.toLowerCase().includes(query) ||
                item.studentId.includes(query)
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    {currentUser?.role === 'Admin' ? (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <ArrowLeft size={24} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={{
                                width: 50,
                                height: 50,
                                marginRight: 12,
                                borderRadius: 25,
                                borderWidth: 2,
                                borderColor: '#fff',
                                resizeMode: 'cover'
                            }}
                        />
                        <Text style={styles.headerTitle}>Library Portal</Text>
                    </View>
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

            {!isConnected && (
                <View style={{ backgroundColor: '#ef4444', padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Offline - Server Unreachable</Text>
                </View>
            )}

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
                    <Text style={[styles.tabText, activeTab === 'issued' && styles.activeTabText]}>Issued</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'returned' && styles.activeTab]}
                    onPress={() => setActiveTab('returned')}
                >
                    <Text style={[styles.tabText, activeTab === 'returned' && styles.activeTabText]}>Returned</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <Search size={20} color="#94a3b8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={
                            activeTab === 'books' ? "Search books, authors..." :
                                activeTab === 'issued' ? "Search issued books, students..." :
                                    "Search returned books..."
                        }
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            ) : (
                <FlatList
                    data={getFilteredData()}
                    renderItem={
                        activeTab === 'books' ? renderItem :
                            activeTab === 'issued' ? renderIssuedItem :
                                renderReturnedItem
                    }
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
                    onPress={openAddModal}
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
                            <Text style={styles.modalTitle}>{editId ? 'Edit Item' : 'Add New Item'}</Text>
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
                                    <Text style={styles.submitButtonText}>{editId ? 'Update Item' : 'Add Item'}</Text>
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



                        <View style={[styles.inputGroup, { marginTop: 20, zIndex: 5000, elevation: 5000 }]}>
                            <Text style={styles.label}>Select Student *</Text>
                            <View style={styles.autocompleteContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={studentSearchQuery}
                                    onChangeText={(text) => {
                                        setStudentSearchQuery(text);
                                        setShowStudentDropdown(true);
                                        setStudentIdToIssue(''); // Reset ID on type
                                        const query = text.toLowerCase();
                                        setFilteredStudents(
                                            students.filter(s =>
                                                s.name.toLowerCase().includes(query) ||
                                                s.userId.toLowerCase().includes(query)
                                            )
                                        );
                                    }}
                                    onFocus={() => setShowStudentDropdown(true)}
                                    placeholder="Search Student by Name or ID"
                                    autoCapitalize="none"
                                />
                                {showStudentDropdown && (
                                    <View style={styles.dropdownList}>
                                        <FlatList
                                            data={filteredStudents}
                                            keyExtractor={item => item.userId}
                                            nestedScrollEnabled={true}
                                            style={{ maxHeight: 200 }}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setStudentIdToIssue(item.userId);
                                                        setStudentSearchQuery(`${item.name} (${item.userId})`);
                                                        setShowStudentDropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                                                    <Text style={styles.dropdownItemSubText}>{item.userId} • {item.department}</Text>
                                                </TouchableOpacity>
                                            )}
                                            ListEmptyComponent={
                                                <View style={{ padding: 12 }}>
                                                    <Text style={{ color: '#94a3b8' }}>No students found</Text>
                                                </View>
                                            }
                                        />
                                    </View>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, { opacity: studentIdToIssue ? 1 : 0.6 }]}
                            onPress={handleIssueBook}
                            disabled={!studentIdToIssue}
                        >
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
        backgroundColor: '#ffffff',
    },
    header: {
        backgroundColor: '#800000',
        paddingTop: (Platform?.OS === 'android') ? 40 : 20,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 8,
        shadowColor: '#800000',
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
        backgroundColor: '#fff1f2',
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
        borderBottomColor: '#800000',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94a3b8',
    },
    activeTabText: {
        color: '#800000',
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
        backgroundColor: '#800000',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#800000',
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
        backgroundColor: '#800000',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        elevation: 4,
        shadowColor: '#800000',
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
    autocompleteContainer: {
        position: 'relative',
        zIndex: 1000,
    },
    dropdownList: {
        position: 'absolute',
        bottom: 65, // Render ABOVE the input
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 5001,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 }, // Shadow upwards
        shadowOpacity: 0.3,
        shadowRadius: 12,
        maxHeight: 200,
        zIndex: 6000,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    dropdownItemSubText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
});

export default LibraryManagement;
