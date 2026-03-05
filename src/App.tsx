import React, { useState } from 'react';
import dayjs from 'dayjs';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useClinicData } from './hooks/useClinicData';
import { ScheduledList } from './components/ScheduledList';
import { WaitingArea } from './components/WaitingArea';
import { RoomsBoard } from './components/RoomsBoard';
import { TimelineView } from './components/TimelineView';
import { AddPatientModal } from './components/AddPatientModal';
import { PatientDetailsModal } from './components/PatientDetailsModal';
import { ImportExcelButton } from './components/ImportExcelButton';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { AIInsights } from './components/AIInsights';
import { Plus, LayoutDashboard, Activity, X, ArrowLeft, Sparkles } from 'lucide-react';
import { Patient } from './types';

export default function App() {
  const { 
    patients, 
    rooms, 
    loading, 
    updatePatient, 
    createPatient, 
    importPatients,
    createRoom,
    updateRoom,
    deleteRoom
  } = useClinicData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [expandedModule, setExpandedModule] = useState<'scheduled' | 'waiting' | 'rooms' | 'timeline' | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'dashboard'>('main');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentView('main');
  };

  // ... (handlers)
  const handleArrived = (id: string) => {
    updatePatient(id, { 
      status: 'waiting', 
      checkinTime: new Date().toISOString() 
    });
  };

  const handleFinish = (id: string) => {
    updatePatient(id, { 
      status: 'done', 
      treatmentEndTime: new Date().toISOString()
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const patientId = active.id as string;
    const roomId = over.id as string;

    updatePatient(patientId, {
      status: 'in_room',
      roomId: roomId,
      treatmentStartTime: new Date().toISOString()
    });
  };

  const renderExpandedModule = () => {
    switch (expandedModule) {
      case 'scheduled':
        return <ScheduledList patients={patients} onArrived={handleArrived} onPatientClick={setSelectedPatient} date={selectedDate} />;
      case 'waiting':
        return <WaitingArea patients={isToday ? patients : []} onPatientClick={setSelectedPatient} />;
      case 'rooms':
        return <RoomsBoard rooms={rooms} patients={isToday ? patients : []} onFinish={handleFinish} onPatientClick={setSelectedPatient} />;
      case 'timeline':
        return <TimelineView rooms={rooms} patients={patients} onPatientClick={setSelectedPatient} date={selectedDate} />;
      default:
        return null;
    }
  };

  if (loading) {
    // ...
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2 mr-8 cursor-pointer" onClick={() => setCurrentView('main')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">RNLIVENOW</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`text-sm font-semibold flex items-center gap-2 transition-colors ${currentView === 'dashboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('main')}
            className={`text-sm font-semibold flex items-center gap-2 transition-colors ${currentView === 'main' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            <Activity className="w-4 h-4" />
            Operations
          </button>
        </nav>

        {!isToday && currentView === 'main' && (
          <div className="mx-auto bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium border border-amber-100 flex items-center gap-2">
            Viewing history: {dayjs(selectedDate).format('MMMM D, YYYY')}
            <button 
              onClick={() => setSelectedDate(new Date())}
              className="ml-2 text-xs bg-white border border-amber-200 px-2 py-0.5 rounded hover:bg-amber-100 transition-colors"
            >
              Return to Today
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-4">
          {currentView === 'main' && isToday && (
            <>
              <AIInsights patients={patients} rooms={rooms} />
              <div className="w-px h-8 bg-slate-200 mx-2" />
              <ImportExcelButton onImport={(data) => importPatients(data)} />
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Appointment
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-[1600px] mx-auto h-[calc(100vh-64px)] overflow-hidden">
        {currentView === 'dashboard' ? (
          <Dashboard 
            patients={patients} 
            rooms={rooms} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
            onDateSelect={handleDateSelect}
          />
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-6">
              {/* Left Column: Scheduled & Waiting */}
              <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden h-full">
                <div className="flex-1 min-h-0">
                  <ScheduledList 
                    patients={patients} 
                    onArrived={handleArrived} 
                    onPatientClick={setSelectedPatient}
                    onExpand={() => setExpandedModule('scheduled')}
                    date={selectedDate}
                  />
                </div>
                <div className="flex-1 min-h-0">
                  <WaitingArea 
                    patients={isToday ? patients : []} 
                    onPatientClick={setSelectedPatient}
                    onExpand={() => setExpandedModule('waiting')}
                  />
                </div>
              </div>

              {/* Middle Column: Rooms Board */}
              <div className="lg:col-span-4 min-h-0 h-full">
                <RoomsBoard 
                  rooms={rooms} 
                  patients={isToday ? patients : []} 
                  onFinish={handleFinish} 
                  onPatientClick={setSelectedPatient}
                  onExpand={() => setExpandedModule('rooms')}
                />
              </div>

              {/* Right Column: Timeline */}
              <div className="lg:col-span-5 min-h-0 h-full">
                <TimelineView 
                  rooms={rooms} 
                  patients={patients} 
                  onPatientClick={setSelectedPatient}
                  onExpand={() => setExpandedModule('timeline')}
                  date={selectedDate}
                />
              </div>
            </div>
          </DndContext>
        )}
      </main>

      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => createPatient(data)}
      />

      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        rooms={rooms}
        onUpdate={updatePatient}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        rooms={rooms}
        onCreateRoom={createRoom}
        onUpdateRoom={updateRoom}
        onDeleteRoom={deleteRoom}
      />

      {/* Expanded Module Modal */}
      {expandedModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setExpandedModule(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors shadow-sm border border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 p-1 h-full">
              {renderExpandedModule()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
