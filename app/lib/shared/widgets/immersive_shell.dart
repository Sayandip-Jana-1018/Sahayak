import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/colors.dart';

class ImmersiveShell extends StatelessWidget {
  const ImmersiveShell({
    super.key,
    required this.child,
    this.primaryGlow,
    this.secondaryGlow,
    this.padding,
  });

  final Widget child;
  final Color? primaryGlow;
  final Color? secondaryGlow;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primary = primaryGlow ?? Theme.of(context).colorScheme.primary;
    final secondary = secondaryGlow ?? Theme.of(context).colorScheme.secondary;

    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? const [
                  SahayakColors.darkBg,
                  SahayakColors.darkSurface,
                  SahayakColors.darkBg,
                ]
              : const [
                  SahayakColors.lightBg,
                  Color(0xFFF8F1E7),
                  SahayakColors.lightSurface,
                ],
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -80,
            left: -40,
            child: _GlowOrb(
              color: primary.withValues(alpha: isDark ? 0.24 : 0.12),
              size: 260,
            ),
          ),
          Positioned(
            top: 120,
            right: -40,
            child: _GlowOrb(
              color: secondary.withValues(alpha: isDark ? 0.18 : 0.12),
              size: 220,
            ),
          ),
          Positioned(
            bottom: -60,
            left: 30,
            child: _GlowOrb(
              color: SahayakColors.saffron.withValues(alpha: isDark ? 0.1 : 0.08),
              size: 280,
            ),
          ),
          Positioned.fill(
            child: IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.white.withValues(alpha: isDark ? 0.02 : 0.12),
                      Colors.transparent,
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0x05000000)
                      : const Color(0x03FFFFFF),
                  backgroundBlendMode: BlendMode.overlay,
                ),
              ),
            ),
          ),
          Padding(
            padding: padding ?? EdgeInsets.zero,
            child: child,
          ),
        ],
      ),
    );
  }
}

class _GlowOrb extends StatelessWidget {
  const _GlowOrb({
    required this.color,
    required this.size,
  });

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    final drift = size > 240 ? 12.0 : 8.0;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color,
            color.withValues(alpha: 0.08),
            Colors.transparent,
          ],
        ),
      ),
    )
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .moveY(
          begin: 0,
          end: drift,
          duration: 5200.ms,
          curve: Curves.easeInOut,
        )
        .then()
        .moveX(
          begin: 0,
          end: -drift * 0.65,
          duration: 5200.ms,
          curve: Curves.easeInOut,
        );
  }
}
