import type { User } from 'firebase/auth';

export type AppointmentStatus =
  | 'BOOKED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED';

export type AppointmentSource = 'whatsapp' | 'walk-in';

export type WaitlistStatus = 'WAITING' | 'OFFERED' | 'ACCEPTED' | 'EXPIRED';

export interface Appointment {
  id: string;
  clinicId: string;
  doctorId: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  scheduledTime: Date;
  status: AppointmentStatus;
  bookingCode: string;
  source: AppointmentSource;
  checkedInAt?: Date;
  calledAt?: Date;
  tokenNumber?: number;
}

export interface WorkingHours {
  start: string;
  end: string;
  days: number[];
}

export interface Clinic {
  id: string;
  name: string;
  workingHours: WorkingHours;
  slotDurationMinutes: number;
  avgConsultationMinutes: number;
  doctorIds: string[];
}

export interface Doctor {
  id: string;
  clinicId: string;
  name: string;
  title: string;
}

export interface QueuePatient {
  id: string;
  patientName: string;
  bookingCode: string;
  scheduledTime: Date;
  checkedInAt: Date;
  calledAt?: Date;
  tokenNumber?: number;
  status: 'CHECKED_IN' | 'IN_PROGRESS';
}

export interface QueueState {
  currentPatient: QueuePatient | null;
  waitingList: QueuePatient[];
}

export interface WaitlistEntry {
  id: string;
  clinicId: string;
  patientName: string;
  patientPhone: string;
  status: WaitlistStatus;
  position: number;
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  completed: number;
  noShows: number;
  cancellations: number;
  total: number;
  bookingRate: number;
}

export interface CheckInResult {
  success: boolean;
  appointment?: Appointment;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface DemoUser {
  email: string;
  displayName: string;
  uid: string;
}

export type AuthUser = User | DemoUser;

export interface StatusStyle {
  label: string;
  color: string;
  backgroundColor: string;
}

export type AppointmentStatusMap = Record<AppointmentStatus, StatusStyle>;
export type WaitlistStatusMap = Record<WaitlistStatus, StatusStyle>;

export interface AuthContextValue {
  user: AuthUser | null;
  clinicId: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isDemoMode: boolean;
}

export interface AppDataContextValue {
  clinic: Clinic;
  doctors: Doctor[];
  appointments: Appointment[];
  queue: QueueState;
  waitlist: WaitlistEntry[];
  loading: boolean;
  error: string | null;
  checkInByCode: (code: string) => Promise<CheckInResult>;
  callNext: () => Promise<void>;
  updateClinicSettings: (settings: Partial<Clinic>) => Promise<void>;
  getWeeklyStats: () => WeeklyStats;
  isFirebaseMode: boolean;
}
