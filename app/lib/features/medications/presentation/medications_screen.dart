import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/colors.dart';
import '../../../core/theme/typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/shimmer_loader.dart';
import '../bloc/medication_bloc.dart';
import 'add_medication_sheet.dart';

class MedicationsScreen extends StatefulWidget {
  const MedicationsScreen({super.key});

  @override
  State<MedicationsScreen> createState() => _MedicationsScreenState();
}

class _MedicationsScreenState extends State<MedicationsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<MedicationBloc>().add(const MedicationLoad());
  }

  @override
  Widget build(BuildContext context) {
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
          child: BlocBuilder<MedicationBloc, MedicationState>(
            builder: (context, state) {
              if (state is MedicationLoading || state is MedicationInitial) {
                return const ShimmerLoader(itemCount: 6);
              }

              if (state is MedicationError) {
                return _MedicationErrorState(message: state.message);
              }

              if (state is MedicationLoaded) {
                return _MedicationBody(state: state);
              }

              return const SizedBox.shrink();
            },
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          HapticFeedback.mediumImpact();
          showModalBottomSheet<void>(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (_) => BlocProvider.value(
              value: context.read<MedicationBloc>(),
              child: const AddMedicationSheet(),
            ),
          );
        },
        icon: const Icon(Icons.add_rounded),
        label: const Text('नई दवा'),
      ),
    );
  }
}

class _MedicationBody extends StatelessWidget {
  const _MedicationBody({required this.state});

  final MedicationLoaded state;

  @override
  Widget build(BuildContext context) {
    final grouped = _groupByDayPart(state.medications);

    return RefreshIndicator(
      onRefresh: () async {
        context.read<MedicationBloc>().add(const MedicationLoad());
        await Future<void>.delayed(const Duration(milliseconds: 750));
      },
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _MedsTopBar(),
                  const SizedBox(height: 18),
                  _AdherenceHero(state: state)
                      .animate()
                      .fadeIn(duration: 360.ms)
                      .slideY(begin: 0.08, end: 0),
                  const SizedBox(height: 18),
                  _SectionHeader(
                    title: 'Today\'s schedule',
                    subtitle: _buildTodaySummary(state.medications),
                  ),
                  const SizedBox(height: 12),
                  if (state.medications.isEmpty)
                    const _EmptyMedicationsState()
                  else
                    ...grouped.entries.toList().asMap().entries.map(
                          (entry) => _MedicationGroup(
                            label: entry.value.key,
                            medications: entry.value.value,
                            animationIndex: entry.key,
                          ),
                        ),
                  const SizedBox(height: 18),
                  _SectionHeader(
                    title: 'Consistency',
                    subtitle: state.streakDays > 0
                        ? '${state.streakDays} दिन perfect चल रहा है'
                        : 'दैनिक routine stable रखने में मदद',
                  ),
                  const SizedBox(height: 12),
                  _WeeklyChart(state: state),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static String _buildTodaySummary(List<MedicationReminder> meds) {
    if (meds.isEmpty) return 'अभी तक कोई active दवा नहीं जोड़ी गई है';

    int taken = 0;
    int missed = 0;
    int pending = 0;
    for (final med in meds) {
      for (final slot in med.todaySchedule) {
        if (slot.isTaken) taken += 1;
        if (slot.isMissed) missed += 1;
        if (slot.isPending) pending += 1;
      }
    }

    if (missed > 0) return '$pending बाकी है, $missed miss हो चुकी हैं';
    if (pending > 0) return '$pending reminders अभी बाकी हैं';
    return '$taken reminders complete हो चुकी हैं';
  }

  static Map<String, List<MedicationReminder>> _groupByDayPart(
    List<MedicationReminder> medications,
  ) {
    const groups = <String, ({int start, int end})>{
      'सुबह': (start: 5, end: 11),
      'दोपहर': (start: 11, end: 16),
      'शाम': (start: 16, end: 20),
      'रात': (start: 20, end: 24),
    };

    final result = <String, List<MedicationReminder>>{
      for (final key in groups.keys) key: [],
    };

    for (final medication in medications) {
      final slot = medication.todaySchedule.isNotEmpty
          ? medication.todaySchedule.first
          : null;
      final hour = slot?.scheduledAt.hour
          ?? int.tryParse(
            (medication.reminderTimes.isNotEmpty ? medication.reminderTimes.first : '08:00')
                .split(':')
                .first,
          )
          ?? 8;

      final key = groups.entries.firstWhere(
        (entry) => hour >= entry.value.start && hour < entry.value.end,
        orElse: () => const MapEntry('सुबह', (start: 5, end: 11)),
      ).key;
      result[key]!.add(medication);
    }

    result.removeWhere((_, value) => value.isEmpty);
    return result;
  }
}

class _MedsTopBar extends StatelessWidget {
  const _MedsTopBar();

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
                'Medicines',
                style: Theme.of(context).textTheme.displaySmall,
              ),
              const SizedBox(height: 4),
              Text(
                'दवाई schedule, adherence, और quick actions',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: SahayakColors.textMuted(isDark),
                    ),
              ),
            ],
          ),
        ),
        GlassCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.document_scanner_outlined,
                size: 18,
                color: SahayakColors.medicineAmber,
              ),
              const SizedBox(width: 8),
              Text(
                'Scan',
                style: Theme.of(context).textTheme.labelMedium,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AdherenceHero extends StatelessWidget {
  const _AdherenceHero({required this.state});

  final MedicationLoaded state;

  @override
  Widget build(BuildContext context) {
    final accent = Theme.of(context).colorScheme.primary;
    final totalSlots = state.medications.fold<int>(
      0,
      (sum, med) => sum + med.todaySchedule.length,
    );
    final takenSlots = state.medications.fold<int>(
      0,
      (sum, med) => sum + med.todaySchedule.where((slot) => slot.isTaken).length,
    );
    final pendingSlots = state.medications.fold<int>(
      0,
      (sum, med) => sum + med.todaySchedule.where((slot) => slot.isPending).length,
    );
    final missedSlots = state.medications.fold<int>(
      0,
      (sum, med) => sum + med.todaySchedule.where((slot) => slot.isMissed).length,
    );

    return AccentGlassCard(
      accent: accent,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'आज की adherence',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${state.overallPercent}% weekly adherence',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: SahayakColors.primaryGradient(
                    SahayakColors.medicineAmber,
                    accent,
                  ),
                ),
                alignment: Alignment.center,
                child: Text(
                  '${state.streakDays}',
                  style: SahayakTypography.statNumber(32, Colors.white),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _HeroPill(
                label: 'Taken',
                value: '$takenSlots/$totalSlots',
                accent: SahayakColors.successGreen,
              ),
              _HeroPill(
                label: 'Pending',
                value: '$pendingSlots',
                accent: SahayakColors.medicineAmber,
              ),
              _HeroPill(
                label: 'Missed',
                value: '$missedSlots',
                accent: SahayakColors.sosRed,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroPill extends StatelessWidget {
  const _HeroPill({
    required this.label,
    required this.value,
    required this.accent,
  });

  final String label;
  final String value;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: accent.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: accent.withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(color: accent),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ],
      ),
    );
  }
}

class _MedicationGroup extends StatelessWidget {
  const _MedicationGroup({
    required this.label,
    required this.medications,
    required this.animationIndex,
  });

  final String label;
  final List<MedicationReminder> medications;
  final int animationIndex;

  @override
  Widget build(BuildContext context) {
    final accent = switch (label) {
      'सुबह' => SahayakColors.saffron,
      'दोपहर' => SahayakColors.medicineAmber,
      'शाम' => SahayakColors.voiceViolet,
      _ => SahayakColors.deviceBlue,
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 18, 4, 10),
          child: Row(
            children: [
              Icon(_iconForGroup(label), color: accent, size: 18),
              const SizedBox(width: 8),
              Text(label, style: Theme.of(context).textTheme.titleMedium),
            ],
          ),
        ),
        ...medications.asMap().entries.map(
              (entry) => _MedicationCard(
                medication: entry.value,
                index: (animationIndex * 4) + entry.key,
              ),
            ),
      ],
    );
  }

  static IconData _iconForGroup(String label) => switch (label) {
        'सुबह' => Icons.wb_sunny_rounded,
        'दोपहर' => Icons.brightness_5_rounded,
        'शाम' => Icons.wb_twilight_rounded,
        _ => Icons.nights_stay_rounded,
      };
}

class _MedicationCard extends StatelessWidget {
  const _MedicationCard({
    required this.medication,
    required this.index,
  });

  final MedicationReminder medication;
  final int index;

  @override
  Widget build(BuildContext context) {
    final statusColor = _statusColor(medication.todayStatus);
    final pendingSlots =
        medication.todaySchedule.where((slot) => slot.isPending).toList();
    final nextPending = pendingSlots.isNotEmpty ? pendingSlots.first : null;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Dismissible(
        key: ValueKey('${medication.id}-${medication.todayStatus}'),
        direction: nextPending != null
            ? DismissDirection.startToEnd
            : DismissDirection.endToStart,
        confirmDismiss: (direction) async {
          if (direction == DismissDirection.startToEnd && nextPending != null) {
            HapticFeedback.mediumImpact();
            context.read<MedicationBloc>().add(
                  MedicationMarkTaken(
                    reminderId: medication.id,
                    scheduledAt: nextPending.scheduledAt,
                  ),
                );
            return false;
          }

          return await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('दवा हटाएँ?'),
                  content: const Text('यह reminder हट जाएगा।'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('नहीं'),
                    ),
                    FilledButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text('हटाएँ'),
                    ),
                  ],
                ),
              ) ??
              false;
        },
        onDismissed: (_) {
          context.read<MedicationBloc>().add(MedicationDelete(medication.id));
        },
        background: _SwipeHint(
          color: SahayakColors.successGreen,
          icon: Icons.check_rounded,
          label: 'Taken',
          alignment: Alignment.centerLeft,
        ),
        secondaryBackground: const _SwipeHint(
          color: SahayakColors.sosRed,
          icon: Icons.delete_outline_rounded,
          label: 'Delete',
          alignment: Alignment.centerRight,
        ),
        child: AccentGlassCard(
          accent: statusColor,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      Icons.medication_rounded,
                      color: statusColor,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          medication.medicineName,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        if ((medication.dosage ?? '').isNotEmpty ||
                            (medication.frequency ?? '').isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              [
                                if ((medication.dosage ?? '').isNotEmpty) medication.dosage!,
                                if ((medication.frequency ?? '').isNotEmpty) medication.frequency!,
                              ].join(' • '),
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                      ],
                    ),
                  ),
                  _StatusBadge(
                    label: _statusLabel(medication.todayStatus),
                    accent: statusColor,
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: medication.todaySchedule.isEmpty
                    ? [
                        _ScheduleChip(
                          label: medication.reminderTimes.join(', '),
                          accent: statusColor,
                        ),
                      ]
                    : medication.todaySchedule
                        .map(
                          (slot) => _ScheduleChip(
                            label: '${slot.time} • ${_statusLabel(slot.status)}',
                            accent: _statusColor(slot.status),
                          ),
                        )
                        .toList(),
              ),
              if ((medication.instructions ?? '').isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  medication.instructions!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ],
          ),
        )
            .animate()
            .fadeIn(delay: (index * 40).ms, duration: 320.ms)
            .slideY(begin: 0.06, end: 0, delay: (index * 40).ms),
      ),
    );
  }

  static String _statusLabel(String? status) => switch (status) {
        'taken' => 'Taken',
        'missed' => 'Missed',
        'skipped' => 'Skipped',
        _ => 'Pending',
      };

  static Color _statusColor(String? status) => switch (status) {
        'taken' => SahayakColors.successGreen,
        'missed' => SahayakColors.sosRed,
        'skipped' => SahayakColors.deviceBlue,
        _ => SahayakColors.medicineAmber,
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

class _ScheduleChip extends StatelessWidget {
  const _ScheduleChip({
    required this.label,
    required this.accent,
  });

  final String label;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: accent.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: accent.withValues(alpha: 0.14)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: accent,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}

class _SwipeHint extends StatelessWidget {
  const _SwipeHint({
    required this.color,
    required this.icon,
    required this.label,
    required this.alignment,
  });

  final Color color;
  final IconData icon;
  final String label;
  final Alignment alignment;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(24),
      ),
      alignment: alignment,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}

class _WeeklyChart extends StatelessWidget {
  const _WeeklyChart({required this.state});

  final MedicationLoaded state;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final data = state.adherence;

    return GlassCard(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
      child: data.isEmpty
          ? Text(
              'Adherence data आते ही यहाँ weekly trend दिखेगा.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: SahayakColors.textMuted(isDark),
                  ),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Last 7 days',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    Text(
                      '${state.overallPercent}% overall',
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                SizedBox(
                  height: 200,
                  child: BarChart(
                    BarChartData(
                      alignment: BarChartAlignment.spaceAround,
                      maxY: 100,
                      gridData: FlGridData(
                        drawVerticalLine: false,
                        getDrawingHorizontalLine: (value) => FlLine(
                          color: SahayakColors.textMuted(isDark).withValues(alpha: 0.18),
                          strokeWidth: 1,
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 30,
                            getTitlesWidget: (value, _) => Text(
                              '${value.toInt()}',
                              style: Theme.of(context).textTheme.labelSmall,
                            ),
                          ),
                        ),
                        topTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        rightTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, _) {
                              final index = value.toInt();
                              if (index < 0 || index >= data.length) {
                                return const SizedBox.shrink();
                              }
                              return Padding(
                                padding: const EdgeInsets.only(top: 6),
                                child: Text(
                                  DateFormat('E').format(data[index].date),
                                  style: Theme.of(context).textTheme.labelSmall,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      barGroups: data.asMap().entries.map((entry) {
                        final day = entry.value;
                        final color = day.percent >= 80
                            ? SahayakColors.successGreen
                            : day.percent >= 50
                                ? SahayakColors.medicineAmber
                                : SahayakColors.sosRed;
                        return BarChartGroupData(
                          x: entry.key,
                          barRods: [
                            BarChartRodData(
                              toY: day.percent.toDouble(),
                              width: 18,
                              color: color,
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
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

class _EmptyMedicationsState extends StatelessWidget {
  const _EmptyMedicationsState();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(22),
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: SahayakColors.medicineAmber.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(22),
            ),
            alignment: Alignment.center,
            child: const Icon(
              Icons.medication_liquid_rounded,
              color: SahayakColors.medicineAmber,
              size: 38,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'अभी कोई दवा नहीं जोड़ी गई',
            style: Theme.of(context).textTheme.titleLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'नीचे से नई दवा जोड़ें ताकि reminder और adherence tracking शुरू हो सके.',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _MedicationErrorState extends StatelessWidget {
  const _MedicationErrorState({required this.message});

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
                'Medicines unavailable',
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
                  context.read<MedicationBloc>().add(const MedicationLoad());
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
