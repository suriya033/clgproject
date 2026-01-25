import React from 'react';
import UserManagement from './UserManagement';

const StaffManagement = ({ navigation }) => {
    return (
        <UserManagement
            route={{ params: { roleFilter: 'Staff' } }}
            navigation={navigation}
        />
    );
};

export default StaffManagement;
