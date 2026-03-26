import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import '../../../core/network/socket_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/immersive_shell.dart';
import '../../../shared/widgets/offline_banner.dart';
import '../bloc/dashboard_bloc.dart';
import 'widgets/activity_feed.dart';
import 'widgets/location_map_card.dart';
import 'widgets/quick_actions.dart';
import 'widgets/stat_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    final pid = StorageService.instance.activeProfileId;
    context.read<DashboardBloc>().add(DashboardLoad(elderlyProfileId: pid));

    if (pid != null) {
      SocketService.instance.joinDashboard(pid);
      SocketService.instance.on('sos_triggered', _onSosTrigger);
    }
  }

  @override
  void dispose() {
    SocketService.instance.off('sos_triggered', _onSosTrigger);
    super.dispose();
  }

  void _onSosTrigger(dynamic _) {
    if (mounted) context.go('/sos-trigger');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return OfflineBanner(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: DecoratedBox(
          decoration: const BoxDecoration(),
          child: ImmersiveShell(
            primaryGlow: Theme.of(context).colorScheme.primary,
            secondaryGlow: Theme.of(context).colorScheme.secondary,
            child: RefreshIndicator(
              onRefresh: () async {
                context.read<DashboardBloc>().add(const DashboardRefresh());
                await Future<void>.delayed(const Duration(milliseconds: 900));
              },
              child: BlocBuilder<DashboardBloc, DashboardState>(
                builder: (context, state) {
                  if (state is DashboardInitial || state is DashboardLoading) {
                    return _ShimmerHome(isDark: isDark);
                  }

                  if (state is DashboardError && state is! DashboardCached) {
                    return _ErrorState(message: state.message);
                  }

                  if (state is DashboardLoaded) {
                    return _DashboardBody(data: state.data);
                  }

                  return const SizedBox.shrink();
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DashboardBody extends StatelessWidget {
  const _DashboardBody({required this.data});

  final DashboardData data;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return CustomScrollView(
      physics: const BouncingScrollPhysics(
        parent: AlwaysScrollableScrollPhysics(),
      ),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 110),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _TopBar(profile: data.profile),
                const SizedBox(height: 20),
                _HeaderIntro(data: data),
                const SizedBox(height: 18),
                _HeroStatusCard(data: data)
                    .animate()
                    .fadeIn(duration: 420.ms)
                    .slideY(
                      begin: 0.08,
                      end: 0,
                      duration: 420.ms,
                      curve: Curves.easeOutCubic,
                    ),
                const SizedBox(height: 18),
                const QuickActions()
                    .animate()
                    .fadeIn(delay: 80.ms, duration: 420.ms)
                    .slideY(begin: 0.06, end: 0),
                const SizedBox(height: 22),
                _SectionHeader(
                  title: 'Today',
                  subtitle: _buildSummaryText(data),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 148,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      StatCard(
                        title: 'Medicines',
                        value:
                            '${data.stats.medicationsToday.taken}/${data.stats.medicationsToday.total}',
                        subtitle: data.stats.medicationsToday.pending > 0
                            ? '${data.stats.medicationsToday.pending} pending'
                            : 'All on track',
                        icon: Icons.medication_rounded,
                        accent: data.stats.medicationsToday.missed > 0
                            ? SahayakColors.medicineAmber
                            : SahayakColors.successGreen,
                        index: 0,
                        onTap: () => context.go('/medications'),
                      ),
                      StatCard(
                        title: 'SOS',
                        value: '${data.stats.sosEventsThisWeek}',
                        subtitle: data.stats.sosEventsThisWeek == 0
                            ? 'No alerts this week'
                            : 'Needs review',
                        icon: Icons.health_and_safety_rounded,
                        accent: data.stats.sosEventsThisWeek == 0
                            ? SahayakColors.successGreen
                            : SahayakColors.sosRed,
                        index: 1,
                        onTap: () => context.go('/sos'),
                      ),
                      StatCard(
                        title: 'Voice',
                        value: '${data.stats.dailyUsage}',
                        subtitle: 'Used today',
                        icon: Icons.mic_rounded,
                        accent: SahayakColors.voiceViolet,
                        index: 2,
                        onTap: () => context.go('/voice'),
                      ),
                      StatCard(
                        title: 'Battery',
                        value: data.profile.batteryLevel != null
                            ? '${data.profile.batteryLevel}%'
                            : '--',
                        subtitle: _batteryLabel(data.profile.batteryLevel),
                        icon: _batteryIcon(data.profile.batteryLevel),
                        accent: _batteryAccent(data.profile.batteryLevel),
                        index: 3,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),
                _SectionHeader(
                  title: 'Location',
                  subtitle: data.location.address ?? 'Last known device location',
                ),
                const SizedBox(height: 12),
                if (data.location.hasLocation)
                  const SizedBox()
                else
                  AccentGlassCard(
                    accent: SahayakColors.locationTeal,
                    child: Text(
                      'Location is not available yet.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                if (data.location.hasLocation) LocationMapCard(location: data.location),
                const SizedBox(height: 22),
                _SectionHeader(
                  title: 'Recent activity',
                  subtitle: isDark
                      ? 'Voice, medicine, and SOS events'
                      : 'Latest device and care activity',
                ),
                const SizedBox(height: 12),
                ActivityFeed(activities: data.recentActivity),
              ],
            ),
          ),
        ),
      ],
    );
  }

  static String _buildSummaryText(DashboardData data) {
    if (data.stats.medicationsToday.total == 0) {
      return 'No medication reminders yet';
    }

    if (data.stats.medicationsToday.pending == 0 &&
        data.stats.medicationsToday.missed == 0) {
      return 'Everything looks calm and on time';
    }

    return '${data.stats.medicationsToday.pending} task(s) still need attention';
  }

  static Color _batteryAccent(int? level) {
    if (level == null) return SahayakColors.deviceBlue;
    if (level < 20) return SahayakColors.sosRed;
    if (level < 60) return SahayakColors.medicineAmber;
    return SahayakColors.successGreen;
  }

  static String _batteryLabel(int? level) {
    if (level == null) return 'Unavailable';
    if (level < 20) return 'Low battery';
    if (level < 60) return 'Needs charging soon';
    return 'Healthy';
  }

  static IconData _batteryIcon(int? level) {
    if (level == null) return Icons.battery_unknown_rounded;
    if (level < 20) return Icons.battery_alert_rounded;
    if (level < 60) return Icons.battery_4_bar_rounded;
    return Icons.battery_full_rounded;
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.profile});

  final ElderlyProfile profile;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Sahayak OS',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.2,
                    ),
              ),
              const SizedBox(height: 2),
              Text(
                profile.name,
                style: Theme.of(context).textTheme.displaySmall,
              ),
            ],
          ),
        ),
        _HeaderIcon(
          icon: Icons.mic_rounded,
          accent: SahayakColors.voiceViolet,
          onTap: () => context.go('/voice'),
        ),
        const SizedBox(width: 10),
        _HeaderIcon(
          icon: Icons.settings_rounded,
          accent: Theme.of(context).colorScheme.primary,
          onTap: () => context.go('/settings'),
        ),
      ],
    );
  }
}

class _HeaderIntro extends StatelessWidget {
  const _HeaderIntro({required this.data});

  final DashboardData data;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final tone = data.stats.medicationsToday.pending == 0 &&
            data.stats.sosEventsThisWeek == 0
        ? 'A calm, clear view of today.'
        : 'Today needs a little attention.';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          tone,
          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                height: 1.02,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Voice, medicines, location, and emergency readiness are all visible in one place.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: SahayakColors.textMuted(isDark),
                height: 1.55,
              ),
        ),
      ],
    );
  }
}

class _HeaderIcon extends StatelessWidget {
  const _HeaderIcon({
    required this.icon,
    required this.accent,
    required this.onTap,
  });

  final IconData icon;
  final Color accent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () {
          HapticFeedback.lightImpact();
          onTap();
        },
        child: Ink(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: isDark
                ? accent.withValues(alpha: 0.12)
                : accent.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: accent.withValues(alpha: 0.18),
            ),
          ),
          child: Icon(icon, color: accent, size: 24),
        ),
      ),
    );
  }
}

class _HeroStatusCard extends StatelessWidget {
  const _HeroStatusCard({required this.data});

  final DashboardData data;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;
    final status = _presenceState(data.profile.lastActiveAt);
    final statusColor = switch (status) {
      _PresenceState.online => SahayakColors.successGreen,
      _PresenceState.recent => SahayakColors.medicineAmber,
      _PresenceState.offline => SahayakColors.sosRed,
    };

    return AccentGlassCard(
      accent: accent,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  gradient: SahayakColors.primaryGradient(
                    accent,
                    Theme.of(context).colorScheme.secondary,
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                alignment: Alignment.center,
                child: Text(
                  _initials(data.profile.name),
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      data.profile.name,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    if (data.profile.cityState.isNotEmpty)
                      Text(
                        data.profile.cityState,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: SahayakColors.textMuted(isDark),
                            ),
                      ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: statusColor.withValues(alpha: 0.18)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: statusColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _presenceLabel(status),
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: statusColor,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _MetaChip(
                icon: Icons.schedule_rounded,
                label: _lastSeenLabel(data.stats.lastActive),
                accent: SahayakColors.deviceBlue,
              ),
              _MetaChip(
                icon: _DashboardBody._batteryIcon(data.profile.batteryLevel),
                label: _DashboardBody._batteryLabel(data.profile.batteryLevel),
                accent: _DashboardBody._batteryAccent(data.profile.batteryLevel),
              ),
              _MetaChip(
                icon: Icons.location_on_rounded,
                label: data.location.address ?? 'Location unavailable',
                accent: SahayakColors.locationTeal,
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: _HeroActionButton(
                  label: 'Talk now',
                  icon: Icons.mic_rounded,
                  accent: accent,
                  onTap: () => context.go('/voice'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _HeroActionButton(
                  label: 'Open SOS',
                  icon: Icons.health_and_safety_rounded,
                  accent: SahayakColors.sosRed,
                  onTap: () => context.go('/sos-trigger'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  static _PresenceState _presenceState(DateTime? lastActive) {
    if (lastActive == null) return _PresenceState.offline;
    final diff = DateTime.now().difference(lastActive);
    if (diff.inMinutes < 15) return _PresenceState.online;
    if (diff.inHours < 4) return _PresenceState.recent;
    return _PresenceState.offline;
  }

  static String _presenceLabel(_PresenceState state) => switch (state) {
        _PresenceState.online => 'Online',
        _PresenceState.recent => 'Recent',
        _PresenceState.offline => 'Offline',
      };

  static String _lastSeenLabel(DateTime? lastActive) {
    if (lastActive == null) return 'Last seen unavailable';
    final diff = DateTime.now().difference(lastActive);
    if (diff.inMinutes < 1) return 'Seen just now';
    if (diff.inMinutes < 60) return 'Seen ${diff.inMinutes}m ago';
    if (diff.inHours < 24) return 'Seen ${diff.inHours}h ago';
    return 'Seen ${diff.inDays}d ago';
  }

  static String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty);
    return parts.take(2).map((p) => p[0].toUpperCase()).join();
  }
}

enum _PresenceState { online, recent, offline }

class _MetaChip extends StatelessWidget {
  const _MetaChip({
    required this.icon,
    required this.label,
    required this.accent,
  });

  final IconData icon;
  final String label;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      constraints: const BoxConstraints(minHeight: 44),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: accent.withValues(alpha: isDark ? 0.12 : 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: accent.withValues(alpha: 0.16)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: accent),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: SahayakColors.textPrimary(isDark),
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroActionButton extends StatelessWidget {
  const _HeroActionButton({
    required this.label,
    required this.icon,
    required this.accent,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final Color accent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () {
          HapticFeedback.mediumImpact();
          onTap();
        },
        child: Ink(
          height: 58,
          decoration: BoxDecoration(
            gradient: SahayakColors.primaryGradient(
              accent,
              accent.withValues(alpha: 0.72),
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: accent.withValues(alpha: 0.22),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Text(
                label,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: Colors.white,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.subtitle});

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

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: AccentGlassCard(
          accent: SahayakColors.warningOrange,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.cloud_off_rounded,
                size: 58,
                color: SahayakColors.warningOrange,
              ),
              const SizedBox(height: 12),
              Text(
                'Dashboard unavailable',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () {
                  HapticFeedback.lightImpact();
                  context.read<DashboardBloc>().add(const DashboardRefresh());
                },
                child: const Text('Try again'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShimmerHome extends StatelessWidget {
  const _ShimmerHome({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final baseColor =
        isDark ? const Color(0xFF1A1A2E) : const Color(0xFFE4E6F8);
    final highlight = isDark ? const Color(0xFF2A2A3E) : Colors.white;

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlight,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(18, 22, 18, 110),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _shimmerBox(width: 220, height: 26),
            const SizedBox(height: 6),
            _shimmerBox(width: 140, height: 18),
            const SizedBox(height: 18),
            _shimmerBox(width: double.infinity, height: 220),
            const SizedBox(height: 18),
            _shimmerBox(width: double.infinity, height: 84),
            const SizedBox(height: 22),
            _shimmerBox(width: 110, height: 20),
            const SizedBox(height: 12),
            SizedBox(
              height: 148,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemBuilder: (_, __) => _shimmerBox(width: 156, height: 148),
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemCount: 4,
              ),
            ),
            const SizedBox(height: 22),
            _shimmerBox(width: 100, height: 20),
            const SizedBox(height: 12),
            _shimmerBox(width: double.infinity, height: 220),
            const SizedBox(height: 22),
            _shimmerBox(width: 120, height: 20),
            const SizedBox(height: 12),
            _shimmerBox(width: double.infinity, height: 88),
            const SizedBox(height: 12),
            _shimmerBox(width: double.infinity, height: 88),
          ],
        ),
      ),
    );
  }

  Widget _shimmerBox({required double width, required double height}) =>
      Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
        ),
      );
}
