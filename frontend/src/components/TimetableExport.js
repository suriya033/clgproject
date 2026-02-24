import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    Dimensions,
    Alert
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { FileImage } from 'lucide-react-native';
import Svg, { Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TimetableExport = ({ result }) => {
    const viewShotRef = useRef();
    const { metadata, schedule, subjects } = result;

    const captureAndSave = async () => {
        try {
            // Use a bit of delay to ensure layout is fully settled
            const uri = await viewShotRef.current.capture();

            if (Platform.OS === 'web') {
                const link = document.createElement('a');
                link.href = uri;
                link.download = `Timetable_${metadata.deptName}_${metadata.section}.png`;
                link.click();
            } else {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                    const asset = await MediaLibrary.createAssetAsync(uri);
                    Alert.alert('Success', 'Timetable image saved to gallery!');
                } else {
                    // Fallback to sharing if permission denied
                    await Sharing.shareAsync(uri);
                }
            }
        } catch (error) {
            console.error("Capture failed", error);
            Alert.alert('Error', 'Failed to generate image. Please try again.');
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayMap = {
        'Monday': 'MON',
        'Tuesday': 'TUE',
        'Wednesday': 'WED',
        'Thursday': 'THU',
        'Friday': 'FRI'
    };

    const getSlotData = (daySlots, index) => {
        return (daySlots && daySlots[index]) ? daySlots[index] : { subject: '-', staff: '-' };
    };

    const ROW_HEIGHT = 90; // Increased height for better fit
    const PAGE_WIDTH = 1100;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.downloadBtn} onPress={captureAndSave} activeOpacity={0.8}>
                <FileImage size={24} color="#fff" />
                <Text style={styles.downloadBtnText}>Save Timetable to Gallery</Text>
            </TouchableOpacity>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                style={styles.previewScroll}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <ViewShot
                    ref={viewShotRef}
                    options={{ format: "png", quality: 1.0 }}
                    style={styles.viewShot}
                >
                    {/* Explicitly set collapsable={false} to all major views for ViewShot to work correctly on Android */}
                    <View style={styles.page} collapsable={false}>
                        {/* Header Section */}
                        <View style={styles.header} collapsable={false}>
                            <Text style={styles.deptName}>Department of {metadata.deptName || 'College'}</Text>

                            <View style={styles.metaRow} collapsable={false}>
                                <View style={styles.metaCol}>
                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaLabel}>Batch</Text>
                                        <Text style={styles.metaValue}>: {metadata.batch}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaLabel}>Academic Year</Text>
                                        <Text style={styles.metaValue}>: {metadata.academicYear}</Text>
                                    </View>
                                </View>
                                <View style={styles.metaCol}>
                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaLabel}>Year / Sem</Text>
                                        <Text style={styles.metaValue}>: {metadata.semester} / {metadata.section}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaLabel}>Lecture Hall</Text>
                                        <Text style={styles.metaValue}>: {metadata.room || 'TBD'}</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.title}>CLASS TIME TABLE</Text>
                        </View>

                        {/* Main Timetable Body */}
                        <View style={styles.table} collapsable={false}>
                            {/* Day / Hour Header Row */}
                            <View style={styles.tableRow} collapsable={false}>
                                <View style={[styles.cell, styles.headerCell, { width: 90, height: 100 }]}>
                                    <View style={styles.diagonalLine}>
                                        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                                            <Line x1="0" y1="0" x2="90" y2="100" stroke="black" strokeWidth="1.5" />
                                        </Svg>
                                        <Text style={styles.diagonalTop}>Hour</Text>
                                        <Text style={styles.diagonalBottom}>Day</Text>
                                    </View>
                                </View>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num, idx) => {
                                    const sampleDayData = schedule[days[0]] || [];
                                    const timeData = getSlotData(sampleDayData, idx < 2 ? idx : (idx < 4 ? idx + 1 : (idx < 6 ? idx + 2 : idx + 3)));
                                    return (
                                        <React.Fragment key={num}>
                                            <View style={[styles.cell, styles.headerCell, { flex: 1, height: 100 }]}>
                                                <Text style={styles.hourNum}>{num} Hour</Text>
                                                <Text style={styles.hourTime}>
                                                    {timeData.startTime}{'\n'}to{'\n'}{timeData.endTime}
                                                </Text>
                                            </View>
                                            {num === 2 && <View style={styles.narrowHeaderCell} />}
                                            {num === 4 && <View style={styles.narrowHeaderCell} />}
                                            {num === 6 && <View style={styles.narrowHeaderCell} />}
                                        </React.Fragment>
                                    );
                                })}
                            </View>

                            {/* Table Content Columns */}
                            <View style={{ flexDirection: 'row' }} collapsable={false}>
                                {/* Day Labels Column */}
                                <View style={{ width: 90 }}>
                                    {days.map(day => (
                                        <View key={day} style={[styles.cell, styles.dayCell, { height: ROW_HEIGHT }]}>
                                            <Text style={styles.dayText}>{dayMap[day]}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Hour Columns 1 & 2 */}
                                {[0, 1].map(slotIdx => (
                                    <View key={slotIdx} style={{ flex: 1 }}>
                                        {days.map(day => (
                                            <View key={day} style={[styles.cell, { height: ROW_HEIGHT }]}>
                                                <Text style={styles.subjectText} numberOfLines={3}>
                                                    {(schedule[day] && schedule[day][slotIdx]) ? schedule[day][slotIdx].subject : '-'}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}

                                {/* Break 1 Column (Vertical Span) */}
                                <View style={[styles.cell, styles.verticalBreakCell, { width: 35, height: ROW_HEIGHT * 5 }]}>
                                    <Text style={styles.verticalText}>BREAK (10:55 to 11:15)</Text>
                                </View>

                                {/* Hour Columns 3 & 4 */}
                                {[3, 4].map(slotIdx => (
                                    <View key={slotIdx} style={{ flex: 1 }}>
                                        {days.map(day => (
                                            <View key={day} style={[styles.cell, { height: ROW_HEIGHT }]}>
                                                <Text style={styles.subjectText} numberOfLines={3}>
                                                    {(schedule[day] && schedule[day][slotIdx]) ? schedule[day][slotIdx].subject : '-'}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}

                                {/* Lunch Break Column (Vertical Span) */}
                                <View style={[styles.cell, styles.verticalBreakCell, { width: 35, height: ROW_HEIGHT * 5 }]}>
                                    <Text style={styles.verticalText}>LUNCH BREAK (12:55 to 01:45)</Text>
                                </View>

                                {/* Hour Columns 5 & 6 */}
                                {[6, 7].map(slotIdx => (
                                    <View key={slotIdx} style={{ flex: 1 }}>
                                        {days.map(day => (
                                            <View key={day} style={[styles.cell, { height: ROW_HEIGHT }]}>
                                                <Text style={styles.subjectText} numberOfLines={3}>
                                                    {(schedule[day] && schedule[day][slotIdx]) ? schedule[day][slotIdx].subject : '-'}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}

                                {/* Break 2 Column (Vertical Span) */}
                                <View style={[styles.cell, styles.verticalBreakCell, { width: 35, height: ROW_HEIGHT * 5 }]}>
                                    <Text style={styles.verticalText}>BREAK (03:15 to 03:25)</Text>
                                </View>

                                {/* Hour Columns 7 & 8 */}
                                {[9, 10].map(slotIdx => (
                                    <View key={slotIdx} style={{ flex: 1 }}>
                                        {days.map(day => (
                                            <View key={day} style={[styles.cell, { height: ROW_HEIGHT }]}>
                                                <Text style={styles.subjectText} numberOfLines={3}>
                                                    {(schedule[day] && schedule[day][slotIdx]) ? schedule[day][slotIdx].subject : '-'}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Subject Allocation Section */}
                        <View style={styles.allocationSection} collapsable={false}>
                            <Text style={styles.allocationTitle}>SUBJECT ALLOCATION</Text>
                            <View style={styles.allocTable} collapsable={false}>
                                <View style={[styles.tableRow, styles.allocHeader]} collapsable={false}>
                                    <Text style={[styles.allocHeaderCell, { width: 60 }]}>S.No.</Text>
                                    <Text style={[styles.allocHeaderCell, { width: 120 }]}>Code</Text>
                                    <Text style={[styles.allocHeaderCell, { flex: 2 }]}>Subject Name & Short</Text>
                                    <Text style={[styles.allocHeaderCell, { flex: 2 }]}>Faculty Name & Code</Text>
                                    <Text style={[styles.allocHeaderCell, { width: 70 }]}>Hours</Text>
                                </View>
                                {subjects.reduce((acc, sub) => {
                                    if (sub.type === 'Integrated' && parseInt(sub.theoryHours || 0) > 0) {
                                        // 1) Add Lab entry first (with alternative details)
                                        acc.push({
                                            ...sub,
                                            _displayType: 'Lab',
                                            _displayName: `${sub.name} (LAB)`,
                                            _displayHours: sub.labHours
                                        });
                                        // 2) Add Theory entry (WITHOUT alternative details)
                                        acc.push({
                                            ...sub,
                                            alternative: null, // Clear alternative for theory part
                                            _displayType: 'Theory',
                                            _displayName: `${sub.name} (THEORY)`,
                                            _displayHours: sub.theoryHours
                                        });
                                    } else {
                                        acc.push({
                                            ...sub,
                                            _displayType: sub.type,
                                            _displayName: sub.name,
                                            _displayHours: sub.hoursPerWeek
                                        });
                                    }
                                    return acc;
                                }, []).map((sub, idx) => {
                                    const primaryCode = sub.code || '-';
                                    const primaryName = sub._displayName;
                                    const primaryStaff = `${sub.staffName}${sub.staffCode ? ` (${sub.staffCode})` : ''}`;

                                    let altCode = '', altName = '', altStaff = '';
                                    if (sub.alternative) {
                                        altCode = ` / ${sub.alternative.code || '-'}`;
                                        altName = ` / ${sub.alternative.name || sub.alternative.fullName}${sub.alternative.name && sub.alternative.name !== sub.alternative.fullName ? ` (${sub.alternative.name})` : ''}`;
                                        altStaff = ` / ${sub.alternative.staffName}${sub.alternative.staffCode ? ` (${sub.alternative.staffCode})` : ''}`;
                                    }

                                    return (
                                        <View key={idx} style={styles.tableRow} collapsable={false}>
                                            <Text style={[styles.allocCell, { width: 60, textAlign: 'center' }]}>{idx + 1}</Text>
                                            <Text style={[styles.allocCell, { width: 120 }]}>
                                                {primaryCode}{altCode}
                                            </Text>
                                            <Text style={[styles.allocCell, { flex: 2, fontWeight: '700' }]}>
                                                {primaryName}{altName}
                                            </Text>
                                            <Text style={[styles.allocCell, { flex: 2 }]}>
                                                {primaryStaff}{altStaff}
                                            </Text>
                                            <Text style={[styles.allocCell, { width: 70, textAlign: 'center', fontWeight: 'bold' }]}>
                                                {sub._displayHours}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </ViewShot>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        alignItems: 'center',
        width: '100%',
    },
    downloadBtn: {
        backgroundColor: '#800000',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    downloadBtnText: {
        color: '#fff',
        fontWeight: '900',
        marginLeft: 12,
        fontSize: 18
    },
    previewScroll: {
        width: '100%',
    },
    viewShot: {
        backgroundColor: '#fff',
    },
    page: {
        padding: 40,
        width: 1100,
        backgroundColor: '#fff',
        // Important: ensure no vertical flex that might clip
    },
    header: {
        alignItems: 'center',
        marginBottom: 35,
    },
    deptName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#000',
        borderBottomWidth: 3,
        borderBottomColor: '#000',
        paddingBottom: 10,
        marginBottom: 25,
        textAlign: 'center',
        width: '100%',
        textTransform: 'uppercase'
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 25,
    },
    metaCol: {
        flex: 1,
    },
    metaItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    metaLabel: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000',
        width: 150,
    },
    metaValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        textDecorationLine: 'underline',
        marginVertical: 20,
        letterSpacing: 3
    },
    table: {
        borderWidth: 2,
        borderColor: '#000',
        width: '100%',
    },
    tableRow: {
        flexDirection: 'row',
    },
    cell: {
        borderWidth: 1.25,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    headerCell: {
        backgroundColor: '#f1f5f9',
    },
    diagonalLine: {
        width: '100%',
        height: '100%',
        position: 'relative'
    },
    diagonalTop: {
        position: 'absolute',
        top: 4,
        right: 4,
        fontSize: 13,
        fontWeight: '900'
    },
    diagonalBottom: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        fontSize: 13,
        fontWeight: '900'
    },
    hourNum: {
        fontSize: 15,
        fontWeight: '900',
        color: '#000'
    },
    hourTime: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '800'
    },
    dayCell: {
        backgroundColor: '#f1f5f9',
    },
    dayText: {
        fontSize: 18,
        fontWeight: '900',
    },
    subjectText: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '800',
        color: '#000'
    },
    verticalBreakCell: {
        backgroundColor: '#fff',
    },
    verticalText: {
        transform: [{ rotate: '-90deg' }],
        width: 450, // Matches 5 * ROW_HEIGHT
        fontSize: 15,
        fontWeight: '900',
        textAlign: 'center',
        color: '#000'
    },
    narrowHeaderCell: {
        width: 35,
        borderWidth: 1.25,
        borderColor: '#000',
        backgroundColor: '#f1f5f9'
    },
    allocationSection: {
        marginTop: 60,
    },
    allocationTitle: {
        fontSize: 20,
        fontWeight: '900',
        textDecorationLine: 'underline',
        marginBottom: 25,
        textAlign: 'center'
    },
    allocTable: {
        borderWidth: 2,
        borderColor: '#000',
    },
    allocHeader: {
        backgroundColor: '#f1f5f9',
    },
    allocHeaderCell: {
        padding: 15,
        borderWidth: 1.25,
        borderColor: '#000',
        fontSize: 15,
        fontWeight: '900',
        textAlign: 'center'
    },
    allocCell: {
        padding: 15,
        borderWidth: 1.25,
        borderColor: '#000',
        fontSize: 14,
        color: '#000',
        fontWeight: '600'
    }
});

export default TimetableExport;
