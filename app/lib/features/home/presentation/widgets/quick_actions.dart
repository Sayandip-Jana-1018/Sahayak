import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/colors.dart';

class QuickActions extends StatelessWidget {
  const QuickActions({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    final actions = [
      _Action('Voice', Icons.mic_rounded, accent, '/voice'),
      _Action(
        'SOS',
        Icons.health_and_safety_rounded,
        SahayakColors.sosRed,
        '/sos-trigger',
      ),
      _Action(
        'Pay',
        Icons.account_balance_wallet_rounded,
        SahayakColors.saffron,
        '/voice',
      ),
      _Action(
        'Medicines',
        Icons.medication_rounded,
        SahayakColors.successGreen,
        '/medications',
      ),
      _Action(
        'Health',
        Icons.favorite_rounded,
        SahayakColors.locationTeal,
        '/health',
      ),
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: isDark ? const Color(0x66111122) : const Color(0xCCFFFFFF),
        border: Border.all(color: SahayakColors.glassBorder(isDark)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.16 : 0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: actions.map((a) => _ActionButton(action: a)).toList(),
      ),
    );
  }
}

class _Action {
  const _Action(this.label, this.icon, this.color, this.route);
  final String   label;
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
        child: SizedBox(
          width: 68,
          child: Column(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      a.color.withValues(alpha: 0.2),
                      a.color.withValues(alpha: 0.08),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: a.color.withValues(alpha: 0.25),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: a.color.withValues(alpha: 0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                  child: Icon(a.icon, color: a.color, size: 24),
              ),
              const SizedBox(height: 8),
              Text(
                a.label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isDark
                      ? Colors.white70
                      : Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
