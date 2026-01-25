import React from 'react';
import UserManagement from './UserManagement';

const OfficeManagement = ({ navigation }) => {
    return (
        <UserManagement
            route={{ params: { roleFilter: 'Office' } }}
            navigation={navigation}
        />
    );
};

export default OfficeManagement;
