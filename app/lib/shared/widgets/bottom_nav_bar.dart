import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/colors.dart';

class ScaffoldWithBottomNav extends StatelessWidget {
  const ScaffoldWithBottomNav({super.key, required this.child});

  final Widget child;

  static const _tabs = [
    _TabItem(icon: Icons.home_rounded, label: 'Home', path: '/home'),
    _TabItem(
      icon: Icons.medication_rounded,
      label: 'Meds',
      path: '/medications',
    ),
    _TabItem(icon: Icons.mic_rounded, label: 'Voice', path: '/voice'),
    _TabItem(
      icon: Icons.favorite_rounded,
      label: 'Health',
      path: '/health',
    ),
    _TabItem(
      icon: Icons.health_and_safety_rounded,
      label: 'SOS',
      path: '/sos',
    ),
  ];

  int _activeIndex(BuildContext context) {
    final loc = GoRouterState.of(context).uri.toString();
    for (int i = 0; i < _tabs.length; i++) {
      if (loc.startsWith(_tabs[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;
    final activeIndex = _activeIndex(context);

    return Scaffold(
      extendBody: true,
      body: child,
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
              child: Container(
                height: 86,
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xCC111122)
                      : const Color(0xE6FFFFFF),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(
                    color: SahayakColors.glassBorder(isDark),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.08),
                      blurRadius: 28,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  children: List.generate(_tabs.length, (index) {
                    final tab = _tabs[index];
                    final isActive = index == activeIndex;
                    final isVoice = tab.path == '/voice';
                    final isSos = tab.path == '/sos';
                    final activeColor = isSos
                        ? SahayakColors.sosRed
                        : isVoice
                            ? accent
                            : (index == 3
                                ? SahayakColors.ashokaGreen
                                : accent);

                    return Expanded(
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: () {
                          HapticFeedback.lightImpact();
                          context.go(tab.path);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 220),
                          curve: Curves.easeOutCubic,
                          transform: Matrix4.translationValues(
                            0,
                            isVoice ? -10 : 0,
                            0,
                          ),
                          padding: EdgeInsets.only(
                            top: isVoice ? 4 : 14,
                            bottom: 10,
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 220),
                                curve: Curves.easeOutCubic,
                                width: isVoice ? 58 : 46,
                                height: isVoice ? 58 : 46,
                                decoration: BoxDecoration(
                                  gradient: isVoice
                                      ? SahayakColors.primaryGradient(
                                          activeColor,
                                          Theme.of(context).colorScheme.secondary,
                                        )
                                      : null,
                                  color: !isVoice && isActive
                                      ? activeColor.withValues(alpha: 0.12)
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(
                                    isVoice ? 22 : 16,
                                  ),
                                  border: Border.all(
                                    color: isVoice
                                        ? activeColor.withValues(alpha: 0.22)
                                        : isActive
                                            ? activeColor.withValues(alpha: 0.22)
                                            : Colors.transparent,
                                  ),
                                  boxShadow: isVoice
                                      ? [
                                          BoxShadow(
                                            color: activeColor.withValues(alpha: 0.28),
                                            blurRadius: 18,
                                            offset: const Offset(0, 8),
                                          ),
                                        ]
                                      : null,
                                ),
                                child: Icon(
                                  tab.icon,
                                  size: isVoice ? 28 : 24,
                                  color: isVoice
                                      ? Colors.white
                                      : isActive
                                          ? activeColor
                                          : SahayakColors.textMuted(isDark),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                tab.label,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight:
                                      isActive || isVoice ? FontWeight.w700 : FontWeight.w500,
                                  color: isSos
                                      ? SahayakColors.sosRed
                                      : isActive
                                          ? activeColor
                                          : SahayakColors.textMuted(isDark),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _TabItem {
  const _TabItem({
    required this.icon,
    required this.label,
    required this.path,
  });

  final IconData icon;
  final String label;
  final String path;
}
