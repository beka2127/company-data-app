// src/components/MainContent.js
import React, { useState, useMemo } from 'react';
import './MainContent.css';

function MainContent({
    currentUserRole,
    currentUserDepartmentId,
    users, departments,
    tasks, announcements, attachments, // We don't need setters here as refreshData handles it
    refreshData
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemTypeToAdd, setItemTypeToAdd] = useState('task');
  const [newTaskData, setNewTaskData] = useState({
    name: '', status: 'Pending', assignedTo: '', dueDate: '', departmentId: '',
  });
  const [newAnnouncementData, setNewAnnouncementData] = useState({
    name: '', content: '', departmentId: '',
  });
  const [newAttachmentData, setNewAttachmentData] = useState({
    name: '', file: null, departmentId: '',
  });
  const [editingItem, setEditingItem] = useState(null);
  const [showEditItemModal, setShowEditItemModal] = useState(false);


  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (currentUserRole === 'user' && task.departmentId && task.departmentId !== currentUserDepartmentId) {
        return false;
      }
      if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterDepartment && task.departmentId !== filterDepartment) {
        return false;
      }
      if (filterStatus !== 'all' && task.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [tasks, searchTerm, filterDepartment, filterStatus, currentUserRole, currentUserDepartmentId]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(announcement => {
      if (currentUserRole === 'user' && announcement.departmentId && announcement.departmentId !== currentUserDepartmentId) {
        return false;
      }
      if (searchTerm &&
        (!announcement.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
         !announcement.content.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        return false;
      }
      if (filterDepartment && announcement.departmentId !== filterDepartment) {
        return false;
      }
      return true;
    });
  }, [announcements, searchTerm, filterDepartment, currentUserRole, currentUserDepartmentId]);

  const filteredAttachments = useMemo(() => {
    return attachments.filter(attachment => {
      if (currentUserRole === 'user' && attachment.departmentId && attachment.departmentId !== currentUserDepartmentId) {
        return false;
      }
      if (searchTerm && !attachment.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterDepartment && attachment.departmentId !== filterDepartment) {
        return false;
      }
      return true;
    });
  }, [attachments, searchTerm, filterDepartment, currentUserRole, currentUserDepartmentId]);


  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'Global';
    return departments.find(dept => dept.id === departmentId)?.name || 'N/A';
  };

  const getUsername = (userId) => {
    return users.find(user => user.id === userId)?.username || 'N/A';
  };


  const handleOpenAddItemModal = (type) => {
    setItemTypeToAdd(type);
    const defaultDepartmentId = currentUserRole === 'user' && currentUserDepartmentId
                                ? currentUserDepartmentId
                                : (departments.length > 0 ? departments[0].id : '');

    setNewTaskData({ name: '', status: 'Pending', assignedTo: '', dueDate: '', departmentId: defaultDepartmentId });
    setNewAnnouncementData({ name: '', content: '', departmentId: defaultDepartmentId });
    setNewAttachmentData({ name: '', file: null, departmentId: defaultDepartmentId });

    setShowAddItemModal(true);
  };

  const handleCloseAddItemModal = () => {
    setShowAddItemModal(false);
    setNewTaskData({ name: '', status: 'Pending', assignedTo: '', dueDate: '', departmentId: '' });
    setNewAnnouncementData({ name: '', content: '', departmentId: '' });
    setNewAttachmentData({ name: '', file: null, departmentId: '' });
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewAnnouncementChange = (e) => {
    const { name, value } = e.target;
    setNewAnnouncementData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewAttachmentChange = (e) => {
    const { name, value } = e.target;
    setNewAttachmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewAttachmentData(prev => ({ ...prev, file: e.target.files[0] }));
  };


  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskData.name) { alert('Task name is required.'); return; }
    if (!newTaskData.departmentId && currentUserRole === 'admin') { alert('Please select a department for the task.'); return; }
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          name: newTaskData.name, status: newTaskData.status, assignedTo: newTaskData.assignedTo || null,
          dueDate: newTaskData.dueDate || null, departmentId: newTaskData.departmentId || null,
        }),
      });
      if (response.ok) { alert('Task added successfully!'); handleCloseAddItemModal(); refreshData(); }
      else { const errorData = await response.json(); console.error('Failed to add task (backend response):', errorData); alert('Failed to add task: ' + (errorData.message || 'Unknown error')); }
    } catch (error) { console.error('Error adding task (frontend network/parsing error):', error); alert('An error occurred while adding task. Check console for details.'); }
  };

  const handleAddAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!newAnnouncementData.name || !newAnnouncementData.content) { alert('Announcement title and content are required.'); return; }
    if (!newAnnouncementData.departmentId && newAnnouncementData.departmentId !== 'null') { alert('Please select a department for the announcement (or Global).'); return; }
    try {
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          name: newAnnouncementData.name, content: newAnnouncementData.content,
          departmentId: newAnnouncementData.departmentId === 'null' ? null : newAnnouncementData.departmentId
        }),
      });
      if (response.ok) { alert('Announcement added successfully!'); handleCloseAddItemModal(); refreshData(); }
      else { const errorData = await response.json(); console.error('Failed to add announcement (backend response):', errorData); alert('Failed to add announcement: ' + (errorData.message || 'Unknown error')); }
    } catch (error) { console.error('Error adding announcement (frontend network/parsing error):', error); alert('An error occurred while adding announcement. Check console for details.'); }
  };

  const handleAddAttachmentSubmit = async (e) => {
    e.preventDefault();
    if (!newAttachmentData.file) { alert('Please select a file to upload.'); return; }
    if (!newAttachmentData.departmentId) { alert('Please select a department for the attachment.'); return; }
    const formData = new FormData();
    formData.append('file', newAttachmentData.file);
    try {
      const uploadResponse = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData, });
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json(); console.error('File upload failed (backend response):', errorData);
        throw new Error('File upload failed: ' + (errorData.message || 'Unknown error'));
      }
      const uploadResult = await uploadResponse.json();
      const attachmentRecord = {
        name: newAttachmentData.name || uploadResult.fileName, fileUrl: uploadResult.filePath,
        departmentId: newAttachmentData.departmentId,
      };
      const createAttachmentResponse = await fetch('http://localhost:5000/api/attachments', {
        method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify(attachmentRecord),
      });
      if (createAttachmentResponse.ok) { alert('Attachment added successfully!'); handleCloseAddItemModal(); refreshData(); }
      else {
        const errorData = await createAttachmentResponse.json(); console.error('Failed to create attachment record (backend response):', errorData);
        throw new Error('Failed to create attachment record: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) { console.error('Error adding attachment (frontend network/parsing error):', error); alert('An error occurred while adding attachment: ' + error.message); }
  };

  const handleOpenEditItemModal = (item, type) => {
    setEditingItem({ ...item }); setItemTypeToAdd(type); setShowEditItemModal(true);
  };
  const handleCloseEditItemModal = () => {
    setShowEditItemModal(false); setEditingItem(null);
  };
  const handleEditingItemChange = (e) => {
    const { name, value } = e.target; setEditingItem(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem.name) { alert('Task name is required.'); return; }
    if (!editingItem.departmentId && currentUserRole === 'admin') { alert('Please select a department for the task.'); return; }
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${editingItem.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          name: editingItem.name, status: editingItem.status, assignedTo: editingItem.assignedTo || null,
          dueDate: editingItem.dueDate || null, departmentId: editingItem.departmentId || null,
        }),
      });
      if (response.ok) { alert('Task updated successfully!'); handleCloseEditItemModal(); refreshData(); }
      else { const errorData = await response.json(); console.error('Failed to update task (backend response):', errorData); alert('Failed to update task: ' + (errorData.message || 'Unknown error')); }
    } catch (error) { console.error('Error updating task (frontend network/parsing error):', error); alert('An error occurred while updating task. Check console for details.'); }
  };

  const handleUpdateAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem.name || !editingItem.content) { alert('Announcement title and content are required.'); return; }
    if (!editingItem.departmentId && editingItem.departmentId !== 'null') { alert('Please select a department for the announcement (or Global).'); return; }
    try {
      const response = await fetch(`http://localhost:5000/api/announcements/${editingItem.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          name: editingItem.name, content: editingItem.content,
          departmentId: editingItem.departmentId === 'null' ? null : editingItem.departmentId
        }),
      });
      if (response.ok) { alert('Announcement updated successfully!'); handleCloseEditItemModal(); refreshData(); }
      else { const errorData = await response.json(); console.error('Failed to update announcement (backend response):', errorData); alert('Failed to update announcement: ' + (errorData.message || 'Unknown error')); }
    } catch (error) { console.error('Error updating announcement (frontend network/parsing error):', error); alert('An error occurred while updating announcement. Check console for details.'); }
  };

  const handleUpdateAttachmentSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem.name) { alert('Attachment name is required.'); return; }
    if (!editingItem.departmentId) { alert('Please select a department for the attachment.'); return; }
    try {
      const response = await fetch(`http://localhost:5000/api/attachments/${editingItem.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ name: editingItem.name, departmentId: editingItem.departmentId }),
      });
      if (response.ok) { alert('Attachment updated successfully!'); handleCloseEditItemModal(); refreshData(); }
      else { const errorData = await response.json(); console.error('Failed to update attachment (backend response):', errorData); alert('Failed to update attachment: ' + (errorData.message || 'Unknown error')); }
    } catch (error) { console.error('Error updating attachment (frontend network/parsing error):', error); alert('An error occurred while updating attachment. Check console for details.'); }
  };

  const handleDeleteItem = async (itemId, itemType, itemName) => {
    if (window.confirm(`Are you sure you want to delete this ${itemType} (${itemName})?`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/${itemType}s/${itemId}`, { method: 'DELETE', });
        if (response.ok) { alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`); refreshData(); }
        else { const errorData = await response.json(); console.error(`Failed to delete ${itemType} (backend response):`, errorData); alert(`Failed to delete ${itemType}: ` + (errorData.message || 'Unknown error')); }
      } catch (error) { console.error(`Error deleting ${itemType} (frontend network/parsing error):`, error); alert(`An error occurred while deleting ${itemType}. Check console for details.`); }
    }
  };


  return (
    <div className="main-content-container">
      <h2>Main Content Dashboard</h2>
      <p>
        Welcome, {currentUserRole === 'admin' ? 'Admin' : getUsername(users.find(u => u.username === sessionStorage.getItem('loggedInUsername'))?.id || '')}
        {currentUserRole === 'user' && currentUserDepartmentId &&
          ` (Department: ${getDepartmentName(currentUserDepartmentId)})`
        }
      </p>

      <div className="filter-controls">
        <input type="text" placeholder="Search by name/content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setFilterStatus('all'); }} className="filter-select">
          <option value="all">All Items</option> <option value="task">Tasks</option>
          <option value="announcement">Announcements</option> <option value="attachment">Attachments</option>
        </select>
        <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="filter-select">
          <option value="">All Departments</option>
          {departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
        </select>
        {filterType === 'task' && (
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="all">All Statuses</option> <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option> <option value="Completed">Completed</option>
          </select>
        )}
        {currentUserRole === 'admin' && (<button className="add-item-button" onClick={() => handleOpenAddItemModal('task')}>Add New Item</button>)}
      </div>

      <div className="item-lists">
        {(filterType === 'all' || filterType === 'task') && (
          <div className="item-section">
            <h4>Tasks ({filteredTasks.length})</h4>
            {filteredTasks.length === 0 ? (<p>No tasks found matching your criteria.</p>) : (
              <ul>
                {filteredTasks.map(task => (
                  <li key={task.id}>
                    <strong>{task.name}</strong> (Status: {task.status})
                    {task.assignedTo && ` - Assigned to: ${getUsername(task.assignedTo)}`}
                    {task.dueDate && ` - Due: ${task.dueDate}`}
                    {task.departmentId && ` - Dept: ${getDepartmentName(task.departmentId)}`}
                    {currentUserRole === 'admin' && (
                      <div className="item-actions">
                        <button className="edit-button" onClick={() => handleOpenEditItemModal(task, 'task')}>Edit</button>
                        <button className="delete-button" onClick={() => handleDeleteItem(task.id, 'task', task.name)}>Delete</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(filterType === 'all' || filterType === 'announcement') && (
          <div className="item-section">
            <h4>Announcements ({filteredAnnouncements.length})</h4>
            {filteredAnnouncements.length === 0 ? (<p>No announcements found matching your criteria.</p>) : (
              <ul>
                {filteredAnnouncements.map(announcement => (
                  <li key={announcement.id}>
                    <strong>{announcement.name}</strong> -{' '}
                    {announcement.content.substring(0, 70)}... (Posted: {new Date(announcement.postedAt).toLocaleDateString()})
                    {announcement.departmentId && ` - Dept: ${getDepartmentName(announcement.departmentId)}`}
                    {!announcement.departmentId && ` - Dept: Global`}
                    {currentUserRole === 'admin' && (
                      <div className="item-actions">
                        <button className="edit-button" onClick={() => handleOpenEditItemModal(announcement, 'announcement')}>Edit</button>
                        <button className="delete-button" onClick={() => handleDeleteItem(announcement.id, 'announcement', announcement.name)}>Delete</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(filterType === 'all' || filterType === 'attachment') && (
          <div className="item-section">
            <h4>Attachments ({filteredAttachments.length})</h4>
            {filteredAttachments.length === 0 ? (<p>No attachments found matching your criteria.</p>) : (
              <ul>
                {filteredAttachments.map(attachment => (
                  <li key={attachment.id}>
                    <strong>{attachment.name}</strong> (Posted: {new Date(attachment.postedAt).toLocaleDateString()})
                    {attachment.departmentId && ` - Dept: ${getDepartmentName(attachment.departmentId)}`}
                    <a href={`http://localhost:5000${attachment.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px', color: '#61dafb' }}>Download</a>
                    {currentUserRole === 'admin' && (
                      <div className="item-actions">
                        <button className="edit-button" onClick={() => handleOpenEditItemModal(attachment, 'attachment')}>Edit</button>
                        <button className="delete-button" onClick={() => handleDeleteItem(attachment.id, 'attachment', attachment.name)}>Delete</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {showAddItemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New {itemTypeToAdd.charAt(0).toUpperCase() + itemTypeToAdd.slice(1)}</h3>
            <div className="item-type-selector">
                <button className={itemTypeToAdd === 'task' ? 'active' : ''} onClick={() => setItemTypeToAdd('task')}>Task</button>
                <button className={itemTypeToAdd === 'announcement' ? 'active' : ''} onClick={() => setItemTypeToAdd('announcement')}>Announcement</button>
                <button className={itemTypeToAdd === 'attachment' ? 'active' : ''} onClick={() => setItemTypeToAdd('attachment')}>Attachment</button>
            </div>
            {itemTypeToAdd === 'task' && (
              <form className="item-form" onSubmit={handleAddTaskSubmit}>
                <div className="form-group"><label htmlFor="taskName">Task Name:</label><input type="text" id="taskName" name="name" value={newTaskData.name} onChange={handleNewTaskChange} required /></div>
                <div className="form-group"><label htmlFor="taskStatus">Status:</label><select id="taskStatus" name="status" value={newTaskData.status} onChange={handleNewTaskChange}><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select></div>
                <div className="form-group"><label htmlFor="taskAssignedTo">Assigned To:</label><select id="taskAssignedTo" name="assignedTo" value={newTaskData.assignedTo} onChange={handleNewTaskChange}><option value="">-- Select User (Optional) --</option>{users.map(user => (<option key={user.id} value={user.id}>{user.username} ({getDepartmentName(user.departmentId)})</option>))}</select></div>
                <div className="form-group"><label htmlFor="taskDueDate">Due Date:</label><input type="date" id="taskDueDate" name="dueDate" value={newTaskData.dueDate} onChange={handleNewTaskChange} /></div>
                <div className="form-group"><label htmlFor="taskDepartmentId">Department:</label><select id="taskDepartmentId" name="departmentId" value={newTaskData.departmentId} onChange={handleNewTaskChange} required><option value="">-- Select Department --</option>{departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select></div>
                <div className="form-actions"><button type="submit">Add Task</button><button type="button" onClick={handleCloseAddItemModal} className="cancel-button">Cancel</button></div>
              </form>
            )}
            {itemTypeToAdd === 'announcement' && (
              <form className="item-form" onSubmit={handleAddAnnouncementSubmit}>
                <div className="form-group"><label htmlFor="announcementName">Announcement Title:</label><input type="text" id="announcementName" name="name" value={newAnnouncementData.name} onChange={handleNewAnnouncementChange} required /></div>
                <div className="form-group"><label htmlFor="announcementContent">Content:</label><textarea id="announcementContent" name="content" value={newAnnouncementData.content} onChange={handleNewAnnouncementChange} rows="5" required></textarea></div>
                <div className="form-group"><label htmlFor="announcementDepartmentId">Department:</label><select id="announcementDepartmentId" name="departmentId" value={newAnnouncementData.departmentId} onChange={handleNewAnnouncementChange} required><option value="">-- Select Department --</option><option value="null">Global (All Departments)</option>{departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select></div>
                <div className="form-actions"><button type="submit">Add Announcement</button><button type="button" onClick={handleCloseAddItemModal} className="cancel-button">Cancel</button></div>
              </form>
            )}
            {itemTypeToAdd === 'attachment' && (
              <form className="item-form" onSubmit={handleAddAttachmentSubmit}>
                <div className="form-group"><label htmlFor="attachmentName">Attachment Name:</label><input type="text" id="attachmentName" name="name" value={newAttachmentData.name} onChange={handleNewAttachmentChange} placeholder="Optional: Enter a display name" /></div>
                <div className="form-group"><label htmlFor="attachmentFile">Select File:</label><input type="file" id="attachmentFile" name="file" onChange={handleFileChange} required /></div>
                <div className="form-group"><label htmlFor="attachmentDepartmentId">Department:</label><select id="attachmentDepartmentId" name="departmentId" value={newAttachmentData.departmentId} onChange={handleNewAttachmentChange} required><option value="">-- Select Department --</option>{departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select></div>
                <div className="form-actions"><button type="submit">Upload Attachment</button><button type="button" onClick={handleCloseAddItemModal} className="cancel-button">Cancel</button></div>
              </form>
            )}
          </div>
        </div>
      )}

      {showEditItemModal && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit {itemTypeToAdd.charAt(0).toUpperCase() + itemTypeToAdd.slice(1)}</h3>
            {itemTypeToAdd === 'task' && (
              <form className="item-form" onSubmit={handleUpdateTaskSubmit}>
                <div className="form-group"><label htmlFor="editTaskName">Task Name:</label><input type="text" id="editTaskName" name="name" value={editingItem.name} onChange={handleEditingItemChange} required /></div>
                <div className="form-group"><label htmlFor="editTaskStatus">Status:</label><select id="editTaskStatus" name="status" value={editingItem.status} onChange={handleEditingItemChange}><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select></div>
                <div className="form-group"><label htmlFor="editTaskAssignedTo">Assigned To:</label><select id="editTaskAssignedTo" name="assignedTo" value={editingItem.assignedTo || ''} onChange={handleEditingItemChange}><option value="">-- Select User (Optional) --</option>{users.map(user => (<option key={user.id} value={user.id}>{user.username} ({getDepartmentName(user.departmentId)})</option>))}</select></div>
                <div className="form-group"><label htmlFor="editTaskDueDate">Due Date:</label><input type="date" id="editTaskDueDate" name="dueDate" value={editingItem.dueDate || ''} onChange={handleEditingItemChange} /></div>
                <div className="form-group"><label htmlFor="editTaskDepartmentId">Department:</label><select id="editTaskDepartmentId" name="departmentId" value={editingItem.departmentId || ''} onChange={handleEditingItemChange} required><option value="">-- Select Department --</option>{departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select></div>
                <div className="form-actions"><button type="submit">Update Task</button><button type="button" onClick={handleCloseEditItemModal} className="cancel-button">Cancel</button></div>
              </form>
            )}
            {itemTypeToAdd === 'announcement' && (
              <form className="item-form" onSubmit={handleUpdateAnnouncementSubmit}>
                <div className="form-group"><label htmlFor="editAnnouncementName">Announcement Title:</label><input type="text" id="editAnnouncementName" name="name" value={editingItem.name} onChange={handleEditingItemChange} required /></div>
                <div className="form-group"><label htmlFor="editAnnouncementContent">Content:</label><textarea id="editAnnouncementContent" name="content" value={editingItem.content} onChange={handleEditingItemChange} rows="5" required></textarea></div>
                <div className="form-group"><label htmlFor="editAnnouncementDepartmentId">Department:</label><select id="editAnnouncementDepartmentId" name="departmentId" value={editingItem.departmentId === null ? 'null' : editingItem.departmentId} onChange={handleEditingItemChange} required><option value="">-- Select Department --</option><option value="null">Global (All Departments)</option>{departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select></div>
                <div className="form-actions"><button type="submit">Update Announcement</button><button type="button" onClick={handleCloseEditItemModal} className="cancel-button">Cancel</button></div>
              </form>
            )}
            {itemTypeToAdd === 'attachment' && (
              <form className="item-form" onSubmit={handleUpdateAttachmentSubmit}>
                <div className="form-group"><label htmlFor="editAttachmentName">Attachment Name:</label><input type="text" id="editAttachmentName" name="name" value={editingItem.name} onChange={handleEditingItemChange} required /></div>
                <div className="form-group"><label htmlFor="editAttachmentDepartmentId">Department:</label><select id="editAttachmentDepartmentId" name="departmentId" value={editingItem.departmentId} onChange={handleEditingItemChange} required><option value="">-- Select Department --</option>{departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select></div>
                <div className="form-actions"><button type="submit">Update Attachment</button><button type="button" onClick={handleCloseEditItemModal} className="cancel-button">Cancel</button></div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MainContent;