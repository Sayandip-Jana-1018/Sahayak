class UserModel {
  const UserModel({
    required this.id,
    required this.clerkId,
    this.email,
    this.phone,
    this.fullName,
    this.avatarUrl,
    required this.role,
    this.organizationId,
    required this.onboardingComplete,
  });

  final String id;
  final String clerkId;
  final String? email;
  final String? phone;
  final String? fullName;
  final String? avatarUrl;
  final String role; // family | elderly | ngo_admin | sys_admin
  final String? organizationId;
  final bool onboardingComplete;

  bool get isFamily   => role == 'family';
  bool get isElderly  => role == 'elderly';
  bool get isNgoAdmin => role == 'ngo_admin';
  bool get isSysAdmin => role == 'sys_admin';

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id:                 json['id']                 as String,
        clerkId:            (json['clerkId']           as String?) ?? '',
        email:              json['email']              as String?,
        phone:              json['phone']              as String?,
        fullName:           json['fullName']           as String?,
        avatarUrl:          json['avatarUrl']          as String?,
        role:               (json['role'] as String?) ?? 'family',
        organizationId:     json['organizationId']     as String?,
        onboardingComplete: (json['onboardingComplete'] as bool?) ?? false,
      );

  UserModel copyWith({bool? onboardingComplete}) => UserModel(
        id: id,
        clerkId: clerkId,
        email: email,
        phone: phone,
        fullName: fullName,
        avatarUrl: avatarUrl,
        role: role,
        organizationId: organizationId,
        onboardingComplete: onboardingComplete ?? this.onboardingComplete,
      );

  Map<String, dynamic> toJson() => {
        'id':                 id,
        'clerkId':            clerkId,
        'email':              email,
        'phone':              phone,
        'fullName':           fullName,
        'avatarUrl':          avatarUrl,
        'role':               role,
        'organizationId':     organizationId,
        'onboardingComplete': onboardingComplete,
      };
}

class ElderlyProfile {
  const ElderlyProfile({
    required this.id,
    required this.name,
    this.ageYears,
    this.city,
    this.state,
    required this.primaryLanguage,
    this.phoneNumber,
    required this.fontSizePreference,
    required this.isActive,
    this.lastActiveAt,
    this.lastLocationLat,
    this.lastLocationLng,
    this.batteryLevel,
    required this.lonelinessDaysCount,
  });

  final String id;
  final String name;
  final int? ageYears;
  final String? city;
  final String? state;
  final String primaryLanguage; // hi | ta | bn | mr | te | kn | gu | pa | ml | ur | en
  final String? phoneNumber;
  final String fontSizePreference; // normal | large | xlarge
  final bool isActive;
  final DateTime? lastActiveAt;
  final double? lastLocationLat;
  final double? lastLocationLng;
  final int? batteryLevel;
  final int lonelinessDaysCount;

  String get displayName => name;
  String get cityState   => [city, state].where((e) => e != null).join(', ');

  factory ElderlyProfile.fromJson(Map<String, dynamic> json) => ElderlyProfile(
        id:                  json['id']                  as String,
        name:                json['name']                as String,
        ageYears:            json['ageYears']            as int?,
        city:                json['city']                as String?,
        state:               json['state']               as String?,
        primaryLanguage:     (json['primaryLanguage'] as String?) ?? 'hi',
        phoneNumber:         json['phoneNumber']         as String?,
        fontSizePreference:  (json['fontSizePreference'] as String?) ?? 'normal',
        isActive:            (json['isActive']           as bool?) ?? true,
        lastActiveAt:        json['lastActiveAt'] != null
            ? DateTime.tryParse(json['lastActiveAt'] as String)
            : null,
        lastLocationLat: json['lastLocationLat'] != null
            ? double.tryParse(json['lastLocationLat'].toString())
            : null,
        lastLocationLng: json['lastLocationLng'] != null
            ? double.tryParse(json['lastLocationLng'].toString())
            : null,
        batteryLevel:        json['batteryLevel']        as int?,
        lonelinessDaysCount: (json['lonelinessDaysCount'] as int?) ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id':                  id,
        'name':                name,
        'ageYears':            ageYears,
        'city':                city,
        'state':               state,
        'primaryLanguage':     primaryLanguage,
        'phoneNumber':         phoneNumber,
        'fontSizePreference':  fontSizePreference,
        'isActive':            isActive,
        'lastActiveAt':        lastActiveAt?.toIso8601String(),
        'lastLocationLat':     lastLocationLat,
        'lastLocationLng':     lastLocationLng,
        'batteryLevel':        batteryLevel,
        'lonelinessDaysCount': lonelinessDaysCount,
      };
}

class MedicationReminder {
  const MedicationReminder({
    required this.id,
    required this.elderlyProfileId,
    required this.medicineName,
    this.genericName,
    this.dosage,
    this.unit,
    this.frequency,
    required this.reminderTimes,
    this.startDate,
    this.endDate,
    required this.isActive,
    this.prescriptionImageUrl,
    this.instructions,
    this.todayStatus,
    this.todaySchedule = const [],
  });

  final String id;
  final String elderlyProfileId;
  final String medicineName;
  final String? genericName;
  final String? dosage;
  final String? unit;
  final String? frequency;
  final List<String> reminderTimes;
  final String? startDate;
  final String? endDate;
  final bool isActive;
  final String? prescriptionImageUrl;
  final String? instructions;
  final String? todayStatus;
  final List<MedicationScheduleEntry> todaySchedule;

  factory MedicationReminder.fromJson(Map<String, dynamic> json) =>
      MedicationReminder(
        id:                   json['id']                   as String,
        elderlyProfileId:     json['elderlyProfileId']     as String,
        medicineName:         json['medicineName']         as String,
        genericName:          json['genericName']          as String?,
        dosage:               json['dosage']               as String?,
        unit:                 json['unit']                 as String?,
        frequency:            json['frequency']            as String?,
        reminderTimes: ((json['reminderTimes'] as List?) ?? [])
            .map((e) => e.toString())
            .toList(),
        startDate:            json['startDate']            as String?,
        endDate:              json['endDate']              as String?,
        isActive:             (json['isActive']            as bool?) ?? true,
        prescriptionImageUrl: json['prescriptionImageUrl'] as String?,
        instructions:         json['instructions']         as String?,
        todayStatus:          json['todayStatus']          as String?,
        todaySchedule: ((json['todaySchedule'] as List?) ?? const [])
            .map((e) => MedicationScheduleEntry.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

  Map<String, dynamic> toJson() => {
        'id':                   id,
        'elderlyProfileId':     elderlyProfileId,
        'medicineName':         medicineName,
        'genericName':          genericName,
        'dosage':               dosage,
        'unit':                 unit,
        'frequency':            frequency,
        'reminderTimes':        reminderTimes,
        'startDate':            startDate,
        'endDate':              endDate,
        'isActive':             isActive,
        'prescriptionImageUrl': prescriptionImageUrl,
        'instructions':         instructions,
        'todayStatus':          todayStatus,
        'todaySchedule':        todaySchedule.map((e) => e.toJson()).toList(),
      };
}

class MedicationScheduleEntry {
  const MedicationScheduleEntry({
    required this.reminderId,
    required this.time,
    required this.scheduledAt,
    required this.status,
    this.takenAt,
    this.logId,
  });

  final String reminderId;
  final String time;
  final DateTime scheduledAt;
  final String status;
  final DateTime? takenAt;
  final String? logId;

  bool get isTaken => status == 'taken';
  bool get isMissed => status == 'missed';
  bool get isPending => status == 'pending';
  bool get isSkipped => status == 'skipped';

  factory MedicationScheduleEntry.fromJson(Map<String, dynamic> json) =>
      MedicationScheduleEntry(
        reminderId: json['reminderId'] as String,
        time: json['time'] as String,
        scheduledAt: DateTime.parse(json['scheduledAt'] as String),
        status: (json['status'] as String?) ?? 'pending',
        takenAt: json['takenAt'] != null
            ? DateTime.tryParse(json['takenAt'] as String)
            : null,
        logId: json['logId'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'reminderId': reminderId,
        'time': time,
        'scheduledAt': scheduledAt.toIso8601String(),
        'status': status,
        'takenAt': takenAt?.toIso8601String(),
        'logId': logId,
      };
}

class MedicationLog {
  const MedicationLog({
    required this.id,
    required this.reminderId,
    required this.elderlyProfileId,
    required this.scheduledAt,
    this.takenAt,
    required this.status,
  });

  final String id;
  final String reminderId;
  final String elderlyProfileId;
  final DateTime scheduledAt;
  final DateTime? takenAt;
  final String status; // pending | taken | missed | skipped

  bool get isTaken   => status == 'taken';
  bool get isMissed  => status == 'missed';
  bool get isPending => status == 'pending';
  bool get isSkipped => status == 'skipped';

  factory MedicationLog.fromJson(Map<String, dynamic> json) => MedicationLog(
        id:               json['id']               as String,
        reminderId:       json['reminderId']       as String,
        elderlyProfileId: json['elderlyProfileId'] as String,
        scheduledAt:      DateTime.parse(json['scheduledAt'] as String),
        takenAt:          json['takenAt'] != null
            ? DateTime.tryParse(json['takenAt'] as String)
            : null,
        status: (json['status'] as String?) ?? 'pending',
      );
}

class SosEvent {
  const SosEvent({
    required this.id,
    required this.elderlyProfileId,
    required this.triggeredAt,
    this.triggerType,
    required this.severity,
    this.locationLat,
    this.locationLng,
    this.resolvedAt,
    required this.smsCount,
    required this.pushCount,
    this.notes,
  });

  final String id;
  final String elderlyProfileId;
  final DateTime triggeredAt;
  final String? triggerType; // voice | shake | inactivity | fall
  final String severity;     // low | medium | high | critical
  final double? locationLat;
  final double? locationLng;
  final DateTime? resolvedAt;
  final int smsCount;
  final int pushCount;
  final String? notes;

  bool get isResolved => resolvedAt != null;

  factory SosEvent.fromJson(Map<String, dynamic> json) => SosEvent(
        id:               json['id']               as String,
        elderlyProfileId: json['elderlyProfileId'] as String,
        triggeredAt:      DateTime.parse(json['triggeredAt'] as String),
        triggerType:      json['triggerType']       as String?,
        severity:         (json['severity'] as String?) ?? 'high',
        locationLat: json['locationLat'] != null
            ? double.tryParse(json['locationLat'].toString())
            : null,
        locationLng: json['locationLng'] != null
            ? double.tryParse(json['locationLng'].toString())
            : null,
        resolvedAt: json['resolvedAt'] != null
            ? DateTime.tryParse(json['resolvedAt'] as String)
            : null,
        smsCount:  (json['smsCount']  as int?) ?? 0,
        pushCount: (json['pushCount'] as int?) ?? 0,
        notes:     json['notes']               as String?,
      );
}

class HealthNote {
  const HealthNote({
    required this.id,
    required this.elderlyProfileId,
    required this.authorUserId,
    required this.noteText,
    required this.createdAt,
  });

  final String id;
  final String elderlyProfileId;
  final String authorUserId;
  final String noteText;
  final DateTime createdAt;

  factory HealthNote.fromJson(Map<String, dynamic> json) => HealthNote(
        id:               json['id']               as String,
        elderlyProfileId: json['elderlyProfileId'] as String,
        authorUserId:     json['authorUserId']     as String,
        noteText:         json['noteText']         as String,
        createdAt:        DateTime.parse(json['createdAt'] as String),
      );
}

class Appointment {
  const Appointment({
    required this.id,
    required this.elderlyProfileId,
    required this.doctorName,
    this.specialty,
    this.location,
    required this.scheduledAt,
    this.notes,
  });

  final String id;
  final String elderlyProfileId;
  final String doctorName;
  final String? specialty;
  final String? location;
  final DateTime scheduledAt;
  final String? notes;

  factory Appointment.fromJson(Map<String, dynamic> json) => Appointment(
        id:               json['id']               as String,
        elderlyProfileId: json['elderlyProfileId'] as String,
        doctorName:       json['doctorName']       as String,
        specialty:        json['specialty']        as String?,
        location:         json['location']         as String?,
        scheduledAt:      DateTime.parse(json['scheduledAt'] as String),
        notes:            json['notes']            as String?,
      );

  Map<String, dynamic> toJson() => {
        'elderlyProfileId': elderlyProfileId,
        'doctorName':       doctorName,
        'specialty':        specialty,
        'location':         location,
        'scheduledAt':      scheduledAt.toIso8601String(),
        'notes':            notes,
      };
}

class DeviceRegistration {
  const DeviceRegistration({
    required this.id,
    required this.elderlyProfileId,
    required this.deviceKey,
    this.deviceModel,
    this.androidVersion,
    this.fcmToken,
    required this.isActive,
    this.lastPingAt,
  });

  final String id;
  final String elderlyProfileId;
  final String deviceKey;
  final String? deviceModel;
  final String? androidVersion;
  final String? fcmToken;
  final bool isActive;
  final DateTime? lastPingAt;

  factory DeviceRegistration.fromJson(Map<String, dynamic> json) =>
      DeviceRegistration(
        id:               json['id']               as String,
        elderlyProfileId: json['elderlyProfileId'] as String,
        deviceKey:        json['deviceKey']        as String,
        deviceModel:      json['deviceModel']      as String?,
        androidVersion:   json['androidVersion']   as String?,
        fcmToken:         json['fcmToken']         as String?,
        isActive:         (json['isActive']        as bool?) ?? true,
        lastPingAt: json['lastPingAt'] != null
            ? DateTime.tryParse(json['lastPingAt'] as String)
            : null,
      );
}

class DashboardData {
  const DashboardData({
    required this.profile,
    required this.stats,
    required this.recentActivity,
    required this.location,
  });

  final ElderlyProfile profile;
  final DashboardStats stats;
  final List<Map<String, dynamic>> recentActivity;
  final DashboardLocation location;

  factory DashboardData.fromJson(Map<String, dynamic> json) => DashboardData(
        profile: ElderlyProfile.fromJson(json['profile'] as Map<String, dynamic>),
        stats:   DashboardStats.fromJson(json['stats']   as Map<String, dynamic>),
        recentActivity: ((json['recentActivity'] as List?) ?? [])
            .cast<Map<String, dynamic>>(),
        location: DashboardLocation.fromJson(
            json['location'] as Map<String, dynamic>),
      );
}

class DashboardStats {
  const DashboardStats({
    this.lastActive,
    required this.medicationsToday,
    required this.sosEventsThisWeek,
    required this.dailyUsage,
  });

  final DateTime? lastActive;
  final MedStats medicationsToday;
  final int sosEventsThisWeek;
  final int dailyUsage;

  factory DashboardStats.fromJson(Map<String, dynamic> json) => DashboardStats(
        lastActive: json['lastActive'] != null
            ? DateTime.tryParse(json['lastActive'] as String)
            : null,
        medicationsToday: MedStats.fromJson(
            json['medicationsToday'] as Map<String, dynamic>),
        sosEventsThisWeek: (json['sosEventsThisWeek'] as int?) ?? 0,
        dailyUsage:        (json['dailyUsage']        as int?) ?? 0,
      );
}

class MedStats {
  const MedStats({
    required this.taken,
    required this.total,
    required this.pending,
    required this.missed,
  });

  final int taken;
  final int total;
  final int pending;
  final int missed;

  factory MedStats.fromJson(Map<String, dynamic> json) => MedStats(
        taken:   (json['taken']   as int?) ?? 0,
        total:   (json['total']   as int?) ?? 0,
        pending: (json['pending'] as int?) ?? 0,
        missed:  (json['missed']  as int?) ?? 0,
      );
}

class DashboardLocation {
  const DashboardLocation({
    this.lat,
    this.lng,
    this.address,
    this.updatedAt,
  });

  final double? lat;
  final double? lng;
  final String? address;
  final DateTime? updatedAt;

  bool get hasLocation => lat != null && lng != null;

  factory DashboardLocation.fromJson(Map<String, dynamic> json) =>
      DashboardLocation(
        lat: json['lat'] != null
            ? double.tryParse(json['lat'].toString())
            : null,
        lng: json['lng'] != null
            ? double.tryParse(json['lng'].toString())
            : null,
        address:   json['address']   as String?,
        updatedAt: json['updatedAt'] != null
            ? DateTime.tryParse(json['updatedAt'] as String)
            : null,
      );
}
