import 'package:flutter/material.dart';
enum SahayakColorTheme { saffron, ocean, forest, rose, purple, ember }

extension SahayakColorThemeX on SahayakColorTheme {
  Color get accent1 => switch (this) {
        SahayakColorTheme.saffron => const Color(0xFFFF9933),
        SahayakColorTheme.ocean   => const Color(0xFF00B4D8),
        SahayakColorTheme.forest  => const Color(0xFF2D6A4F),
        SahayakColorTheme.rose    => const Color(0xFFE63946),
        SahayakColorTheme.purple  => const Color(0xFF7B2FF7),
        SahayakColorTheme.ember   => const Color(0xFFFF6B35),
      };

  Color get accent2 => switch (this) {
        SahayakColorTheme.saffron => const Color(0xFF138808),
        SahayakColorTheme.ocean   => const Color(0xFF0077B6),
        SahayakColorTheme.forest  => const Color(0xFF40916C),
        SahayakColorTheme.rose    => const Color(0xFFA8DADC),
        SahayakColorTheme.purple  => const Color(0xFFC77DFF),
        SahayakColorTheme.ember   => const Color(0xFFD62828),
      };

  String get storageKey => name;

  static SahayakColorTheme fromKey(String key) =>
      SahayakColorTheme.values.firstWhere(
        (e) => e.name == key,
        orElse: () => SahayakColorTheme.saffron,
      );
}

// Alias for storage_service.dart usage
class SahayakColorThemeExt {
  static SahayakColorTheme fromKey(String key) =>
      SahayakColorThemeX.fromKey(key);
}
