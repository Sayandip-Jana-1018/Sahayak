import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/config/api_config.dart';
import '../../../core/services/storage_service.dart';
import '../../../shared/models/models.dart';

// Events
abstract class HealthEvent extends Equatable {
  const HealthEvent();
  @override List<Object?> get props => [];
}
class HealthLoad    extends HealthEvent { const HealthLoad(); }
class HealthAddNote extends HealthEvent {
  const HealthAddNote(this.noteText);
  final String noteText;
  @override List<Object?> get props => [noteText];
}
class HealthAddAppointment extends HealthEvent {
  const HealthAddAppointment(this.data);
  final Map<String, dynamic> data;
  @override List<Object?> get props => [data];
}

// States
abstract class HealthState extends Equatable {
  const HealthState();
  @override List<Object?> get props => [];
}
class HealthInitial extends HealthState {}
class HealthLoading extends HealthState {}
class HealthLoaded  extends HealthState {
  const HealthLoaded({required this.notes, required this.appointments});
  final List<HealthNote>    notes;
  final List<Appointment> appointments;
  @override List<Object?> get props => [notes, appointments];
}
class HealthError extends HealthState {
  const HealthError(this.message);
  final String message;
  @override List<Object?> get props => [message];
}

// BLoC
class HealthBloc extends Bloc<HealthEvent, HealthState> {
  HealthBloc() : super(HealthInitial()) {
    on<HealthLoad>(_onLoad);
    on<HealthAddNote>(_onAddNote);
    on<HealthAddAppointment>(_onAddAppt);
  }

  Future<void> _onLoad(HealthLoad event, Emitter<HealthState> emit) async {
    emit(HealthLoading());
    try {
      final pid = StorageService.instance.activeProfileId;
      final qp  = pid != null ? {'elderlyProfileId': pid} : null;

      final notesRes = await ApiClient.instance.get(
          ApiConfig.healthNotes, queryParameters: qp);
      final apptsRes = await ApiClient.instance.get(
          ApiConfig.appointments, queryParameters: qp);

      final notes = (notesRes.data as List)
          .map((e) => HealthNote.fromJson(e as Map<String, dynamic>))
          .toList();
      final apts  = (apptsRes.data as List)
          .map((e) => Appointment.fromJson(e as Map<String, dynamic>))
          .toList();

      emit(HealthLoaded(notes: notes, appointments: apts));
    } on DioException catch (e) {
      emit(HealthError(handleDioException(e).message));
    }
  }

  Future<void> _onAddNote(HealthAddNote event, Emitter<HealthState> emit) async {
    try {
      final pid = StorageService.instance.activeProfileId;
      await ApiClient.instance.post(ApiConfig.healthNotes, data: {
        'elderlyProfileId': pid,
        'noteText':         event.noteText,
      });
      add(const HealthLoad());
    } on DioException catch (e) {
      emit(HealthError(handleDioException(e).message));
    }
  }

  Future<void> _onAddAppt(HealthAddAppointment event, Emitter<HealthState> emit) async {
    try {
      await ApiClient.instance.post(ApiConfig.appointments, data: event.data);
      add(const HealthLoad());
    } on DioException catch (e) {
      emit(HealthError(handleDioException(e).message));
    }
  }
}
