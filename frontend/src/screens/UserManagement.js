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
    Image,
    SafeAreaView,
    StatusBar,
    Platform,
    ScrollView
} from 'react-native';
import { ArrowLeft, Search, Plus, Trash2, X, ChevronRight, UserPlus, Camera, Image as ImageIcon, Edit2, Save } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';

const EditItem = ({ label, value, onChange }) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <TextInput
            style={styles.editInput}
            value={value}
            onChangeText={onChange}
            placeholder={`Enter ${label}`}
        />
    </View>
);

const DetailItem = ({ label, value }) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const UserManagement = ({ navigation, route }) => {
    const roleFilter = route?.params?.roleFilter;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [newUser, setNewUser] = useState({
        userId: '',
        password: '',
        name: '',
        email: '',
        role: roleFilter || 'Student',
        department: '',
        contact: '',
        photo: null,
        dob: '',
        mobileNo: '',
        branch: '',
        year: '',
        // New Fields
        residencyType: 'Day Scholar',
        parentContact: '',
        community: '',
        address: '',
        bloodGroup: '',
        admissionType: 'Counselling'
    });

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            let filteredUsers = response.data;
            if (roleFilter) {
                filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
            }
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.userId || !newUser.password || !newUser.name || !newUser.email || !newUser.role) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            let userData = { ...newUser };

            // If there's a photo, upload it first
            if (newUser.photo && (newUser.photo.startsWith('file://') || newUser.photo.startsWith('content://'))) {
                const formData = new FormData();
                const filename = newUser.photo.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('photo', {
                    uri: newUser.photo,
                    name: filename,
                    type
                });

                const uploadRes = await api.post('/admin/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                userData.photo = uploadRes.data.url;
            }

            await api.post('/admin/users', userData);
            Alert.alert('Success', 'User created successfully');
            setModalVisible(false);
            fetchUsers();
            setNewUser({
                userId: '',
                password: '',
                name: '',
                email: '',
                role: roleFilter || 'Student',
                department: '',
                contact: '',
                photo: null,
                dob: '',
                mobileNo: '',
                branch: '',
                year: '',
                residencyType: 'Day Scholar',
                parentContact: '',
                community: '',
                address: '',
                bloodGroup: '',
                admissionType: 'Counselling'
            });
        } catch (error) {
            console.error('Error creating user:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/users/${id}`);
                            fetchUsers();
                        } catch (error) {
                            console.error('Error deleting user:', error);
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    }
                }
            ]
        );
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setNewUser({ ...newUser, photo: result.assets[0].uri });
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setEditFormData(user);
        setIsEditing(false);
        setDetailModalVisible(true);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setEditFormData(selectedUser);
        }
    };

    const handleUpdateUser = async () => {
        try {
            const response = await api.put(`/admin/users/${selectedUser._id}`, editFormData);
            Alert.alert('Success', 'User updated successfully');
            setIsEditing(false);
            setSelectedUser(response.data);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update user');
        }
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleUserClick(item)} activeOpacity={0.7}>
            <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    {item.photo ? (
                        <Image source={{ uri: item.photo }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{item.name}</Text>
                        <View style={[styles.roleBadgeSmall, { backgroundColor: item.role === 'Student' ? '#ffe4e6' : '#f0fdf4' }]}>
                            <Text style={[styles.roleBadgeTextSmall, { color: item.role === 'Student' ? '#800000' : '#10b981' }]}>{item.role}</Text>
                        </View>
                    </View>
                    <Text style={styles.userIdText}>ID: {item.userId}</Text>
                    {item.department && (
                        <Text style={styles.userDeptText}>{item.department}</Text>
                    )}
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteUser(item._id)} style={styles.deleteButton}>
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{roleFilter ? `${roleFilter} Management` : 'User Management'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color="#94a3b8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or ID..."
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
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No users found</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.9}
            >
                <Plus size={24} color="#fff" />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={detailModalVisible}
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '70%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{isEditing ? 'Edit Details' : 'User Details'}</Text>
                            <View style={styles.headerActions}>
                                {!isEditing && (
                                    <TouchableOpacity onPress={handleEditToggle} style={styles.editButton}>
                                        <Edit2 size={20} color="#800000" />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => { setDetailModalVisible(false); setIsEditing(false); }}>
                                    <X size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {selectedUser && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.detailHeader}>
                                    <View style={styles.detailAvatarContainer}>
                                        {selectedUser.photo ? (
                                            <Image source={{ uri: selectedUser.photo }} style={styles.detailAvatar} />
                                        ) : (
                                            <View style={[styles.detailAvatar, styles.avatarPlaceholder]}>
                                                <Text style={styles.detailAvatarText}>{selectedUser.name.charAt(0).toUpperCase()}</Text>
                                            </View>
                                        )}
                                    </View>
                                    {isEditing ? (
                                        <TextInput
                                            style={[styles.input, { textAlign: 'center', width: '80%', fontSize: 20, fontWeight: '700' }]}
                                            value={editFormData.name}
                                            onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                                            placeholder="Name"
                                        />
                                    ) : (
                                        <Text style={styles.detailName}>{selectedUser.name}</Text>
                                    )}
                                    <View style={styles.roleBadge}>
                                        <Text style={styles.roleBadgeText}>{selectedUser.role}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    {isEditing ? (
                                        <>
                                            <EditItem label="User ID" value={editFormData.userId} onChange={(text) => setEditFormData({ ...editFormData, userId: text })} />
                                            <EditItem label="Email" value={editFormData.email} onChange={(text) => setEditFormData({ ...editFormData, email: text })} />
                                            <EditItem label="Department" value={editFormData.department} onChange={(text) => setEditFormData({ ...editFormData, department: text })} />
                                            <EditItem label="Mobile No" value={editFormData.mobileNo} onChange={(text) => setEditFormData({ ...editFormData, mobileNo: text })} />
                                            <EditItem label="DOB" value={editFormData.dob} onChange={(text) => setEditFormData({ ...editFormData, dob: text })} />
                                            {selectedUser.role === 'Student' && (
                                                <>
                                                    <EditItem label="Branch" value={editFormData.branch} onChange={(text) => setEditFormData({ ...editFormData, branch: text })} />
                                                    <EditItem label="Year" value={editFormData.year} onChange={(text) => setEditFormData({ ...editFormData, year: text })} />
                                                </>
                                            )}
                                            <EditItem label="Contact" value={editFormData.contact} onChange={(text) => setEditFormData({ ...editFormData, contact: text })} />

                                            <View style={styles.editActions}>
                                                <TouchableOpacity style={[styles.submitButton, { flex: 1, marginRight: 10, backgroundColor: '#64748b' }]} onPress={() => setIsEditing(false)}>
                                                    <Text style={styles.submitButtonText}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.submitButton, { flex: 1 }]} onPress={handleUpdateUser}>
                                                    <Text style={styles.submitButtonText}>Save Changes</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    ) : (
                                        <>
                                            <DetailItem label="User ID" value={selectedUser.userId} />
                                            <DetailItem label="Email" value={selectedUser.email} />
                                            <DetailItem label="Department" value={selectedUser.department || 'Not specified'} />
                                            <DetailItem label="Mobile No" value={selectedUser.mobileNo || 'Not specified'} />
                                            <DetailItem label="DOB" value={selectedUser.dob || 'Not specified'} />
                                            {selectedUser.role === 'Student' && (
                                                <>
                                                    <DetailItem label="Branch" value={selectedUser.branch || 'Not specified'} />
                                                    <DetailItem label="Year" value={selectedUser.year || 'Not specified'} />
                                                </>
                                            )}
                                            <DetailItem label="Contact" value={selectedUser.contact || 'Not specified'} />
                                        </>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New {roleFilter || 'User'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
                            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                                {newUser.photo ? (
                                    <Image source={{ uri: newUser.photo }} style={styles.uploadedImage} />
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <Camera size={32} color="#94a3b8" />
                                        <Text style={styles.uploadText}>Upload Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>User ID *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newUser.userId}
                                    onChangeText={(text) => setNewUser({ ...newUser, userId: text })}
                                    placeholder="Enter User ID"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newUser.name}
                                    onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                                    placeholder="Enter Full Name"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newUser.email}
                                    onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                                    placeholder="Enter Email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newUser.password}
                                    onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                                    placeholder="Enter Password"
                                    secureTextEntry
                                />
                            </View>

                            {!roleFilter && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Role *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newUser.role}
                                        onChangeText={(text) => setNewUser({ ...newUser, role: text })}
                                        placeholder="Student, Staff, HOD, etc."
                                    />
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Department</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newUser.department}
                                    onChangeText={(text) => setNewUser({ ...newUser, department: text })}
                                    placeholder="e.g. CSE, ECE"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newUser.mobileNo}
                                    onChangeText={(text) => setNewUser({ ...newUser, mobileNo: text })}
                                    placeholder="Student Mobile Number"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {newUser.role === 'Student' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Parent Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newUser.parentContact}
                                        onChangeText={(text) => setNewUser({ ...newUser, parentContact: text })}
                                        placeholder="Parent Mobile Number"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Date of Birth</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newUser.dob}
                                    onChangeText={(text) => setNewUser({ ...newUser, dob: text })}
                                    placeholder="DD/MM/YYYY"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Address</Text>
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    value={newUser.address}
                                    onChangeText={(text) => setNewUser({ ...newUser, address: text })}
                                    placeholder="Enter Permanent Address"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Community</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newUser.community}
                                        onChangeText={(text) => setNewUser({ ...newUser, community: text })}
                                        placeholder="e.g. BC, MBC"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Blood Group</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newUser.bloodGroup}
                                        onChangeText={(text) => setNewUser({ ...newUser, bloodGroup: text })}
                                        placeholder="e.g. O+"
                                    />
                                </View>
                            </View>

                            {newUser.role === 'Student' && (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Residency Type</Text>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            {['Day Scholar', 'Hosteller'].map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    style={[
                                                        styles.selectionButton,
                                                        newUser.residencyType === type && styles.selectionButtonActive
                                                    ]}
                                                    onPress={() => setNewUser({ ...newUser, residencyType: type })}
                                                >
                                                    <Text style={[
                                                        styles.selectionButtonText,
                                                        newUser.residencyType === type && styles.selectionButtonTextActive
                                                    ]}>{type}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Admission Type</Text>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            {['Counselling', 'Management'].map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    style={[
                                                        styles.selectionButton,
                                                        newUser.admissionType === type && styles.selectionButtonActive
                                                    ]}
                                                    onPress={() => setNewUser({ ...newUser, admissionType: type })}
                                                >
                                                    <Text style={[
                                                        styles.selectionButtonText,
                                                        newUser.admissionType === type && styles.selectionButtonTextActive
                                                    ]}>{type}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}

                            <TouchableOpacity style={styles.submitButton} onPress={handleAddUser}>
                                <Text style={styles.submitButtonText}>Create User</Text>
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
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#800000',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        color: '#94a3b8',
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    roleBadgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    roleBadgeTextSmall: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    userIdText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 2,
    },
    userDeptText: {
        fontSize: 13,
        color: '#800000',
        fontWeight: '600',
        marginBottom: 2,
    },
    deleteButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#fee2e2',
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
        height: '85%',
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
    formScrollView: {
        flex: 1,
    },
    imageUpload: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f1f5f9',
        alignSelf: 'center',
        marginBottom: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadText: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 8,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 20,
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
    detailHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    detailAvatarContainer: {
        marginBottom: 16,
    },
    detailAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    detailAvatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: '#800000',
    },
    detailName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: '#ffe4e6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleBadgeText: {
        color: '#800000',
        fontWeight: '700',
        fontSize: 12,
    },
    detailSection: {
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        padding: 20,
    },
    detailItem: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 12,
    },
    detailLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        marginRight: 16,
        padding: 8,
        backgroundColor: '#ffe4e6',
        borderRadius: 12,
    },
    editInput: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '700',
        paddingVertical: 4,
    },
    editActions: {
        flexDirection: 'row',
        marginTop: 20,
    },
    selectionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    selectionButtonActive: {
        backgroundColor: '#ffe4e6',
        borderColor: '#800000',
    },
    selectionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    selectionButtonTextActive: {
        color: '#800000',
    },
});

export default UserManagement;
