import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/routes/app_router.dart';
import 'core/services/location_service.dart';
import 'core/services/shake_service.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_cubit.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'features/health/bloc/health_bloc.dart';
import 'features/home/bloc/dashboard_bloc.dart';
import 'features/medications/bloc/medication_bloc.dart';
import 'features/settings/bloc/settings_bloc.dart';
import 'features/sos/bloc/sos_bloc.dart';
import 'features/voice/bloc/voice_bloc.dart';
import 'l10n/app_localizations.dart';

class SahayakApp extends StatefulWidget {
  const SahayakApp({super.key});

  @override
  State<SahayakApp> createState() => _SahayakAppState();
}

class _SahayakAppState extends State<SahayakApp> with WidgetsBindingObserver {
  late final ThemeCubit _themeCubit;
  late final AuthBloc _authBloc;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _themeCubit = ThemeCubit();
    _authBloc = AuthBloc()..add(const AuthCheckRequested());

    WidgetsBinding.instance.addPostFrameCallback((_) {
      try {
        ShakeService.instance.start(onShake: () => appRouter.go('/sos-trigger'));
      } catch (error) {
        debugPrint('ShakeService start failed: $error');
      }

      try {
        LocationService.instance.startHeartbeat();
      } catch (error) {
        debugPrint('LocationService heartbeat failed: $error');
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    ShakeService.instance.stop();
    LocationService.instance.stopHeartbeat();
    _themeCubit.close();
    _authBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<ThemeCubit>.value(value: _themeCubit),
        BlocProvider<AuthBloc>.value(value: _authBloc),
        BlocProvider(create: (_) => DashboardBloc()),
        BlocProvider(create: (_) => MedicationBloc()),
        BlocProvider(create: (_) => VoiceBloc()),
        BlocProvider(create: (_) => SosBloc()),
        BlocProvider(create: (_) => HealthBloc()),
        BlocProvider(create: (_) => SettingsBloc()),
      ],
      child: BlocBuilder<ThemeCubit, ThemeState>(
        builder: (context, themeState) {
          return BlocBuilder<SettingsBloc, SettingsState>(
            builder: (context, settingsState) {
              return MaterialApp.router(
                title: 'Sahayak',
                debugShowCheckedModeBanner: false,
                routerConfig: appRouter,
                locale: Locale(settingsState.language),
                theme: SahayakTheme.light(
                  colorTheme: themeState.colorTheme,
                  fontScale: themeState.fontScale,
                ),
                darkTheme: SahayakTheme.dark(
                  colorTheme: themeState.colorTheme,
                  fontScale: themeState.fontScale,
                ),
                themeMode: themeState.isDark ? ThemeMode.dark : ThemeMode.light,
                supportedLocales: const [
                  Locale('hi'),
                  Locale('ta'),
                  Locale('bn'),
                  Locale('mr'),
                  Locale('te'),
                  Locale('kn'),
                  Locale('gu'),
                  Locale('pa'),
                  Locale('ml'),
                  Locale('ur'),
                  Locale('en'),
                ],
                localizationsDelegates: const [
                  AppLocalizations.delegate,
                  GlobalMaterialLocalizations.delegate,
                  GlobalWidgetsLocalizations.delegate,
                  GlobalCupertinoLocalizations.delegate,
                ],
              );
            },
          );
        },
      ),
    );
  }
}
