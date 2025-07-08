// src/components/AdminDashboard.js
import React from 'react';
import UserManagement from './UserManagement';
import DepartmentManagement from './DepartmentManagement';
import './AdminDashboard.css';

function AdminDashboard({ users, departments, refreshData }) {

    const handleAddUser = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(userData),
            });
            if (response.ok) { alert('User added successfully!'); refreshData(); }
            else { const errorData = await response.json(); console.error('Failed to add user (backend response):', errorData); alert('Failed to add user: ' + (errorData.message || 'Unknown error')); }
        } catch (error) { console.error('Error adding user (frontend network/parsing error):', error); alert('An error occurred while adding user. Check console for details.'); }
    };

    const handleEditUser = async (userId, userData) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(userData),
            });
            if (response.ok) { alert('User updated successfully!'); refreshData(); }
            else { const errorData = await response.json(); console.error('Failed to update user (backend response):', errorData); alert('Failed to update user: ' + (errorData.message || 'Unknown error')); }
        } catch (error) { console.error('Error updating user (frontend network/parsing error):', error); alert('An error occurred while updating user. Check console for details.'); }
    };

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Are you sure you want to delete user: ${username}?`)) {
            try {
                const response = await fetch(`http://localhost:5000/api/users/${userId}`, { method: 'DELETE', });
                if (response.ok) { alert('User deleted successfully!'); refreshData(); }
                else { const errorData = await response.json(); console.error('Failed to delete user (backend response):', errorData); alert('Failed to delete user: ' + (errorData.message || 'Unknown error')); }
            } catch (error) { console.error('Error deleting user (frontend network/parsing error):', error); alert('An error occurred while deleting user. Check console for details.'); }
        }
    };

    const handleAddDepartment = async (departmentData) => {
        try {
            const response = await fetch('http://localhost:5000/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(departmentData),
            });
            if (response.ok) { alert('Department added successfully!'); refreshData(); }
            else { const errorData = await response.json(); console.error('Failed to add department (backend response):', errorData); alert('Failed to add department: ' + (errorData.message || 'Unknown error')); }
        } catch (error) { console.error('Error adding department (frontend network/parsing error):', error); alert('An error occurred while adding department. Check console for details.'); }
    };

    const handleEditDepartment = async (departmentId, departmentData) => {
        try {
            const response = await fetch(`http://localhost:5000/api/departments/${departmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(departmentData),
            });
            if (response.ok) { alert('Department updated successfully!'); refreshData(); }
            else { const errorData = await response.json(); console.error('Failed to update department (backend response):', errorData); alert('Failed to update department: ' + (errorData.message || 'Unknown error')); }
        } catch (error) { console.error('Error updating department (frontend network/parsing error):', error); alert('An error occurred while updating department. Check console for details.'); }
    };

    const handleDeleteDepartment = async (departmentId, departmentName) => {
        if (window.confirm(`Are you sure you want to delete department: ${departmentName}?`)) {
            try {
                const response = await fetch(`http://localhost:5000/api/departments/${departmentId}`, { method: 'DELETE', });
                if (response.ok) { alert('Department deleted successfully!'); refreshData(); }
                else { const errorData = await response.json(); console.error('Failed to delete department (backend response):', errorData); alert('Failed to delete department: ' + (errorData.message || 'Unknown error')); }
            } catch (error) { console.error('Error deleting department (frontend network/parsing error):', error); alert('An error occurred while deleting department. Check console for details.'); }
        }
    };

    return (
        <div className="admin-dashboard-container">
            <h3>Admin Panel</h3>
            <p>Manage users and departments within the system.</p>
            <UserManagement
                users={users}
                departments={departments}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
            />
            <DepartmentManagement
                departments={departments}
                users={users}
                onAddDepartment={handleAddDepartment}
                onEditDepartment={handleEditDepartment}
                onDeleteDepartment={handleDeleteDepartment}
            />
        </div>
    );
}

export default AdminDashboard;