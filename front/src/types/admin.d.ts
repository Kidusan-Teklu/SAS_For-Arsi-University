export interface AttendanceRecord {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'face' | 'biometric';
  status: 'present' | 'late';
}

export interface AdminStats {
  totalUsers: number;
  todayAttendance: number;
  recentRecords: AttendanceRecord[];
  deviceStatus: {
    facial: boolean;
    biometric: boolean;
  };
  users: User[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}