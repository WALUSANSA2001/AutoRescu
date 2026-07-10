import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Shield, Zap, Truck, LifeBuoy, Navigation, 
  Clock, Eye, Filter, RefreshCw, Layers, Compass, HelpCircle, Phone,
  ChevronRight, AlertTriangle, ArrowRight, CornerDownRight, CheckCircle2
} from 'lucide-react';
import { EmergencyRequest, IndividualProvider, FleetVehicle, CompanyEmployee } from '../types';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap, 
  useMapsLibrary 
} from '@vis.gl/react-google-maps';

// Read Google Maps API Key from injected Environment
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Helper component: Auto-pan Google Map to the selected telemetry marker
const MapController: React.FC<{ selectedMarker: MapMarker | null }> = ({ selectedMarker }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !selectedMarker) return;
    map.panTo({ lat: selectedMarker.lat, lng: selectedMarker.lon });
    map.setZoom(14);
  }, [map, selectedMarker]);
  return null;
};

// Helper component: Compute and render live routing path
interface RouteDisplayProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({ origin, destination }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clear previous routes
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'viewport'],
    })
      .then(({ routes }) => {
        if (routes?.[0]) {
          const newPolylines = routes[0].createPolylines();
          newPolylines.forEach(p => {
            p.setOptions({
              strokeColor: '#f97316',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            });
            p.setMap(map);
          });
          polylinesRef.current = newPolylines;
          if (routes[0].viewport) {
            map.fitBounds(routes[0].viewport);
          }
        }
      })
      .catch(err => {
        console.warn("Routes API computeRoutes failed or not enabled. Drawing high-fidelity straight route fallback:", err);
        const fallbackPoly = new google.maps.Polyline({
          path: [origin, destination],
          geodesic: true,
          strokeColor: '#f97316',
          strokeOpacity: 0.8,
          strokeWeight: 4,
        });
        fallbackPoly.setMap(map);
        polylinesRef.current = [fallbackPoly];
      });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, origin.lat, origin.lng, destination.lat, destination.lng]);

  return null;
};

interface LiveMapProps {
  requests: EmergencyRequest[];
  providers: IndividualProvider[];
  fleet: FleetVehicle[];
  employees: CompanyEmployee[];
  activeRequestId?: string;
  role?: 'victim' | 'provider' | 'employee' | 'company' | 'landing';
}

interface MapMarker {
  id: string;
  name: string;
  type: 'victim' | 'provider' | 'fleet';
  subType: string;
  lat: number;
  lon: number;
  status: string;
  avatar?: string;
  phone?: string;
  extraInfo?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  requests,
  providers,
  fleet,
  employees,
  activeRequestId,
  role = 'landing'
}) => {
  const [filterType, setFilterType] = useState<'all' | 'victim' | 'provider' | 'fleet'>('all');
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [activeLayer, setActiveLayer] = useState<'cyber' | 'google' | 'satellite'>(() => {
    return hasValidKey ? 'google' : 'cyber';
  });
  
  // Simulated GPS movement state (0.0 to 1.0 progress of rescue driver traveling toward victim)
  const [travelPct, setTravelPct] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Focus and select the active request if passed in props
  const activeRequest = useMemo(() => {
    if (activeRequestId) {
      return requests.find(r => r.id === activeRequestId);
    }
    // Fallback to find any active request
    return requests.find(r => r.status === 'accepted' || r.status === 'en_route' || r.status === 'arrived');
  }, [requests, activeRequestId]);

  // Handle auto-simulated routing movement ticks
  useEffect(() => {
    if (!activeRequest) {
      setTravelPct(0);
      return;
    }

    if (activeRequest.status === 'arrived') {
      setTravelPct(1.0);
      return;
    }

    if (activeRequest.status === 'accepted' || activeRequest.status === 'en_route') {
      if (isSimulating) {
        // Start from 0.05 or current and progress
        const interval = setInterval(() => {
          setTravelPct(prev => {
            if (prev >= 1.0) {
              clearInterval(interval);
              return 1.0;
            }
            return parseFloat((prev + 0.04).toFixed(3));
          });
        }, 2000);
        return () => clearInterval(interval);
      }
    }
  }, [activeRequest?.id, activeRequest?.status, isSimulating]);

  // Kampala GPS boundaries for projection mapping
  const BOUNDS = useMemo(() => ({
    minLat: 0.28,
    maxLat: 0.37,
    minLon: 32.54,
    maxLon: 32.62,
  }), []);

  // Projection coordinate system: maps Lat/Lon to SVG (800x500)
  const project = (lat: number, lon: number) => {
    const latRange = BOUNDS.maxLat - BOUNDS.minLat;
    const lonRange = BOUNDS.maxLon - BOUNDS.minLon;

    // Normalize coordinates
    const xPct = (lon - BOUNDS.minLon) / lonRange;
    const yPct = 1 - (lat - BOUNDS.minLat) / latRange; // SVG y goes top-to-bottom

    return {
      x: Math.max(50, Math.min(750, xPct * 800)),
      y: Math.max(50, Math.min(450, yPct * 500))
    };
  };

  // Turn-by-Turn Dynamic Driving Instructions based on travel progress
  const routingSteps = useMemo(() => {
    if (!activeRequest) return [];
    
    const steps = [
      { pct: 0, text: "Depart AA Joint Command dispatch depot at Kololo.", distance: "Start" },
      { pct: 0.2, text: "Turn left onto Yusuf Lule Road, keeping left to bypass heavy roundabout congestion.", distance: "400m" },
      { pct: 0.45, text: "Merge right near Golf Course traffic lights and merge into central corridor lanes.", distance: "1.2 km" },
      { pct: 0.7, text: "Proceed down Kampala Road, passing near the GPO / Kampala Boulevard building.", distance: "2.1 km" },
      { pct: 0.9, text: "Turn slightly right toward motorist's reported coordinates. Spot hazard blinkers.", distance: "150m" },
      { pct: 1.0, text: "Arrived at scene. Place safety cone and initiate mechanical diagnostic logs.", distance: "Arrived" }
    ];

    return steps.map(s => ({
      ...s,
      isPassed: travelPct >= s.pct,
      isActive: Math.abs(travelPct - s.pct) < 0.15 || (travelPct >= s.pct && travelPct < (steps[steps.indexOf(s) + 1]?.pct || 1.1))
    }));
  }, [activeRequest, travelPct]);

  // Compile all active entities into map markers
  const markers = useMemo(() => {
    const list: MapMarker[] = [];

    // 1. Pending/Active Victims (excluding completed/cancelled)
    requests
      .filter(r => r.status === 'pending' || r.status === 'accepted' || r.status === 'en_route' || r.status === 'arrived')
      .forEach(r => {
        let lat = 0.3135;
        let lon = 32.5812;
        if (r.locationName.includes('Kajjansi') || r.locationName.includes('expressway') || r.locationName.includes('Expressway')) {
          lat = 0.2925;
          lon = 32.5521;
        } else if (r.locationName.includes('Wandegeya')) {
          lat = 0.3320;
          lon = 32.5710;
        } else if (r.locationName.includes('Kololo')) {
          lat = 0.3280;
          lon = 32.5960;
        } else if (r.locationName.includes('Nakawa')) {
          lat = 0.3250;
          lon = 32.6100;
        }
        
        list.push({
          id: r.id,
          name: r.victimName,
          type: 'victim',
          subType: r.serviceType,
          lat,
          lon,
          status: r.status,
          phone: r.victimPhone,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          extraInfo: r.description
        });
      });

    // 2. Independent Providers & Fleet Trucks
    // We adjust the coordinates of the assigned provider to simulate active movement
    providers.forEach(p => {
      let plat = p.latitude;
      let plon = p.longitude;

      if (activeRequest && activeRequest.providerId === p.id) {
        // Find matching victim marker to get targets
        const victimMarker = list.find(m => m.id === activeRequest.id);
        if (victimMarker) {
          // Dispatch origin
          const startLat = 0.3450; 
          const startLon = 32.5990;
          // Interpolate live position
          plat = startLat + (victimMarker.lat - startLat) * travelPct;
          plon = startLon + (victimMarker.lon - startLon) * travelPct;
        }
      }

      list.push({
        id: p.id,
        name: p.name,
        type: 'provider',
        subType: p.serviceType,
        lat: plat,
        lon: plon,
        status: p.status,
        avatar: p.avatar,
        phone: p.phone,
        extraInfo: `Vehicle: ${p.vehicle} | Rating: ${p.rating} ★`
      });
    });

    fleet.forEach(f => {
      let flat = f.latitude;
      let flon = f.longitude;

      if (activeRequest && activeRequest.providerId === f.id) {
        // Find matching victim marker to get targets
        const victimMarker = list.find(m => m.id === activeRequest.id);
        if (victimMarker) {
          const startLat = 0.3450;
          const startLon = 32.5990;
          flat = startLat + (victimMarker.lat - startLat) * travelPct;
          flon = startLon + (victimMarker.lon - startLon) * travelPct;
        }
      }

      list.push({
        id: f.id,
        name: f.name,
        type: 'fleet',
        subType: f.type,
        lat: flat,
        lon: flon,
        status: f.status,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        extraInfo: `Fuel Level: ${f.fuelLevel}% | Base: Kampala Central`
      });
    });

    return list;
  }, [requests, providers, fleet, activeRequest, travelPct]);

  // Filter markers based on type selection
  const filteredMarkers = useMemo(() => {
    if (filterType === 'all') return markers;
    return markers.filter(m => m.type === filterType);
  }, [markers, filterType]);

  // Auto-select active nodes when activeRequestId changes
  useEffect(() => {
    if (activeRequestId) {
      const target = markers.find(m => m.id === activeRequestId);
      if (target) {
        setSelectedMarker(target);
      }
    }
  }, [activeRequestId, markers]);

  return (
    <div className="bg-[#0C0E12] border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden flex flex-col xl:flex-row gap-6 min-h-[580px] xl:h-[620px]">
      
      {/* Cyber Grid Base Visual Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none" />
      
      {/* Left side telemetry column */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col justify-between z-10 relative space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5 font-mono">
                <Compass className="w-4 h-4 text-orange-500" /> GPS Telemetry
              </h3>
            </div>
            {activeRequest && (
              <span className="text-[8px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded uppercase font-mono">
                {activeRequest.status}
              </span>
            )}
          </div>

          {/* Quick Info text depending on role context */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[8px] uppercase tracking-wider font-black text-slate-500 block mb-1">Ecosystem Sync Status</span>
            <p className="text-[10px] text-slate-300 leading-normal font-medium">
              {role === 'victim' ? "Your rescue flatbed's signal is synchronized in EAT. Watch the truck advance toward your breakdown coordinates." :
               role === 'provider' || role === 'employee' ? "Tactical driver navigation enabled. Follow the turn-by-turn routes plotted on Kampala roads." :
               "Joint corporate dispatch dashboard mapping on-duty independent mechanics and AA patrol units."}
            </p>
          </div>

          {/* SIMULATION MONITOR PANEL (Always visual for interactive testing) */}
          {activeRequest && (
            <div className="bg-orange-600/5 border border-orange-500/20 p-3 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-black text-orange-400 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-orange-500" /> Live Tracker Controls
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  {Math.round(travelPct * 100)}% Path Complete
                </span>
              </div>
              
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${travelPct * 100}%` }}
                />
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsSimulating(!isSimulating);
                  }}
                  className={`flex-1 text-[8px] font-black uppercase py-1.5 rounded-lg border transition-all ${
                    isSimulating 
                      ? 'bg-orange-600/10 border-orange-500/30 text-orange-400' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {isSimulating ? "Pause Simulation" : "Resume Sim"}
                </button>
                <button
                  type="button"
                  onClick={() => setTravelPct(prev => Math.min(1.0, prev + 0.15))}
                  className="px-2.5 text-[8px] font-black uppercase py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                >
                  Fast Forward +
                </button>
              </div>
            </div>
          )}

          {/* Filtering Node Toggles */}
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase tracking-wider font-black text-slate-500 block">Map Overlays</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {[
                { id: 'all', label: 'All Markers', count: markers.length },
                { id: 'victim', label: 'Motorists', count: markers.filter(m => m.type === 'victim').length },
                { id: 'provider', label: 'Ind. Techs', count: markers.filter(m => m.type === 'provider').length },
                { id: 'fleet', label: 'AA Fleet', count: markers.filter(m => m.type === 'fleet').length }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold uppercase transition-all border flex justify-between items-center ${
                    filterType === opt.id 
                      ? 'bg-orange-600/15 border-orange-500/40 text-orange-400 shadow-md shadow-orange-500/5' 
                      : 'bg-[#12151B] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="bg-black/40 px-1 py-0.5 rounded text-[8px] font-black font-mono">{opt.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Marker Details OR Turn-by-Turn Panel */}
        <div className="flex-1 min-h-[160px] flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {selectedMarker ? (
              <motion.div
                key="marker-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-slate-900/90 border border-orange-500/20 rounded-2xl p-3.5 relative"
              >
                <button 
                  onClick={() => setSelectedMarker(null)}
                  className="absolute top-2 right-2 text-slate-500 hover:text-white text-[10px] bg-black/30 w-5 h-5 rounded-full flex items-center justify-center border border-white/5"
                >
                  ✕
                </button>

                <div className="flex items-center gap-2.5 mb-2">
                  <img src={selectedMarker.avatar} className="w-8 h-8 rounded-lg object-cover ring-2 ring-orange-500/10" />
                  <div>
                    <h4 className="font-extrabold text-white text-xs">{selectedMarker.name}</h4>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      selectedMarker.type === 'victim' ? 'bg-red-500/20 text-red-400' :
                      selectedMarker.type === 'provider' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {selectedMarker.subType}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-300 bg-black/30 p-2 rounded-xl mb-2 border border-white/5 font-medium leading-relaxed">
                  {selectedMarker.extraInfo || 'Synchronizing with live GPS tracking beacons...'}
                </p>

                <div className="flex items-center justify-between text-[9px] border-t border-white/5 pt-2 font-mono">
                  <span className="text-slate-500">LAT: {selectedMarker.lat.toFixed(5)}</span>
                  {selectedMarker.phone && (
                    <a 
                      href={`tel:${selectedMarker.phone}`}
                      className="text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1 hover:underline font-sans"
                    >
                      <Phone className="w-2.5 h-2.5" /> Dial Unit
                    </a>
                  )}
                </div>
              </motion.div>
            ) : activeRequest ? (
              <motion.div
                key="routing-directions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-black/40 border border-white/5 rounded-2xl p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-orange-500" /> Driving Directions
                  </span>
                  <span className="text-[9px] font-mono text-orange-400 font-bold">
                    ETA: {activeRequest.status === 'arrived' ? 'Arrived' : `${Math.max(1, Math.round(12 * (1 - travelPct)))} Mins`}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {routingSteps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-1.5 text-[9px] leading-relaxed transition-opacity ${
                        step.isActive ? 'opacity-100 font-bold text-orange-400' :
                        step.isPassed ? 'opacity-40 text-slate-400' : 'opacity-20 text-slate-600'
                      }`}
                    >
                      {step.isActive ? (
                        <CornerDownRight className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      ) : step.isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0 mt-1.5 mx-1" />
                      )}
                      <div>
                        <p>{step.text}</p>
                        <span className="text-[8px] text-slate-500 font-mono">{step.distance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                <HelpCircle className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Select Marker</span>
                <p className="text-[8px] text-slate-500 leading-normal mt-1">
                  Click on any vehicle or motorist marker on the SVG grid to query active diagnostic profiles and location telemetry.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dynamic Map Display (Center/Right) */}
      {activeLayer === 'google' ? (
        !hasValidKey ? (
          /* Google Maps API Key Setup Splash Screen (Constitution Rule 1C) */
          <div className="flex-1 bg-[#090A0D] rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[450px]">
            <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 shadow-lg shadow-orange-600/5 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="font-black text-white text-lg uppercase tracking-wider mb-2">Google Maps Key Required</h3>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed mb-6">
              Live Google Maps rendering and turn-by-turn route tracking require an authorized Google Maps Platform API key.
            </p>

            <div className="w-full max-w-md bg-white/5 border border-white/5 rounded-2xl p-5 text-left space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-[10px] font-black shrink-0">1</div>
                <div className="text-xs">
                  <p className="font-bold text-white uppercase tracking-wider text-[10px]">Get Google Maps Key</p>
                  <a 
                    href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline inline-flex items-center gap-1 font-medium mt-0.5"
                  >
                    Create API Key in Cloud Console <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-[10px] font-black shrink-0">2</div>
                <div className="text-xs">
                  <p className="font-bold text-white uppercase tracking-wider text-[10px]">Configure Secret in AI Studio</p>
                  <p className="text-slate-400 mt-0.5 leading-normal">
                    Click the <strong>Settings (⚙️ gear icon)</strong> in the top-right corner, select <strong>Secrets</strong>, add <strong>GOOGLE_MAPS_PLATFORM_KEY</strong>, paste your key, and press Enter.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveLayer('cyber')}
              className="mt-6 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl border border-white/5 transition-all"
            >
              Switch to Tactical Cyber View
            </button>
          </div>
        ) : (
          /* Actual Google Maps Platform Container */
          <div className="flex-1 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col h-full min-h-[450px]">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={{ lat: 0.3136, lng: 32.5812 }}
                defaultZoom={13}
                mapId="DEMO_MAP_ID"
                colorScheme="DARK"
                gestureHandling="cooperative"
                disableDefaultUI={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                {/* Auto-centering controller */}
                <MapController selectedMarker={selectedMarker} />

                {/* Routing displays */}
                {activeRequest && (() => {
                  const victimM = markers.find(m => m.id === activeRequest.id);
                  if (victimM) {
                    return (
                      <RouteDisplay 
                        origin={{ lat: 0.3450, lng: 32.5990 }}
                        destination={{ lat: victimM.lat, lng: victimM.lon }} 
                      />
                    );
                  }
                  return null;
                })()}

                {/* Telemetry Markers */}
                {filteredMarkers.map((marker) => {
                  const isSelected = selectedMarker?.id === marker.id;
                  let pinBg = '#ef4444';
                  if (marker.type === 'provider') pinBg = '#f97316';
                  else if (marker.type === 'fleet') pinBg = '#06b6d4';

                  return (
                    <AdvancedMarker
                      key={marker.id}
                      position={{ lat: marker.lat, lng: marker.lon }}
                      onClick={() => setSelectedMarker(marker)}
                      title={marker.name}
                    >
                      <Pin 
                        background={pinBg} 
                        borderColor="#08090C" 
                        glyphColor="#fff" 
                        scale={isSelected ? 1.25 : 1.0}
                      />
                    </AdvancedMarker>
                  );
                })}
              </Map>
            </APIProvider>

            {/* Layer View controls over map */}
            <div className="absolute top-4 right-4 flex gap-1 bg-black/70 p-1 rounded-xl border border-white/10 z-20">
              {[
                { id: 'cyber', label: 'CYBER' },
                { id: 'google', label: 'GOOGLE MAP' },
                { id: 'satellite', label: 'SAT' }
              ].map(layer => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as any)}
                  className={`text-[8px] font-black py-1 px-2 rounded-lg uppercase tracking-wider transition-all ${
                    activeLayer === layer.id 
                      ? 'bg-orange-600 text-white font-black' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>

            {/* Interactive map legend floating */}
            <div className="absolute bottom-4 right-4 bg-[#08090C]/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex gap-3 text-[8px] uppercase tracking-wider font-extrabold z-20 shadow-lg">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-slate-400">Motorist</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-slate-400">AA Tech</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-slate-400">Fleet Unit</span>
              </div>
            </div>
          </div>
        )
      ) : (
        /* SVG Map Canvas Display (Center/Right) */
        <div className="flex-1 bg-[#090A0D] rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center min-h-[450px]">
          {/* Radar beam simulator sweep */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent top-0 animate-[bounce_8s_infinite] pointer-events-none" />

          {/* Map Type Backdrop */}
          {activeLayer === 'satellite' && (
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center pointer-events-none" />
          )}

          <svg 
            viewBox="0 0 800 500" 
            className="w-full h-full relative z-10"
          >
            {/* Coordinates overlay lines */}
            <text x="20" y="30" fill="rgba(255,255,255,0.15)" fontSize="8.5" fontFamily="monospace">EAT-0.312°S / 32.581°E</text>
            <text x="630" y="480" fill="rgba(255,255,255,0.12)" fontSize="8.5" fontFamily="monospace">AA-OPERATIONAL-GRID-V3</text>

            {/* 1. Road Networks */}
            <path 
              d="M 50,450 Q 150,380 250,300 T 350,220" 
              stroke={activeLayer === 'cyber' ? "rgba(249,115,22,0.22)" : "rgba(255,255,255,0.25)"}
              strokeWidth={4} 
              fill="none" 
              strokeDasharray={activeRequest?.locationName.includes("Expressway") ? "none" : "6 4"}
              className={activeRequest?.locationName.includes("Expressway") ? "animate-[dash_1.5s_linear_infinite]" : ""}
            />
            <text x="110" y="415" fill="rgba(255,255,255,0.25)" fontSize="7.5" fontFamily="monospace" transform="rotate(-30 110 415)">ENTEBBE EXPRESSWAY</text>

            <path 
              d="M 350,220 L 750,180" 
              stroke={activeLayer === 'cyber' ? "rgba(6,182,212,0.22)" : "rgba(255,255,255,0.2)"}
              strokeWidth={3} 
              fill="none" 
            />
            <text x="520" y="210" fill="rgba(255,255,255,0.25)" fontSize="7.5" fontFamily="monospace" transform="rotate(-5 520 210)">JINJA ROAD Corridor</text>

            <path 
              d="M 80,180 Q 350,80 720,130" 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth={3.5} 
              fill="none" 
            />
            <text x="310" y="105" fill="rgba(255,255,255,0.2)" fontSize="7.5" fontFamily="monospace">NORTHERN BYPASS HIGHWAY</text>

            <path 
              d="M 350,220 Q 450,320 520,450" 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth={3} 
              fill="none" 
            />
            <text x="435" y="335" fill="rgba(255,255,255,0.25)" fontSize="7.5" fontFamily="monospace" transform="rotate(45 435 335)">GGABA ROAD CORRIDOR</text>

            <path 
              d="M 350,220 Q 340,150 290,130" 
              stroke="rgba(249,115,22,0.15)" 
              strokeWidth={3} 
              fill="none" 
            />

            <line x1="280" y1="180" x2="420" y2="280" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
            <line x1="250" y1="240" x2="440" y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
            <line x1="300" y1="150" x2="380" y2="350" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />

            {/* 2. Plot Districts (Major hubs) */}
            {[
              { name: 'KOLOLO HQ', x: 420, y: 160 },
              { name: 'NAKASERO CORNER', x: 310, y: 190 },
              { name: 'NAKAWA INDUSTRIAL', x: 550, y: 170 },
              { name: 'WANDEGEYA CIRCLE', x: 290, y: 130 },
              { name: 'KAJJANSI STATION', x: 190, y: 360 },
              { name: 'BUGOLOBI SECTOR', x: 490, y: 220 }
            ].map((hub, idx) => (
              <g key={idx} className="pointer-events-none opacity-40">
                <circle cx={hub.x} cy={hub.y} r="2.5" fill="white" />
                <text x={hub.x + 7} y={hub.y + 3} fill="rgba(255,255,255,0.35)" fontSize="7.5" fontWeight="black" fontFamily="monospace">{hub.name}</text>
              </g>
            ))}

            {/* 3. Draw active rescue paths */}
            {activeRequest && (activeRequest.status === 'accepted' || activeRequest.status === 'en_route' || activeRequest.status === 'arrived') && (() => {
              const victimM = markers.find(m => m.id === activeRequest.id);
              const provM = markers.find(m => m.id === activeRequest.providerId);
              if (!victimM || !provM) return null;

              const vCoords = project(victimM.lat, victimM.lon);
              const originCoords = project(0.3450, 32.5990);

              return (
                <g>
                  <path 
                    d={`M ${originCoords.x},${originCoords.y} Q ${(originCoords.x + vCoords.x)/2 - 50},${(originCoords.y + vCoords.y)/2 - 50} ${vCoords.x},${vCoords.y}`} 
                    stroke="rgba(249,115,22,0.35)" 
                    strokeWidth="2.5" 
                    fill="none" 
                    strokeDasharray="5 5" 
                    className="animate-[dash_1s_linear_infinite]"
                  />
                  <circle cx={(originCoords.x + vCoords.x)/2} cy={(originCoords.y + vCoords.y)/2} r="3" fill="#f97316" className="animate-ping" />
                </g>
              );
            })()}

            {/* 4. Plot Active Telemetry Nodes */}
            {filteredMarkers.map((marker) => {
              const coords = project(marker.lat, marker.lon);
              const isSelected = selectedMarker?.id === marker.id;

              let color = '#ef4444';
              let ringColor = 'rgba(239, 68, 68, 0.4)';

              if (marker.type === 'provider') {
                color = '#f97316';
                ringColor = 'rgba(249, 115, 22, 0.4)';
              } else if (marker.type === 'fleet') {
                color = '#06b6d4';
                ringColor = 'rgba(6, 182, 212, 0.4)';
              }

              return (
                <g 
                  key={marker.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedMarker(marker)}
                >
                  <circle 
                    cx={coords.x} 
                    cy={coords.y} 
                    r={isSelected ? 18 : 10} 
                    fill={ringColor} 
                    className="transition-all animate-ping [animation-duration:3s]" 
                  />

                  <circle 
                    cx={coords.x} 
                    cy={coords.y} 
                    r={isSelected ? 9 : 6} 
                    fill={color} 
                    stroke="#08090C" 
                    strokeWidth={1.5}
                    className="transition-all"
                  />

                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <rect 
                      x={coords.x - 50} 
                      y={coords.y - 30} 
                      width="100" 
                      height="16" 
                      rx="4" 
                      fill="#0F1116" 
                      stroke="rgba(255,255,255,0.15)" 
                      strokeWidth="0.5" 
                    />
                    <text 
                      x={coords.x} 
                      y={coords.y - 19} 
                      fill="white" 
                      fontSize="7" 
                      fontWeight="black" 
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {marker.name.toUpperCase().substring(0, 14)}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Layer View controls over map */}
          <div className="absolute top-4 right-4 flex gap-1 bg-black/70 p-1 rounded-xl border border-white/10 z-20">
            {[
              { id: 'cyber', label: 'CYBER' },
              { id: 'google', label: 'GOOGLE MAP' },
              { id: 'satellite', label: 'SAT' }
            ].map(layer => (
              <button
                key={layer.id}
                onClick={() => {
                  if (layer.id === 'google') {
                    setActiveLayer('google');
                  } else {
                    setActiveLayer(layer.id as any);
                  }
                }}
                className={`text-[8px] font-black py-1 px-2 rounded-lg uppercase tracking-wider transition-all ${
                  activeLayer === layer.id 
                    ? 'bg-orange-600 text-white font-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Interactive map legend floating */}
          <div className="absolute bottom-4 right-4 bg-[#08090C]/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex gap-3 text-[8px] uppercase tracking-wider font-extrabold z-20 shadow-lg">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-400">Motorist</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-slate-400">AA Tech</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-slate-400">Fleet Unit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
