import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Patient } from '../types';
import { UserCheck, Clock, Search, Maximize2 } from 'lucide-react';

interface ScheduledListProps {
  patients: Patient[];
  onArrived: (id: string) => void;
  onPatientClick: (patient: Patient) => void;
  onExpand?: () => void;
  date: Date;
}

export function ScheduledList({ patients, onArrived, onPatientClick, onExpand, date }: ScheduledListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const isToday = dayjs(date).isSame(dayjs(), 'day');
  
  const scheduled = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.phone && p.phone.includes(searchTerm));
    
    if (isToday) {
      return p.status === 'scheduled' && matchesSearch;
    } else {
      // For history, show all patients with appointment on that day
      return dayjs(p.appointmentTime).isSame(dayjs(date), 'day') && matchesSearch;
    }
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            {isToday ? 'Scheduled' : 'Appointments'}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
              {scheduled.length}
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
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {scheduled.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm italic">
            {searchTerm ? 'No matches found' : 'No scheduled appointments'}
          </div>
        ) : (
          scheduled.map(patient => (
            <div key={patient.id} className="p-3 border border-slate-100 rounded-lg hover:border-indigo-200 transition-colors bg-white group">
              <div className="flex justify-between items-start mb-2">
                <div 
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => onPatientClick(patient)}
                >
                  <h3 className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">{patient.name}</h3>
                  <p className="text-xs text-slate-500">{patient.service || 'General Checkup'}</p>
                  {patient.phone && <p className="text-[10px] text-slate-400 mt-0.5">{patient.phone}</p>}
                </div>
                <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {dayjs(patient.appointmentTime).format('HH:mm')}
                </span>
              </div>
              <button
                onClick={() => onArrived(patient.id)}
                className="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Arrived
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
