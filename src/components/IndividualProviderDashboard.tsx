import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, ShieldAlert, Zap, Clock, DollarSign, 
  MapPin, User, Star, Award, Settings, Bell, ChevronRight, 
  Activity, Play, Eye, LogOut, Check, X, FileText, Lock, 
  TrendingUp, BarChart3, ShieldCheck
} from 'lucide-react';
import { IndividualProvider, EmergencyRequest, FleetVehicle, CompanyEmployee } from '../types';
import { LiveMap } from './LiveMap';
import { cn } from '@/src/lib/utils';

interface IndividualProviderProps {
  provider: IndividualProvider;
  onUpdateProvider: (updated: IndividualProvider) => void;
  requests: EmergencyRequest[];
  onAcceptRequest: (id: string, providerId: string) => void;
  onRejectRequest: (id: string) => void;
  onCompleteRequest: (id: string) => void;
  providers: IndividualProvider[];
  fleet: FleetVehicle[];
  employees: CompanyEmployee[];
}

export const IndividualProviderDashboard: React.FC<IndividualProviderProps> = ({
  provider,
  onUpdateProvider,
  requests,
  onAcceptRequest,
  onRejectRequest,
  onCompleteRequest,
  providers,
  fleet,
  employees
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'verify' | 'earnings' | 'equipment'>('jobs');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  
  // Find pending or en-route job assigned to this provider
  const incomingJobs = requests.filter(r => r.status === 'pending');
  const myCurrentJob = requests.find(r => r.providerId === provider.id && ['accepted', 'en_route', 'arrived'].includes(r.status));

  // Toggle provider availability
  const toggleAvailability = () => {
    const nextStatus = provider.status === 'online' ? 'offline' : 'online';
    onUpdateProvider({
      ...provider,
      status: nextStatus
    });
  };

  // Withdraw request handler
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0 || amount > provider.earnings) return;
    setIsWithdrawing(true);

    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => {
        onUpdateProvider({
          ...provider,
          earnings: provider.earnings - amount
        });
        setWithdrawSuccess(false);
        setWithdrawAmount('');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#08090C] text-slate-100 p-4 md:p-8 overflow-y-auto font-sans relative">
      {/* Luxury Color Stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Independent Service Provider
            </span>
            <div className={cn("w-2 h-2 rounded-full", provider.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
            <span className="text-xs text-slate-400 font-bold capitalize">Status: {provider.status}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Technician <span className="text-orange-500">Workspace</span>
          </h1>
        </div>

        {/* Action Toggle Availability */}
        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 uppercase block font-bold">Duty Status</span>
            <span className="text-xs text-white font-bold">{provider.status === 'online' ? 'Available for Rescue' : 'Offline'}</span>
          </div>
          <button
            onClick={toggleAvailability}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              provider.status === 'online'
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10"
            )}
          >
            {provider.status === 'online' ? 'Go Off-Duty' : 'Go On-Duty'}
          </button>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto pb-1">
        {[
          { id: 'jobs', label: 'My Dispatches', icon: Zap },
          { id: 'verify', label: 'Credentials & Verification', icon: ShieldCheck },
          { id: 'earnings', label: 'Wallet & Earnings', icon: DollarSign },
          { id: 'equipment', label: 'Gear & Equipment', icon: Settings }
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

      {/* Main Content Sections */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Dispatch requests and Current Job column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. If currently on a rescue job */}
            {myCurrentJob ? (
              <div className="bg-[#111317] border border-orange-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                <span className="text-[9px] font-black bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Active Emergency Job
                </span>
                
                <h3 className="text-xl font-bold text-white mt-4">{myCurrentJob.serviceType} Rescue Service</h3>
                <p className="text-xs text-slate-400 mt-1">Victim: <span className="text-white font-bold">{myCurrentJob.victimName}</span> ({myCurrentJob.victimPhone})</p>

                <div className="bg-black/30 border border-white/5 p-4 rounded-2xl my-4 text-xs space-y-2">
                  <p className="text-slate-300"><span className="font-bold text-slate-500">Location:</span> {myCurrentJob.locationName}</p>
                  <p className="text-slate-300"><span className="font-bold text-slate-500">Incident:</span> {myCurrentJob.description}</p>
                  {myCurrentJob.destination && (
                    <p className="text-slate-300"><span className="font-bold text-slate-500">Tow Tow:</span> {myCurrentJob.destination}</p>
                  )}
                </div>

                {/* Job Stepper Controls */}
                <div className="grid grid-cols-2 gap-3">
                  {myCurrentJob.status === 'accepted' && (
                    <button
                      onClick={() => onCompleteRequest(myCurrentJob.id)} // mock steps
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
                    >
                      En Route (Start GPS)
                    </button>
                  )}
                  {myCurrentJob.status === 'en_route' && (
                    <button
                      onClick={() => onCompleteRequest(myCurrentJob.id)}
                      className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
                    >
                      Report Arrival On Scene
                    </button>
                  )}
                  {['accepted', 'en_route', 'arrived'].includes(myCurrentJob.status) && (
                    <button
                      onClick={() => onCompleteRequest(myCurrentJob.id)}
                      className="w-full col-span-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/10"
                    >
                      Complete Rescue (Acquire Signature)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center py-10">
                <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h4 className="font-bold text-white text-base">No active jobs assigned</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Toggle duty to online to automatically receive emergency alerts across Kampala Road and expressway sections.</p>
              </div>
            )}

            {/* 2. Incoming Emergency List */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Incoming Dispatches Nearby</h3>
              <div className="space-y-4">
                {incomingJobs.map(job => (
                  <div key={job.id} className="bg-[#111317] border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                          Severity: {job.severity}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-2">{job.serviceType} Breakdown</h4>
                        <p className="text-xs text-slate-400 mt-1">{job.locationName}</p>
                      </div>
                      <span className="text-xs font-black text-white font-mono">UGX {job.cost?.toLocaleString() || '120,000'}</span>
                    </div>

                    <p className="text-xs text-slate-300 mt-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                      {job.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => onRejectRequest(job.id)}
                        className="bg-red-950/20 hover:bg-red-950/50 text-red-400 border border-red-500/15 font-black text-[10px] py-2.5 rounded-xl uppercase tracking-wider"
                      >
                        Reject Job
                      </button>
                      <button
                        onClick={() => onAcceptRequest(job.id, provider.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10"
                      >
                        Accept Rescue
                      </button>
                    </div>
                  </div>
                ))}

                {incomingJobs.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4 italic">Scanning for new emergency calls around Kampala...</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT WIDGET: Live GPS Navigation & Kampala Stats */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live GPS Routing and Maps */}
            <LiveMap 
              requests={requests}
              providers={providers}
              fleet={fleet}
              employees={employees}
              activeRequestId={myCurrentJob?.id}
              role="provider"
            />
            
            {/* Performance metrics dashboard */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111317] border border-white/10 p-4 rounded-2xl">
                <span className="text-[9px] text-slate-500 font-bold block uppercase">Rescue Rating</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-black text-white">{provider.rating}</span>
                </div>
              </div>
              <div className="bg-[#111317] border border-white/10 p-4 rounded-2xl">
                <span className="text-[9px] text-slate-500 font-bold block uppercase">Jobs Solved</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-lg font-black text-white">{provider.completions}</span>
                </div>
              </div>
            </div>

            {/* Demand heat map visual */}
            <div className="bg-[#111317] border border-white/10 rounded-3xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                Kampala High-Demand Hotspots
              </h3>
              
              <div className="space-y-3 text-xs">
                {[
                  { spot: 'Kajjansi Toll Plaza (Entebbe Rd)', level: 'Critical Breakdown Zone', percentage: 92, color: 'bg-red-500' },
                  { spot: 'Wandegeya Traffic Intersection', level: 'Moderate Gridlock Risk', percentage: 65, color: 'bg-amber-500' },
                  { spot: 'Jinja Highway (Mukono Bypass)', level: 'High Battery & Tow Demand', percentage: 80, color: 'bg-orange-500' }
                ].map((zone, idx) => (
                  <div key={idx} className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between font-bold mb-1.5">
                      <span className="text-white">{zone.spot}</span>
                      <span className="text-orange-400">{zone.percentage}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", zone.color)} style={{ width: `${zone.percentage}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{zone.level}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CREDENTIALS & VERIFICATION */}
      {activeTab === 'verify' && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h3 className="text-xl font-bold text-white">Verification Status</h3>
            <p className="text-xs text-slate-400">Keep your certifications and ID papers up to date to access larger corporate insurance rescue requests.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { doc: 'National Identification (NIRA)', status: provider.idVerified, desc: 'Verifies Ugandan nationality and biometric validity' },
              { doc: 'Class B/CM Driving Permit', status: provider.permitApproved, desc: 'Enables operating heavy tow apparatus or utility cars' },
              { doc: 'UPF Police Clearance certificate', status: provider.policeCleared, desc: 'Clean background check registered at CPS Kampala' },
              { doc: 'Professional Technical Certification', status: true, desc: 'Diploma in automotive mechanical/electrical engineering' }
            ].map((v, i) => (
              <div key={i} className="bg-[#111317] border border-white/10 p-5 rounded-2xl flex items-start gap-4">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border", 
                  v.status ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                )}>
                  {v.status ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{v.doc}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">{v.desc}</p>
                  <span className={cn("inline-block text-[9px] uppercase font-bold mt-2 px-2 py-0.5 rounded",
                    v.status ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
                  )}>
                    {v.status ? 'Verified & Locked' : 'Pending Action'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: WALLET & EARNINGS */}
      {activeTab === 'earnings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/5 border border-amber-500/20 rounded-3xl p-6">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Withdrawable Funds</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2 font-mono">
                UGX {provider.earnings.toLocaleString()}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Ready for instant mobile money payout or direct bank credit via Flutterwave.</p>
            </div>

            {/* Withdraw form */}
            <div className="bg-[#111317] border border-white/10 rounded-2xl p-5">
              <h4 className="font-bold text-white text-sm mb-3">Initiate MoMo Cashout</h4>
              {withdrawSuccess ? (
                <div className="text-center py-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-white font-bold">Withdrawal of UGX {Number(withdrawAmount).toLocaleString()} Initiated!</p>
                  <p className="text-[10px] text-slate-400 mt-1">Standard mobile money processing completes in 5 minutes.</p>
                </div>
              ) : (
                <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Select Amount (UGX)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 500000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl font-mono text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isWithdrawing || !withdrawAmount}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider py-3 rounded-xl disabled:opacity-50 transition-all"
                  >
                    {isWithdrawing ? 'Sending MoMo API request...' : 'Payout to Registered Mobile Number'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#111317] border border-white/10 rounded-3xl p-6">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Historic Payout receipts
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { id: 'TX-9021', date: 'Jul 4, 2026', method: 'MTN MoMo', amount: 850000 },
                  { id: 'TX-9018', date: 'Jun 28, 2026', method: 'Airtel Money', amount: 1200000 },
                  { id: 'TX-8920', date: 'Jun 14, 2026', method: 'MTN MoMo', amount: 450000 }
                ].map((tx, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="font-mono text-slate-500 block">{tx.id}</span>
                      <span className="text-slate-400 mt-0.5 block">{tx.date} via {tx.method}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">UGX {tx.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: GEAR & EQUIPMENT */}
      {activeTab === 'equipment' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-xl font-bold text-white">Registered Vehicle & Equipment</h3>
            <p className="text-xs text-slate-400">Define your current vehicle and registered tools to customize which emergency rescue routes get sent to your mobile terminal.</p>
          </div>

          <div className="bg-[#111317] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Mobile Workshop Vehicle</span>
                <span className="text-sm font-bold text-white">{provider.vehicle}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">Deployed On-Board Rescue Tools:</span>
              <div className="grid grid-cols-2 gap-3">
                {provider.equipment.map((eq, i) => (
                  <div key={i} className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
