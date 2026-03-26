import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/services/storage_service.dart';
import '../../../core/theme/color_scheme.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/theme_cubit.dart';
import '../../../core/theme/typography.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../bloc/settings_bloc.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final profile = StorageService.instance.cachedProfile;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: SahayakColors.heroGlow(
            isDark,
            Theme.of(context).colorScheme.primary,
          ),
        ),
        child: SafeArea(
          child: BlocBuilder<SettingsBloc, SettingsState>(
            builder: (context, state) {
              return ListView(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 120),
                children: [
                  _SettingsTopBar(profileName: profile?.name ?? 'Sahayak'),
                  const SizedBox(height: 18),
                  _ProfileHero(profileName: profile?.name ?? 'Profile unavailable'),
                  const SizedBox(height: 18),
                  _SectionHeader(
                    title: 'Appearance',
                    subtitle: 'Theme, रंग, और elder-friendly font sizing',
                  ),
                  const SizedBox(height: 12),
                  _ToggleCard(
                    title: 'Dark mode',
                    subtitle: state.isDark
                        ? 'Low-light use के लिए आसान'
                        : 'दिन में warm light mode',
                    value: state.isDark,
                    icon: state.isDark
                        ? Icons.dark_mode_rounded
                        : Icons.light_mode_rounded,
                    onChanged: (_) {
                      HapticFeedback.lightImpact();
                      context.read<SettingsBloc>().add(ToggleDarkMode());
                      context.read<ThemeCubit>().toggleDark();
                    },
                  ),
                  const SizedBox(height: 12),
                  GlassCard(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Color theme',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Web और mobile दोनों के साथ synced visual personality',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: SahayakColors.textMuted(isDark),
                              ),
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: SahayakColorTheme.values.map((theme) {
                            final isSelected = state.colorTheme == theme;
                            return GestureDetector(
                              onTap: () {
                                HapticFeedback.lightImpact();
                                context.read<SettingsBloc>().add(SetColorTheme(theme));
                                context.read<ThemeCubit>().setColorTheme(theme);
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 220),
                                width: 56,
                                height: 56,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: LinearGradient(
                                    colors: [theme.accent1, theme.accent2],
                                  ),
                                  border: Border.all(
                                    color: isSelected
                                        ? Colors.white
                                        : Colors.white.withValues(alpha: 0.0),
                                    width: 3,
                                  ),
                                  boxShadow: [
                                    if (isSelected)
                                      BoxShadow(
                                        color: theme.accent1.withValues(alpha: 0.32),
                                        blurRadius: 20,
                                        offset: const Offset(0, 10),
                                      ),
                                  ],
                                ),
                                child: isSelected
                                    ? const Icon(
                                        Icons.check_rounded,
                                        color: Colors.white,
                                      )
                                    : null,
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  GlassCard(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Font size',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Sahayak सुरक्षित रखता है',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                fontSize: state.fontScale.bodySize,
                              ),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: FontScale.values.map((fontScale) {
                            final isSelected = state.fontScale == fontScale;
                            final label = switch (fontScale) {
                              FontScale.normal => 'A',
                              FontScale.large => 'A+',
                              FontScale.xlarge => 'A++',
                            };
                            return Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(18),
                                  onTap: () {
                                    HapticFeedback.lightImpact();
                                    context.read<SettingsBloc>().add(SetFontScale(fontScale));
                                    context.read<ThemeCubit>().setFontScale(fontScale);
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 220),
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? Theme.of(context)
                                              .colorScheme
                                              .primary
                                              .withValues(alpha: 0.14)
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(18),
                                      border: Border.all(
                                        color: isSelected
                                            ? Theme.of(context).colorScheme.primary
                                            : SahayakColors.glassBorder(isDark),
                                      ),
                                    ),
                                    child: Column(
                                      children: [
                                        Text(
                                          label,
                                          style: TextStyle(
                                            fontSize: fontScale.titleSize,
                                            fontWeight: FontWeight.w800,
                                            color: isSelected
                                                ? Theme.of(context).colorScheme.primary
                                                : null,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          fontScale.name,
                                          style: Theme.of(context).textTheme.labelMedium,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  _SectionHeader(
                    title: 'Language',
                    subtitle: 'UI language और voice preference अलग-अलग बदले जा सकते हैं',
                  ),
                  const SizedBox(height: 12),
                  GlassCard(
                    padding: const EdgeInsets.all(18),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: const [
                        _LanguageChip(code: 'hi', label: 'हिंदी'),
                        _LanguageChip(code: 'en', label: 'English'),
                        _LanguageChip(code: 'ta', label: 'தமிழ்'),
                        _LanguageChip(code: 'bn', label: 'বাংলা'),
                        _LanguageChip(code: 'mr', label: 'मराठी'),
                        _LanguageChip(code: 'te', label: 'తెలుగు'),
                        _LanguageChip(code: 'kn', label: 'ಕನ್ನಡ'),
                        _LanguageChip(code: 'gu', label: 'ગુજરાતી'),
                        _LanguageChip(code: 'pa', label: 'ਪੰਜਾਬੀ'),
                        _LanguageChip(code: 'ml', label: 'മലയാളം'),
                        _LanguageChip(code: 'ur', label: 'اردو'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  _SectionHeader(
                    title: 'Device and account',
                    subtitle: 'Heartbeat, profile, और security actions',
                  ),
                  const SizedBox(height: 12),
                  GlassCard(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      children: [
                        _InfoRow(
                          icon: Icons.person_outline_rounded,
                          label: 'Active elder profile',
                          value: profile?.name ?? 'Not selected',
                        ),
                        const Divider(height: 24),
                        _InfoRow(
                          icon: Icons.phone_android_rounded,
                          label: 'App mode',
                          value: 'Elder-first experience',
                        ),
                        const Divider(height: 24),
                        _InfoRow(
                          icon: Icons.location_on_outlined,
                          label: 'Primary language',
                          value: profile?.primaryLanguage ?? state.language.toUpperCase(),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  AccentGlassCard(
                    accent: SahayakColors.sosRed,
                    onTap: () {
                      HapticFeedback.mediumImpact();
                      context.read<AuthBloc>().add(const AuthSignOutRequested());
                    },
                    child: Row(
                      children: [
                        const Icon(
                          Icons.logout_rounded,
                          color: SahayakColors.sosRed,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Logout',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  color: SahayakColors.sosRed,
                                ),
                          ),
                        ),
                        const Icon(
                          Icons.arrow_forward_rounded,
                          color: SahayakColors.sosRed,
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _SettingsTopBar extends StatelessWidget {
  const _SettingsTopBar({required this.profileName});

  final String profileName;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Settings',
          style: Theme.of(context).textTheme.displaySmall,
        ),
        const SizedBox(height: 4),
        Text(
          '$profileName के लिए appearance और preferences',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: SahayakColors.textMuted(isDark),
              ),
        ),
      ],
    );
  }
}

class _ProfileHero extends StatelessWidget {
  const _ProfileHero({required this.profileName});

  final String profileName;

  @override
  Widget build(BuildContext context) {
    final accent = Theme.of(context).colorScheme.primary;

    return AccentGlassCard(
      accent: accent,
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              gradient: SahayakColors.primaryGradient(
                accent,
                SahayakColors.ashokaGreen,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            alignment: Alignment.center,
            child: Text(
              profileName.trim().isEmpty
                  ? 'S'
                  : profileName.trim().substring(0, 1).toUpperCase(),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: Colors.white,
                  ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profileName,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 6),
                Text(
                  'Calm, readable, and trusted elder-first interface',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    required this.subtitle,
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: SahayakColors.textMuted(isDark),
              ),
        ),
      ],
    );
  }
}

class _ToggleCard extends StatelessWidget {
  const _ToggleCard({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.icon,
    required this.onChanged,
  });

  final String title;
  final String subtitle;
  final bool value;
  final IconData icon;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(18),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class _LanguageChip extends StatelessWidget {
  const _LanguageChip({
    required this.code,
    required this.label,
  });

  final String code;
  final String label;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<SettingsBloc>().state;
    final isSelected = state.language == code;
    final accent = Theme.of(context).colorScheme.primary;

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) {
        HapticFeedback.lightImpact();
        context.read<SettingsBloc>().add(SetLanguage(code));
      },
      selectedColor: accent.withValues(alpha: 0.14),
      side: BorderSide(
        color: isSelected ? accent : Colors.transparent,
      ),
      labelStyle: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: isSelected ? accent : null,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Theme.of(context).colorScheme.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: SahayakColors.textMuted(isDark),
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
