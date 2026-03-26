import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../core/theme/color_scheme.dart';
import '../../../core/theme/typography.dart';
import '../../../core/services/storage_service.dart';

class SettingsState extends Equatable {
  const SettingsState({
    required this.isDark,
    required this.colorTheme,
    required this.fontScale,
    required this.language,
  });

  final bool             isDark;
  final SahayakColorTheme colorTheme;
  final FontScale        fontScale;
  final String           language;

  SettingsState copyWith({
    bool?              isDark,
    SahayakColorTheme? colorTheme,
    FontScale?         fontScale,
    String?            language,
  }) =>
      SettingsState(
        isDark:     isDark     ?? this.isDark,
        colorTheme: colorTheme ?? this.colorTheme,
        fontScale:  fontScale  ?? this.fontScale,
        language:   language   ?? this.language,
      );

  @override
  List<Object?> get props => [isDark, colorTheme, fontScale, language];
}

abstract class SettingsEvent extends Equatable {
  const SettingsEvent();
  @override List<Object?> get props => [];
}
class ToggleDarkMode    extends SettingsEvent {}
class SetColorTheme     extends SettingsEvent {
  const SetColorTheme(this.theme);
  final SahayakColorTheme theme;
  @override List<Object?> get props => [theme];
}
class SetFontScale      extends SettingsEvent {
  const SetFontScale(this.scale);
  final FontScale scale;
  @override List<Object?> get props => [scale];
}
class SetLanguage       extends SettingsEvent {
  const SetLanguage(this.language);
  final String language;
  @override List<Object?> get props => [language];
}

class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  SettingsBloc()
      : super(SettingsState(
          isDark:     StorageService.instance.isDarkMode,
          colorTheme: StorageService.instance.colorTheme,
          fontScale:  StorageService.instance.fontScale,
          language:   StorageService.instance.language,
        )) {
    on<ToggleDarkMode>((_, emit) {
      final next = !state.isDark;
      StorageService.instance.setDarkMode(next);
      emit(state.copyWith(isDark: next));
    });
    on<SetColorTheme>((ev, emit) {
      StorageService.instance.setColorTheme(ev.theme);
      emit(state.copyWith(colorTheme: ev.theme));
    });
    on<SetFontScale>((ev, emit) {
      StorageService.instance.setFontScale(ev.scale);
      emit(state.copyWith(fontScale: ev.scale));
    });
    on<SetLanguage>((ev, emit) {
      StorageService.instance.setLanguage(ev.language);
      emit(state.copyWith(language: ev.language));
    });
  }
}
