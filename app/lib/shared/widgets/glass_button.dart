import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';

/// Glassmorphic pill button — used for prominent CTAs
class GlassButton extends StatefulWidget {
  const GlassButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.width,
    this.height = 60,
    this.gradient,
    this.loading = false,
  });

  final String      label;
  final VoidCallback? onPressed;
  final IconData?   icon;
  final double?     width;
  final double      height;
  final Gradient?   gradient;
  final bool        loading;

  @override
  State<GlassButton> createState() => _GlassButtonState();
}

class _GlassButtonState extends State<GlassButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final accent = Theme.of(context).colorScheme.primary;
    final grad   = widget.gradient ??
        LinearGradient(
          colors: [accent, accent.withValues(alpha: 0.8)],
          begin:  Alignment.topLeft,
          end:    Alignment.bottomRight,
        );

    return GestureDetector(
      onTapDown:  (_) { setState(() => _pressed = true);  HapticFeedback.lightImpact(); },
      onTapUp:    (_) { setState(() => _pressed = false); widget.onPressed?.call(); },
      onTapCancel: () { setState(() => _pressed = false); },
      child: AnimatedScale(
        scale:    _pressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
            child: Container(
              width:  widget.width ?? double.infinity,
              height: widget.height,
              decoration: BoxDecoration(
                gradient:     grad,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.16),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color:       accent.withValues(alpha: 0.35),
                    blurRadius:  20,
                    offset:      const Offset(0, 6),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: IgnorePointer(
                      child: Container(
                        height: 1.1,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                            colors: [
                              Colors.white.withValues(alpha: 0.32),
                              Colors.white.withValues(alpha: 0.12),
                              Colors.white.withValues(alpha: 0.06),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  Center(
                    child: widget.loading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (widget.icon != null) ...[
                                Icon(widget.icon, color: Colors.white, size: 22),
                                const SizedBox(width: 8),
                              ],
                              Text(
                                widget.label,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ],
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
