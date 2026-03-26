import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/colors.dart';
import '../../../../shared/widgets/glass_card.dart';

class ActivityFeed extends StatelessWidget {
  const ActivityFeed({super.key, required this.activities});

  final List<Map<String, dynamic>> activities;

  @override
  Widget build(BuildContext context) {
    if (activities.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Text(
          'No recent activity yet',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      );
    }

    return Column(
      children: activities
          .take(10)
          .toList()
          .asMap()
          .entries
          .map((entry) => _ActivityItem(item: entry.value))
          .toList(),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  const _ActivityItem({required this.item});

  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final type = item['type'] as String? ?? 'general';
    final (icon, accent, label) = _typeProps(type, item);
    final ts = item['timestamp'] as String?;
    final time = ts != null ? _formatTime(DateTime.tryParse(ts)) : '';

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: accent.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: accent, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: Theme.of(context).textTheme.titleSmall),
                  if (time.isNotEmpty)
                    Text(
                      time,
                      style: TextStyle(
                        fontSize: 11,
                        color: SahayakColors.textMuted(isDark),
                      ),
                    ),
                ],
              ),
            ),
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: accent,
              ),
            ),
          ],
        ),
      ),
    );
  }

  (IconData, Color, String) _typeProps(
    String type,
    Map<String, dynamic> item,
  ) {
    return switch (type) {
      'sos' => (
          Icons.health_and_safety_rounded,
          SahayakColors.sosRed,
          'SOS alert was triggered',
        ),
      'med_taken' => (
          Icons.medication_rounded,
          SahayakColors.successGreen,
          '${item['medicineName'] ?? 'Medicine'} was taken',
        ),
      'med_missed' => (
          Icons.medication_outlined,
          SahayakColors.medicineAmber,
          '${item['medicineName'] ?? 'Medicine'} was missed',
        ),
      'voice' => (
          Icons.mic_rounded,
          SahayakColors.voiceViolet,
          'Voice request: ${item['commandText'] ?? ''}',
        ),
      'medication' => (
          Icons.medication_rounded,
          SahayakColors.deviceBlue,
          'A new medicine was added',
        ),
      'payment' => (
          Icons.account_balance_wallet_rounded,
          SahayakColors.saffron,
          'Payment handoff was opened',
        ),
      _ => (
          Icons.circle_notifications_rounded,
          SahayakColors.locationTeal,
          'Activity',
        ),
    };
  }

  String _formatTime(DateTime? dt) {
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) return '${diff.inHours} hr ago';
    return DateFormat('d MMM').format(dt);
  }
}
