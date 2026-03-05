import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Save, Clock } from 'lucide-react';
import { Room } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  onCreateRoom: (name: string) => Promise<void>;
  onUpdateRoom: (id: string, name: string) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
}

export function SettingsModal({ isOpen, onClose, rooms, onCreateRoom, onUpdateRoom, onDeleteRoom }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'rooms' | 'system'>('rooms');
  const [newRoomName, setNewRoomName] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      await onCreateRoom(newRoomName);
      setNewRoomName('');
      setError(null);
    } catch (err) {
      setError('Failed to create room');
    }
  };

  const handleUpdateRoom = async (id: string) => {
    if (!editRoomName.trim()) return;
    try {
      await onUpdateRoom(id, editRoomName);
      setEditingRoomId(null);
      setError(null);
    } catch (err) {
      setError('Failed to update room');
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await onDeleteRoom(id);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete room');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-200">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'rooms' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('rooms')}
          >
            Room Management
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'system' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('system')}
          >
            System Settings
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateRoom} className="flex gap-2">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter new room name..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Room
                </button>
              </form>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Existing Rooms</h3>
                {rooms.map(room => (
                  <div key={room.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-200 transition-colors">
                    {editingRoomId === room.id ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editRoomName}
                          onChange={(e) => setEditRoomName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateRoom(room.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingRoomId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-slate-700">{room.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingRoomId(room.id);
                              setEditRoomName(room.name);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {rooms.length === 0 && (
                  <p className="text-center text-slate-400 italic py-4">No rooms configured yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  System Time
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Current system time: <span className="font-mono font-medium text-slate-700">{new Date().toLocaleString()}</span>
                </p>
                <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  Note: System time is currently managed by the server and browser. Manual time override is not yet implemented in this demo version.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
