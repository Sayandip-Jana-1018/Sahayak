import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/api_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/colors.dart';

class SosTriggerOverlay extends StatefulWidget {
  const SosTriggerOverlay({super.key});

  @override
  State<SosTriggerOverlay> createState() => _SosTriggerOverlayState();
}

class _SosTriggerOverlayState extends State<SosTriggerOverlay>
    with TickerProviderStateMixin {
  late final AnimationController _pulseCtrl;
  int _countdown = 5;
  bool _triggered = false;
  bool _dismissed = false;
  String? _eventId;
  String _statusLine = 'Emergency countdown has started.';

  @override
  void initState() {
    super.initState();
    HapticFeedback.heavyImpact();

    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);

    _startCountdown();
  }

  Future<void> _startCountdown() async {
    for (int i = 5; i >= 1; i--) {
      if (!mounted || _dismissed) return;
      setState(() => _countdown = i);
      await Future<void>.delayed(const Duration(seconds: 1));
      HapticFeedback.mediumImpact();
    }
    if (!mounted || _dismissed) return;
    await _triggerSos();
  }

  Future<void> _triggerSos() async {
    if (_triggered) return;
    setState(() {
      _triggered = true;
      _statusLine = 'Finding location and alerting family members...';
    });
    HapticFeedback.heavyImpact();

    double? lat;
    double? lng;
    try {
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      lat = pos.latitude;
      lng = pos.longitude;
      setState(() {
        _statusLine = 'Location found. Sending emergency alerts now...';
      });
    } catch (_) {
      setState(() {
        _statusLine = 'Location unavailable. Sending alerts without GPS...';
      });
    }

    final pid = StorageService.instance.activeProfileId ?? '';

    try {
      final res = await ApiClient.instance.post(
        ApiConfig.sosTrigger,
        data: {
          'userId': pid,
          'location': {'lat': lat ?? 0.0, 'lng': lng ?? 0.0},
          'triggerType': 'manual',
          'severity': 'high',
        },
      );

      setState(() {
        _eventId = res.data['sosEventId'] as String?;
        _statusLine = 'Emergency alerts sent successfully.';
      });
    } catch (_) {
      await StorageService.instance.enqueuePendingAction({
        'type': 'sos',
        'location': {'lat': lat ?? 0.0, 'lng': lng ?? 0.0},
        'triggerType': 'manual',
        'severity': 'high',
      });

      setState(() {
        _statusLine =
            'Saved locally. The alert will retry when the connection returns.';
      });
    }
  }

  Future<void> _dismiss() async {
    setState(() => _dismissed = true);
    HapticFeedback.lightImpact();

    if (_triggered && _eventId != null) {
      try {
        await ApiClient.instance.put('${ApiConfig.sosEvents}/$_eventId/resolve');
      } catch (_) {}
    }

    if (mounted) context.go('/home');
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SahayakColors.sosRed,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AnimatedBuilder(
                  animation: _pulseCtrl,
                  builder: (_, child) {
                    final ripple = _pulseCtrl.value;
                    return Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 150 + (ripple * 40),
                          height: 150 + (ripple * 40),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.white.withValues(
                                alpha: 0.28 - (ripple * 0.2),
                              ),
                              width: 2,
                            ),
                          ),
                        ),
                        Container(
                          width: 126,
                          height: 126,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withValues(alpha: 0.18),
                          ),
                          alignment: Alignment.center,
                          child: child,
                        ),
                      ],
                    );
                  },
                  child: const Icon(
                    Icons.health_and_safety_rounded,
                    size: 62,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 30),
                if (!_triggered)
                  Text(
                    '$_countdown',
                    style: const TextStyle(
                      fontSize: 80,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      height: 1,
                    ),
                  ).animate(key: ValueKey(_countdown)).scale(
                        begin: const Offset(1.24, 1.24),
                        end: const Offset(1, 1),
                        duration: 240.ms,
                      )
                else
                  const Text(
                    'HELP IS ON THE WAY',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 0.3,
                    ),
                  ).animate().fadeIn(duration: 350.ms).slideY(
                        begin: 0.08,
                        end: 0,
                        duration: 350.ms,
                      ),
                const SizedBox(height: 12),
                Text(
                  _triggered
                      ? _statusLine
                      : 'Hold on. Sahayak is preparing the emergency alert.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.white70,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 42),
                SizedBox(
                  width: 240,
                  height: 60,
                  child: OutlinedButton(
                    onPressed: _dismiss,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white, width: 2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                    child: Text(
                      _triggered ? 'I am okay' : 'Cancel',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
