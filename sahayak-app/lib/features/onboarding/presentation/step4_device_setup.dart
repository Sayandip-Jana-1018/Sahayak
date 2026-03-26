import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/network/api_client.dart';
import '../../../core/config/api_config.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_card.dart';

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

  final String   elderName;
  final String   language;
  final int?     ageYears;
  final String?  city;
  final String?  state;
  final String?  phone;
  final String?  relationship;
  final VoidCallback onComplete;

  @override
  State<Step4DeviceSetup> createState() => _Step4State();
}

class _Step4State extends State<Step4DeviceSetup>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  bool _submitting     = false;
  bool _submitted      = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _submitProfile();
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitProfile() async {
    setState(() { _submitting = true; _error = null; });
    try {
      // POST create-profile
      final createResp = await ApiClient.instance.post(
        ApiConfig.onboardingCreate,
        data: {
          'elderlyName':            widget.elderName,
          'ageYears':               widget.ageYears ?? 65,
          'state':                  (widget.state?.isNotEmpty ?? false) ? widget.state : 'Unknown',
          if (widget.city != null && widget.city!.isNotEmpty)
            'district':              widget.city,
          if (widget.phone != null && widget.phone!.isNotEmpty)
            'emergencyContactPhone': widget.phone,
          'primaryLanguage': widget.language,
          'userType': widget.relationship == 'self' ? 'self' : 'family',
        },
      );
      // Auto-select the created profile (skip /select-profile since there's only one)
      final profileId = createResp.data?['elderlyProfileId'] as String?;
      if (profileId != null) {
        AuthService.instance.setActiveProfile(profileId);
      }
      // Mark onboarding complete — send full data since endpoint validates same schema
      await ApiClient.instance.post(ApiConfig.onboardingComplete, data: {
        'elderlyName':            widget.elderName,
        'ageYears':               widget.ageYears ?? 65,
        'state':                  (widget.state?.isNotEmpty ?? false) ? widget.state : 'Unknown',
        'district':               (widget.city?.isNotEmpty ?? false) ? widget.city : '',
        'primaryLanguage':        widget.language,
        'userType':               widget.relationship == 'self' ? 'self' : 'family',
        'emergencyContactName':   widget.elderName, // fallback
        'emergencyContactPhone':  (widget.phone?.isNotEmpty ?? false) ? widget.phone : '9999999999',
        'voiceProfileComplete':   false,
        'voiceSampleIds':         <String>[],
        'appInstalled':           true,
      });
      // Update local auth state so router allows navigation to /home
      AuthService.instance.markOnboardingComplete();
      if (mounted) setState(() { _submitted = true; _submitting = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _submitting = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (_submitting) ...[
            AnimatedBuilder(
              animation: _pulseCtrl,
              builder: (_, child) => Transform.scale(
                scale: 1.0 + _pulseCtrl.value * 0.12,
                child: child,
              ),
              child: Icon(
                Icons.cloud_sync_rounded,
                size:  80,
                color: accent,
              ),
            ),
            const SizedBox(height: 24),
            Text('प्रोफाइल बन रही है...',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text('${widget.elderName} की जानकारी सुरक्षित हो रही है',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center),
          ] else if (_submitted) ...[
            const Icon(Icons.check_circle_rounded,
                size: 80, color: SahayakColors.successGreen)
                .animate()
                .scale(duration: 600.ms, curve: Curves.elasticOut),
            const SizedBox(height: 24),
            Text('तैयार है! 🎉',
                style: Theme.of(context).textTheme.headlineMedium)
                .animate().fadeIn(delay: 300.ms),
            const SizedBox(height: 8),
            Text('${widget.elderName} की प्रोफाइल बन गई है',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center)
                .animate().fadeIn(delay: 400.ms),
            const SizedBox(height: 40),
            FilledButton.icon(
              onPressed: widget.onComplete,
              icon:  const Icon(Icons.home_rounded),
              label: const Text('डैशबोर्ड पर जाएं'),
            ).animate().fadeIn(delay: 600.ms)
             .slideY(begin: 0.3, end: 0, delay: 600.ms,
                 duration: 400.ms, curve: Curves.easeOut),
          ] else if (_error != null) ...[
            const Icon(Icons.error_outline_rounded,
                size: 64, color: SahayakColors.sosRed),
            const SizedBox(height: 16),
            Text('कुछ गलत हुआ',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(_error!,
                style: const TextStyle(color: SahayakColors.sosRed)),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: _submitProfile,
              child:     const Text('फिर से कोशिश करें'),
            ),
          ],
        ],
      ),
    );
  }
}
