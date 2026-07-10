import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Users, Building2, DollarSign, AlertTriangle, 
  CheckCircle, Ban, Search, ShieldCheck, FileText, Settings, 
  MapPin, Clock, ArrowUpRight, TrendingUp, Sparkles, UserMinus, MessageSquare
} from 'lucide-react';
import { IndividualProvider, CompanyEmployee, Complaint, EmergencyRequest } from '../types';
import { cn } from '@/src/lib/utils';

interface SuperAdminDashboardProps {
  providers: IndividualProvider[];
  employees: CompanyEmployee[];
  complaints: Complaint[];
  requests: EmergencyRequest[];
  onApproveProvider: (id: string) => void;
  onSuspendProvider: (id: string) => void;
  onResolveComplaint: (id: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  providers,
  employees,
  complaints,
  requests,
  onApproveProvider,
  onSuspendProvider,
  onResolveComplaint
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'fraud' | 'complaints' | 'audits'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering users
  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-[#08090C] text-slate-100 p-4 md:p-8 overflow-y-auto font-sans relative">
      {/* Luxury strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
              System Root Level
            </span>
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-bold">Encrypted Super-Admin Session</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            AutoRescue <span className="text-orange-500">HQ Dashboard</span>
          </h1>
        </div>
      </div>

      {/* Global telemetry grids */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111317] border border-white/10 p-5 rounded-3xl">
          <span className="text-[9px] text-slate-500 uppercase block font-bold">Global Motorists</span>
          <span className="text-2xl font-black text-white">1,402 Active</span>
        </div>
        <div className="bg-[#111317] border border-white/10 p-5 rounded-3xl">
          <span className="text-[9px] text-slate-500 uppercase block font-bold">Independent Deployed</span>
          <span className="text-2xl font-black text-white">{providers.length} Verified</span>
        </div>
        <div className="bg-[#111317] border border-white/10 p-5 rounded-3xl">
          <span className="text-[9px] text-slate-500 uppercase block font-bold">Unresolved Incidents</span>
          <span className="text-2xl font-black text-amber-500">{requests.filter(r => r.status === 'pending').length} Callouts</span>
        </div>
        <div className="bg-[#111317] border border-white/10 p-5 rounded-3xl">
          <span className="text-[9px] text-slate-500 uppercase block font-bold">Gross Billing (UGX)</span>
          <span className="text-2xl font-black text-emerald-400">89.4M</span>
        </div>
      </div>

      {/* Primary tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto pb-1">
        {[
          { id: 'users', label: 'Approve Deployed Responders', icon: Users },
          { id: 'fraud', label: 'AI Fraud Telemetry', icon: Sparkles },
          { id: 'complaints', label: 'Motorist Complaints', icon: AlertTriangle },
          { id: 'audits', label: 'System Audit Trails', icon: FileText }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border-b-2",
                activeTab === t.id 
                  ? 'border-orange-500 text-orange-400 bg-orange-500/5' 
                  : 'border-transparent text-slate-400 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: USERS APPROVAL DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Approve Deployed Responders</h3>
              <p className="text-xs text-slate-400">Review National IDs, Class B Driving Permits, and UPF Police clearances to grant live platform dispatch access.</p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search independent providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 w-64"
              />
            </div>
          </div>

          <div className="bg-[#111317] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                  <th className="p-4">Provider Details</th>
                  <th className="p-4">Service Category</th>
                  <th className="p-4">Mobile Unit vehicle</th>
                  <th className="p-4">Credential Status</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Approve Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProviders.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-all">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.avatar} className="w-8 h-8 rounded-lg object-cover ring-2 ring-orange-500/10" />
                        <div>
                          <h5 className="font-bold text-white text-sm">{p.name}</h5>
                          <p className="text-slate-400 text-[10px] mt-0.5">{p.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">{p.serviceType}</td>
                    <td className="p-4 text-slate-300 font-medium">{p.vehicle}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", p.idVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>NIRA ID</span>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", p.permitApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>Permit B</span>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", p.policeCleared ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>Police Ok</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white">{p.rating} ★</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {!p.idVerified || !p.permitApproved ? (
                        <button
                          onClick={() => onApproveProvider(p.id)}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-black text-[10px] px-3 py-1.5 rounded-lg transition-all uppercase"
                        >
                          Approve Permit
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                          <button
                            onClick={() => onSuspendProvider(p.id)}
                            className="bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 text-[9px] px-2 py-1 rounded transition-all uppercase"
                          >
                            Suspend
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: AI FRAUD TELEMETRY */}
      {activeTab === 'fraud' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">AI Fraud & Security Telemetry</h3>
            <p className="text-xs text-slate-400">Real-time artificial intelligence checks auditing distance claims, billing inflation, and simulated GPS collusion alerts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Warnings */}
            <div className="bg-[#111317] border border-white/10 rounded-3xl p-6 space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Active Collusion Warnings
              </h4>

              <div className="space-y-3 text-xs">
                {[
                  { id: 'AL-402', title: 'Suspicious Tow Fee Inflation', desc: 'Ssekandi Ronald charged 280,000 UGX for a standard flatbed route of 4km. System baseline: 120,000 UGX.', risk: 'High Risk' },
                  { id: 'AL-398', title: 'GPS Mocking Telemetry Detected', desc: 'An operator terminal triggered 8 position updates in 1 second, signaling mock GPS spoofing around Acacia Mall.', risk: 'Critical Risk' }
                ].map((al, idx) => (
                  <div key={idx} className="bg-red-500/5 border border-red-500/15 p-4 rounded-2xl flex items-start gap-3">
                    <span className="text-[9px] uppercase font-black px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 mt-0.5 shrink-0">
                      {al.risk}
                    </span>
                    <div>
                      <h5 className="font-bold text-white">{al.title}</h5>
                      <p className="text-slate-400 mt-1 leading-normal">{al.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fraud Risk Assessment Breakdown */}
            <div className="bg-[#111317] border border-white/10 rounded-3xl p-6">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-orange-500" />
                AI Dispatch Cost Optimizer
              </h4>
              <p className="text-xs text-slate-400 leading-normal mb-6">Our automated dispatch baseline leverages historic Kampala Road gridlock metrics and weather indices to guarantee fair payments for both motorist and dispatcher.</p>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-slate-400 font-bold">Standard Tow (10km):</span>
                  <span className="font-mono text-white">UGX 120,000 - 150,000</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-slate-400 font-bold">Rain Peak Hour Index:</span>
                  <span className="text-orange-400 font-bold">Multiplier 1.25x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">MoMo Fraud Check Timeout:</span>
                  <span className="text-emerald-400 font-bold">Active (300s)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MOTORIST COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Motorist & Case Complaints</h3>
            <p className="text-xs text-slate-400">Review reported driver misconduct, billing claims, and dispute cases across Uganda Central operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complaints.map(c => (
              <div key={c.id} className="bg-[#111317] border border-white/10 p-6 rounded-3xl shadow-md relative">
                <div className={cn("absolute top-0 left-0 right-0 h-[2px]", c.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')} />
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">
                    Reporter: {c.reporterName} ({c.reporterRole})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{c.date}</span>
                </div>

                <h4 className="font-bold text-white text-base">{c.subject}</h4>
                <p className="text-xs text-slate-300 mt-2 bg-black/20 p-3 rounded-2xl border border-white/5 leading-normal">
                  {c.details}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className={cn("text-[9px] uppercase font-black px-2.5 py-1 rounded border",
                    c.status === 'pending' ? 'bg-amber-500/25 text-amber-400 border-amber-500/30 animate-pulse' : 'bg-emerald-500/25 text-emerald-400 border-emerald-500/30'
                  )}>
                    {c.status}
                  </span>

                  {c.status === 'pending' && (
                    <button
                      onClick={() => onResolveComplaint(c.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] px-3 py-1.5 rounded-lg uppercase transition-all"
                    >
                      Resolve Case
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: SYSTEM AUDIT TRAILS */}
      {activeTab === 'audits' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-xl font-bold text-white">System Audit Trails</h3>
            <p className="text-xs text-slate-400">Real-time transaction events, administrative interventions, and secure login telemetry.</p>
          </div>

          <div className="bg-[#111317] border border-white/10 rounded-3xl p-6 space-y-4 font-mono text-[10px] text-slate-300">
            {[
              { time: '2026-07-09T01:51:24', event: 'AUTH_SUCCESS', desc: 'Secure SuperAdmin login initialized via terminal ID 9021', status: 'OK' },
              { time: '2026-07-09T01:48:10', event: 'MOMO_PAY_CALLBACK', desc: 'Flutterwave gateway callback approved for Request #3021 (Arthur Namara)', status: 'SUCCESS' },
              { time: '2026-07-09T01:32:04', event: 'FLEET_ASSIGN_EVENT', desc: 'Manual route dispatch for Kato Paul completed by AA Uganda Admin', status: 'OK' }
            ].map((ad, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 bg-black/30 rounded-xl border border-white/5">
                <span className="text-slate-500 font-bold">{ad.time}</span>
                <div>
                  <span className="font-bold text-orange-400 font-mono">[{ad.event}]</span>
                  <p className="text-slate-300 mt-1 leading-normal">{ad.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
