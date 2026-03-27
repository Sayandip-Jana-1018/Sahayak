import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../core/services/auth_service.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/theme_cubit.dart';
import '../../../core/theme/typography.dart';
import '../../settings/bloc/settings_bloc.dart';
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
  String? _socialLoadingProvider;

  @override
  void initState() {
    super.initState();
    _emailCtrl.text = AuthService.instance.draftEmail ?? '';
    _passCtrl.text = AuthService.instance.draftPassword ?? '';
  }

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

  Future<void> _signInWithProvider(String provider) async {
    HapticFeedback.selectionClick();
    setState(() {
      _socialLoadingProvider = provider;
      _error = null;
    });

    try {
      await AuthService.instance.signInWithSocialProvider(provider);
      if (mounted) context.go('/home');
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = error.toString());
      HapticFeedback.heavyImpact();
    } finally {
      if (mounted) {
        setState(() => _socialLoadingProvider = null);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accent = theme.colorScheme.primary;
    const ctaGradient = LinearGradient(
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
                        SizedBox(height: compact ? 4 : 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _ThemeToggleButton(
                              isDark: isDark,
                              onTap: () {
                                HapticFeedback.lightImpact();
                                context.read<SettingsBloc>().add(ToggleDarkMode());
                                context.read<ThemeCubit>().toggleDark();
                              },
                            ),
                          ],
                        ),
                        SizedBox(height: compact ? 10 : 14),
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
                                ? const Color(0x66151529)
                                : Colors.white.withValues(alpha: 0.78),
                            borderRadius: BorderRadius.circular(34),
                            border: Border.all(
                              color: isDark
                                  ? Colors.white.withValues(alpha: 0.08)
                                  : Colors.white.withValues(alpha: 0.55),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.18 : 0.04),
                                blurRadius: 26,
                                offset: const Offset(0, 12),
                              ),
                              BoxShadow(
                                color: accent.withValues(alpha: isDark ? 0.1 : 0.06),
                                blurRadius: 36,
                                offset: const Offset(0, 0),
                              ),
                            ],
                          ),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Text(
                                  'Sign in your way',
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.headlineSmall?.copyWith(
                                    height: 1.08,
                                    fontWeight: FontWeight.w700,
                                    fontSize: compact ? 25 : null,
                                  ),
                                ),
                                SizedBox(height: compact ? 6 : 8),
                                Text(
                                  'Use Google, GitHub, or continue with email.',
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: SahayakColors.textMuted(isDark),
                                  ),
                                ),
                                SizedBox(height: compact ? 16 : 18),
                                Row(
                                  children: [
                                    Expanded(
                                      child: _SocialButton(
                                        label: 'Google',
                                        leading: const _GoogleMark(),
                                        loading: _socialLoadingProvider == 'google',
                                        onTap: _loading || _socialLoadingProvider != null
                                            ? null
                                            : () => _signInWithProvider('google'),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: _SocialButton(
                                        label: 'GitHub',
                                        leading: Icon(
                                          Icons.code_rounded,
                                          size: 18,
                                          color: isDark
                                              ? Colors.white
                                              : SahayakColors.textPrimary(false),
                                        ),
                                        loading: _socialLoadingProvider == 'github',
                                        onTap: _loading || _socialLoadingProvider != null
                                            ? null
                                            : () => _signInWithProvider('github'),
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(height: compact ? 16 : 18),
                                Row(
                                  children: [
                                    Expanded(
                                      child: Divider(
                                        color: isDark
                                            ? Colors.white.withValues(alpha: 0.08)
                                            : Colors.black.withValues(alpha: 0.08),
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                      child: Text(
                                        'or use email',
                                        style: theme.textTheme.bodySmall?.copyWith(
                                          color: SahayakColors.textMuted(isDark),
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Divider(
                                        color: isDark
                                            ? Colors.white.withValues(alpha: 0.08)
                                            : Colors.black.withValues(alpha: 0.08),
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(height: compact ? 14 : 16),
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
                                  onPressed: _loading || _socialLoadingProvider != null
                                      ? null
                                      : _signIn,
                                ),
                                SizedBox(height: compact ? 10 : 12),
                                Text(
                                  'Google, GitHub, and email sign-in all lead into the same secure session.',
                                  textAlign: TextAlign.center,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: SahayakColors.textMuted(isDark),
                                    height: 1.45,
                                  ),
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
    final shellColor = isDark
        ? const Color(0xFF17172A)
        : const Color(0xFFF5EFE5);
    final haloColor = isDark
        ? SahayakColors.saffron.withValues(alpha: 0.22)
        : SahayakColors.saffron.withValues(alpha: 0.18);

    return Column(
      children: [
        SizedBox(
          width: compact ? 222 : 252,
          height: compact ? 222 : 252,
          child: Stack(
            alignment: Alignment.center,
            children: [
              _PulseRings(
                compact: compact,
                isDark: isDark,
              ),
              Container(
                width: compact ? 222 : 252,
                height: compact ? 222 : 252,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      haloColor,
                      haloColor.withValues(alpha: isDark ? 0.08 : 0.06),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.55, 1.0],
                  ),
                ),
                alignment: Alignment.center,
                child: Container(
                  width: compact ? 172 : 194,
                  height: compact ? 172 : 194,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: shellColor,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.18 : 0.06),
                        blurRadius: 28,
                        offset: const Offset(0, 14),
                      ),
                      BoxShadow(
                        color: SahayakColors.saffron.withValues(alpha: isDark ? 0.18 : 0.1),
                        blurRadius: 32,
                        offset: const Offset(0, 0),
                      ),
                    ],
                    border: Border.all(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.08)
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                  ),
                  padding: const EdgeInsets.all(14),
                  child: ClipOval(
                    child: Image.asset(
                      'assets/images/sahayak-medallion.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: compact ? 12 : 16),
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
        SizedBox(height: compact ? 2 : 6),
        _GradientHeadline(
          text: 'SAHAYAK',
          compact: compact,
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

class _SocialButton extends StatelessWidget {
  const _SocialButton({
    required this.label,
    required this.leading,
    required this.onTap,
    this.loading = false,
  });

  final String label;
  final Widget leading;
  final VoidCallback? onTap;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Ink(
          height: 54,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: isDark
                ? Colors.white.withValues(alpha: 0.06)
                : Colors.white.withValues(alpha: 0.65),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.white.withValues(alpha: 0.6),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.1 : 0.03),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (loading)
                SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      isDark ? Colors.white : SahayakColors.textPrimary(false),
                    ),
                  ),
                )
              else
                leading,
              const SizedBox(width: 8),
              Text(
                label,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GradientHeadline extends StatelessWidget {
  const _GradientHeadline({
    required this.text,
    required this.compact,
  });

  final String text;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gradient = isDark
        ? const LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [
              Color(0xFFFF9933),
              Color(0xFFF8F6FF),
              Color(0xFF138808),
            ],
          )
        : const LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [
              Color(0xFFFF8A1F),
              Color(0xFF3E2F4A),
              Color(0xFF138808),
            ],
          );

    return ShaderMask(
      shaderCallback: (bounds) => gradient.createShader(bounds),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: Theme.of(context).textTheme.displayMedium?.copyWith(
              fontFamily: SahayakTypography.displayFont,
              color: Colors.white,
              letterSpacing: 3.2,
              fontSize: compact ? 42 : 50,
            ),
      ),
    );
  }
}

class _GoogleMark extends StatelessWidget {
  const _GoogleMark();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 18,
      height: 18,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 0,
            left: 0,
            child: Icon(Icons.circle, size: 8, color: Color(0xFFEA4335)),
          ),
          Positioned(
            top: 0,
            right: 0,
            child: Icon(Icons.circle, size: 8, color: Color(0xFF4285F4)),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            child: Icon(Icons.circle, size: 8, color: Color(0xFFFBBC05)),
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: Icon(Icons.circle, size: 8, color: Color(0xFF34A853)),
          ),
        ],
      ),
    );
  }
}

class _ThemeToggleButton extends StatelessWidget {
  const _ThemeToggleButton({
    required this.isDark,
    required this.onTap,
  });

  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Ink(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.white.withValues(alpha: 0.62),
            border: Border.all(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.12)
                  : Colors.white.withValues(alpha: 0.74),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.12 : 0.04),
                blurRadius: 22,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Center(
            child: ShaderMask(
              shaderCallback: (bounds) => const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFFFFC15C),
                  Color(0xFFFF9933),
                  Color(0xFF7C4DFF),
                ],
              ).createShader(bounds),
              child: Icon(
                isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                color: Colors.white,
                size: 24,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _PulseRings extends StatelessWidget {
  const _PulseRings({
    required this.compact,
    required this.isDark,
  });

  final bool compact;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final ringColor = isDark
        ? SahayakColors.voiceViolet.withValues(alpha: 0.28)
        : SahayakColors.saffron.withValues(alpha: 0.18);
    final ringSize = compact ? 168.0 : 188.0;

    return Stack(
      alignment: Alignment.center,
      children: [
        _AnimatedPulseRing(
          size: ringSize,
          color: ringColor,
          delayMs: 0,
        ),
        _AnimatedPulseRing(
          size: ringSize + 18,
          color: ringColor.withValues(alpha: ringColor.a * 0.8),
          delayMs: 900,
        ),
        _AnimatedPulseRing(
          size: ringSize + 36,
          color: ringColor.withValues(alpha: ringColor.a * 0.65),
          delayMs: 1800,
        ),
      ],
    );
  }
}

class _AnimatedPulseRing extends StatefulWidget {
  const _AnimatedPulseRing({
    required this.size,
    required this.color,
    required this.delayMs,
  });

  final double size;
  final Color color;
  final int delayMs;

  @override
  State<_AnimatedPulseRing> createState() => _AnimatedPulseRingState();
}

class _AnimatedPulseRingState extends State<_AnimatedPulseRing>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;
  late final Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3200),
    );
    _scale = Tween<double>(begin: 0.86, end: 1.24).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _opacity = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0, end: 1),
        weight: 22,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1, end: 0),
        weight: 78,
      ),
    ]).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    Future<void>.delayed(Duration(milliseconds: widget.delayMs), () {
      if (!mounted) return;
      _controller.repeat();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scale.value,
          child: Opacity(
            opacity: _opacity.value,
            child: child,
          ),
        );
      },
      child: Container(
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: widget.color,
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: widget.color.withValues(alpha: widget.color.a * 0.45),
              blurRadius: 24,
              spreadRadius: 2,
            ),
          ],
        ),
      ),
    );
  }
}
