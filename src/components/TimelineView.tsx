import React from 'react';
import dayjs from 'dayjs';
import { Patient, Room } from '../types';
import { Calendar, Maximize2 } from 'lucide-react';

interface TimelineViewProps {
  rooms: Room[];
  patients: Patient[];
  onPatientClick?: (patient: Patient) => void;
  onExpand?: () => void;
  date: Date;
}

export function TimelineView({ rooms, patients, onPatientClick, onExpand, date }: TimelineViewProps) {
  const today = dayjs(date).startOf('day');
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM

  const getPatientBlocks = (roomId: string) => {
    return patients.filter(p => 
      p.roomId === roomId && 
      p.treatmentStartTime && 
      dayjs(p.treatmentStartTime).isSame(dayjs(date), 'day')
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-bottom border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          Daily Timeline
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            {dayjs(date).format('MMMM D, YYYY')}
          </span>
          {onExpand && (
            <button 
              onClick={onExpand}
              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors"
              title="Expand view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-[800px]">
          {/* Header with hours */}
          <div className="flex border-b border-slate-100 pb-2 mb-2">
            <div className="w-32 flex-shrink-0"></div>
            <div className="flex-1 flex">
              {hours.map(hour => (
                <div key={hour} className="flex-1 text-[10px] font-bold text-slate-400 border-l border-slate-100 pl-1">
                  {hour}:00
                </div>
              ))}
            </div>
          </div>

          {/* Room rows */}
          <div className="space-y-4">
            {rooms.map(room => (
              <div key={room.id} className="flex items-center h-12 group">
                <div className="w-32 flex-shrink-0 font-medium text-sm text-slate-600">{room.name}</div>
                <div className="flex-1 h-8 bg-slate-50 rounded relative overflow-hidden border border-slate-100">
                  {getPatientBlocks(room.id).map(patient => {
                    const start = dayjs(patient.treatmentStartTime);
                    const end = patient.treatmentEndTime ? dayjs(patient.treatmentEndTime) : dayjs();
                    
                    const startHour = start.hour() + start.minute() / 60;
                    const endHour = end.hour() + end.minute() / 60;
                    
                    const left = ((startHour - 8) / 12) * 100;
                    const width = ((endHour - startHour) / 12) * 100;

                    if (left < 0 || left > 100) return null;

                    return (
                      <div
                        key={patient.id}
                        className={`absolute top-0 h-full rounded border flex items-center px-2 text-[10px] font-bold truncate transition-all cursor-pointer hover:opacity-80 ${
                          patient.status === 'in_room' 
                            ? 'bg-indigo-100 border-indigo-200 text-indigo-700 animate-pulse' 
                            : 'bg-emerald-100 border-emerald-200 text-emerald-700'
                        }`}
                        style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                        title={`${patient.name} - ${patient.service}`}
                        onClick={() => onPatientClick?.(patient)}
                      >
                        {patient.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
