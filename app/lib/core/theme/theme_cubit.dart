import 'package:flutter_bloc/flutter_bloc.dart';
import '../theme/color_scheme.dart';
import '../theme/typography.dart';
import '../services/storage_service.dart';

class ThemeState {
  const ThemeState({
    required this.isDark,
    required this.colorTheme,
    required this.fontScale,
  });

  final bool             isDark;
  final SahayakColorTheme colorTheme;
  final FontScale        fontScale;

  ThemeState copyWith({
    bool?              isDark,
    SahayakColorTheme? colorTheme,
    FontScale?         fontScale,
  }) =>
      ThemeState(
        isDark:     isDark     ?? this.isDark,
        colorTheme: colorTheme ?? this.colorTheme,
        fontScale:  fontScale  ?? this.fontScale,
      );
}

class ThemeCubit extends Cubit<ThemeState> {
  ThemeCubit()
      : super(ThemeState(
          isDark:     StorageService.instance.isDarkMode,
          colorTheme: StorageService.instance.colorTheme,
          fontScale:  StorageService.instance.fontScale,
        ));

  void toggleDark() {
    final next = !state.isDark;
    StorageService.instance.setDarkMode(next);
    emit(state.copyWith(isDark: next));
  }

  void setColorTheme(SahayakColorTheme t) {
    StorageService.instance.setColorTheme(t);
    emit(state.copyWith(colorTheme: t));
  }

  void setFontScale(FontScale s) {
    StorageService.instance.setFontScale(s);
    emit(state.copyWith(fontScale: s));
  }
}
