import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './Common.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState('home');
  const [videoRefresh, setVideoRefresh] = useState(0);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null,
    showForm: false
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await axios.get('http://localhost:5000/api/users/users/', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || 
                          'Failed to load users';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/videos', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      setVideos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setVideos([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    if (view === 'videos') {
      fetchVideos();
    }
  }, [view, videoRefresh, fetchUsers, fetchVideos]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = (selectedUser || selectedVideo) ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedUser, selectedVideo]);

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
    
      await axios.put(`http://localhost:5000/api/users/user/${id}/toggle`);
       
setUsers(prevUsers =>
  prevUsers.map(user =>
    user.id === id
      ? { ...user, is_active: user.is_active ? 0 : 1 }
      : user
  )
);

    } catch (error) {
      console.error('Toggle status failed:', error);
      const errorMessage = error.response?.data?.message || 
                          'Could not toggle user status';
      alert(errorMessage);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Delete user failed:', error);
      const errorMessage = error.response?.data?.message || 
                          'Could not delete user';
      alert(errorMessage);
    }
  };

  const updateUser = async (id, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/user/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      alert('User updated successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Update failed:', err);
      const errorMessage = err.response?.data?.message || 
                          'Failed to update user';
      alert(errorMessage);
    }
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    const { id, username, email, role } = selectedUser;
    
    if (!username.trim() || !email.trim()) {
      alert('Username and email are required');
      return;
    }

    const updatedData = { username: username.trim(), email: email.trim(), role };
    updateUser(id, updatedData);
    setSelectedUser(null);
  };

  // Video upload functions
  const handleUploadInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      alert('Please select a valid video file (MP4, AVI, MOV, WMV, or WebM)');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (selectedFile && selectedFile.size > maxSize) {
      alert('File size must be less than 500MB');
      return;
    }

    setUploadForm(prev => ({ ...prev, file: selectedFile }));
  };

  const uploadVideo = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title.trim()) {
      alert('Please provide a title and select a video file');
      return;
    }

    if (uploadForm.title.trim().length < 3) {
      alert('Title must be at least 3 characters long');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('video', uploadForm.file);
    uploadData.append('title', uploadForm.title.trim());
    uploadData.append('description', uploadForm.description.trim());

    try {
      setUploading(true);
      setProgress(0);
      
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/videos/upload', uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
        timeout: 300000 // 5 minutes timeout
      });

      alert('Video uploaded successfully!');
      setUploadForm({ 
        title: '', 
        description: '', 
        file: null,
        showForm: false 
      });
      setProgress(0);
      setVideoRefresh(prev => prev + 1);
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Video upload failed';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      alert('Video deleted successfully');
      setVideoRefresh(prev => prev + 1);
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error.response?.data?.message || 
                          'Failed to delete video';
      alert(errorMessage);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  // Filter users
  const managers = users.filter(u => u.role === 'manager');
  const students = users.filter(u => u.role !== 'manager');

  // Get user role
  const userRole = localStorage.getItem('role');

  // Grid cards
  const homeCards = [
    { title: 'Manage Students', action: () => setView('students'), icon: '👨‍🎓' },
    { title: 'Manage Faculty', action: () => setView('faculty'), icon: '👨‍🏫' },
    { title: 'Video Library', action: () => setView('videos'), icon: '🎬' },
    { title: 'Notes', action: () => alert('Notes feature coming soon!'), icon: '📝' },
    { title: 'Lessons', action: () => alert('Lessons feature coming soon!'), icon: '📚' },
    { title: 'Syllabus', action: () => alert('Syllabus feature coming soon!'), icon: '📋' }
  ];

  const retryLoad = () => {
    fetchUsers();
    if (view === 'videos') {
      fetchVideos();
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Smart Student Management System</h2>
        <div className="header-info">
          <span className="user-role">Role: {userRole}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {error && view === 'home' && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={retryLoad} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Conditional View */}
      {view === 'home' && (
        <div className="dashboard-grid">
          {homeCards.map((card, idx) => (
            <div key={idx} className="grid-card" onClick={card.action}>
              <div className="card-icon">{card.icon}</div>
              <div className="card-title">{card.title}</div>
            </div>
          ))}
        </div>
      )}

      {/* Faculty/Students View */}
      {(view === 'faculty' || view === 'students') && (
        <div className="content-section">
          <button className="back-btn" onClick={() => setView('home')}>
            ← Back to Home
          </button>
          <h3 className="section-title">
            {view === 'faculty' ? 'Faculty Members' : 'Students'}
          </h3>
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (view === 'faculty' ? managers : students).length === 0 ? (
            <p className="no-data">
              No {view === 'faculty' ? 'faculty members' : 'students'} found
            </p>
          ) : (
            <div className="users-list">
              {(view === 'faculty' ? managers : students).map(user => (
                <div key={user.id} className="user-item">
                  <div className="user-info">
                    <p><b>Username:</b> {user.username}</p>
                    <p><b>Email:</b> {user.email}</p>
                    <p>
                      <b>Status:</b> 
                      <span className={`status ${user.is_active ? 'inactive' : 'active'}`}>
                        {user.is_active ? 'Inactive' : 'Active'}
                      </span>
                    </p>
                  </div>
                  <div className="user-actions">
                    <button 
                      className={`status-btn ${user.is_active ? 'activate' : 'deactivate'}`}
                      onClick={() => toggleStatus(user.id)}
                    >
                      {user.is_active ? 'Activate' : 'Deactivate'}
                    </button>
                    <button 
                      className="edit-btn"
                      onClick={() => setSelectedUser({ ...user, isEditing: true })}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Videos View */}
      {view === 'videos' && (
        <div className="content-section">
          <button className="back-btn" onClick={() => setView('home')}>
            ← Back to Home
          </button>
          <div className="videos-section">
            <div className="section-header">
              <h3>Video Library</h3>
              {userRole === 'manager' && (
                <button 
                  className="upload-toggle-btn"
                  onClick={() => setUploadForm(prev => ({ ...prev, showForm: !prev.showForm }))}
                  disabled={uploading}
                >
                  {uploadForm.showForm ? 'Cancel Upload' : 'Upload Video'}
                </button>
              )}
            </div>

            {/* Upload Form (Faculty only) */}
            {userRole === 'manager' && uploadForm.showForm && (
              <div className="video-upload">
                <h4>Upload New Video</h4>
                <form onSubmit={uploadVideo} className="upload-form">
                  <div className="form-group">
                    <label htmlFor="upload-title">Title *</label>
                    <input
                      id="upload-title"
                      type="text"
                      name="title"
                      value={uploadForm.title}
                      onChange={handleUploadInputChange}
                      required
                      disabled={uploading}
                      placeholder="Enter video title"
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="upload-description">Description</label>
                    <textarea
                      id="upload-description"
                      name="description"
                      value={uploadForm.description}
                      onChange={handleUploadInputChange}
                      rows="3"
                      disabled={uploading}
                      placeholder="Enter video description (optional)"
                      maxLength={500}
                    />
                    <div className="char-count">
                      {uploadForm.description.length}/500
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="upload-file">Video File *</label>
                    <input
                      id="upload-file"
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      required
                      disabled={uploading}
                    />
                    {uploadForm.file && (
                      <div className="file-info">
                        <p><strong>Selected:</strong> {uploadForm.file.name}</p>
                        <p><strong>Size:</strong> {(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    )}
                    <small className="file-hint">
                      Supported formats: MP4, AVI, MOV, WMV, WebM (Max: 500MB)
                    </small>
                  </div>

                  {uploading && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        >
                          {progress}%
                        </div>
                      </div>
                      <p className="progress-text">Uploading... {progress}%</p>
                    </div>
                  )}

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      disabled={uploading}
                      className="upload-btn primary"
                    >
                      {uploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setUploadForm({ title: '', description: '', file: null, showForm: false })}
                      disabled={uploading}
                      className="cancel-btn secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Videos List */}
            <div className="video-list">
              {videos.length === 0 ? (
                <div className="no-videos">
                  <div className="no-videos-icon">🎬</div>
                  <h4>No videos available</h4>
                  <p>
                    {userRole === 'manager' 
                      ? 'Click "Upload Video" to add the first video.' 
                      : 'No videos available yet.'
                    }
                  </p>
                </div>
              ) : (
                <div className="videos-grid">
                  {videos.map(video => (
                    <div key={video.id} className="video-card">
                      <div className="video-thumbnail">
                        <div className="video-icon">🎬</div>
                        <div className="video-overlay">
                          <button 
                            className="play-btn"
                            onClick={() => setSelectedVideo(video)}
                          >
                            ▶ Play
                          </button>
                        </div>
                      </div>
                      
                      <div className="video-info">
                        <h4 className="video-title">{video.title}</h4>
                        {video.description && (
                          <p className="video-description">{video.description}</p>
                        )}
                        <div className="video-meta">
                          <div className="meta-item">
                            <span className="meta-label">By:</span>
                            <span className="meta-value">{video.uploaded_by_name || 'Unknown'}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Size:</span>
                            <span className="meta-value">{formatFileSize(video.file_size)}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Uploaded:</span>
                            <span className="meta-value">{formatDate(video.created_at)}</span>
                          </div>
                        </div>
                        
                        {userRole === 'manager' && (
                          <div className="video-actions">
                            <button 
                              className="delete-video-btn"
                              onClick={() => deleteVideo(video.id)}
                            >
                              Delete Video
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {selectedUser && (
        <div className="modal">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedUser.isEditing ? (
              <>
                <div className="modal-header">
                  <h3>Edit User</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setSelectedUser(null)}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleUpdateUser}>
                  <div className="form-group">
                    <label htmlFor="edit-username">Username:</label>
                    <input
                      id="edit-username"
                      type="text"
                      value={selectedUser.username}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, username: e.target.value })
                      }
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-email">Email:</label>
                    <input
                      id="edit-email"
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-role">Role:</label>
                    <select
                      id="edit-role"
                      value={selectedUser.role}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, role: e.target.value })
                      }
                    >
                      <option value="user">Student</option>
                      <option value="manager">Faculty</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="save-btn">
                      Update User
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedUser(null)} 
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <h3>User Details</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setSelectedUser(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="user-details">
                  <div className="detail-item">
                    <strong>Username:</strong>
                    <span>{selectedUser.username}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Role:</strong>
                    <span>{selectedUser.role}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status ${selectedUser.is_active ? 'active' : 'inactive'}`}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    onClick={() => setSelectedUser(null)} 
                    className="close-btn"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="modal">
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedVideo.title}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedVideo(null)}
              >
                ×
              </button>
            </div>
            <div className="video-player-container">
              <video 
                controls 
                autoPlay 
                style={{ width: '100%', maxHeight: '70vh' }}
                key={selectedVideo.id}
              >
                <source 
                  src={`http://localhost:5000/uploads/videos/${selectedVideo.filename}`} 
                  type="video/mp4" 
                />
                <source 
                  src={`http://localhost:5000/api/stream/${selectedVideo.filename}`} 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="video-details">
              {selectedVideo.description && (
                <div className="detail-item">
                  <strong>Description:</strong>
                  <p>{selectedVideo.description}</p>
                </div>
              )}
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Uploaded by:</strong>
                  <span>{selectedVideo.uploaded_by_name || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <strong>Uploaded on:</strong>
                  <span>{formatDate(selectedVideo.created_at)}</span>
                </div>
                <div className="detail-item">
                  <strong>File size:</strong>
                  <span>{formatFileSize(selectedVideo.file_size)}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setSelectedVideo(null)} 
                className="close-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;