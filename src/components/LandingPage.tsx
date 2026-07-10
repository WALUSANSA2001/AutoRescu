import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, ShieldCheck, Zap, Truck, Users, Clock, 
  MapPin, Star, AlertTriangle, ArrowRight, Activity, 
  HeartHandshake, ChevronRight, HardDrive, PhoneCall, HelpCircle, LifeBuoy
} from 'lucide-react';
import { FleetVehicle, CompanyEmployee, EmergencyRequest, IndividualProvider } from '../types';
import { LiveMap } from './LiveMap';

// Config: High-quality African-focused emergency and logistics images generated for AutoRescue
const CAROUSEL_BACKGROUNDS = [
  {
    image: "/src/assets/images/african_ambulance_1783681301911.jpg",
    title: "Ambulance Emergency Protocol",
    subtitle: "Ambulance Patrol",
    description: "Rapid medical rescue and logistics dispatch units integrated across major Kampala corridors.",
    status: "CRITICAL UNITS DISPATCHED",
    tag: "AMBULANCE"
  },
  {
    image: "/src/assets/images/african_tow_truck_1783681315107.jpg",
    title: "Heavy-Duty Flatbed Logistics",
    subtitle: "Flatbed Towing",
    description: "Equipped towing cranes and flatbed carriers on 24/7 standby for breakdown operations.",
    status: "HEAVY LOGISTICS DEPLOYED",
    tag: "TOW TRUCK"
  },
  {
    image: "/src/assets/images/african_mechanic_1783681332959.jpg",
    title: "Skilled Certified Roadside Technicians",
    subtitle: "Professional Mechanic",
    description: "Local mechanics ready to handle engine, battery jumpstarts, and diagnostic troubleshooting.",
    status: "MOBILE TECHNICIAN DISPATCH",
    tag: "MECHANIC"
  },
  {
    image: "/src/assets/images/african_petrol_station_1783681346314.jpg",
    title: "Expressway Fuel Delivery Protocols",
    subtitle: "Petrol & Refueling",
    description: "Fuel pump support and mobile refilling services direct to motorists stranded on high-speed motorways.",
    status: "MOMO FUEL ASSIST OK",
    tag: "FUEL PUMP"
  },
  {
    image: "/src/assets/images/african_tyre_change_1783681360121.jpg",
    title: "Rapid Roadside Wheel & Tyre Assist",
    subtitle: "Tyre Change Service",
    description: "Safety jacks, tyre replacements, and punctures repaired immediately by qualified local service providers.",
    status: "TYRE SQUAD ACTIVE",
    tag: "TYRE CHANGE"
  },
  {
    image: "/src/assets/images/african_accident_recovery_1783681372683.jpg",
    title: "Coordinated Accident Recovery Scenes",
    subtitle: "Emergency Cleanup",
    description: "Comprehensive lane clearing, safety warning protocols, and incident management coordinated with central HQ.",
    status: "CENTRAL COMMAND MONITORING",
    tag: "ACCIDENT RECOVERY"
  }
];

interface LandingPageProps {
  onSelectRole: (role: 'victim' | 'provider' | 'company' | 'employee' | 'admin') => void;
  requests: EmergencyRequest[];
  providers: IndividualProvider[];
  fleet: FleetVehicle[];
  employees: CompanyEmployee[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  requests,
  providers,
  fleet,
  employees
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_BACKGROUNDS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeIncidents = requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length;
  const onlineProviders = providers.filter(p => p.status === 'online').length + fleet.filter(f => f.status === 'active').length;
  const averageEta = "18 Mins";

  const currentCarousel = CAROUSEL_BACKGROUNDS[currentImageIndex];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
      
      {/* Dynamic African-Related Background Image Carousel (Brightened atmospheric ambient light) */}
      <div className="absolute top-0 inset-x-0 h-[650px] overflow-hidden pointer-events-none z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.50, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentCarousel.image})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090C]/5 via-[#08090C]/35 to-[#08090C]" />
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
      </div>
      
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-16 flex flex-col lg:flex-row items-center gap-12 z-10">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-600/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-widest"
          >
            <Activity className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> 
            Uganda's Leading Emergency Fleet & Dispatch Protocol
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05]"
          >
            Instant Roadside <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
              Rescue & Logistics
            </span>
          </motion.h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
            Powered by server-side Gemini AI models, AutoRescue organizes, validates, and dispatches heavy-duty flatbeds, battery jumpstarts, and certified mechanics instantly to motorists stranded anywhere in Kampala or on the Entebbe Expressway.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={() => onSelectRole('victim')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 hover:scale-102 transition-all flex items-center gap-2"
            >
              Request Immediate Help <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#map-section"
              className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              View Active Dispatches
            </a>
          </div>

          {/* Core Trust Factors / Stats Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 max-w-md mx-auto lg:mx-0">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
              <span className="text-xl font-black text-orange-500 block">{activeIncidents}</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Active Distress</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
              <span className="text-xl font-black text-amber-500 block">{onlineProviders}</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Units Online</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
              <span className="text-xl font-black text-emerald-500 block">{averageEta}</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Avg. Response</span>
            </div>
          </div>
        </div>

        {/* Hero Illustrative Interactive Panel with Rotating Active Scene */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent blur-3xl pointer-events-none" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0f1116] border border-white/10 rounded-3xl p-3 shadow-2xl relative overflow-hidden backdrop-blur-md"
          >
            {/* Top Bar Decoration */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[9px] font-mono text-orange-500/80 uppercase tracking-widest font-black">
                {currentCarousel.subtitle} Scene
              </span>
            </div>

            {/* High Impact Visual Frame with descriptive captions */}
            <div className="relative rounded-2xl overflow-hidden aspect-video group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentImageIndex}
                  src={currentCarousel.image} 
                  alt={currentCarousel.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover brightness-90 group-hover:scale-103 transition-transform duration-700"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              {/* Overlay active notifications simulation */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                    <span className="text-[11px] font-black uppercase text-white tracking-wider">
                      {currentCarousel.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded border border-orange-500/30">
                    {currentCarousel.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal line-clamp-1 font-medium">
                  {currentCarousel.description}
                </p>
              </div>
            </div>

            {/* Interactive Carousel Navigation Tabs (Direct user selection) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-3 pt-2 border-t border-white/5">
              {CAROUSEL_BACKGROUNDS.map((item, index) => {
                const isActive = index === currentImageIndex;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`py-1.5 px-1 rounded-lg text-[8px] font-black tracking-wider uppercase transition-all truncate text-center ${
                      isActive 
                        ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/20' 
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.tag}
                  </button>
                );
              })}
            </div>

          </motion.div>
        </div>
      </section>

      {/* 2. LIVE MAP CONTAINER (HQ CONTROL) */}
      <section id="map-section" className="max-w-7xl mx-auto px-4 md:px-8 py-10 z-10 relative scroll-mt-24">
        <div className="text-center lg:text-left mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-orange-500 font-black">Joint Operations Command</span>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
              Active Incident Coordination Map
            </h2>
          </div>
          <p className="text-slate-400 text-xs max-w-md lg:text-right font-medium leading-relaxed">
            Stranded motorists register distress coordinates instantly. Verified mechanical flatbeds and independent technicians are routed via optimized pathways.
          </p>
        </div>

        {/* Integrated Live Map Component */}
        <LiveMap 
          requests={requests}
          providers={providers}
          fleet={fleet}
          employees={employees}
        />
      </section>

      {/* 3. ACCESS GATEWAYS / ROLE CHANNELS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 z-10 relative">
        <div className="text-center mb-10">
          <span className="text-[9px] uppercase tracking-widest text-amber-500 font-black">Gateways & Interfaces</span>
          <h2 className="text-2xl md:text-4xl font-black text-white mt-1">Select Your Access Portal</h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
            AutoRescue functions as an integrated full-stack dispatch ecosystem supporting motorists, private tow operations, corporate fleet networks, and system administrators.
          </p>
        </div>

        {/* 5-Column Grid representing the 5 major dashboards in the system */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          
          {/* Victim Dashboard Gateway */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#0F1116] border border-white/5 rounded-3xl p-5 hover:border-red-500/40 transition-all flex flex-col justify-between h-[340px] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-xl group-hover:bg-red-600/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-5 group-hover:scale-105 transition-transform">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded tracking-wider">STRANDED MOTORIST</span>
              <h3 className="text-base font-black text-white mt-3 leading-tight group-hover:text-red-400 transition-colors">Victim & Rescue Request</h3>
              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed font-medium">
                Log a flat tire, dry fuel tank, dead battery, or crash. Track dispatch vehicles and pay via Mobile Money.
              </p>
            </div>
            <button 
              onClick={() => onSelectRole('victim')}
              className="w-full mt-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-transparent text-red-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              Enter Gateway <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Independent Provider Gateway */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#0F1116] border border-white/5 rounded-3xl p-5 hover:border-orange-500/40 transition-all flex flex-col justify-between h-[340px] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-xl group-hover:bg-orange-600/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-5 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded tracking-wider">INDEPENDENT TECH</span>
              <h3 className="text-base font-black text-white mt-3 leading-tight group-hover:text-orange-400 transition-colors">Private Tow & Mechanics</h3>
              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed font-medium">
                Verify licenses, clear police backgrounds, manage local equipment tools, and accept on-demand jobs.
              </p>
            </div>
            <button 
              onClick={() => onSelectRole('provider')}
              className="w-full mt-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500 hover:text-white hover:border-transparent text-orange-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              Enter Gateway <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Fleet Manager Gateway */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#0F1116] border border-white/5 rounded-3xl p-5 hover:border-cyan-500/40 transition-all flex flex-col justify-between h-[340px] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-xl group-hover:bg-cyan-600/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mb-5 group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded tracking-wider">FLEET OPERATOR</span>
              <h3 className="text-base font-black text-white mt-3 leading-tight group-hover:text-cyan-400 transition-colors">AA Company Console</h3>
              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed font-medium">
                Monitor corporate crane assets, check fuel levels, and use Gemini to auto-optimize routes and block payment fraud.
              </p>
            </div>
            <button 
              onClick={() => onSelectRole('company')}
              className="w-full mt-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white hover:border-transparent text-cyan-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              Enter Gateway <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Field Crew Gateway */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#0F1116] border border-white/5 rounded-3xl p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between h-[340px] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-full blur-xl group-hover:bg-amber-600/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-5 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded tracking-wider">FIELD CREW</span>
              <h3 className="text-base font-black text-white mt-3 leading-tight group-hover:text-amber-400 transition-colors">AA Employee Service</h3>
              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed font-medium">
                Assigned crew interface. Review flatbed dispatch targets, navigate to motorists, and upload completion tickets.
              </p>
            </div>
            <button 
              onClick={() => onSelectRole('employee')}
              className="w-full mt-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-white hover:border-transparent text-amber-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              Enter Gateway <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Super-Admin Gateway */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#0F1116] border border-white/5 rounded-3xl p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between h-[340px] group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-xl group-hover:bg-purple-600/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded tracking-wider">SYSTEM ROOT</span>
              <h3 className="text-base font-black text-white mt-3 leading-tight group-hover:text-purple-400 transition-colors">Super HQ Command</h3>
              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed font-medium">
                Validate credentials, review customer complaints, issue system suspensions, and monitor financial logs.
              </p>
            </div>
            <button 
              onClick={() => onSelectRole('admin')}
              className="w-full mt-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500 hover:text-white hover:border-transparent text-purple-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              Enter Gateway <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

        </div>
      </section>

      {/* 4. BRAND CORE FEATURES SECTION */}
      <section className="bg-gradient-to-b from-[#090A0D] to-[#050608] border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Comprehensive Accountability</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                All external technicians undergo fingerprint scanning, permit authorization audits, and police background validations before receiving emergency dispatches in Uganda.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Transparent Mobile Pricing</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                No offline haggling or middleman gouging. Get locked-in estimates calculated before booking, then fulfill easily using MTN MoMo, Airtel Money, or major credit cards.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">EAT Dispatch Telemetry</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Operational 24/7 across Kampala Central, Nakawa, Rubaga, Makindye, Kawempe, and high-speed motorways. Integrated with state-of-the-art satellite mapping lines.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
