import { pgTable, uuid, text, timestamp, integer, boolean, decimal, date, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ═══════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['family', 'elderly', 'ngo_admin', 'sys_admin'] }).default('family'),
  organizationId: uuid('organization_id'),
  onboardingComplete: boolean('onboarding_complete').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex('users_clerk_idx').on(t.clerkId),
  index('users_email_idx').on(t.email),
]);

// ═══════════════════════════════════════════
// ELDERLY PROFILES
// ═══════════════════════════════════════════

export const elderlyProfiles = pgTable('elderly_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  ageYears: integer('age_years'),
  city: text('city'),
  state: text('state'),
  district: text('district'),
  primaryLanguage: text('primary_language', {
    enum: ['hi', 'ta', 'bn', 'mr', 'te', 'kn', 'gu', 'pa', 'ml', 'ur', 'en'],
  }).default('hi'),
  phoneNumber: text('phone_number').unique(),
  deviceId: text('device_id'),
  voicePrintVector: text('voice_print_vector'),
  fontSizePreference: text('font_size', { enum: ['normal', 'large', 'xlarge'] }).default('normal'),
  isActive: boolean('is_active').default(true),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  lastLocationLat: decimal('last_location_lat', { precision: 10, scale: 7 }),
  lastLocationLng: decimal('last_location_lng', { precision: 10, scale: 7 }),
  lastLocationAt: timestamp('last_location_at', { withTimezone: true }),
  batteryLevel: integer('battery_level'),
  lonelinessDaysCount: integer('loneliness_days_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('elderly_created_by_idx').on(t.createdByUserId),
  index('elderly_phone_idx').on(t.phoneNumber),
]);

// ═══════════════════════════════════════════
// CAREGIVER LINKS
// ═══════════════════════════════════════════

export const caregiverLinks = pgTable('caregiver_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  caregiverId: uuid('caregiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  elderlyProfileId: uuid('elderly_profile_id').notNull().references(() => elderlyProfiles.id, { onDelete: 'cascade' }),
  relationship: text('relationship'),
  priority: integer('priority').default(1),
  sosEnabled: boolean('sos_enabled').default(true),
  locationAccess: boolean('location_access').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('caregiver_link_caregiver_idx').on(t.caregiverId),
  index('caregiver_link_elderly_idx').on(t.elderlyProfileId),
]);

// ═══════════════════════════════════════════
// MEDICATION REMINDERS
// ═══════════════════════════════════════════

export const medicationReminders = pgTable('medication_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  elderlyProfileId: uuid('elderly_profile_id').notNull().references(() => elderlyProfiles.id, { onDelete: 'cascade' }),
  medicineName: text('medicine_name').notNull(),
  genericName: text('generic_name'),
  dosage: text('dosage'),
  unit: text('unit'),
  frequency: text('frequency'),
  reminderTimes: text('reminder_times').array(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  isActive: boolean('is_active').default(true),
  prescriptionImageUrl: text('prescription_image_url'),
  instructions: text('instructions'),
  bullJobIds: text('bull_job_ids').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('med_reminder_elderly_idx').on(t.elderlyProfileId),
]);

// ═══════════════════════════════════════════
// MEDICATION LOGS
// ═══════════════════════════════════════════

export const medicationLogs = pgTable('medication_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  reminderId: uuid('reminder_id').notNull().references(() => medicationReminders.id, { onDelete: 'cascade' }),
  elderlyProfileId: uuid('elderly_profile_id').notNull().references(() => elderlyProfiles.id, { onDelete: 'cascade' }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  takenAt: timestamp('taken_at', { withTimezone: true }),
  status: text('status', { enum: ['pending', 'taken', 'missed', 'skipped'] }).default('pending'),
  takenBy: text('taken_by'),
  notes: text('notes'),
}, (t) => [
  index('medlog_profile_date_idx').on(t.elderlyProfileId, t.scheduledAt),
]);

// ═══════════════════════════════════════════
// SOS EVENTS
// ═══════════════════════════════════════════

export const sosEvents = pgTable('sos_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  elderlyProfileId: uuid('elderly_profile_id').notNull().references(() => elderlyProfiles.id, { onDelete: 'cascade' }),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).defaultNow(),
  triggerType: text('trigger_type', { enum: ['button', 'voice', 'shake', 'inactivity', 'fall'] }),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).default('high'),
  locationLat: decimal('location_lat', { precision: 10, scale: 7 }),
  locationLng: decimal('location_lng', { precision: 10, scale: 7 }),
  responseTimeMs: integer('response_time_ms'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolvedByUserId: uuid('resolved_by_user_id'),
  notifiedUserIds: text('notified_user_ids').array(),
  nearestHospitalName: text('nearest_hospital_name'),
  nearestHospitalPhone: text('nearest_hospital_phone'),
  nearestHospitalDistance: decimal('nearest_hospital_distance', { precision: 6, scale: 2 }),
  smsCount: integer('sms_count').default(0),
  pushCount: integer('push_count').default(0),
  notes: text('notes'),
}, (t) => [
  index('sos_elderly_idx').on(t.elderlyProfileId),
  index('sos_triggered_idx').on(t.triggeredAt),
]);

// ═══════════════════════════════════════════
// VOICE COMMAND LOGS
// ═══════════════════════════════════════════

export const voiceCommandLogs = pgTable('voice_command_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  elderlyProfileId: uuid('elderly_profile_id').notNull().references(() => elderlyProfiles.id, { onDelete: 'cascade' }),
  commandText: text('command_text'),
  detectedIntent: text('detected_intent'),
  language: text('language'),
  wasSuccessful: boolean('was_successful'),
  confidenceScore: decimal('confidence_score', { precision: 4, scale: 3 }),
  processingMs: integer('processing_ms'),
  modelUsed: text('model_used'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('vcl_profile_time_idx').on(t.elderlyProfileId, t.timestamp),
]);

// ═══════════════════════════════════════════
// ORGANIZATIONS
// ═══════════════════════════════════════════

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['ngo', 'hospital', 'old_age_home', 'csc', 'government'] }),
  state: text('state'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  deviceLimit: integer('device_limit').default(10),
  activeDevices: integer('active_devices').default(0),
  subscriptionTier: text('subscription_tier', { enum: ['org_basic', 'org_pro', 'org_enterprise'] }).default('org_basic'),
  subscriptionValidUntil: timestamp('subscription_valid_until', { withTimezone: true }),
  customFlowJson: jsonb('custom_flow_json'),
  logoUrl: text('logo_url'),
  brandColor: text('brand_color'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ═══════════════════════════════════════════
// DEMO REQUESTS
// ═══════════════════════════════════════════

export const demoRequests = pgTable('demo_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  organization: text('organization').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  state: text('state'),
  estimatedDevices: integer('estimated_devices'),
  status: text('status', { enum: ['new', 'contacted', 'demo_scheduled', 'converted', 'rejected'] }).default('new'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ═══════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════

export const usersRelations = relations(users, ({ many, one }) => ({
  elderlyProfiles: many(elderlyProfiles),
  caregiverLinks: many(caregiverLinks),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const elderlyProfilesRelations = relations(elderlyProfiles, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [elderlyProfiles.createdByUserId],
    references: [users.id],
  }),
  caregiverLinks: many(caregiverLinks),
  medicationReminders: many(medicationReminders),
  medicationLogs: many(medicationLogs),
  sosEvents: many(sosEvents),
  voiceCommandLogs: many(voiceCommandLogs),
}));

export const caregiverLinksRelations = relations(caregiverLinks, ({ one }) => ({
  caregiver: one(users, {
    fields: [caregiverLinks.caregiverId],
    references: [users.id],
  }),
  elderlyProfile: one(elderlyProfiles, {
    fields: [caregiverLinks.elderlyProfileId],
    references: [elderlyProfiles.id],
  }),
}));

export const medicationRemindersRelations = relations(medicationReminders, ({ one, many }) => ({
  elderlyProfile: one(elderlyProfiles, {
    fields: [medicationReminders.elderlyProfileId],
    references: [elderlyProfiles.id],
  }),
  logs: many(medicationLogs),
}));

export const medicationLogsRelations = relations(medicationLogs, ({ one }) => ({
  reminder: one(medicationReminders, {
    fields: [medicationLogs.reminderId],
    references: [medicationReminders.id],
  }),
  elderlyProfile: one(elderlyProfiles, {
    fields: [medicationLogs.elderlyProfileId],
    references: [elderlyProfiles.id],
  }),
}));

export const sosEventsRelations = relations(sosEvents, ({ one }) => ({
  elderlyProfile: one(elderlyProfiles, {
    fields: [sosEvents.elderlyProfileId],
    references: [elderlyProfiles.id],
  }),
}));

export const voiceCommandLogsRelations = relations(voiceCommandLogs, ({ one }) => ({
  elderlyProfile: one(elderlyProfiles, {
    fields: [voiceCommandLogs.elderlyProfileId],
    references: [elderlyProfiles.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(users),
}));

// ═══════════════════════════════════════════
// HEALTH NOTES
// ═══════════════════════════════════════════

export const healthNotes = pgTable('health_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  elderlyProfileId: uuid('elderly_profile_id').notNull().references(() => elderlyProfiles.id, { onDelete: 'cascade' }),
  authorUserId: uuid('author_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  noteText: text('note_text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('health_notes_profile_idx').on(t.elderlyProfileId),
]);

// ═══════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  elderlyProfileId: uuid('elderly_profile_id').notNull().references(() => elderlyProfiles.id, { onDelete: 'cascade' }),
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  doctorName: text('doctor_name').notNull(),
  specialty: text('specialty'),
  location: text('location'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('appointments_profile_idx').on(t.elderlyProfileId),
  index('appointments_scheduled_idx').on(t.scheduledAt),
]);

// ═══════════════════════════════════════════
// DEVICE REGISTRATIONS
// ═══════════════════════════════════════════

export const deviceRegistrations = pgTable('device_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  elderlyProfileId: uuid('elderly_profile_id').notNull().references(() => elderlyProfiles.id, { onDelete: 'cascade' }),
  deviceKey: text('device_key').unique().notNull(),
  deviceModel: text('device_model'),
  androidVersion: text('android_version'),
  appVersion: text('app_version'),
  fcmToken: text('fcm_token'),
  isActive: boolean('is_active').default(true),
  lastPingAt: timestamp('last_ping_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('device_reg_profile_idx').on(t.elderlyProfileId),
  uniqueIndex('device_reg_key_idx').on(t.deviceKey),
]);

export const userDevices = pgTable('user_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  deviceInstallationId: text('device_installation_id').notNull(),
  platform: text('platform').notNull(),
  deviceModel: text('device_model'),
  osVersion: text('os_version'),
  appVersion: text('app_version'),
  fcmToken: text('fcm_token'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index('user_devices_user_idx').on(t.userId),
  uniqueIndex('user_devices_installation_idx').on(t.deviceInstallationId),
]);

// ═══════════════════════════════════════════
// VOICE PROFILE SAMPLES
// ═══════════════════════════════════════════

export const voiceProfileSamples = pgTable('voice_profile_samples', {
  id: uuid('id').primaryKey().defaultRandom(),
  elderlyProfileId: uuid('elderly_profile_id').notNull().references(() => elderlyProfiles.id, { onDelete: 'cascade' }),
  sampleIndex: integer('sample_index').notNull(),
  storageUrl: text('storage_url'),
  quality: decimal('quality', { precision: 3, scale: 2 }),
  language: text('language'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('voice_sample_profile_idx').on(t.elderlyProfileId),
]);

// ═══════════════════════════════════════════
// NEW TABLE RELATIONS
// ═══════════════════════════════════════════

export const healthNotesRelations = relations(healthNotes, ({ one }) => ({
  elderlyProfile: one(elderlyProfiles, {
    fields: [healthNotes.elderlyProfileId],
    references: [elderlyProfiles.id],
  }),
  author: one(users, {
    fields: [healthNotes.authorUserId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  elderlyProfile: one(elderlyProfiles, {
    fields: [appointments.elderlyProfileId],
    references: [elderlyProfiles.id],
  }),
  createdBy: one(users, {
    fields: [appointments.createdByUserId],
    references: [users.id],
  }),
}));

export const deviceRegistrationsRelations = relations(deviceRegistrations, ({ one }) => ({
  elderlyProfile: one(elderlyProfiles, {
    fields: [deviceRegistrations.elderlyProfileId],
    references: [elderlyProfiles.id],
  }),
}));

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
}));

export const voiceProfileSamplesRelations = relations(voiceProfileSamples, ({ one }) => ({
  elderlyProfile: one(elderlyProfiles, {
    fields: [voiceProfileSamples.elderlyProfileId],
    references: [elderlyProfiles.id],
  }),
}));

// ═══════════════════════════════════════════
// CONTENT LIBRARY (Studio — NGO local references)
// ═══════════════════════════════════════════

export const contentLibrary = pgTable('content_library', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // hospitals | government_offices | emergency_numbers | social_services
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  state: text('state'),
  language: text('language').default('hi'),
  operatingHours: text('operating_hours'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('content_lib_org_idx').on(t.organizationId),
  index('content_lib_category_idx').on(t.category),
]);

// ═══════════════════════════════════════════
// CUSTOM VOICE COMMANDS (Studio — per org)
// ═══════════════════════════════════════════

export const customVoiceCommands = pgTable('custom_voice_commands', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  triggerPhrase: text('trigger_phrase').notNull(),
  responseType: text('response_type').notNull(), // phone_call | sms | text_response | url
  responseValue: text('response_value').notNull(),
  language: text('language').default('hi'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('voice_cmd_org_idx').on(t.organizationId),
]);

// ═══════════════════════════════════════════
// AI USAGE LOGS (Admin — cost tracking)
// ═══════════════════════════════════════════

export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  feature: text('feature').notNull(), // voice_demo | ocr | companion | schemes | emotion
  tokensUsed: integer('tokens_used').default(0),
  processingMs: integer('processing_ms').default(0),
  language: text('language'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('ai_usage_feature_idx').on(t.feature),
  index('ai_usage_created_idx').on(t.createdAt),
]);

// ═══════════════════════════════════════════
// ANNOUNCEMENTS (Admin — broadcast messages)
// ═══════════════════════════════════════════

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  target: text('target').default('all'), // all | role:ngo_admin | state:maharashtra
  priority: text('priority').default('info'), // info | warning | critical
  createdByUserId: uuid('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('announcements_created_idx').on(t.createdAt),
]);

// ═══════════════════════════════════════════
// NEW TABLE RELATIONS (Phase 3)
// ═══════════════════════════════════════════

export const contentLibraryRelations = relations(contentLibrary, ({ one }) => ({
  organization: one(organizations, {
    fields: [contentLibrary.organizationId],
    references: [organizations.id],
  }),
}));

export const customVoiceCommandsRelations = relations(customVoiceCommands, ({ one }) => ({
  organization: one(organizations, {
    fields: [customVoiceCommands.organizationId],
    references: [organizations.id],
  }),
}));

export const aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiUsageLogs.userId],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdBy: one(users, {
    fields: [announcements.createdByUserId],
    references: [users.id],
  }),
}));
