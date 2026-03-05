import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Patient, Room } from '../types';
import { Stethoscope, CheckCircle2, Timer, Maximize2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

interface RoomsBoardProps {
  rooms: Room[];
  patients: Patient[];
  onFinish: (id: string) => void;
  onPatientClick?: (patient: Patient) => void;
  onExpand?: () => void;
}

function RoomCard({ room, patients, onFinish, onPatientClick }: { room: Room, patients: Patient[], onFinish: (id: string) => void, onPatientClick?: (patient: Patient) => void, key?: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: room.id,
  });

  const patientInRoom = patients.find(p => p.roomId === room.id && p.status === 'in_room');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (patientInRoom?.treatmentStartTime) {
      interval = setInterval(() => {
        setDuration(dayjs().diff(dayjs(patientInRoom.treatmentStartTime), 'minute'));
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [patientInRoom]);

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-xl border-2 transition-all min-h-[160px] flex flex-col ${
        isOver ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-100 bg-white shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-700">{room.name}</h3>
        {!patientInRoom && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Empty
          </span>
        )}
      </div>

      {patientInRoom ? (
        <div className="flex-1 flex flex-col">
          <div className="mb-3 cursor-pointer hover:opacity-80" onClick={() => onPatientClick?.(patientInRoom)}>
            <p className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">{patientInRoom.name}</p>
            <p className="text-xs text-slate-500">{patientInRoom.service}</p>
          </div>
          
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-indigo-600 font-mono text-sm font-bold">
              <Timer className="w-4 h-4" />
              {duration}m
            </div>
            <button
              onClick={() => onFinish(patientInRoom.id)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Finish
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg">
          <p className="text-xs text-slate-400 italic">Drag patient here</p>
        </div>
      )}
    </div>
  );
}

export function RoomsBoard({ rooms, patients, onFinish, onPatientClick, onExpand }: RoomsBoardProps) {
  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-bottom border-slate-100 bg-white flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-slate-500" />
          Treatment Rooms
        </h2>
        {onExpand && (
          <button 
            onClick={onExpand}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
            title="Expand view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map(room => (
          <RoomCard 
            key={room.id} 
            room={room} 
            patients={patients} 
            onFinish={onFinish} 
            onPatientClick={onPatientClick}
          />
        ))}
      </div>
    </div>
  );
}
