import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../core/services/storage_service.dart';
import '../../../../core/services/upi_service.dart';
import '../../../../shared/widgets/glass_button.dart';
import '../../../../shared/widgets/glass_card.dart';

class PaymentHandoffSheet extends StatefulWidget {
  const PaymentHandoffSheet({
    super.key,
    this.transcribedText,
    this.initialAmount,
    this.initialPayeeName,
  });

  final String? transcribedText;
  final double? initialAmount;
  final String? initialPayeeName;

  @override
  State<PaymentHandoffSheet> createState() => _PaymentHandoffSheetState();
}

class _PaymentHandoffSheetState extends State<PaymentHandoffSheet> {
  late final TextEditingController _upiIdCtrl;
  late final TextEditingController _payeeCtrl;
  late final TextEditingController _amountCtrl;
  bool _launching = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final savedUpiId = StorageService.instance.lastUpiId ?? '';
    final savedName = StorageService.instance.lastUpiName ?? '';
    _upiIdCtrl = TextEditingController(text: savedUpiId);
    _payeeCtrl = TextEditingController(
      text: widget.initialPayeeName ?? savedName,
    );
    _amountCtrl = TextEditingController(
      text: widget.initialAmount != null
          ? _formatAmount(widget.initialAmount!)
          : '',
    );
  }

  @override
  void dispose() {
    _upiIdCtrl.dispose();
    _payeeCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _launch() async {
    final upiId = _upiIdCtrl.text.trim();
    final payee = _payeeCtrl.text.trim();
    final amount = double.tryParse(_amountCtrl.text.trim());

    if (upiId.isEmpty || payee.isEmpty || amount == null || amount <= 0) {
      setState(() {
        _error = 'Enter a valid UPI ID, name, and amount.';
      });
      return;
    }

    setState(() {
      _launching = true;
      _error = null;
    });

    await StorageService.instance.setLastUpiId(upiId);
    await StorageService.instance.setLastUpiName(payee);

    final launched = await UpiService.instance.launchPayment(
      upiId: upiId,
      payeeName: payee,
      amount: amount,
      note: widget.transcribedText,
    );

    if (!mounted) return;

    setState(() => _launching = false);

    if (launched) {
      HapticFeedback.mediumImpact();
      Navigator.of(context).pop();
      return;
    }

    setState(() {
      _error = 'No UPI app could be opened on this device.';
    });
  }

  String _formatAmount(double value) {
    final isWhole = value == value.truncateToDouble();
    return isWhole ? value.toStringAsFixed(0) : value.toStringAsFixed(2);
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(18, 18, 18, bottomInset + 18),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Open UPI app',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Sahayak will prefill the amount and beneficiary details. Final payment still happens safely inside your UPI app.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 18),
            TextField(
              controller: _payeeCtrl,
              decoration: const InputDecoration(
                labelText: 'Payee name',
                hintText: 'Riya',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _upiIdCtrl,
              decoration: const InputDecoration(
                labelText: 'UPI ID',
                hintText: 'riya@oksbi',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _amountCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Amount',
                hintText: '500',
                prefixText: 'Rs ',
              ),
            ),
            if (widget.transcribedText != null && widget.transcribedText!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                'Voice request: "${widget.transcribedText!}"',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: const TextStyle(color: Colors.redAccent),
              ),
            ],
            const SizedBox(height: 18),
            GlassButton(
              label: 'Continue to UPI app',
              icon: Icons.account_balance_wallet_rounded,
              loading: _launching,
              onPressed: _launching ? null : _launch,
            ),
          ],
        ),
      ),
    );
  }
}
