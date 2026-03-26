import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../core/theme/colors.dart';

class OfflineBanner extends StatelessWidget {
  const OfflineBanner({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<ConnectivityResult>>(
      stream: Connectivity().onConnectivityChanged,
      builder: (context, snapshot) {
        final results = snapshot.data ?? [];
        final isOffline = results.isNotEmpty &&
            results.every((r) => r == ConnectivityResult.none);

        return Column(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: isOffline ? 40 : 0,
              curve: Curves.easeOut,
              color: SahayakColors.medicineAmber,
              child: isOffline
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.wifi_off_rounded,
                            size: 16, color: Colors.black87),
                        SizedBox(width: 8),
                        Text(
                          'इंटरनेट नहीं है — कैश्ड डेटा दिख रहा है',
                          style: TextStyle(
                            fontSize:   13,
                            fontWeight: FontWeight.w600,
                            color:      Colors.black87,
                          ),
                        ),
                      ],
                    )
                  : const SizedBox.shrink(),
            ),
            Expanded(child: child),
          ],
        );
      },
    );
  }
}
