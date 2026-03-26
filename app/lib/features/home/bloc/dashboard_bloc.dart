import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../data/dashboard_repository.dart';
import '../../../shared/models/models.dart';

// Events
abstract class DashboardEvent extends Equatable {
  const DashboardEvent();
  @override List<Object?> get props => [];
}
class DashboardLoad extends DashboardEvent {
  const DashboardLoad({this.elderlyProfileId});
  final String? elderlyProfileId;
  @override List<Object?> get props => [elderlyProfileId];
}
class DashboardRefresh extends DashboardEvent { const DashboardRefresh(); }

// States
abstract class DashboardState extends Equatable {
  const DashboardState();
  @override List<Object?> get props => [];
}
class DashboardInitial extends DashboardState { const DashboardInitial(); }
class DashboardLoading extends DashboardState { const DashboardLoading(); }
class DashboardLoaded  extends DashboardState {
  const DashboardLoaded(this.data);
  final DashboardData data;
  @override List<Object?> get props => [data];
}
class DashboardCached  extends DashboardLoaded {
  const DashboardCached(super.data);
}
class DashboardError   extends DashboardState {
  const DashboardError(this.message);
  final String message;
  @override List<Object?> get props => [message];
}

// BLoC
class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  DashboardBloc() : super(const DashboardInitial()) {
    on<DashboardLoad>(_onLoad);
    on<DashboardRefresh>(_onRefresh);
  }

  final _repo = DashboardRepository();

  Future<void> _onLoad(DashboardLoad event, Emitter<DashboardState> emit) async {
    // Show cached immediately if available
    final cached = _repo.getCached();
    if (cached != null) emit(DashboardCached(cached));
    emit(const DashboardLoading());
    try {
      final data = await _repo.fetchOverview(
          elderlyProfileId: event.elderlyProfileId);
      emit(DashboardLoaded(data));
    } catch (e) {
      if (cached != null) {
        emit(DashboardCached(cached));
      } else {
        emit(DashboardError(e.toString()));
      }
    }
  }

  Future<void> _onRefresh(DashboardRefresh event, Emitter<DashboardState> emit) async {
    try {
      final data = await _repo.fetchOverview();
      emit(DashboardLoaded(data));
    } catch (e) {
      // Silently fail on refresh
    }
  }
}
