import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './profile.css';
import Quiz from './Quiz';

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false); // Added quiz state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const fetchUser = useCallback(async (email) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await axios.get(`http://localhost:5000/api/users/user/${email}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      
      const user = Array.isArray(res.data) ? res.data[0] : res.data;
      setUserDetails(user || null);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      const errorMessage = error.response?.data?.message || 
                          'Failed to load user profile';
      setError(errorMessage);
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
    if (email) {
      fetchUser(email);
    }
    fetchVideos();
  }, [email, fetchUser, fetchVideos]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = (selectedVideo || showQuiz) ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedVideo, showQuiz]);

  const openEditModal = (user) => {
    if (user) {
      setFormData({ 
        username: user.username || '', 
        email: user.email || '' 
      });
      setIsModalOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!userDetails) return;

    // Validation
    if (!formData.username.trim()) {
      alert('Username is required');
      return;
    }

    if (!formData.email.trim()) {
      alert('Email is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/users/user/${userDetails.id}/single`,
        formData,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      alert('Profile updated successfully!');
      setIsModalOpen(false);
      fetchUser(formData.email);
    } catch (error) {
      console.error('Update failed:', error);
      const errorMessage = error.response?.data?.message || 
                          'Failed to update profile';
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

  const retryLoad = () => {
    if (email) {
      fetchUser(email);
    }
    fetchVideos();
  };

  if (loading) {
    return (
      <div className="profile-page loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error && !userDetails) {
    return (
      <div className="profile-page error">
        <div className="error-icon">⚠️</div>
        <h3>Failed to Load Profile</h3>
        <p>{error}</p>
        <button onClick={retryLoad} className="retry-btn">
          Try Again
        </button>
        <button onClick={logout} className="logout-btn">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <h1>Student Portal</h1>
          <div className="header-actions">
            <span className="welcome-text">
              Welcome, {userDetails?.username || 'Student'}
            </span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="profile-nav">
        <div className="nav-container">
          <button 
            className={`nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button 
            className={`nav-btn ${activeSection === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveSection('videos')}
          >
            <span className="nav-icon">🎬</span>
            Video Library
            <span className="badge">{videos.length}</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="profile-main">
        <div className="container">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Learning Dashboard</h2>
                <p>Track your progress and access learning materials</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-content">
                    <h3>Available Courses</h3>
                    <div className="stat-value">{videos.length}</div>
                    <p>Video courses</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <h3>Completed</h3>
                    <div className="stat-value">0</div>
                    <p>Lessons finished</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-content">
                    <h3>Study Time</h3>
                    <div className="stat-value">0.5h</div>
                    <p>This week</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <h3>Goals</h3>
                    <div className="stat-value">1/5</div>
                    <p>Goals achieved</p>
                  </div>
                </div>
              </div>

              <div className="content-grid">
                <div className="content-card recent-courses">
                  <h3>Available Courses</h3>
                  <div className="course-list">
                    {videos.slice(0, 3).map(video => (
                      <div key={video.id} className="course-item">
                        <span className="course-icon">🎬</span>
                        <div className="course-info">
                          <h4>{video.title}</h4>
                          <p>By: {video.uploaded_by_name || 'Unknown'}</p>
                        </div>
                        <button 
                          className="watch-btn small"
                          onClick={() => setSelectedVideo(video)}
                        >
                          Watch
                        </button>
                      </div>
                    ))}
                    {videos.length === 0 && (
                      <div className="no-courses">
                        <p>No courses available yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="content-card quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="actions-grid">
                    <button 
                      className="action-btn" 
                      onClick={() => setActiveSection('videos')}
                    >
                      <span className="action-icon">🎬</span>
                      Watch Videos
                    </button>
                    <button className="action-btn" disabled>
                      <span className="action-icon">📝</span>
                      View Assignments
                    </button>
                    <button className="action-btn" disabled>
                      <span className="action-icon">📊</span>
                      View Progress
                    </button>
                    <button 
                      className="action-btn" 
                      onClick={() => openEditModal(userDetails)}
                    >
                      <span className="action-icon">👤</span>
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Library Section */}
          {activeSection === 'videos' && (
            <div className="videos-section">
              <div className="section-header">
                <h2>Video Library</h2>
                <p>Access all available learning videos ({videos.length} videos)</p>
              </div>

              {videos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎬</div>
                  <h3>No Videos Available</h3>
                  <p>Check back later for new learning content.</p>
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
                            ▶ Play Video
                          </button>
                        </div>
                      </div>
                      
                      <div className="video-content">
                        <h3 className="video-title">{video.title}</h3>
                        {video.description && (
                          <p className="video-description">{video.description}</p>
                        )}
                        <div className="video-meta">
                          <div className="meta-item">
                            <span className="meta-label">Instructor:</span>
                            <span className="meta-value">{video.uploaded_by_name || 'Unknown'}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Duration:</span>
                            <span className="meta-value">-</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Uploaded:</span>
                            <span className="meta-value">{formatDate(video.created_at)}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Size:</span>
                            <span className="meta-value">{formatFileSize(video.file_size)}</span>
                          </div>
                        </div>
                        <button 
                          className="watch-btn"
                          onClick={() => setSelectedVideo(video)}
                        >
                          ▶ Watch Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button 
                className="close-btn" 
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  id="username"
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email"
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn primary">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal with Quiz Button */}
      {selectedVideo && (
        <div className="modal-overlay video-modal-overlay" onClick={() => setSelectedVideo(null)}>
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
                className="video-player"
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
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Instructor:</strong>
                  <span>{selectedVideo.uploaded_by_name || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <strong>Uploaded:</strong>
                  <span>{formatDate(selectedVideo.created_at)}</span>
                </div>
                <div className="detail-item">
                  <strong>File Size:</strong>
                  <span>{formatFileSize(selectedVideo.file_size)}</span>
                </div>
              </div>

              {/* QUIZ BUTTON FOR STUDENTS */}
              <div className="quiz-action-section">
                <button
                  className="quiz-btn"
                  onClick={() => setShowQuiz(true)}
                >
                  🧩 Take Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal for Students */}
      {showQuiz && selectedVideo && (
        <div className="modal-overlay" onClick={() => setShowQuiz(false)}>
          <div className="modal-content quiz-modal" onClick={(e) => e.stopPropagation()}>
            <Quiz 
              videoId={selectedVideo.id} 
              selectedVideo={selectedVideo} 
              userDetails={userDetails}
              onClose={() => setShowQuiz(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;