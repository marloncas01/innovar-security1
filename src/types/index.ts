export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
  cost: number | null;
  totalCost: number | null;
  locationMunicipality: string | null;
  locationAddress: string | null;
  locationReference: string | null;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  city: string | null;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  duration: number | null;
  active: boolean;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  status: string;
  method: string | null;
}

export interface Photo {
  id: string;
  appointmentId: string;
  url: string;
  description: string | null;
  fileName: string;
}

export interface Zone {
  id: string;
  name: string;
  municipality: string | null;
  baseDistance: number | null;
  ratePerKm: number | null;
  flatRate: number | null;
  active: boolean;
}
