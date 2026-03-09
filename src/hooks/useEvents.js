import { useState, useEffect, useCallback } from 'react';
import { loadEvents, saveEvents } from '../utils/storage';
import { toDateString } from '../utils/dateUtils';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useEvents() {
  const [events, setEvents] = useState(() => loadEvents());

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const addEvent = useCallback((eventData) => {
    const newEvent = {
      id: generateId(),
      title: '',
      date: toDateString(new Date()),
      startTime: '09:00',
      endTime: '10:00',
      category: 'personal',
      note: '',
      ...eventData,
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id, updates) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { events, addEvent, updateEvent, deleteEvent };
}
