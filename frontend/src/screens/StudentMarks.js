import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet, Text, View, SafeAreaView, ScrollView,
    ActivityIndicator, StatusBar, TouchableOpacity, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft, TrendingUp, BookOpen, FileText,
    CheckCircle2, XCircle, Award, BarChart2, GraduationCap
} from 'lucide-react-native';
import api from '../api/api';

const { width } = Dimensions.get('window');
const TABS = ['CIA 1', 'CIA 2', 'CIA 3'];

// ── Helpers ────────────────────────────────────────────────────────────────
const pct = (marks, max) => (max > 0 ? ((marks / max) * 100).toFixed(0) : 0);
const avg = (list) => {
    if (!list.length) return 0;
    return (list.reduce((s, m) => s + m.marks, 0) / list.length).toFixed(1);
};
const gradeInfo = (p) => {
    const n = Number(p);
    if (n >= 90) return { grade: 'O', label: 'Outstanding', color: '#10b981' };
    if (n >= 75) return { grade: 'A+', label: 'Excellent', color: '#3b82f6' };
    if (n >= 60) return { grade: 'A', label: 'Good', color: '#6366f1' };
    if (n >= 50) return { grade: 'B', label: 'Average', color: '#f59e0b' };
    if (n >= 40) return { grade: 'C', label: 'Pass', color: '#f97316' };
    return { grade: 'F', label: 'Fail', color: '#ef4444' };
};

// ── Progress Bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ value, color }) => (
    <View style={pb.track}>
        <View style={[pb.fill, { width: `${Math.min(100, value)}%`, backgroundColor: color }]} />
    </View>
);
const pb = StyleSheet.create({
    track: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 6, overflow: 'hidden', flex: 1 },
    fill: { height: '100%', borderRadius: 6 },
});

// ── Subject Card ───────────────────────────────────────────────────────────
const SubjectCard = ({ item, index }) => {
    const percentage = Number(pct(item.marks, item.maxMarks));
    const { grade, label, color } = gradeInfo(percentage);
    const isPassed = percentage >= 40;

    return (
        <View style={[s.card, { borderLeftColor: color }]}>
            {/* Top Row */}
            <View style={s.cardTop}>
                <View style={[s.subjectIcon, { backgroundColor: color + '18' }]}>
                    <BookOpen size={18} color={color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.subjectName} numberOfLines={2}>{item.subject}</Text>
                    <Text style={s.examLabel}>{item.examType}</Text>
                </View>
                <View style={[s.gradePill, { backgroundColor: color + '18', borderColor: color + '40' }]}>
                    <Text style={[s.gradeText, { color }]}>{grade}</Text>
                </View>
            </View>

            {/* Score + Bar */}
            <View style={s.progressRow}>
                <ProgressBar value={percentage} color={color} />
                <Text style={[s.pctText, { color }]}>{percentage}%</Text>
            </View>

            {/* Bottom Stats */}
            <View style={s.cardBottom}>
                <View style={s.statItem}>
                    <Text style={s.statLabel}>SCORED</Text>
                    <Text style={[s.statValue, { color }]}>{item.marks}</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                    <Text style={s.statLabel}>TOTAL</Text>
                    <Text style={s.statValue}>{item.maxMarks}</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                    <Text style={s.statLabel}>RESULT</Text>
                    <View style={s.resultRow}>
                        {isPassed
                            ? <CheckCircle2 size={13} color="#10b981" />
                            : <XCircle size={13} color="#ef4444" />
                        }
                        <Text style={[s.resultText, { color: isPassed ? '#10b981' : '#ef4444' }]}>
                            {isPassed ? 'Pass' : 'Fail'}
                        </Text>
                    </View>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                    <Text style={s.statLabel}>GRADE</Text>
                    <Text style={[s.statValue, { color }]}>{label}</Text>
                </View>
            </View>
        </View>
    );
};

// ── Main Screen ────────────────────────────────────────────────────────────
const StudentMarks = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [marksData, setMarksData] = useState([]);
    const [activeTab, setActiveTab] = useState('CIA 1');

    useEffect(() => { fetchMarks(); }, []);

    const fetchMarks = async () => {
        try {
            const res = await api.get('/marks/my-marks');
            setMarksData(res.data);
        } catch (e) {
            console.error('Fetch marks error:', e);
        } finally {
            setLoading(false);
        }
    };

    const currentMarks = useMemo(() =>
        marksData.filter(m => m.examType === activeTab), [marksData, activeTab]);

    const overallAvg = useMemo(() => avg(currentMarks), [currentMarks]);
    const passCount = currentMarks.filter(m => pct(m.marks, m.maxMarks) >= 40).length;
    const { grade, label, color: gradeColor } = gradeInfo(Number(overallAvg));

    const allOverall = useMemo(() => avg(marksData), [marksData]);
    const totalSubjects = new Set(marksData.map(m => m.subject)).size;

    return (
        <SafeAreaView style={s.container}>
            <StatusBar barStyle="light-content" backgroundColor="#800000" />

            {/* ── Header ── */}
            <LinearGradient colors={['#800000', '#5a0000']} style={s.header}>
                <View style={s.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>CIA Report Card</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Overall Summary Strip */}
                <View style={s.overallStrip}>
                    <View style={s.stripItem}>
                        <GraduationCap size={18} color="rgba(255,255,255,0.75)" />
                        <Text style={s.stripNum}>{totalSubjects}</Text>
                        <Text style={s.stripLabel}>Subjects</Text>
                    </View>
                    <View style={s.stripDivider} />
                    <View style={s.stripItem}>
                        <BarChart2 size={18} color="rgba(255,255,255,0.75)" />
                        <Text style={s.stripNum}>{allOverall}%</Text>
                        <Text style={s.stripLabel}>Overall Avg</Text>
                    </View>
                    <View style={s.stripDivider} />
                    <View style={s.stripItem}>
                        <Award size={18} color="rgba(255,255,255,0.75)" />
                        <Text style={s.stripNum}>{gradeInfo(allOverall).grade}</Text>
                        <Text style={s.stripLabel}>Overall Grade</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ── CIA Tabs ── */}
            <View style={s.tabsRow}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Active CIA Summary ── */}
            {!loading && currentMarks.length > 0 && (
                <LinearGradient
                    colors={[gradeColor + '22', gradeColor + '05']}
                    style={s.ciaSummary}
                >
                    <View>
                        <Text style={s.ciaSummaryLabel}>{activeTab} Average</Text>
                        <Text style={[s.ciaSummaryScore, { color: gradeColor }]}>{overallAvg}%</Text>
                        <Text style={[s.ciaSummaryGrade, { color: gradeColor }]}>{label}</Text>
                    </View>
                    <View style={s.ciaSummaryRight}>
                        <View style={[s.bigGrade, { backgroundColor: gradeColor + '18', borderColor: gradeColor }]}>
                            <Text style={[s.bigGradeText, { color: gradeColor }]}>{grade}</Text>
                        </View>
                        <Text style={s.ciaPassCount}>{passCount}/{currentMarks.length} Passed</Text>
                    </View>
                </LinearGradient>
            )}

            {/* ── Content ── */}
            <ScrollView
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={s.loadingBox}>
                        <ActivityIndicator size="large" color="#800000" />
                        <Text style={s.loadingText}>Loading your marks…</Text>
                    </View>
                ) : currentMarks.length > 0 ? (
                    currentMarks.map((item, idx) => (
                        <SubjectCard key={item._id || idx} item={item} index={idx} />
                    ))
                ) : (
                    <View style={s.emptyBox}>
                        <View style={s.emptyIcon}>
                            <FileText size={44} color="#cbd5e1" />
                        </View>
                        <Text style={s.emptyTitle}>No marks uploaded yet</Text>
                        <Text style={s.emptySub}>Your {activeTab} marks haven't been entered by your faculty yet.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        elevation: 10,
        shadowColor: '#800000',
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },

    overallStrip: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 10,
    },
    stripItem: { flex: 1, alignItems: 'center', gap: 3 },
    stripNum: { color: '#fff', fontSize: 18, fontWeight: '900' },
    stripLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
    stripDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

    // Tabs
    tabsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, gap: 10 },
    tabBtn: {
        flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center',
        backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
        elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    },
    tabBtnActive: { backgroundColor: '#800000', borderColor: '#800000', elevation: 4, shadowColor: '#800000', shadowOpacity: 0.25 },
    tabText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    tabTextActive: { color: '#fff' },

    // CIA Summary Banner
    ciaSummary: {
        marginHorizontal: 16, marginTop: 12, borderRadius: 18,
        padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    },
    ciaSummaryLabel: { fontSize: 12, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    ciaSummaryScore: { fontSize: 34, fontWeight: '900', marginTop: 2 },
    ciaSummaryGrade: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    ciaSummaryRight: { alignItems: 'center', gap: 8 },
    bigGrade: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    bigGradeText: { fontSize: 20, fontWeight: '900' },
    ciaPassCount: { fontSize: 12, color: '#64748b', fontWeight: '600' },

    // Scroll
    scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },

    // Mark Card
    card: {
        backgroundColor: '#fff', borderRadius: 20, padding: 18,
        marginBottom: 14, borderLeftWidth: 4,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    subjectIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    subjectName: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 3, lineHeight: 20 },
    examLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    gradePill: {
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 20, borderWidth: 1, minWidth: 44, alignItems: 'center',
    },
    gradeText: { fontSize: 14, fontWeight: '900' },

    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    pctText: { fontSize: 13, fontWeight: '800', minWidth: 38, textAlign: 'right' },

    cardBottom: {
        flexDirection: 'row', backgroundColor: '#f8fafc',
        borderRadius: 14, padding: 12, justifyContent: 'space-between',
    },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    statValue: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
    statDivider: { width: 1, backgroundColor: '#e2e8f0', marginVertical: 2 },
    resultRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
    resultText: { fontSize: 12, fontWeight: '800' },

    // States
    loadingBox: { alignItems: 'center', marginTop: 80, gap: 14 },
    loadingText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
    emptyBox: { alignItems: 'center', marginTop: 70, paddingHorizontal: 30 },
    emptyIcon: {
        width: 88, height: 88, borderRadius: 44, backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center', marginBottom: 18,
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
    emptySub: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 21 },
});

export default StudentMarks;
