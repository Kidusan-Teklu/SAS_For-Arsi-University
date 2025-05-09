import requests
import json
import sys

def test_profile():
    base_url = 'http://localhost:8000/api'
    
    # 1. Login to get a token
    print("\n1. Testing login...")
    try:
        login_data = {"email": "admin@arsi.edu.et", "password": "admin123"}
        response = requests.post(f"{base_url}/login/", json=login_data)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            login_response = response.json()
            token = login_response.get('token')
            
            if not token:
                print("Failed: No token in response")
                print(f"Full response: {login_response}")
                sys.exit(1)
            
            print(f"Token received (first 20 chars): {token[:20]}...")
            
            # 2. Test profile endpoint
            print("\n2. Testing user profile endpoint...")
            headers = {"Authorization": f"Bearer {token}"}
            
            response = requests.get(f"{base_url}/user/profile/", headers=headers)
            print(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                profile = response.json()
                print(f"Success! Profile data received.")
                print(f"User: {profile.get('name')}")
                print(f"Role: {profile.get('role')}")
                print(f"Department: {profile.get('department')}")
            else:
                print(f"Failed to access profile endpoint: {response.text}")
                
                # Try another endpoint to verify authentication is working
                print("\nTesting users endpoint for comparison...")
                response = requests.get(f"{base_url}/users/", headers=headers)
                print(f"Users endpoint status code: {response.status_code}")
                if response.status_code == 200:
                    print("Users endpoint works, but profile doesn't - suggests an issue with the profile endpoint")
                else:
                    print("Both endpoints fail - suggests an authentication issue")
        else:
            print(f"Login failed: {response.text}")
    
    except Exception as e:
        print(f"Error during profile test: {e}")

if __name__ == "__main__":
    test_profile() 