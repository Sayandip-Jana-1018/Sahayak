import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../features/settings/bloc/settings_bloc.dart';
import '../../core/theme/color_scheme.dart';
import '../../core/theme/colors.dart';

/// 6-dot color theme switcher — matches the web's color-theme-btn row
class ColorThemePicker extends StatelessWidget {
  const ColorThemePicker({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return BlocBuilder<SettingsBloc, SettingsState>(
      builder: (context, state) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: SahayakColorTheme.values.map((theme) {
            final isActive = state.colorTheme == theme;
            return GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                context.read<SettingsBloc>().add(SetColorTheme(theme));
              },
              child: AnimatedContainer(
                duration:  const Duration(milliseconds: 200),
                width:     isActive ? 36 : 28,
                height:    isActive ? 36 : 28,
                margin:    const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  shape:  BoxShape.circle,
                  color:  theme.accent1,
                  border: isActive
                      ? Border.all(color: Colors.white, width: 3)
                      : Border.all(
                          color: SahayakColors.glassBorder(isDark), width: 1),
                  boxShadow: isActive
                      ? [BoxShadow(
                          color:       theme.accent1.withOpacity(0.6),
                          blurRadius:  12,
                          spreadRadius: 2,
                        )]
                      : null,
                ),
                child: isActive
                    ? const Icon(Icons.check_rounded,
                        color: Colors.white, size: 16)
                    : null,
              ),
            );
          }).toList(),
        );
      },
    );
  }
}
