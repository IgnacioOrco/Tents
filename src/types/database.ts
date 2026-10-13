export type UserRole = 'pilgrim' | 'host_private' | 'host_parish';

export type AccommodationType = 
  | 'parish' 
  | 'monastery' 
  | 'pilgrim_hostel' 
  | 'private_home' 
  | 'community_space';

export type BookingStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled' 
  | 'completed';

export type ConsentCategory = 
  | 'host_location_publishing' 
  | 'terms_of_service' 
  | 'privacy_policy';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  parish_diocese?: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalConsent {
  id: string;
  user_id: string;
  consent_type: ConsentCategory;
  terms_version: string;
  accepted: boolean;
  ip_address: string;
  user_agent?: string | null;
  metadata?: Record<string, unknown>;
  accepted_at: string;
}

export interface Property {
  id: string;
  host_id: string;
  name: string;
  type: AccommodationType;
  description: string | null;
  capacity: number;
  rules: string[];
  amenities: string[];
  suggested_donation_usd: number;
  exact_location?: {
    latitude: number;
    longitude: number;
  };
  fuzzy_location: {
    latitude: number;
    longitude: number;
  };
  address_text?: string;
  neighborhood: string;
  city: string;
  country: string;
  phone_contact?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

/**
 * Propiedad expuesta de forma segura para la vista del mapa público.
 * Los particulares nunca exponen address_revealed ni exact_location
 * a menos que el usuario tenga una reserva aprobada o sea el anfitrión.
 */
export interface MapProperty {
  id: string;
  name: string;
  type: AccommodationType;
  description: string;
  capacity: number;
  neighborhood: string;
  city: string;
  country?: string;
  suggested_donation_usd: number;
  latitude: number;
  longitude: number;
  is_exact_location: boolean;
  address_revealed: string;
  phone_revealed?: string | null;
  is_verified: boolean;
  rules?: string[];
  amenities?: string[];
}

export interface BookingRequest {
  id: string;
  property_id: string;
  pilgrim_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  pilgrim_creds_info?: string | null;
  message?: string | null;
  status: BookingStatus;
  host_notes?: string | null;
  created_at: string;
  updated_at: string;
}
