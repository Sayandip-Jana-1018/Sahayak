import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/theme/colors.dart';
import '../../../../shared/models/models.dart';

class LocationMapCard extends StatelessWidget {
  const LocationMapCard({super.key, required this.location});
  final DashboardLocation location;

  @override
  Widget build(BuildContext context) {
    final accent = Theme.of(context).colorScheme.primary;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (!location.hasLocation) {
      return Center(
        child: Text(
          'स्थान उपलब्ध नहीं',
          style: TextStyle(color: SahayakColors.textMuted(isDark)),
        ),
      );
    }

    final pos = LatLng(location.lat!, location.lng!);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('अंतिम स्थान', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        if (location.address != null)
          Text(
            location.address!,
            style: TextStyle(fontSize: 13, color: SahayakColors.textMuted(isDark)),
          ),
        const SizedBox(height: 10),
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: SizedBox(
            height: 200,
            child: FlutterMap(
              options: MapOptions(initialCenter: pos, initialZoom: 15.0),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.sahayak.sahayak_app',
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point:  pos,
                      width:  60,
                      height: 60,
                      child:  _PulsingLocationMarker(accent: accent),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        if (location.updatedAt != null)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              'अपडेट: ${_formatTime(location.updatedAt!)}',
              style: TextStyle(fontSize: 11, color: SahayakColors.textMuted(isDark)),
            ),
          ),
      ],
    );
  }

  String _formatTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1)  return 'अभी';
    if (diff.inMinutes < 60) return '${diff.inMinutes} मिनट पहले';
    if (diff.inHours < 24)   return '${diff.inHours} घंटे पहले';
    return '${diff.inDays} दिन पहले';
  }
}

class _PulsingLocationMarker extends StatefulWidget {
  const _PulsingLocationMarker({required this.accent});
  final Color accent;

  @override
  State<_PulsingLocationMarker> createState() => _PulsingLocationMarkerState();
}

class _PulsingLocationMarkerState extends State<_PulsingLocationMarker>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double>   _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 1400))
      ..repeat(reverse: false);
    _anim = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, child) => Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width:  56 * _anim.value,
            height: 56 * _anim.value,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: widget.accent.withAlpha((64 * (1 - _anim.value)).toInt()),
            ),
          ),
          child!,
        ],
      ),
      child: Container(
        width: 20, height: 20,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: widget.accent,
          border: Border.all(color: Colors.white, width: 2.5),
          boxShadow: [BoxShadow(color: widget.accent.withAlpha(128), blurRadius: 8)],
        ),
      ),
    );
  }
}
