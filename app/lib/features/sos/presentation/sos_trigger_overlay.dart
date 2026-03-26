import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/api_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/glass_card.dart';

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
  double? _lat;
  double? _lng;
  bool _locationReady = false;
  bool _apiAck = false;
  bool _smsOpened = false;
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
      _statusLine = 'Finding location and alerting trusted contacts...';
    });
    HapticFeedback.heavyImpact();

    await _resolveLocation();
    await Future.wait<void>([
      _triggerBackendSos(),
      _openSmsIntent(),
    ]);
  }

  Future<void> _resolveLocation() async {
    try {
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );
      _lat = pos.latitude;
      _lng = pos.longitude;
      if (mounted) {
        setState(() {
          _locationReady = true;
          _statusLine = 'Location found. Sending emergency alerts now...';
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _statusLine = 'Location unavailable. Sending alerts without GPS...';
        });
      }
    }
  }

  Future<void> _triggerBackendSos() async {
    final pid = StorageService.instance.activeProfileId ?? '';

    try {
      final res = await ApiClient.instance.post(
        ApiConfig.sosTrigger,
        data: {
          'userId': pid,
          'location': {'lat': _lat ?? 0.0, 'lng': _lng ?? 0.0},
          'triggerType': 'button',
          'severity': 'high',
        },
      );

      if (!mounted) return;
      setState(() {
        _eventId = res.data['sosEventId'] as String?;
        _apiAck = true;
        _statusLine = _smsOpened
            ? 'Emergency alerts were sent. SMS composer is also ready as backup.'
            : 'Emergency alerts were sent successfully.';
      });
    } catch (_) {
      await StorageService.instance.enqueuePendingAction({
        'type': 'sos',
        'location': {'lat': _lat ?? 0.0, 'lng': _lng ?? 0.0},
        'triggerType': 'button',
        'severity': 'high',
      });

      if (!mounted) return;
      setState(() {
        _statusLine = _smsOpened
            ? 'Internet is unavailable. The alert was saved locally and the SMS composer is ready.'
            : 'Internet is unavailable. The alert was saved locally.';
      });
    }
  }

  Future<void> _openSmsIntent() async {
    final message = _buildEmergencyMessage(lat: _lat, lng: _lng);
    final smsUri = Uri.parse('sms:?body=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(smsUri)) {
      await launchUrl(smsUri);
      if (mounted) {
        setState(() {
          _smsOpened = true;
          if (!_apiAck) {
            _statusLine =
                'The SMS composer is open as a direct fallback while network alerts continue.';
          }
        });
      }
    }
  }

  String _buildEmergencyMessage({double? lat, double? lng}) {
    final locationUrl = (lat != null && lng != null)
        ? ' https://www.google.com/maps?q=$lat,$lng'
        : '';
    return 'SAHAYAK EMERGENCY: Help is needed immediately.$locationUrl';
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
    final emergencyReady = _apiAck || _smsOpened;

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
                        for (final multiplier in [1.0, 1.28, 1.56])
                          Container(
                            width: 108 + (ripple * 34 * multiplier),
                            height: 108 + (ripple * 34 * multiplier),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white.withValues(
                                  alpha: 0.24 - (ripple * 0.16),
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
                            color: Colors.white.withValues(alpha: 0.16),
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
                const SizedBox(height: 28),
                GlassCard(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    children: [
                      _StatusRow(
                        icon: Icons.my_location_rounded,
                        label: 'Location',
                        value: _locationReady ? 'Found' : 'Trying',
                        complete: _locationReady,
                      ),
                      const SizedBox(height: 12),
                      _StatusRow(
                        icon: Icons.cloud_done_rounded,
                        label: 'Server alert',
                        value: _apiAck ? 'Sent' : (_triggered ? 'Sending' : 'Waiting'),
                        complete: _apiAck,
                      ),
                      const SizedBox(height: 12),
                      _StatusRow(
                        icon: Icons.sms_rounded,
                        label: 'SMS fallback',
                        value: _smsOpened ? 'Ready' : (_triggered ? 'Opening' : 'Waiting'),
                        complete: _smsOpened,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 26),
                SizedBox(
                  width: 260,
                  child: GlassButton(
                    label: _triggered
                        ? (emergencyReady ? 'I am okay' : 'Cancel')
                        : 'Cancel emergency',
                    onPressed: _dismiss,
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

class _StatusRow extends StatelessWidget {
  const _StatusRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.complete,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool complete;

  @override
  Widget build(BuildContext context) {
    final accent = complete ? SahayakColors.successGreen : Colors.white;

    return Row(
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: accent.withValues(alpha: complete ? 0.16 : 0.1),
            borderRadius: BorderRadius.circular(14),
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: accent, size: 22),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                    ),
              ),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white70,
                    ),
              ),
            ],
          ),
        ),
        Icon(
          complete ? Icons.check_circle_rounded : Icons.timelapse_rounded,
          color: accent,
        ),
      ],
    );
  }
}
