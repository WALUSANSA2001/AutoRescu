import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Users, Truck, DollarSign, Plus, Download, 
  MapPin, ShieldCheck, FileText, Search, UserCheck, Trash, 
  UserMinus, Ban, Check, Map, RefreshCw, Star, Info, AlertTriangle, Key, X
} from 'lucide-react';
import { FleetVehicle, CompanyEmployee, EmergencyRequest, IndividualProvider } from '../types';
import { LiveMap } from './LiveMap';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

interface CompanyDashboardProps {
  fleet: FleetVehicle[];
  employees: CompanyEmployee[];
  requests: EmergencyRequest[];
  onAddVehicle: (veh: FleetVehicle) => void;
  onAddEmployee: (emp: CompanyEmployee) => void;
  onToggleEmployeeStatus: (id: string) => void;
  onAssignJob: (requestId: string, employeeId: string) => void;
  providers: IndividualProvider[];
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  fleet,
  employees,
  requests,
  onAddVehicle,
  onAddEmployee,
  onToggleEmployeeStatus,
  onAssignJob,
  providers
}) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'employees' | 'jobs' | 'verify'>('fleet');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  
  // Invitation code generation states
  const [inviteCodePrefix, setInviteCodePrefix] = useState('AA-UGANDA-');
  const [generatedCodes, setGeneratedCodes] = useState<string[]>(['AA-KAMPALA-KATO', 'AA-KAMPALA-ACENG']);
  
  // Form States
  const [newVehicle, setNewVehicle] = useState({
    name: '', type: 'Towing Flatbed', fuelLevel: 100, status: 'active' as const, maintSchedule: 'Jul 28, 2026'
  });
  const [newEmployee, setNewEmployee] = useState({
    name: '', role: 'Lead Operator', phone: '', inviteCode: ''
  });

  // Assign job select states
  const [selectedJobIdForAssign, setSelectedJobIdForAssign] = useState<string | null>(null);

  // Generate a random invite code
  const handleGenerateInviteCode = () => {
    const code = inviteCodePrefix + Math.random().toString(36).substr(2, 6).toUpperCase();
    setGeneratedCodes(prev => [code, ...prev]);
  };

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.name) return;
    
    onAddVehicle({
      id: 'fv-' + Math.random().toString(36).substr(2, 4),
      name: newVehicle.name,
      type: newVehicle.type,
      latitude: 0.3476 + (Math.random() - 0.5) * 0.05,
      longitude: 32.5825 + (Math.random() - 0.5) * 0.05,
      fuelLevel: Number(newVehicle.fuelLevel),
      status: newVehicle.status,
      maintSchedule: newVehicle.maintSchedule
    });

    setShowAddVehicleModal(false);
    setNewVehicle({
      name: '', type: 'Towing Flatbed', fuelLevel: 100, status: 'active', maintSchedule: 'Jul 28, 2026'
    });
  };

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.phone) return;

    onAddEmployee({
      id: 'emp-' + Math.random().toString(36).substr(2, 4),
      name: newEmployee.name,
      role: newEmployee.role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      phone: newEmployee.phone,
      inviteCode: newEmployee.inviteCode || generatedCodes[0] || 'AA-GENERIC-KEY',
      status: 'active',
      rating: 5.0,
      earnings: 0
    });

    setShowAddEmployeeModal(false);
    setNewEmployee({ name: '', role: 'Lead Operator', phone: '', inviteCode: '' });
  };

  // Mock Export Report
  const triggerExport = (format: 'PDF' | 'EXCEL') => {
    alert(`Successfully generated and exported AA Uganda fleet operations logs as ${format}.`);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#08090C] text-slate-100 p-4 md:p-8 overflow-y-auto font-sans relative">
      {/* Triple stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
              Corporate Enterprise Panel
            </span>
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-bold">Authorized Branch: AA Uganda (Kampala HQ)</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Fleet <span className="text-orange-500">Command Center</span>
          </h1>
        </div>

        {/* Generate Reports Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerExport('PDF')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={() => triggerExport('EXCEL')}
            className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-orange-600/10"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111317] border border-white/10 p-5 rounded-3xl">
          <span className="text-[9px] text-slate-500 uppercase block font-bold">Active Fleet Units</span>
          <span className="text-2xl font-black text-white">{fleet.length} Deployed</span>
        </div>
        <div className="bg-[#111317] border border-white/10 p-5 rounded-3xl">
          <span className="text-[9px] text-slate-500 uppercase block font-bold">Company Staff</span>
          <span className="text-2xl font-black text-white">{employees.length} Engineers</span>
        </div>
        <div className="bg-[#111317] border border-white/10 p-5 rounded-3xl">
          <span className="text-[9px] text-slate-500 uppercase block font-bold">Active Dispatches</span>
          <span className="text-2xl font-black text-white">{requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length} Ongoing</span>
        </div>
        <div className="bg-[#111317] border border-white/10 p-5 rounded-3xl">
          <span className="text-[9px] text-slate-500 uppercase block font-bold">Branch Revenue (UGX)</span>
          <span className="text-2xl font-black text-emerald-400">14.8M</span>
        </div>
      </div>

      {/* Navigation sub tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto pb-1">
        {[
          { id: 'fleet', label: 'Fleet & GPS coordinates', icon: Truck },
          { id: 'employees', label: 'Crew & Invitation Keys', icon: Users },
          { id: 'jobs', label: 'Manual Job Assignments', icon: MapPin },
          { id: 'verify', label: 'URSB & TIN credentials', icon: ShieldCheck }
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

      {/* VIEW 1: FLEET REGISTRY */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Active Fleet Units</h3>
              <p className="text-xs text-slate-400 font-medium">Real-time GPS coordinates, vehicle telemetry fuel meters, and scheduled service logs.</p>
            </div>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>

          {/* Bird's-Eye Live Operational GPS Map */}
          <LiveMap 
            requests={requests}
            providers={providers}
            fleet={fleet}
            employees={employees}
            role="company"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fleet.map(v => (
              <div key={v.id} className="bg-[#111317] border border-white/10 rounded-3xl p-6 shadow-md relative">
                {/* Visual Status strip */}
                <div className={cn("absolute top-0 left-0 right-0 h-[2px]", 
                  v.status === 'active' ? 'bg-emerald-500' : v.status === 'idle' ? 'bg-amber-500' : 'bg-red-500'
                )} />

                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className={cn("text-[9px] uppercase font-black px-2 py-0.5 rounded",
                    v.status === 'active' ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30' :
                    v.status === 'idle' ? 'bg-amber-500/25 text-amber-400 border border-amber-500/30' :
                    'bg-red-500/25 text-red-400 border border-red-500/30'
                  )}>
                    {v.status}
                  </span>
                </div>

                <h4 className="font-bold text-white text-base">{v.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{v.type}</p>

                {/* Live Driver & Fuel telemetry meters */}
                <div className="grid grid-cols-2 gap-4 my-4 bg-black/20 p-3 rounded-2xl border border-white/5 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Assigned Driver</span>
                    <span className="text-white font-semibold truncate block">{v.driverName || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Fuel Meter</span>
                    <span className={cn("font-bold block", v.fuelLevel < 50 ? 'text-red-400' : 'text-emerald-400')}>{v.fuelLevel}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">GPS Coordinates</span>
                    <span className="text-slate-300 font-mono text-[10px]">{v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next Maintenance</span>
                    <span className="text-orange-400 font-bold">{v.maintSchedule}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: CREW & INVITATION KEYS */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Staff Directory */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Staff & Crew Directory</h3>
                  <p className="text-xs text-slate-400">Manage roadside technicians, track historical customer ratings, and toggled suspensions.</p>
                </div>
                <button
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Crew Member
                </button>
              </div>

              <div className="bg-[#111317] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                      <th className="p-4">Name & Role</th>
                      <th className="p-4">Phone Line</th>
                      <th className="p-4">Invite Code Used</th>
                      <th className="p-4">Performance</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-white/5 transition-all">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={emp.avatar} className="w-8 h-8 rounded-lg object-cover ring-2 ring-orange-500/10" />
                            <div>
                              <h5 className="font-bold text-white text-sm">{emp.name}</h5>
                              <p className="text-slate-400 text-[10px] mt-0.5">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-300">{emp.phone}</td>
                        <td className="p-4 font-mono text-orange-400">{emp.inviteCode}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-white">{emp.rating}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded",
                            emp.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          )}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => onToggleEmployeeStatus(emp.id)}
                            className={cn(
                              "text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all",
                              emp.status === 'active' 
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            )}
                          >
                            {emp.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Generate Invitation Keys */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#111317] border border-white/10 rounded-3xl p-5 shadow-xl">
                <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-400" />
                  Invitation Codes
                </h3>
                <p className="text-xs text-slate-400 mb-6">Create unique recruitment invite codes. When a newly registered operator signs up using these codes, they instantly bind to the AA Uganda fleet.</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Company Prefix</label>
                    <input 
                      type="text" 
                      value={inviteCodePrefix}
                      onChange={(e) => setInviteCodePrefix(e.target.value.toUpperCase())}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white uppercase font-mono font-bold"
                    />
                  </div>

                  <button
                    onClick={handleGenerateInviteCode}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs tracking-wider py-3 rounded-xl transition-all shadow-md shadow-orange-600/10"
                  >
                    Generate Invitation Code
                  </button>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-2">Available Invite codes:</span>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {generatedCodes.map((code, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-black/30 p-2.5 rounded-xl border border-white/5 font-mono text-xs">
                          <span className="text-orange-400 font-bold">{code}</span>
                          <span className="text-[9px] text-slate-500 uppercase font-bold">Unused</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MANUAL DISPATCH ASSIGNMENTS */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Emergency Job Assignments</h3>
            <p className="text-xs text-slate-400">Manually select any pending customer request and assign it to an active AA Uganda crew operator on the map.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left List: Pending Incidents */}
            <div className="space-y-4">
              <span className="text-[10px] text-slate-500 uppercase font-black block tracking-wider">Pending Incidents Waiting for Crew</span>
              
              {requests.filter(r => r.status === 'pending').map(job => (
                <div 
                  key={job.id}
                  onClick={() => setSelectedJobIdForAssign(job.id)}
                  className={cn(
                    "p-5 rounded-2xl border transition-all cursor-pointer relative",
                    selectedJobIdForAssign === job.id 
                      ? "border-orange-500 bg-orange-500/5 shadow-[0_0_12px_rgba(249,115,22,0.1)]" 
                      : "border-white/5 bg-[#111317]/60 hover:border-white/15"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      {job.severity} Severity
                    </span>
                    <span className="font-mono text-orange-400 text-xs font-bold">#{job.id}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{job.serviceType} Rescue</h4>
                  <p className="text-xs text-slate-400 mt-1">Location: {job.locationName}</p>
                  <p className="text-xs text-slate-300 mt-3 bg-black/20 p-2 rounded-xl">{job.description}</p>
                </div>
              ))}

              {requests.filter(r => r.status === 'pending').length === 0 && (
                <p className="text-xs text-slate-500 italic py-4">No pending emergencies found. All motorists are served.</p>
              )}
            </div>

            {/* Right List: Eligible Crew */}
            <div className="space-y-4">
              <span className="text-[10px] text-slate-500 uppercase font-black block tracking-wider">Select Available Crew to Assign</span>
              
              <div className="space-y-3">
                {employees.filter(e => e.status === 'active').map(crew => (
                  <div key={crew.id} className="bg-[#111317] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={crew.avatar} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-white text-sm">{crew.name}</h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{crew.role} • {crew.rating} ★</span>
                      </div>
                    </div>

                    <button
                      disabled={!selectedJobIdForAssign}
                      onClick={() => {
                        if (selectedJobIdForAssign) {
                          onAssignJob(selectedJobIdForAssign, crew.id);
                          setSelectedJobIdForAssign(null);
                        }
                      }}
                      className="bg-orange-600 disabled:opacity-50 hover:bg-orange-500 text-white font-black text-[10px] px-4 py-2.5 rounded-xl uppercase transition-all"
                    >
                      Assign Route
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: COMPANY VERIFICATION */}
      {activeTab === 'verify' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-xl font-bold text-white">Company Registration & Licensing</h3>
            <p className="text-xs text-slate-400">Manage corporate certificates, registration details with URSB, and tax clearance certifications.</p>
          </div>

          <div className="bg-[#111317] border border-white/10 rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h5 className="font-bold text-white text-sm">URSB License Validated</h5>
                <p className="text-slate-400 mt-0.5">Registration status verified by Uganda Registration Services Bureau.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block mb-1">Taxpayer Identification Number (TIN)</span>
                <input type="text" readOnly value="1009827381" className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl font-mono text-orange-400" />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Company Registered Name</span>
                <input type="text" readOnly value="AA Uganda (Rescue Branch)" className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white font-bold" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD VEHICLE */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0C0E12] border border-white/10 rounded-3xl p-6 relative"
          >
            <button onClick={() => setShowAddVehicleModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Add Fleet Unit</h3>

            <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Vehicle Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. AA Rescue Ranger 04" 
                  required
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Vehicle Type</label>
                <select 
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white"
                >
                  <option>Towing Flatbed</option>
                  <option>Heavy Tow Crane</option>
                  <option>Fuel Utility Van</option>
                  <option>Ambulance</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Fuel Level (%)</label>
                <input 
                  type="number" 
                  max="100" 
                  value={newVehicle.fuelLevel}
                  onChange={(e) => setNewVehicle({...newVehicle, fuelLevel: Number(e.target.value)})}
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white"
                />
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase py-3 rounded-xl">
                Add Vehicle
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0C0E12] border border-white/10 rounded-3xl p-6 relative"
          >
            <button onClick={() => setShowAddEmployeeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Add Crew Member</h3>

            <form onSubmit={handleAddEmployeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kato Paul" 
                  required
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Operational Role</label>
                <input 
                  type="text" 
                  placeholder="e.g. Lead Tow Operator" 
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Phone Line</label>
                <input 
                  type="text" 
                  placeholder="e.g. +256 774 123456" 
                  required
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Bind to Invite Code</label>
                <select 
                  value={newEmployee.inviteCode}
                  onChange={(e) => setNewEmployee({...newEmployee, inviteCode: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white"
                >
                  <option value="">Select Code</option>
                  {generatedCodes.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase py-3 rounded-xl">
                Add Crew Member
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
