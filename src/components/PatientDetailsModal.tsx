import React, { useState, useEffect } from 'react';
import { X, User, Phone, Clock, FileText, Activity, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { Patient, Room } from '../types';
import { generatePatientSummary } from '../services/geminiService';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

interface PatientDetailsModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  onUpdate: (id: string, data: Partial<Patient>) => void;
}

export function PatientDetailsModal({ patient, isOpen, onClose, rooms, onUpdate }: PatientDetailsModalProps) {
  const [note, setNote] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (patient) {
      setNote(patient.note || '');
      setSelectedRoomId(patient.roomId || '');
      setAiSummary(null);
    }
  }, [patient]);

  const handleGenerateSummary = async () => {
    if (!patient) return;
    setIsGeneratingSummary(true);
    try {
      const summary = await generatePatientSummary(patient);
      setAiSummary(summary || 'No summary generated.');
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (!isOpen || !patient) return null;

  const emptyRooms = rooms.filter(r => r.patients.length === 0 || r.id === patient.roomId);

  const handleSaveNote = () => {
    if (note !== patient.note) {
      onUpdate(patient.id, { note });
    }
  };

  const handleMoveRoom = () => {
    if (selectedRoomId && selectedRoomId !== patient.roomId) {
      onUpdate(patient.id, { 
        roomId: selectedRoomId,
        status: 'in_room',
        treatmentStartTime: new Date().toISOString()
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
              <p className="text-sm text-slate-500">{patient.service || 'General Checkup'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Patient Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{patient.phone || 'No phone number'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{dayjs(patient.appointmentTime).format('LLL')}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className={`w-2 h-2 rounded-full ${
                    patient.status === 'scheduled' ? 'bg-blue-500' :
                    patient.status === 'waiting' ? 'bg-yellow-500' :
                    patient.status === 'in_room' ? 'bg-green-500' :
                    'bg-slate-500'
                  }`} />
                  <span className="capitalize">{patient.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Actions</h3>
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <label className="block text-sm font-medium text-slate-700">Move to Room</label>
                <div className="flex gap-2">
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    disabled={patient.status === 'done'}
                  >
                    <option value="">Select a room...</option>
                    {emptyRooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} {room.id === patient.roomId ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleMoveRoom}
                    disabled={!selectedRoomId || selectedRoomId === patient.roomId}
                    className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Move
                  </button>
                </div>
                {emptyRooms.length === 0 && patient.status !== 'in_room' && (
                  <p className="text-xs text-amber-600">No empty rooms available</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Patient Insight
              </h3>
              <button 
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50"
              >
                {isGeneratingSummary ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {aiSummary ? 'Regenerate' : 'Generate Summary'}
              </button>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100 min-h-[80px] relative overflow-hidden">
              {isGeneratingSummary ? (
                <div className="flex items-center justify-center h-full py-4">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : aiSummary ? (
                <p className="text-sm text-slate-700 leading-relaxed font-serif italic">
                  {aiSummary}
                </p>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">
                  Click generate to get an AI-powered summary of this patient's history.
                </p>
              )}
              <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                <Sparkles className="w-12 h-12 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Session Notes
              </h3>
              {note !== patient.note && (
                <button 
                  onClick={handleSaveNote}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Save Changes
                </button>
              )}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleSaveNote}
              className="w-full h-32 rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Add clinical notes here..."
            />
          </div>

          {/* Activity Log */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Log
            </h3>
            <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
              {patient.logs && patient.logs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {patient.logs
                    .filter(log => !log.action.includes('in_room'))
                    .map((log) => (
                    <div key={log.id} className="p-3 flex items-start gap-3 text-sm">
                      <div className="min-w-[140px] text-slate-400 text-xs mt-0.5">
                        {dayjs(log.createdAt).format('MMM D, h:mm A')}
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 capitalize">
                          {log.action.replace('_', ' ')}
                        </span>
                        {log.details && (
                          <p className="text-slate-500 mt-0.5">{log.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No activity recorded yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
