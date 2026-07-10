import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, Lock, User, Phone, Key, ChevronRight, 
  CheckCircle2, AlertTriangle, Sparkles, LogIn, Eye, EyeOff, UserPlus
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: { name: string; username: string; role: string }) => void;
  onClose: () => void;
  onAdminOverrideSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  onClose,
  onAdminOverrideSuccess
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [chosenRole, setChosenRole] = useState<'victim' | 'provider' | 'company' | 'employee' | 'admin'>('victim');

  // Override admin password testing input
  const [overridePassword, setOverridePassword] = useState('');
  const [overrideError, setOverrideError] = useState('');
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  // General auth error
  const [authError, setAuthError] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!username || !password) {
      setAuthError('Please fill in all credentials.');
      return;
    }

    if (!isLogin && !name) {
      setAuthError('Please enter your full name for registration.');
      return;
    }

    // If it's a login, we simulate finding the user, or if password matches the admin password we activate full override
    if (password === 'AutoRescue@123' || password === 'AutoReascue@123') {
      onAdminOverrideSuccess();
      onAuthSuccess({
        name: isLogin ? 'Super Admin Override' : name,
        username,
        role: 'admin'
      });
      return;
    }

    // Normal Registration / Login
    if (isLogin) {
      // Simulate login
      onAuthSuccess({
        name: username.charAt(0).toUpperCase() + username.slice(1),
        username,
        role: chosenRole // Use currently toggled role for easy simulation
      });
    } else {
      // Register
      onAuthSuccess({
        name,
        username,
        role: chosenRole
      });
    }
  };

  const handleAdminOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideError('');

    const normalized = overridePassword.trim();
    if (normalized === 'AutoRescue@123' || normalized === 'AutoReascue@123') {
      setOverrideSuccess(true);
      setTimeout(() => {
        onAdminOverrideSuccess();
        onClose();
      }, 1000);
    } else {
      setOverrideError('Incorrect testing admin password. Try "AutoReascue@123"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      
      {/* Glow Backdrops */}
      <div className="absolute w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#0B0D11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[550px]"
      >
        
        {/* Left Hand: Secure Lock Information & Testing Override Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F1217] to-[#07090C] p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-wider text-sm">Security Gateway</h3>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">AutoRescue Kampala</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                AutoRescue implements strict regional category role boundaries. Registered users can only access their designated dashboard modules to prevent dispatch leaks & payment tampering.
              </p>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[8px] uppercase tracking-wider font-black text-slate-400 block mb-1">Testing Mode Enabled</span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Use the administrative override password below to bypass all boundaries and preview every dashboard immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Override Form */}
          <div className="mt-8 border-t border-white/5 pt-6">
            <form onSubmit={handleAdminOverride} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest font-black text-orange-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin [animation-duration:6s]" /> Developer Override
                </span>
                <span className="text-[8px] font-mono text-slate-500 uppercase">AutoRescue@123</span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder='Enter "AutoReascue@123"'
                  value={overridePassword}
                  onChange={(e) => setOverridePassword(e.target.value)}
                  className="w-full bg-[#12151B] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 font-mono"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black text-[9px] uppercase tracking-wider transition-all"
                >
                  Apply
                </button>
              </div>

              {overrideError && (
                <p className="text-[9px] font-bold text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" /> {overrideError}
                </p>
              )}

              {overrideSuccess && (
                <p className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Admin Bypass Granted! Unlocking all roles.
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Right Hand: Interactive Login / Register Form */}
        <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between">
          
          {/* Header Toggle tabs */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setAuthError('');
                }}
                className={`text-sm font-black uppercase tracking-wider pb-1 transition-all border-b-2 ${
                  isLogin ? 'border-orange-500 text-white' : 'border-transparent text-slate-500 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setAuthError('');
                }}
                className={`text-sm font-black uppercase tracking-wider pb-1 transition-all border-b-2 ${
                  !isLogin ? 'border-orange-500 text-white' : 'border-transparent text-slate-500 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-white text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 font-bold uppercase transition-all"
            >
              Cancel
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 my-6">
            
            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-2xl flex items-start gap-2 text-xs text-red-400">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p>{authError}</p>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mukasa Ronald"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#12151B] border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">Username / Email</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#12151B] border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              {!isLogin ? (
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">Phone Connection</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="+256 701 123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#12151B] border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">Assigned Role Pathway</label>
                  <select
                    value={chosenRole}
                    onChange={(e) => setChosenRole(e.target.value as any)}
                    className="w-full bg-[#12151B] border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                  >
                    <option value="victim">Motorist / Stranded Victim</option>
                    <option value="provider">Independent Technician</option>
                    <option value="company">Fleet Manager (AA Company)</option>
                    <option value="employee">Field Crew Employee</option>
                    <option value="admin">System Super Admin</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">Secure Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#12151B] border border-white/10 rounded-2xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 pt-2">
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">Select Account Category</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: 'victim', label: 'Motorist', desc: 'Need Rescue' },
                    { id: 'provider', label: 'Ind. Tech', desc: 'Own Truck' },
                    { id: 'company', label: 'Fleet Manager', desc: 'AA Corporate' },
                    { id: 'employee', label: 'Field Crew', desc: 'AA Flatbed' },
                    { id: 'admin', label: 'Super Admin', desc: 'Operations' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setChosenRole(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        chosenRole === opt.id 
                          ? 'bg-orange-600/10 border-orange-500 text-orange-400' 
                          : 'bg-[#12151B] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider">{opt.label}</p>
                      <span className="text-[8px] text-slate-500">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-4 h-4" /> Secure Authenticate
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Complete Registration
                </>
              )}
            </button>

          </form>

          {/* Secure disclaimer */}
          <div className="border-t border-white/5 pt-4 text-[9px] text-slate-500 text-center leading-normal">
            AutoRescue systems utilize bank-grade encryption to protect GPS coordination streams and MoMo disbursements. Dispatches mapped in EAT.
          </div>

        </div>

      </motion.div>
    </div>
  );
};
