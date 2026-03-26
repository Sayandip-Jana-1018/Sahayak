import 'dart:async';
import 'package:geolocator/geolocator.dart';
import '../network/socket_service.dart';
import '../network/api_client.dart';
import '../config/api_config.dart';
import 'storage_service.dart';

class LocationService {
  LocationService._();
  static final LocationService instance = LocationService._();

  Position? _lastKnown;
  Timer?    _heartbeatTimer;

  Position? get lastKnown => _lastKnown;

  // ── Permission check ──────────────────────────────────────────────────────
  Future<bool> requestPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return false;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    return permission == LocationPermission.whileInUse ||
        permission == LocationPermission.always;
  }

  // ── One-shot get ──────────────────────────────────────────────────────────
  Future<Position?> getCurrentPosition() async {
    try {
      final hasPermission = await requestPermissions();
      if (!hasPermission) return null;
      _lastKnown = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      return _lastKnown;
    } catch (_) {
      return _lastKnown; // Return last known on error
    }
  }

  // ── 15-minute heartbeat (foreground) ─────────────────────────────────────
  void startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(
      const Duration(minutes: 15),
      (_) => _sendHeartbeat(),
    );
  }

  void stopHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;
  }

  Future<void> _sendHeartbeat() async {
    final pos = await getCurrentPosition();
    if (pos == null) return;

    final pid = StorageService.instance.activeProfileId;
    if (pid == null) return;

    try {
      await ApiClient.instance.patch(
        '${ApiConfig.deviceStatus}/$pid',
        data: {
          'lastLocationLat': pos.latitude,
          'lastLocationLng': pos.longitude,
        },
      );
      if (SocketService.instance.isConnected) {
        SocketService.instance.emitLocationUpdate(pid, pos.latitude, pos.longitude);
      }
    } catch (_) {
      await StorageService.instance.enqueuePendingAction({
        'type': 'heartbeat',
        'lat': pos.latitude,
        'lng': pos.longitude,
        'pid': pid,
      });
    }
  }

  // ── Respond to Socket.io request_location ─────────────────────────────────
  Future<void> respondToLocationRequest(String elderlyProfileId) async {
    final pos = await getCurrentPosition();
    if (pos == null) return;
    SocketService.instance.emitLocationUpdate(
        elderlyProfileId, pos.latitude, pos.longitude);
  }
}
