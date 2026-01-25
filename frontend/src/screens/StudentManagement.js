import React from 'react';
import UserManagement from './UserManagement';

const StudentManagement = ({ navigation }) => {
    return (
        <UserManagement
            route={{ params: { roleFilter: 'Student' } }}
            navigation={navigation}
        />
    );
};

export default StudentManagement;
