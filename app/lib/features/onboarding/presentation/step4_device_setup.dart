import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../../core/config/api_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/services/notification_service.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/typography.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/story_medallion.dart';

class Step4DeviceSetup extends StatefulWidget {
  const Step4DeviceSetup({
    super.key,
    required this.elderName,
    required this.language,
    required this.onComplete,
    this.ageYears,
    this.city,
    this.state,
    this.phone,
    this.relationship,
  });

  final String elderName;
  final String language;
  final int? ageYears;
  final String? city;
  final String? state;
  final String? phone;
  final String? relationship;
  final VoidCallback onComplete;

  @override
  State<Step4DeviceSetup> createState() => _Step4DeviceSetupState();
}

class _Step4DeviceSetupState extends State<Step4DeviceSetup>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseCtrl;
  bool _submitting = false;
  bool _submitted = false;
  String? _error;
  String _statusLine = 'Creating the elder profile securely...';

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
    _submitProfile();
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitProfile() async {
    setState(() {
      _submitting = true;
      _error = null;
      _statusLine = 'Creating the elder profile securely...';
    });

    try {
      final createResp = await ApiClient.instance.post(
        ApiConfig.onboardingCreate,
        data: {
          'elderlyName': widget.elderName,
          'ageYears': widget.ageYears ?? 65,
          'state': (widget.state?.isNotEmpty ?? false) ? widget.state : 'Unknown',
          if (widget.city?.isNotEmpty ?? false) 'district': widget.city,
          if (widget.phone?.isNotEmpty ?? false)
            'emergencyContactPhone': widget.phone,
          'primaryLanguage': widget.language,
          'userType': widget.relationship == 'self' ? 'self' : 'family',
        },
      );

      final profileId = createResp.data?['elderlyProfileId'] as String?;
      if (profileId == null) {
        throw Exception('Profile creation did not return an elderly profile id.');
      }

      AuthService.instance.setActiveProfile(profileId);

      setState(() {
        _statusLine = 'Registering this phone as the elder device...';
      });

      final packageInfo = await PackageInfo.fromPlatform();
      final fcmToken = await NotificationService.instance.getFcmToken();

      await ApiClient.instance.post(
        ApiConfig.deviceRegister,
        data: {
          'elderlyProfileId': profileId,
          'deviceModel': 'Android',
          'androidVersion': Platform.operatingSystemVersion,
          'appVersion': packageInfo.version,
          'fcmToken': fcmToken,
        },
      );

      setState(() {
        _statusLine = 'Verifying sync with the dashboard and database...';
      });

      await ApiClient.instance.get('${ApiConfig.deviceStatus}/$profileId');

      setState(() {
        _statusLine = 'Finishing setup and unlocking Sahayak...';
      });

      await ApiClient.instance.post(
        ApiConfig.onboardingComplete,
        data: {
          'elderlyName': widget.elderName,
          'ageYears': widget.ageYears ?? 65,
          'state': (widget.state?.isNotEmpty ?? false) ? widget.state : 'Unknown',
          'district': (widget.city?.isNotEmpty ?? false) ? widget.city : '',
          'primaryLanguage': widget.language,
          'userType': widget.relationship == 'self' ? 'self' : 'family',
          'emergencyContactName': widget.elderName,
          if (widget.phone?.isNotEmpty ?? false)
            'emergencyContactPhone': widget.phone,
          'voiceProfileComplete': false,
          'voiceSampleIds': <String>[],
          'appInstalled': true,
        },
      );

      AuthService.instance.markOnboardingComplete();

      if (mounted) {
        setState(() {
          _submitted = true;
          _submitting = false;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _error = error.toString();
          _submitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final accent = Theme.of(context).colorScheme.primary;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          StoryMedallion(
            accent: accent,
            secondaryAccent: SahayakColors.voiceViolet,
            size: 136,
            compact: true,
          )
              .animate(onPlay: (controller) => controller.repeat(reverse: true))
              .moveY(begin: 0, end: -5, duration: 2600.ms),
          const SizedBox(height: 18),
          Text(
            'Bringing Sahayak to life',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  fontFamily: SahayakTypography.displayFont,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'We are linking this phone, the elder profile, and the dashboard into one calm setup.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SahayakColors.textMuted(isDark),
                  height: 1.45,
                ),
          ),
          const SizedBox(height: 18),
          if (_submitting) ...[
            AccentGlassCard(
              accent: accent,
              child: Column(
                children: [
                  AnimatedBuilder(
                    animation: _pulseCtrl,
                    builder: (_, child) => Transform.scale(
                      scale: 1 + (_pulseCtrl.value * 0.08),
                      child: child,
                    ),
                    child: Container(
                      width: 92,
                      height: 92,
                      decoration: BoxDecoration(
                        gradient: SahayakColors.primaryGradient(
                          accent,
                          SahayakColors.ashokaGreen,
                        ),
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: [
                          BoxShadow(
                            color: accent.withValues(alpha: 0.2),
                            blurRadius: 28,
                            offset: const Offset(0, 12),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: const Icon(
                        Icons.cloud_sync_rounded,
                        size: 42,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Setting up Sahayak',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontFamily: SahayakTypography.displayFont,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _statusLine,
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ] else if (_submitted) ...[
            AccentGlassCard(
              accent: SahayakColors.successGreen,
              child: Column(
                children: [
                  const Icon(
                    Icons.check_circle_rounded,
                    size: 88,
                    color: SahayakColors.successGreen,
                  ).animate().scale(
                        duration: 600.ms,
                        curve: Curves.easeOutBack,
                      ),
                  const SizedBox(height: 22),
                  Text(
                    'Everything is ready',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontFamily: SahayakTypography.displayFont,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '${widget.elderName} can now use Sahayak on this phone.',
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 22),
                  GlassButton(
                    label: 'Open dashboard',
                    icon: Icons.arrow_forward_rounded,
                    onPressed: widget.onComplete,
                  ),
                ],
              ),
            ),
          ] else if (_error != null) ...[
            GlassCard(
              child: Column(
                children: [
                  const Icon(
                    Icons.error_outline_rounded,
                    size: 72,
                    color: SahayakColors.sosRed,
                  ),
                  const SizedBox(height: 18),
                  Text(
                    'Setup could not finish',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontFamily: SahayakTypography.displayFont,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _error!,
                    style: const TextStyle(color: SahayakColors.sosRed),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 22),
                  GlassButton(
                    label: 'Try again',
                    onPressed: _submitProfile,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
