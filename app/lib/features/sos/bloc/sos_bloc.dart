import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/config/api_config.dart';
import '../../../core/services/storage_service.dart';
import '../../../shared/models/models.dart';

// Events
abstract class SosEvent extends Equatable {
  const SosEvent();
  @override List<Object?> get props => [];
}
class SosLoad    extends SosEvent { const SosLoad(); }
class SosTrigger extends SosEvent {
  const SosTrigger({this.triggerType = 'manual', this.lat, this.lng});
  final String triggerType;
  final double? lat;
  final double? lng;
  @override List<Object?> get props => [triggerType, lat, lng];
}
class SosResolve extends SosEvent {
  const SosResolve(this.eventId);
  final String eventId;
  @override
  List<Object?> get props => [eventId];
}

// States
abstract class SosState extends Equatable {
  const SosState();
  @override List<Object?> get props => [];
}
class SosInitial extends SosState {}
class SosLoading extends SosState {}
class SosLoaded  extends SosState {
  const SosLoaded(this.events);
  final List<SosEvent2> events;
  @override List<Object?> get props => [events];
}
class SosTriggered extends SosState {
  const SosTriggered(this.eventId);
  final String eventId;
  @override List<Object?> get props => [eventId];
}
class SosError extends SosState {
  const SosError(this.message);
  final String message;
  @override List<Object?> get props => [message];
}

// Alias to avoid name clash with bloc event
typedef SosEvent2 = SosEvent3;
class SosEvent3 {
  SosEvent3.fromJson(Map<String, dynamic> json)
      : id             = json['id']             as String,
        triggerType    = json['triggerType']    as String?,
        severity       = (json['severity']      as String?) ?? 'high',
        triggeredAt    = DateTime.parse(json['triggeredAt'] as String),
        resolvedAt     = json['resolvedAt'] != null
            ? DateTime.tryParse(json['resolvedAt'] as String)
            : null,
        locationLat    = json['locationLat'] != null
            ? double.tryParse(json['locationLat'].toString())
            : null,
        locationLng    = json['locationLng'] != null
            ? double.tryParse(json['locationLng'].toString())
            : null;

  final String    id;
  final String?   triggerType;
  final String    severity;
  final DateTime  triggeredAt;
  final DateTime? resolvedAt;
  final double?   locationLat;
  final double?   locationLng;
  bool get isResolved => resolvedAt != null;
}

// BLoC
class SosBloc extends Bloc<SosEvent, SosState> {
  SosBloc() : super(SosInitial()) {
    on<SosLoad>(_onLoad);
    on<SosTrigger>(_onTrigger);
    on<SosResolve>(_onResolve);
  }

  Future<void> _onLoad(SosLoad event, Emitter<SosState> emit) async {
    emit(SosLoading());
    try {
      final pid = StorageService.instance.activeProfileId;
      final res = await ApiClient.instance.get(
        ApiConfig.sosEvents,
        queryParameters: pid != null ? {'elderlyProfileId': pid} : null,
      );
      final payload = res.data as Map<String, dynamic>;
      final list = ((payload['events'] as List?) ?? const [])
          .map((e) => SosEvent3.fromJson(e as Map<String, dynamic>))
          .toList();
      emit(SosLoaded(list));
    } on DioException catch (e) {
      emit(SosError(handleDioException(e).message));
    }
  }

  Future<void> _onTrigger(SosTrigger event, Emitter<SosState> emit) async {
    try {
      final pid = StorageService.instance.activeProfileId ?? '';
      final res = await ApiClient.instance.post(ApiConfig.sosTrigger, data: {
        'userId':      pid,
        'location':    {'lat': event.lat ?? 0.0, 'lng': event.lng ?? 0.0},
        'triggerType': event.triggerType,
        'severity':    'high',
      });
      emit(SosTriggered(res.data['sosEventId'] as String));
    } on DioException catch (e) {
      emit(SosError(handleDioException(e).message));
    }
  }

  Future<void> _onResolve(SosResolve event, Emitter<SosState> emit) async {
    try {
      await ApiClient.instance.put(
        '${ApiConfig.sosEvents}/${event.eventId}/resolve',
      );
      add(const SosLoad());
    } on DioException catch (e) {
      emit(SosError(handleDioException(e).message));
    }
  }
}
