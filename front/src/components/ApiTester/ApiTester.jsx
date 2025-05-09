import React, { useState, useEffect } from 'react';
import { testHealth, testUserList, testLogin, runTests, clearAuth } from '../../apiTest';

const ApiTester = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('admin@arsi.edu.et');
  const [password, setPassword] = useState('admin123');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if we have a token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleRunAllTests = async () => {
    setLoading(true);
    try {
      const results = await runTests();
      setTestResults(results);
      setIsAuthenticated(!!localStorage.getItem('token'));
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRunHealthTest = async () => {
    setLoading(true);
    try {
      const result = await testHealth();
      setTestResults({ health: result });
    } catch (error) {
      setTestResults({ health: { success: false, error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleRunLoginTest = async () => {
    setLoading(true);
    try {
      const result = await testLogin(email, password);
      setTestResults({ login: result });
      setIsAuthenticated(result.success); // Update auth status based on login result
    } catch (error) {
      setTestResults({ login: { success: false, error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleRunUserListTest = async () => {
    setLoading(true);
    try {
      const result = await testUserList();
      setTestResults({ userList: result });
    } catch (error) {
      setTestResults({ userList: { success: false, error: error.message } });
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearAuth = () => {
    clearAuth();
    setIsAuthenticated(false);
    setTestResults(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Connection Tester</h1>
      <p>This tool helps verify if the frontend is properly connected to the backend API.</p>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px',
        backgroundColor: isAuthenticated ? '#e8f5e9' : '#fff3e0',
        borderRadius: '4px'
      }}>
        <h3>Authentication Status</h3>
        <p>
          {isAuthenticated 
            ? '✅ Authenticated - You have a valid token' 
            : '⚠️ Not authenticated - Login first to access protected endpoints'}
        </p>
        {isAuthenticated && (
          <button 
            onClick={handleClearAuth}
            style={{ padding: '5px 10px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Authentication
          </button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Login Credentials for Testing</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleRunAllTests} 
          disabled={loading}
          style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Run All Tests
        </button>
        <button 
          onClick={handleRunHealthTest} 
          disabled={loading}
          style={{ padding: '10px 15px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Test Health Endpoint
        </button>
        <button 
          onClick={handleRunLoginTest} 
          disabled={loading}
          style={{ padding: '10px 15px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Test Login Endpoint
        </button>
        <button 
          onClick={handleRunUserListTest} 
          disabled={loading}
          style={{ padding: '10px 15px', backgroundColor: isAuthenticated ? '#2196F3' : '#bdbdbd', color: 'white', border: 'none', borderRadius: '4px', cursor: loading || !isAuthenticated ? 'not-allowed' : 'pointer' }}
          title={isAuthenticated ? 'Test user listing' : 'Login first to access this protected endpoint'}
        >
          Test User List Endpoint
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Testing Flow</h3>
        <ol>
          <li>Test the health endpoint (should work without authentication)</li>
          <li>Login to get an authentication token</li>
          <li>Test protected endpoints like user listing (requires authentication)</li>
        </ol>
      </div>

      {loading && <p>Running tests...</p>}

      {testResults && !loading && (
        <div style={{ marginTop: '20px' }}>
          <h2>Test Results</h2>
          
          {testResults.health && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              backgroundColor: testResults.health.success ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px'
            }}>
              <h3>Health Check: {testResults.health.success ? 'PASS' : 'FAIL'}</h3>
              {testResults.health.success ? (
                <pre>{JSON.stringify(testResults.health.data, null, 2)}</pre>
              ) : (
                <p style={{ color: '#d32f2f' }}>Error: {JSON.stringify(testResults.health.error)}</p>
              )}
            </div>
          )}
          
          {testResults.login && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              backgroundColor: testResults.login.success ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px'
            }}>
              <h3>Login Test: {testResults.login.success ? 'PASS' : 'FAIL'}</h3>
              {testResults.login.success ? (
                <div>
                  <p>Successfully logged in as: {testResults.login.data.user.name}</p>
                  <p>User Role: {testResults.login.data.user.role}</p>
                  <p>JWT Token received: {testResults.login.data.token.substring(0, 20)}...</p>
                </div>
              ) : (
                <p style={{ color: '#d32f2f' }}>Error: {JSON.stringify(testResults.login.error)}</p>
              )}
            </div>
          )}
          
          {testResults.userList && (
            <div style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              backgroundColor: testResults.userList.success ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px'
            }}>
              <h3>User List: {testResults.userList.success ? 'PASS' : 'FAIL'}</h3>
              {testResults.userList.success ? (
                <p>Successfully retrieved {testResults.userList.count} users.</p>
              ) : (
                <div>
                  <p style={{ color: '#d32f2f' }}>Error: {JSON.stringify(testResults.userList.error)}</p>
                  {!isAuthenticated && (
                    <p style={{ color: '#ff9800' }}>
                      <strong>Hint:</strong> You need to login first to access this protected endpoint. 
                      Click the "Test Login Endpoint" button to get an authentication token.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {testResults.allPassed !== undefined && (
            <div style={{ 
              marginTop: '20px',
              padding: '15px', 
              backgroundColor: testResults.allPassed ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              Overall Result: {testResults.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}
            </div>
          )}
          
          {testResults.error && (
            <div style={{ 
              marginTop: '20px',
              padding: '15px', 
              backgroundColor: '#ffebee',
              borderRadius: '4px'
            }}>
              <h3>Error Running Tests</h3>
              <p style={{ color: '#d32f2f' }}>{testResults.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTester; 