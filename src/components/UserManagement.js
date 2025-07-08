// src/components/UserManagement.js
import React, { useState, useMemo } from 'react';
import './UserManagement.css';

function UserManagement({ users, departments, onAddUser, onEditUser, onDeleteUser }) {
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserData, setNewUserData] = useState({ username: '', password: '', role: 'user', departmentId: '', });
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getDepartmentName(user.departmentId).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm, departments]);

    const getDepartmentName = (departmentId) => {
        return departments.find(dept => dept.id === departmentId)?.name || 'N/A';
    };

    const handleOpenAddUserModal = () => {
        setNewUserData({ username: '', password: '', role: 'user', departmentId: departments.length > 0 ? departments[0].id : '', });
        setShowAddUserModal(true);
    };
    const handleCloseAddUserModal = () => {
        setShowAddUserModal(false); setNewUserData({ username: '', password: '', role: 'user', departmentId: '' });
    };
    const handleNewUserChange = (e) => {
        const { name, value } = e.target; setNewUserData(prev => ({ ...prev, [name]: value }));
    };
    const handleAddUserSubmit = (e) => {
        e.preventDefault();
        if (!newUserData.username || !newUserData.password || !newUserData.departmentId) { alert('Username, password, and department are required for a new user.'); return; }
        onAddUser(newUserData);
        handleCloseAddUserModal();
    };

    const handleOpenEditUserModal = (user) => {
        setEditingUser({ ...user }); setShowEditUserModal(true);
    };
    const handleCloseEditUserModal = () => {
        setShowEditUserModal(false); setEditingUser(null);
    };
    const handleEditingUserChange = (e) => {
        const { name, value } = e.target; setEditingUser(prev => ({ ...prev, [name]: value }));
    };
    const handleEditUserSubmit = (e) => {
        e.preventDefault();
        if (!editingUser || !editingUser.username || !editingUser.password || !editingUser.departmentId) { alert('Username, password, and department are required for user update.'); return; }
        onEditUser(editingUser.id, {
            username: editingUser.username, password: editingUser.password, role: editingUser.role, departmentId: editingUser.departmentId,
        });
        handleCloseEditUserModal();
    };

    const handleDeleteClick = (userId, username) => {
        onDeleteUser(userId, username);
    };

    return (
        <div className="user-management-container">
            <h3>User Management</h3>
            <div className="controls">
                <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                <button className="add-button" onClick={handleOpenAddUserModal}>Add New User</button>
            </div>
            {filteredUsers.length === 0 ? (<p>No users found.</p>) : (
                <ul className="user-list">
                    {filteredUsers.map(user => (
                        <li key={user.id} className="user-item">
                            <span><strong>{user.username}</strong> ({user.role}) - Dept: {getDepartmentName(user.departmentId)}</span>
                            <div className="user-actions">
                                <button className="edit-button" onClick={() => handleOpenEditUserModal(user)}>Edit</button>
                                <button className="delete-button" onClick={() => handleDeleteClick(user.id, user.username)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {showAddUserModal && (
                <div className="modal-overlay"><div className="modal-content"><h4>Add New User</h4><form onSubmit={handleAddUserSubmit} className="user-form">
                    <div className="form-group"><label htmlFor="newUsername">Username:</label><input type="text" id="newUsername" name="username" value={newUserData.username} onChange={handleNewUserChange} required /></div>
                    <div className="form-group"><label htmlFor="newPassword">Password:</label><input type="password" id="newPassword" name="password" value={newUserData.password} onChange={handleNewUserChange} required /></div>
                    <div className="form-group"><label htmlFor="newRole">Role:</label><select id="newRole" name="role" value={newUserData.role} onChange={handleNewUserChange}><option value="user">User</option><option value="admin">Admin</option></select></div>
                    <div className="form-group"><label htmlFor="newDepartmentId">Department:</label><select id="newDepartmentId" name="departmentId" value={newUserData.departmentId} onChange={handleNewUserChange} required><option value="">-- Select Department --</option>{departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select></div>
                    <div className="form-actions"><button type="submit">Add User</button><button type="button" onClick={handleCloseAddUserModal} className="cancel-button">Cancel</button></div>
                </form></div></div>
            )}
            {showEditUserModal && editingUser && (
                <div className="modal-overlay"><div className="modal-content"><h4>Edit User: {editingUser.username}</h4><form onSubmit={handleEditUserSubmit} className="user-form">
                    <div className="form-group"><label htmlFor="editUsername">Username:</label><input type="text" id="editUsername" name="username" value={editingUser.username} onChange={handleEditingUserChange} required /></div>
                    <div className="form-group"><label htmlFor="editPassword">Password:</label><input type="password" id="editPassword" name="password" value={editingUser.password} onChange={handleEditingUserChange} placeholder="Enter new password to change" required /></div>
                    <div className="form-group"><label htmlFor="editRole">Role:</label><select id="editRole" name="role" value={editingUser.role} onChange={handleEditingUserChange}><option value="user">User</option><option value="admin">Admin</option></select></div>
                    <div className="form-group"><label htmlFor="editDepartmentId">Department:</label><select id="editDepartmentId" name="departmentId" value={editingUser.departmentId} onChange={handleEditingUserChange} required><option value="">-- Select Department --</option>{departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select></div>
                    <div className="form-actions"><button type="submit">Update User</button><button type="button" onClick={handleCloseEditUserModal} className="cancel-button">Cancel</button></div>
                </form></div></div>
            )}
        </div>
    );
}

export default UserManagement;