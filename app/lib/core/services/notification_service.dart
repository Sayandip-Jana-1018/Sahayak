// NotificationService — stub until Firebase is configured with google-services.json
// To enable: run `flutterfire configure`, then uncomment firebase packages in pubspec.yaml

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  Future<void> init() async {
    // No-op until Firebase is configured
  }

  Future<void> showNotification({
    required String title,
    required String body,
    String type = 'general',
  }) async {
    // No-op until Firebase is configured
  }

  Future<String?> getFcmToken() async => null;
}
