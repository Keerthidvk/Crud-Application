import React, { useState } from 'react';
import axios from 'axios';
import './VideoUpload.css';

const VideoUpload = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    // Validate file type
    const allowedTypes = [
      'video/mp4', 
      'video/avi', 
      'video/mov', 
      'video/wmv', 
      'video/webm',
      'video/quicktime',
      'video/x-msvideo'
    ];
    
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      setError('Please select a valid video file (MP4, AVI, MOV, WMV, or WebM)');
      setFile(null);
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (selectedFile && selectedFile.size > maxSize) {
      setError('File size must be less than 500MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const validateForm = () => {
    if (!file) {
      setError('Please select a video file');
      return false;
    }

    if (!formData.title.trim()) {
      setError('Please provide a title for the video');
      return false;
    }

    if (formData.title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return false;
    }

    if (formData.title.trim().length > 100) {
      setError('Title must be less than 100 characters');
      return false;
    }

    if (formData.description.length > 500) {
      setError('Description must be less than 500 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const uploadData = new FormData();
    uploadData.append('video', file);
    uploadData.append('title', formData.title.trim());
    uploadData.append('description', formData.description.trim());

    try {
      setUploading(true);
      setProgress(0);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const res = await axios.post('http://localhost:5000/api/videos/upload', uploadData, {
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

      // Success
      alert('Video uploaded successfully!');
      resetForm();
      
      if (onUploadSuccess) {
        onUploadSuccess(res.data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      let errorMessage = 'Video upload failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'TIMEOUT_ERROR') {
        errorMessage = 'Upload timeout. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setFile(null);
    setError('');
    setProgress(0);
  };

  const removeFile = () => {
    setFile(null);
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="video-upload">
      <div className="upload-header">
        <h3>Upload New Video</h3>
        <p>Share your video content with students</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title" className="required">Video Title</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            disabled={uploading}
            placeholder="Enter a descriptive title for your video"
            maxLength={100}
          />
          <div className="char-count">
            {formData.title.length}/100
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            disabled={uploading}
            placeholder="Describe the content of your video (optional)"
            maxLength={500}
          />
          <div className="char-count">
            {formData.description.length}/500
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="video-file" className="required">Video File</label>
          
          <div 
            className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
              disabled={uploading}
              className="file-input"
            />
            
            <div className="drop-zone-content">
              {file ? (
                <div className="file-selected">
                  <div className="file-icon">🎬</div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                    <div className="file-type">{file.type}</div>
                  </div>
                  <button 
                    type="button" 
                    className="remove-file-btn"
                    onClick={removeFile}
                    disabled={uploading}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    <p>Drag and drop your video file here</p>
                    <p className="upload-subtext">or click to browse</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="file-hint">
            <p><strong>Supported formats:</strong> MP4, AVI, MOV, WMV, WebM</p>
            <p><strong>Maximum file size:</strong> 500MB</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="progress-header">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              Please don't close this window while uploading...
            </p>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={resetForm}
            disabled={uploading}
            className="cancel-btn secondary"
          >
            Clear All
          </button>
          <button 
            type="submit" 
            disabled={uploading || !file || !formData.title.trim()}
            className="upload-btn primary"
          >
            {uploading ? (
              <>
                <span className="uploading-spinner"></span>
                Uploading... {progress}%
              </>
            ) : (
              'Upload Video'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoUpload;