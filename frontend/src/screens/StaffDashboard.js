import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Platform, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { LogOut, Users, FileText, CheckSquare, Bell, Calendar, Megaphone, GraduationCap, Eye, X, ImageIcon, Award } from 'lucide-react-native';
import { Modal } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

const StaffDashboard = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewImageModal, setViewImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/college/announcements');
            // Show only latest 3
            setAnnouncements(res.data.slice(0, 3));
        } catch (error) {
            console.error('Error fetching announcements', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { id: '1', title: 'Classes Today', value: '04', icon: <Calendar size={22} color="#fff" />, colors: ['#800000', '#a52a2a'], sub: 'Next: 10:00 AM' },
        { id: '2', title: 'Students', value: '120+', icon: <Users size={22} color="#fff" />, colors: ['#0891b2', '#06b6d4'], sub: '3 Sections' },
    ];

    const managementLinks = [
        { id: '1', title: 'Mark Attendance', sub: 'Daily student logs', icon: <CheckSquare size={24} color="#800000" />, bg: '#ffe4e6' },
        { id: '2', title: 'Upload Notes', sub: 'Share study materials', icon: <FileText size={24} color="#0284c7" />, bg: '#e0f2fe' },
        { id: '3', title: 'CIA Marks', sub: 'Manage grades', icon: <Award size={24} color="#f59e0b" />, bg: '#fffbeb' },
        { id: '4', title: 'Faculty Lounge', sub: 'Staff discussions', icon: <Users size={24} color="#7c3aed" />, bg: '#f5f3ff' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Header Section */}
                <LinearGradient
                    colors={['#800000', '#5a0000']}
                    style={styles.headerContainer}
                >
                    <View style={styles.headerTop}>
                        <View style={styles.userInfoRow}>
                            {user?.photo ? (
                                <Image source={{ uri: user.photo }} style={styles.profilePic} />
                            ) : (
                                <View style={styles.profilePlaceholder}>
                                    <Text style={styles.profileInitial}>{user?.name?.charAt(0)}</Text>
                                </View>
                            )}
                            <View>
                                <Text style={styles.welcomeText}>Staff Portal,</Text>
                                <Text style={styles.userName}>{user?.name}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                            <LogOut size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headerBadgeRow}>
                        <View style={styles.headerBadge}>
                            <Users size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.headerBadgeText}>{user?.department || 'General Dept'}</Text>
                        </View>
                        <View style={[styles.headerBadge, { backgroundColor: 'rgba(74,222,128,0.2)' }]}>
                            <Text style={[styles.headerBadgeText, { color: '#4ade80' }]}>On Duty</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Stats Overview */}
                    <View style={styles.statsRow}>
                        {stats.map(stat => (
                            <TouchableOpacity key={stat.id} style={styles.statCard} activeOpacity={0.9}>
                                <LinearGradient colors={stat.colors} style={styles.statGradient}>
                                    <View style={styles.statIconHeader}>
                                        <View style={styles.statIconBg}>{stat.icon}</View>
                                        <Text style={styles.statValueText}>{stat.value}</Text>
                                    </View>
                                    <Text style={styles.statLabelText}>{stat.title}</Text>
                                    <View style={styles.statStatusRow}>
                                        <View style={styles.statStatusDot} />
                                        <Text style={styles.statSubText}>{stat.sub}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Quick Access List */}
                    <Text style={styles.sectionTitle}>Management</Text>
                    <View style={styles.menuList}>
                        {managementLinks.map(link => (
                            <TouchableOpacity
                                key={link.id}
                                style={styles.menuItem}
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (link.title === 'CIA Marks') {
                                        navigation.navigate('StaffCIAMarks');
                                    }
                                }}
                            >
                                <View style={[styles.menuIconWrapper, { backgroundColor: link.bg }]}>
                                    {link.icon}
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuText}>{link.title}</Text>
                                    <Text style={styles.menuSub}>{link.sub}</Text>
                                </View>
                                <View style={styles.chevron}>
                                    <View style={styles.chevronDot} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Campus Updates Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Campus Updates</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator color="#800000" />
                        </View>
                    ) : (
                        <View style={styles.announcementsList}>
                            {announcements.length > 0 ? announcements.map(item => (
                                <View key={item._id} style={styles.announcementCard}>
                                    <View style={styles.cardIndicator} />
                                    <View style={styles.announcementCardContent}>
                                        <View style={styles.announcementHeader}>
                                            <Text style={styles.announcementTitle} numberOfLines={1}>{item.title}</Text>
                                            <Text style={styles.announcementDate}>
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </Text>
                                        </View>
                                        <Text style={styles.announcementDesc} numberOfLines={2}>{item.content}</Text>

                                        {item.attachmentUrl && item.attachmentType === 'image' && (
                                            <TouchableOpacity
                                                style={styles.imagePreviewContainer}
                                                onPress={() => {
                                                    setSelectedImage(item.attachmentUrl);
                                                    setViewImageModal(true);
                                                }}
                                            >
                                                <Image source={{ uri: item.attachmentUrl }} style={styles.imagePreview} resizeMode="cover" />
                                                <View style={styles.imageOverlay}>
                                                    <Eye size={14} color="#fff" />
                                                    <Text style={styles.imageOverlayText}>View</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}

                                        <View style={styles.announcementFooter}>
                                            <View style={styles.tagBadge}>
                                                <Megaphone size={12} color="#64748b" />
                                                <Text style={styles.tagText}>Notice</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )) : (
                                <View style={styles.emptyState}>
                                    <Megaphone size={40} color="#cbd5e1" />
                                    <Text style={styles.emptyText}>No recent updates</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Full Image View Modal */}
            <Modal
                visible={viewImageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewImageModal(false)}
            >
                <View style={styles.fullImageOverlay}>
                    <TouchableOpacity
                        style={styles.closeFullImage}
                        onPress={() => setViewImageModal(false)}
                    >
                        <X size={30} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerContainer: {
        paddingTop: (Platform?.OS === 'android') ? 50 : 30,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    userInfoRow: { flexDirection: 'row', alignItems: 'center' },
    profilePic: { width: 55, height: 55, borderRadius: 27, marginRight: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
    profilePlaceholder: {
        width: 55,
        height: 55,
        borderRadius: 27,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    profileInitial: { color: '#fff', fontSize: 24, fontWeight: '800' },
    welcomeText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
    userName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerBadgeRow: { flexDirection: 'row', marginTop: 15 },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 10
    },
    headerBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 5 },

    content: { paddingHorizontal: 20, paddingTop: 25 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statCard: { width: '48%', height: 140, borderRadius: 30, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    statGradient: { flex: 1, padding: 20, justifyContent: 'space-between' },
    statIconHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    statValueText: { fontSize: 24, fontWeight: '900', color: '#fff' },
    statLabelText: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
    statStatusRow: { flexDirection: 'row', alignItems: 'center' },
    statStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80', marginRight: 6 },
    statSubText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 15 },
    seeAllText: { fontSize: 14, color: '#800000', fontWeight: '800' },

    menuList: { gap: 15, marginBottom: 25 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    menuIconWrapper: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuContent: { flex: 1 },
    menuText: { fontSize: 16, fontWeight: '800', color: '#334155' },
    menuSub: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '500' },
    chevron: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
    chevronDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1' },

    announcementsList: { marginBottom: 20 },
    announcementCard: {
        backgroundColor: '#fff',
        borderRadius: 22,
        flexDirection: 'row',
        marginBottom: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    cardIndicator: { width: 5, height: '100%', backgroundColor: '#800000' },
    announcementCardContent: { flex: 1, padding: 18 },
    announcementHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    announcementTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', flex: 1, marginRight: 10 },
    announcementDate: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    announcementDesc: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 12 },

    imagePreviewContainer: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: '#f1f5f9',
        position: 'relative'
    },
    imagePreview: { width: '100%', height: '100%' },
    imageOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    imageOverlayText: { color: '#fff', fontSize: 10, fontWeight: '700', marginLeft: 4 },

    announcementFooter: { flexDirection: 'row' },
    tagBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    tagText: { fontSize: 11, fontWeight: '700', color: '#64748b', marginLeft: 5 },

    fullImageOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeFullImage: {
        position: 'absolute',
        top: 50,
        right: 25,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 30
    },
    fullImage: { width: '100%', height: '100%' },

    loaderContainer: { padding: 40 },
    emptyState: { alignItems: 'center', padding: 40 },
    emptyText: { color: '#94a3b8', fontWeight: '600', marginTop: 10 }
});

export default StaffDashboard;
