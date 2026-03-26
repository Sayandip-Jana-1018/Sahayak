import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/config/api_config.dart';
import '../../../core/services/audio_service.dart';
import '../../../core/services/storage_service.dart';

// ── Voice States ──────────────────────────────────────────────────────────────
enum VoiceStatus { idle, listening, processing, speaking, error }

class VoiceState extends Equatable {
  static const _unset = Object();

  const VoiceState({
    required this.status,
    this.responseText,
    this.transcribedText,
    this.intent,
    this.language,
    this.errorMessage,
    this.shouldAlertCaregiver = false,
  });

  final VoiceStatus status;
  final String?     responseText;
  final String?     transcribedText;
  final String?     intent;
  final String?     language;
  final String?     errorMessage;
  final bool        shouldAlertCaregiver;

  VoiceState copyWith({
    VoiceStatus? status,
    Object?      responseText = _unset,
    Object?      transcribedText = _unset,
    Object?      intent = _unset,
    Object?      language = _unset,
    Object?      errorMessage = _unset,
    bool?        shouldAlertCaregiver,
  }) =>
      VoiceState(
        status:              status              ?? this.status,
        responseText:        identical(responseText, _unset) ? this.responseText : responseText as String?,
        transcribedText:     identical(transcribedText, _unset) ? this.transcribedText : transcribedText as String?,
        intent:              identical(intent, _unset) ? this.intent : intent as String?,
        language:            identical(language, _unset) ? this.language : language as String?,
        errorMessage:        identical(errorMessage, _unset) ? this.errorMessage : errorMessage as String?,
        shouldAlertCaregiver: shouldAlertCaregiver ?? this.shouldAlertCaregiver,
      );

  static const idle = VoiceState(status: VoiceStatus.idle);

  @override
  List<Object?> get props => [
        status, responseText, transcribedText, intent, language,
        errorMessage, shouldAlertCaregiver
      ];
}

// ── Voice Events ──────────────────────────────────────────────────────────────
abstract class VoiceEvent extends Equatable {
  const VoiceEvent();
  @override List<Object?> get props => [];
}
class VoiceStart    extends VoiceEvent { const VoiceStart(); }
class VoiceStop extends VoiceEvent {
  const VoiceStop({required this.language});
  final String language;
  @override
  List<Object?> get props => [language];
}
class VoiceSubmit   extends VoiceEvent {
  const VoiceSubmit({required this.text, required this.language});
  final String text;
  final String language;
  @override List<Object?> get props => [text, language];
}
class VoiceCompanion extends VoiceEvent {
  const VoiceCompanion({required this.message, required this.language});
  final String message;
  final String language;
  @override List<Object?> get props => [message, language];
}
class VoiceReset    extends VoiceEvent { const VoiceReset(); }

// ── BLoC ──────────────────────────────────────────────────────────────────────
class VoiceBloc extends Bloc<VoiceEvent, VoiceState> {
  VoiceBloc() : super(VoiceState.idle) {
    on<VoiceStart>(_onStart);
    on<VoiceStop>(_onStop);
    on<VoiceSubmit>(_onSubmit);
    on<VoiceCompanion>(_onCompanion);
    on<VoiceReset>((_,emit) => emit(VoiceState.idle));
  }

  final List<Map<String, String>> _history = [];

  Future<void> _onStart(VoiceStart event, Emitter<VoiceState> emit) async {
    await AudioService.instance.startRecording();
    emit(state.copyWith(status: VoiceStatus.listening));
  }

  Future<void> _onStop(VoiceStop event, Emitter<VoiceState> emit) async {
    final recordingPath = await AudioService.instance.stopRecording();
    if (recordingPath == null) {
      emit(state.copyWith(
        status: VoiceStatus.error,
        errorMessage: 'Recording unavailable. Please try again.',
      ));
      return;
    }

    emit(state.copyWith(status: VoiceStatus.processing));

    try {
      final formData = FormData.fromMap({
        'language': event.language,
        if (StorageService.instance.activeProfileId != null)
          'elderlyProfileId': StorageService.instance.activeProfileId,
        'audio': await MultipartFile.fromFile(
          recordingPath,
          filename: 'voice_input.m4a',
        ),
      });

      final res = await ApiClient.instance.postMultipart(
        ApiConfig.aiVoiceDemo,
        formData: formData,
      );
      final data = res.data as Map<String, dynamic>;
      final text = data['response_text'] as String? ?? '';
      final transcript = data['transcribed_text'] as String?;
      final intent = data['intent'] as String? ?? 'general';
      final lang = data['language'] as String? ?? event.language;
      final audio = data['audio_base64'] as String?;

      emit(state.copyWith(
        status: VoiceStatus.speaking,
        responseText: text,
        transcribedText: transcript,
        intent: intent,
        language: lang,
        errorMessage: null,
      ));

      await AudioService.instance.speakResponse(
        text: text,
        language: lang,
        audioBase64: audio,
      );

      emit(state.copyWith(status: VoiceStatus.idle));
    } on DioException catch (e) {
      emit(state.copyWith(
        status: VoiceStatus.error,
        errorMessage: handleDioException(e).message,
      ));
      await AudioService.instance.speakResponse(
        text: 'Nahi hua. Phir try karein.',
        language: event.language,
      );
    }
  }

  Future<void> _onSubmit(VoiceSubmit event, Emitter<VoiceState> emit) async {
    emit(state.copyWith(status: VoiceStatus.processing));
    try {
      final res = await ApiClient.instance.post(
        ApiConfig.aiVoiceDemo,
        data: {
          'text': event.text,
          'language': event.language,
          if (StorageService.instance.activeProfileId != null)
            'elderlyProfileId': StorageService.instance.activeProfileId,
        },
      );
      final data = res.data as Map<String, dynamic>;
      final text   = data['response_text'] as String? ?? '';
      final intent = data['intent']        as String? ?? 'general';
      final lang   = data['language']      as String? ?? event.language;
      final audio  = data['audio_base64']  as String?;

      emit(state.copyWith(
        status:       VoiceStatus.speaking,
        responseText: text,
        transcribedText: event.text,
        intent:       intent,
        language:     lang,
        errorMessage: null,
      ));

      await AudioService.instance.speakResponse(
        text:        text,
        language:    lang,
        audioBase64: audio,
      );

      emit(state.copyWith(status: VoiceStatus.idle));
    } on DioException catch (e) {
      emit(state.copyWith(
        status:       VoiceStatus.error,
        errorMessage: handleDioException(e).message,
      ));
    }
  }

  Future<void> _onCompanion(VoiceCompanion event, Emitter<VoiceState> emit) async {
    emit(state.copyWith(status: VoiceStatus.processing));
    try {
      _history.add({'role': 'user', 'content': event.message});
      final res = await ApiClient.instance.post(
        ApiConfig.aiCompanion,
        data: {
          'message':             event.message,
          'language':            event.language,
          'conversationHistory': _history,
        },
      );
      final data     = res.data as Map<String, dynamic>;
      final response = data['response']              as String? ?? '';
      final alert    = data['should_alert_caregiver'] as bool?  ?? false;
      _history.add({'role': 'assistant', 'content': response});

      emit(state.copyWith(
        status:              VoiceStatus.speaking,
        responseText:        response,
        shouldAlertCaregiver: alert,
      ));

      await AudioService.instance.speakResponse(
        text: response, language: event.language);
      emit(state.copyWith(status: VoiceStatus.idle));
    } on DioException catch (e) {
      emit(state.copyWith(
        status: VoiceStatus.error,
        errorMessage: handleDioException(e).message,
      ));
    }
  }
}
