import React from 'react';
import UserManagement from './UserManagement';

const StaffManagement = ({ navigation, route }) => {
    return (
        <UserManagement
            route={{ params: { roleFilter: 'Staff', ...route.params } }}
            navigation={navigation}
        />
    );
};

export default StaffManagement;
