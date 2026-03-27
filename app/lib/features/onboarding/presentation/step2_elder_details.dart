import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../../core/theme/colors.dart';
import '../../../core/theme/typography.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/story_medallion.dart';

class Step2ElderDetails extends StatefulWidget {
  const Step2ElderDetails({super.key, required this.onNext});

  final void Function(
    String name,
    int? age,
    String? city,
    String? state,
    String? phone,
    String? relationship,
  ) onNext;

  @override
  State<Step2ElderDetails> createState() => _Step2ElderDetailsState();
}

class _Step2ElderDetailsState extends State<Step2ElderDetails> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _ageCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String? _relationship = 'Son / Daughter';

  static const _relationships = [
    'Son / Daughter',
    'Spouse',
    'Sibling',
    'Grandchild',
    'Caregiver',
    'Other',
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _ageCtrl.dispose();
    _cityCtrl.dispose();
    _stateCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    widget.onNext(
      _nameCtrl.text.trim(),
      int.tryParse(_ageCtrl.text.trim()),
      _cityCtrl.text.trim().isNotEmpty ? _cityCtrl.text.trim() : null,
      _stateCtrl.text.trim().isNotEmpty ? _stateCtrl.text.trim() : null,
      _phoneCtrl.text.trim().isNotEmpty ? _phoneCtrl.text.trim() : null,
      _relationship,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            StoryMedallion(
              accent: accent,
              secondaryAccent: SahayakColors.saffron,
              size: 126,
              compact: true,
            )
                .animate(onPlay: (controller) => controller.repeat(reverse: true))
                .moveY(begin: 0, end: -5, duration: 2800.ms),
            const SizedBox(height: 18),
            Text(
              'Tell us about the elder',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    fontFamily: SahayakTypography.displayFont,
                  ),
            ),
            const SizedBox(height: 8),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 310),
              child: Text(
                'A few details help Sahayak shape reminders, language, and safety support with care.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: SahayakColors.textMuted(isDark),
                      height: 1.5,
                    ),
              ),
            ),
            const SizedBox(height: 14),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 10,
              runSpacing: 10,
              children: [
                _StoryChip(
                  icon: Icons.favorite_rounded,
                  label: 'Personal care',
                  accent: accent,
                ),
                const _StoryChip(
                  icon: Icons.shield_outlined,
                  label: 'Safer setup',
                  accent: SahayakColors.ashokaGreen,
                ),
                const _StoryChip(
                  icon: Icons.translate_rounded,
                  label: 'Language aware',
                  accent: SahayakColors.voiceViolet,
                ),
              ],
            ),
            const SizedBox(height: 20),
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _FieldLabel(label: 'Full name'),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _nameCtrl,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(hintText: 'Enter the elder\'s name'),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Name is required';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const _FieldLabel(label: 'Age'),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _ageCtrl,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(hintText: '65'),
                              validator: (value) {
                                if (value == null || value.isEmpty) return null;
                                final age = int.tryParse(value);
                                if (age == null || age < 40 || age > 120) {
                                  return 'Use 40 to 120';
                                }
                                return null;
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const _FieldLabel(label: 'Relationship'),
                            const SizedBox(height: 8),
                            DropdownButtonFormField<String>(
                              initialValue: _relationship,
                              decoration: const InputDecoration(
                                hintText: 'Select relationship',
                              ),
                              items: _relationships
                                  .map(
                                    (value) => DropdownMenuItem<String>(
                                      value: value,
                                      child: Text(value),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (value) => setState(() => _relationship = value),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Location and contact',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'This helps with local language support, SOS, and medicine coordination.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: SahayakColors.textMuted(isDark),
                        ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const _FieldLabel(label: 'City'),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _cityCtrl,
                              decoration: const InputDecoration(hintText: 'Kolkata'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const _FieldLabel(label: 'State'),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _stateCtrl,
                              decoration: const InputDecoration(hintText: 'West Bengal'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  const _FieldLabel(label: 'Phone number'),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      hintText: '10-digit mobile number',
                      prefixText: '+91 ',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return null;
                      if (value.length != 10) return 'Enter 10 digits';
                      return null;
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            GlassButton(
              label: 'Continue',
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}

class _StoryChip extends StatelessWidget {
  const _StoryChip({
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
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: accent.withValues(alpha: isDark ? 0.10 : 0.08),
        border: Border.all(
          color: accent.withValues(alpha: isDark ? 0.22 : 0.14),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: accent),
          const SizedBox(width: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Text(
      label,
      style: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: SahayakColors.textMuted(isDark),
          ),
    );
  }
}
