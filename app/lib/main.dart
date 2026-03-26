import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:workmanager/workmanager.dart';

import 'app.dart';
import 'core/services/auth_service.dart';
import 'core/services/notification_service.dart';
import 'core/services/storage_service.dart';
import 'firebase_options.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint('FCM background message: ${message.data}');
}

@pragma('vm:entry-point')
void _workManagerCallbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    switch (task) {
      case 'sahayak.medicationCheck':
        debugPrint('WorkManager: checking medication reminders');
        break;
      case 'sahayak.heartbeat':
        debugPrint('WorkManager: sending heartbeat');
        break;
    }
    return true;
  });
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (error) {
    debugPrint('Firebase init failed: $error');
  }

  try {
    await NotificationService.instance.init();
  } catch (error) {
    debugPrint('NotificationService init failed: $error');
  }

  try {
    await StorageService.instance.init();
  } catch (error) {
    debugPrint('StorageService init failed: $error');
  }

  try {
    await AuthService.instance.init();
  } catch (error) {
    debugPrint('AuthService init failed: $error');
  }

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
  } catch (error) {
    debugPrint('WorkManager init failed: $error');
  }

  try {
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
    ));
  } catch (_) {}

  runApp(const SahayakApp());
}
