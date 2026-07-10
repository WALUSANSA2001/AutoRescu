import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Flame, Shield, Users, Truck, UserCheck, Bot, Sparkles, 
  MapPin, Clock, ArrowRight, Activity, LifeBuoy, Zap, 
  ChevronRight, Heart, Star, Compass, Lock, Unlock, LogOut, Key, ShieldAlert, AlertTriangle, RefreshCw
} from 'lucide-react';

// Import Types
import { 
  UserProfile, EmergencyRequest, IndividualProvider, 
  FleetVehicle, CompanyEmployee, Complaint 
} from './types';

// Import Mock Data
import { 
  INITIAL_USER_PROFILE, INITIAL_REQUESTS, 
  INITIAL_INDIVIDUAL_PROVIDERS, INITIAL_FLEET, 
  INITIAL_EMPLOYEES, INITIAL_COMPLAINTS 
} from './data';

// Import Dashboards
import { LandingPage } from './components/LandingPage';
import { VictimDashboard } from './components/VictimDashboard';
import { IndividualProviderDashboard } from './components/IndividualProviderDashboard';
import { CompanyDashboard } from './components/CompanyDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AIChatbot } from './components/AIChatbot';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  // Global Roles Simulation State
  const [selectedRole, setSelectedRole] = useState<'landing' | 'victim' | 'provider' | 'company' | 'employee' | 'admin'>('landing');

  // Security and Authentication States
  const [currentUser, setCurrentUser] = useState<{ name: string; username: string; role: string } | null>(() => {
    const saved = localStorage.getItem('autore_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [adminOverride, setAdminOverride] = useState<boolean>(() => {
    return localStorage.getItem('autore_admin_override') === 'true';
  });
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(false);
  const [pendingRole, setPendingRole] = useState<'landing' | 'victim' | 'provider' | 'company' | 'employee' | 'admin' | null>(null);
  const [restrictedRoleAttempt, setRestrictedRoleAttempt] = useState<'landing' | 'victim' | 'provider' | 'company' | 'employee' | 'admin' | null>(null);
  const [overridePasswordInput, setOverridePasswordInput] = useState('');
  const [overrideError, setOverrideError] = useState('');

  // Shared Synchronized States
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [requests, setRequests] = useState<EmergencyRequest[]>(INITIAL_REQUESTS);
  const [individualProviders, setIndividualProviders] = useState<IndividualProvider[]>(INITIAL_INDIVIDUAL_PROVIDERS);
  const [fleet, setFleet] = useState<FleetVehicle[]>(INITIAL_FLEET);
  const [employees, setEmployees] = useState<CompanyEmployee[]>(INITIAL_EMPLOYEES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);

  // Time stamp state
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handler: Select roles securely
  const handleSelectRole = (role: 'landing' | 'victim' | 'provider' | 'company' | 'employee' | 'admin') => {
    if (role === 'landing') {
      setSelectedRole('landing');
      return;
    }

    // Check if override is active
    if (adminOverride) {
      setSelectedRole(role);
      return;
    }

    // Check if logged in
    if (!currentUser) {
      setPendingRole(role);
      setShowAuthScreen(true);
      return;
    }

    // Check category restriction
    if (currentUser.role === 'admin' || currentUser.role === role) {
      setSelectedRole(role);
    } else {
      setRestrictedRoleAttempt(role);
    }
  };

  const handleAuthSuccess = (user: { name: string; username: string; role: string }) => {
    setCurrentUser(user);
    localStorage.setItem('autore_user', JSON.stringify(user));
    setShowAuthScreen(false);

    if (user.role === 'victim') {
      setUserProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.username + '@autorescue.ug'
      }));
    }

    if (pendingRole) {
      if (adminOverride || user.role === 'admin' || user.role === pendingRole) {
        setSelectedRole(pendingRole);
      } else {
        setSelectedRole(user.role as any);
        setRestrictedRoleAttempt(pendingRole);
      }
      setPendingRole(null);
    } else {
      setSelectedRole(user.role === 'admin' ? 'admin' : (user.role as any));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAdminOverride(false);
    localStorage.removeItem('autore_user');
    localStorage.removeItem('autore_admin_override');
    setSelectedRole('landing');
  };

  const handleAdminOverrideSuccess = () => {
    setAdminOverride(true);
    localStorage.setItem('autore_admin_override', 'true');
    if (pendingRole) {
      setSelectedRole(pendingRole);
      setPendingRole(null);
    }
    if (restrictedRoleAttempt) {
      setSelectedRole(restrictedRoleAttempt);
      setRestrictedRoleAttempt(null);
    }
  };

  const handleDirectOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideError('');
    const norm = overridePasswordInput.trim();
    if (norm === 'AutoRescue@123' || norm === 'AutoReascue@123') {
      setAdminOverride(true);
      localStorage.setItem('autore_admin_override', 'true');
      if (restrictedRoleAttempt) {
        setSelectedRole(restrictedRoleAttempt);
        setRestrictedRoleAttempt(null);
      }
      setOverridePasswordInput('');
    } else {
      setOverrideError('Incorrect admin password. Try "AutoReascue@123"');
    }
  };

  // Handler: Victim creates emergency request
  const handleCreateRequest = (newReq: Partial<EmergencyRequest>) => {
    const fullRequest: EmergencyRequest = {
      id: 'req-' + Math.floor(Math.random() * 9000 + 1000),
      victimName: userProfile.name,
      victimPhone: userProfile.phone,
      serviceType: newReq.serviceType || 'Towing',
      severity: newReq.severity || 'medium',
      vehicleId: newReq.vehicleId || 'v-1',
      locationName: newReq.locationName || 'Kampala Road',
      destination: newReq.destination,
      description: newReq.description || '',
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      cost: newReq.cost || 120000,
      paymentStatus: 'pending',
      ...newReq
    };

    setRequests(prev => [fullRequest, ...prev]);
  };

  // Handler: Cancel callout
  const handleCancelRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
  };

  // Handler: Accept request (Assigned operator accepts)
  const handleAcceptRequest = (id: string, providerId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        // Find if provider is employee or individual
        const indProv = individualProviders.find(p => p.id === providerId);
        const empProv = employees.find(e => e.id === providerId);
        
        return { 
          ...r, 
          status: 'accepted',
          providerId,
          providerName: indProv ? indProv.name : empProv ? empProv.name : 'AA Operator',
          providerPhone: indProv ? indProv.phone : empProv ? empProv.phone : '+256 700 000 000',
          providerAvatar: indProv ? indProv.avatar : empProv ? empProv.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
          providerVehicle: indProv ? indProv.vehicle : 'AA Fleet Vehicle'
        };
      }
      return r;
    }));
  };

  // Handler: Complete request and sign-off
  const handleCompleteRequest = (id: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        // Disburse earnings to provider
        if (r.providerId?.startsWith('ip-')) {
          setIndividualProviders(prevInd => prevInd.map(p => p.id === r.providerId ? { ...p, completions: p.completions + 1, earnings: p.earnings + (r.cost || 120000) } : p));
        } else if (r.providerId?.startsWith('emp-')) {
          setEmployees(prevEmp => prevEmp.map(e => e.id === r.providerId ? { ...e, earnings: e.earnings + 25000 } : e)); // 25,000 UGX commission per company dispatch
        }
        return { ...r, status: 'completed', eta: 'Completed' };
      }
      return r;
    }));
  };

  // Handler: Reject request
  const handleRejectRequest = (id: string) => {
    // Just reset the providerId so it's dispatchable again
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'pending', providerId: undefined } : r));
  };

  // Handler: Pay request
  const handlePayRequest = (id: string, method: 'mtn' | 'airtel' | 'visa' | 'flutterwave') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, paymentStatus: 'paid', paymentMethod: method } : r));
  };

  // Handler: Rate provider
  const handleAddReview = (id: string, rating: number, review: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        // Update average rating of provider
        if (r.providerId?.startsWith('ip-')) {
          setIndividualProviders(prevInd => prevInd.map(p => p.id === r.providerId ? { ...p, rating: parseFloat(((p.rating * 9 + rating) / 10).toFixed(1)) } : p));
        } else if (r.providerId?.startsWith('emp-')) {
          setEmployees(prevEmp => prevEmp.map(e => e.id === r.providerId ? { ...e, rating: parseFloat(((e.rating * 9 + rating) / 10).toFixed(1)) } : e));
        }
        return { ...r, rating, review };
      }
      return r;
    }));
  };

  // Handler: Admin approves pending credentials
  const handleApproveProvider = (id: string) => {
    setIndividualProviders(prev => prev.map(p => p.id === id ? { ...p, idVerified: true, permitApproved: true, policeCleared: true } : p));
  };

  // Handler: Suspend provider
  const handleSuspendProvider = (id: string) => {
    setIndividualProviders(prev => prev.map(p => p.id === id ? { ...p, idVerified: false, permitApproved: false } : p));
  };

  // Handler: Resolve complaint
  const handleResolveComplaint = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
  };

  // Handler: Company Admin manual assign job
  const handleAssignJob = (requestId: string, employeeId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const emp = employees.find(e => e.id === employeeId);
        return {
          ...r,
          status: 'accepted',
          providerId: employeeId,
          providerName: emp ? emp.name : 'AA Driver',
          providerPhone: emp ? emp.phone : '+256 700 000 000',
          providerAvatar: emp ? emp.avatar : '',
          providerVehicle: 'AA Heavy Fleet'
        };
      }
      return r;
    }));
  };

  // Handler: Company Admin adds vehicle
  const handleAddVehicle = (newVeh: FleetVehicle) => {
    setFleet(prev => [...prev, newVeh]);
  };

  // Handler: Company Admin adds employee
  const handleAddEmployee = (newEmp: CompanyEmployee) => {
    setEmployees(prev => [...prev, newEmp]);
  };

  // Handler: Toggle employee suspended status
  const handleToggleEmployeeStatus = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'active' ? 'suspended' : 'active' } : e));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#08090C] text-slate-100 overflow-hidden font-sans relative">
      
      {/* Background visual nodes */}
      <div className="absolute inset-0 bg-[radial-gradient(#16181f_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-[450px] h-[450px] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Luxury Triple Color Brand Accent Strip */}
      <div className="h-[4px] w-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 relative z-50 shadow-md" />

      {/* Top Universal Access Bar */}
      <header className="bg-[#0C0E12]/80 backdrop-blur-md border-b border-white/5 py-3 px-4 md:px-8 flex flex-col xl:flex-row items-center justify-between gap-4 relative z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase text-white">
              Auto<span className="text-orange-500">Rescue</span>
            </h1>
            <span className="text-[9px] text-slate-500 font-extrabold tracking-widest uppercase">Uganda Central System</span>
          </div>
        </div>

        {/* Multi-Role Switcher Simulation Controls */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto max-w-full">
          {[
            { id: 'landing', label: 'HQ Portal', icon: Compass },
            { id: 'victim', label: 'Motorist / Victim', icon: LifeBuoy },
            { id: 'provider', label: 'Independent Tech', icon: Zap },
            { id: 'company', label: 'Fleet Manager', icon: Truck },
            { id: 'employee', label: 'Field Crew', icon: UserCheck },
            { id: 'admin', label: 'Super HQ', icon: Shield }
          ].map(role => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isSelected 
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {role.label}
              </button>
            );
          })}
        </div>

        {/* Secure User authentication badges & state clocks */}
        <div className="flex items-center gap-3">
          {/* User Status Bar */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-black/60 border border-white/5 px-3 py-1.5 rounded-2xl">
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-white block tracking-wider">
                  {currentUser.name}
                </span>
                <span className="text-[8px] text-orange-400 font-mono font-bold uppercase block tracking-widest leading-none mt-0.5">
                  {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out Account"
                className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all border border-red-500/15"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setPendingRole(null);
                setShowAuthScreen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-md shadow-orange-600/10"
            >
              <Lock className="w-3.5 h-3.5" /> Log In / Register
            </button>
          )}

          {/* Override Badge */}
          {adminOverride && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-2xl text-emerald-400 text-[9px] font-black uppercase tracking-wider">
              <Unlock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Override Active
            </div>
          )}

          {/* Global clock */}
          <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-2xl border border-white/10 shrink-0">
            <Clock className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-200 tracking-wider">KAMPALA {currentTime || '01:49:15'}</span>
          </div>
        </div>
      </header>

      {/* Main dashboard viewport */}
      <main className="flex-1 flex flex-col relative z-20 min-h-0">
        
        {/* Category Restraint Warning Banner / Shield Overlay */}
        {restrictedRoleAttempt && (
          <div className="p-4 bg-black/90 border-b border-red-500/20 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in">
            <div className="max-w-2xl w-full bg-[#111317] border border-red-500/20 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-5 items-center justify-between">
              <div className="flex gap-4 items-start text-center md:text-left flex-col md:flex-row">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mx-auto md:mx-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm uppercase tracking-wider">Access Blocked: Category Enforced</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    Your account is registered to the <strong className="text-orange-400 uppercase">"{currentUser?.role}"</strong> dashboard category. Registered accounts are locked into their chose paths to preserve data safety.
                  </p>
                  
                  {/* Password bypass */}
                  <form onSubmit={handleDirectOverrideSubmit} className="mt-3.5 flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      placeholder="Enter Admin Bypass Password"
                      value={overridePasswordInput}
                      onChange={(e) => setOverridePasswordInput(e.target.value)}
                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/40 font-mono w-full sm:w-64"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all"
                    >
                      Bypass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRestrictedRoleAttempt(null);
                        setSelectedRole(currentUser?.role as any || 'landing');
                      }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-white/5"
                    >
                      Cancel
                    </button>
                  </form>
                  {overrideError && (
                    <p className="text-[10px] text-red-400 font-bold mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {overrideError}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={() => {
                    setRestrictedRoleAttempt(null);
                    setSelectedRole(currentUser?.role as any || 'landing');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-orange-600/10 hover:bg-orange-600 hover:text-white text-orange-400 font-black text-[10px] uppercase tracking-wider border border-orange-500/25 transition-all text-center"
                >
                  Return to My Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-slate-500 hover:text-slate-200 font-bold text-[9px] uppercase tracking-wider hover:underline transition-all text-center"
                >
                  Log Out / Switch Account
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-1 flex flex-col min-h-0"
          >
            {selectedRole === 'landing' && (
              <LandingPage 
                onSelectRole={handleSelectRole}
                requests={requests}
                providers={individualProviders}
                fleet={fleet}
                employees={employees}
              />
            )}

            {selectedRole === 'victim' && (
              <VictimDashboard 
                userProfile={userProfile}
                onUpdateProfile={setUserProfile}
                requests={requests}
                onCreateRequest={handleCreateRequest}
                onCancelRequest={handleCancelRequest}
                onAddReview={handleAddReview}
                onPayRequest={handlePayRequest}
                providers={individualProviders}
                fleet={fleet}
                employees={employees}
              />
            )}

            {selectedRole === 'provider' && (
              <IndividualProviderDashboard 
                provider={individualProviders[0]} // using first mock independent provider Derrick
                onUpdateProvider={(updated) => {
                  setIndividualProviders(prev => prev.map(p => p.id === updated.id ? updated : p));
                }}
                requests={requests}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onCompleteRequest={handleCompleteRequest}
                providers={individualProviders}
                fleet={fleet}
                employees={employees}
              />
            )}

            {selectedRole === 'company' && (
              <CompanyDashboard 
                fleet={fleet}
                employees={employees}
                requests={requests}
                onAddVehicle={handleAddVehicle}
                onAddEmployee={handleAddEmployee}
                onToggleEmployeeStatus={handleToggleEmployeeStatus}
                onAssignJob={handleAssignJob}
                providers={individualProviders}
              />
            )}

            {selectedRole === 'employee' && (
              <EmployeeDashboard 
                employee={employees[0]} // Kato Paul
                onUpdateEmployee={(updated) => {
                  setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
                }}
                requests={requests}
                onAcceptRequest={handleAcceptRequest}
                onCompleteRequest={handleCompleteRequest}
                providers={individualProviders}
                fleet={fleet}
                employees={employees}
              />
            )}

            {selectedRole === 'admin' && (
              <SuperAdminDashboard 
                providers={individualProviders}
                employees={employees}
                complaints={complaints}
                requests={requests}
                onApproveProvider={handleApproveProvider}
                onSuspendProvider={handleSuspendProvider}
                onResolveComplaint={handleResolveComplaint}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Auth Screen Modal */}
      {showAuthScreen && (
        <AuthScreen 
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuthScreen(false)}
          onAdminOverrideSuccess={handleAdminOverrideSuccess}
        />
      )}

      {/* Floating AI emergency dispatcher assistant chatbot */}
      <AIChatbot />
    </div>
  );
}
