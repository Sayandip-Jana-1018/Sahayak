import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/config/api_config.dart';
import '../../../core/services/storage_service.dart';
import '../../../shared/models/models.dart';

// ── Events ────────────────────────────────────────────────────────────────────
abstract class MedicationEvent extends Equatable {
  const MedicationEvent();
  @override List<Object?> get props => [];
}
class MedicationLoad   extends MedicationEvent { const MedicationLoad(); }
class MedicationAdd    extends MedicationEvent {
  const MedicationAdd(this.data);
  final Map<String, dynamic> data;
  @override List<Object?> get props => [data];
}
class MedicationDelete extends MedicationEvent {
  const MedicationDelete(this.id);
  final String id;
  @override List<Object?> get props => [id];
}
class MedicationMarkTaken extends MedicationEvent {
  const MedicationMarkTaken({
    required this.reminderId,
    required this.scheduledAt,
  });

  final String reminderId;
  final DateTime scheduledAt;

  @override
  List<Object?> get props => [reminderId, scheduledAt];
}

// ── States ────────────────────────────────────────────────────────────────────
abstract class MedicationState extends Equatable {
  const MedicationState();
  @override List<Object?> get props => [];
}
class MedicationInitial extends MedicationState {}
class MedicationLoading extends MedicationState {}
class MedicationLoaded  extends MedicationState {
  const MedicationLoaded({
    required this.medications,
    required this.adherence,
    required this.overallPercent,
    required this.streakDays,
  });

  final List<MedicationReminder> medications;
  final List<MedicationAdherenceDay> adherence;
  final int overallPercent;
  final int streakDays;

  @override
  List<Object?> get props => [medications, adherence, overallPercent, streakDays];
}
class MedicationError extends MedicationState {
  const MedicationError(this.message);
  final String message;
  @override List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────────────────────────
class MedicationBloc extends Bloc<MedicationEvent, MedicationState> {
  MedicationBloc() : super(MedicationInitial()) {
    on<MedicationLoad>(_onLoad);
    on<MedicationAdd>(_onAdd);
    on<MedicationDelete>(_onDelete);
    on<MedicationMarkTaken>(_onMarkTaken);
  }

  Future<void> _onLoad(MedicationLoad event, Emitter<MedicationState> emit) async {
    // Show cached
    final cached = StorageService.instance.cachedMedications;
    if (cached.isNotEmpty) {
      emit(
        MedicationLoaded(
          medications: cached,
          adherence: const [],
          overallPercent: 0,
          streakDays: 0,
        ),
      );
    }
    emit(MedicationLoading());
    try {
      final pid = StorageService.instance.activeProfileId;
      final query = pid != null ? {'elderlyProfileId': pid} : null;
      final medsRes = await ApiClient.instance.get(
        ApiConfig.medications,
        queryParameters: query,
      );
      final adherenceRes = await ApiClient.instance.get(
        '${ApiConfig.medications}/adherence',
        queryParameters: {
          if (pid != null) 'elderlyProfileId': pid,
          'days': 7,
        },
      );

      final payload = medsRes.data as Map<String, dynamic>;
      final list = ((payload['medications'] as List?) ?? const [])
          .map((e) => MedicationReminder.fromJson(e as Map<String, dynamic>))
          .toList();

      final adherencePayload = adherenceRes.data as Map<String, dynamic>;
      final adherence = ((adherencePayload['adherence'] as List?) ?? const [])
          .map((e) => MedicationAdherenceDay.fromJson(e as Map<String, dynamic>))
          .toList();

      await StorageService.instance.cacheMedications(
          list.map((m) => m.toJson()).toList());
      emit(
        MedicationLoaded(
          medications: list,
          adherence: adherence,
          overallPercent: (adherencePayload['overall_percent'] as num?)?.toInt() ?? 0,
          streakDays: (adherencePayload['streak_days'] as num?)?.toInt() ?? 0,
        ),
      );
    } on DioException catch (e) {
      emit(MedicationError(handleDioException(e).message));
    }
  }

  Future<void> _onAdd(MedicationAdd event, Emitter<MedicationState> emit) async {
    try {
      await ApiClient.instance.post(ApiConfig.medications, data: event.data);
      add(const MedicationLoad());
    } on DioException catch (e) {
      emit(MedicationError(handleDioException(e).message));
    }
  }

  Future<void> _onDelete(MedicationDelete event, Emitter<MedicationState> emit) async {
    try {
      await ApiClient.instance.delete(
        '${ApiConfig.medications}/${event.id}',
        data: {
          if (StorageService.instance.activeProfileId != null)
            'elderlyProfileId': StorageService.instance.activeProfileId,
        },
      );
      add(const MedicationLoad());
    } on DioException catch (e) {
      emit(MedicationError(handleDioException(e).message));
    }
  }

  Future<void> _onMarkTaken(
    MedicationMarkTaken event,
    Emitter<MedicationState> emit,
  ) async {
    try {
      final pid = StorageService.instance.activeProfileId;
      if (pid == null) {
        emit(const MedicationError('No active elder profile selected.'));
        return;
      }

      await ApiClient.instance.post(
        '${ApiConfig.medications}/${event.reminderId}/taken',
        data: {
          'elderlyProfileId': pid,
          'scheduledAt': event.scheduledAt.toIso8601String(),
        },
      );
      add(const MedicationLoad());
    } on DioException catch (e) {
      emit(MedicationError(handleDioException(e).message));
    }
  }
}

class MedicationAdherenceDay extends Equatable {
  const MedicationAdherenceDay({
    required this.date,
    required this.taken,
    required this.total,
    required this.percent,
  });

  final DateTime date;
  final int taken;
  final int total;
  final int percent;

  factory MedicationAdherenceDay.fromJson(Map<String, dynamic> json) =>
      MedicationAdherenceDay(
        date: DateTime.parse(json['date'] as String),
        taken: (json['taken'] as num?)?.toInt() ?? 0,
        total: (json['total'] as num?)?.toInt() ?? 0,
        percent: (json['percent'] as num?)?.toInt() ?? 0,
      );

  @override
  List<Object?> get props => [date, taken, total, percent];
}
