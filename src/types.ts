export type UserRole = 'victim' | 'provider' | 'company' | 'employee' | 'admin';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  color: string;
  fuelType: string;
  year: number;
  insurance: string;
  vin?: string;
  image?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar: string;
  emergencyContacts: EmergencyContact[];
  vehicles: Vehicle[];
}

export interface EmergencyRequest {
  id: string;
  victimName: string;
  victimPhone: string;
  serviceType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  vehicleId: string;
  locationName: string;
  destination?: string;
  description: string;
  status: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
  date: string;
  eta?: string;
  distance?: string;
  providerId?: string;
  providerName?: string;
  providerPhone?: string;
  providerAvatar?: string;
  providerVehicle?: string;
  providerLatLon?: [number, number];
  photos?: string[];
  voiceNoteUrl?: string;
  cost?: number;
  paymentMethod?: 'mtn' | 'airtel' | 'visa' | 'flutterwave';
  paymentStatus?: 'pending' | 'paid';
  rating?: number;
  review?: string;
  signature?: string;
}

export interface IndividualProvider {
  id: string;
  name: string;
  avatar: string;
  serviceType: 'Towing' | 'Mechanic' | 'Fuel Delivery' | 'Tire Replacement' | 'Ambulance' | 'Battery Jumpstart' | 'Locksmith' | 'Accident Rescue';
  phone: string;
  status: 'online' | 'offline' | 'busy';
  rating: number;
  completions: number;
  earnings: number;
  permitApproved: boolean;
  idVerified: boolean;
  policeCleared: boolean;
  vehicle: string;
  equipment: string[];
  latitude: number;
  longitude: number;
}

export interface FleetVehicle {
  id: string;
  name: string;
  type: string;
  driverId?: string;
  driverName?: string;
  latitude: number;
  longitude: number;
  fuelLevel: number; // percentage
  status: 'active' | 'idle' | 'maintenance';
  maintSchedule: string;
}

export interface CompanyEmployee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  inviteCode: string;
  status: 'active' | 'suspended';
  currentJobId?: string;
  rating: number;
  earnings: number;
}

export interface Complaint {
  id: string;
  reporterName: string;
  reporterRole: string;
  subject: string;
  details: string;
  status: 'pending' | 'resolved';
  date: string;
}
