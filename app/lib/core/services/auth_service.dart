import 'dart:io';
import 'dart:math';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../network/api_client.dart';
import '../config/api_config.dart';
import 'storage_service.dart';
import '../network/socket_service.dart';
import '../../shared/models/models.dart';
import 'notification_service.dart';

/// Auth service with JWT persistence via flutter_secure_storage.
/// Dev mode: email/password sign-in via /api/auth/sign-in bridge.
/// Production: Replace with Clerk WebView flow (flutter_web_auth_2).
class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
  static const _jwtKey = 'sahayak_clerk_jwt';
  static const _userKey = 'sahayak_user_json';

  UserModel? _currentUser;
  String? _jwtToken;
  bool _hasActiveProfile = false;
  bool _listeningForTokenRefresh = false;

  UserModel? get currentUser => _currentUser;
  bool get isSignedIn => _jwtToken != null;
  bool get hasActiveProfile => _hasActiveProfile;
  String? get token => _jwtToken;

  /// Called on cold start — restores JWT from secure storage.
  Future<void> init() async {
    try {
      _jwtToken = await _storage.read(key: _jwtKey);
      if (_jwtToken != null) {
        ApiClient.instance.setToken(_jwtToken!);
        // Try to fetch fresh profile from API
        try {
          final response = await ApiClient.instance.get(ApiConfig.profile);
          final data = response.data as Map<String, dynamic>;
          _currentUser = UserModel.fromJson(data);
          // Auto-set active profile from response if not already set
          final profiles = data['elderlyProfiles'] as List<dynamic>?;
          if (profiles != null && profiles.isNotEmpty) {
            final savedPid = StorageService.instance.activeProfileId;
            if (savedPid == null) {
              final firstPid = profiles[0]['id'] as String?;
              if (firstPid != null) {
                StorageService.instance.setActiveProfileId(firstPid);
              }
            }
          }
        } catch (_) {
          // API failed (offline?) — clear token, force re-login
          debugPrint('JWT exists but profile fetch failed — clearing token');
          await _clearSecureStorage();
          _jwtToken = null;
          ApiClient.instance.clearToken();
          return;
        }
        _hasActiveProfile = StorageService.instance.activeProfileId != null;
        // Reconnect socket with stored JWT
        SocketService.instance.connect(_jwtToken!);
        await _registerCurrentUserDevice();
      }
    } catch (e) {
      debugPrint('AuthService.init error: $e');
    }
  }

  /// DEV_ONLY: Email/password sign-in via Fastify bridge endpoint.
  /// TODO: Replace with Clerk WebView flow (flutter_web_auth_2) before production.
  Future<UserModel> signIn({
    required String email,
    required String password,
  }) async {
    final response = await ApiClient.instance.post(
      '/api/auth/sign-in',
      data: {'identifier': email, 'password': password},
    );
    final data = response.data as Map<String, dynamic>;
    _jwtToken = data['token'] as String;
    _currentUser = UserModel.fromJson(data['user'] as Map<String, dynamic>);

    // Persist JWT securely — NOT in SharedPreferences
    await _storage.write(key: _jwtKey, value: _jwtToken);

    ApiClient.instance.setToken(_jwtToken!);
    SocketService.instance.connect(_jwtToken!);

    await _registerCurrentUserDevice();

    return _currentUser!;
  }

  /// Called externally once a Clerk JWT is obtained (e.g. from WebView flow).
  Future<UserModel> setClerkToken(String jwtToken) async {
    _jwtToken = jwtToken;
    await _storage.write(key: _jwtKey, value: jwtToken);
    ApiClient.instance.setToken(jwtToken);

    final response = await ApiClient.instance.get(ApiConfig.profile);
    _currentUser = UserModel.fromJson(response.data as Map<String, dynamic>);
    _hasActiveProfile = StorageService.instance.activeProfileId != null;

    SocketService.instance.connect(jwtToken);
    await _registerCurrentUserDevice();
    return _currentUser!;
  }

  void setActiveProfile(String profileId) {
    StorageService.instance.setActiveProfileId(profileId);
    _hasActiveProfile = true;
  }

  /// Mark onboarding as complete in local state (called after API confirms).
  void markOnboardingComplete() {
    if (_currentUser != null) {
      _currentUser = _currentUser!.copyWith(onboardingComplete: true);
    }
  }

  Future<void> signOut() async {
    SocketService.instance.disconnect();
    ApiClient.instance.clearToken();
    await StorageService.instance.clearAll();
    await _clearSecureStorage();
    _currentUser = null;
    _jwtToken = null;
    _hasActiveProfile = false;
  }

  Future<void> _clearSecureStorage() async {
    await _storage.delete(key: _jwtKey);
    await _storage.delete(key: _userKey);
  }

  String _generateInstallationId() {
    final random = Random.secure();
    final bytes = List<int>.generate(24, (_) => random.nextInt(256));
    return bytes.map((byte) => byte.toRadixString(16).padLeft(2, '0')).join();
  }

  /// Register caregiver mobile device for push notifications.
  Future<void> _registerCurrentUserDevice() async {
    try {
      var installationId = StorageService.instance.deviceInstallationId;
      if (installationId == null) {
        installationId = _generateInstallationId();
        await StorageService.instance.setDeviceInstallationId(installationId);
      }

      final packageInfo = await PackageInfo.fromPlatform();
      final fcmToken = await NotificationService.instance.getFcmToken();

      await ApiClient.instance.post(ApiConfig.userDeviceRegister, data: {
        'deviceInstallationId': installationId,
        'platform': defaultTargetPlatform.name,
        'deviceModel': defaultTargetPlatform == TargetPlatform.android ? 'Android' : 'Unknown',
        'osVersion': Platform.operatingSystemVersion,
        'appVersion': packageInfo.version,
        'fcmToken': fcmToken,
      });

      if (!_listeningForTokenRefresh) {
        _listeningForTokenRefresh = true;
        FirebaseMessaging.instance.onTokenRefresh.listen((_) {
          _registerCurrentUserDevice();
        });
      }
    } catch (e) {
      debugPrint('User device registration failed: $e');
    }
  }
}
