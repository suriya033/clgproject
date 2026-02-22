import React from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, FilePlus, History, Clock } from 'lucide-react-native';

const SmartRequestDashboard = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />

            <LinearGradient colors={['#800000', '#5a0000']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Smart Request</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Leave & OD Management</Text>
                <Text style={styles.sectionSubtitle}>Create new requests or track the status of existing ones.</Text>

                <TouchableOpacity
                    style={styles.actionCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('StudentLeaveRequest')}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                        <FilePlus size={30} color="#b91c1c" />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>Create Request</Text>
                        <Text style={styles.cardDesc}>Apply for Leave or On-Duty with an auto-generated formal letter.</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('StudentRequestHistory')}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
                        <History size={30} color="#4338ca" />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>Track Status</Text>
                        <Text style={styles.cardDesc}>View your past requests and track approval statuses (Advisor & HOD).</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Clock size={20} color="#b45309" />
                    <Text style={styles.infoText}>Requests must be submitted at least 1 day in advance. Approval flows sequentially from your Advisor to the HOD.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 45,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
    },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
    content: { padding: 20, paddingTop: 30 },
    sectionTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b', marginBottom: 5 },
    sectionSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 30, lineHeight: 20 },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    iconContainer: { padding: 15, borderRadius: 16, marginRight: 15 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 5 },
    cardDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#fef3c7',
        padding: 15,
        borderRadius: 16,
        marginTop: 20,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#fde68a'
    },
    infoText: { flex: 1, marginLeft: 10, color: '#92400e', fontSize: 13, lineHeight: 20, fontWeight: '600' }
});

export default SmartRequestDashboard;
