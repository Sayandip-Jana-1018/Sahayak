import 'dart:ui';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lottie/lottie.dart';

import '../../../core/theme/colors.dart';
import '../../../core/theme/typography.dart';

class Step1Welcome extends StatefulWidget {
  const Step1Welcome({
    super.key,
    required this.selectedLanguage,
    required this.isDark,
    required this.onToggleTheme,
    required this.onLanguageSelected,
  });

  final String? selectedLanguage;
  final bool isDark;
  final VoidCallback onToggleTheme;
  final void Function(String) onLanguageSelected;

  static const activeLanguages = [
    (
      'hi',
      'हिंदी',
      'Hindi',
      'अपनापन और सहज गाइडेंस',
      SahayakColors.saffron,
    ),
    (
      'en',
      'English',
      'English',
      'Calm, clear, and familiar',
      SahayakColors.voiceViolet,
    ),
  ];

  static const comingSoon = [
    ('தமிழ்', SahayakColors.voiceViolet),
    ('বাংলা', SahayakColors.saffron),
    ('मराठी', SahayakColors.sosRed),
    ('తెలుగు', SahayakColors.locationTeal),
    ('ಕನ್ನಡ', SahayakColors.ashokaGreen),
    ('ગુજરાતી', Color(0xFFEF7D57)),
    ('ਪੰਜਾਬੀ', Color(0xFF8E7CFF)),
    ('മലയാളം', Color(0xFF3BB273)),
  ];

  @override
  State<Step1Welcome> createState() => _Step1WelcomeState();
}

class _Step1WelcomeState extends State<Step1Welcome> {
  double _scrollOffset = 0;
  String? _localSelection;

  String? get _selectedLanguage => _localSelection ?? widget.selectedLanguage;

  Future<void> _handleSelection(String language) async {
    if (_selectedLanguage == language) {
      widget.onLanguageSelected(language);
      return;
    }

    HapticFeedback.selectionClick();
    setState(() => _localSelection = language);
    await Future<void>.delayed(const Duration(milliseconds: 80));
    widget.onLanguageSelected(language);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final selectedAccent = _selectedLanguage == 'en'
        ? SahayakColors.voiceViolet
        : SahayakColors.saffron;

    return NotificationListener<ScrollUpdateNotification>(
      onNotification: (notification) {
        setState(() => _scrollOffset = notification.metrics.pixels);
        return false;
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 34),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              children: [
                const SizedBox(height: 18),
                Stack(
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 42),
                      child: _HeroStage(
                        scrollOffset: _scrollOffset,
                        selectedLanguage: _selectedLanguage,
                      ),
                    ),
                    Positioned(
                      top: 6,
                      left: 0,
                      right: 0,
                      child: _FloatingThemeOrb(
                        isDark: widget.isDark,
                        onTap: () {
                          HapticFeedback.lightImpact();
                          widget.onToggleTheme();
                        },
                      ),
                    ),
                  ],
                )
                    .animate()
                    .fadeIn(duration: 460.ms)
                    .scale(
                      begin: const Offset(0.96, 0.96),
                      curve: Curves.easeOutCubic,
                    ),
                const SizedBox(height: 10),
                _BrandHeading(selectedAccent: selectedAccent)
                    .animate()
                    .fadeIn(delay: 80.ms, duration: 360.ms)
                    .slideY(begin: 0.08, end: 0),
                const SizedBox(height: 14),
                _MiniBenefitsRow(accent: selectedAccent, isDark: isDark)
                    .animate()
                    .fadeIn(delay: 140.ms, duration: 320.ms)
                    .slideY(begin: 0.08, end: 0),
                const SizedBox(height: 14),
                const _FamilySupportPanel()
                    .animate()
                    .fadeIn(delay: 180.ms, duration: 340.ms)
                    .slideY(begin: 0.08, end: 0),
                const SizedBox(height: 18),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final width = constraints.maxWidth;
                    final cardWidth = (width - 14) / 2;

                    return Wrap(
                      spacing: 14,
                      runSpacing: 14,
                      alignment: WrapAlignment.center,
                      children: [
                        for (var i = 0;
                            i < Step1Welcome.activeLanguages.length;
                            i++)
                          SizedBox(
                            width: cardWidth,
                            child: _LanguagePortalCard(
                              code: Step1Welcome.activeLanguages[i].$1,
                              native: Step1Welcome.activeLanguages[i].$2,
                              english: Step1Welcome.activeLanguages[i].$3,
                              caption: Step1Welcome.activeLanguages[i].$4,
                              accent: Step1Welcome.activeLanguages[i].$5,
                              isActive: _selectedLanguage ==
                                  Step1Welcome.activeLanguages[i].$1,
                              onTap: () => _handleSelection(
                                Step1Welcome.activeLanguages[i].$1,
                              ),
                            )
                                .animate()
                                .fadeIn(
                                  delay: (210 + i * 90).ms,
                                  duration: 340.ms,
                                )
                                .slideY(begin: 0.08, end: 0),
                          ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 18),
                _ComingSoonPanel(isDark: isDark)
                    .animate()
                    .fadeIn(delay: 380.ms, duration: 360.ms)
                    .slideY(begin: 0.08, end: 0),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FloatingThemeOrb extends StatelessWidget {
  const _FloatingThemeOrb({
    required this.isDark,
    required this.onTap,
  });

  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final glowColor =
        isDark ? const Color(0xFF8E7CFF) : const Color(0xFFFFA62B);
    final iconColor =
        isDark ? const Color(0xFFB388FF) : const Color(0xFFFF9F1C);

    return GestureDetector(
      onTap: onTap,
      child: Center(
        child: SizedBox(
          width: 46,
          height: 46,
          child: Stack(
            alignment: Alignment.center,
            children: [
              ClipOval(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withValues(alpha: isDark ? 0.06 : 0.18),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: isDark ? 0.10 : 0.42),
                      ),
                    ),
                  ),
                ),
              ),
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      glowColor.withValues(alpha: isDark ? 0.24 : 0.20),
                      glowColor.withValues(alpha: 0.02),
                    ],
                  ),
                ),
              )
                  .animate(onPlay: (controller) => controller.repeat())
                  .scale(
                    begin: const Offset(0.9, 0.9),
                    end: const Offset(1.08, 1.08),
                    duration: 2200.ms,
                    curve: Curves.easeInOut,
                  )
                  .then()
                  .scale(
                    begin: const Offset(1.08, 1.08),
                    end: const Offset(0.9, 0.9),
                    duration: 2200.ms,
                    curve: Curves.easeInOut,
                  ),
              Icon(
                isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                size: 21,
                color: iconColor,
              ),
            ],
          ),
        ),
      ),
    )
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .moveY(begin: 0, end: -3, duration: 2400.ms, curve: Curves.easeInOut);
  }
}

class _HeroStage extends StatefulWidget {
  const _HeroStage({
    required this.scrollOffset,
    required this.selectedLanguage,
  });

  final double scrollOffset;
  final String? selectedLanguage;

  @override
  State<_HeroStage> createState() => _HeroStageState();
}

class _HeroStageState extends State<_HeroStage>
    with SingleTickerProviderStateMixin {
  late final AnimationController _orbitController;

  @override
  void initState() {
    super.initState();
    _orbitController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 14),
    )..repeat();
  }

  @override
  void dispose() {
    _orbitController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeAccent = widget.selectedLanguage == 'en'
        ? SahayakColors.voiceViolet
        : SahayakColors.saffron;
    final secondaryAccent = widget.selectedLanguage == 'en'
        ? SahayakColors.saffron
        : SahayakColors.voiceViolet;
    final verticalParallax = -(widget.scrollOffset * 0.08);
    final horizontalParallax = math.sin(widget.scrollOffset * 0.01) * 10;

    return AnimatedBuilder(
      animation: _orbitController,
      builder: (context, _) {
        final orbit = _orbitController.value * 2 * math.pi;
        final breathe = 1 + (math.sin(orbit) * 0.035);
        final heroBloom = widget.selectedLanguage == null ? 0.18 : 0.28;

        return SizedBox(
          height: 286,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Transform.translate(
                offset: Offset(horizontalParallax, verticalParallax),
                child: Container(
                  width: 380,
                  height: 380,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        activeAccent.withValues(
                          alpha: isDark ? heroBloom : 0.14,
                        ),
                        secondaryAccent.withValues(
                          alpha: isDark ? 0.16 : 0.10,
                        ),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              _PulseRing(
                size: 176,
                color: activeAccent,
                delayMs: 0,
                strength: widget.selectedLanguage == null ? 0.9 : 1.18,
              ),
              _PulseRing(
                size: 176,
                color: secondaryAccent,
                delayMs: 900,
                strength: widget.selectedLanguage == null ? 0.85 : 1.08,
              ),
              _PulseRing(
                size: 220,
                color: SahayakColors.ashokaGreen,
                delayMs: 1500,
                strength: widget.selectedLanguage == null ? 0.7 : 0.95,
              ),
              _OrbitingBadge(
                angle: orbit + (widget.scrollOffset * 0.002),
                radius: 114,
                icon: Icons.mic_rounded,
                color: SahayakColors.saffron,
                wobble: 8,
              ),
              _OrbitingBadge(
                angle: orbit + 1.5 + (widget.scrollOffset * 0.0025),
                radius: 108,
                icon: Icons.health_and_safety_rounded,
                color: SahayakColors.sosRed,
                wobble: 10,
              ),
              _OrbitingBadge(
                angle: orbit + 3.1 + (widget.scrollOffset * 0.0018),
                radius: 116,
                icon: Icons.medication_rounded,
                color: SahayakColors.ashokaGreen,
                wobble: 7,
              ),
              _OrbitingBadge(
                angle: orbit + 4.6 + (widget.scrollOffset * 0.0023),
                radius: 110,
                icon: Icons.language_rounded,
                color: SahayakColors.voiceViolet,
                wobble: 9,
              ),
              Transform.scale(
                scale: breathe,
                child: Container(
                  width: 166,
                  height: 166,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white.withValues(alpha: 0.22),
                        Colors.white.withValues(alpha: 0.05),
                      ],
                    ),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: activeAccent.withValues(
                          alpha: isDark ? 0.28 : 0.16,
                        ),
                        blurRadius: 34,
                        offset: const Offset(0, 16),
                      ),
                      BoxShadow(
                        color: secondaryAccent.withValues(
                          alpha: isDark ? 0.18 : 0.10,
                        ),
                        blurRadius: 30,
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

class _PulseRing extends StatefulWidget {
  const _PulseRing({
    required this.size,
    required this.color,
    required this.delayMs,
    required this.strength,
  });

  final double size;
  final Color color;
  final int delayMs;
  final double strength;

  @override
  State<_PulseRing> createState() => _PulseRingState();
}

class _PulseRingState extends State<_PulseRing>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );
    Future.delayed(Duration(milliseconds: widget.delayMs), () {
      if (mounted) _controller.repeat();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final progress = Curves.easeOut.transform(_controller.value);
        final scale = 1 + (progress * 0.34 * widget.strength);
        final opacity = (1 - progress) * 0.30 * widget.strength;

        return Transform.scale(
          scale: scale,
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: widget.color.withValues(alpha: opacity),
                width: 1.4,
              ),
              boxShadow: [
                BoxShadow(
                  color: widget.color.withValues(alpha: opacity * 0.55),
                  blurRadius: 24,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _OrbitingBadge extends StatelessWidget {
  const _OrbitingBadge({
    required this.angle,
    required this.radius,
    required this.icon,
    required this.color,
    required this.wobble,
  });

  final double angle;
  final double radius;
  final IconData icon;
  final Color color;
  final double wobble;

  @override
  Widget build(BuildContext context) {
    final dx = math.cos(angle) * radius;
    final dy = math.sin(angle) * radius;
    final scale = 1 + (math.sin(angle * 2) * 0.04);

    return Transform.translate(
      offset: Offset(dx, dy + (math.cos(angle * 1.8) * wobble)),
      child: Transform.scale(
        scale: scale,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color.withValues(alpha: 0.14),
            border: Border.all(
              color: color.withValues(alpha: 0.28),
            ),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.22),
                blurRadius: 20,
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Icon(
            icon,
            size: 18,
            color: color,
          ),
        ),
      ),
    );
  }
}

class _BrandHeading extends StatelessWidget {
  const _BrandHeading({required this.selectedAccent});

  final Color selectedAccent;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Column(
      children: [
        ShaderMask(
          shaderCallback: (bounds) => LinearGradient(
            colors: [
              selectedAccent,
              const Color(0xFFFFC15A),
              SahayakColors.ashokaGreen,
            ],
          ).createShader(bounds),
          child: Text(
            'Sahayak',
            textAlign: TextAlign.center,
            style: theme.textTheme.displayLarge?.copyWith(
              color: Colors.white,
              fontFamily: SahayakTypography.displayFont,
              fontWeight: FontWeight.w800,
              fontSize: 52,
              letterSpacing: -1.4,
            ),
          ),
        ),
        const SizedBox(height: 10),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 286),
          child: Text(
            'Let Sahayak begin in the language, warmth, and voice that feel closest to home.',
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontFamily: SahayakTypography.accentFont,
              fontSize: 20,
              fontWeight: FontWeight.w400,
              height: 1.12,
              color: SahayakColors.textPrimary(isDark).withValues(alpha: 0.96),
            ),
          ),
        ),
        const SizedBox(height: 10),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 340),
          child: Text(
            'Choose once. Every next screen will follow it. You can always refine it later from Settings.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: SahayakColors.textMuted(isDark),
              height: 1.55,
            ),
          ),
        ),
      ],
    );
  }
}

class _MiniBenefitsRow extends StatelessWidget {
  const _MiniBenefitsRow({
    required this.accent,
    required this.isDark,
  });

  final Color accent;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.record_voice_over_rounded, 'Voice first'),
      (Icons.verified_user_rounded, 'Trusted guidance'),
      (Icons.offline_bolt_rounded, 'Offline ready'),
    ];

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      alignment: WrapAlignment.center,
      children: [
        for (final item in items)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(999),
              color: accent.withValues(alpha: isDark ? 0.10 : 0.08),
              border: Border.all(
                color: accent.withValues(alpha: isDark ? 0.24 : 0.18),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  item.$1,
                  size: 16,
                  color: accent,
                ),
                const SizedBox(width: 8),
                Text(
                  item.$2,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _LanguagePortalCard extends StatefulWidget {
  const _LanguagePortalCard({
    required this.code,
    required this.native,
    required this.english,
    required this.caption,
    required this.accent,
    required this.isActive,
    required this.onTap,
  });

  final String code;
  final String native;
  final String english;
  final String caption;
  final Color accent;
  final bool isActive;
  final VoidCallback onTap;

  @override
  State<_LanguagePortalCard> createState() => _LanguagePortalCardState();
}

class _LanguagePortalCardState extends State<_LanguagePortalCard> {
  bool _pressed = false;
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final intensity = widget.isActive ? 1.0 : (_hovered ? 0.75 : 0.55);

    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _pressed = true),
        onTapCancel: () => setState(() => _pressed = false),
        onTapUp: (_) => setState(() => _pressed = false),
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _pressed ? 0.97 : 1,
          duration: const Duration(milliseconds: 140),
          curve: Curves.easeOut,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 260),
            curve: Curves.easeOutCubic,
            height: 198,
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(30),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: widget.isActive
                    ? [
                        widget.accent.withValues(alpha: isDark ? 0.38 : 0.26),
                        SahayakColors.ashokaGreen.withValues(
                          alpha: isDark ? 0.22 : 0.12,
                        ),
                      ]
                    : [
                        widget.accent.withValues(
                          alpha: isDark ? 0.10 * intensity : 0.07 * intensity,
                        ),
                        SahayakColors.glassFill(isDark),
                        Colors.white.withValues(alpha: isDark ? 0.03 : 0.72),
                      ],
              ),
              border: Border.all(
                color: widget.isActive
                    ? widget.accent.withValues(alpha: 0.92)
                    : SahayakColors.glassBorder(isDark),
                width: widget.isActive ? 1.6 : 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: widget.isActive
                      ? widget.accent.withValues(alpha: 0.24)
                      : widget.accent.withValues(
                          alpha: isDark ? 0.08 : 0.05,
                        ),
                  blurRadius: widget.isActive ? 30 : 18,
                  offset: const Offset(0, 14),
                ),
              ],
            ),
            child: Stack(
              children: [
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      gradient: LinearGradient(
                        colors: [
                          Colors.white.withValues(
                            alpha: isDark ? 0.08 : 0.30,
                          ),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                ),
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: widget.isActive
                              ? Colors.white
                              : widget.accent.withValues(alpha: 0.55),
                        ),
                      ),
                      const SizedBox(height: 22),
                      Text(
                        widget.native,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontFamily: SahayakTypography.bodyFont,
                          fontWeight: FontWeight.w700,
                          color: widget.isActive
                              ? Colors.white
                              : SahayakColors.textPrimary(isDark),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        widget.english,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontFamily: SahayakTypography.displayFont,
                          fontWeight: FontWeight.w700,
                          color: widget.isActive
                              ? Colors.white.withValues(alpha: 0.90)
                              : SahayakColors.textPrimary(isDark),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        widget.caption,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: widget.isActive
                              ? Colors.white.withValues(alpha: 0.74)
                              : SahayakColors.textMuted(isDark),
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FamilySupportPanel extends StatelessWidget {
  const _FamilySupportPanel();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            SahayakColors.saffron.withValues(alpha: isDark ? 0.10 : 0.08),
            SahayakColors.voiceViolet.withValues(alpha: isDark ? 0.10 : 0.06),
            Colors.white.withValues(alpha: isDark ? 0.06 : 0.78),
          ],
        ),
        border: Border.all(
          color: Colors.white.withValues(alpha: isDark ? 0.08 : 0.18),
        ),
      ),
      child: Column(
        children: [
          SizedBox(
            width: 136,
            height: 136,
            child: Lottie.asset(
              'assets/lottie/family.json',
              repeat: true,
              fit: BoxFit.contain,
            ),
          )
              .animate(onPlay: (controller) => controller.repeat(reverse: true))
              .moveY(begin: 0, end: -6, duration: 2400.ms),
          const SizedBox(height: 2),
          Text(
            'Hindi and English are launch-ready',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontFamily: SahayakTypography.displayFont,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your chosen language stays with onboarding, home, and voice guidance.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SahayakColors.textMuted(isDark),
                  height: 1.45,
                ),
          ),
        ],
      ),
    );
  }
}

class _ComingSoonPanel extends StatelessWidget {
  const _ComingSoonPanel({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            SahayakColors.voiceViolet.withValues(alpha: isDark ? 0.08 : 0.05),
            SahayakColors.saffron.withValues(alpha: isDark ? 0.06 : 0.04),
            Colors.white.withValues(alpha: isDark ? 0.04 : 0.84),
          ],
        ),
        border: Border.all(
          color: Colors.white.withValues(alpha: isDark ? 0.08 : 0.14),
        ),
      ),
      child: Column(
        children: [
          Text(
            'Available soon',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontFamily: SahayakTypography.displayFont,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tamil, Bengali, Marathi, Telugu, Kannada, Gujarati, Punjabi, and Malayalam are next in line.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SahayakColors.textMuted(isDark),
                  height: 1.5,
                ),
          ),
          const SizedBox(height: 14),
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 10,
            runSpacing: 10,
            children: Step1Welcome.comingSoon
                .map(
                  (language) => Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 9,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      color: language.$2.withValues(alpha: isDark ? 0.12 : 0.10),
                      border: Border.all(
                        color: language.$2.withValues(
                          alpha: isDark ? 0.30 : 0.24,
                        ),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: language.$2.withValues(
                            alpha: isDark ? 0.14 : 0.08,
                          ),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Text(
                      language.$1,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                            color: isDark ? Colors.white : Colors.black,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}
