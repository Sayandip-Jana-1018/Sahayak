import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerLoader extends StatelessWidget {
  const ShimmerLoader({super.key, this.itemCount = 5});
  final int itemCount;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor:      isDark ? const Color(0xFF1A1A2E) : const Color(0xFFEEEEFF),
      highlightColor: isDark ? const Color(0xFF2A2A3E) : const Color(0xFFFFFFFF),
      child: ListView.separated(
        padding:          const EdgeInsets.all(16),
        itemCount:        itemCount,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, __) => Container(
          height: 80,
          decoration: BoxDecoration(
            color:        Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
    );
  }
}
