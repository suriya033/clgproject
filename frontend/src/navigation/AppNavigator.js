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
import GenericDashboard from '../screens/GenericDashboard';

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
                            </>
                        )}
                        {user.role === 'Student' && (
                            <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
                        )}
                        {user.role === 'Staff' && (
                            <Stack.Screen name="StaffDashboard" component={StaffDashboard} />
                        )}
                        {!['Admin', 'Student', 'Staff'].includes(user.role) && (
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
