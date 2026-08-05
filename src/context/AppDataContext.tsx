import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import env from '../config/env';
import {
  ACTION_TYPES,
  appReducer,
  createInitialState,
} from '../store/appStore';
import { toISTDateKey, endOfDay } from '../utils/dateUtils';
import type {
  AppDataContextValue,
  Appointment,
  CheckInResult,
  Clinic,
} from '../types';

const AppDataContext = createContext<AppDataContextValue | null>(null);

interface AppDataProviderProps {
  clinicId: string | null;
  children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ clinicId, children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  const [loading, setLoading] = useState(isFirebaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const effectiveClinicId = clinicId || env.defaultClinicId;

  useEffect(() => {
    if (!isFirebaseConfigured() || !db) {
      setLoading(false);
      return undefined;
    }

    const todayKey = toISTDateKey();
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('clinicId', '==', effectiveClinicId),
      where('dateKey', '==', todayKey),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointments: Appointment[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            scheduledTime: data.scheduledTime?.toDate?.() || new Date(data.scheduledTime),
            checkedInAt: data.checkedInAt?.toDate?.() || undefined,
            calledAt: data.calledAt?.toDate?.() || undefined,
          } as Appointment;
        });
        dispatch({ type: ACTION_TYPES.SET_APPOINTMENTS, payload: appointments });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [effectiveClinicId]);

  const checkInByCode = useCallback(
    async (code: string): Promise<CheckInResult> => {
      const normalised = code.trim().toUpperCase();
      if (!normalised) {
        return { success: false, error: 'Please enter a booking code.' };
      }

      const appointment = state.appointments.find(
        (apt) => apt.bookingCode.toUpperCase() === normalised,
      );

      if (!appointment) {
        return {
          success: false,
          error: `No appointment found for code "${normalised}".`,
        };
      }

      const checkInableStatuses: Array<Appointment['status']> = ['BOOKED', 'CONFIRMED'];
      if (!checkInableStatuses.includes(appointment.status)) {
        return {
          success: false,
          error: `This appointment is already "${appointment.status}". Only Booked or Confirmed appointments can be checked in.`,
        };
      }

      if (isFirebaseConfigured() && db) {
        const aptRef = doc(db, 'appointments', appointment.id);
        const tokenNumber = state.nextTokenSeed;
        const checkedInAt = new Date();
        await updateDoc(aptRef, {
          status: 'CHECKED_IN',
          checkedInAt,
          tokenNumber,
        });
        const updated: Appointment = {
          ...appointment,
          status: 'CHECKED_IN',
          checkedInAt,
          tokenNumber,
        };
        return { success: true, appointment: updated };
      }

      dispatch({ type: ACTION_TYPES.CHECK_IN, payload: { appointmentId: appointment.id } });
      const tokenNumber = state.nextTokenSeed;
      const checkedInAt = new Date();
      return {
        success: true,
        appointment: {
          ...appointment,
          status: 'CHECKED_IN',
          checkedInAt,
          tokenNumber,
        },
      };
    },
    [state.appointments, state.nextTokenSeed],
  );

  const callNext = useCallback(async () => {
    if (state.queue.waitingList.length === 0) return;

    if (isFirebaseConfigured() && db) {
      const batch = writeBatch(db);
      const { currentPatient, waitingList } = state.queue;
      const [next, ...rest] = waitingList;
      const calledAt = new Date();

      if (currentPatient) {
        batch.update(doc(db, 'appointments', currentPatient.id), { status: 'COMPLETED' });
      }
      batch.update(doc(db, 'appointments', next.id), {
        status: 'IN_PROGRESS',
        calledAt,
      });
      await batch.commit();
      void rest;
      return;
    }

    dispatch({ type: ACTION_TYPES.CALL_NEXT });
  }, [state.queue]);

  const updateClinicSettings = useCallback(
    async (settings: Partial<Clinic>) => {
      if (isFirebaseConfigured() && db) {
        await updateDoc(doc(db, 'clinics', effectiveClinicId), settings);
      }
      dispatch({ type: ACTION_TYPES.UPDATE_CLINIC_SETTINGS, payload: settings });
    },
    [effectiveClinicId],
  );

  const getWeeklyStats = useCallback(() => {
    const now = new Date();
    const weekEnd = endOfDay(now);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekAppointments = state.appointments.filter((a) => {
      const t = new Date(a.scheduledTime);
      return t >= weekStart && t <= weekEnd;
    });

    const completed = weekAppointments.filter((a) => a.status === 'COMPLETED').length;
    const noShows = weekAppointments.filter((a) => a.status === 'NO_SHOW').length;
    const cancellations = weekAppointments.filter((a) => a.status === 'CANCELLED').length;
    const total = weekAppointments.length;
    const bookingRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      weekStart,
      weekEnd,
      completed,
      noShows,
      cancellations,
      total,
      bookingRate,
    };
  }, [state.appointments]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      clinic: state.clinic,
      doctors: state.doctors,
      appointments: state.appointments,
      queue: state.queue,
      waitlist: state.waitlist,
      loading,
      error,
      checkInByCode,
      callNext,
      updateClinicSettings,
      getWeeklyStats,
      isFirebaseMode: isFirebaseConfigured(),
    }),
    [
      state,
      loading,
      error,
      checkInByCode,
      callNext,
      updateClinicSettings,
      getWeeklyStats,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextValue => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return ctx;
};

export default AppDataContext;
