import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Shield, Car, Phone, Zap, CheckCircle, 
  MapPin, Clock, MessageSquare, CreditCard, Star, Compass, 
  ChevronRight, Sparkles, Image, Mic, Play, Plus, X, Upload, 
  AlertCircle, DollarSign, ArrowRight, User, Check, Flame, 
  LifeBuoy, ShieldAlert, Navigation
} from 'lucide-react';
import { UserProfile, EmergencyRequest, Vehicle, EmergencyContact, IndividualProvider, FleetVehicle, CompanyEmployee } from '../types';
import { LiveMap } from './LiveMap';

interface VictimDashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  requests: EmergencyRequest[];
  onCreateRequest: (req: Partial<EmergencyRequest>) => void;
  onCancelRequest: (id: string) => void;
  onAddReview: (id: string, rating: number, review: string) => void;
  onPayRequest: (id: string, method: 'mtn' | 'airtel' | 'visa' | 'flutterwave') => void;
  providers: IndividualProvider[];
  fleet: FleetVehicle[];
  employees: CompanyEmployee[];
}

export const VictimDashboard: React.FC<VictimDashboardProps> = ({
  userProfile,
  onUpdateProfile,
  requests,
  onCreateRequest,
  onCancelRequest,
  onAddReview,
  onPayRequest,
  providers,
  fleet,
  employees
}) => {
  // Tabs & Forms
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'vehicles' | 'contacts' | 'history'>('home');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(userProfile.vehicles[0]?.id || '');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  // Create Request State
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Kampala Road, near Oasis Mall');
  const [destination, setDestination] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  
  // AI Triage output
  const [isAiTriaging, setIsAiTriaging] = useState(false);
  const [aiTriageResult, setAiTriageResult] = useState<any>(null);
  
  // Active emergency request details
  const activeRequest = requests.find(r => r.status !== 'completed' && r.status !== 'cancelled');
  
  // Add vehicle modal
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '', model: '', plateNumber: '', color: '', fuelType: 'Petrol', year: 2020, insurance: 'National Insurance Corporation (NIC)'
  });

  // Add contact modal
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });

  // Live Chat simulation states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'provider', text: string, time: string }>>([
    { sender: 'provider', text: 'Hello, I am Kato Paul, your AA Uganda Rescue Driver. I have dispatched with a flatbed tow truck and should reach you shortly. Are you in a safe spot?', time: 'Just now' }
  ]);

  // Payment UI State
  const [payingRequestId, setPayingRequestId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'airtel' | 'visa' | 'flutterwave'>('mtn');
  const [phoneForMoMo, setPhoneForMoMo] = useState(userProfile.phone);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Rating UI State
  const [ratingRequestId, setRatingRequestId] = useState<string | null>(null);
  const [starRating, setStarRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [signatureText, setSignatureText] = useState('');

  // Call server-side AI Triage
  const handleAiTriage = async () => {
    if (!description.trim()) return;
    setIsAiTriaging(true);
    setAiTriageResult(null);
    try {
      const res = await fetch('/api/autorescue/accident-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          serviceType: selectedService || 'Roadside Assistance',
          userLocation: locationName
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiTriageResult(data);
        if (data.severity) {
          setSeverity(data.severity.toLowerCase() as any);
        }
      } else {
        throw new Error('Triage endpoint failed');
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setAiTriageResult({
        severity: 'Medium',
        costMin: 150000,
        costMax: 250000,
        requiredEquipment: ['Standard winching tool', 'Flatbed truck'],
        safetySteps: ['Place warning triangle 50 meters behind your car', 'Activate hazard warning lights', 'Stand away from the flowing traffic on the shoulder'],
        predictiveAlert: 'High traffic congestion detected near Kampala Road. ETA might be delayed by 8 minutes.'
      });
    } finally {
      setIsAiTriaging(false);
    }
  };

  const triggerSOS = () => {
    if (!selectedService) {
      alert("Please select an emergency service type.");
      return;
    }
    
    // Simulate creating emergency request
    const mockRequest: Partial<EmergencyRequest> = {
      serviceType: selectedService,
      severity: severity,
      vehicleId: selectedVehicleId,
      locationName: locationName,
      destination: destination || undefined,
      description: description || `Emergency ${selectedService} requested at ${locationName}`,
      photos: photoUrl ? [photoUrl] : [],
      voiceNoteUrl: hasVoiceNote ? 'simulated_voicenote.mp3' : undefined,
      cost: aiTriageResult ? Math.floor((aiTriageResult.costMin + aiTriageResult.costMax) / 2) : 120000,
      providerId: 'emp-101', // assigned to Kato Paul
      providerName: 'Kato Paul (AA Uganda)',
      providerPhone: '+256 774 123 456',
      providerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      providerVehicle: 'AA Heavy Rescue Tow Truck (UBL 102A)',
      providerLatLon: [0.3456, 32.5891]
    };

    onCreateRequest(mockRequest);
    
    // Reset wizard
    setDescription('');
    setDestination('');
    setAiTriageResult(null);
  };

  // Add Vehicle handler
  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.make || !newVehicle.model || !newVehicle.plateNumber) return;
    
    const added: Vehicle = {
      id: 'v-' + Math.random().toString(36).substr(2, 4),
      make: newVehicle.make,
      model: newVehicle.model,
      plateNumber: newVehicle.plateNumber.toUpperCase(),
      color: newVehicle.color || 'Unknown Color',
      fuelType: newVehicle.fuelType,
      year: Number(newVehicle.year),
      insurance: newVehicle.insurance,
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600"
    };

    onUpdateProfile({
      ...userProfile,
      vehicles: [...userProfile.vehicles, added]
    });
    setSelectedVehicleId(added.id);
    setShowAddVehicle(false);
    setNewVehicle({
      make: '', model: '', plateNumber: '', color: '', fuelType: 'Petrol', year: 2020, insurance: 'National Insurance Corporation (NIC)'
    });
  };

  // Add Contact handler
  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    
    const added: EmergencyContact = {
      id: 'ec-' + Math.random().toString(36).substr(2, 4),
      name: newContact.name,
      relation: newContact.relation || 'Friend',
      phone: newContact.phone
    };

    onUpdateProfile({
      ...userProfile,
      emergencyContacts: [...userProfile.emergencyContacts, added]
    });
    setShowAddContact(false);
    setNewContact({ name: '', relation: '', phone: '' });
  };

  // Chat send handler
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'user' as const, text: chatInput, time: 'Just now' };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulated reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        sender: 'provider',
        text: 'Noted, Dr. Namara. I am navigating via Yusuf Lule Road to bypass Wandegeya traffic. ETA is roughly 8 minutes. Keep your hazards active.',
        time: 'Just now'
      }]);
    }, 2000);
  };

  // Mock Payment handler
  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingRequestId) return;
    setIsProcessingPayment(true);
    
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        onPayRequest(payingRequestId, paymentMethod);
        setPaymentSuccess(false);
        setPayingRequestId(null);
      }, 1500);
    }, 2000);
  };

  // Mock Rating handler
  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingRequestId) return;
    onAddReview(ratingRequestId, starRating, reviewText || "Prompt professional assistance.");
    setRatingRequestId(null);
    setReviewText('');
    setSignatureText('');
  };

  return (
    <div className="flex-1 min-h-screen bg-[#08090C] text-slate-100 p-4 md:p-8 overflow-y-auto font-sans relative">
      {/* Luxury Triple Color Stripe at the top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 z-10" />

      {/* Header and User profile summaries */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              Uganda Motorist Panel
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">GPS Linked (Kampala Central)</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            AutoRescue <span className="text-orange-500">Hub</span>
          </h1>
        </div>

        {/* Profile Card Mini */}
        <div className="flex items-center gap-4 p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-orange-500/30 transition-all duration-300">
          <img src={userProfile.avatar} alt={userProfile.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-orange-500/50" />
          <div>
            <h4 className="text-sm font-bold text-white">{userProfile.name}</h4>
            <p className="text-xs text-slate-400">{userProfile.phone}</p>
          </div>
        </div>
      </div>

      {/* Primary Sub-Navigation Row */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8 overflow-x-auto pb-1">
        {[
          { id: 'home', label: 'Emergency Rescue SOS', icon: Flame },
          { id: 'vehicles', label: 'My Vehicles Vault', icon: Car },
          { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
          { id: 'history', label: 'Rescue Logs & Billing', icon: Clock }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                activeSubTab === t.id 
                  ? 'border-orange-500 text-orange-400 bg-orange-500/5' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: SOS RESCUE ENGINE */}
      {activeSubTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT WIDGET: Service Picker & AI Triage */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* If there is an active request running, show immediate Status Bar */}
            {activeRequest && (
              <div className="bg-gradient-to-br from-orange-600/25 to-amber-600/5 border-2 border-orange-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -z-10" />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-md border border-orange-500/20">
                      Active Emergency Dispatch
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2">
                      {activeRequest.serviceType} Rescue Service
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Request ID: <span className="font-mono text-orange-400">{activeRequest.id}</span></p>
                  </div>
                  <span className="text-xs font-black uppercase text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/30 animate-pulse">
                    Status: {activeRequest.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-black/30 p-4 rounded-2xl border border-white/5 mb-6">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Assigned Crew</span>
                    <span className="text-xs font-bold text-white truncate block">{activeRequest.providerName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Vehicle Unit</span>
                    <span className="text-xs font-bold text-white truncate block">{activeRequest.providerVehicle || 'Calculating'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Est. Duration</span>
                    <span className="text-xs font-bold text-orange-400 block animate-pulse">8 mins</span>
                  </div>
                </div>

                {/* Tracking Progress Stepper */}
                <div className="relative pl-6 space-y-4">
                  {[
                    { step: 'accepted', label: 'Technician Dispatched', desc: 'Crew loaded gear & started GPS path', active: ['accepted', 'en_route', 'arrived', 'completed'].includes(activeRequest.status) },
                    { step: 'en_route', label: 'En Route to Kampala Road', desc: 'Kato Paul bypassing traffic via Yusuf Lule Rd', active: ['en_route', 'arrived', 'completed'].includes(activeRequest.status) },
                    { step: 'arrived', label: 'Arrived at Location', desc: 'Wait for verification & diagnostics check', active: ['arrived', 'completed'].includes(activeRequest.status) }
                  ].map((s, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 ${s.active ? 'bg-orange-500 border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-slate-800 border-slate-700'}`} />
                      {idx < 2 && (
                        <div className={`absolute -left-[17px] top-4 w-0.5 h-6 ${s.active ? 'bg-orange-500' : 'bg-slate-800'}`} />
                      )}
                      <div>
                        <h5 className={`text-xs font-bold ${s.active ? 'text-white' : 'text-slate-500'}`}>{s.label}</h5>
                        <p className="text-[10px] text-slate-400">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat and Call Controls */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    onClick={() => onCancelRequest(activeRequest.id)}
                    className="bg-red-950/40 hover:bg-red-950/80 border border-red-500/20 hover:border-red-500/50 text-red-400 font-bold text-xs py-3 rounded-xl transition-all uppercase tracking-wider"
                  >
                    Cancel Call
                  </button>
                  <a 
                    href={`tel:${activeRequest.providerPhone}`}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Technician
                  </a>
                </div>
              </div>
            )}

            {/* If no active request, show SOS launcher */}
            {!activeRequest && (
              <div className="bg-[#111317] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Request Assistance Instantly
                </h3>
                <p className="text-xs text-slate-400 mb-6">Select emergency type, let our AI estimate severity and cost, and notify nearby responders in Uganda.</p>

                {/* Service Types Icons Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { id: 'Towing', label: 'Tow Truck', icon: ShieldAlert, color: 'from-orange-500/20 to-amber-500/10' },
                    { id: 'Mechanic', label: 'Mechanic', icon: Car, color: 'from-blue-500/20 to-indigo-500/10' },
                    { id: 'Fuel Delivery', label: 'Fuel Delivery', icon: Zap, color: 'from-amber-500/20 to-yellow-500/10' },
                    { id: 'Tire Replacement', label: 'Flat Tire', icon: Flame, color: 'from-rose-500/20 to-orange-500/10' },
                    { id: 'Battery Jumpstart', label: 'Battery Jump', icon: Zap, color: 'from-yellow-500/20 to-amber-500/10' },
                    { id: 'Ambulance', label: 'Ambulance', icon: LifeBuoy, color: 'from-emerald-500/20 to-teal-500/10' },
                    { id: 'Locksmith', label: 'Car Lockout', icon: Shield, color: 'from-violet-500/20 to-fuchsia-500/10' },
                    { id: 'Accident Rescue', label: 'Crash Rescue', icon: AlertTriangle, color: 'from-red-500/20 to-rose-500/10' }
                  ].map((srv) => {
                    const Icon = srv.icon;
                    const isSelected = selectedService === srv.id;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => setSelectedService(srv.id)}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all duration-300 relative ${
                          isSelected 
                            ? 'bg-gradient-to-br from-orange-500/30 to-amber-500/10 border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${srv.color} flex items-center justify-center mb-2`}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-orange-400' : 'text-slate-300'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-200 tracking-tight leading-tight block">{srv.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Incident details input */}
                <div className="space-y-4">
                  {/* Vehicle selection */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Selected Vehicle</label>
                    <div className="grid grid-cols-2 gap-3">
                      {userProfile.vehicles.map(v => (
                        <div 
                          key={v.id}
                          onClick={() => setSelectedVehicleId(v.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                            selectedVehicleId === v.id 
                              ? 'bg-white/5 border-orange-500/80' 
                              : 'bg-black/20 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <span className="text-xs font-bold text-white block">{v.make} {v.model}</span>
                          <span className="text-[10px] font-mono text-orange-400 mt-1 block">{v.plateNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Breakdown Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Tow Destination (Optional)</label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="e.g. City Oil Garage, Wandegeya"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Problem Description with AI Triage trigger */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2 flex items-center justify-between">
                      <span>Breakdown Description</span>
                      <span className="text-orange-400 font-bold lowercase">AI triage enabled</span>
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        placeholder="Describe the problem, e.g., 'Radiator hose burst on expressway, coolant fluid spilling, engine smoking.'"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
                      />
                      <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        {/* Audio record mockup */}
                        <button 
                          type="button"
                          onClick={() => {
                            setIsRecording(!isRecording);
                            if(!isRecording) {
                              setTimeout(() => {
                                setIsRecording(false);
                                setHasVoiceNote(true);
                              }, 2500);
                            }
                          }}
                          className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          disabled={!description.trim() || isAiTriaging}
                          onClick={handleAiTriage}
                          className="bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3 h-3" />
                          {isAiTriaging ? 'Analyzing...' : 'AI Analyze'}
                        </button>
                      </div>
                    </div>
                    {hasVoiceNote && (
                      <div className="mt-2 flex items-center gap-2 bg-orange-500/5 border border-orange-500/20 p-2 rounded-xl">
                        <Play className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[10px] text-slate-300 font-bold font-mono">Breakdown_Audio_Note.mp3 (0:14) ready</span>
                        <button onClick={() => setHasVoiceNote(false)} className="ml-auto text-slate-500 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* AI Triage Outputs Display */}
                  <AnimatePresence>
                    {aiTriageResult && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 space-y-3 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> AI Diagnosis Report
                          </span>
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                            aiTriageResult.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            aiTriageResult.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {aiTriageResult.severity} Severity
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-3 rounded-xl">
                          <div>
                            <span className="text-[9px] text-slate-500 block">Estimated Cost</span>
                            <span className="font-bold text-white font-mono">
                              UGX {aiTriageResult.costMin?.toLocaleString()} - {aiTriageResult.costMax?.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block">Required Crew Gear</span>
                            <span className="text-slate-300 text-[10px] font-medium truncate block">
                              {aiTriageResult.requiredEquipment?.join(', ') || 'Standard toolkit'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">AI Safety Checklist:</span>
                          <ul className="space-y-1">
                            {aiTriageResult.safetySteps?.map((step: string, i: number) => (
                              <li key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5">
                                <span className="text-orange-500 mt-0.5">•</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {aiTriageResult.predictiveAlert && (
                          <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-red-300 leading-tight">
                              <span className="font-bold">Road Warning:</span> {aiTriageResult.predictiveAlert}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Launch button */}
                  <button
                    onClick={triggerSOS}
                    disabled={!selectedService}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4 text-white" />
                    Submit Emergency Rescue Request
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT WIDGET: High-Fidelity GPS Tracking & Technician Chat */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Live Visual Map Representation */}
            <LiveMap 
              requests={requests}
              providers={providers}
              fleet={fleet}
              employees={employees}
              activeRequestId={activeRequest?.id}
              role="victim"
            />

            {/* Simulated Live Chat Drawer (only shown if activeRequest is present) */}
            {activeRequest && (
              <div className="bg-[#111317] border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col h-[280px]">
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                  <img src={activeRequest.providerAvatar} className="w-7 h-7 rounded-lg object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{activeRequest.providerName}</h4>
                    <span className="text-[8px] text-slate-500 uppercase font-black">Live Chat Dispatch</span>
                  </div>
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 text-xs scrollbar-thin">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-2xl max-w-[85%] ${
                        msg.sender === 'user' 
                          ? 'bg-orange-600 text-white rounded-tr-none' 
                          : 'bg-white/5 text-slate-200 rounded-tl-none'
                      }`}>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[8px] text-slate-500 mt-0.5">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-xl border border-white/5">
                  <input 
                    type="text" 
                    placeholder="Type a fast message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    className="flex-1 bg-transparent text-xs p-1 focus:outline-none text-white"
                  />
                  <button 
                    onClick={handleSendChat}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-[10px] px-3 py-1.5 rounded-lg transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: VEHICLES VAULT */}
      {activeSubTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Registered Vehicles</h3>
              <p className="text-xs text-slate-400">Keep your vehicle diagnostics and insurance policy documents verified for quick emergency dispatch.</p>
            </div>
            <button 
              onClick={() => setShowAddVehicle(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-orange-600/10"
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProfile.vehicles.map(v => (
              <div key={v.id} className="bg-[#111317] border border-white/10 rounded-3xl overflow-hidden shadow-lg relative group">
                {/* Triple strip accent */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400" />
                
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={v.image} alt={v.make} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <span className="absolute top-4 right-4 bg-orange-600 text-white font-black font-mono text-xs px-2.5 py-1 rounded-lg shadow-md border border-orange-400/20">
                    {v.plateNumber}
                  </span>
                </div>

                <div className="p-6">
                  <h4 className="text-lg font-bold text-white">{v.make} {v.model} <span className="text-slate-500 font-medium text-sm">({v.year})</span></h4>
                  
                  <div className="grid grid-cols-2 gap-4 my-4 bg-black/20 p-3 rounded-2xl border border-white/5 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Fuel Engine</span>
                      <span className="text-white font-semibold">{v.fuelType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Color</span>
                      <span className="text-white font-semibold">{v.color}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Insurance Provider</span>
                      <span className="text-orange-400 font-bold truncate max-w-[150px]">{v.insurance}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-400">VIN Registration</span>
                      <span className="text-slate-300 font-mono text-[10px]">{v.vin || 'Not Registered'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: EMERGENCY CONTACTS */}
      {activeSubTab === 'contacts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Emergency Contacts</h3>
              <p className="text-xs text-slate-400">These guardians will automatically receive an SMS alert containing your live GPS position when you trigger a critical SOS.</p>
            </div>
            <button 
              onClick={() => setShowAddContact(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Guardian
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProfile.emergencyContacts.map(c => (
              <div key={c.id} className="bg-[#111317] border border-white/10 rounded-3xl p-6 shadow-md relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="bg-orange-600/10 text-orange-400 font-black uppercase text-[9px] px-2 py-0.5 rounded border border-orange-500/20">
                    {c.relation}
                  </span>
                </div>
                <h4 className="font-bold text-white text-base">{c.name}</h4>
                <p className="text-sm text-slate-400 font-mono mt-2">{c.phone}</p>
                <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">SMS Hook Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: RESCUE LOGS & BILLING */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Rescue & Billing History</h3>
            <p className="text-xs text-slate-400">View completed or cancelled jobs, access tax receipts, and process outstanding mobile money payments.</p>
          </div>

          <div className="bg-[#111317] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/5 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                    <th className="p-4">Rescue ID</th>
                    <th className="p-4">Service Type</th>
                    <th className="p-4">Vehicle Unit</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Total Fee</th>
                    <th className="p-4">Billing Status</th>
                    <th className="p-4">Technician Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requests.map(r => (
                    <tr key={r.id} className="hover:bg-white/5 transition-all">
                      <td className="p-4 font-mono font-bold text-orange-400">{r.id}</td>
                      <td className="p-4 font-bold text-white">{r.serviceType}</td>
                      <td className="p-4 text-slate-300">{userProfile.vehicles.find(v => v.id === r.vehicleId)?.make || 'Toyota Prado'}</td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">{r.locationName}</td>
                      <td className="p-4 font-mono font-bold text-white">UGX {r.cost?.toLocaleString() || '120,000'}</td>
                      <td className="p-4">
                        {r.paymentStatus === 'paid' ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Paid via {r.paymentMethod?.toUpperCase()}
                          </span>
                        ) : r.status === 'cancelled' ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                              Pending Billing
                            </span>
                            <button 
                              onClick={() => setPayingRequestId(r.id)}
                              className="bg-orange-600 hover:bg-orange-500 text-white font-black text-[9px] px-3 py-1 rounded transition-all uppercase"
                            >
                              Pay MoMo
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {r.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-white">{r.rating}/5</span>
                          </div>
                        ) : r.status === 'completed' ? (
                          <button 
                            onClick={() => setRatingRequestId(r.id)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-[9px] px-2.5 py-1 rounded transition-all"
                          >
                            Review Tech
                          </button>
                        ) : (
                          <span className="text-slate-500">Not Applicable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD VEHICLE FORM */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#0C0E12] border border-white/10 rounded-3xl p-6 md:p-8 relative shadow-2xl"
          >
            {/* Luxury strip */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 to-amber-500" />
            <button 
              onClick={() => setShowAddVehicle(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">Register Vehicle</h3>
            <p className="text-xs text-slate-400 mb-6">Connect your vehicle details to allow the tow driver to identify you instantly on scene.</p>

            <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Make / Brand</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Toyota" 
                    required
                    value={newVehicle.make}
                    onChange={(e)=>setNewVehicle({...newVehicle, make: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Model Series</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Prado" 
                    required
                    value={newVehicle.model}
                    onChange={(e)=>setNewVehicle({...newVehicle, model: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Uganda Plate Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. UBL 402X" 
                    required
                    value={newVehicle.plateNumber}
                    onChange={(e)=>setNewVehicle({...newVehicle, plateNumber: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Color Shade</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Silver Metallic" 
                    value={newVehicle.color}
                    onChange={(e)=>setNewVehicle({...newVehicle, color: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Fuel Type</label>
                  <select 
                    value={newVehicle.fuelType}
                    onChange={(e)=>setNewVehicle({...newVehicle, fuelType: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Year of Manufacture</label>
                  <input 
                    type="number" 
                    value={newVehicle.year}
                    onChange={(e)=>setNewVehicle({...newVehicle, year: Number(e.target.value)})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Insurance Policy Detail</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jubilee Third Party Policy" 
                  value={newVehicle.insurance}
                  onChange={(e)=>setNewVehicle({...newVehicle, insurance: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-all"
              >
                Register Vehicle in Vault
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: ADD EMERGENCY CONTACT */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0C0E12] border border-white/10 rounded-3xl p-6 relative shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 to-amber-500" />
            <button 
              onClick={() => setShowAddContact(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">Add Guardian Contact</h3>
            <p className="text-xs text-slate-400 mb-6">Set up SMS integration for a guardian to be notified during crash emergencies.</p>

            <form onSubmit={handleAddContactSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Guardian Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sarah Namara" 
                  value={newContact.name}
                  onChange={(e)=>setNewContact({...newContact, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Relation Status</label>
                <input 
                  type="text" 
                  placeholder="e.g. Spouse / Brother" 
                  value={newContact.relation}
                  onChange={(e)=>setNewContact({...newContact, relation: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Phone Number (MTN/Airtel)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. +256 772 123456" 
                  value={newContact.phone}
                  onChange={(e)=>setNewContact({...newContact, phone: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-all"
              >
                Register Guardian Hook
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: MOBILE MONEY / CARD PAYMENT GATEWAY */}
      {payingRequestId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-[#0C0E12] border border-white/10 rounded-3xl p-6 relative shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-yellow-500 to-orange-500" />
            <button 
              onClick={() => setPayingRequestId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              Uganda Telecom Checkout
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Processing secure billing for Rescue Request <span className="font-mono text-orange-400">#{payingRequestId}</span>.
            </p>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Payment Received!</h4>
                <p className="text-xs text-slate-400">MoMo transaction ID: NIC-{Math.floor(Math.random()*900000+100000)} approved.</p>
              </div>
            ) : (
              <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
                {/* Payment Gateway selector */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'mtn', label: 'MTN MoMo', logo: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?auto=format&fit=crop&q=80&w=100' },
                    { id: 'airtel', label: 'Airtel Money', logo: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?auto=format&fit=crop&q=80&w=100' },
                    { id: 'visa', label: 'Visa/Card', logo: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&q=80&w=100' },
                    { id: 'flutterwave', label: 'Flutterwave', logo: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&q=80&w=100' }
                  ].map(g => (
                    <div 
                      key={g.id}
                      onClick={() => setPaymentMethod(g.id as any)}
                      className={`p-2 rounded-xl border cursor-pointer text-center flex flex-col items-center justify-center transition-all ${
                        paymentMethod === g.id 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-white/5 bg-black/20 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-white whitespace-nowrap">{g.label}</span>
                    </div>
                  ))}
                </div>

                {['mtn', 'airtel'].includes(paymentMethod) ? (
                  <div>
                    <label className="text-slate-400 block mb-1">Registered Phone Number</label>
                    <input 
                      type="text" 
                      value={phoneForMoMo}
                      required
                      onChange={(e) => setPhoneForMoMo(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">You will receive an immediate interactive PIN prompt on your handset.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Card Holder Name</label>
                      <input type="text" required placeholder="Dr. Arthur Namara" className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Card Number</label>
                      <input type="text" required placeholder="4000 1234 5678 9010" className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white font-mono" />
                    </div>
                  </div>
                )}

                <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Subtotal Service Charge:</span>
                  <span className="font-bold text-white font-mono">UGX {requests.find(r=>r.id===payingRequestId)?.cost?.toLocaleString() || '180,000'}</span>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? 'Initiating OTP Prompt...' : `Pay via ${paymentMethod.toUpperCase()}`}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* MODAL 4: SIGNATURE & RATE TECHNICIAN */}
      {ratingRequestId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0C0E12] border border-white/10 rounded-3xl p-6 relative shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400" />
            <button 
              onClick={() => setRatingRequestId(null)}
              className="absolute top-4 right-4 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2">Job Completion Verification</h3>
            <p className="text-xs text-slate-400 mb-6">
              Rate your AutoRescue crew and provide signature verification to complete job <span className="font-mono text-orange-400">#{ratingRequestId}</span>.
            </p>

            <form onSubmit={handleRatingSubmit} className="space-y-4 text-xs">
              {/* Stars selection */}
              <div>
                <label className="text-slate-400 block mb-2 text-center font-bold">Responded Promptness & Service Quality</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setStarRating(star)}
                      className="p-1 transition-all hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${star <= starRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Add Personal Review (Optional)</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Kato Ronald arrived on time with complete tools, very helpful."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              {/* Digital Signature Pad Mockup */}
              <div>
                <label className="text-slate-400 block mb-1.5">Sign for Approval (Type full name)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Dr. Arthur Namara"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white font-mono font-bold italic"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Signing ensures our compliance guidelines and protects your insurance policy claim.</span>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-all"
              >
                Submit Sign-off & Reviews
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
