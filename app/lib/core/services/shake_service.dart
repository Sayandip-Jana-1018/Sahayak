import 'dart:async';
import 'package:sensors_plus/sensors_plus.dart';
import 'dart:math';

typedef SosShakeCallback = void Function();

class ShakeService {
  ShakeService._();
  static final ShakeService instance = ShakeService._();

  StreamSubscription<AccelerometerEvent>? _sub;
  SosShakeCallback? _onShake;

  final List<DateTime> _shakeTimes = [];
  DateTime? _lastTrigger;

  /// Start listening for shake gestures.
  /// Fires [onShake] when ≥3 shakes (magnitude > 25 m/s²) occur within 1.5s.
  /// Debounces for 10s after trigger.
  void start({required SosShakeCallback onShake}) {
    _onShake = onShake;
    _sub = accelerometerEventStream().listen(_onEvent);
  }

  void stop() {
    _sub?.cancel();
    _sub = null;
    _onShake = null;
  }

  void _onEvent(AccelerometerEvent event) {
    final magnitude = sqrt(
      event.x * event.x + event.y * event.y + event.z * event.z,
    );

    // Subtract gravity (~9.8 m/s²)
    final adjMag = (magnitude - 9.8).abs();

    if (adjMag > 15.0) {
      final now = DateTime.now();
      _shakeTimes.add(now);

      // Remove shakes older than 1.5s
      _shakeTimes.removeWhere(
        (t) => now.difference(t) > const Duration(milliseconds: 1500),
      );

      if (_shakeTimes.length >= 3) {
        final debounce = _lastTrigger;
        if (debounce == null ||
            now.difference(debounce) > const Duration(seconds: 10)) {
          _lastTrigger = now;
          _shakeTimes.clear();
          _onShake?.call();
        }
      }
    }
  }
}
