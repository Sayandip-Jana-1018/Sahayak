import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/colors.dart';
import '../../../../shared/widgets/glass_card.dart';

class QuickActions extends StatelessWidget {
  const QuickActions({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    final actions = [
      _Action('Talk', 'Speak naturally', Icons.mic_rounded, accent, '/voice'),
      _Action(
        'SOS',
        'Emergency help',
        Icons.health_and_safety_rounded,
        SahayakColors.sosRed,
        '/sos-trigger',
      ),
      _Action(
        'Pay',
        'Open UPI safely',
        Icons.account_balance_wallet_rounded,
        SahayakColors.saffron,
        '/voice',
      ),
      _Action(
        'Medicines',
        'Today and history',
        Icons.medication_rounded,
        SahayakColors.successGreen,
        '/medications',
      ),
      _Action(
        'Health',
        'Notes and visits',
        Icons.favorite_rounded,
        SahayakColors.locationTeal,
        '/health',
      ),
    ];

    return GlassCard(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 16),
      borderRadius: 28,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              'Quick actions',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: SahayakColors.textPrimary(isDark),
                  ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 112,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: actions.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (_, index) => _ActionButton(action: actions[index]),
            ),
          ),
        ],
      ),
    );
  }
}

class _Action {
  const _Action(this.label, this.subtitle, this.icon, this.color, this.route);
  final String   label;
  final String   subtitle;
  final IconData icon;
  final Color    color;
  final String   route;
}

class _ActionButton extends StatefulWidget {
  const _ActionButton({required this.action});
  final _Action action;

  @override
  State<_ActionButton> createState() => _ActionButtonState();
}

class _ActionButtonState extends State<_ActionButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final a = widget.action;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTapDown: (_) { setState(() => _pressed = true); },
      onTapUp: (_)   { setState(() => _pressed = false); },
      onTapCancel: () { setState(() => _pressed = false); },
      onTap: () {
        HapticFeedback.mediumImpact();
        context.go(a.route);
      },
      child: AnimatedScale(
        scale:    _pressed ? 0.88 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          width: 136,
          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                a.color.withValues(alpha: isDark ? 0.16 : 0.12),
                a.color.withValues(alpha: isDark ? 0.05 : 0.04),
              ],
            ),
            border: Border.all(
              color: a.color.withValues(alpha: isDark ? 0.24 : 0.18),
            ),
            boxShadow: [
              BoxShadow(
                color: a.color.withValues(alpha: 0.10),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: a.color.withValues(alpha: isDark ? 0.12 : 0.10),
                  borderRadius: BorderRadius.circular(16),
                ),
                alignment: Alignment.center,
                child: Icon(a.icon, color: a.color, size: 24),
              ),
              const Spacer(),
              Text(
                a.label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: SahayakColors.textPrimary(isDark),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                a.subtitle,
                style: TextStyle(
                  fontSize: 11,
                  height: 1.35,
                  fontWeight: FontWeight.w500,
                  color: SahayakColors.textMuted(isDark),
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
