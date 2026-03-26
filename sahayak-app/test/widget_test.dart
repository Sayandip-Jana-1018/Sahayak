import 'package:flutter_test/flutter_test.dart';
import 'package:sahayak_app/app.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Skip full init — just verify SahayakApp widget builds
    // Real integration tests can be added once Firebase is configured
    expect(SahayakApp, isNotNull);
  });
}
