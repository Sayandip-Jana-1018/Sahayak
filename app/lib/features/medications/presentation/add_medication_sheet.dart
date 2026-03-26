import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/services/storage_service.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/glass_card.dart';
import '../bloc/medication_bloc.dart';

class AddMedicationSheet extends StatefulWidget {
  const AddMedicationSheet({super.key});

  @override
  State<AddMedicationSheet> createState() => _AddMedicationSheetState();
}

class _AddMedicationSheetState extends State<AddMedicationSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _dosageCtrl = TextEditingController();
  final _instructionCtrl = TextEditingController();
  String _frequency = 'Once daily';
  final List<String> _times = ['08:00'];
  bool _submitting = false;

  static const _frequencies = [
    'Once daily',
    'Twice daily',
    'Thrice daily',
    'Every 8 hours',
    'Weekly',
    'As needed',
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _dosageCtrl.dispose();
    _instructionCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _submitting = true);
    HapticFeedback.mediumImpact();

    context.read<MedicationBloc>().add(
          MedicationAdd({
            'elderlyProfileId': StorageService.instance.activeProfileId,
            'medicineName': _nameCtrl.text.trim(),
            'dosage': _dosageCtrl.text.trim(),
            'frequency': _frequency,
            'reminderTimes': _times,
            'instructions': _instructionCtrl.text.trim(),
            'isActive': true,
          }),
        );

    if (mounted) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: GlassCard(
        margin: const EdgeInsets.fromLTRB(16, 52, 16, 16),
        padding: const EdgeInsets.all(22),
        child: Form(
          key: _formKey,
          child: ListView(
            shrinkWrap: true,
            children: [
              Center(
                child: Container(
                  width: 42,
                  height: 4,
                  decoration: BoxDecoration(
                    color: SahayakColors.textMuted(isDark).withValues(alpha: 0.24),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'नई दवा जोड़ें',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 6),
              Text(
                'Schedule, dosage, और reminder timing एक साथ save करें.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 18),
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(
                  hintText: 'दवा का नाम',
                  prefixIcon: Icon(Icons.medication_outlined),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'दवा का नाम ज़रूरी है';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _dosageCtrl,
                decoration: const InputDecoration(
                  hintText: 'Dose जैसे 500mg',
                  prefixIcon: Icon(Icons.straighten_rounded),
                ),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _frequency,
                decoration: const InputDecoration(
                  hintText: 'Frequency',
                  prefixIcon: Icon(Icons.repeat_rounded),
                ),
                items: _frequencies
                    .map((frequency) => DropdownMenuItem(
                          value: frequency,
                          child: Text(frequency),
                        ))
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _frequency = value);
                  }
                },
              ),
              const SizedBox(height: 12),
              _TimeSelector(
                times: _times,
                onAddTime: () async {
                  final picked = await showTimePicker(
                    context: context,
                    initialTime: const TimeOfDay(hour: 8, minute: 0),
                  );
                  if (picked == null) return;

                  final hh = picked.hour.toString().padLeft(2, '0');
                  final mm = picked.minute.toString().padLeft(2, '0');
                  final next = '$hh:$mm';
                  if (_times.contains(next)) return;

                  setState(() {
                    _times.add(next);
                    _times.sort();
                  });
                },
                onRemoveTime: (value) {
                  if (_times.length == 1) return;
                  setState(() => _times.remove(value));
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _instructionCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Instructions जैसे खाने के बाद',
                  prefixIcon: Icon(Icons.notes_rounded),
                ),
              ),
              const SizedBox(height: 20),
              GlassButton(
                label: 'Save medicine',
                icon: Icons.check_rounded,
                loading: _submitting,
                onPressed: _submitting ? null : _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TimeSelector extends StatelessWidget {
  const _TimeSelector({
    required this.times,
    required this.onAddTime,
    required this.onRemoveTime,
  });

  final List<String> times;
  final VoidCallback onAddTime;
  final ValueChanged<String> onRemoveTime;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Reminder time',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const Spacer(),
              TextButton.icon(
                onPressed: onAddTime,
                icon: const Icon(Icons.add_alarm_rounded),
                label: const Text('Add time'),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: times
                .map(
                  (time) => InputChip(
                    label: Text(time),
                    onDeleted: times.length > 1 ? () => onRemoveTime(time) : null,
                    deleteIconColor: SahayakColors.sosRed,
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}
