import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import dayjs from 'dayjs';
import { Patient, Room } from '../types';
import { Calendar, TrendingUp, Users, Clock, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  rooms: Room[];
  onOpenSettings: () => void;
  onDateSelect: (date: Date) => void;
  initialViewMode?: 'overview' | 'calendar';
}

export function Dashboard({ patients, rooms, onOpenSettings, onDateSelect, initialViewMode = 'overview' }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<'overview' | 'calendar'>(initialViewMode);

  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  // Calculate stats
  const stats = useMemo(() => {
    const todayPatients = patients.filter(p => dayjs(p.appointmentTime).isSame(dayjs(), 'day'));
    const weeklyPatients = patients.filter(p => dayjs(p.appointmentTime).isAfter(dayjs().subtract(7, 'day')));
    
    const avgWaitTime = todayPatients.reduce((acc, p) => {
      if (p.checkinTime && p.treatmentStartTime) {
        return acc + dayjs(p.treatmentStartTime).diff(dayjs(p.checkinTime), 'minute');
      }
      return acc;
    }, 0) / (todayPatients.filter(p => p.checkinTime && p.treatmentStartTime).length || 1);

    return {
      todayCount: todayPatients.length,
      weeklyCount: weeklyPatients.length,
      avgWaitTime: Math.round(avgWaitTime),
      roomUtilization: rooms.map(r => ({
        name: r.name,
        count: patients.filter(p => p.roomId === r.id && dayjs(p.appointmentTime).isSame(dayjs(), 'day')).length
      }))
    };
  }, [patients, rooms]);

  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      data.push({
        name: date.format('ddd'),
        patients: patients.filter(p => dayjs(p.appointmentTime).isSame(date, 'day')).length
      });
    }
    return data;
  }, [patients]);

  const calendarDays = useMemo(() => {
    const start = selectedDate.startOf('month').startOf('week');
    const end = selectedDate.endOf('month').endOf('week');
    const days = [];
    let current = start;
    while (current.isBefore(end)) {
      days.push(current);
      current = current.add(1, 'day');
    }
    return days;
  }, [selectedDate]);

  const getDayStats = (date: dayjs.Dayjs) => {
    const dayPatients = patients.filter(p => dayjs(p.appointmentTime).isSame(date, 'day'));
    return {
      total: dayPatients.length,
      done: dayPatients.filter(p => p.status === 'done').length,
      cancelled: dayPatients.filter(p => p.status === 'cancelled').length,
      no_show: dayPatients.filter(p => p.status === 'no_show').length
    };
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Clinic Dashboard
          </h1>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setViewMode('overview')}
              className={`text-sm font-medium pb-1 transition-colors ${viewMode === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`text-sm font-medium pb-1 transition-colors ${viewMode === 'calendar' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Calendar History
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {viewMode === 'overview' ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Today's Patients</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stats.todayCount}</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Weekly Total</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stats.weeklyCount}</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Avg. Wait Time</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stats.avgWaitTime}m</h3>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Trend */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-6">Weekly Patient Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="patients" 
                        stroke="#4f46e5" 
                        strokeWidth={3} 
                        dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Room Utilization */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-6">Today's Room Utilization</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.roomUtilization} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {selectedDate.format('MMMM YYYY')}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setSelectedDate(d => d.subtract(1, 'month'))} className="p-2 hover:bg-slate-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button onClick={() => setSelectedDate(dayjs())} className="px-3 py-1 text-sm font-medium hover:bg-slate-100 rounded-lg text-slate-600">
                  Today
                </button>
                <button onClick={() => setSelectedDate(d => d.add(1, 'month'))} className="p-2 hover:bg-slate-100 rounded-lg">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden flex-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase">
                  {day}
                </div>
              ))}
              {calendarDays.map((date, i) => {
                const dayStats = getDayStats(date);
                const isCurrentMonth = date.month() === selectedDate.month();
                const isToday = date.isSame(dayjs(), 'day');
                
                return (
                  <div 
                    key={i} 
                    onClick={() => onDateSelect(date.toDate())}
                    className={`bg-white p-2 min-h-[100px] hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col ${!isCurrentMonth ? 'bg-slate-50/50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                        {date.date()}
                      </span>
                    </div>
                    {dayStats.total > 0 && (
                      <div className="flex-1 flex flex-col gap-1 mt-1">
                        <div className="text-[10px] px-1 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold flex justify-between">
                          <span>Total:</span>
                          <span>{dayStats.total}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-0.5">
                          {dayStats.done > 0 && (
                            <div className="text-[9px] px-1 bg-emerald-50 text-emerald-700 rounded flex justify-between">
                              <span>Done:</span>
                              <span>{dayStats.done}</span>
                            </div>
                          )}
                          {dayStats.no_show > 0 && (
                            <div className="text-[9px] px-1 bg-amber-50 text-amber-700 rounded flex justify-between">
                              <span>No Show:</span>
                              <span>{dayStats.no_show}</span>
                            </div>
                          )}
                          {dayStats.cancelled > 0 && (
                            <div className="text-[9px] px-1 bg-rose-50 text-rose-700 rounded flex justify-between">
                              <span>Cancel:</span>
                              <span>{dayStats.cancelled}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
