import React from 'react';
import UserManagement from './UserManagement';

const StaffManagement = ({ navigation, route }) => {
    return (
        <UserManagement
            route={{ params: { roleFilter: ['Staff', 'HOD'], ...route.params } }}
            navigation={navigation}
        />
    );
};

export default StaffManagement;
