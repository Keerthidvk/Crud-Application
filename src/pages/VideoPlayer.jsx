import React, { useRef, useEffect, useState } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ video, onClose }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ✅ Extract filename from video.path
  const fileName = video.path ? video.path.split('/').pop() : '';

  // ✅ Use your actual backend routes
  const videoSources = [
    `http://localhost:5000/api/videos/${fileName}`,  // Main streaming endpoint
    `http://localhost:5000/uploads/videos/${fileName}`       // Fallback direct static path
  ];

  // Reset states when video changes
  useEffect(() => {
    setError(null);
    setIsLoading(true);
    setCurrentSourceIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [video]);

  const handleError = () => {
    if (currentSourceIndex < videoSources.length - 1) {
      const nextIndex = currentSourceIndex + 1;
      setCurrentSourceIndex(nextIndex);
      setError(`Trying backup source ${nextIndex + 1}...`);

      if (videoRef.current) {
        videoRef.current.src = videoSources[nextIndex];
        videoRef.current.load();
      }
    } else {
      setError('Failed to load video from all available sources. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadVideo = () => {
    const link = document.createElement('a');
    link.href = videoSources[currentSourceIndex];
    link.download = fileName || 'video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="video-player-modal">
      <div className="video-player-header">
        <h3>{video.title}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="video-player-container">
        {isLoading && (
          <div className="video-loading">
            <div className="loading-spinner"></div>
            <p>Loading video...</p>
          </div>
        )}

        {error && (
          <div className="video-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}

        <div className={`video-wrapper ${error ? 'hidden' : ''}`}>
          <video
            ref={videoRef}
            controls
            preload="metadata"
            onError={handleError}
            onLoadStart={handleLoadStart}
            onLoadedData={handleLoadedData}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            playsInline
            autoPlay
            muted={false}
          >
            <source src={videoSources[currentSourceIndex]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Custom Controls */}
        <div className="custom-controls">
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="progress-bar"
            />
          </div>

          <div className="control-buttons">
            <button
              className="control-btn play-pause-btn"
              onClick={togglePlayPause}
              disabled={!!error}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <button
              className="control-btn download-btn"
              onClick={downloadVideo}
              title="Download video"
            >
              ⬇️
            </button>
          </div>
        </div>
      </div>

      <div className="video-details">
        <div className="detail-item">
          <strong>Description:</strong>
          <p>{video.description || 'No description available.'}</p>
        </div>
        <div className="details-grid">
          <div className="detail-item">
            <strong>Uploaded on:</strong>
            <span>{video.created_at ? new Date(video.created_at).toLocaleString() : 'N/A'}</span>
          </div>
          <div className="detail-item">
            <strong>File path:</strong>
            <span>{video.path}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
