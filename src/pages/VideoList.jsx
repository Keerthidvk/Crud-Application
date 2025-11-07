import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Quiz from './Quiz';
import './VideoList.css';

const VideoList = ({ userRole, refresh }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // Helper functions
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Fetch videos from backend
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const res = await axios.get('http://localhost:5000/api/videos', {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
        timeout: 10000
      });

      setVideos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load videos';
      setError(msg);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos, refresh]);

  // Delete video handler
  const deleteVideo = async (videoId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Video deleted successfully');
      setDeleteConfirm(null);
      fetchVideos();
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete video';
      alert(errorMessage);
    }
  };

  const confirmDelete = (video) => setDeleteConfirm(video);
  const cancelDelete = () => setDeleteConfirm(null);

  // Rendering states
  if (loading) {
    return (
      <div className="video-list loading">
        <div className="loading-spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-list error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={fetchVideos} className="retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="video-list">
      <div className="video-list-header">
        <h3>{userRole === 'manager' ? 'Manage Videos' : 'Available Videos'}</h3>
        <div className="video-count">{videos.length} video{videos.length !== 1 ? 's' : ''}</div>
      </div>

      {/* videos grid */}
      <div className="videos-grid">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <div className="video-thumbnail">
              <div className="video-icon">🎬</div>
              <div className="video-overlay">
                <button className="play-btn" onClick={() => setSelectedVideo(video)}>▶ Play</button>
              </div>
            </div>
            <div className="video-info">
              <h4 className="video-title">{video.title}</h4>
              <p className="video-description">{video.description}</p>
              <div className="video-actions">
                {userRole === 'manager' && (
                  <button className="delete-btn" onClick={() => confirmDelete(video)}>Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the video "<strong>{deleteConfirm.title}</strong>"?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn danger" onClick={() => deleteVideo(deleteConfirm.id)}>Delete</button>
              <button className="btn secondary" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Video player modal */}
      {selectedVideo && (
        <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="modal-content video-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedVideo.title}</h3>
              <button className="close-btn" onClick={() => setSelectedVideo(null)}>×</button>
            </div>
            <div className="video-player-container">
              <video controls autoPlay style={{ width: '100%', maxHeight: '70vh' }} key={selectedVideo.id}>
                <source
                  src={`http://localhost:5000/api/videos/stream/${selectedVideo.path.split('/').pop()}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="video-details">
              <div className="details-grid">
                <div className="detail-item"><strong>Uploaded on:</strong><span>{formatDate(selectedVideo.created_at)}</span></div>
                <div className="detail-item"><strong>File path:</strong><span>{selectedVideo.path}</span></div>
              </div>
              <div className="quiz-action">
                <button className="quiz-btn primary" onClick={() => setShowQuiz(true)}>🧩 Take Quiz</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz modal */}
      {showQuiz && selectedVideo && (
        <div className="modal-overlay" onClick={() => setShowQuiz(false)}>
          <div className="modal-content quiz-modal" onClick={e => e.stopPropagation()}>
            <Quiz videoId={selectedVideo.id} onClose={() => setShowQuiz(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;
