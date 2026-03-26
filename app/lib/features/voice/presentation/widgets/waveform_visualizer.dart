import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/theme/colors.dart';

/// Animated waveform bar visualizer — used on VoiceAssistantScreen during speaking
class WaveformVisualizer extends StatefulWidget {
  const WaveformVisualizer({
    super.key,
    this.barCount  = 28,
    this.active    = false,
    this.color,
  });

  final int    barCount;
  final bool   active;
  final Color? color;

  @override
  State<WaveformVisualizer> createState() => _WaveformVisualizerState();
}

class _WaveformVisualizerState extends State<WaveformVisualizer>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  final _rng = Random();
  late List<double> _heights;

  @override
  void initState() {
    super.initState();
    _heights = List.generate(widget.barCount, (_) => 0.15);
    _ctrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 120),
    );
    if (widget.active) _startAnimation();
  }

  @override
  void didUpdateWidget(WaveformVisualizer old) {
    super.didUpdateWidget(old);
    if (widget.active && !old.active) {
      _startAnimation();
    } else if (!widget.active && old.active) {
      _stopAnimation();
    }
  }

  void _startAnimation() {
    _ctrl.addListener(_updateHeights);
    _ctrl.repeat();
  }

  void _stopAnimation() {
    _ctrl.removeListener(_updateHeights);
    _ctrl.stop();
    // Fade bars down
    setState(() {
      _heights = List.generate(widget.barCount, (_) => 0.08);
    });
  }

  void _updateHeights() {
    if (_ctrl.isCompleted || _ctrl.isDismissed) {
      setState(() {
        _heights = List.generate(
            widget.barCount, (_) => 0.1 + _rng.nextDouble() * 0.85);
      });
      _ctrl.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ??
        (widget.active
            ? SahayakColors.voiceViolet
            : SahayakColors.voiceViolet.withValues(alpha: 0.3));

    return SizedBox(
      height: 56,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: List.generate(widget.barCount, (i) {
          final h = _heights[i];
          return AnimatedContainer(
            duration: const Duration(milliseconds: 100),
            width:    (i % 3 == 0) ? 3 : 2,
            height:   56 * h,
            margin:   const EdgeInsets.symmetric(horizontal: 1.5),
            decoration: BoxDecoration(
              color:        color,
              borderRadius: BorderRadius.circular(4),
            ),
          );
        }),
      ),
    );
  }
}
