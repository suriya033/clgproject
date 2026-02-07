
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, TrendingUp, Award, BookOpen, FileText } from 'lucide-react-native';
import api from '../api/api';

const { width } = Dimensions.get('window');

const StudentMarks = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [marksData, setMarksData] = useState([]);
    const [activeTab, setActiveTab] = useState('CIA 1');

    useEffect(() => {
        fetchMarks();
    }, []);

    const fetchMarks = async () => {
        try {
            const res = await api.get('/marks/my-marks');
            setMarksData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Group marks by Exam Type
    const getFilteredMarks = () => {
        return marksData.filter(m => m.examType === activeTab);
    };

    const calculateAverage = (marks) => {
        if (!marks || marks.length === 0) return 0;
        const total = marks.reduce((sum, item) => sum + item.marks, 0);
        return (total / marks.length).toFixed(1);
    };

    const currentMarks = getFilteredMarks();
    const average = calculateAverage(currentMarks);

    const renderExamTab = (examName) => (
        <TouchableOpacity
            style={[styles.tabBtn, activeTab === examName && styles.activeTabBtn]}
            onPress={() => setActiveTab(examName)}
        >
            <Text style={[styles.tabText, activeTab === examName && styles.activeTabText]}>{examName}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
            <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Academic Performance</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <View>
                        <Text style={styles.summaryLabel}>{activeTab} Average</Text>
                        <Text style={styles.summaryScore}>{average}%</Text>
                    </View>
                    <View style={styles.summaryIcon}>
                        <TrendingUp size={32} color="#2563eb" />
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.tabsContainer}>
                {renderExamTab('CIA 1')}
                {renderExamTab('CIA 2')}
                {renderExamTab('CIA 3')}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
                ) : (
                    <>
                        {currentMarks.length > 0 ? (
                            currentMarks.map((item, index) => (
                                <View key={index} style={styles.markCard}>
                                    <View style={styles.subjectRow}>
                                        <View style={styles.iconContainer}>
                                            <BookOpen size={20} color="#2563eb" />
                                        </View>
                                        <Text style={styles.subjectName}>{item.subject}</Text>
                                    </View>

                                    <View style={styles.scoreRow}>
                                        <View style={styles.scoreContainer}>
                                            <Text style={styles.scoreLabel}>Scored</Text>
                                            <Text style={styles.scoreValue}>{item.marks}</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.scoreContainer}>
                                            <Text style={styles.scoreLabel}>Total</Text>
                                            <Text style={styles.scoreValue}>{item.maxMarks}</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.scoreContainer}>
                                            <Text style={styles.scoreLabel}>Result</Text>
                                            <Text style={[
                                                styles.passStatus,
                                                { color: item.marks >= (item.maxMarks * 0.4) ? '#10b981' : '#ef4444' }
                                            ]}>
                                                {item.marks >= (item.maxMarks * 0.4) ? 'Pass' : 'Fail'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <FileText size={48} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No marks uploaded for {activeTab}</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        paddingTop: 50,
        paddingBottom: 60, // Extra space for summary card overlapping
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },

    summaryCard: {
        position: 'absolute',
        bottom: -40,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    summaryLabel: { color: '#64748b', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
    summaryScore: { color: '#1e293b', fontSize: 32, fontWeight: '900', marginTop: 4 },
    summaryIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    tabsContainer: {
        marginTop: 60,
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 10
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    activeTabBtn: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb'
    },
    tabText: {
        fontWeight: '700',
        color: '#64748b'
    },
    activeTabText: {
        color: '#fff'
    },

    content: {
        paddingHorizontal: 20,
        paddingBottom: 30
    },
    markCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05
    },
    subjectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    subjectName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        flex: 1
    },
    scoreRow: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 15,
        justifyContent: 'space-between'
    },
    scoreContainer: { alignItems: 'center', flex: 1 },
    scoreLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    scoreValue: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
    passStatus: { fontSize: 14, fontWeight: '900' },
    divider: { width: 1, backgroundColor: '#e2e8f0' },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        opacity: 0.5
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b'
    }
});

export default StudentMarks;
