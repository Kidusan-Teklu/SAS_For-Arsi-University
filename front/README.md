# Smart Attendance System Frontend

This is the frontend for the Smart Attendance System (SAS) project.

## Setup

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd front
npm install
```

Or with yarn:

```bash
cd front
yarn install
```

3. Start the development server:

```bash
npm start
```

Or with yarn:

```bash
yarn start
```

The application will be available at http://localhost:3000

## Features

- Authentication (Login/Register)
- Dashboard with attendance statistics
- Attendance management
- Reports and analytics
- User management

## Technologies Used

- React.js
- React Router for navigation
- Axios for API requests
- CSS for styling (no UI framework used)
- React Icons for icons

## Backend Connection

The frontend is configured to connect to the backend at `http://localhost:8000`. If your backend is running on a different URL, update the `API_URL` constant in the following files:

- `src/context/AuthContext.jsx`
- `src/pages/Dashboard/Dashboard.jsx`
- `src/pages/Attendance/AttendancePage.jsx`
