# sahayak_app

Flutter app for Sahayak's elderly-first mobile experience.

## Firebase setup

Real Firebase credentials are intentionally not stored in Git.

Before running the app locally:

1. Regenerate `lib/firebase_options.dart`
```bash
flutterfire configure --project=<your-project-id>
```

2. Replace `android/app/google-services.json` with your real Firebase file.

3. Then run:
```bash
flutter pub get
flutter gen-l10n
flutter run
```

If you rotate your Firebase API key, regenerate both files locally and avoid committing real credentials back to the repository.
