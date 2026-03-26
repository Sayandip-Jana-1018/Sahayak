import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';

class UpiService {
  UpiService._();
  static final UpiService instance = UpiService._();

  double? extractAmount(String? text) {
    if (text == null || text.trim().isEmpty) return null;
    final match = RegExp(r'(\d+(?:\.\d{1,2})?)').firstMatch(text);
    if (match == null) return null;
    return double.tryParse(match.group(1)!);
  }

  String? extractSuggestedRecipient(String? text) {
    if (text == null || text.trim().isEmpty) return null;
    final match = RegExp(
      r'(?:to|for|ko)\s+([A-Za-z\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0A80-\u0AFF\u0A00-\u0A7F\s]{2,40})',
      caseSensitive: false,
    ).firstMatch(text);
    final value = match?.group(1)?.trim();
    if (value == null || value.isEmpty) return null;
    return value;
  }

  Future<bool> launchPayment({
    required String upiId,
    required String payeeName,
    required double amount,
    String? note,
  }) async {
    final uri = Uri(
      scheme: 'upi',
      host: 'pay',
      queryParameters: {
        'pa': upiId,
        'pn': payeeName,
        'am': amount.toStringAsFixed(amount.truncateToDouble() == amount ? 0 : 2),
        'cu': 'INR',
        if (note != null && note.trim().isNotEmpty) 'tn': note.trim(),
      },
    );

    if (await canLaunchUrl(uri)) {
      return launchUrl(uri, mode: LaunchMode.externalApplication);
    }

    debugPrint('Unable to launch UPI URI: $uri');
    return false;
  }
}
