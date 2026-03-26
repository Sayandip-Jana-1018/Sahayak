import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/api_config.dart';

typedef SocketEventCallback = void Function(dynamic data);

class SocketService {
  SocketService._();
  static final SocketService instance = SocketService._();

  IO.Socket? _socket;
  bool _connected = false;

  // Registered listeners per event
  final Map<String, List<SocketEventCallback>> _listeners = {};

  bool get isConnected => _connected;

  // ── Connect ───────────────────────────────────────────────────────────────
  void connect(String clerkJwt) {
    if (_connected) return;

    _socket = IO.io(
      ApiConfig.baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': clerkJwt})
          .disableAutoConnect()
          .enableForceNew()
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      _connected = true;
      _emit('_connect', null);
    });

    _socket!.onDisconnect((_) {
      _connected = false;
      _emit('_disconnect', null);
    });

    _socket!.onConnectError((err) {
      _emit('_error', err);
    });

    // Backend events
    for (final event in [
      'dashboard_joined',
      'sos_triggered',
      'location_update',
      'med_reminder',
      'device_registered',
      'request_location',
      'companion_loneliness_alert',
      'error',
    ]) {
      _socket!.on(event, (data) => _emit(event, data));
    }
  }

  // ── Join Dashboard Room ───────────────────────────────────────────────────
  void joinDashboard(String elderlyProfileId) {
    _socket?.emit('join_dashboard', {'elderlyProfileId': elderlyProfileId});
  }

  void leaveDashboard(String elderlyProfileId) {
    _socket?.emit('leave_dashboard', {'elderlyProfileId': elderlyProfileId});
  }

  // ── Emit location update ──────────────────────────────────────────────────
  void emitLocationUpdate(String elderlyProfileId, double lat, double lng) {
    _socket?.emit('location_update', {
      'elderlyProfileId': elderlyProfileId,
      'lat': lat,
      'lng': lng,
    });
  }

  // ── Subscribe / Unsubscribe ───────────────────────────────────────────────
  void on(String event, SocketEventCallback callback) {
    _listeners.putIfAbsent(event, () => []).add(callback);
  }

  void off(String event, SocketEventCallback callback) {
    _listeners[event]?.remove(callback);
  }

  void _emit(String event, dynamic data) {
    for (final cb in List.of(_listeners[event] ?? [])) {
      cb(data);
    }
  }

  // ── Disconnect ────────────────────────────────────────────────────────────
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _connected = false;
  }
}
