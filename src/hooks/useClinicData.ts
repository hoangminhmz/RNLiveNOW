import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Patient, Room } from '../types';

export function useClinicData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
      } else {
        console.error("Received non-array data for patients:", data);
        setPatients([]);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setPatients([]);
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRooms(data);
      } else {
        console.error("Received non-array data for rooms:", data);
        setRooms([]);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setRooms([]);
    }
  }, []);

  useEffect(() => {
    const socket: Socket = io();

    fetchPatients();
    fetchRooms();
    setLoading(false);

    socket.on('patient:created', (newPatient: Patient) => {
      setPatients(prev => [...prev, newPatient]);
    });

    socket.on('patient:updated', (updatedPatient: Patient) => {
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      fetchRooms(); // Refresh rooms as patient might have moved
    });

    socket.on('patients:bulk_created', (newPatients: Patient[]) => {
      setPatients(prev => [...prev, ...newPatients]);
    });

    socket.on('rooms:updated', () => {
      fetchRooms();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchPatients, fetchRooms]);

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    const res = await fetch(`/api/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const createPatient = async (data: Partial<Patient>) => {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const importPatients = async (data: Partial<Patient>[]) => {
    const res = await fetch('/api/patients/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  };

  const createRoom = async (name: string) => {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return res.json();
  };

  const updateRoom = async (id: string, name: string) => {
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return res.json();
  };

  const deleteRoom = async (id: string) => {
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete room');
    }
    return res.json();
  };

  return { 
    patients, 
    rooms, 
    loading, 
    updatePatient, 
    createPatient, 
    importPatients, 
    createRoom,
    updateRoom,
    deleteRoom,
    refresh: () => { fetchPatients(); fetchRooms(); } 
  };
}
