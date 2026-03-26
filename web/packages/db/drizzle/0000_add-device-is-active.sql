CREATE TABLE "ai_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature" text NOT NULL,
	"tokens_used" integer DEFAULT 0,
	"processing_ms" integer DEFAULT 0,
	"language" text,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"target" text DEFAULT 'all',
	"priority" text DEFAULT 'info',
	"created_by_user_id" uuid,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"elderly_profile_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"doctor_name" text NOT NULL,
	"specialty" text,
	"location" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "caregiver_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_id" uuid NOT NULL,
	"elderly_profile_id" uuid NOT NULL,
	"relationship" text,
	"priority" integer DEFAULT 1,
	"sos_enabled" boolean DEFAULT true,
	"location_access" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"address" text,
	"state" text,
	"language" text DEFAULT 'hi',
	"operating_hours" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_voice_commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"trigger_phrase" text NOT NULL,
	"response_type" text NOT NULL,
	"response_value" text NOT NULL,
	"language" text DEFAULT 'hi',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "demo_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"state" text,
	"estimated_devices" integer,
	"status" text DEFAULT 'new',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "device_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"elderly_profile_id" uuid NOT NULL,
	"device_key" text NOT NULL,
	"device_model" text,
	"android_version" text,
	"app_version" text,
	"fcm_token" text,
	"is_active" boolean DEFAULT true,
	"last_ping_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "device_registrations_device_key_unique" UNIQUE("device_key")
);
--> statement-breakpoint
CREATE TABLE "elderly_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"age_years" integer,
	"city" text,
	"state" text,
	"district" text,
	"primary_language" text DEFAULT 'hi',
	"phone_number" text,
	"device_id" text,
	"voice_print_vector" text,
	"font_size" text DEFAULT 'normal',
	"is_active" boolean DEFAULT true,
	"last_active_at" timestamp with time zone,
	"last_location_lat" numeric(10, 7),
	"last_location_lng" numeric(10, 7),
	"last_location_at" timestamp with time zone,
	"battery_level" integer,
	"loneliness_days_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "elderly_profiles_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "health_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"elderly_profile_id" uuid NOT NULL,
	"author_user_id" uuid NOT NULL,
	"note_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medication_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reminder_id" uuid NOT NULL,
	"elderly_profile_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"taken_at" timestamp with time zone,
	"status" text DEFAULT 'pending',
	"taken_by" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "medication_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"elderly_profile_id" uuid NOT NULL,
	"medicine_name" text NOT NULL,
	"generic_name" text,
	"dosage" text,
	"unit" text,
	"frequency" text,
	"reminder_times" text[],
	"start_date" date,
	"end_date" date,
	"is_active" boolean DEFAULT true,
	"prescription_image_url" text,
	"instructions" text,
	"bull_job_ids" text[],
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"state" text,
	"contact_email" text,
	"contact_phone" text,
	"device_limit" integer DEFAULT 10,
	"active_devices" integer DEFAULT 0,
	"subscription_tier" text DEFAULT 'org_basic',
	"subscription_valid_until" timestamp with time zone,
	"custom_flow_json" jsonb,
	"logo_url" text,
	"brand_color" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sos_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"elderly_profile_id" uuid NOT NULL,
	"triggered_at" timestamp with time zone DEFAULT now(),
	"trigger_type" text,
	"severity" text DEFAULT 'high',
	"location_lat" numeric(10, 7),
	"location_lng" numeric(10, 7),
	"response_time_ms" integer,
	"resolved_at" timestamp with time zone,
	"resolved_by_user_id" uuid,
	"notified_user_ids" text[],
	"nearest_hospital_name" text,
	"nearest_hospital_phone" text,
	"nearest_hospital_distance" numeric(6, 2),
	"sms_count" integer DEFAULT 0,
	"push_count" integer DEFAULT 0,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text,
	"phone" text,
	"full_name" text,
	"avatar_url" text,
	"role" text DEFAULT 'family',
	"organization_id" uuid,
	"onboarding_complete" boolean DEFAULT false,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "voice_command_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"elderly_profile_id" uuid NOT NULL,
	"command_text" text,
	"detected_intent" text,
	"language" text,
	"was_successful" boolean,
	"confidence_score" numeric(4, 3),
	"processing_ms" integer,
	"model_used" text,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "voice_profile_samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"elderly_profile_id" uuid NOT NULL,
	"sample_index" integer NOT NULL,
	"storage_url" text,
	"quality" numeric(3, 2),
	"language" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_elderly_profile_id_elderly_profiles_id_fk" FOREIGN KEY ("elderly_profile_id") REFERENCES "public"."elderly_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_links" ADD CONSTRAINT "caregiver_links_caregiver_id_users_id_fk" FOREIGN KEY ("caregiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_links" ADD CONSTRAINT "caregiver_links_elderly_profile_id_elderly_profiles_id_fk" FOREIGN KEY ("elderly_profile_id") REFERENCES "public"."elderly_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_library" ADD CONSTRAINT "content_library_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_voice_commands" ADD CONSTRAINT "custom_voice_commands_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_registrations" ADD CONSTRAINT "device_registrations_elderly_profile_id_elderly_profiles_id_fk" FOREIGN KEY ("elderly_profile_id") REFERENCES "public"."elderly_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elderly_profiles" ADD CONSTRAINT "elderly_profiles_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_notes" ADD CONSTRAINT "health_notes_elderly_profile_id_elderly_profiles_id_fk" FOREIGN KEY ("elderly_profile_id") REFERENCES "public"."elderly_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_notes" ADD CONSTRAINT "health_notes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_reminder_id_medication_reminders_id_fk" FOREIGN KEY ("reminder_id") REFERENCES "public"."medication_reminders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_elderly_profile_id_elderly_profiles_id_fk" FOREIGN KEY ("elderly_profile_id") REFERENCES "public"."elderly_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_reminders" ADD CONSTRAINT "medication_reminders_elderly_profile_id_elderly_profiles_id_fk" FOREIGN KEY ("elderly_profile_id") REFERENCES "public"."elderly_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sos_events" ADD CONSTRAINT "sos_events_elderly_profile_id_elderly_profiles_id_fk" FOREIGN KEY ("elderly_profile_id") REFERENCES "public"."elderly_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_command_logs" ADD CONSTRAINT "voice_command_logs_elderly_profile_id_elderly_profiles_id_fk" FOREIGN KEY ("elderly_profile_id") REFERENCES "public"."elderly_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_profile_samples" ADD CONSTRAINT "voice_profile_samples_elderly_profile_id_elderly_profiles_id_fk" FOREIGN KEY ("elderly_profile_id") REFERENCES "public"."elderly_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_feature_idx" ON "ai_usage_logs" USING btree ("feature");--> statement-breakpoint
CREATE INDEX "ai_usage_created_idx" ON "ai_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "announcements_created_idx" ON "announcements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "appointments_profile_idx" ON "appointments" USING btree ("elderly_profile_id");--> statement-breakpoint
CREATE INDEX "appointments_scheduled_idx" ON "appointments" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "caregiver_link_caregiver_idx" ON "caregiver_links" USING btree ("caregiver_id");--> statement-breakpoint
CREATE INDEX "caregiver_link_elderly_idx" ON "caregiver_links" USING btree ("elderly_profile_id");--> statement-breakpoint
CREATE INDEX "content_lib_org_idx" ON "content_library" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "content_lib_category_idx" ON "content_library" USING btree ("category");--> statement-breakpoint
CREATE INDEX "voice_cmd_org_idx" ON "custom_voice_commands" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "device_reg_profile_idx" ON "device_registrations" USING btree ("elderly_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "device_reg_key_idx" ON "device_registrations" USING btree ("device_key");--> statement-breakpoint
CREATE INDEX "elderly_created_by_idx" ON "elderly_profiles" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "elderly_phone_idx" ON "elderly_profiles" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "health_notes_profile_idx" ON "health_notes" USING btree ("elderly_profile_id");--> statement-breakpoint
CREATE INDEX "medlog_profile_date_idx" ON "medication_logs" USING btree ("elderly_profile_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "med_reminder_elderly_idx" ON "medication_reminders" USING btree ("elderly_profile_id");--> statement-breakpoint
CREATE INDEX "sos_elderly_idx" ON "sos_events" USING btree ("elderly_profile_id");--> statement-breakpoint
CREATE INDEX "sos_triggered_idx" ON "sos_events" USING btree ("triggered_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "vcl_profile_time_idx" ON "voice_command_logs" USING btree ("elderly_profile_id","timestamp");--> statement-breakpoint
CREATE INDEX "voice_sample_profile_idx" ON "voice_profile_samples" USING btree ("elderly_profile_id");