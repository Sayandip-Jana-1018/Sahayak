import 'package:flutter/material.dart';
import 'dart:ui';

import '../../core/theme/colors.dart';

class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius,
    this.blur = 32,
    this.accentColor,
    this.onTap,
    this.width,
    this.height,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double? borderRadius;
  final double blur;
  final Color? accentColor;
  final VoidCallback? onTap;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final radius = borderRadius ?? 20.0;
    final accentAlpha = accentColor?.withValues(alpha: 0.25);

    return Padding(
      padding: margin ?? EdgeInsets.zero,
      child: GestureDetector(
        onTap: onTap,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(radius),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
            child: Container(
              width: width,
              height: height,
              padding: padding ?? const EdgeInsets.all(20),
              decoration: isDark
                  ? _darkDecoration(radius, accentAlpha)
                  : _lightDecoration(radius, accentAlpha),
              child: Stack(
                children: [
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: IgnorePointer(
                      child: Container(
                        height: 1.2,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                            colors: [
                              (accentAlpha ?? SahayakColors.glassTopBorder(isDark))
                                  .withValues(alpha: isDark ? 0.8 : 0.6),
                              SahayakColors.glassTopBorder(isDark),
                              (accentAlpha ?? SahayakColors.glassTopBorder(isDark))
                                  .withValues(alpha: isDark ? 0.35 : 0.25),
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
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: isDark
                                ? const [
                                    Color(0x10FFFFFF),
                                    Colors.transparent,
                                    Colors.transparent,
                                  ]
                                : const [
                                    Color(0x80FFFFFF),
                                    Color(0x26FFFFFF),
                                    Colors.transparent,
                                  ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  child,
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  BoxDecoration _darkDecoration(double radius, Color? accent) => BoxDecoration(
        color: const Color(0x730F0F1E),
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(
          color: accent?.withValues(alpha: 0.18) ?? SahayakColors.glassBorder(true),
          width: 1,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x40000000),
            blurRadius: 24,
            offset: Offset(0, 4),
          ),
          BoxShadow(
            color: Color(0x0FFFFFFF),
            blurRadius: 0,
            offset: Offset(0, 1),
            spreadRadius: -1,
          ),
        ],
      );

  BoxDecoration _lightDecoration(double radius, Color? accent) => BoxDecoration(
        color: const Color(0xBFFFFFFF),
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(
          color: accent?.withValues(alpha: 0.14) ?? SahayakColors.glassBorder(false),
          width: 1,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0F000000),
            blurRadius: 32,
            offset: Offset(0, 8),
          ),
        ],
      );
}

/// Accent-tinted glass card — uses a uniform border + gradient accent stripe
/// painted via CustomPainter to avoid Flutter's "non-uniform border" crash.
class AccentGlassCard extends StatelessWidget {
  const AccentGlassCard({
    super.key,
    required this.child,
    required this.accent,
    this.padding,
    this.onTap,
  });

  final Widget child;
  final Color accent;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
          child: CustomPaint(
            painter: _AccentStripePainter(accent: accent, isDark: isDark),
            child: Container(
              padding: padding ?? const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark
                    ? const Color(0x730F0F1E)
                    : const Color(0xBFFFFFFF),
                borderRadius: BorderRadius.circular(20),
                // Uniform border — no more crash
                border: Border.all(
                  color: isDark
                      ? const Color(0x1FFFFFFF)
                      : const Color(0x0F000000),
                ),
                boxShadow: [
                  BoxShadow(
                    color: accent.withValues(alpha: 0.12),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}

/// Paints a gradient accent stripe on the left edge of the card
class _AccentStripePainter extends CustomPainter {
  _AccentStripePainter({required this.accent, required this.isDark});
  final Color accent;
  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          accent.withValues(alpha: 0.9),
          accent.withValues(alpha: 0.3),
        ],
      ).createShader(Rect.fromLTWH(0, 0, 3, size.height));

    final rrect = RRect.fromLTRBAndCorners(
      0,
      0,
      3.5,
      size.height,
      topLeft: const Radius.circular(20),
      bottomLeft: const Radius.circular(20),
    );
    canvas.drawRRect(rrect, paint);
  }

  @override
  bool shouldRepaint(covariant _AccentStripePainter old) =>
      old.accent != accent || old.isDark != isDark;
}
