export type PatientStatus = 'scheduled' | 'waiting' | 'in_room' | 'done' | 'cancelled' | 'no_show';

export interface PatientLog {
  id: string;
  patientId: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  service?: string;
  appointmentTime: string;
  status: PatientStatus;
  checkinTime?: string;
  treatmentStartTime?: string;
  treatmentEndTime?: string;
  roomId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  logs?: PatientLog[];
}

export interface Room {
  id: string;
  name: string;
  patients: Patient[];
  createdAt: string;
}
