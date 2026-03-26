import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/network/api_client.dart';
import '../../../core/config/api_config.dart';
import '../../../shared/models/models.dart';

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
      final res = await ApiClient.instance.get(ApiConfig.onboardingStatus);
      final data = res.data as Map<String, dynamic>;
      final list = (data['profiles'] as List?) ?? [];
      if (mounted) {
        setState(() {
          _profiles = list
              .map((e) => ElderlyProfile.fromJson(e as Map<String, dynamic>))
              .toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _selectProfile(ElderlyProfile profile) {
    HapticFeedback.mediumImpact();
    AuthService.instance.setActiveProfile(profile.id);
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final isDark  = Theme.of(context).brightness == Brightness.dark;
    final accent  = Theme.of(context).colorScheme.primary;

    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end:   Alignment.bottomCenter,
                colors: isDark
                    ? [SahayakColors.darkBg, SahayakColors.darkSurface]
                    : [SahayakColors.lightBg, SahayakColors.lightElevated],
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  Text('किसके लिए?',
                      style: Theme.of(context).textTheme.displaySmall)
                      .animate().fadeIn(duration: 400.ms)
                      .slideX(begin: -0.2, end: 0, duration: 400.ms),
                  const SizedBox(height: 4),
                  Text('जिस बुजुर्ग की देखभाल करनी है उन्हें चुनें',
                      style: Theme.of(context).textTheme.bodyMedium)
                      .animate().fadeIn(delay: 100.ms, duration: 400.ms),
                  const SizedBox(height: 32),

                  if (_loading)
                    const Expanded(
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else if (_profiles.isEmpty)
                    Expanded(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.person_add_alt_1_rounded,
                                size: 64,
                                color: SahayakColors.textMuted(isDark)),
                            const SizedBox(height: 16),
                            Text('कोई प्रोफाइल नहीं मिली',
                                style: Theme.of(context).textTheme.titleMedium),
                            const SizedBox(height: 8),
                            FilledButton(
                              onPressed: () => context.go('/onboarding'),
                              child: const Text('नई प्रोफाइल जोड़ें'),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    Expanded(
                      child: GridView.builder(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount:     2,
                          crossAxisSpacing:   16,
                          mainAxisSpacing:    16,
                          childAspectRatio:   0.82,
                        ),
                        itemCount: _profiles.length,
                        itemBuilder: (context, i) =>
                            _ProfileCard(
                              profile:  _profiles[i],
                              onSelect: () => _selectProfile(_profiles[i]),
                              index:    i,
                            ),
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

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({
    required this.profile,
    required this.onSelect,
    required this.index,
  });

  final ElderlyProfile profile;
  final VoidCallback   onSelect;
  final int            index;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;
    final battery = profile.batteryLevel;

    return GlassCard(
      padding: const EdgeInsets.all(18),
      onTap:   onSelect,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar + active dot
          Stack(
            children: [
              CircleAvatar(
                radius: 32,
                backgroundColor: accent.withOpacity(0.15),
                child: Text(
                  profile.name.isNotEmpty ? profile.name[0].toUpperCase() : '?',
                  style: TextStyle(
                    fontSize:   28,
                    fontWeight: FontWeight.w700,
                    color:      accent,
                  ),
                ),
              ),
              if (profile.isActive)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width:  14,
                    height: 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: SahayakColors.successGreen,
                      border: Border.all(
                        color: SahayakColors.bg(isDark),
                        width: 2,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            profile.name,
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.w700),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          if (profile.ageYears != null)
            Text('${profile.ageYears} वर्ष',
                style: Theme.of(context).textTheme.bodySmall),
          if (profile.city != null)
            Text(profile.cityState,
                style: Theme.of(context).textTheme.bodySmall,
                maxLines: 1, overflow: TextOverflow.ellipsis),
          const Spacer(),
          // Battery
          if (battery != null)
            Row(
              children: [
                Icon(
                  battery > 60
                      ? Icons.battery_full_rounded
                      : battery > 20
                          ? Icons.battery_3_bar_rounded
                          : Icons.battery_alert_rounded,
                  size:  16,
                  color: battery > 20
                      ? SahayakColors.successGreen
                      : SahayakColors.sosRed,
                ),
                const SizedBox(width: 4),
                Text('$battery%',
                    style: const TextStyle(fontSize: 12)),
              ],
            ),
        ],
      ),
    ).animate().fadeIn(delay: (index * 80).ms, duration: 400.ms)
     .slideY(begin: 0.2, end: 0, delay: (index * 80).ms, duration: 400.ms,
         curve: Curves.easeOut);
  }
}
