import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/api_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/glass_card.dart';

class ProfileSelectorScreen extends StatefulWidget {
  const ProfileSelectorScreen({super.key});

  @override
  State<ProfileSelectorScreen> createState() => _ProfileSelectorScreenState();
}

class _ProfileSelectorScreenState extends State<ProfileSelectorScreen> {
  List<ElderlyProfile> _profiles = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfiles();
  }

  Future<void> _fetchProfiles() async {
    try {
      final response = await ApiClient.instance.get(ApiConfig.onboardingStatus);
      final data = response.data as Map<String, dynamic>;
      final list = (data['profiles'] as List?) ?? [];

      if (mounted) {
        setState(() {
          _profiles = list
              .map((item) => ElderlyProfile.fromJson(item as Map<String, dynamic>))
              .toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  void _selectProfile(ElderlyProfile profile) {
    HapticFeedback.mediumImpact();
    AuthService.instance.setActiveProfile(profile.id);
    context.go('/home');
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
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AccentGlassCard(
                  accent: accent,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Choose an elder profile',
                        style: Theme.of(context).textTheme.displaySmall,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Select who you want to support right now. The dashboard, medicines, and SOS history will switch instantly.',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 18),
                      Row(
                        children: [
                          Expanded(
                            child: GlassButton(
                              label: 'Add new profile',
                              icon: Icons.person_add_alt_1_rounded,
                              onPressed: () => context.go('/onboarding'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 320.ms).slideY(begin: 0.08, end: 0),
                const SizedBox(height: 20),
                if (_loading)
                  const Expanded(
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (_profiles.isEmpty)
                  Expanded(
                    child: Center(
                      child: GlassCard(
                        padding: const EdgeInsets.all(28),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.elderly_woman_rounded,
                              size: 68,
                              color: accent,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No elder profiles found yet',
                              style: Theme.of(context).textTheme.headlineSmall,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'Create the first profile to start medicines, voice support, and SOS protection.',
                              style: Theme.of(context).textTheme.bodyMedium,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 20),
                            GlassButton(
                              label: 'Create first profile',
                              onPressed: () => context.go('/onboarding'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                else
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 0.82,
                      ),
                      itemCount: _profiles.length,
                      itemBuilder: (context, index) => _ProfileCard(
                        profile: _profiles[index],
                        onSelect: () => _selectProfile(_profiles[index]),
                        index: index,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({
    required this.profile,
    required this.onSelect,
    required this.index,
  });

  final ElderlyProfile profile;
  final VoidCallback onSelect;
  final int index;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;
    final battery = profile.batteryLevel;

    return GlassCard(
      padding: const EdgeInsets.all(18),
      onTap: onSelect,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  gradient: SahayakColors.primaryGradient(
                    accent,
                    SahayakColors.ashokaGreen,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: accent.withValues(alpha: 0.18),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Text(
                  profile.name.isNotEmpty ? profile.name[0].toUpperCase() : '?',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const Spacer(),
              Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: profile.isActive
                      ? SahayakColors.successGreen
                      : SahayakColors.textMuted(isDark),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            profile.name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 6),
          if (profile.ageYears != null)
            Text(
              '${profile.ageYears} years',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          if (profile.city != null)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                profile.cityState,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          const Spacer(),
          Row(
            children: [
              Expanded(
                child: Text(
                  profile.isActive ? 'Online' : 'Last synced earlier',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: profile.isActive
                            ? SahayakColors.successGreen
                            : SahayakColors.textMuted(isDark),
                      ),
                ),
              ),
              if (battery != null)
                Row(
                  children: [
                    Icon(
                      battery > 60
                          ? Icons.battery_full_rounded
                          : battery > 20
                              ? Icons.battery_3_bar_rounded
                              : Icons.battery_alert_rounded,
                      size: 18,
                      color: battery > 20
                          ? SahayakColors.successGreen
                          : SahayakColors.sosRed,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '$battery%',
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: (index * 80).ms, duration: 320.ms).slideY(
          begin: 0.12,
          end: 0,
          curve: Curves.easeOutCubic,
        );
  }
}
