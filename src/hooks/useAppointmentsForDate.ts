import { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { isSameDay, isToday, startOfDay } from '../utils/dateUtils';
import type { Appointment } from '../types';

interface UseAppointmentsForDateResult {
  appointments: Appointment[];
  loading: boolean;
  isPastRecord: boolean;
  isFutureDate: boolean;
}

export function useAppointmentsForDate(selectedDate: Date): UseAppointmentsForDateResult {
  const { appointments: liveAppointments, fetchAppointmentsForDate, isFirebaseMode } = useAppData();
  const [fetched, setFetched] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(false);

  const viewingToday = isToday(selectedDate);
  const todayStart = startOfDay(new Date());
  const selectedStart = startOfDay(selectedDate);
  const isPastRecord = !viewingToday && selectedStart < todayStart;
  const isFutureDate = !viewingToday && selectedStart > todayStart;

  useEffect(() => {
    if (!isFirebaseMode || viewingToday) {
      setFetched(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    fetchAppointmentsForDate(selectedDate)
      .then((rows) => {
        if (!cancelled) {
          setFetched(rows);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetched([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, viewingToday, isFirebaseMode, fetchAppointmentsForDate]);

  const appointments = useMemo(() => {
    const source = isFirebaseMode && !viewingToday && fetched !== null
      ? fetched
      : liveAppointments;

    return source
      .filter((apt) => isSameDay(apt.scheduledTime, selectedDate))
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }, [fetched, isFirebaseMode, liveAppointments, selectedDate, viewingToday]);

  return { appointments, loading, isPastRecord, isFutureDate };
}
