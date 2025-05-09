import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:8000/api';

// Test the health endpoint
const testHealth = async () => {
  try {
    console.log('Testing API health endpoint...');
    // Clear any existing authorization headers before health check
    delete axios.defaults.headers.common['Authorization'];
    
    const response = await axios.get(`${API_URL}/health/`, {
      headers: { 'Accept': 'application/json' }
    });
    console.log('Health check successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Health check failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Test login endpoint to get a token
const testLogin = async (email, password) => {
  try {
    console.log(`Testing API login with ${email}...`);
    // Clear any existing authorization headers before login
    delete axios.defaults.headers.common['Authorization'];
    
    const response = await axios.post(`${API_URL}/login/`, 
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    // Log response and verify token structure
    console.log('Login response received:', response.status);
    
    if (response.data.token) {
      try {
        // Log token details for debugging
        const token = response.data.token;
        console.log('Token received:', token.substring(0, 20) + '...');
        
        // Parse token (just for debugging)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload:', payload);
          
          // Check if token has required fields
          if (!payload.user_id) {
            console.warn('WARNING: Token payload does not contain a "user_id" field, but this may be ok with SimpleJWT');
          }
        }
        
        // Store token for future requests
        localStorage.setItem('token', token);
        // Also store refresh token if available
        if (response.data.refresh) {
          localStorage.setItem('refreshToken', response.data.refresh);
        }
        
        // Set the Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set with token');
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    } else {
      console.warn('No token received in login response!');
    }
    
    console.log('Login successful for user:', response.data.user);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Test user listing endpoint - which requires authentication
const testUserList = async () => {
  try {
    console.log('Testing API users endpoint...');
    
    // Get token from storage
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found in localStorage. Login first before accessing protected endpoints.');
      return { success: false, error: "No authentication token found" };
    }
    
    // Verify the token is set in axios defaults
    const currentAuthHeader = axios.defaults.headers.common['Authorization'];
    console.log('Current Authorization header:', currentAuthHeader);
    
    if (!currentAuthHeader && token) {
      console.log('Setting Authorization header from localStorage');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Make request with explicit headers to ensure token is included
    const response = await axios.get(`${API_URL}/users/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('User list fetch successful. Found', response.data.length, 'users');
    return { success: true, count: response.data.length, users: response.data.slice(0, 3) };
  } catch (error) {
    console.error('User list fetch failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Run the tests in the correct order (login first to get token, then test protected endpoints)
const runTests = async () => {
  console.log('STARTING API TESTS');
  console.log('==================');
  
  // First clear any stored tokens
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
  
  // Test health endpoint (should work without auth)
  const healthResult = await testHealth();
  
  // Test login to get a token
  const loginResult = await testLogin('admin@arsi.edu.et', 'admin123');
  
  // Test user list endpoint (requires auth token)
  const userListResult = await testUserList();
  
  console.log('\nTEST RESULTS SUMMARY');
  console.log('===================');
  console.log('Health Check:', healthResult.success ? 'PASS' : 'FAIL');
  console.log('Login Test:', loginResult.success ? 'PASS' : 'FAIL');
  console.log('User List:', userListResult.success ? 'PASS' : 'FAIL');
  
  return {
    health: healthResult,
    login: loginResult,
    userList: userListResult,
    allPassed: healthResult.success && loginResult.success && userListResult.success
  };
};

// Utility function to clear auth state
const clearAuth = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
  console.log('Authentication cleared');
  return { success: true };
};

// Export functions for use in browser console or other files
export { testHealth, testUserList, testLogin, runTests, clearAuth };

// Auto-run tests if file is loaded directly in browser
if (typeof window !== 'undefined' && window.runApiTests) {
  runTests().then(results => {
    console.log('Complete test results:', results);
  });
}

export default { testHealth, testUserList, testLogin, runTests, clearAuth }; 