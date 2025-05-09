// Mock data for test users and fallback when API calls fail

export const mockAttendanceData = [
  { _id: '1', date: '2025-05-05', status: 'present', time_in: '08:30:00', time_out: '16:30:00' },
  { _id: '2', date: '2025-05-04', status: 'present', time_in: '08:25:00', time_out: '16:45:00' },
  { _id: '3', date: '2025-05-03', status: 'late', time_in: '09:15:00', time_out: '17:00:00' },
  { _id: '4', date: '2025-05-02', status: 'present', time_in: '08:30:00', time_out: '16:30:00' },
  { _id: '5', date: '2025-05-01', status: 'absent', time_in: null, time_out: null },
];

export const mockUserProfileData = {
  student: {
    id: 'student_001',
    name: 'Student User',
    email: 'test.student@example.com',
    role: 'student',
    department: 'Computer Science',
    student_id: 'CS2023001'
  },
  instructor: {
    id: 'instructor_001',
    name: 'Instructor User',
    email: 'test.instructor@example.com',
    role: 'instructor',
    department: 'Computer Science',
    employee_id: 'INS2023001'
  },
  admin: {
    id: 'admin_001',
    name: 'Admin User',
    email: 'test.admin@example.com',
    role: 'admin',
    department: 'IT',
    employee_id: 'ADM2023001'
  },
  employee: {
    id: 'employee_001',
    name: 'Employee User',
    email: 'test.employee@example.com',
    role: 'employee',
    department: 'HR',
    employee_id: 'EMP2023001'
  },
  department_head: {
    id: 'department_head_001',
    name: 'Department Head',
    email: 'test.department.head@example.com',
    role: 'department_head',
    department: 'Computer Science',
    employee_id: 'DH2023001'
  },
  hr_officer: {
    id: 'hr_officer_001',
    name: 'HR Officer',
    email: 'test.hr.officer@example.com',
    role: 'hr_officer',
    department: 'Human Resources',
    employee_id: 'HR2023001'
  },
  finance_officer: {
    id: 'finance_officer_001',
    name: 'Finance Officer',
    email: 'test.finance.officer@example.com',
    role: 'finance_officer',
    department: 'Finance',
    employee_id: 'FO2023001'
  },
  administrative_officer: {
    id: 'administrative_officer_001',
    name: 'Administrative Officer',
    email: 'test.administrative.officer@example.com',
    role: 'administrative_officer',
    department: 'Administration',
    employee_id: 'AO2023001'
  }
};

export const mockDashboardStats = {
  totalAttendance: 30,
  presentCount: 25,
  absentCount: 3,
  lateCount: 2
};

export const mockUserList = [
  { _id: 'user_001', name: 'John Doe', email: 'john@example.com', role: 'student', department: 'Computer Science' },
  { _id: 'user_002', name: 'Jane Smith', email: 'jane@example.com', role: 'instructor', department: 'Computer Science' },
  { _id: 'user_003', name: 'Robert Brown', email: 'robert@example.com', role: 'employee', department: 'HR' },
  { _id: 'user_004', name: 'Alice Johnson', email: 'alice@example.com', role: 'department_head', department: 'Mathematics' },
  { _id: 'user_005', name: 'Michael Wilson', email: 'michael@example.com', role: 'admin', department: 'IT' }
];

export const getMockUserProfile = (role) => {
  const normalizedRole = role.toLowerCase();
  if (mockUserProfileData[normalizedRole]) {
    return mockUserProfileData[normalizedRole];
  }
  // Default to admin if role not found
  return mockUserProfileData.admin;
}; 