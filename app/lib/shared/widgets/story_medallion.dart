import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../core/theme/colors.dart';

class StoryMedallion extends StatefulWidget {
  const StoryMedallion({
    super.key,
    required this.accent,
    required this.secondaryAccent,
    this.size = 150,
    this.showOrbitIcons = true,
    this.compact = false,
  });

  final Color accent;
  final Color secondaryAccent;
  final double size;
  final bool showOrbitIcons;
  final bool compact;

  @override
  State<StoryMedallion> createState() => _StoryMedallionState();
}

class _StoryMedallionState extends State<StoryMedallion>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 14),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final heroSize = widget.size;
    final medallionSize = heroSize * (widget.compact ? 0.52 : 0.58);
    final ringSize = heroSize * (widget.compact ? 0.66 : 0.74);
    final outerRing = heroSize * (widget.compact ? 0.86 : 0.94);
    final orbitRadius = heroSize * (widget.compact ? 0.36 : 0.40);

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final orbit = _controller.value * 2 * math.pi;
        final breathe = 1 + (math.sin(orbit) * 0.028);

        return SizedBox(
          width: heroSize,
          height: heroSize,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: heroSize,
                height: heroSize,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      widget.accent.withValues(alpha: isDark ? 0.18 : 0.10),
                      widget.secondaryAccent
                          .withValues(alpha: isDark ? 0.12 : 0.07),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
              _StaticRing(
                size: ringSize,
                color: widget.accent.withValues(alpha: isDark ? 0.18 : 0.10),
              ),
              _StaticRing(
                size: outerRing,
                color: widget.secondaryAccent
                    .withValues(alpha: isDark ? 0.14 : 0.08),
              ),
              if (widget.showOrbitIcons) ...[
                _OrbitIcon(
                  angle: orbit,
                  radius: orbitRadius,
                  icon: Icons.mic_rounded,
                  color: SahayakColors.saffron,
                ),
                _OrbitIcon(
                  angle: orbit + 1.57,
                  radius: orbitRadius - 2,
                  icon: Icons.health_and_safety_rounded,
                  color: SahayakColors.sosRed,
                ),
                _OrbitIcon(
                  angle: orbit + 3.14,
                  radius: orbitRadius + 2,
                  icon: Icons.medication_rounded,
                  color: SahayakColors.ashokaGreen,
                ),
                _OrbitIcon(
                  angle: orbit + 4.71,
                  radius: orbitRadius,
                  icon: Icons.language_rounded,
                  color: SahayakColors.voiceViolet,
                ),
              ],
              Transform.scale(
                scale: breathe,
                child: Container(
                  width: medallionSize,
                  height: medallionSize,
                  padding: EdgeInsets.all(widget.compact ? 6 : 8),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white.withValues(alpha: isDark ? 0.18 : 0.42),
                        Colors.white.withValues(alpha: isDark ? 0.05 : 0.18),
                      ],
                    ),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: isDark ? 0.14 : 0.20),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: widget.accent
                            .withValues(alpha: isDark ? 0.24 : 0.14),
                        blurRadius: 26,
                        offset: const Offset(0, 12),
                      ),
                      BoxShadow(
                        color: widget.secondaryAccent
                            .withValues(alpha: isDark ? 0.14 : 0.08),
                        blurRadius: 20,
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Image.asset(
                      'assets/images/sahayak-medallion.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StaticRing extends StatelessWidget {
  const _StaticRing({
    required this.size,
    required this.color,
  });

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: color, width: 1.1),
      ),
    );
  }
}

class _OrbitIcon extends StatelessWidget {
  const _OrbitIcon({
    required this.angle,
    required this.radius,
    required this.icon,
    required this.color,
  });

  final double angle;
  final double radius;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final dx = math.cos(angle) * radius;
    final dy = math.sin(angle) * radius;

    return Transform.translate(
      offset: Offset(dx, dy),
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color.withValues(alpha: 0.14),
          border: Border.all(color: color.withValues(alpha: 0.22)),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.18),
              blurRadius: 16,
            ),
          ],
        ),
        alignment: Alignment.center,
        child: Icon(icon, size: 17, color: color),
      ),
    );
  }
}
