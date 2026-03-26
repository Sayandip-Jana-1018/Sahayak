class ApiConfig {
  ApiConfig._();

  // ── Base URL ──────────────────────────────────────────────────────────────
  // Emulator: 10.0.2.2:8080 | Real device: <your LAN IP>:8080
  static const String baseUrl = 'http://10.0.2.2:8080';

  // ── Auth ────────────────────────────────────────────────────────────────────
  static const String signIn       = '/api/auth/sign-in';
  static const String profile      = '/api/profile';

  // ── Onboarding ──────────────────────────────────────────────────────────────
  static const String onboardingStatus   = '/api/onboarding/status';
  static const String onboardingCreate   = '/api/onboarding/create-profile';
  static const String onboardingComplete = '/api/onboarding/complete';

  // ── Dashboard ───────────────────────────────────────────────────────────────
  static const String dashboardOverview = '/api/dashboard/overview';
  static const String dashboardHealth   = '/api/dashboard/health';

  // ── Medications ─────────────────────────────────────────────────────────────
  static const String medications    = '/api/medications';
  static const String medicationLogs = '/api/medications/logs';

  // ── SOS ─────────────────────────────────────────────────────────────────────
  static const String sosTrigger = '/api/sos/trigger';
  static const String sosEvents  = '/api/sos/events';

  // ── AI / Voice ───────────────────────────────────────────────────────────────
  static const String aiVoiceDemo  = '/api/ai/voice-demo';
  static const String aiCompanion  = '/api/ai/companion';
  static const String voiceProfile = '/api/voice-profile';

  // ── Health ───────────────────────────────────────────────────────────────────
  static const String healthNotes  = '/api/health-notes';
  static const String appointments = '/api/appointments';

  // ── Device / Notifications ──────────────────────────────────────────────────
  static const String deviceRegister = '/api/device/register';
  static const String deviceStatus   = '/api/device/status';

  // ── Location ────────────────────────────────────────────────────────────
  static const String locationUpdate = '/api/device/location';
}
