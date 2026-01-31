import React from 'react';
import UserManagement from './UserManagement';

const StudentManagement = ({ navigation, route }) => {
    return (
        <UserManagement
            route={{ params: { roleFilter: 'Student', ...route.params } }}
            navigation={navigation}
        />
    );
};

export default StudentManagement;
