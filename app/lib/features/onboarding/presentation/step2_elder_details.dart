import 'package:flutter/material.dart';
import '../../../shared/widgets/glass_card.dart';

class Step2ElderDetails extends StatefulWidget {
  const Step2ElderDetails({super.key, required this.onNext});

  final void Function(
    String name,
    int?   age,
    String? city,
    String? state,
    String? phone,
    String? relationship,
  ) onNext;

  @override
  State<Step2ElderDetails> createState() => _Step2State();
}

class _Step2State extends State<Step2ElderDetails> {
  final _formKey    = GlobalKey<FormState>();
  final _nameCtrl   = TextEditingController();
  final _ageCtrl    = TextEditingController();
  final _cityCtrl   = TextEditingController();
  final _stateCtrl  = TextEditingController();
  final _phoneCtrl  = TextEditingController();
  String? _relationship = 'Son/Daughter';

  static const _relationships = [
    'Son/Daughter', 'Spouse', 'Sibling', 'Grandchild', 'Caregiver', 'Other'
  ];

  @override
  void dispose() {
    _nameCtrl.dispose(); _ageCtrl.dispose(); _cityCtrl.dispose();
    _stateCtrl.dispose(); _phoneCtrl.dispose();
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
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('बुजुर्ग की जानकारी',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 4),
            Text('जिनकी देखभाल करनी है उनकी जानकारी दें',
                style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 24),

            // Row 1: Name + Age
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextFormField(
                    controller: _nameCtrl,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(hintText: 'पूरा नाम *'),
                    validator: (v) =>
                        (v?.trim().isEmpty ?? true) ? 'नाम आवश्यक है' : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _ageCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(hintText: 'आयु'),
                    validator: (v) {
                      if (v == null || v.isEmpty) return null;
                      final age = int.tryParse(v);
                      if (age == null || age < 40 || age > 120)
                        return '40-120';
                      return null;
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Row 2: City + State
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _cityCtrl,
                    decoration: const InputDecoration(hintText: 'शहर / City'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _stateCtrl,
                    decoration: const InputDecoration(hintText: 'राज्य / State'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Phone
            TextFormField(
              controller:   _phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                hintText:   'मोबाइल नंबर (10 अंक)',
                prefixIcon: Icon(Icons.phone_rounded, size: 22),
                prefixText: '+91 ',
              ),
              validator: (v) {
                if (v == null || v.isEmpty) return null;
                if (v.length != 10) return '10 अंक चाहिए';
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Relationship dropdown
            DropdownButtonFormField<String>(
              value: _relationship,
              decoration: const InputDecoration(
                hintText:   'रिश्ता / Relationship',
                prefixIcon: Icon(Icons.people_outline_rounded, size: 22),
              ),
              items: _relationships
                  .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                  .toList(),
              onChanged: (v) => setState(() => _relationship = v),
            ),
            const SizedBox(height: 32),

            FilledButton(
              onPressed: _submit,
              child: const Text('आगे बढ़ें →'),
            ),
          ],
        ),
      ),
    );
  }
}
