
export interface AttendanceRecord {
    id: string;
    userId: string;
    timestamp: Date;
    type: 'face' | 'fingerprint';
    status: 'present' | 'late' | 'absent';
  }