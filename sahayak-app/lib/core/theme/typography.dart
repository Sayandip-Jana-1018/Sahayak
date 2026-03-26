import 'package:flutter/material.dart';

import 'colors.dart';

enum FontScale { normal, large, xlarge }

extension FontScaleExt on FontScale {
  double get bodySize => switch (this) {
        FontScale.normal => 18,
        FontScale.large => 22,
        FontScale.xlarge => 26,
      };

  double get titleSize => switch (this) {
        FontScale.normal => 22,
        FontScale.large => 26,
        FontScale.xlarge => 30,
      };

  double get headlineSize => switch (this) {
        FontScale.normal => 30,
        FontScale.large => 36,
        FontScale.xlarge => 40,
      };

  double get captionSize => switch (this) {
        FontScale.normal => 14,
        FontScale.large => 16,
        FontScale.xlarge => 18,
      };

  double get buttonSize => switch (this) {
        FontScale.normal => 20,
        FontScale.large => 22,
        FontScale.xlarge => 24,
      };

  String get storageKey => name;

  static FontScale fromKey(String key) => FontScale.values.firstWhere(
        (value) => value.name == key,
        orElse: () => FontScale.normal,
      );
}

class SahayakTypography {
  SahayakTypography._();

  static const String displayFont = 'CabinetGrotesk';
  static const String bodyFont = 'NotoSansDevanagari';
  static const String accentFont = 'DMSerifDisplay';

  static TextTheme buildTextTheme(FontScale scale, bool isDark) {
    final primary = SahayakColors.textPrimary(isDark);
    final secondary = SahayakColors.textSecondary(isDark);

    return TextTheme(
      displayLarge: _display(scale.headlineSize + 14, FontWeight.w800, primary),
      displayMedium: _display(scale.headlineSize + 6, FontWeight.w800, primary),
      displaySmall: _display(scale.headlineSize, FontWeight.w700, primary),
      headlineLarge: _display(scale.headlineSize - 2, FontWeight.w700, primary),
      headlineMedium: _display(scale.titleSize + 2, FontWeight.w700, primary),
      headlineSmall: _display(scale.titleSize, FontWeight.w600, primary),
      titleLarge: _body(scale.titleSize, FontWeight.w700, primary),
      titleMedium: _body(scale.bodySize + 1, FontWeight.w600, primary),
      titleSmall: _body(scale.bodySize, FontWeight.w600, primary),
      bodyLarge: _body(scale.bodySize, FontWeight.w400, primary),
      bodyMedium: _body(scale.bodySize - 1, FontWeight.w400, secondary),
      bodySmall: _body(scale.captionSize, FontWeight.w500, secondary),
      labelLarge: _body(scale.buttonSize, FontWeight.w700, primary),
      labelMedium: _body(scale.captionSize + 1, FontWeight.w600, primary),
      labelSmall: _body(scale.captionSize, FontWeight.w500, secondary),
    );
  }

  static TextStyle statNumber(double size, Color color) => TextStyle(
        fontFamily: accentFont,
        fontFamilyFallback: const [bodyFont, 'serif'],
        fontSize: size,
        fontWeight: FontWeight.w400,
        letterSpacing: -0.4,
        height: 1.0,
        color: color,
      );

  static TextStyle _display(double size, FontWeight weight, Color color) =>
      TextStyle(
        fontFamily: displayFont,
        fontFamilyFallback: const [bodyFont, 'sans-serif'],
        fontSize: size,
        fontWeight: weight,
        height: 1.15,
        letterSpacing: -0.6,
        color: color,
      );

  static TextStyle _body(double size, FontWeight weight, Color color) =>
      TextStyle(
        fontFamily: bodyFont,
        fontFamilyFallback: const ['sans-serif'],
        fontSize: size,
        fontWeight: weight,
        height: 1.45,
        letterSpacing: 0,
        color: color,
      );
}
