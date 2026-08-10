import type { Appointment } from '../types';

type FirestoreAppointmentData = Record<string, unknown> & {
  scheduledTime?: { toDate?: () => Date } | string | Date;
  checkedInAt?: { toDate?: () => Date };
  calledAt?: { toDate?: () => Date };
};

export function mapFirestoreAppointment(id: string, data: FirestoreAppointmentData): Appointment {
  const scheduled = data.scheduledTime;
  const scheduledTime =
    scheduled && typeof scheduled === 'object' && 'toDate' in scheduled && scheduled.toDate
      ? scheduled.toDate()
      : new Date(scheduled as string | Date);

  return {
    id,
    ...data,
    scheduledTime,
    checkedInAt: data.checkedInAt?.toDate?.() || undefined,
    calledAt: data.calledAt?.toDate?.() || undefined,
  } as Appointment;
}
