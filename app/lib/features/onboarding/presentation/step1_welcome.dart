import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/glass_card.dart';

class Step1Welcome extends StatelessWidget {
  const Step1Welcome({
    super.key,
    required this.selectedLanguage,
    required this.onLanguageSelected,
  });

  final String? selectedLanguage;
  final void Function(String) onLanguageSelected;

  static const _languages = [
    ('hi', 'Hindi', 'हिंदी'),
    ('ta', 'Tamil', 'தமிழ்'),
    ('bn', 'Bengali', 'বাংলা'),
    ('mr', 'Marathi', 'मराठी'),
    ('te', 'Telugu', 'తెలుగు'),
    ('kn', 'Kannada', 'ಕನ್ನಡ'),
    ('gu', 'Gujarati', 'ગુજરાતી'),
    ('pa', 'Punjabi', 'ਪੰਜਾਬੀ'),
    ('ml', 'Malayalam', 'മലയാളം'),
    ('ur', 'Urdu', 'اردو'),
    ('en', 'English', 'English'),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GlassCard(
            padding: const EdgeInsets.all(24),
            accentColor: accent,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    gradient: SahayakColors.primaryGradient(
                      accent,
                      SahayakColors.ashokaGreen,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: accent.withValues(alpha: 0.22),
                        blurRadius: 24,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'S',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ).animate().fadeIn(duration: 320.ms).scale(
                      begin: const Offset(0.92, 0.92),
                      curve: Curves.easeOutBack,
                    ),
                const SizedBox(height: 22),
                Text(
                  'Sahayak',
                  style: Theme.of(context).textTheme.displaySmall,
                ).animate().fadeIn(delay: 90.ms, duration: 300.ms),
                const SizedBox(height: 10),
                Text(
                  'Your phone. Your language. Your freedom.',
                  style: Theme.of(context).textTheme.headlineSmall,
                ).animate().fadeIn(delay: 150.ms, duration: 320.ms),
                const SizedBox(height: 10),
                Text(
                  'Choose the elder\'s most comfortable language first. The entire app experience will adapt from here.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: SahayakColors.textMuted(isDark),
                      ),
                ).animate().fadeIn(delay: 210.ms, duration: 340.ms),
                const SizedBox(height: 18),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: const [
                    _FeatureChip(label: 'Voice first'),
                    _FeatureChip(label: 'Large text'),
                    _FeatureChip(label: 'Offline ready'),
                  ],
                ).animate().fadeIn(delay: 260.ms, duration: 320.ms),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Select a starting language',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 6),
          Text(
            'This can be changed later from Settings.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SahayakColors.textMuted(isDark),
                ),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
              childAspectRatio: 1.45,
            ),
            itemCount: _languages.length,
            itemBuilder: (context, index) {
              final (code, english, native) = _languages[index];
              final isActive = selectedLanguage == code;

              return GestureDetector(
                onTap: () => onLanguageSelected(code),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isActive
                        ? accent.withValues(alpha: isDark ? 0.18 : 0.14)
                        : SahayakColors.glassFill(isDark),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(
                      color: isActive ? accent : SahayakColors.glassBorder(isDark),
                      width: isActive ? 1.8 : 1,
                    ),
                    boxShadow: isActive
                        ? [
                            BoxShadow(
                              color: accent.withValues(alpha: 0.18),
                              blurRadius: 22,
                              offset: const Offset(0, 10),
                            ),
                          ]
                        : null,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Align(
                        alignment: Alignment.topRight,
                        child: AnimatedOpacity(
                          duration: const Duration(milliseconds: 180),
                          opacity: isActive ? 1 : 0,
                          child: Icon(
                            Icons.check_circle_rounded,
                            color: accent,
                            size: 20,
                          ),
                        ),
                      ),
                      Text(
                        native,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: isActive ? accent : null,
                            ),
                      ),
                      Text(
                        english,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: isActive
                                  ? accent
                                  : SahayakColors.textMuted(isDark),
                            ),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(delay: (index * 40).ms, duration: 260.ms).slideY(
                    begin: 0.12,
                    end: 0,
                    curve: Curves.easeOutCubic,
                  );
            },
          ),
          const SizedBox(height: 22),
          GlassButton(
            label: selectedLanguage == null ? 'Choose a language' : 'Continue',
            onPressed: selectedLanguage == null
                ? null
                : () => onLanguageSelected(selectedLanguage!),
          ),
        ],
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  const _FeatureChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: SahayakColors.glassFill(isDark),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: SahayakColors.glassBorder(isDark)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelLarge,
      ),
    );
  }
}
