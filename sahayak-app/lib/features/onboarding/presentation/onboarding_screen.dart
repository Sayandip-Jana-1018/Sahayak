import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'step1_welcome.dart';
import 'step2_elder_details.dart';
import 'step3_language.dart';
import 'step4_device_setup.dart';
import '../../../core/theme/colors.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  // Shared onboarding data collected across steps
  String?  _selectedLanguage;
  String?  _elderName;
  int?     _elderAge;
  String?  _city;
  String?  _state;
  String?  _phone;
  String?  _relationship;

  void _nextPage() {
    if (_currentPage < 3) {
      _pageController.animateToPage(
        _currentPage + 1,
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.animateToPage(
        _currentPage - 1,
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    }
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
      body: Column(
        children: [
          // Progress bar
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: Column(
                children: [
                  Row(
                    children: [
                      if (_currentPage > 0)
                        IconButton(
                          onPressed: _previousPage,
                          icon: const Icon(Icons.arrow_back_rounded),
                          iconSize: 28,
                        )
                      else
                        const SizedBox(width: 48),
                      Expanded(
                        child: _ProgressBar(
                          current: _currentPage,
                          total:   4,
                          accent:  accent,
                          isDark:  isDark,
                        ),
                      ),
                      TextButton(
                        onPressed: () => context.go('/home'),
                        child: Text(
                          'छोड़ें',
                          style: TextStyle(
                            color: SahayakColors.textMuted(isDark),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Pages
          Expanded(
            child: PageView(
              controller: _pageController,
              physics:    const NeverScrollableScrollPhysics(),
              onPageChanged: (i) => setState(() => _currentPage = i),
              children: [
                Step1Welcome(
                  selectedLanguage: _selectedLanguage,
                  onLanguageSelected: (lang) {
                    setState(() => _selectedLanguage = lang);
                    _nextPage();
                  },
                ),
                Step2ElderDetails(
                  onNext: (name, age, city, state, phone, rel) {
                    setState(() {
                      _elderName    = name;
                      _elderAge     = age;
                      _city         = city;
                      _state        = state;
                      _phone        = phone;
                      _relationship = rel;
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
                  elderName:    _elderName ?? '',
                  language:     _selectedLanguage ?? 'hi',
                  ageYears:     _elderAge,
                  city:         _city,
                  state:        _state,
                  phone:        _phone,
                  relationship: _relationship,
                  onComplete:   () => context.go('/home'),
                ),
              ],
            ),
          ),
        ],
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

  final int   current;
  final int   total;
  final Color accent;
  final bool  isDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(total, (i) {
        final isActive   = i == current;
        final isComplete = i < current;
        return Expanded(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            height:   4,
            margin:   const EdgeInsets.symmetric(horizontal: 2),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: isComplete || isActive
                  ? accent
                  : SahayakColors.glassBorder(isDark),
              boxShadow: isActive
                  ? [BoxShadow(color: accent.withOpacity(0.4), blurRadius: 8)]
                  : null,
            ),
          ),
        );
      }),
    );
  }
}
