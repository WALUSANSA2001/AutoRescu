import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Check, X, ShieldAlert, Navigation, Sparkles, 
  MapPin, Phone, MessageSquare, Fuel, AlertCircle, TrendingUp, 
  Signature, Upload, Camera, Play, Key, Compass, Star
} from 'lucide-react';
import { CompanyEmployee, EmergencyRequest, IndividualProvider, FleetVehicle } from '../types';
import { LiveMap } from './LiveMap';
import { cn } from '@/src/lib/utils';

interface EmployeeDashboardProps {
  employee: CompanyEmployee;
  onUpdateEmployee: (updated: CompanyEmployee) => void;
  requests: EmergencyRequest[];
  onAcceptRequest: (id: string, providerId: string) => void;
  onCompleteRequest: (id: string) => void;
  providers: IndividualProvider[];
  fleet: FleetVehicle[];
  employees: CompanyEmployee[];
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  employee,
  onUpdateEmployee,
  requests,
  onAcceptRequest,
  onCompleteRequest,
  providers,
  fleet,
  employees
}) => {
  const [activeTab, setActiveTab] = useState<'job' | 'stats' | 'onboarding'>('job');
  
  // Onboarding code states
  const [enteredCode, setEnteredCode] = useState(employee.inviteCode || '');
  const [isOnboarded, setIsOnboarded] = useState(!!employee.inviteCode);
  const [onboardingError, setOnboardingError] = useState('');

  // Fuel request states
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelStation, setFuelStation] = useState('Total Energies Entebbe Rd');
  const [fuelRequestSent, setFuelRequestSent] = useState(false);

  // Completed photo state
  const [jobPhotoUrl, setJobPhotoUrl] = useState('');
  const [customerSignature, setCustomerSignature] = useState('');

  // Pending assigned requests
  const assignedJobs = requests.filter(r => r.status === 'pending');
  const myCurrentJob = requests.find(r => r.providerId === employee.id && ['accepted', 'en_route', 'arrived'].includes(r.status));

  // Handle invitation code onboarding
  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode.trim().toUpperCase() === 'AA-KAMPALA-KATO' || enteredCode.trim().toUpperCase().startsWith('AA-')) {
      setIsOnboarded(true);
      onUpdateEmployee({
        ...employee,
        inviteCode: enteredCode.trim().toUpperCase()
      });
      setOnboardingError('');
    } else {
      setOnboardingError('Invalid invitation code prefix. Request a code from your AA Uganda fleet administrator.');
    }
  };

  // Submit fuel request
  const handleFuelRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelAmount) return;
    setFuelRequestSent(true);
    setTimeout(() => {
      setFuelRequestSent(false);
      setFuelAmount('');
      alert(`Fuel voucher of UGX ${Number(fuelAmount).toLocaleString()} requested at ${fuelStation}. Awaiting company manager approval.`);
    }, 1500);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#08090C] text-slate-100 p-4 md:p-8 overflow-y-auto font-sans relative">
      {/* Luxury Strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 z-10" />

      {/* Onboarding Gate */}
      {!isOnboarded ? (
        <div className="max-w-md mx-auto my-12 bg-[#111317] border border-white/10 rounded-3xl p-6 md:p-8 relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 to-amber-500" />
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Company Operator Onboarding</h2>
          <p className="text-xs text-slate-400 mb-6">Enter the custom invitation code provided by your fleet manager to automatically bind your operator app to the corporate dashboard.</p>

          <form onSubmit={handleOnboard} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Company Invite Code</label>
              <input 
                type="text" 
                placeholder="e.g. AA-KAMPALA-KATO"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-orange-500"
              />
              {onboardingError && <p className="text-red-400 mt-1">{onboardingError}</p>}
            </div>

            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase py-3.5 rounded-xl transition-all">
              Verify & Connect with Company
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-orange-500 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  Company Deployed Crew Member
                </span>
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold">Attached Unit: AA Uganda (Fleet #09)</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Operator <span className="text-orange-500">Terminal</span>
              </h1>
            </div>

            {/* Profile Summary Card */}
            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
              <img src={employee.avatar} className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <h4 className="text-sm font-bold text-white">{employee.name}</h4>
                <p className="text-xs text-slate-400 font-medium">Invited key: <span className="font-mono text-orange-400">{employee.inviteCode}</span></p>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('job')}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border-b-2",
                activeTab === 'job' 
                  ? 'border-orange-500 text-orange-400 bg-orange-500/5' 
                  : 'border-transparent text-slate-400 hover:text-white'
              )}
            >
              <Compass className="w-4 h-4" /> Active Rescue Dispatches
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border-b-2",
                activeTab === 'stats' 
                  ? 'border-orange-500 text-orange-400 bg-orange-500/5' 
                  : 'border-transparent text-slate-400 hover:text-white'
              )}
            >
              <TrendingUp className="w-4 h-4" /> Performance Stats
            </button>
          </div>

          {/* VIEW 1: ACTIVE DISPATCHES */}
          {activeTab === 'job' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Job Queue & Active Duties */}
              <div className="lg:col-span-7 space-y-6">
                
                {myCurrentJob ? (
                  <div className="bg-[#111317] border border-orange-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-md border border-orange-500/20">
                        Current Mission
                      </span>
                      <span className="text-xs font-bold text-orange-500 animate-pulse">Status: {myCurrentJob.status.toUpperCase()}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{myCurrentJob.serviceType} Recovery</h3>
                    <p className="text-xs text-slate-400 mt-1">Motorist: <span className="font-bold text-white">{myCurrentJob.victimName}</span> ({myCurrentJob.victimPhone})</p>

                    <div className="bg-black/20 border border-white/5 p-4 rounded-2xl my-4 text-xs space-y-2">
                      <p className="text-slate-300"><span className="font-bold text-slate-500">Location Spot:</span> {myCurrentJob.locationName}</p>
                      <p className="text-slate-300"><span className="font-bold text-slate-500">Breakdown description:</span> {myCurrentJob.description}</p>
                    </div>

                    {/* Completion verification fields */}
                    <div className="space-y-4 my-6 bg-black/40 p-4 rounded-2xl border border-white/5 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Completion Checkpoints</span>
                      
                      <div>
                        <label className="text-slate-500 block mb-1">Add Job Evidence Photo (URL)</label>
                        <div className="relative">
                          <Camera className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Paste image link or use default"
                            value={jobPhotoUrl}
                            onChange={(e) => setJobPhotoUrl(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-500 block mb-1">Customer Verification Signature (Type full name)</label>
                        <div className="relative">
                          <Signature className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Type Dr. Arthur Namara to sign-off"
                            value={customerSignature}
                            onChange={(e) => setCustomerSignature(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white italic font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <a 
                        href={`tel:${myCurrentJob.victimPhone}`}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-3.5 rounded-xl transition-all uppercase flex items-center justify-center gap-2"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Customer
                      </a>
                      <button
                        onClick={() => {
                          if (!customerSignature) {
                            alert("Please ask customer for verification signature to close this emergency dispatch.");
                            return;
                          }
                          onCompleteRequest(myCurrentJob.id);
                        }}
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs py-3.5 rounded-xl uppercase transition-all shadow-lg"
                      >
                        Sign off Rescue Job
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center py-10">
                    <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <h4 className="font-bold text-white text-base">All assigned tasks completed!</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Stand by on Entebbe Road or Kampala central intersections. New emergency routes will sync automatically.</p>
                  </div>
                )}

                {/* Assigned requests list */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Assigned Company Dispatches</h3>
                  <div className="space-y-4">
                    {assignedJobs.map(job => (
                      <div key={job.id} className="bg-[#111317] border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] uppercase font-bold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20">
                            Severity: {job.severity}
                          </span>
                          <span className="font-mono text-slate-500 text-xs">#{job.id}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{job.serviceType} Emergency</h4>
                        <p className="text-xs text-slate-400 mt-1">{job.locationName}</p>

                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => onAcceptRequest(job.id, employee.id)}
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black text-[10px] py-2.5 rounded-xl uppercase transition-all shadow-md"
                          >
                            Accept Assigned Route
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: GPS Tracking & Fuel Vouchers */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Live GPS Routing map */}
                <LiveMap 
                  requests={requests}
                  providers={providers}
                  fleet={fleet}
                  employees={employees}
                  activeRequestId={myCurrentJob?.id}
                  role="employee"
                />

                {/* Fuel Voucher requests */}
                <div className="bg-[#111317] border border-white/10 rounded-3xl p-5 shadow-xl">
                  <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-orange-500" />
                    Fleet Fuel Vouchers
                  </h3>
                  <p className="text-xs text-slate-400 mb-6 font-medium">Request instant refueling authorizations directly from the AA Uganda back office.</p>

                  <form onSubmit={handleFuelRequestSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Fuel Voucher Amount (UGX)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="e.g. 150000"
                        value={fuelAmount}
                        onChange={(e) => setFuelAmount(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Fuel Station</label>
                      <select 
                        value={fuelStation}
                        onChange={(e) => setFuelStation(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white"
                      >
                        <option>Total Energies Entebbe Rd</option>
                        <option>City Oil Nakawa</option>
                        <option>Shell Bugolobi</option>
                      </select>
                    </div>

                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase py-2.5 rounded-xl transition-all">
                      Request Top-up
                    </button>
                  </form>
                </div>

                {/* Panic SOS button */}
                <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-3xl text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto animate-pulse" />
                  <h4 className="font-bold text-white text-sm">Emergency Operator Panic SOS</h4>
                  <p className="text-xs text-slate-400">Encountering crash scenes or driver confrontation? Trigger a panic SMS to police and AA central headquarters.</p>
                  <button 
                    onClick={() => alert("Panic GPS ping dispatched to Kampala Police Central Station & AA dispatch managers.")}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs py-2.5 rounded-xl transition-all"
                  >
                    Trigger Central Panic
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PERFORMANCE STATISTICS */}
          {activeTab === 'stats' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-xl font-bold text-white">Performance Analytics</h3>
                <p className="text-xs text-slate-400">View customer feedback records, active travel logs, and monthly commission earnings.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111317] border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Customer Rating</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-xl font-black text-white">{employee.rating} / 5</span>
                  </div>
                </div>
                <div className="bg-[#111317] border border-white/10 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Commission Earnings</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xl font-black text-white font-mono">UGX {employee.earnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
