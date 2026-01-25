import React from 'react';
import UserManagement from './UserManagement';

const HODManagement = ({ navigation }) => {
    return (
        <UserManagement
            route={{ params: { roleFilter: 'HOD' } }}
            navigation={navigation}
        />
    );
};

export default HODManagement;
