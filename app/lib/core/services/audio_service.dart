import 'dart:convert';
import 'dart:io';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:just_audio/just_audio.dart';
import 'package:audio_session/audio_session.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

/// BCP-47 locale map for flutter_tts — 11 Indian languages
const Map<String, String> _ttsLocales = {
  'hi': 'hi-IN',
  'ta': 'ta-IN',
  'bn': 'bn-IN',
  'mr': 'mr-IN',
  'te': 'te-IN',
  'kn': 'kn-IN',
  'gu': 'gu-IN',
  'pa': 'pa-IN',
  'ml': 'ml-IN',
  'ur': 'ur-PK',
  'en': 'en-IN',
};

class AudioService {
  AudioService._();
  static final AudioService instance = AudioService._();

  final _tts    = FlutterTts();
  final _player = AudioPlayer();
  final _recorder = AudioRecorder();

  bool _isRecording = false;
  String? _recordingPath;
  String? _playbackPath;

  bool get isRecording => _isRecording;

  // ── Init ──────────────────────────────────────────────────────────────────
  Future<void> init() async {
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration(
      avAudioSessionCategory:     AVAudioSessionCategory.playAndRecord,
      avAudioSessionCategoryOptions:
          AVAudioSessionCategoryOptions.defaultToSpeaker,
      avAudioSessionMode: AVAudioSessionMode.spokenAudio,
      androidAudioAttributes: AndroidAudioAttributes(
        contentType: AndroidAudioContentType.speech,
        usage:       AndroidAudioUsage.voiceCommunication,
      ),
      androidAudioFocusGainType: AndroidAudioFocusGainType.gain,
    ));

    await _tts.setLanguage('hi-IN');
    await _tts.setSpeechRate(0.75); // Slower for elderly
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);
  }

  // ── Recording ─────────────────────────────────────────────────────────────
  Future<void> startRecording() async {
    if (_isRecording) return;
    final dir  = await getTemporaryDirectory();
    _recordingPath = '${dir.path}/sahayak_voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
    final session = await AudioSession.instance;
    await session.setActive(true);
    await _recorder.start(
      RecordConfig(encoder: AudioEncoder.aacLc, bitRate: 128000),
      path: _recordingPath!,
    );
    _isRecording = true;
  }

  Future<String?> stopRecording() async {
    if (!_isRecording) return null;
    await _recorder.stop();
    _isRecording = false;
    final session = await AudioSession.instance;
    await session.setActive(false);
    return _recordingPath;
  }

  // ── Speak response (with audio_base64 fallback) ───────────────────────────
  /// Speaks the response from the AI voice API.
  /// If [audioBase64] is non-null (future backend), plays it directly.
  /// Otherwise falls back to flutter_tts with [language] locale.
  Future<void> speakResponse({
    required String text,
    required String language,
    String? audioBase64,
  }) async {
    final session = await AudioSession.instance;
    await session.setActive(true);
    await _tts.stop();
    await _player.stop();

    if (audioBase64 != null && audioBase64.isNotEmpty) {
      final dir = await getTemporaryDirectory();
      _playbackPath = '${dir.path}/sahayak_tts_${DateTime.now().millisecondsSinceEpoch}.mp3';
      final bytes = base64Decode(audioBase64);
      final audioFile = File(_playbackPath!);
      await audioFile.writeAsBytes(bytes, flush: true);
      await _player.setFilePath(audioFile.path);
      await _player.play();
    } else {
      final locale = _ttsLocales[language] ?? 'hi-IN';
      await _tts.setLanguage(locale);
      await _tts.speak(text);
    }
  }

  Future<void> stopSpeaking() async {
    await _tts.stop();
    await _player.stop();
    if (_playbackPath != null) {
      try {
        await File(_playbackPath!).delete();
      } catch (_) {
        // Best-effort cleanup for temporary playback files.
      }
      _playbackPath = null;
    }
  }

  Future<void> dispose() async {
    await stopSpeaking();
    await _recorder.dispose();
    await _player.dispose();
    await _tts.stop();
  }
}
