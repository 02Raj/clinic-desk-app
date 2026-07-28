// ---------------------------------------------------------------------------
// Mock appointment data for development.
// Mirrors the Firestore `appointments` schema from the Technical Architecture
// Document (Section 4.3). Will be replaced by real Firestore queries later.
// ---------------------------------------------------------------------------

import type { Appointment } from '../types';

/**
 * Returns a Date object for today at the given hour:minute.
 */
const todayAt = (hours: number, minutes = 0): Date => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

/**
 * Returns a Date object for tomorrow at the given hour:minute.
 */
const tomorrowAt = (hours: number, minutes = 0): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

/**
 * Returns a Date object for yesterday at the given hour:minute.
 */
const yesterdayAt = (hours: number, minutes = 0): Date => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const MOCK_APPOINTMENTS: Appointment[] = [
  // --- Today's appointments (mix of statuses) ---
  {
    id: 'apt-001',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-001',
    patientName: 'Rajesh Kumar',
    patientPhone: '+919876543210',
    scheduledTime: todayAt(9, 0),
    status: 'COMPLETED',
    bookingCode: 'RK9A',
    source: 'whatsapp',
  },
  {
    id: 'apt-002',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-002',
    patientName: 'Priya Sharma',
    patientPhone: '+919876543211',
    scheduledTime: todayAt(9, 30),
    status: 'COMPLETED',
    bookingCode: 'PS9B',
    source: 'whatsapp',
  },
  {
    id: 'apt-003',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-003',
    patientName: 'Amit Patel',
    patientPhone: '+919876543212',
    scheduledTime: todayAt(10, 0),
    status: 'IN_PROGRESS',
    bookingCode: 'AP10',
    source: 'whatsapp',
    tokenNumber: 3,
    checkedInAt: todayAt(9, 52),
    calledAt: todayAt(10, 3),
  },
  {
    id: 'apt-004',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-004',
    patientName: 'Sunita Devi',
    patientPhone: '+919876543213',
    scheduledTime: todayAt(10, 30),
    status: 'CHECKED_IN',
    bookingCode: 'SD10',
    source: 'walk-in',
    tokenNumber: 4,
    checkedInAt: todayAt(10, 12),
  },
  {
    id: 'apt-005',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-005',
    patientName: 'Vikram Singh',
    patientPhone: '+919876543214',
    scheduledTime: todayAt(11, 0),
    status: 'CONFIRMED',
    bookingCode: 'VS11',
    source: 'whatsapp',
  },
  {
    id: 'apt-006',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-006',
    patientName: 'Meena Gupta',
    patientPhone: '+919876543215',
    scheduledTime: todayAt(11, 30),
    status: 'BOOKED',
    bookingCode: 'MG11',
    source: 'whatsapp',
  },
  {
    id: 'apt-007',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-007',
    patientName: 'Arjun Reddy',
    patientPhone: '+919876543216',
    scheduledTime: todayAt(12, 0),
    status: 'BOOKED',
    bookingCode: 'AR12',
    source: 'whatsapp',
  },
  {
    id: 'apt-008',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-008',
    patientName: 'Fatima Khan',
    patientPhone: '+919876543217',
    scheduledTime: todayAt(14, 0),
    status: 'BOOKED',
    bookingCode: 'FK14',
    source: 'whatsapp',
  },
  {
    id: 'apt-009',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-009',
    patientName: 'Deepak Joshi',
    patientPhone: '+919876543218',
    scheduledTime: todayAt(14, 30),
    status: 'CANCELLED',
    bookingCode: 'DJ14',
    source: 'whatsapp',
  },
  {
    id: 'apt-010',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-010',
    patientName: 'Neha Verma',
    patientPhone: '+919876543219',
    scheduledTime: todayAt(15, 0),
    status: 'NO_SHOW',
    bookingCode: 'NV15',
    source: 'whatsapp',
  },
  {
    id: 'apt-011',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-011',
    patientName: 'Sanjay Mishra',
    patientPhone: '+919876543220',
    scheduledTime: todayAt(15, 30),
    status: 'BOOKED',
    bookingCode: 'SM15',
    source: 'walk-in',
  },
  {
    id: 'apt-012',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-012',
    patientName: 'Kavita Rao',
    patientPhone: '+919876543221',
    scheduledTime: todayAt(16, 0),
    status: 'CONFIRMED',
    bookingCode: 'KR16',
    source: 'whatsapp',
  },

  // --- Yesterday (for date navigation testing) ---
  {
    id: 'apt-100',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-013',
    patientName: 'Ravi Shankar',
    patientPhone: '+919876543222',
    scheduledTime: yesterdayAt(10, 0),
    status: 'COMPLETED',
    bookingCode: 'RS10',
    source: 'whatsapp',
  },
  {
    id: 'apt-101',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-014',
    patientName: 'Anita Desai',
    patientPhone: '+919876543223',
    scheduledTime: yesterdayAt(11, 0),
    status: 'COMPLETED',
    bookingCode: 'AD11',
    source: 'whatsapp',
  },
  {
    id: 'apt-102',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-015',
    patientName: 'Manoj Tiwari',
    patientPhone: '+919876543224',
    scheduledTime: yesterdayAt(14, 0),
    status: 'NO_SHOW',
    bookingCode: 'MT14',
    source: 'whatsapp',
  },

  // --- Tomorrow (for date navigation testing) ---
  {
    id: 'apt-200',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-016',
    patientName: 'Pooja Nair',
    patientPhone: '+919876543225',
    scheduledTime: tomorrowAt(9, 30),
    status: 'BOOKED',
    bookingCode: 'PN9C',
    source: 'whatsapp',
  },
  {
    id: 'apt-201',
    clinicId: 'clinic-01',
    doctorId: 'doc-01',
    patientId: 'pat-017',
    patientName: 'Arun Mehta',
    patientPhone: '+919876543226',
    scheduledTime: tomorrowAt(10, 0),
    status: 'BOOKED',
    bookingCode: 'AM10',
    source: 'whatsapp',
  },
];

export default MOCK_APPOINTMENTS;
