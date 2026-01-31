
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

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
import NoticeManagement from '../screens/NoticeManagement';
import GenericDashboard from '../screens/GenericDashboard';
import DepartmentManagement from '../screens/DepartmentManagement';
import CourseManagement from '../screens/CourseManagement';
import FeeManagement from '../screens/FeeManagement';
import TransportManagement from '../screens/TransportManagement';
import OfficeManagement from '../screens/OfficeManagement';
import OfficeDashboard from '../screens/OfficeDashboard';
import SportsManagement from '../screens/SportsManagement';
import HostelManagement from '../screens/HostelManagement';
import DriverDashboard from '../screens/DriverDashboard';
import ExamCell from '../screens/ExamCell';
import ClassManagement from '../screens/ClassManagement';
import SubjectManagement from '../screens/SubjectManagement';
import TimeTableGenerator from '../screens/TimeTableGenerator';
import HODDashboard from '../screens/HODDashboard';

const Stack = createStackNavigator();

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
                    <>
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
                                <Stack.Screen name="Transport" component={TransportManagement} />
                                <Stack.Screen name="OfficeManagement" component={OfficeManagement} />
                                <Stack.Screen name="Sports" component={SportsManagement} />
                                <Stack.Screen name="Hostel" component={HostelManagement} />
                                <Stack.Screen name="ExamCell" component={ExamCell} />
                                <Stack.Screen name="Placements" component={GenericDashboard} />
                                <Stack.Screen name="ClassManagement" component={ClassManagement} />
                                <Stack.Screen name="Announcements" component={NoticeManagement} />
                                <Stack.Screen name="TimeTableGenerator" component={TimeTableGenerator} />
                            </>
                        )}
                        {user.role === 'Student' && (
                            <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
                        )}
                        {user.role === 'Staff' && (
                            <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
                        )}
                        {user.role === 'HOD' && (
                            <>
                                <Stack.Screen name="HODDashboard" component={HODDashboard} />
                                <Stack.Screen name="TimeTableGenerator" component={TimeTableGenerator} />
                                <Stack.Screen name="ClassManagement" component={ClassManagement} />
                                <Stack.Screen name="StaffManagement" component={StaffManagement} />
                                <Stack.Screen name="StudentManagement" component={StudentManagement} />
                                <Stack.Screen name="SubjectManagement" component={SubjectManagement} />
                                <Stack.Screen name="Announcements" component={NoticeManagement} />
                            </>
                        )}
                        {user.role === 'Transport' && (
                            <Stack.Screen name="TransportDashboard" component={TransportManagement} />
                        )}
                        {user.role === 'Library' && (
                            <Stack.Screen name="LibraryDashboard" component={LibraryManagement} />
                        )}
                        {user.role === 'Office' && (
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
                            </>
                        )}
                        {user.role === 'Driver' && (
                            <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
                        )}
                        {!['Admin', 'Student', 'Staff', 'HOD', 'Transport', 'Library', 'Office', 'Driver'].includes(user.role) && (
                            <Stack.Screen name="GenericDashboard" component={GenericDashboard} />
                        )}
                        <Stack.Screen name="DefaultDashboard" component={GenericDashboard} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
