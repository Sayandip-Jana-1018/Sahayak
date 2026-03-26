import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';

class Step3Language extends StatefulWidget {
  const Step3Language({
    super.key,
    required this.initialLanguage,
    required this.onNext,
  });

  final String?                 initialLanguage;
  final void Function(String)   onNext;

  @override
  State<Step3Language> createState() => _Step3State();
}

class _Step3State extends State<Step3Language> {
  late String? _selected;

  static const _languages = [
    {'code': 'hi', 'name': 'हिंदी',    'sub': 'Hindi'},
    {'code': 'ta', 'name': 'தமிழ்',   'sub': 'Tamil'},
    {'code': 'bn', 'name': 'বাংলা',    'sub': 'Bengali'},
    {'code': 'mr', 'name': 'मराठी',   'sub': 'Marathi'},
    {'code': 'te', 'name': 'తెలుగు',  'sub': 'Telugu'},
    {'code': 'kn', 'name': 'ಕನ್ನಡ',   'sub': 'Kannada'},
    {'code': 'gu', 'name': 'ગુજરાતી', 'sub': 'Gujarati'},
    {'code': 'pa', 'name': 'ਪੰਜਾਬੀ',  'sub': 'Punjabi'},
    {'code': 'ml', 'name': 'മലയാളം',  'sub': 'Malayalam'},
    {'code': 'ur', 'name': 'اردو',     'sub': 'Urdu'},
    {'code': 'en', 'name': 'English',  'sub': 'English'},
  ];

  @override
  void initState() {
    super.initState();
    _selected = widget.initialLanguage;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = Theme.of(context).colorScheme.primary;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('बुजुर्ग की भाषा',
              style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text('Sahayak इसी भाषा में बात करेगा',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 24),

          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount:   3,
                crossAxisSpacing: 12,
                mainAxisSpacing:  12,
                childAspectRatio: 1.1,
              ),
              itemCount: _languages.length,
              itemBuilder: (context, i) {
                final lang     = _languages[i];
                final isActive = _selected == lang['code'];
                return GestureDetector(
                  onTap: () => setState(() => _selected = lang['code']),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      color: isActive
                          ? accent.withOpacity(0.15)
                          : SahayakColors.glassFill(isDark),
                      border: Border.all(
                        color: isActive
                            ? accent
                            : SahayakColors.glassBorder(isDark),
                        width: isActive ? 2 : 1,
                      ),
                      boxShadow: isActive
                          ? [BoxShadow(
                              color: accent.withOpacity(0.3),
                              blurRadius: 12,
                            )]
                          : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          lang['name']!,
                          style: TextStyle(
                            fontSize:   18,
                            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                            color:      isActive
                                ? accent
                                : SahayakColors.textPrimary(isDark),
                            fontFamily: 'NotoSansDevanagari',
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          lang['sub']!,
                          style: TextStyle(
                            fontSize: 11,
                            color:    SahayakColors.textMuted(isDark),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 16),
          FilledButton(
            onPressed: _selected != null
                ? () => widget.onNext(_selected!)
                : null,
            child: const Text('आगे बढ़ें →'),
          ),
        ],
      ),
    );
  }
}
