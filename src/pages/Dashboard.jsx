import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Common.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedUser]);

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/user/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Toggle status failed:', error);
      alert('Could not toggle user status');
    }
  };

  const deleteUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Delete user failed:', error);
      alert('Could not delete user');
    }
  };

  const updateUser = async (id, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/user/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User updated!');
      fetchUsers();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update user.');
    }
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    const { id, username, email, role } = selectedUser;
    const updatedData = { username, email, role };
    updateUser(id, updatedData);
    setSelectedUser(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const managers = users.filter(user => user.role === 'manager');
  const regularUsers = users.filter(user => user.role !== 'manager');

  return (
    <div>
      <div className="dashboard-header">
        <h2>Manager Dashboard</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <h3>Managers</h3>
      <ul>
        {managers.map(user => (
          <li key={user.id}>
            <div className="user-info">
              <p><b>Name:</b> {user.username}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Role:</b> {user.role}</p>
              <p><b>Status:</b> {user.is_active ? 'Inactive' : 'Active'}</p>
            </div>
            <div className="user-actions">
              <button className={`activate-deactivate ${user.is_active ? '' : 'inactive'}`} onClick={() => toggleStatus(user.id)}>
                {user.is_active ? 'Activate' : 'Deactivate'}
              </button>
              <button onClick={() => setSelectedUser(user)}>View</button>
              <button className="delete" onClick={() => deleteUser(user.id)}>Delete</button>
              <button onClick={() => setSelectedUser({ ...user, isEditing: true })}>Edit</button>
            </div>
          </li>
        ))}
      </ul>

      <h3>Users</h3>
      <ul>
        {regularUsers.map(user => (
          <li key={user.id}>
            <div className="user-info">
              <p><b>Name:</b> {user.username}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Role:</b> {user.role}</p>
              <p><b>Status:</b> {user.is_active ? 'Inactive' : 'Active'}</p>
            </div>
            <div className="user-actions">
              <button className={`activate-deactivate ${user.is_active ? '' : 'inactive'}`} onClick={() => toggleStatus(user.id)}>
                {user.is_active ? 'Activate' : 'Deactivate'}
              </button>
              <button onClick={() => setSelectedUser(user)}>View</button>
              <button className="delete" onClick={() => deleteUser(user.id)}>Delete</button>
              <button onClick={() => setSelectedUser({ ...user, isEditing: true })}>Edit</button>
            </div>
          </li>
        ))}
      </ul>

      {selectedUser && (
        <div className="modal">
          <div className="modal-content">
            {selectedUser.isEditing ? (
              <>
                <h3>Edit User</h3>
                <form onSubmit={handleUpdateUser}>
                  <label>
                    Username : 
                    <input
                      type="text"
                      value={selectedUser.username}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, username: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Email : 
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, email: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Role : 
                     <select
                      value={selectedUser.role}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, role: e.target.value })
                      }
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                    </select>
                  </label>
                  <button type="submit">Update</button>
                  <button type="button" onClick={() => setSelectedUser(null)}>
                    Cancel
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3>User Details</h3>
                <p><b>Username:</b> {selectedUser.username}</p>
                <p><b>Email:</b> {selectedUser.email}</p>
                <p><b>Role:</b> {selectedUser.role}</p>
                <p><b>Status:</b> {selectedUser.is_active ? 'Active' : 'Inactive'}</p>
                <button onClick={() => setSelectedUser(null)}>Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
