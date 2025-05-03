import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';
import axios from 'axios';
import './ProfilePage.css';

const API_URL = 'http://localhost:8000/api';

export default function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Face recognition state
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [faceImages, setFaceImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // If we're using a test user (email starts with test. and ends with @example.com)
    if (currentUser && currentUser.email && 
        currentUser.email.startsWith('test.') && 
        currentUser.email.endsWith('@example.com')) {
      
      setProfile(currentUser);
      
      // Mock attendance data based on user role
      const mockAttendance = [
        { date: '2025-05-03', status: 'present', time_in: '08:30:00', time_out: '16:30:00' },
        { date: '2025-05-02', status: 'present', time_in: '08:25:00', time_out: '16:45:00' },
        { date: '2025-05-01', status: 'late', time_in: '09:15:00', time_out: '17:00:00' },
        { date: '2025-04-30', status: 'present', time_in: '08:30:00', time_out: '16:30:00' },
        { date: '2025-04-29', status: 'absent', time_in: null, time_out: null },
      ];
      
      // Add role-specific attendance data
      if (currentUser.role === 'instructor') {
        mockAttendance.push(
          { date: '2025-04-28', status: 'present', time_in: '08:15:00', time_out: '17:30:00' },
          { date: '2025-04-27', status: 'present', time_in: '08:20:00', time_out: '16:45:00' }
        );
      } else if (currentUser.role === 'student') {
        mockAttendance.push(
          { date: '2025-04-28', status: 'late', time_in: '09:20:00', time_out: '16:30:00' },
          { date: '2025-04-27', status: 'absent', time_in: null, time_out: null }
        );
        
        // Mock face images for student
        setFaceImages([
          {
            id: 'img1',
            url: 'https://randomuser.me/api/portraits/men/32.jpg',
            uploaded_at: '2025-04-15'
          }
        ]);
      } else if (currentUser.role === 'department_head' || currentUser.role === 'admin') {
        mockAttendance.push(
          { date: '2025-04-28', status: 'present', time_in: '08:00:00', time_out: '18:00:00' },
          { date: '2025-04-27', status: 'present', time_in: '08:05:00', time_out: '17:45:00' }
        );
      }
      
      setAttendance(mockAttendance);
      setLoading(false);
      return;
    }
    
    // Otherwise fetch data from API
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const profileResponse = await axios.get(`${API_URL}/user/profile/`);
        setProfile(profileResponse.data);
        
        // Fetch user attendance
        const attendanceResponse = await axios.get(`${API_URL}/attendance/user/${currentUser.id}/`);
        setAttendance(attendanceResponse.data);
        
        // If user is a student, fetch their face recognition images
        if (currentUser.role === 'student') {
          try {
            const faceImagesResponse = await axios.get(`${API_URL}/recognition/images/${currentUser.id}/`);
            setFaceImages(faceImagesResponse.data || []);
          } catch (faceErr) {
            console.error('Error fetching face images:', faceErr);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchProfileData();
    }
  }, [currentUser]);

  const handleChangePassword = (e) => {
    e.preventDefault();
    
    // Don't allow password change for test users
    if (currentUser && currentUser.email && 
        currentUser.email.startsWith('test.') && 
        currentUser.email.endsWith('@example.com')) {
      setPasswordMessage('Password cannot be changed for test users');
      return;
    }
    
    axios.post(`${API_URL}/user/change-password/`, {
      current_password: currentPassword,
      new_password: newPassword,
    })
      .then(response => {
        setPasswordMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
      })
      .catch(error => {
        setPasswordMessage('Error changing password. Please try again.');
        console.error('Error changing password:', error);
      });
  };

  // Function to get department based on role
  const getDepartmentForTestUser = () => {
    if (!currentUser || !currentUser.role) return 'Not Available';
    
    switch(currentUser.role) {
      case 'student':
      case 'instructor':
      case 'department_head':
        return 'Computer Science';
      case 'hr_officer':
        return 'Human Resources';
      case 'finance_officer':
        return 'Finance';
      case 'administrative_officer':
        return 'Administration';
      case 'admin':
        return 'IT';
      case 'employee':
        return 'HR';
      default:
        return 'Not Available';
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.match('image.*')) {
        setUploadStatus('Please select an image file (JPEG, PNG)');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      setUploadStatus('');
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage) {
      setUploadStatus('Please select an image first');
      return;
    }
    
    setUploadStatus('Uploading...');
    
    // For test users, just simulate upload
    if (currentUser.email.startsWith('test.') && currentUser.email.endsWith('@example.com')) {
      setTimeout(() => {
        const newImage = {
          id: `img${Date.now()}`,
          url: previewImage,
          uploaded_at: new Date().toISOString().split('T')[0]
        };
        
        setFaceImages([...faceImages, newImage]);
        setSelectedImage(null);
        setPreviewImage(null);
        setUploadStatus('Image uploaded successfully!');
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1500);
      
      return;
    }
    
    // Real API upload logic
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('user_id', currentUser.id);
      
      const response = await axios.post(`${API_URL}/recognition/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFaceImages([...faceImages, response.data]);
      setSelectedImage(null);
      setPreviewImage(null);
      setUploadStatus('Image uploaded successfully!');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadStatus('Failed to upload image. Please try again.');
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId) => {
    // For test users, just simulate deletion
    if (currentUser.email.startsWith('test.') && currentUser.email.endsWith('@example.com')) {
      setFaceImages(faceImages.filter(img => img.id !== imageId));
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/recognition/images/${imageId}/`);
      setFaceImages(faceImages.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Failed to delete image. Please try again.');
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="profile-container">
          <div className="loading">Loading profile data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="profile-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="profile-container">
        <h1>My Profile</h1>
        
        <div className="profile-card">
          <h2>Personal Information</h2>
          <div className="profile-details">
            <div className="profile-field">
              <span className="field-label">Name:</span>
              <span className="field-value">{currentUser?.name || profile?.name || 'Not available'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Email:</span>
              <span className="field-value">{currentUser?.email || profile?.email || 'Not available'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Role:</span>
              <span className="field-value">{currentUser?.role || profile?.role || 'Not available'}</span>
            </div>
            
            <div className="profile-field">
              <span className="field-label">Department:</span>
              <span className="field-value">
                {profile?.department || 
                  (currentUser?.email?.startsWith('test.') ? getDepartmentForTestUser() : 'Not available')}
              </span>
            </div>
            
            {currentUser?.role === 'student' && (
              <div className="profile-field">
                <span className="field-label">Student ID:</span>
                <span className="field-value">CS2023001</span>
              </div>
            )}
            
            {(currentUser?.role === 'instructor' || 
              currentUser?.role === 'employee' || 
              currentUser?.role === 'department_head' || 
              currentUser?.role === 'hr_officer' || 
              currentUser?.role === 'finance_officer' || 
              currentUser?.role === 'administrative_officer' || 
              currentUser?.role === 'admin') && (
              <div className="profile-field">
                <span className="field-label">Employee ID:</span>
                <span className="field-value">
                  {currentUser?.role === 'instructor' ? 'INS2023001' : 
                   currentUser?.role === 'department_head' ? 'DH2023001' : 
                   currentUser?.role === 'hr_officer' ? 'HR2023001' : 
                   currentUser?.role === 'finance_officer' ? 'FO2023001' : 
                   currentUser?.role === 'administrative_officer' ? 'AO2023001' : 
                   currentUser?.role === 'admin' ? 'ADM2023001' : 'EMP2023001'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Face Recognition section for students */}
        {currentUser?.role === 'student' && (
          <div className="profile-card">
            <h2>Face Recognition</h2>
            <p className="face-recognition-info">
              Upload clear photos of your face for attendance verification through face recognition.
              For best results, upload photos with good lighting and a neutral expression.
            </p>
            
            <div className="attendance-link">
              <Link to="/face-attendance" className="face-attendance-link">
                Mark attendance with face recognition
              </Link>
            </div>
            
            <div className="face-upload-section">
              <div className="upload-container">
                <input 
                  type="file" 
                  id="face-image" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  ref={fileInputRef}
                  className="file-input"
                />
                <label htmlFor="face-image" className="file-input-label">
                  Select Image
                </label>
                
                {previewImage && (
                  <div className="image-preview-container">
                    <img src={previewImage} alt="Preview" className="image-preview" />
                    <button className="upload-button" onClick={handleImageUpload}>
                      Upload Image
                    </button>
                  </div>
                )}
                
                {uploadStatus && (
                  <div className={`upload-status ${uploadStatus.includes('success') ? 'success' : uploadStatus.includes('Failed') || uploadStatus.includes('Please') ? 'error' : ''}`}>
                    {uploadStatus}
                  </div>
                )}
              </div>
              
              <div className="uploaded-images">
                <h3>Uploaded Images</h3>
                {faceImages.length > 0 ? (
                  <div className="image-gallery">
                    {faceImages.map(image => (
                      <div key={image.id} className="image-item">
                        <img src={image.url} alt="Face recognition" />
                        <div className="image-details">
                          <span>Uploaded: {image.uploaded_at}</span>
                          <button 
                            className="delete-image-btn"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No face images uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="profile-card">
          <h2>Recent Attendance</h2>
          <div className="attendance-records">
            {attendance.length > 0 ? (
              <div className="attendance-table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.slice(0, 5).map((record, index) => (
                      <tr key={index} className={`status-${record.status}`}>
                        <td>{record.date}</td>
                        <td>
                          <span className={`status-badge ${record.status}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td>{record.time_in || 'N/A'}</td>
                        <td>{record.time_out || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No attendance records found.</p>
            )}
          </div>
        </div>

        <div className="profile-card">
          <h2>Change Password</h2>
          {passwordMessage && <div className={passwordMessage.includes('Error') ? 'error-message' : 'success-message'}>{passwordMessage}</div>}
          <form className="password-form" onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="change-password-button">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
} 