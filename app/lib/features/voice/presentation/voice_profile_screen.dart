import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/config/api_config.dart';
import '../../../core/services/audio_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_card.dart';

class VoiceProfileScreen extends StatefulWidget {
  const VoiceProfileScreen({super.key});

  @override
  State<VoiceProfileScreen> createState() => _VoiceProfileScreenState();
}

class _VoiceProfileScreenState extends State<VoiceProfileScreen> {
  final List<String?> _samplePaths = [null, null, null];
  final List<bool>    _recording   = [false, false, false];
  bool _submitting = false;

  Future<void> _toggleRecording(int index) async {
    HapticFeedback.mediumImpact();
    if (_recording[index]) {
      final path = await AudioService.instance.stopRecording();
      setState(() {
        _samplePaths[index] = path;
        _recording[index]   = false;
      });
    } else {
      setState(() => _recording[index] = true);
      await AudioService.instance.startRecording();
    }
  }

  Future<void> _submit() async {
    final pid = StorageService.instance.activeProfileId;
    if (pid == null) return;
    setState(() => _submitting = true);

    for (int i = 0; i < 3; i++) {
      final path = _samplePaths[i];
      if (path == null) continue;
      try {
        final formData = FormData.fromMap({
          'elderlyProfileId': pid,
          'sampleIndex':      i,
          'language':         StorageService.instance.language,
          'audio': await MultipartFile.fromFile(path,
              filename: 'sample_$i.m4a'),
        });
        await ApiClient.instance.postMultipart(
            ApiConfig.voiceProfile, formData: formData);
      } catch (_) {}
    }

    setState(() => _submitting = false);
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;
    final allRecorded = _samplePaths.every((p) => p != null);

    return Scaffold(
      appBar: AppBar(title: const Text('आवाज़ रजिस्ट्रेशन')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text(
              'तीन नमूने रिकॉर्ड करें',
              style: Theme.of(context).textTheme.headlineSmall,
            ).animate().fadeIn(),
            const SizedBox(height: 8),
            Text(
              'प्रत्येक बटन दबाकर 5-10 सेकंड बोलें',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),

            // 3 recording slots
            for (int i = 0; i < 3; i++) ...[
              _SampleSlot(
                index:      i,
                isRecording: _recording[i],
                isRecorded:  _samplePaths[i] != null,
                onTap:      () => _toggleRecording(i),
                accent:     accent,
              ).animate().fadeIn(delay: (i * 150).ms),
              const SizedBox(height: 16),
            ],

            const Spacer(),
            FilledButton(
              onPressed: allRecorded && !_submitting ? _submit : null,
              child: _submitting
                  ? const SizedBox(
                      width: 24, height: 24,
                      child: CircularProgressIndicator(
                          strokeWidth: 2.5, color: Colors.white))
                  : const Text('सेव करें और आगे बढ़ें'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SampleSlot extends StatelessWidget {
  const _SampleSlot({
    required this.index,
    required this.isRecording,
    required this.isRecorded,
    required this.onTap,
    required this.accent,
  });

  final int      index;
  final bool     isRecording;
  final bool     isRecorded;
  final VoidCallback onTap;
  final Color    accent;

  @override
  Widget build(BuildContext context) {
    final color = isRecording
        ? SahayakColors.sosRed
        : isRecorded
            ? SahayakColors.successGreen
            : accent;

    return GlassCard(
      accentColor: color,
      onTap:       onTap,
      child: Row(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width:  52, height: 52,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color.withOpacity(0.15),
            ),
            child: Icon(
              isRecording
                  ? Icons.stop_rounded
                  : isRecorded
                      ? Icons.check_circle_rounded
                      : Icons.mic_rounded,
              color: color,
              size:  28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('नमूना ${index + 1}',
                    style: Theme.of(context).textTheme.titleSmall),
                Text(
                  isRecording
                      ? '⏺ रिकॉर्ड हो रहा है...'
                      : isRecorded
                          ? '✓ रिकॉर्ड हो गया'
                          : 'टैप करके रिकॉर्ड करें',
                  style: TextStyle(
                    fontSize: 12,
                    color:    color,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
