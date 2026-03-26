import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_card.dart';
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
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: SahayakColors.heroGlow(isDark, accent),
        ),
        child: Stack(
          children: [
            Positioned(
              top: -120,
              right: -80,
              child: _Aura(
                color: SahayakColors.voiceViolet.withValues(alpha: 0.18),
                size: 260,
              ),
            ),
            Positioned(
              bottom: -140,
              left: -70,
              child: _Aura(
                color: SahayakColors.ashokaGreen.withValues(alpha: 0.14),
                size: 260,
              ),
            ),
            SafeArea(
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
                    child: Row(
                      children: [
                        _HeaderButton(
                          icon: Icons.arrow_back_rounded,
                          visible: _currentPage > 0,
                          onTap: _previousPage,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: GlassCard(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 12,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Step ${_currentPage + 1} of 4',
                                  style: Theme.of(context).textTheme.labelLarge,
                                ),
                                const SizedBox(height: 8),
                                _ProgressBar(
                                  current: _currentPage,
                                  total: 4,
                                  accent: accent,
                                  isDark: isDark,
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        TextButton(
                          onPressed: () => context.go('/home'),
                          child: Text(
                            'Skip',
                            style: TextStyle(
                              color: SahayakColors.textMuted(isDark),
                            ),
                          ),
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
          ],
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
            height: 6,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(999),
              color: isComplete || isActive
                  ? accent
                  : SahayakColors.glassBorder(isDark),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: accent.withValues(alpha: 0.32),
                        blurRadius: 10,
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
        child: GlassCard(
          padding: const EdgeInsets.all(10),
          borderRadius: 18,
          onTap: onTap,
          child: Icon(
            icon,
            color: SahayakColors.textPrimary(isDark),
          ),
        ),
      ),
    );
  }
}

class _Aura extends StatelessWidget {
  const _Aura({
    required this.color,
    required this.size,
  });

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: color,
              blurRadius: 140,
              spreadRadius: 30,
            ),
          ],
        ),
      ),
    );
  }
}
