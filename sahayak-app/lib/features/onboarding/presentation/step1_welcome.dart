import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_card.dart';

class Step1Welcome extends StatelessWidget {
  const Step1Welcome({
    super.key,
    required this.selectedLanguage,
    required this.onLanguageSelected,
  });

  final String?        selectedLanguage;
  final void Function(String) onLanguageSelected;

  static const _languages = [
    {'code': 'hi', 'name': 'हिंदी',    'flag': '🇮🇳', 'eng': 'Hindi'},
    {'code': 'ta', 'name': 'தமிழ்',   'flag': '🇮🇳', 'eng': 'Tamil'},
    {'code': 'bn', 'name': 'বাংলা',    'flag': '🇧🇩', 'eng': 'Bengali'},
    {'code': 'mr', 'name': 'मराठी',   'flag': '🇮🇳', 'eng': 'Marathi'},
    {'code': 'te', 'name': 'తెలుగు',  'flag': '🇮🇳', 'eng': 'Telugu'},
    {'code': 'kn', 'name': 'ಕನ್ನಡ',   'flag': '🇮🇳', 'eng': 'Kannada'},
    {'code': 'gu', 'name': 'ગુજરાતી', 'flag': '🇮🇳', 'eng': 'Gujarati'},
    {'code': 'pa', 'name': 'ਪੰਜਾਬੀ',  'flag': '🇮🇳', 'eng': 'Punjabi'},
    {'code': 'ml', 'name': 'മലയാളം',  'flag': '🇮🇳', 'eng': 'Malayalam'},
    {'code': 'ur', 'name': 'اردو',     'flag': '🇵🇰', 'eng': 'Urdu'},
    {'code': 'en', 'name': 'English',  'flag': '🇬🇧', 'eng': 'English'},
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 8),
          Text('🙏', style: const TextStyle(fontSize: 64))
              .animate()
              .scale(duration: 600.ms, curve: Curves.elasticOut),
          const SizedBox(height: 16),
          Text(
            'Sahayak में आपका स्वागत है',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ).animate().fadeIn(delay: 300.ms, duration: 500.ms),
          const SizedBox(height: 8),
          Text(
            'अपनी भाषा चुनें / Choose your language',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium,
          ).animate().fadeIn(delay: 500.ms, duration: 500.ms),
          const SizedBox(height: 32),

          // Language grid
          GridView.builder(
            shrinkWrap:      true,
            physics:         const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount:    3,
              crossAxisSpacing:  12,
              mainAxisSpacing:   12,
              childAspectRatio:  1.1,
            ),
            itemCount: _languages.length,
            itemBuilder: (context, i) {
              final lang     = _languages[i];
              final isActive = selectedLanguage == lang['code'];
              return GestureDetector(
                onTap: () => onLanguageSelected(lang['code']!),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    color: isActive
                        ? accent.withOpacity(0.15)
                        : SahayakColors.glassFill(isDark),
                    border: Border.all(
                      color: isActive ? accent : SahayakColors.glassBorder(isDark),
                      width: isActive ? 2 : 1,
                    ),
                    boxShadow: isActive
                        ? [BoxShadow(
                            color:       accent.withOpacity(0.25),
                            blurRadius:  12,
                            spreadRadius: 1,
                          )]
                        : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(lang['flag']!,
                          style: const TextStyle(fontSize: 22)),
                      const SizedBox(height: 4),
                      Text(
                        lang['name']!,
                        style: TextStyle(
                          fontSize:   15,
                          fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                          color:      isActive
                              ? accent
                              : SahayakColors.textPrimary(isDark),
                          fontFamily: 'NotoSansDevanagari',
                        ),
                      ),
                    ],
                  ),
                ),
              ).animate()
               .fadeIn(delay: (i * 40).ms, duration: 300.ms)
               .scale(begin: const Offset(0.9, 0.9), delay: (i * 40).ms,
                   duration: 300.ms, curve: Curves.easeOut);
            },
          ),
        ],
      ),
    );
  }
}
