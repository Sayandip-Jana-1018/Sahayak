import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/profile_selector_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/medications/presentation/medications_screen.dart';
import '../../features/health/presentation/health_screen.dart';
import '../../features/sos/presentation/sos_screen.dart';
import '../../features/sos/presentation/sos_trigger_overlay.dart';
import '../../features/voice/presentation/voice_assistant_screen.dart';
import '../../features/voice/presentation/voice_profile_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../shared/widgets/bottom_nav_bar.dart';
import '../services/auth_service.dart';

final _rootKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final _shellKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

final GoRouter appRouter = GoRouter(
      navigatorKey: _rootKey,
      initialLocation: '/login',
      redirect: _globalRedirect,
      routes: [
        // ── Auth screens (no shell/nav) ───────────────────────────────────
        GoRoute(
          path:    '/login',
          builder: (_, __) => const LoginScreen(),
        ),
        GoRoute(
          path:    '/onboarding',
          builder: (_, __) => const OnboardingScreen(),
        ),
        GoRoute(
          path:    '/select-profile',
          builder: (_, __) => const ProfileSelectorScreen(),
        ),

        // ── Full-screen overlays (no shell) ───────────────────────────────
        GoRoute(
          path:    '/sos-trigger',
          parentNavigatorKey: _rootKey,
          builder: (_, __) => const SosTriggerOverlay(),
        ),
        GoRoute(
          path:    '/voice-profile',
          parentNavigatorKey: _rootKey,
          builder: (_, __) => const VoiceProfileScreen(),
        ),

        // ── Main app with bottom nav shell ────────────────────────────────
        ShellRoute(
          navigatorKey: _shellKey,
          builder: (context, state, child) => ScaffoldWithBottomNav(child: child),
          routes: [
            GoRoute(
              path:    '/home',
              builder: (_, __) => const HomeScreen(),
            ),
            GoRoute(
              path:    '/medications',
              builder: (_, __) => const MedicationsScreen(),
            ),
            GoRoute(
              path:    '/voice',
              builder: (_, __) => const VoiceAssistantScreen(),
            ),
            GoRoute(
              path:    '/sos',
              builder: (_, __) => const SosScreen(),
            ),
            GoRoute(
              path:    '/health',
              builder: (_, __) => const HealthScreen(),
            ),
            GoRoute(
              path:    '/settings',
              builder: (_, __) => const SettingsScreen(),
            ),
          ],
        ),
      ],
);

// ── Global redirect — checks stored JWT on cold start ─────────────────────────
Future<String?> _globalRedirect(BuildContext context, GoRouterState state) async {
  final auth = AuthService.instance;
  final loc  = state.uri.toString();

  // ── 1. Not authenticated → must go to login ────────────────────────────
  if (!auth.isSignedIn) {
    if (loc == '/login') return null; // Already on login
    return '/login';
  }

  // ── 2. Authenticated but on login → redirect away ─────────────────────
  if (loc == '/login') {
    final onboardingComplete = auth.currentUser?.onboardingComplete ?? false;
    if (!onboardingComplete) return '/onboarding';
    if (!auth.hasActiveProfile) return '/select-profile';
    return '/home';
  }

  // ── 3. Onboarding guard ───────────────────────────────────────────────
  final onboardingComplete = auth.currentUser?.onboardingComplete ?? false;
  if (!onboardingComplete && !loc.startsWith('/onboarding') && loc != '/login') {
    return '/onboarding';
  }

  // ── 4. Profile guard ─────────────────────────────────────────────────
  if (onboardingComplete && !auth.hasActiveProfile &&
      !loc.startsWith('/select-profile') && !loc.startsWith('/onboarding')) {
    return '/select-profile';
  }

  return null; // No redirect
}
