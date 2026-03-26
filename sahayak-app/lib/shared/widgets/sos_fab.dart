import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';

class SosFab extends StatefulWidget {
  const SosFab({super.key});

  @override
  State<SosFab> createState() => _SosFabState();
}

class _SosFabState extends State<SosFab> with SingleTickerProviderStateMixin {
  late final AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: () {
        HapticFeedback.heavyImpact();
        context.go('/sos-trigger');
      },
      child: AnimatedBuilder(
        animation: _pulseCtrl,
        builder: (context, child) {
          return Stack(
            alignment: Alignment.center,
            children: [
              // Pulsing ring
              Container(
                width:  60 + (_pulseCtrl.value * 16),
                height: 60 + (_pulseCtrl.value * 16),
                decoration: BoxDecoration(
                  shape:  BoxShape.circle,
                  border: Border.all(
                    color: SahayakColors.sosRed.withOpacity(
                        0.6 - _pulseCtrl.value * 0.5),
                    width: 2,
                  ),
                ),
              ),
              // Main button
              child!,
            ],
          );
        },
        child: Container(
          width:  60,
          height: 60,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: SahayakColors.sosRed,
            boxShadow: [
              BoxShadow(
                color:       SahayakColors.sosRed,
                blurRadius:  16,
                spreadRadius: 2,
                offset:      Offset(0, 0),
              ),
            ],
          ),
          child: const Center(
            child: Text(
              'SOS',
              style: TextStyle(
                color:      Colors.white,
                fontSize:   14,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
