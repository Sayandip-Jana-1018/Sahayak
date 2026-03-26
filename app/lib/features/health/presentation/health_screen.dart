import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../core/services/storage_service.dart';
import '../../../core/theme/colors.dart';
import '../../../shared\models/models.dart';
import '../../../shared\widgets/glass_card.dart';
import '../../../shared\widgets/shimmer_loader.dart';
import '../bloc/health_bloc.dart';

class HealthScreen extends StatefulWidget {
  const HealthScreen({super.key});

  @override
  State<HealthScreen> createState() => _HealthScreenState();
}

class _HealthScreenState extends State<HealthScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<HealthBloc>().add(const HealthLoad());
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
          child: BlocBuilder<HealthBloc, HealthState>(
            builder: (context, state) {
              if (state is HealthInitial || state is HealthLoading) {
                return const ShimmerLoader(itemCount: 5);
              }

              if (state is HealthError) {
                return _HealthErrorState(message: state.message);
              }

              if (state is HealthLoaded) {
                return Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(18, 18, 18, 0),
                      child: _HealthTopBar(
                        noteCount: state.notes.length,
                        appointmentCount: state.appointments.length,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(18, 18, 18, 0),
                      child: GlassCard(
                        padding: const EdgeInsets.all(8),
                        child: TabBar(
                          controller: _tabController,
                          dividerColor: Colors.transparent,
                          indicator: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: SahayakColors.primaryGradient(
                              Theme.of(context).colorScheme.primary,
                              Theme.of(context).colorScheme.secondary,
                            ),
                          ),
                          labelColor: Colors.white,
                          unselectedLabelColor: SahayakColors.textMuted(isDark),
                          tabs: const [
                            Tab(text: 'Health notes'),
                            Tab(text: 'Appointments'),
                          ],
                        ),
                      ),
                    ),
                    Expanded(
                      child: TabBarView(
                        controller: _tabController,
                        children: [
                          _NotesTab(notes: state.notes),
                          _AppointmentsTab(appointments: state.appointments),
                        ],
                      ),
                    ),
                  ],
                );
              }

              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  }
}

class _HealthTopBar extends StatelessWidget {
  const _HealthTopBar({
    required this.noteCount,
    required this.appointmentCount,
  });

  final int noteCount;
  final int appointmentCount;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Health',
          style: Theme.of(context).textTheme.displaySmall,
        ),
        const SizedBox(height: 4),
        Text(
          '$noteCount notes • $appointmentCount appointments tracked',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: SahayakColors.textMuted(isDark),
              ),
        ),
      ],
    );
  }
}

class _NotesTab extends StatelessWidget {
  const _NotesTab({required this.notes});

  final List<HealthNote> notes;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (notes.isEmpty)
          const _EmptyState(
            icon: Icons.note_alt_outlined,
            title: 'कोई health note नहीं है',
            message: 'Symptoms, mood, या doctor instructions यहाँ save करें.',
          )
        else
          ListView.builder(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 110),
            itemCount: notes.length,
            itemBuilder: (context, index) {
              final note = notes[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GlassCard(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        DateFormat('d MMM yyyy • hh:mm a').format(note.createdAt),
                        style: Theme.of(context).textTheme.labelMedium,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        note.noteText,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ],
                  ),
                )
                    .animate()
                    .fadeIn(delay: (index * 50).ms, duration: 300.ms)
                    .slideY(begin: 0.04, end: 0),
              );
            },
          ),
        Positioned(
          right: 18,
          bottom: 18,
          child: FloatingActionButton.extended(
            onPressed: () => _showAddNoteSheet(context),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Add note'),
          ),
        ),
      ],
    );
  }

  void _showAddNoteSheet(BuildContext context) {
    final controller = TextEditingController();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(sheetContext).viewInsets.bottom,
          ),
          child: GlassCard(
            margin: const EdgeInsets.fromLTRB(16, 80, 16, 16),
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'New health note',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: controller,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    hintText: 'Symptoms, blood pressure, mood, ya doctor advice लिखें',
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () {
                    final text = controller.text.trim();
                    if (text.isEmpty) return;
                    HapticFeedback.mediumImpact();
                    context.read<HealthBloc>().add(HealthAddNote(text));
                    Navigator.pop(sheetContext);
                  },
                  child: const Text('Save note'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _AppointmentsTab extends StatelessWidget {
  const _AppointmentsTab({required this.appointments});

  final List<Appointment> appointments;

  @override
  Widget build(BuildContext context) {
    final sorted = [...appointments]
      ..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));

    return Stack(
      children: [
        if (sorted.isEmpty)
          const _EmptyState(
            icon: Icons.calendar_month_outlined,
            title: 'कोई appointment नहीं है',
            message: 'Doctor visits और follow-ups यहाँ organized दिखेंगे.',
          )
        else
          ListView.builder(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 110),
            itemCount: sorted.length,
            itemBuilder: (context, index) {
              final appointment = sorted[index];
              final isUpcoming = appointment.scheduledAt.isAfter(DateTime.now());
              final accent = isUpcoming
                  ? Theme.of(context).colorScheme.primary
                  : SahayakColors.textMuted(
                      Theme.of(context).brightness == Brightness.dark,
                    );

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: AccentGlassCard(
                  accent: accent,
                  child: Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: accent.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        alignment: Alignment.center,
                        child: Icon(
                          Icons.local_hospital_rounded,
                          color: accent,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              appointment.doctorName,
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            if ((appointment.specialty ?? '').isNotEmpty)
                              Text(
                                appointment.specialty!,
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            const SizedBox(height: 4),
                            Text(
                              DateFormat('d MMM yyyy • hh:mm a')
                                  .format(appointment.scheduledAt),
                              style: Theme.of(context).textTheme.labelMedium,
                            ),
                            if ((appointment.location ?? '').isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                appointment.location!,
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                )
                    .animate()
                    .fadeIn(delay: (index * 50).ms, duration: 300.ms)
                    .slideY(begin: 0.04, end: 0),
              );
            },
          ),
        Positioned(
          right: 18,
          bottom: 18,
          child: FloatingActionButton.extended(
            onPressed: () => _showAddAppointmentSheet(context),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Add appointment'),
          ),
        ),
      ],
    );
  }

  void _showAddAppointmentSheet(BuildContext context) {
    final doctorController = TextEditingController();
    final specialtyController = TextEditingController();
    final locationController = TextEditingController();
    DateTime selectedAt = DateTime.now().add(const Duration(days: 1));

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(sheetContext).viewInsets.bottom,
              ),
              child: GlassCard(
                margin: const EdgeInsets.fromLTRB(16, 60, 16, 16),
                padding: const EdgeInsets.all(22),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'New appointment',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: doctorController,
                      decoration: const InputDecoration(
                        hintText: 'Doctor name',
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: specialtyController,
                      decoration: const InputDecoration(
                        hintText: 'Specialty',
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: locationController,
                      decoration: const InputDecoration(
                        hintText: 'Hospital / clinic location',
                      ),
                    ),
                    const SizedBox(height: 12),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Scheduled time'),
                      subtitle: Text(
                        DateFormat('d MMM yyyy • hh:mm a').format(selectedAt),
                      ),
                      trailing: const Icon(Icons.edit_calendar_rounded),
                      onTap: () async {
                        final pickedDate = await showDatePicker(
                          context: context,
                          initialDate: selectedAt,
                          firstDate: DateTime.now().subtract(const Duration(days: 1)),
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (pickedDate == null || !context.mounted) return;

                        final pickedTime = await showTimePicker(
                          context: context,
                          initialTime: TimeOfDay.fromDateTime(selectedAt),
                        );
                        if (pickedTime == null) return;

                        setSheetState(() {
                          selectedAt = DateTime(
                            pickedDate.year,
                            pickedDate.month,
                            pickedDate.day,
                            pickedTime.hour,
                            pickedTime.minute,
                          );
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () {
                        final doctor = doctorController.text.trim();
                        if (doctor.isEmpty) return;

                        context.read<HealthBloc>().add(
                              HealthAddAppointment({
                                'elderlyProfileId': StorageService.instance.activeProfileId,
                                'doctorName': doctor,
                                'specialty': specialtyController.text.trim(),
                                'location': locationController.text.trim(),
                                'scheduledAt': selectedAt.toIso8601String(),
                              }),
                            );
                        Navigator.pop(sheetContext);
                      },
                      child: const Text('Save appointment'),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.message,
  });

  final IconData icon;
  final String title;
  final String message;

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
              Icon(icon, size: 52, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 14),
              Text(
                title,
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                message,
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

class _HealthErrorState extends StatelessWidget {
  const _HealthErrorState({required this.message});

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
                Icons.medical_information_outlined,
                size: 58,
                color: SahayakColors.warningOrange,
              ),
              const SizedBox(height: 12),
              Text(
                'Health data unavailable',
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
                  context.read<HealthBloc>().add(const HealthLoad());
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
