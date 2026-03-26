import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  Future<void> init() async {
    try {
      await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
    } catch (error) {
      debugPrint('Notification permission request failed: $error');
    }
  }

  Future<void> showNotification({
    required String title,
    required String body,
    String type = 'general',
  }) async {
    debugPrint('Notification [$type]: $title - $body');
  }

  Future<String?> getFcmToken() async {
    try {
      return await FirebaseMessaging.instance.getToken();
    } catch (error) {
      debugPrint('FCM token fetch failed: $error');
      return null;
    }
  }
}
