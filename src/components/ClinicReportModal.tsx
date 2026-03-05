import React, { useState } from 'react';
import { X, Sparkles, FileText, Download, RefreshCw, TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';
import { Patient, Room } from '../types';
import { analyzeClinicStatus } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import dayjs from 'dayjs';

interface ClinicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  rooms: Room[];
}

export function ClinicReportModal({ isOpen, onClose, patients, rooms }: ClinicReportModalProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const data = await analyzeClinicStatus(patients, rooms);
      setReport(data);
    } catch (error) {
      console.error('Failed to generate clinic report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Clinic Performance Report</h2>
              <p className="text-indigo-100 text-sm">Generated on {dayjs().format('MMMM D, YYYY')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {!report && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to analyze performance?</h3>
                <p className="text-slate-500 mb-8">Gemini will analyze patient flow, room utilization, and wait times to provide a comprehensive operational report.</p>
                <button 
                  onClick={generateReport}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-5 h-5" />
                  Generate Full Report
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <Sparkles className="w-8 h-8 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-1">Gemini is thinking...</h3>
                <p className="text-slate-500 animate-pulse">Processing clinic data and generating insights</p>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-indigo-600 mb-2"><TrendingUp className="w-6 h-6" /></div>
                  <div className="text-2xl font-bold text-slate-900">{report.efficiencyScore}%</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efficiency</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-emerald-600 mb-2"><Users className="w-6 h-6" /></div>
                  <div className="text-2xl font-bold text-slate-900">{patients.length}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Patients</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-amber-600 mb-2"><Clock className="w-6 h-6" /></div>
                  <div className="text-2xl font-bold text-slate-900">{rooms.length}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Rooms</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-rose-600 mb-2"><AlertTriangle className="w-6 h-6" /></div>
                  <div className="text-2xl font-bold text-slate-900">{report.alerts.length}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority Issues</div>
                </div>
              </div>

              {/* Executive Summary */}
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                  Executive Summary
                </h3>
                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 italic text-slate-700 leading-relaxed font-serif text-lg">
                  "{report.summary}"
                </div>
              </section>

              {/* Detailed Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 bg-rose-500 rounded-full" />
                    Operational Alerts
                  </h3>
                  <div className="space-y-4">
                    {report.alerts.map((alert: any, i: number) => (
                      <div key={i} className={`p-4 rounded-xl border flex gap-4 ${
                        alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                        alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                        'bg-blue-50 border-blue-100 text-blue-900'
                      }`}>
                        <div className="mt-0.5">
                          {alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        </div>
                        <p className="text-sm font-medium">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                    Strategic Recommendations
                  </h3>
                  <div className="space-y-3">
                    {report.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-600 font-medium">{rec}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <button 
            onClick={() => setReport(null)}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Reset Analysis
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            {report && (
              <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
