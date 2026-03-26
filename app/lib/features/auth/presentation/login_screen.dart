import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../core/services/auth_service.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_button.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/immersive_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _loading = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    HapticFeedback.mediumImpact();
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await AuthService.instance.signIn(
        email: _emailCtrl.text.trim(),
        password: _passCtrl.text,
      );

      if (mounted) context.go('/home');
    } catch (error) {
      setState(() => _error = error.toString());
      HapticFeedback.heavyImpact();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = theme.colorScheme.primary;
    final ctaGradient = const LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        Color(0xFFFFB14A),
        Color(0xFFFF9933),
        Color(0xFFF28929),
      ],
    );

    return Scaffold(
      body: ImmersiveShell(
        primaryGlow: accent,
        secondaryGlow: SahayakColors.voiceViolet,
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final compact = constraints.maxHeight < 760;

              return SingleChildScrollView(
                padding: EdgeInsets.fromLTRB(20, compact ? 8 : 14, 20, 20),
                child: Align(
                  alignment: Alignment.topCenter,
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 430),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _BrandBlock(
                          accent: accent,
                          compact: compact,
                        )
                            .animate()
                            .fadeIn(duration: 450.ms)
                            .slideY(begin: -0.05, end: 0),
                        SizedBox(height: compact ? 14 : 20),
                        Container(
                          padding: EdgeInsets.fromLTRB(
                            compact ? 18 : 22,
                            compact ? 20 : 24,
                            compact ? 18 : 22,
                            compact ? 18 : 22,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0x54151529)
                                : Colors.white.withValues(alpha: 0.82),
                            borderRadius: BorderRadius.circular(34),
                            border: Border.all(
                              color: isDark
                                  ? SahayakColors.saffron.withValues(alpha: 0.16)
                                  : Colors.black.withValues(alpha: 0.05),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.18 : 0.04),
                                blurRadius: 26,
                                offset: const Offset(0, 12),
                              ),
                            ],
                          ),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                ConstrainedBox(
                                  constraints: const BoxConstraints(maxWidth: 290),
                                  child: Center(
                                    child: Text(
                                      'A calm command center for the people you care about.',
                                      textAlign: TextAlign.center,
                                      style: theme.textTheme.headlineSmall?.copyWith(
                                        height: 1.12,
                                        fontWeight: FontWeight.w700,
                                        fontSize: compact ? 26 : null,
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(height: compact ? 8 : 12),
                                ConstrainedBox(
                                  constraints: const BoxConstraints(maxWidth: 304),
                                  child: Center(
                                    child: Text(
                                      'Track SOS updates, medicines, and daily support in one soft, uncluttered view.',
                                      textAlign: TextAlign.center,
                                      style: theme.textTheme.bodyMedium?.copyWith(
                                        color: SahayakColors.textMuted(isDark),
                                        height: 1.5,
                                        fontSize: compact ? 15 : null,
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(height: compact ? 18 : 22),
                                const _FieldLabel(label: 'Email'),
                                const SizedBox(height: 8),
                                _SoftInputShell(
                                  child: TextFormField(
                                    controller: _emailCtrl,
                                    keyboardType: TextInputType.emailAddress,
                                    textInputAction: TextInputAction.next,
                                    textAlign: TextAlign.center,
                                    decoration: const InputDecoration(
                                      hintText: 'name@example.com',
                                    ),
                                    validator: (value) {
                                      if (value == null || value.trim().isEmpty) {
                                        return 'Please enter your email';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                                SizedBox(height: compact ? 14 : 18),
                                const _FieldLabel(label: 'Password'),
                                const SizedBox(height: 8),
                                _SoftInputShell(
                                  child: TextFormField(
                                    controller: _passCtrl,
                                    obscureText: _obscure,
                                    textInputAction: TextInputAction.done,
                                    onFieldSubmitted: (_) => _signIn(),
                                    textAlign: TextAlign.center,
                                    decoration: InputDecoration(
                                      hintText: 'At least 6 characters',
                                      suffixIcon: IconButton(
                                        onPressed: () => setState(() => _obscure = !_obscure),
                                        icon: Icon(
                                          _obscure
                                              ? Icons.visibility_outlined
                                              : Icons.visibility_off_outlined,
                                        ),
                                      ),
                                    ),
                                    validator: (value) {
                                      if (value == null || value.length < 6) {
                                        return 'Password must be at least 6 characters';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                                if (_error != null) ...[
                                  SizedBox(height: compact ? 12 : 16),
                                  AccentGlassCard(
                                    accent: SahayakColors.sosRed,
                                    padding: const EdgeInsets.all(14),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Icon(
                                          Icons.error_outline_rounded,
                                          color: SahayakColors.sosRed,
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            _error!,
                                            style: theme.textTheme.bodyMedium?.copyWith(
                                              color: SahayakColors.sosRed,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                                SizedBox(height: compact ? 18 : 22),
                                GlassButton(
                                  label: 'Continue securely',
                                  icon: Icons.arrow_forward_rounded,
                                  gradient: ctaGradient,
                                  loading: _loading,
                                  onPressed: _loading ? null : _signIn,
                                ),
                              ],
                            ),
                          ),
                        )
                            .animate()
                            .fadeIn(delay: 120.ms, duration: 500.ms)
                            .slideY(begin: 0.06, end: 0),
                        SizedBox(height: compact ? 12 : 16),
                        Text(
                          'Apna Phone. Apni Bhasha. Apni Azaadi.',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: SahayakColors.textMuted(isDark),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _BrandBlock extends StatelessWidget {
  const _BrandBlock({
    required this.accent,
    required this.compact,
  });

  final Color accent;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        Container(
          width: compact ? 88 : 106,
          height: compact ? 88 : 106,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: SahayakColors.primaryGradient(
              accent,
              SahayakColors.ashokaGreen,
            ),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.16),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: accent.withValues(alpha: 0.22),
                blurRadius: 34,
                offset: const Offset(0, 16),
              ),
            ],
          ),
          child: Center(
            child: Container(
              width: compact ? 70 : 86,
              height: compact ? 70 : 86,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white.withValues(alpha: 0.16),
                    Colors.transparent,
                  ],
                ),
              ),
              alignment: Alignment.center,
              child: const Text(
                'SA',
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.2,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ),
        SizedBox(height: compact ? 16 : 24),
        Text(
          'Care with dignity',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: SahayakColors.saffron.withValues(alpha: 0.92),
                letterSpacing: 1.0,
                fontWeight: FontWeight.w700,
                fontSize: compact ? 13 : null,
              ),
        ),
        SizedBox(height: compact ? 4 : 10),
        Text(
          'SAHAYAK',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                color: accent,
                letterSpacing: 3.4,
                fontSize: compact ? 40 : null,
              ),
        ),
        SizedBox(height: compact ? 4 : 8),
        Text(
          'Calm digital support for families and elders',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: SahayakColors.textSecondary(isDark),
                fontSize: compact ? 16 : null,
              ),
        ),
        SizedBox(height: compact ? 2 : 4),
        Text(
          'Apno ke liye bharosemand digital sahayak',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: SahayakColors.textMuted(isDark),
                fontSize: compact ? 14 : null,
              ),
        ),
      ],
    );
  }
}

class _SoftInputShell extends StatelessWidget {
  const _SoftInputShell({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.04)
            : Colors.black.withValues(alpha: 0.025),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.07)
              : Colors.black.withValues(alpha: 0.05),
        ),
      ),
      child: child,
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        label,
        textAlign: TextAlign.center,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
              fontSize: 17,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class _MiniTag extends StatelessWidget {
  const _MiniTag({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [
                  Colors.white.withValues(alpha: 0.08),
                  Colors.white.withValues(alpha: 0.04),
                ]
              : [
                  Colors.white.withValues(alpha: 0.88),
                  Colors.black.withValues(alpha: 0.02),
                ],
        ),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.10)
              : Colors.black.withValues(alpha: 0.06),
        ),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}
