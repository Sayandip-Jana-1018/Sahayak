import 'package:flutter/material.dart';

import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/glass_card.dart';

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

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tell us about the elder',
              style: Theme.of(context).textTheme.displaySmall,
            ),
            const SizedBox(height: 8),
            Text(
              'We only ask for what is needed to personalize reminders, language, and safety support.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: SahayakColors.textMuted(isDark),
                  ),
            ),
            const SizedBox(height: 20),
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _FieldLabel(label: 'Full name'),
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
