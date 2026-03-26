import 'package:flutter/material.dart';
import 'colors.dart';
import 'color_scheme.dart';
import 'typography.dart';

class SahayakTheme {
  SahayakTheme._();

  static ThemeData light({
    SahayakColorTheme colorTheme = SahayakColorTheme.saffron,
    FontScale fontScale = FontScale.normal,
  }) =>
      _build(isDark: false, colorTheme: colorTheme, fontScale: fontScale);

  static ThemeData dark({
    SahayakColorTheme colorTheme = SahayakColorTheme.saffron,
    FontScale fontScale = FontScale.normal,
  }) =>
      _build(isDark: true, colorTheme: colorTheme, fontScale: fontScale);

  static ThemeData _build({
    required bool isDark,
    required SahayakColorTheme colorTheme,
    required FontScale fontScale,
  }) {
    final accent1  = colorTheme.accent1;
    final accent2  = colorTheme.accent2;
    final bg       = isDark ? SahayakColors.darkBg       : SahayakColors.lightBg;
    final surface  = isDark ? SahayakColors.darkSurface  : SahayakColors.lightSurface;
    final primary  = SahayakColors.textPrimary(isDark);

    final cs = ColorScheme(
      brightness:  isDark ? Brightness.dark : Brightness.light,
      primary:     accent1,
      onPrimary:   Colors.white,
      secondary:   accent2,
      onSecondary: Colors.white,
      surface:     surface,
      onSurface:   primary,
      error:       SahayakColors.sosRed,
      onError:     Colors.white,
    );

    return ThemeData(
      useMaterial3:            true,
      colorScheme:             cs,
      scaffoldBackgroundColor: bg,
      textTheme:               SahayakTypography.buildTextTheme(fontScale, isDark),
      iconTheme:               IconThemeData(color: primary, size: 28),
      appBarTheme: AppBarTheme(
        backgroundColor:         Colors.transparent,
        elevation:               0,
        scrolledUnderElevation:  0,
        iconTheme:               IconThemeData(color: primary),
        titleTextStyle:          SahayakTypography.buildTextTheme(fontScale, isDark).headlineSmall,
        surfaceTintColor:        Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color:     SahayakColors.glassFill(isDark),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: SahayakColors.glassBorder(isDark)),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: accent1,
          foregroundColor: Colors.white,
          minimumSize:     const Size(double.infinity, 60),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize:   fontScale.buttonSize,
          ),
          elevation: 0,
          shadowColor: accent1.withValues(alpha: 0.22),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          side:            BorderSide(color: SahayakColors.glassBorder(isDark)),
          foregroundColor: primary,
          minimumSize:     const Size(double.infinity, 60),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled:         true,
        fillColor:      SahayakColors.glassFill(isDark),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide:   BorderSide(color: SahayakColors.glassBorder(isDark)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide:   BorderSide(color: SahayakColors.glassBorder(isDark)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide:   BorderSide(color: accent1, width: 1.5),
        ),
        hintStyle:  TextStyle(color: SahayakColors.textMuted(isDark)),
      ),
      dividerColor: SahayakColors.glassBorder(isDark),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        modalBackgroundColor:
            isDark ? SahayakColors.darkElevated : SahayakColors.lightElevated,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: SahayakColors.glassFill(isDark),
        labelStyle:      TextStyle(color: primary),
        side:            BorderSide(color: SahayakColors.glassBorder(isDark)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior:        SnackBarBehavior.floating,
        shape:           RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
