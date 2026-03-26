// ═══════════════════════════════════════════
// Shared TypeScript Types for Sahayak API
// ═══════════════════════════════════════════

export type SupportedLanguage = 'hi' | 'ta' | 'bn' | 'mr' | 'te' | 'kn' | 'gu' | 'pa' | 'ml' | 'ur' | 'en';

export type UserRole = 'family' | 'elderly' | 'ngo_admin' | 'sys_admin';

export type SOSTriggerType = 'voice' | 'shake' | 'inactivity' | 'fall';

export type SOSSeverity = 'low' | 'medium' | 'high' | 'critical';

export type MedicationStatus = 'pending' | 'taken' | 'missed' | 'skipped';

export type VoiceIntent = 'payment' | 'emergency' | 'medicine' | 'call' | 'general';

export type FontSize = 'normal' | 'large' | 'xlarge';

export type SubscriptionTier = 'free' | 'family' | 'org_basic' | 'org_pro' | 'org_enterprise';

export interface Location {
  lat: number;
  lng: number;
}

export interface VoiceDemoRequest {
  text: string;
  language: SupportedLanguage;
}

export interface VoiceDemoResponse {
  response_text: string;
  audio_base64: string | null;
  intent: VoiceIntent;
  language: SupportedLanguage;
  voice: string;
  processing_ms: number;
}

export interface PrescriptionOCRResult {
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  doctorName: string | null;
  patientName: string | null;
  date: string | null;
  hospitalName: string | null;
  prescriptionUrl: string | null;
  rawText: string;
}

export interface SOSTriggerRequest {
  userId: string;
  location: Location;
  triggerType: SOSTriggerType;
  severity: SOSSeverity;
}

export interface SOSResponse {
  acknowledged: boolean;
  sosEventId: string;
  notified_count: number;
  nearest_hospital: {
    name: string | null;
    phone: string | null;
    distance_km: number | null;
  };
  location_url: string;
  trigger_type: SOSTriggerType;
  severity: SOSSeverity;
  response_time_ms: number;
  timestamp: string;
}

export interface DashboardOverview {
  profile: {
    id: string;
    name: string;
    ageYears: number;
    primaryLanguage: SupportedLanguage;
    phoneNumber: string;
    isActive: boolean;
    lastActiveAt: string;
    batteryLevel: number;
  };
  stats: {
    lastActive: string;
    medicationsToday: { taken: number; total: number; pending: number };
    sosEventsThisWeek: number;
    dailyUsageMinutes: number;
    usageTrend: number;
  };
  recentActivity: ActivityItem[];
  location: {
    lat: number | null;
    lng: number | null;
    address: string | null;
    updatedAt: string | null;
  };
}

export interface ActivityItem {
  id: string;
  type: 'voice_command' | 'medication' | 'sos' | 'call' | 'payment' | 'battery' | 'location';
  description: string;
  language: SupportedLanguage;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface EmotionAnalysis {
  emotion: 'happy' | 'sad' | 'confused' | 'frustrated' | 'neutral' | 'angry' | 'surprised';
  confidence: number;
  needs_simplified_ui: boolean;
  needs_caregiver_alert: boolean;
  elderlyProfileId: string;
  analyzedAt: string;
}

export interface SchemeResult {
  name: string;
  benefit: string;
  eligibility: string;
  applyUrl: string;
  explanation_hi: string;
  explanation_en: string;
}

export interface DemoRequest {
  name: string;
  organization: string;
  phone: string;
  email?: string;
  state?: string;
  estimatedDevices?: number;
}

export interface WebSocketEvents {
  sos_triggered: {
    sosEventId: string;
    elderlyProfileId: string;
    location: Location;
    triggerType: SOSTriggerType;
    severity: SOSSeverity;
    timestamp: string;
  };
  medication_taken: {
    elderlyProfileId: string;
    medicineName: string;
    dosage: string;
    takenAt: string;
  };
  location_update: {
    elderlyProfileId: string;
    location: Location;
    timestamp: string;
  };
  low_battery: {
    elderlyProfileId: string;
    level: number;
    timestamp: string;
  };
  voice_command: {
    elderlyProfileId: string;
    commandText: string;
    intent: VoiceIntent;
    language: SupportedLanguage;
    timestamp: string;
  };
}
