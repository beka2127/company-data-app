// src/components/DepartmentManagement.js
import React, { useState, useMemo } from 'react';
import './DepartmentManagement.css'; // Make sure this CSS file exists

function DepartmentManagement({ departments, users, onAddDepartment, onEditDepartment, onDeleteDepartment }) {
    // State for managing Add Department Modal
    const [showAddDeptModal, setShowAddDeptModal] = useState(false);
    const [newDepartmentName, setNewDepartmentName] = useState('');

    // State for managing Edit Department Modal
    const [showEditDeptModal, setShowEditDeptModal] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);

    // State for search/filter
    const [searchTerm, setSearchTerm] = useState('');

    // Memoized filtered departments list
    const filteredDepartments = useMemo(() => {
        return departments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [departments, searchTerm]);


    // --- Add Department Handlers ---
    const handleOpenAddDeptModal = () => {
        setNewDepartmentName('');
        setShowAddDeptModal(true);
    };

    const handleCloseAddDeptModal = () => {
        setShowAddDeptModal(false);
        setNewDepartmentName('');
    };

    const handleAddDepartmentSubmit = (e) => {
        e.preventDefault();
        if (!newDepartmentName) {
            alert('Department name is required.');
            return;
        }
        onAddDepartment({ name: newDepartmentName }); // Call the prop function from AdminDashboard
        handleCloseAddDeptModal();
    };

    // --- Edit Department Handlers ---
    const handleOpenEditDeptModal = (department) => {
        setEditingDepartment({ ...department });
        setShowEditDeptModal(true);
    };

    const handleCloseEditDeptModal = () => {
        setShowEditDeptModal(false);
        setEditingDepartment(null);
    };

    const handleEditingDepartmentChange = (e) => {
        const { value } = e.target;
        setEditingDepartment(prev => ({ ...prev, name: value }));
    };

    const handleEditDepartmentSubmit = (e) => {
        e.preventDefault();
        if (!editingDepartment || !editingDepartment.name) {
            alert('Department name is required for update.');
            return;
        }
        // Pass department ID as first argument, and the updated data as second
        onEditDepartment(editingDepartment.id, { name: editingDepartment.name });
        handleCloseEditDeptModal();
    };

    // --- Delete Department Handler ---
    const handleDeleteClick = (departmentId, departmentName) => {
        // Check if any users are assigned to this department before attempting to delete
        const usersInDept = users.filter(user => user.departmentId === departmentId);
        if (usersInDept.length > 0) {
            alert(`Cannot delete department "${departmentName}". There are ${usersInDept.length} user(s) assigned to it. Please reassign or delete those users first.`);
            return;
        }
        onDeleteDepartment(departmentId, departmentName); // Call the prop function from AdminDashboard
    };


    return (
        <div className="department-management-container">
            <h3>Department Management</h3>
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button className="add-button" onClick={handleOpenAddDeptModal}>Add New Department</button>
            </div>

            {filteredDepartments.length === 0 ? (
                <p>No departments found.</p>
            ) : (
                <ul className="department-list">
                    {filteredDepartments.map(dept => (
                        <li key={dept.id} className="department-item">
                            <span><strong>{dept.name}</strong></span>
                            <div className="department-actions">
                                <button className="edit-button" onClick={() => handleOpenEditDeptModal(dept)}>Edit</button>
                                <button className="delete-button" onClick={() => handleDeleteClick(dept.id, dept.name)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Add Department Modal */}
            {showAddDeptModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>Add New Department</h4>
                        <form onSubmit={handleAddDepartmentSubmit} className="department-form">
                            <div className="form-group">
                                <label htmlFor="newDepartmentName">Department Name:</label>
                                <input
                                    type="text"
                                    id="newDepartmentName"
                                    value={newDepartmentName}
                                    onChange={(e) => setNewDepartmentName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit">Add Department</button>
                                <button type="button" onClick={handleCloseAddDeptModal} className="cancel-button">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Department Modal */}
            {showEditDeptModal && editingDepartment && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>Edit Department: {editingDepartment.name}</h4>
                        <form onSubmit={handleEditDepartmentSubmit} className="department-form">
                            <div className="form-group">
                                <label htmlFor="editDepartmentName">Department Name:</label>
                                <input
                                    type="text"
                                    id="editDepartmentName"
                                    value={editingDepartment.name}
                                    onChange={handleEditingDepartmentChange}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit">Update Department</button>
                                <button type="button" onClick={handleCloseEditDeptModal} className="cancel-button">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DepartmentManagement;