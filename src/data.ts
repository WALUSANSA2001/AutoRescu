import { UserProfile, EmergencyRequest, IndividualProvider, FleetVehicle, CompanyEmployee, Complaint } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Dr. Arthur Namara",
  phone: "+256 772 345 678",
  email: "a.namara@gmail.com",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  emergencyContacts: [
    { id: "ec-1", name: "Sarah Namara", relation: "Spouse", phone: "+256 701 987 654" },
    { id: "ec-2", name: "Uncle Ben Okello", relation: "Uncle / Mechanic", phone: "+256 752 444 333" }
  ],
  vehicles: [
    {
      id: "v-1",
      make: "Toyota",
      model: "Land Cruiser Prado",
      plateNumber: "UBP 740W",
      color: "Metallic Silver",
      fuelType: "Diesel",
      year: 2021,
      insurance: "UAP Old Mutual - Comprehensive",
      vin: "JTEGD21J40398213",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "v-2",
      make: "Subaru",
      model: "Forester",
      plateNumber: "UBL 912K",
      color: "Metallic Blue",
      fuelType: "Petrol",
      year: 2018,
      insurance: "Jubilee Insurance - Third Party",
      vin: "JF1SG52538G10283",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600"
    }
  ]
};

export const INITIAL_REQUESTS: EmergencyRequest[] = [
  {
    id: "req-3021",
    victimName: "Dr. Arthur Namara",
    victimPhone: "+256 772 345 678",
    serviceType: "Towing",
    severity: "high",
    vehicleId: "v-1",
    locationName: "Entebbe Expressway, near Kajjansi Toll Plaza",
    destination: "City Oil Nakawa Garage",
    description: "Engine overheated suddenly with thick white smoke. Coolant is leaking on the asphalt.",
    status: "completed",
    date: "Jul 8, 2026",
    eta: "Completed",
    distance: "12.4 km",
    providerId: "p-1",
    providerName: "Mukasa Towing Services",
    providerPhone: "+256 782 111 222",
    providerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    providerVehicle: "Fuso Fighter Heavy Tow Truck (UBA 412R)",
    photos: ["https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400"],
    cost: 180000,
    paymentMethod: "mtn",
    paymentStatus: "paid",
    rating: 5,
    review: "Incredibly fast response at Kajjansi. Professional crane operation and safe transit to Nakawa.",
    signature: "Arthur Namara"
  },
  {
    id: "req-3022",
    victimName: "Dr. Arthur Namara",
    victimPhone: "+256 772 345 678",
    serviceType: "Tire Replacement",
    severity: "medium",
    vehicleId: "v-2",
    locationName: "Kampala Road, opposite General Post Office",
    description: "Hit a deep pothole in heavy traffic. Front left tire is completely flat and rim looks slightly bent.",
    status: "pending",
    date: "Jul 9, 2026",
    eta: "Calculating...",
    distance: "1.2 km"
  }
];

export const INITIAL_INDIVIDUAL_PROVIDERS: IndividualProvider[] = [
  {
    id: "ip-1",
    name: "Ssekandi Ronald",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    serviceType: "Mechanic",
    phone: "+256 704 223 344",
    status: "online",
    rating: 4.8,
    completions: 142,
    earnings: 3450000,
    permitApproved: true,
    idVerified: true,
    policeCleared: true,
    vehicle: "Suzuki Carry Mobile Workshop (UBK 552A)",
    equipment: ["Obd2 Scanner", "Hydraulic Jack", "Heavy Duty Socket Set", "Battery Booster Pack"],
    latitude: 0.3156,
    longitude: 32.5855
  },
  {
    id: "ip-2",
    name: "Nsubuga Derrick",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    serviceType: "Towing",
    phone: "+256 781 998 877",
    status: "online",
    rating: 4.9,
    completions: 210,
    earnings: 8900000,
    permitApproved: true,
    idVerified: true,
    policeCleared: true,
    vehicle: "Isuzu Elf Flatbed Tow Truck (UBF 981P)",
    equipment: ["Winch Cable", "Chassis Straps", "Snatch Block", "Wheel Dollies"],
    latitude: 0.3321,
    longitude: 32.5644
  },
  {
    id: "ip-3",
    name: "Nassolo Clare",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    serviceType: "Ambulance",
    phone: "+256 776 554 433",
    status: "busy",
    rating: 5.0,
    completions: 89,
    earnings: 5600000,
    permitApproved: true,
    idVerified: true,
    policeCleared: true,
    vehicle: "Toyota Hiace ICU Ambulance (UBL 222X)",
    equipment: ["Defibrillator", "Oxygen Concentrator", "Stretcher", "Trauma Kit"],
    latitude: 0.3541,
    longitude: 32.5912
  }
];

export const INITIAL_FLEET: FleetVehicle[] = [
  {
    id: "fv-1",
    name: "AA Rescue Ranger 01",
    type: "Towing Flatbed",
    driverId: "emp-101",
    driverName: "Kato Paul",
    latitude: 0.3421,
    longitude: 32.5891,
    fuelLevel: 85,
    status: "active",
    maintSchedule: "Jul 25, 2026"
  },
  {
    id: "fv-2",
    name: "AA Fuel Tanker Vans",
    type: "Fuel & Battery Utility",
    driverId: "emp-102",
    driverName: "Aceng Brenda",
    latitude: 0.3112,
    longitude: 32.5712,
    fuelLevel: 42,
    status: "idle",
    maintSchedule: "Aug 10, 2026"
  },
  {
    id: "fv-3",
    name: "AA Heavy Crane 05",
    type: "Heavy Crane Truck",
    latitude: 0.2988,
    longitude: 32.6102,
    fuelLevel: 95,
    status: "maintenance",
    maintSchedule: "Jul 10, 2026"
  }
];

export const INITIAL_EMPLOYEES: CompanyEmployee[] = [
  {
    id: "emp-101",
    name: "Kato Paul",
    role: "Lead Heavy Operator",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    phone: "+256 774 123 456",
    inviteCode: "AA-KAMPALA-KATO",
    status: "active",
    currentJobId: "req-3022",
    rating: 4.8,
    earnings: 1200000
  },
  {
    id: "emp-102",
    name: "Aceng Brenda",
    role: "Battery & Tire Expert",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    phone: "+256 701 456 789",
    inviteCode: "AA-KAMPALA-ACENG",
    status: "active",
    rating: 4.9,
    earnings: 980000
  },
  {
    id: "emp-103",
    name: "Lwanga Timothy",
    role: "Emergency EMT Specialist",
    avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200",
    phone: "+256 752 987 654",
    inviteCode: "AA-KAMPALA-LWANGA",
    status: "suspended",
    rating: 4.1,
    earnings: 450000
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "comp-1",
    reporterName: "Dr. Arthur Namara",
    reporterRole: "Victim",
    subject: "Overcharging attempts",
    details: "Independent crane truck operator requested an extra 50,000 UGX for parking tolls which was already paid online.",
    status: "pending",
    date: "Jul 8, 2026"
  },
  {
    id: "comp-2",
    reporterName: "AA Uganda Admin",
    reporterRole: "Company",
    subject: "Incorrect fuel log",
    details: "Employee Kato Paul registered 45 Liters refuel, but vehicle telemetry showed only 30 Liters loaded at Total Energies Entebbe Rd.",
    status: "resolved",
    date: "Jul 5, 2026"
  }
];
