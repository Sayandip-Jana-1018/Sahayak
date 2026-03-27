import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../core/services/auth_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/theme_cubit.dart';
import '../../../shared/widgets/immersive_shell.dart';
import '../../settings/bloc/settings_bloc.dart';
import 'step1_welcome.dart';
import 'step2_elder_details.dart';
import 'step3_language.dart';
import 'step4_device_setup.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with SingleTickerProviderStateMixin {
  final _pageController = PageController();
  int _currentPage = 0;

  String? _selectedLanguage;
  String? _elderName;
  int? _elderAge;
  String? _city;
  String? _state;
  String? _phone;
  String? _relationship;

  late final AnimationController _headerAnimCtrl;

  @override
  void initState() {
    super.initState();
    _headerAnimCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) _headerAnimCtrl.forward();
    });
  }

  void _nextPage() {
    if (_currentPage >= 3) return;
    HapticFeedback.lightImpact();
    _pageController.animateToPage(
      _currentPage + 1,
      duration: const Duration(milliseconds: 460),
      curve: Curves.easeInOutCubic,
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    _headerAnimCtrl.dispose();
    super.dispose();
  }

  Future<void> _applyLanguage(String language) async {
    setState(() => _selectedLanguage = language);
    await StorageService.instance.setLanguage(language);
    if (!mounted) return;
    context.read<SettingsBloc>().add(SetLanguage(language));
  }

  Future<void> _returnToLogin() async {
    await AuthService.instance.signOut(preserveDraft: true);
    if (!mounted) return;
    context.go('/login');
  }

  Future<void> _handleSkip() async {
    switch (_currentPage) {
      case 0:
        await _applyLanguage(_selectedLanguage ?? 'hi');
        if (!mounted) return;
        _nextPage();
        break;
      case 1:
        setState(() {
          _elderName = _elderName?.trim().isNotEmpty == true
              ? _elderName
              : (AuthService.instance.currentUser?.fullName?.trim().isNotEmpty ==
                      true
                  ? AuthService.instance.currentUser!.fullName
                  : 'Sahayak User');
          _elderAge ??= 65;
          _relationship ??= 'Son / Daughter';
        });
        _nextPage();
        break;
      case 2:
        await _applyLanguage(_selectedLanguage ?? 'hi');
        if (!mounted) return;
        _nextPage();
        break;
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    return Scaffold(
      body: Stack(
        children: [
          ImmersiveShell(
            primaryGlow: accent,
            secondaryGlow: SahayakColors.voiceViolet,
            child: SafeArea(
              child: Column(
                children: [
                  AnimatedBuilder(
                    animation: _headerAnimCtrl,
                    builder: (context, child) {
                      final t = CurvedAnimation(
                        parent: _headerAnimCtrl,
                        curve: Curves.easeOutCubic,
                      ).value;
                      return Opacity(
                        opacity: t,
                        child: Transform.translate(
                          offset: Offset(0, -12 * (1 - t)),
                          child: child,
                        ),
                      );
                    },
                    child: _PremiumHeader(
                      currentPage: _currentPage,
                      accent: accent,
                      isDark: isDark,
                      onBack: _returnToLogin,
                      onSkip: _handleSkip,
                      showSkip: _currentPage < 3,
                    ),
                  ),
                  Expanded(
                    child: PageView(
                      controller: _pageController,
                      physics: const NeverScrollableScrollPhysics(),
                      onPageChanged: (index) =>
                          setState(() => _currentPage = index),
                      children: [
                        Step1Welcome(
                          selectedLanguage: _selectedLanguage,
                          isDark: isDark,
                          onToggleTheme: () {
                            context.read<SettingsBloc>().add(ToggleDarkMode());
                            context.read<ThemeCubit>().toggleDark();
                          },
                          onLanguageSelected: (lang) async {
                            await _applyLanguage(lang);
                            if (!mounted) return;
                            HapticFeedback.selectionClick();
                            await Future.delayed(
                              const Duration(milliseconds: 260),
                            );
                            if (mounted) _nextPage();
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
                          onNext: (lang) async {
                            await _applyLanguage(lang);
                            if (!mounted) return;
                            HapticFeedback.selectionClick();
                            await Future.delayed(
                              const Duration(milliseconds: 220),
                            );
                            if (mounted) _nextPage();
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
        ],
      ),
    );
  }
}

class _PremiumHeader extends StatelessWidget {
  const _PremiumHeader({
    required this.currentPage,
    required this.accent,
    required this.isDark,
    required this.onBack,
    required this.onSkip,
    required this.showSkip,
  });

  final int currentPage;
  final Color accent;
  final bool isDark;
  final VoidCallback onBack;
  final VoidCallback onSkip;
  final bool showSkip;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: Column(
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: onBack,
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.06)
                        : Colors.white.withValues(alpha: 0.70),
                    border: Border.all(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.08)
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                  ),
                  child: Icon(
                    Icons.arrow_back_rounded,
                    size: 22,
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.92)
                        : SahayakColors.textPrimary(false),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Center(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.06)
                              : Colors.white.withValues(alpha: 0.65),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.08)
                                : Colors.black.withValues(alpha: 0.05),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: accent,
                                boxShadow: [
                                  BoxShadow(
                                    color: accent.withValues(alpha: 0.4),
                                    blurRadius: 6,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 250),
                              transitionBuilder: (child, anim) =>
                                  FadeTransition(
                                opacity: anim,
                                child: SlideTransition(
                                  position: Tween<Offset>(
                                    begin: const Offset(0, 0.3),
                                    end: Offset.zero,
                                  ).animate(anim),
                                  child: child,
                                ),
                              ),
                              child: Text(
                                'Step ${currentPage + 1} of 4',
                                key: ValueKey(currentPage),
                                style: Theme.of(context)
                                    .textTheme
                                    .labelMedium
                                    ?.copyWith(
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 0.3,
                                    ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              if (showSkip)
                GestureDetector(
                  onTap: onSkip,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.04)
                          : Colors.black.withValues(alpha: 0.03),
                    ),
                    child: Text(
                      'Skip',
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: SahayakColors.textMuted(isDark),
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ),
                )
              else
                const SizedBox(width: 52),
            ],
          ),
          const SizedBox(height: 14),
          _AnimatedProgressBar(
            current: currentPage,
            total: 4,
            accent: accent,
            isDark: isDark,
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }
}

class _AnimatedProgressBar extends StatelessWidget {
  const _AnimatedProgressBar({
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
    return Container(
      height: 6,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: isDark
            ? Colors.white.withValues(alpha: 0.05)
            : Colors.black.withValues(alpha: 0.04),
        boxShadow: [
          BoxShadow(
            color: accent.withValues(alpha: isDark ? 0.14 : 0.10),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final totalWidth = constraints.maxWidth;
          final filledWidth = totalWidth * ((current + 1) / total);

          return Stack(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 500),
                curve: Curves.easeInOutCubic,
                width: filledWidth,
                height: 6,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(999),
                  gradient: LinearGradient(
                    colors: [
                      accent,
                      SahayakColors.saffron.withValues(alpha: 0.9),
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: accent.withValues(alpha: 0.35),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
              AnimatedPositioned(
                duration: const Duration(milliseconds: 500),
                curve: Curves.easeInOutCubic,
                left: filledWidth - 6,
                top: 0,
                child: Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: accent.withValues(alpha: 0.6),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
