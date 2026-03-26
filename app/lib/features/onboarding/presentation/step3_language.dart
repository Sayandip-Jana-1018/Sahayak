import 'package:flutter/material.dart';

import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/glass_card.dart';

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
  late String? _selected;

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
  void initState() {
    super.initState();
    _selected = widget.initialLanguage ?? 'hi';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;
    final active = _languages.firstWhere((item) => item.$1 == _selected);

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Confirm the voice language',
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Sahayak will listen and respond in this language first. You can add more later.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SahayakColors.textMuted(isDark),
                ),
          ),
          const SizedBox(height: 20),
          AccentGlassCard(
            accent: accent,
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        active.$3,
                        style: Theme.of(context).textTheme.displaySmall?.copyWith(
                              color: accent,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        active.$2,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Preview: reminders, SOS prompts, and voice replies will start in this language.',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 1.45,
              ),
              itemCount: _languages.length,
              itemBuilder: (context, index) {
                final item = _languages[index];
                final isActive = _selected == item.$1;

                return GestureDetector(
                  onTap: () => setState(() => _selected = item.$1),
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
                          item.$3,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: isActive ? accent : null,
                              ),
                        ),
                        Text(
                          item.$2,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: isActive
                                    ? accent
                                    : SahayakColors.textMuted(isDark),
                              ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          GlassButton(
            label: 'Continue',
            onPressed: _selected == null ? null : () => widget.onNext(_selected!),
          ),
        ],
      ),
    );
  }
}
