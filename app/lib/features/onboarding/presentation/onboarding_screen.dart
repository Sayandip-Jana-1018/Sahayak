import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/colors.dart';
import '../../../shared/widgets/immersive_shell.dart';
import 'step1_welcome.dart';
import 'step2_elder_details.dart';
import 'step3_language.dart';
import 'step4_device_setup.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  String? _selectedLanguage;
  String? _elderName;
  int? _elderAge;
  String? _city;
  String? _state;
  String? _phone;
  String? _relationship;

  void _nextPage() {
    if (_currentPage >= 3) return;
    _pageController.animateToPage(
      _currentPage + 1,
      duration: const Duration(milliseconds: 360),
      curve: Curves.easeInOutCubic,
    );
  }

  void _previousPage() {
    if (_currentPage <= 0) return;
    _pageController.animateToPage(
      _currentPage - 1,
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeInOutCubic,
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    return Scaffold(
      body: ImmersiveShell(
        primaryGlow: accent,
        secondaryGlow: SahayakColors.voiceViolet,
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        _HeaderButton(
                          icon: Icons.arrow_back_rounded,
                          visible: _currentPage > 0,
                          onTap: _previousPage,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Step ${_currentPage + 1} of 4',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        TextButton(
                          onPressed: () => context.go('/home'),
                          child: Text(
                            'Skip',
                            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                  color: SahayakColors.textMuted(isDark),
                                ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _ProgressBar(
                      current: _currentPage,
                      total: 4,
                      accent: accent,
                      isDark: isDark,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  onPageChanged: (index) => setState(() => _currentPage = index),
                  children: [
                    Step1Welcome(
                      selectedLanguage: _selectedLanguage,
                      onLanguageSelected: (lang) {
                        setState(() => _selectedLanguage = lang);
                        _nextPage();
                      },
                    ),
                    Step2ElderDetails(
                      onNext: (name, age, city, state, phone, relationship) {
                        setState(() {
                          _elderName = name;
                          _elderAge = age;
                          _city = city;
                          _state = state;
                          _phone = phone;
                          _relationship = relationship;
                        });
                        _nextPage();
                      },
                    ),
                    Step3Language(
                      initialLanguage: _selectedLanguage,
                      onNext: (lang) {
                        setState(() => _selectedLanguage = lang);
                        _nextPage();
                      },
                    ),
                    Step4DeviceSetup(
                      elderName: _elderName ?? '',
                      language: _selectedLanguage ?? 'hi',
                      ageYears: _elderAge,
                      city: _city,
                      state: _state,
                      phone: _phone,
                      relationship: _relationship,
                      onComplete: () => context.go('/home'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProgressBar extends StatelessWidget {
  const _ProgressBar({
    required this.current,
    required this.total,
    required this.accent,
    required this.isDark,
  });

  final int current;
  final int total;
  final Color accent;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(total, (index) {
        final isActive = index == current;
        final isComplete = index < current;

        return Expanded(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 240),
            height: 8,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(999),
              gradient: isComplete || isActive
                  ? LinearGradient(
                      colors: [
                        accent,
                        SahayakColors.saffron.withValues(alpha: 0.92),
                      ],
                    )
                  : null,
              color: isComplete || isActive
                  ? null
                  : SahayakColors.glassBorder(isDark),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: accent.withValues(alpha: 0.30),
                        blurRadius: 12,
                      ),
                    ]
                  : null,
            ),
          ),
        );
      }),
    );
  }
}

class _HeaderButton extends StatelessWidget {
  const _HeaderButton({
    required this.icon,
    required this.visible,
    required this.onTap,
  });

  final IconData icon;
  final bool visible;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnimatedOpacity(
      duration: const Duration(milliseconds: 180),
      opacity: visible ? 1 : 0,
      child: IgnorePointer(
        ignoring: !visible,
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.06)
                  : Colors.black.withValues(alpha: 0.04),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.08)
                    : Colors.black.withValues(alpha: 0.06),
              ),
            ),
            alignment: Alignment.center,
            child: Icon(
              icon,
              color: SahayakColors.textPrimary(isDark),
            ),
          ),
        ),
      ),
    );
  }
}
