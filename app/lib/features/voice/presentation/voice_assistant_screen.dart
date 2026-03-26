import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../core/services/storage_service.dart';
import '../../../core/services/upi_service.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/glass_card.dart';
import '../bloc/voice_bloc.dart';
import 'widgets/payment_handoff_sheet.dart';

class VoiceAssistantScreen extends StatefulWidget {
  const VoiceAssistantScreen({super.key});

  @override
  State<VoiceAssistantScreen> createState() => _VoiceAssistantScreenState();
}

class _VoiceAssistantScreenState extends State<VoiceAssistantScreen>
    with TickerProviderStateMixin {
  late final AnimationController _pulseCtrl;
  late final TextEditingController _textCtrl;
  String _language = 'hi';
  bool _companionMode = false;

  @override
  void initState() {
    super.initState();
    _language = StorageService.instance.language;
    _textCtrl = TextEditingController();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _textCtrl.dispose();
    super.dispose();
  }

  void _toggleMic(VoiceStatus status) {
    if (status == VoiceStatus.idle) {
      HapticFeedback.mediumImpact();
      context.read<VoiceBloc>().add(const VoiceStart());
      return;
    }

    if (status == VoiceStatus.listening) {
      HapticFeedback.lightImpact();
      context.read<VoiceBloc>().add(VoiceStop(language: _language));
    }
  }

  void _submitTypedText() {
    final text = _textCtrl.text.trim();
    if (text.isEmpty) return;

    if (_companionMode) {
      context.read<VoiceBloc>().add(
            VoiceCompanion(message: text, language: _language),
          );
    } else {
      context.read<VoiceBloc>().add(
            VoiceSubmit(text: text, language: _language),
          );
    }
    _textCtrl.clear();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.center,
            radius: 1.05,
            colors: isDark
                ? [
                    SahayakColors.voiceViolet.withValues(alpha: 0.18),
                    SahayakColors.darkBg,
                    SahayakColors.darkSurface,
                  ]
                : [
                    SahayakColors.voiceViolet.withValues(alpha: 0.08),
                    SahayakColors.lightBg,
                    SahayakColors.lightSurface,
                  ],
          ),
        ),
        child: SafeArea(
          child: BlocConsumer<VoiceBloc, VoiceState>(
            listenWhen: (previous, current) =>
                previous.intent != current.intent || previous.status != current.status,
            listener: (context, state) {
              if (state.intent == 'emergency' &&
                  (state.status == VoiceStatus.speaking || state.status == VoiceStatus.idle)) {
                context.go('/sos-trigger');
              }
            },
            builder: (context, state) {
              return Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
                    child: Row(
                      children: [
                        _StatusChip(status: state.status),
                        const Spacer(),
                        GlassCard(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _language.toUpperCase(),
                                style: Theme.of(context).textTheme.labelMedium,
                              ),
                              const SizedBox(width: 8),
                              InkWell(
                                onTap: () {
                                  final langs = [
                                    'hi',
                                    'en',
                                    'ta',
                                    'bn',
                                    'mr',
                                    'te',
                                    'kn',
                                  ];
                                  final idx = langs.indexOf(_language);
                                  setState(() {
                                    _language = langs[(idx + 1) % langs.length];
                                  });
                                  StorageService.instance.setLanguage(_language);
                                },
                                child: Icon(
                                  Icons.translate_rounded,
                                  size: 18,
                                  color: accent,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 22),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Text(
                      state.transcribedText ?? 'Tap the mic and speak naturally.',
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontStyle: FontStyle.italic,
                            color: SahayakColors.textMuted(isDark),
                          ),
                    ),
                  ),
                  const SizedBox(height: 26),
                  _WaveformPanel(status: state.status),
                  const Spacer(),
                  if (state.responseText != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      child: GlassCard(
                        accentColor: SahayakColors.voiceViolet,
                        padding: const EdgeInsets.all(18),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                color:
                                    SahayakColors.voiceViolet.withValues(alpha: 0.14),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              alignment: Alignment.center,
                              child: const Text(
                                '🙏',
                                style: TextStyle(fontSize: 20),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                state.responseText!,
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                          ],
                        ),
                      )
                          .animate()
                          .fadeIn(duration: 320.ms)
                          .slideY(begin: 0.08, end: 0),
                    ),
                  if (state.intent == 'payment')
                    Padding(
                      padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
                      child: _PaymentIntentCard(
                        transcribedText: state.transcribedText,
                      ),
                    ),
                  if (state.errorMessage != null)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
                      child: AccentGlassCard(
                        accent: SahayakColors.warningOrange,
                        child: Text(
                          state.errorMessage!,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                    ),
                  const SizedBox(height: 24),
                  _HeroMicButton(
                    status: state.status,
                    pulseCtrl: _pulseCtrl,
                    onTap: () => _toggleMic(state.status),
                  ),
                  const SizedBox(height: 20),
                  _QuickVoiceActions(
                    onSelected: (text) {
                      context.read<VoiceBloc>().add(
                            VoiceSubmit(text: text, language: _language),
                          );
                    },
                  ),
                  const SizedBox(height: 18),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: GlassCard(
                      padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  _companionMode
                                      ? 'Companion mode is on'
                                      : 'Manual text fallback',
                                  style: Theme.of(context).textTheme.labelMedium,
                                ),
                              ),
                              Switch(
                                value: _companionMode,
                                onChanged: (value) {
                                  setState(() => _companionMode = value);
                                },
                                activeThumbColor: SahayakColors.voiceViolet,
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _textCtrl,
                                  textInputAction: TextInputAction.send,
                                  onSubmitted: (_) => _submitTypedText(),
                                  decoration: const InputDecoration(
                                    hintText: 'Type only if voice is not possible',
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              IconButton.filled(
                                onPressed: _submitTypedText,
                                icon: const Icon(Icons.send_rounded),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});

  final VoiceStatus status;

  @override
  Widget build(BuildContext context) {
    final (label, color, icon) = switch (status) {
      VoiceStatus.idle => ('Ready', Colors.white, Icons.check_circle_rounded),
      VoiceStatus.listening =>
        ('Listening', SahayakColors.sosRed, Icons.hearing_rounded),
      VoiceStatus.processing =>
        ('Thinking', SahayakColors.medicineAmber, Icons.auto_awesome_rounded),
      VoiceStatus.speaking =>
        ('Speaking', SahayakColors.voiceViolet, Icons.volume_up_rounded),
      VoiceStatus.error =>
        ('Retry', SahayakColors.warningOrange, Icons.error_outline_rounded),
    };

    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _WaveformPanel extends StatelessWidget {
  const _WaveformPanel({required this.status});

  final VoiceStatus status;

  @override
  Widget build(BuildContext context) {
    final bars = List<int>.generate(40, (index) {
      final pattern = [12, 18, 26, 34, 26, 18];
      return pattern[index % pattern.length];
    });

    final isListening = status == VoiceStatus.listening;
    final isProcessing = status == VoiceStatus.processing;
    final isSpeaking = status == VoiceStatus.speaking;
    final color = isListening
        ? SahayakColors.saffron
        : isProcessing
            ? SahayakColors.medicineAmber
            : isSpeaking
                ? SahayakColors.voiceViolet
                : Colors.white.withValues(alpha: 0.25);

    return SizedBox(
      height: 124,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: bars.asMap().entries.map((entry) {
          final index = entry.key;
          final height = isListening || isSpeaking
              ? entry.value.toDouble()
              : isProcessing
                  ? (12 + ((index % 8) * 4)).toDouble()
                  : 10.0;
          return AnimatedContainer(
            duration: Duration(milliseconds: 220 + ((index % 6) * 30)),
            curve: Curves.easeInOut,
            width: 5,
            height: height,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(999),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _HeroMicButton extends StatelessWidget {
  const _HeroMicButton({
    required this.status,
    required this.pulseCtrl,
    required this.onTap,
  });

  final VoiceStatus status;
  final AnimationController pulseCtrl;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isListening = status == VoiceStatus.listening;
    final isProcessing = status == VoiceStatus.processing;
    final isSpeaking = status == VoiceStatus.speaking;
    final baseColor = isListening
        ? SahayakColors.sosRed
        : isProcessing
            ? SahayakColors.voiceViolet
            : Theme.of(context).colorScheme.primary;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedBuilder(
        animation: pulseCtrl,
        builder: (_, child) {
          final ripple = pulseCtrl.value;
          return Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 176 + (ripple * (isListening ? 34 : 20)),
                height: 176 + (ripple * (isListening ? 34 : 20)),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: baseColor.withValues(
                      alpha: isListening ? 0.28 - (ripple * 0.2) : 0.18,
                    ),
                    width: 2,
                  ),
                ),
              ),
              child!,
            ],
          );
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 260),
          curve: Curves.easeOutCubic,
          width: 160,
          height: 160,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: SahayakColors.primaryGradient(
              baseColor,
              isListening
                  ? const Color(0xFFB71C1C)
                  : Theme.of(context).colorScheme.secondary,
            ),
            boxShadow: [
              BoxShadow(
                color: baseColor.withValues(alpha: 0.32),
                blurRadius: 28,
                offset: const Offset(0, 14),
              ),
            ],
          ),
          child: Center(
            child: isProcessing
                ? const SizedBox(
                    width: 42,
                    height: 42,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      color: Colors.white,
                    ),
                  )
                : Icon(
                    isListening
                        ? Icons.stop_rounded
                        : isSpeaking
                            ? Icons.volume_up_rounded
                            : Icons.mic_rounded,
                    size: 64,
                    color: Colors.white,
                  ),
          ),
        ),
      ),
    );
  }
}

class _QuickVoiceActions extends StatelessWidget {
  const _QuickVoiceActions({required this.onSelected});

  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    final actions = const [
      ('Pay', 'Beti ko 500 bhejo'),
      ('Balance', 'Mera balance batao'),
      ('Medicine', 'Dawai ki yaad dilao'),
      ('Help', 'Mujhe madad chahiye'),
      ('Schemes', 'Mere liye sarkari yojana batao'),
      ('Document', 'Yeh document samjhao'),
    ];

    return SizedBox(
      height: 52,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 18),
        itemBuilder: (_, index) {
          final action = actions[index];
          return ActionChip(
            label: Text(action.$1),
            onPressed: () {
              HapticFeedback.lightImpact();
              onSelected(action.$2);
            },
          );
        },
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemCount: actions.length,
      ),
    );
  }
}

class _PaymentIntentCard extends StatelessWidget {
  const _PaymentIntentCard({required this.transcribedText});

  final String? transcribedText;

  @override
  Widget build(BuildContext context) {
    final amount = UpiService.instance.extractAmount(transcribedText);
    final payee = UpiService.instance.extractSuggestedRecipient(transcribedText) ??
        StorageService.instance.lastUpiName;

    return AccentGlassCard(
      accent: SahayakColors.saffron,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: SahayakColors.saffron.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.account_balance_wallet_rounded,
                  color: SahayakColors.saffron,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Payment handoff ready',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      amount != null
                          ? 'Amount detected: Rs ${amount == amount.truncateToDouble() ? amount.toStringAsFixed(0) : amount.toStringAsFixed(2)}'
                          : 'Amount was not detected clearly from the voice request',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            payee != null && payee.isNotEmpty
                ? 'You can continue to a UPI app for a manual, safe payment to $payee.'
                : 'You can continue to a UPI app for a manual, safe payment after confirming the beneficiary.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () {
                showModalBottomSheet<void>(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => PaymentHandoffSheet(
                    transcribedText: transcribedText,
                    initialAmount: amount,
                    initialPayeeName: payee,
                  ),
                );
              },
              icon: const Icon(Icons.open_in_new_rounded),
              label: const Text('Open UPI app'),
            ),
          ),
        ],
      ),
    );
  }
}
