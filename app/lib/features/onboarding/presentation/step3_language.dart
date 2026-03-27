import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lottie/lottie.dart';

import '../../../core/theme/colors.dart';
import '../../../core/theme/typography.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/story_medallion.dart';

class Step3Language extends StatefulWidget {
  const Step3Language({
    super.key,
    required this.initialLanguage,
    required this.onNext,
  });

  final String? initialLanguage;
  final void Function(String) onNext;

  @override
  State<Step3Language> createState() => _Step3LanguageState();
}

class _Step3LanguageState extends State<Step3Language> {
  late String _selected;

  static const _activeLanguages = [
    (
      'hi',
      '\u0939\u093f\u0902\u0926\u0940',
      'Hindi',
      '\u0938\u0941\u0928\u0928\u0947 \u0914\u0930 \u091c\u0935\u093e\u092c \u0926\u0947\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0924\u0948\u092f\u093e\u0930'
    ),
    ('en', 'English', 'English', 'Ready for calm guidance'),
  ];

  static const _comingSoon = [
    '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd',
    '\u09ac\u09be\u0982\u09b2\u09be',
    '\u092e\u0930\u093e\u0920\u0940',
    '\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41',
    '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1',
    '\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0',
    '\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40',
    '\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02',
  ];

  @override
  void initState() {
    super.initState();
    _selected = widget.initialLanguage == 'en' ? 'en' : 'hi';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final current = _activeLanguages.firstWhere((item) => item.$1 == _selected);
    final accent =
        _selected == 'en' ? SahayakColors.voiceViolet : SahayakColors.saffron;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
      child: Column(
        children: [
          StoryMedallion(
            accent: accent,
            secondaryAccent: _selected == 'en'
                ? SahayakColors.saffron
                : SahayakColors.voiceViolet,
            size: 144,
            compact: true,
          )
              .animate()
              .fadeIn(duration: 360.ms)
              .scale(begin: const Offset(0.96, 0.96)),
          const SizedBox(height: 12),
          _SelectedLanguageBanner(
            native: current.$2,
            english: current.$3,
          )
              .animate()
              .fadeIn(duration: 360.ms)
              .slideY(begin: 0.08, end: 0),
          const SizedBox(height: 22),
          Text(
            'Voice and guidance language',
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontFamily: SahayakTypography.accentFont,
              fontSize: 34,
              fontWeight: FontWeight.w400,
              height: 1.05,
            ),
          ).animate().fadeIn(delay: 90.ms, duration: 300.ms),
          const SizedBox(height: 8),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 330),
            child: Text(
              'This choice now becomes the active language for onboarding and the next app screens.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: SahayakColors.textMuted(isDark),
                height: 1.5,
              ),
            ),
          ).animate().fadeIn(delay: 150.ms, duration: 300.ms),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (context, constraints) {
              final cardWidth = (constraints.maxWidth - 14) / 2;

              return Wrap(
                spacing: 14,
                runSpacing: 14,
                alignment: WrapAlignment.center,
                children: [
                  for (var i = 0; i < _activeLanguages.length; i++)
                    SizedBox(
                      width: cardWidth,
                      child: _LanguageChoiceCard(
                        code: _activeLanguages[i].$1,
                        native: _activeLanguages[i].$2,
                        english: _activeLanguages[i].$3,
                        caption: _activeLanguages[i].$4,
                        isActive: _selected == _activeLanguages[i].$1,
                        onTap: () => setState(() => _selected = _activeLanguages[i].$1),
                      )
                          .animate()
                          .fadeIn(delay: (220 + i * 80).ms, duration: 320.ms)
                          .slideY(begin: 0.1, end: 0),
                    ),
                ],
              );
            },
          ),
          const SizedBox(height: 18),
          _ComingSoonStrip(isDark: isDark)
              .animate()
              .fadeIn(delay: 320.ms, duration: 320.ms)
              .slideY(begin: 0.08, end: 0),
          const SizedBox(height: 20),
          GlassButton(
            label: _selected == 'hi'
                ? '\u0939\u093f\u0902\u0926\u0940 \u092e\u0947\u0902 \u0906\u0917\u0947 \u092c\u095d\u0947\u0902'
                : 'Continue in English',
            onPressed: () => widget.onNext(_selected),
          ).animate().fadeIn(delay: 380.ms, duration: 320.ms),
        ],
      ),
    );
  }
}

class _SelectedLanguageBanner extends StatelessWidget {
  const _SelectedLanguageBanner({
    required this.native,
    required this.english,
  });

  final String native;
  final String english;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            SahayakColors.saffron.withValues(alpha: isDark ? 0.14 : 0.10),
            SahayakColors.voiceViolet.withValues(alpha: isDark ? 0.12 : 0.08),
            Colors.white.withValues(alpha: isDark ? 0.04 : 0.76),
          ],
        ),
        border: Border.all(
          color: Colors.white.withValues(alpha: isDark ? 0.08 : 0.16),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.14 : 0.04),
            blurRadius: 24,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 76,
            height: 76,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              color: Colors.white.withValues(alpha: isDark ? 0.06 : 0.78),
            ),
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Lottie.asset(
                'assets/lottie/microphone.json',
                fit: BoxFit.contain,
                repeat: true,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  native,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontFamily: SahayakTypography.bodyFont,
                        fontWeight: FontWeight.w700,
                        color: SahayakColors.saffron,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  english,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontFamily: SahayakTypography.displayFont,
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  'This becomes active immediately.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: SahayakColors.textMuted(isDark),
                        height: 1.45,
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

class _LanguageChoiceCard extends StatelessWidget {
  const _LanguageChoiceCard({
    required this.code,
    required this.native,
    required this.english,
    required this.caption,
    required this.isActive,
    required this.onTap,
  });

  final String code;
  final String native;
  final String english;
  final String caption;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = code == 'hi' ? SahayakColors.saffron : SahayakColors.voiceViolet;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 260),
        curve: Curves.easeOutCubic,
        height: 188,
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(30),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isActive
                ? [
                    accent.withValues(alpha: 0.28),
                    SahayakColors.ashokaGreen.withValues(alpha: 0.16),
                  ]
                : [
                    SahayakColors.glassFill(isDark),
                    Colors.white.withValues(alpha: isDark ? 0.03 : 0.70),
                  ],
          ),
          border: Border.all(
            color: isActive ? accent.withValues(alpha: 0.92) : SahayakColors.glassBorder(isDark),
            width: isActive ? 1.6 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: isActive
                  ? accent.withValues(alpha: 0.20)
                  : Colors.black.withValues(alpha: isDark ? 0.14 : 0.04),
              blurRadius: isActive ? 28 : 18,
              offset: const Offset(0, 14),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isActive ? Colors.white : accent.withValues(alpha: 0.40),
                  ),
                ),
                const Spacer(),
                AnimatedOpacity(
                  duration: const Duration(milliseconds: 200),
                  opacity: isActive ? 1 : 0,
                  child: const Icon(
                    Icons.check_circle_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
              ],
            ),
            const Spacer(),
            Text(
              native,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontFamily: SahayakTypography.bodyFont,
                fontWeight: FontWeight.w700,
                color: isActive ? Colors.white : SahayakColors.textPrimary(isDark),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              english,
              style: theme.textTheme.titleMedium?.copyWith(
                fontFamily: SahayakTypography.displayFont,
                fontWeight: FontWeight.w700,
                color: isActive ? Colors.white.withValues(alpha: 0.90) : SahayakColors.textPrimary(isDark),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              caption,
              style: theme.textTheme.bodySmall?.copyWith(
                color: isActive ? Colors.white.withValues(alpha: 0.72) : SahayakColors.textMuted(isDark),
                height: 1.45,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ComingSoonStrip extends StatelessWidget {
  const _ComingSoonStrip({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        color: Colors.white.withValues(alpha: isDark ? 0.04 : 0.82),
        border: Border.all(
          color: Colors.white.withValues(alpha: isDark ? 0.08 : 0.14),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Available soon',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontFamily: SahayakTypography.displayFont,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'More Indian languages are queued next. For now, Hindi and English are the launch-ready pair.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SahayakColors.textMuted(isDark),
                  height: 1.45,
                ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: _Step3LanguageState._comingSoon
                .map(
                  (language) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      color: Colors.white.withValues(alpha: isDark ? 0.04 : 0.92),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: isDark ? 0.08 : 0.12),
                      ),
                    ),
                    child: Text(
                      language,
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                            color: SahayakColors.textMuted(isDark),
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
