import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import AdminDashboard from '../screens/AdminDashboard';
import StudentDashboard from '../screens/StudentDashboard';
import StaffDashboard from '../screens/StaffDashboard';
import UserManagement from '../screens/UserManagement';
import StudentManagement from '../screens/StudentManagement';
import StaffManagement from '../screens/StaffManagement';
import HODManagement from '../screens/HODManagement';
import LibraryManagement from '../screens/LibraryManagement';
import CollegeManagement from '../screens/CollegeManagement';
import FeeManagement from '../screens/FeeManagement';
import TransportManagement from '../screens/TransportManagement';
import OfficeManagement from '../screens/OfficeManagement';
import SportsManagement from '../screens/SportsManagement';
import HostelManagement from '../screens/HostelManagement';
import ExamCell from '../screens/ExamCell';
import GenericDashboard from '../screens/GenericDashboard';
import OfficeDashboard from '../screens/OfficeDashboard';
import DriverDashboard from '../screens/DriverDashboard';
import DepartmentManagement from '../screens/DepartmentManagement';
import CourseManagement from '../screens/CourseManagement';
import NoticeManagement from '../screens/NoticeManagement';
import SubjectManagement from '../screens/SubjectManagement';
import TimeTableGenerator from '../screens/TimeTableGenerator';
import TimetableViewer from '../screens/TimetableViewer';
import HODDashboard from '../screens/HODDashboard';
import StaffCIAMarks from '../screens/StaffCIAMarks';
import StaffTimetable from '../screens/StaffTimetable';
import StaffAttendance from '../screens/StaffAttendance';
import MarkAttendance from '../screens/MarkAttendance';
import CoordinatorClassView from '../screens/CoordinatorClassView';
import StudentLeaveRequest from '../screens/StudentLeaveRequest';
import StudentRequestHistory from '../screens/StudentRequestHistory';
import CoordinatorRequests from '../screens/CoordinatorRequests';
import HODRequests from '../screens/HODRequests';
import ClassManagement from '../screens/ClassManagement';
import BulkLeaveManagement from '../screens/BulkLeaveManagement';
import StudentProfileView from '../screens/StudentProfileView';
import StudentAttendance from '../screens/StudentAttendance';
import StudentMarks from '../screens/StudentMarks';
import StudentComplaint from '../screens/StudentComplaint';
import ComplaintViewer from '../screens/ComplaintViewer';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user.role === 'Admin' && (
                <>
                    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
                    <Stack.Screen name="UserManagement" component={UserManagement} />
                    <Stack.Screen name="StudentManagement" component={StudentManagement} />
                    <Stack.Screen name="StaffManagement" component={StaffManagement} />
                    <Stack.Screen name="HODManagement" component={HODManagement} />
                    <Stack.Screen name="LibraryManagement" component={LibraryManagement} />
                    <Stack.Screen name="CollegeManagement" component={CollegeManagement} />
                    <Stack.Screen name="DepartmentManagement" component={DepartmentManagement} />
                    <Stack.Screen name="CourseManagement" component={CourseManagement} />
                    <Stack.Screen name="SubjectManagement" component={SubjectManagement} />
                    <Stack.Screen name="Fees" component={FeeManagement} />
                    <Stack.Screen name="OfficeManagement" component={OfficeManagement} />
                    <Stack.Screen name="Sports" component={SportsManagement} />
                    <Stack.Screen name="Hostel" component={HostelManagement} />
                    <Stack.Screen name="ExamCell" component={ExamCell} />
                    <Stack.Screen name="Placements" component={GenericDashboard} />
                    <Stack.Screen name="ClassManagement" component={ClassManagement} />
                    <Stack.Screen name="Announcements" component={NoticeManagement} />
                    <Stack.Screen name="TimeTableGenerator" component={TimeTableGenerator} />
                    <Stack.Screen name="TimetableViewer" component={TimetableViewer} />
                    <Stack.Screen name="ComplaintViewer" component={ComplaintViewer} />
                </>
            )
            }
            {
                user.role === 'Student' && (
                    <>
                        <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
                        <Stack.Screen name="StudentLeaveRequest" component={StudentLeaveRequest} />
                        <Stack.Screen name="StudentRequestHistory" component={StudentRequestHistory} />
                        <Stack.Screen name="TimetableViewer" component={TimetableViewer} />
                        <Stack.Screen name="Attendance" component={StudentAttendance} />
                        <Stack.Screen name="StudentMarks" component={StudentMarks} />
                        <Stack.Screen name="StudentLibrary" component={GenericDashboard} />
                        <Stack.Screen name="SmartRequest" component={GenericDashboard} />
                        <Stack.Screen name="Assignments" component={GenericDashboard} />
                        <Stack.Screen name="Complaints" component={StudentComplaint} />
                        <Stack.Screen name="Fees" component={GenericDashboard} />
                    </>
                )
            }
            {
                user.role === 'Staff' && (
                    <>
                        <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
                        <Stack.Screen name="StaffCIAMarks" component={StaffCIAMarks} />
                        <Stack.Screen name="StaffTimetable" component={StaffTimetable} />
                        <Stack.Screen name="TimetableViewer" component={TimetableViewer} />
                        <Stack.Screen name="StaffAttendance" component={StaffAttendance} />
                        <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
                        <Stack.Screen name="CoordinatorClassView" component={CoordinatorClassView} />
                        <Stack.Screen name="CoordinatorRequests" component={CoordinatorRequests} />
                    </>
                )
            }
            {
                user.role === 'HOD' && (
                    <>
                        <Stack.Screen name="HODDashboard" component={HODDashboard} />
                        <Stack.Screen name="TimeTableGenerator" component={TimeTableGenerator} />
                        <Stack.Screen name="ClassManagement" component={ClassManagement} />
                        <Stack.Screen name="StaffManagement" component={StaffManagement} />
                        <Stack.Screen name="StudentManagement" component={StudentManagement} />
                        <Stack.Screen name="SubjectManagement" component={SubjectManagement} />
                        <Stack.Screen name="Announcements" component={NoticeManagement} />
                        <Stack.Screen name="StaffCIAMarks" component={StaffCIAMarks} />
                        <Stack.Screen name="StaffTimetable" component={StaffTimetable} />
                        <Stack.Screen name="TimetableViewer" component={TimetableViewer} />
                        <Stack.Screen name="StaffAttendance" component={StaffAttendance} />
                        <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
                        <Stack.Screen name="CoordinatorClassView" component={CoordinatorClassView} />
                        <Stack.Screen name="HODRequests" component={HODRequests} />
                        <Stack.Screen name="CoordinatorRequests" component={CoordinatorRequests} />
                        <Stack.Screen name="BulkLeaveManagement" component={BulkLeaveManagement} />
                        <Stack.Screen name="StudentProfileView" component={StudentProfileView} />
                        <Stack.Screen name="ComplaintViewer" component={ComplaintViewer} />
                    </>
                )
            }
            {
                user.role === 'Transport' && (
                    <Stack.Screen name="TransportDashboard" component={TransportManagement} />
                )
            }
            {
                user.role === 'Library' && (
                    <Stack.Screen name="LibraryDashboard" component={LibraryManagement} />
                )
            }
            {
                user.role === 'Office' && (
                    <>
                        <Stack.Screen name="OfficeDashboard" component={OfficeDashboard} />
                        <Stack.Screen name="CollegeManagement" component={CollegeManagement} />
                        <Stack.Screen name="Fees" component={FeeManagement} />
                        <Stack.Screen name="Announcements" component={NoticeManagement} />
                        <Stack.Screen name="StudentManagement" component={StudentManagement} />
                        <Stack.Screen name="StaffManagement" component={StaffManagement} />
                        <Stack.Screen name="LibraryManagement" component={LibraryManagement} />
                        <Stack.Screen name="Transport" component={TransportManagement} />
                        <Stack.Screen name="DepartmentManagement" component={DepartmentManagement} />
                        <Stack.Screen name="CourseManagement" component={CourseManagement} />
                        <Stack.Screen name="HODManagement" component={HODManagement} />
                        <Stack.Screen name="Sports" component={SportsManagement} />
                        <Stack.Screen name="Hostel" component={HostelManagement} />
                        <Stack.Screen name="ExamCell" component={ExamCell} />
                        <Stack.Screen name="Placements" component={GenericDashboard} />
                        <Stack.Screen name="TimeTableGenerator" component={TimeTableGenerator} />
                        <Stack.Screen name="TimetableViewer" component={TimetableViewer} />
                    </>
                )
            }
            {
                user.role === 'Driver' && (
                    <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
                )
            }

            {/* Universal Routes moved lower to not be initial */}
            <Stack.Screen name="Transport" component={TransportManagement} />
            <Stack.Screen name="GenericDashboard" component={GenericDashboard} />
            <Stack.Screen name="DefaultDashboard" component={GenericDashboard} />
        </Stack.Navigator >
    );
};

const DrawerNav = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <Sidebar {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'slide',
                drawerStyle: { width: 280 }
            }}
        >
            <Drawer.Screen name="AppContent" component={MainStack} />
        </Drawer.Navigator>
    );
}

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <Stack.Screen name="Home" component={DrawerNav} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
