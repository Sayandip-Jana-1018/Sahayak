import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import '../../shared/models/models.dart';
import '../theme/color_scheme.dart';
import '../theme/typography.dart';

class StorageService {
  StorageService._();
  static final StorageService instance = StorageService._();

  static const _dashboardBox   = 'dashboard';
  static const _medicationsBox = 'medications';
  static const _profileBox     = 'profile';
  static const _settingsBox    = 'settings';
  static const _pendingBox     = 'pending';

  Box? _dashboard;
  Box? _medications;
  Box? _profile;
  Box? _settings;
  Box? _pending;

  bool get _ready => _settings != null;

  Future<void> init() async {
    await Hive.initFlutter();
    _dashboard   = await Hive.openBox(_dashboardBox);
    _medications = await Hive.openBox(_medicationsBox);
    _profile     = await Hive.openBox(_profileBox);
    _settings    = await Hive.openBox(_settingsBox);
    _pending     = await Hive.openBox(_pendingBox);
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  SahayakColorTheme get colorTheme {
    if (!_ready) return SahayakColorTheme.saffron;
    final key = _settings!.get('color_theme', defaultValue: 'saffron') as String;
    return SahayakColorThemeExt.fromKey(key);
  }

  Future<void> setColorTheme(SahayakColorTheme t) async {
    if (!_ready) return;
    await _settings!.put('color_theme', t.storageKey);
  }

  bool get isDarkMode {
    if (!_ready) return true;
    return _settings!.get('dark_mode', defaultValue: true) as bool;
  }

  Future<void> setDarkMode(bool value) async {
    if (!_ready) return;
    await _settings!.put('dark_mode', value);
  }

  FontScale get fontScale {
    if (!_ready) return FontScale.normal;
    final key = _settings!.get('font_scale', defaultValue: 'normal') as String;
    return FontScaleExt.fromKey(key);
  }

  Future<void> setFontScale(FontScale s) async {
    if (!_ready) return;
    await _settings!.put('font_scale', s.storageKey);
  }

  String get language {
    if (!_ready) return 'hi';
    return _settings!.get('language', defaultValue: 'hi') as String;
  }

  Future<void> setLanguage(String lang) async {
    if (!_ready) return;
    await _settings!.put('language', lang);
  }

  String? get activeProfileId {
    if (!_ready) return null;
    return _settings!.get('active_profile_id') as String?;
  }

  Future<void> setActiveProfileId(String id) async {
    if (!_ready) return;
    await _settings!.put('active_profile_id', id);
  }

  bool get hasActiveProfile => activeProfileId != null;

  // ── Profile Cache ─────────────────────────────────────────────────────────
  ElderlyProfile? get cachedProfile {
    if (!_ready) return null;
    final raw = _profile!.get('data') as String?;
    if (raw == null) return null;
    try {
      return ElderlyProfile.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> cacheProfile(ElderlyProfile p) async {
    if (!_ready) return;
    await _profile!.put('data', jsonEncode(p.toJson()));
  }

  // ── Dashboard Cache ───────────────────────────────────────────────────────
  DashboardData? get cachedDashboard {
    if (!_ready) return null;
    final raw = _dashboard!.get('data') as String?;
    if (raw == null) return null;
    try {
      return DashboardData.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> cacheDashboard(Map<String, dynamic> json) async {
    if (!_ready) return;
    await _dashboard!.put('data', jsonEncode(json));
  }

  // ── Medications Cache ─────────────────────────────────────────────────────
  List<MedicationReminder> get cachedMedications {
    if (!_ready) return [];
    final raw = _medications!.get('data') as String?;
    if (raw == null) return [];
    try {
      return (jsonDecode(raw) as List)
          .map((e) => MedicationReminder.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> cacheMedications(List<Map<String, dynamic>> meds) async {
    if (!_ready) return;
    await _medications!.put('data', jsonEncode(meds));
  }

  // ── Pending Queue (offline actions) ───────────────────────────────────────
  List<Map<String, dynamic>> get pendingActions {
    if (!_ready) return [];
    final raw = _pending!.get('queue') as String?;
    if (raw == null) return [];
    return (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
  }

  Future<void> enqueuePendingAction(Map<String, dynamic> action) async {
    if (!_ready) return;
    final queue = pendingActions;
    queue.add({...action, '_retries': 0, '_queuedAt': DateTime.now().toIso8601String()});
    await _pending!.put('queue', jsonEncode(queue));
  }

  Future<void> dequeuePendingAction(int index) async {
    if (!_ready) return;
    final queue = pendingActions;
    if (index < queue.length) {
      queue.removeAt(index);
      await _pending!.put('queue', jsonEncode(queue));
    }
  }

  Future<void> clearAll() async {
    if (!_ready) return;
    await _dashboard!.clear();
    await _medications!.clear();
    await _profile!.clear();
    await _pending!.clear();
    // Keep settings (theme, language etc.)
  }
}
