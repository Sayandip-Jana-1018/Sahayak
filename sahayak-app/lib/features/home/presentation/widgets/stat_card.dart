import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';

class StatCard extends StatefulWidget {
  const StatCard({
    super.key,
    required this.title,
    required this.value,
    this.subtitle,
    required this.icon,
    required this.accent,
    required this.index,
    this.onTap,
  });

  final String   title;
  final String   value;
  final String?  subtitle;
  final IconData icon;
  final Color    accent;
  final int      index;
  final VoidCallback? onTap;

  @override
  State<StatCard> createState() => _StatCardState();
}

class _StatCardState extends State<StatCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap?.call();
      },
      child: AnimatedScale(
        scale: _pressed ? 0.95 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Container(
          width: 156,
          margin: EdgeInsets.only(
            left: widget.index == 0 ? 0 : 10,
            right: 2,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: isDark
                  ? [
                      widget.accent.withValues(alpha: 0.18),
                      widget.accent.withValues(alpha: 0.06),
                    ]
                  : [
                      widget.accent.withValues(alpha: 0.12),
                      widget.accent.withValues(alpha: 0.04),
                    ],
            ),
            border: Border.all(
              color: widget.accent.withValues(alpha: isDark ? 0.3 : 0.2),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: widget.accent.withValues(alpha: 0.1),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon badge with glow
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        widget.accent.withValues(alpha: 0.25),
                        widget.accent.withValues(alpha: 0.1),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: widget.accent.withValues(alpha: 0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(widget.icon, color: widget.accent, size: 22),
                ),
                const Spacer(),
                // Value
                Text(
                  widget.value,
                  style: SahayakTypography.statNumber(30, widget.accent),
                ),
                const SizedBox(height: 4),
                // Title
                Text(
                  widget.title,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: SahayakColors.textPrimary(isDark),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (widget.subtitle != null) ...[
                  const SizedBox(height: 1),
                  Text(
                    widget.subtitle!,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: SahayakColors.textMuted(isDark),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    ).animate()
     .fadeIn(delay: (widget.index * 80).ms, duration: 400.ms)
     .slideX(begin: 0.2, end: 0, delay: (widget.index * 80).ms,
         duration: 400.ms, curve: Curves.easeOut);
  }
}
