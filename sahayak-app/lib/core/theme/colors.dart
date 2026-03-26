import 'package:flutter/material.dart';

class SahayakColors {
  SahayakColors._();

  // Web-aligned surfaces
  static const Color darkBg = Color(0xFF0A0A14);
  static const Color darkSurface = Color(0xFF111122);
  static const Color darkElevated = Color(0xFF1A1A2E);

  static const Color lightBg = Color(0xFFF6F7FF);
  static const Color lightSurface = Color(0xFFEEEEFF);
  static const Color lightElevated = Color(0xFFE4E6F8);

  // Brand
  static const Color saffron = Color(0xFFFF9933);
  static const Color ashokaGreen = Color(0xFF138808);

  // Theme accents
  static const Color indigoAccent = Color(0xFF6366F1);
  static const Color tealGreen = Color(0xFF14B8A6);
  static const Color roseAccent = Color(0xFFEC4899);
  static const Color purpleAccent = Color(0xFF8B5CF6);
  static const Color emeraldAccent = Color(0xFF10B981);

  // Semantic
  static const Color sosRed = Color(0xFFE63946);
  static const Color sosPulse = Color(0xFFFFB4B9);
  static const Color successGreen = Color(0xFF00C853);
  static const Color medicineAmber = Color(0xFFFFB703);
  static const Color voiceViolet = Color(0xFF7C4DFF);
  static const Color deviceBlue = Color(0xFF2979FF);
  static const Color locationTeal = Color(0xFF00BFA5);
  static const Color warningOrange = Color(0xFFFF6B35);

  static Color textPrimary(bool isDark) =>
      isDark ? const Color(0xFFF8F6FF) : const Color(0xFF12143A);

  static Color textSecondary(bool isDark) =>
      isDark ? const Color(0xA6F8F6FF) : const Color(0xAD12143A);

  static Color textMuted(bool isDark) =>
      isDark ? const Color(0x66F8F6FF) : const Color(0x6B12143A);

  static Color glassFill(bool isDark) =>
      isDark ? const Color(0x730F0F1E) : const Color(0xBFFFFFFF);

  static Color glassBorder(bool isDark) =>
      isDark ? const Color(0x17FFFFFF) : const Color(0x1A000000);

  static Color glassTopBorder(bool isDark) =>
      isDark ? const Color(0x2EFFFFFF) : const Color(0x59FFFFFF);

  static Color glassHighlight(bool isDark) =>
      isDark ? const Color(0x0FFFFFFF) : const Color(0x99FFFFFF);

  static Color bg(bool isDark) => isDark ? darkBg : lightBg;

  static LinearGradient heroGlow(bool isDark, Color accent) => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: isDark
            ? [
                accent.withValues(alpha: 0.24),
                accent.withValues(alpha: 0.08),
                darkBg,
              ]
            : [
                accent.withValues(alpha: 0.14),
                accent.withValues(alpha: 0.04),
                lightBg,
              ],
      );

  static LinearGradient primaryGradient(Color accent1, Color accent2) =>
      LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [accent1, accent2],
      );
}
