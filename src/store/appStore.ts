import MOCK_APPOINTMENTS from '../data/mockAppointments';
import type {
  Appointment,
  AppointmentStatus,
  Clinic,
  Doctor,
  QueuePatient,
  QueueState,
  WaitlistEntry,
} from '../types';

export const DEFAULT_CLINIC: Clinic = {
  id: 'clinic-01',
  name: 'City Care Clinic',
  workingHours: {
    start: '09:00',
    end: '18:00',
    days: [1, 2, 3, 4, 5, 6],
  },
  slotDurationMinutes: 30,
  avgConsultationMinutes: 15,
  doctorIds: ['doc-01'],
};

export const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'doc-01',
    clinicId: 'clinic-01',
    name: 'Dr. Ananya Sharma',
    title: 'General Physician',
  },
];

export interface AppState {
  clinic: Clinic;
  doctors: Doctor[];
  appointments: Appointment[];
  queue: QueueState;
  waitlist: WaitlistEntry[];
  nextTokenSeed: number;
}

const isSameCalendarDay = (date: Date, ref = new Date()): boolean =>
  date.getFullYear() === ref.getFullYear() &&
  date.getMonth() === ref.getMonth() &&
  date.getDate() === ref.getDate();

const buildInitialQueue = (appointments: Appointment[]): QueueState => {
  const today = new Date();
  const inProgress = appointments.find(
    (a) => a.status === 'IN_PROGRESS' && isSameCalendarDay(a.scheduledTime, today),
  );
  const waiting: QueuePatient[] = appointments
    .filter((a) => a.status === 'CHECKED_IN' && isSameCalendarDay(a.scheduledTime, today))
    .sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0))
    .map((a) => ({
      id: a.id,
      patientName: a.patientName,
      bookingCode: a.bookingCode,
      scheduledTime: a.scheduledTime,
      checkedInAt: a.checkedInAt || a.scheduledTime,
      tokenNumber: a.tokenNumber,
      status: a.status as 'CHECKED_IN',
    }));

  const currentPatient: QueuePatient | null = inProgress
    ? {
        id: inProgress.id,
        patientName: inProgress.patientName,
        bookingCode: inProgress.bookingCode,
        scheduledTime: inProgress.scheduledTime,
        checkedInAt: inProgress.checkedInAt || inProgress.scheduledTime,
        calledAt: inProgress.calledAt || new Date(),
        tokenNumber: inProgress.tokenNumber,
        status: 'IN_PROGRESS',
      }
    : null;

  return { currentPatient, waitingList: waiting };
};

const nextTokenNumber = (appointments: Appointment[]): number => {
  const todayTokens = appointments
    .filter((a) => isSameCalendarDay(a.scheduledTime) && a.tokenNumber)
    .map((a) => a.tokenNumber as number);
  return todayTokens.length ? Math.max(...todayTokens) + 1 : 1;
};

export const createInitialState = (): AppState => {
  const appointments: Appointment[] = MOCK_APPOINTMENTS.map((a) => ({
    ...a,
    scheduledTime: new Date(a.scheduledTime),
    checkedInAt: a.checkedInAt ? new Date(a.checkedInAt) : undefined,
    calledAt: a.calledAt ? new Date(a.calledAt) : undefined,
  }));

  const queue = buildInitialQueue(appointments);

  return {
    clinic: { ...DEFAULT_CLINIC },
    doctors: [...DEFAULT_DOCTORS],
    appointments,
    queue,
    waitlist: [],
    nextTokenSeed: nextTokenNumber(appointments),
  };
};

export const ACTION_TYPES = {
  CHECK_IN: 'CHECK_IN',
  CALL_NEXT: 'CALL_NEXT',
  UPDATE_APPOINTMENT_STATUS: 'UPDATE_APPOINTMENT_STATUS',
  UPDATE_CLINIC_SETTINGS: 'UPDATE_CLINIC_SETTINGS',
  SET_APPOINTMENTS: 'SET_APPOINTMENTS',
  ADD_WALK_IN: 'ADD_WALK_IN',
} as const;

export type AppAction =
  | { type: typeof ACTION_TYPES.CHECK_IN; payload: { appointmentId: string } }
  | { type: typeof ACTION_TYPES.CALL_NEXT }
  | {
      type: typeof ACTION_TYPES.UPDATE_APPOINTMENT_STATUS;
      payload: { appointmentId: string; status: AppointmentStatus };
    }
  | { type: typeof ACTION_TYPES.UPDATE_CLINIC_SETTINGS; payload: Partial<Clinic> }
  | { type: typeof ACTION_TYPES.SET_APPOINTMENTS; payload: Appointment[] }
  | { type: typeof ACTION_TYPES.ADD_WALK_IN; payload: { appointment: Appointment } };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case ACTION_TYPES.CHECK_IN: {
      const { appointmentId } = action.payload;
      const appointment = state.appointments.find((a) => a.id === appointmentId);
      if (!appointment) return state;

      const tokenNumber = state.nextTokenSeed;
      const checkedInAt = new Date();
      const updatedAppointments = state.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'CHECKED_IN' as const, checkedInAt, tokenNumber }
          : a,
      );

      const queueEntry: QueuePatient = {
        id: appointment.id,
        patientName: appointment.patientName,
        bookingCode: appointment.bookingCode,
        scheduledTime: appointment.scheduledTime,
        checkedInAt,
        tokenNumber,
        status: 'CHECKED_IN',
      };

      return {
        ...state,
        appointments: updatedAppointments,
        queue: {
          ...state.queue,
          waitingList: [...state.queue.waitingList, queueEntry].sort(
            (a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0),
          ),
        },
        nextTokenSeed: tokenNumber + 1,
      };
    }

    case ACTION_TYPES.CALL_NEXT: {
      const { waitingList, currentPatient } = state.queue;
      if (waitingList.length === 0) return state;

      const [next, ...rest] = waitingList;
      const calledAt = new Date();

      let updatedAppointments = state.appointments.map((a) => {
        if (currentPatient && a.id === currentPatient.id) {
          return { ...a, status: 'COMPLETED' as const };
        }
        if (a.id === next.id) {
          return { ...a, status: 'IN_PROGRESS' as const, calledAt };
        }
        return a;
      });

      if (!currentPatient) {
        updatedAppointments = updatedAppointments.map((a) =>
          a.id === next.id ? { ...a, status: 'IN_PROGRESS' as const, calledAt } : a,
        );
      }

      return {
        ...state,
        appointments: updatedAppointments,
        queue: {
          currentPatient: { ...next, status: 'IN_PROGRESS', calledAt },
          waitingList: rest,
        },
      };
    }

    case ACTION_TYPES.UPDATE_APPOINTMENT_STATUS: {
      const { appointmentId, status } = action.payload;
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === appointmentId ? { ...a, status } : a,
        ),
      };
    }

    case ACTION_TYPES.UPDATE_CLINIC_SETTINGS: {
      return {
        ...state,
        clinic: { ...state.clinic, ...action.payload },
      };
    }

    case ACTION_TYPES.SET_APPOINTMENTS: {
      return {
        ...state,
        appointments: action.payload,
        queue: buildInitialQueue(action.payload),
      };
    }

    case ACTION_TYPES.ADD_WALK_IN: {
      const { appointment } = action.payload;
      return {
        ...state,
        appointments: [...state.appointments, appointment],
      };
    }

    default:
      return state;
  }
};
