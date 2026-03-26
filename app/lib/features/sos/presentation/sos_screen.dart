import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/shimmer_loader.dart';
import '../../../shared/widgets/sos_fab.dart';
import '../bloc/sos_bloc.dart';

class SosScreen extends StatefulWidget {
  const SosScreen({super.key});

  @override
  State<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> {
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    context.read<SosBloc>().add(const SosLoad());
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      floatingActionButton: const SosFab(),
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: SahayakColors.heroGlow(
            isDark,
            SahayakColors.sosRed,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 0),
                child: _SosTopBar(filter: _filter),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 0),
                child: _FilterRow(
                  selected: _filter,
                  onChanged: (value) => setState(() => _filter = value),
                ),
              ),
              Expanded(
                child: BlocBuilder<SosBloc, SosState>(
                  builder: (context, state) {
                    if (state is SosInitial || state is SosLoading) {
                      return const ShimmerLoader(itemCount: 4);
                    }

                    if (state is SosError) {
                      return _SosErrorState(message: state.message);
                    }

                    if (state is SosLoaded) {
                      final events = _applyFilter(state.events, _filter);
                      if (events.isEmpty) {
                        return const _EmptySosState();
                      }

                      return ListView.builder(
                        padding: const EdgeInsets.fromLTRB(18, 18, 18, 110),
                        itemCount: events.length,
                        itemBuilder: (context, index) => _SosHistoryCard(
                          event: events[index],
                          index: index,
                        ),
                      );
                    }

                    return const SizedBox.shrink();
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<SosEvent3> _applyFilter(List<SosEvent3> events, String filter) {
    if (filter == 'all') return events;
    if (filter == 'active') return events.where((event) => !event.isResolved).toList();
    if (filter == 'resolved') return events.where((event) => event.isResolved).toList();
    return events.where((event) => (event.triggerType ?? 'button') == filter).toList();
  }
}

class _SosTopBar extends StatelessWidget {
  const _SosTopBar({required this.filter});

  final String filter;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'SOS history',
          style: Theme.of(context).textTheme.displaySmall,
        ),
        const SizedBox(height: 4),
        Text(
          filter == 'active'
              ? 'Only unresolved emergency events'
              : 'Emergency timeline, triggers, and resolution status',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: SahayakColors.textMuted(isDark),
              ),
        ),
      ],
    );
  }
}

class _FilterRow extends StatelessWidget {
  const _FilterRow({
    required this.selected,
    required this.onChanged,
  });

  final String selected;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    const filters = [
      ('all', 'All'),
      ('active', 'Active'),
      ('resolved', 'Resolved'),
      ('voice', 'Voice'),
      ('shake', 'Shake'),
      ('button', 'Button'),
    ];

    return SizedBox(
      height: 52,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemBuilder: (_, index) {
          final item = filters[index];
          final isSelected = selected == item.$1;
          return ChoiceChip(
            label: Text(item.$2),
            selected: isSelected,
            onSelected: (_) => onChanged(item.$1),
            selectedColor: SahayakColors.sosRed.withValues(alpha: 0.14),
            side: BorderSide(
              color: isSelected
                  ? SahayakColors.sosRed
                  : Colors.transparent,
            ),
            labelStyle: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: isSelected ? SahayakColors.sosRed : null,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                ),
          );
        },
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemCount: filters.length,
      ),
    );
  }
}

class _SosHistoryCard extends StatelessWidget {
  const _SosHistoryCard({
    required this.event,
    required this.index,
  });

  final SosEvent3 event;
  final int index;

  @override
  Widget build(BuildContext context) {
    final accent = _severityColor(event.severity);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AccentGlassCard(
        accent: accent,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    _triggerIcon(event.triggerType),
                    color: accent,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _triggerLabel(event.triggerType),
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        DateFormat('d MMM yyyy • hh:mm a').format(event.triggeredAt),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                _StatusBadge(
                  label: event.isResolved ? 'Resolved' : event.severity.toUpperCase(),
                  accent: event.isResolved ? SahayakColors.successGreen : accent,
                ),
              ],
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _InfoPill(
                  icon: Icons.place_rounded,
                  label: event.locationLat != null && event.locationLng != null
                      ? '${event.locationLat!.toStringAsFixed(3)}, ${event.locationLng!.toStringAsFixed(3)}'
                      : 'Location unavailable',
                ),
                _InfoPill(
                  icon: Icons.timer_outlined,
                  label: event.isResolved
                      ? 'Resolved at ${DateFormat('hh:mm a').format(event.resolvedAt!)}'
                      : 'Awaiting family acknowledgement',
                ),
              ],
            ),
            if (!event.isResolved) ...[
              const SizedBox(height: 14),
              FilledButton.icon(
                onPressed: () {
                  HapticFeedback.mediumImpact();
                  context.read<SosBloc>().add(SosResolve(event.id));
                },
                icon: const Icon(Icons.check_circle_outline_rounded),
                label: const Text('Mark as okay'),
              ),
            ],
          ],
        ),
      )
          .animate()
          .fadeIn(delay: (index * 50).ms, duration: 300.ms)
          .slideY(begin: 0.05, end: 0),
    );
  }

  static Color _severityColor(String severity) => switch (severity) {
        'critical' => SahayakColors.sosRed,
        'high' => SahayakColors.sosPulse,
        'medium' => SahayakColors.medicineAmber,
        _ => SahayakColors.deviceBlue,
      };

  static IconData _triggerIcon(String? type) => switch (type) {
        'voice' => Icons.mic_rounded,
        'shake' => Icons.vibration_rounded,
        'fall' => Icons.personal_injury_rounded,
        _ => Icons.health_and_safety_rounded,
      };

  static String _triggerLabel(String? type) => switch (type) {
        'voice' => 'Voice-triggered SOS',
        'shake' => 'Shake-triggered SOS',
        'fall' => 'Fall-triggered SOS',
        _ => 'Manual SOS',
      };
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({
    required this.label,
    required this.accent,
  });

  final String label;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: accent.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: accent.withValues(alpha: 0.18)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: accent,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class _InfoPill extends StatelessWidget {
  const _InfoPill({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.05)
            : Colors.black.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.black.withValues(alpha: 0.06),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

class _EmptySosState extends StatelessWidget {
  const _EmptySosState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: GlassCard(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.shield_outlined,
                size: 56,
                color: SahayakColors.successGreen,
              ),
              const SizedBox(height: 16),
              Text(
                'No SOS events right now',
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'This timeline will show every alert, trigger type, and resolution update.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SosErrorState extends StatelessWidget {
  const _SosErrorState({required this.message});

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
                size: 56,
                color: SahayakColors.warningOrange,
              ),
              const SizedBox(height: 12),
              Text(
                'SOS history unavailable',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                message,
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () {
                  HapticFeedback.lightImpact();
                  context.read<SosBloc>().add(const SosLoad());
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
