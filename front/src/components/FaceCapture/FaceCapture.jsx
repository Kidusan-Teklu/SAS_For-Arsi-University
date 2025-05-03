import React, { useRef, useState, useEffect } from 'react';
import './FaceCapture.css';

const FaceCapture = ({ onImageCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');

  // Start webcam stream when component mounts
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
          setError('');
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError('Could not access camera. Please check permissions and try again.');
        setIsStreaming(false);
      }
    };

    startWebcam();

    // Cleanup function to stop webcam stream when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Capture image from webcam
  const captureImage = () => {
    if (!isStreaming) {
      setError('Camera is not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to base64 image data
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Pass image data to parent component
      if (onImageCapture) {
        onImageCapture(imageData);
      }
    }
  };

  return (
    <div className="face-capture-container">
      <div className="video-container">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={() => setIsStreaming(true)}
        />
        {error && <div className="camera-error">{error}</div>}
      </div>

      <button 
        className="capture-button"
        onClick={captureImage}
        disabled={!isStreaming}
      >
        Capture Image
      </button>

      {/* Hidden canvas used for capturing still frame */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FaceCapture; 