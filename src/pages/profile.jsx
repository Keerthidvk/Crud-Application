import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './profile.css';

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [showProfile, setShowProfile] = useState(false); // for toggle display

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (email) {
      userDetail(email);
    }
  }, [email]);

  const userDetail = async (email) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/user/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = Array.isArray(res.data) ? res.data[0] : res.data;
      setUserDetails(user);
      setFormData({ username: user.username, email: user.email });
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/user/${userDetails.id}/single`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated successfully!');
      setIsEditing(false);
      userDetail(formData.email);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div>
      <h2>User Portal</h2>
      <button onClick={() => setShowProfile(!showProfile)}>
        {showProfile ? 'Hide Profile' : 'Show Profile'}
      </button>

      {showProfile && (
        userDetails ? (
          isEditing ? (
            <form className="profile-edit-form" onSubmit={handleUpdate}>
              <label>
                Username:
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </label>
              <button type="submit">Update</button>
              <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
          ) : (
            <div className="profile-info">
              <p><b>Username:</b> {userDetails.username}</p>
              <p><b>Email:</b> {userDetails.email}</p>
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={() => navigate('/')}>Go to Home</button>
            </div>
          )
        ) : (
          <p>Loading...</p>
        )
      )}
    </div>
  );
};

export default Profile;
