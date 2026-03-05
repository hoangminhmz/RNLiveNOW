import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Patient } from '../types';
import { Timer, User, Maximize2 } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface WaitingAreaProps {
  patients: Patient[];
  onPatientClick?: (patient: Patient) => void;
  onExpand?: () => void;
}

function WaitingPatientCard({ patient, onClick }: { patient: Patient, onClick?: () => void, key?: string }) {
  const [waitTime, setWaitTime] = useState(0);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: patient.id,
    data: { patient }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (patient.checkinTime) {
        setWaitTime(dayjs().diff(dayjs(patient.checkinTime), 'minute'));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [patient.checkinTime]);

  const getWaitColor = () => {
    if (waitTime < 10) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (waitTime < 20) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`p-3 border rounded-lg bg-white shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${getWaitColor()}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-900">{patient.name}</h3>
          <p className="text-xs text-slate-500">{patient.service}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono font-bold">
          <Timer className="w-3 h-3" />
          {waitTime}m
        </div>
      </div>
    </div>
  );
}

export function WaitingArea({ patients, onPatientClick, onExpand }: WaitingAreaProps) {
  const waiting = patients.filter(p => p.status === 'waiting');

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-bottom border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          Waiting Area
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
            {waiting.length}
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {waiting.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm italic">No patients waiting</div>
        ) : (
          waiting.map(patient => (
            <WaitingPatientCard 
              key={patient.id} 
              patient={patient} 
              onClick={() => onPatientClick?.(patient)}
            />
          ))
        )}
      </div>
    </div>
  );
}
