import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:workmanager/workmanager.dart';
import 'firebase_options.dart';
import 'core/services/storage_service.dart';
import 'core/services/auth_service.dart';
import 'app.dart';

// ── Background FCM handler — MUST be top-level function ─────────────────────
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint('🔔 FCM background: ${message.data}');
  // TODO: Show local notification via flutter_local_notifications
}

// ── WorkManager background callback — top-level ─────────────────────────────
@pragma('vm:entry-point')
void _workManagerCallbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    switch (task) {
      case 'sahayak.medicationCheck':
        // Check Hive for pending reminders at current time
        // Show local notification if due
        debugPrint('⏰ WorkManager: checking medication reminders');
        break;
      case 'sahayak.heartbeat':
        // Send GPS + battery to backend
        debugPrint('💓 WorkManager: sending heartbeat');
        break;
    }
    return true;
  });
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── 1. Firebase — MUST be first async call ─────────────────────────────────
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint('Firebase init failed: $e');
  }

  // ── 2. Request notification permission (Android 13+) ──────────────────────
  try {
    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
  } catch (_) {}

  // ── 3. Storage (Hive) ─────────────────────────────────────────────────────
  try {
    await StorageService.instance.init();
  } catch (e) {
    debugPrint('StorageService init failed: $e');
  }

  // ── 4. Auth — restore JWT from secure storage ─────────────────────────────
  try {
    await AuthService.instance.init();
  } catch (e) {
    debugPrint('AuthService init failed: $e');
  }

  // ── 5. WorkManager — background medication checks ─────────────────────────
  try {
    await Workmanager().initialize(
      _workManagerCallbackDispatcher,
      isInDebugMode: kDebugMode,
    );
    await Workmanager().registerPeriodicTask(
      'sahayak.medicationCheck',
      'sahayak.medicationCheck',
      frequency: const Duration(minutes: 15),
      constraints: Constraints(networkType: NetworkType.notRequired),
    );
  } catch (e) {
    debugPrint('WorkManager init failed: $e');
  }

  // ── 6. Portrait lock ──────────────────────────────────────────────────────
  try {
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
  } catch (_) {}

  // ── 7. Transparent status bar ─────────────────────────────────────────────
  try {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
    ));
  } catch (_) {}

  runApp(const SahayakApp());
}
