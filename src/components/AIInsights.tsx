import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, Info, RefreshCw, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeClinicStatus } from '../services/geminiService';
import { Patient, Room } from '../types';

interface AIInsightsProps {
  patients: Patient[];
  rooms: Room[];
}

interface InsightData {
  summary: string;
  alerts: Array<{ type: 'warning' | 'info' | 'success'; message: string; patientId?: string }>;
  recommendations: string[];
  efficiencyScore: number;
}

export function AIInsights({ patients, rooms }: AIInsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getInsights = async () => {
    setLoading(true);
    try {
      const data = await analyzeClinicStatus(patients, rooms);
      setInsights(data);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !insights) {
      getInsights();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-bold text-sm shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        AI Clinic Assistant
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Clinic Intelligence</h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Powered by Gemini 3.1</p>
                  </div>
                </div>
                <button 
                  onClick={getInsights}
                  disabled={loading}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium animate-pulse">Analyzing clinic operations...</p>
                  </div>
                ) : insights ? (
                  <>
                    {/* Efficiency Score */}
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Efficiency Score</span>
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-indigo-900">{insights.efficiencyScore}</span>
                        <span className="text-sm text-indigo-600 font-medium mb-1.5">/ 100</span>
                      </div>
                      <div className="mt-3 h-2 bg-indigo-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${insights.efficiencyScore}%` }}
                          className="h-full bg-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Operational Summary</h4>
                      <p className="text-sm text-slate-600 leading-relaxed italic font-serif">
                        "{insights.summary}"
                      </p>
                    </div>

                    {/* Alerts */}
                    {insights.alerts.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Priority Alerts</h4>
                        <div className="space-y-2">
                          {insights.alerts.map((alert, idx) => (
                            <div 
                              key={idx}
                              className={`flex gap-3 p-3 rounded-xl border ${
                                alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                                alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                                'bg-blue-50 border-blue-100 text-blue-800'
                              }`}
                            >
                              {alert.type === 'warning' ? <AlertCircle className="w-5 h-5 shrink-0" /> :
                               alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> :
                               <Info className="w-5 h-5 shrink-0" />}
                              <p className="text-sm font-medium leading-tight">{alert.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {insights.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-slate-600">
                            <span className="text-indigo-600 font-bold">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-sm text-slate-500">Click refresh to analyze clinic data</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <p className="text-[10px] text-slate-400 text-center">
                  AI insights are based on current real-time data and should be verified by clinic staff.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
