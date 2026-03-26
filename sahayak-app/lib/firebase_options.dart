// Placeholder Firebase config committed safely to the repo.
// Regenerate this file locally with:
//   flutterfire configure --project=<your-project-id>
//
// Do not commit real generated Firebase credentials to Git.
// ignore_for_file: type=lint

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show TargetPlatform, defaultTargetPlatform, kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError('Web platform is not configured for this project.');
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          '${defaultTargetPlatform.name} is not supported.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'REPLACE_WITH_LOCAL_FIREBASE_API_KEY',
    appId: 'REPLACE_WITH_LOCAL_ANDROID_APP_ID',
    messagingSenderId: 'REPLACE_WITH_LOCAL_SENDER_ID',
    projectId: 'REPLACE_WITH_LOCAL_PROJECT_ID',
    storageBucket: 'REPLACE_WITH_LOCAL_STORAGE_BUCKET',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'REPLACE_WITH_LOCAL_FIREBASE_API_KEY',
    appId: 'REPLACE_WITH_LOCAL_IOS_APP_ID',
    messagingSenderId: 'REPLACE_WITH_LOCAL_SENDER_ID',
    projectId: 'REPLACE_WITH_LOCAL_PROJECT_ID',
    storageBucket: 'REPLACE_WITH_LOCAL_STORAGE_BUCKET',
    iosBundleId: 'com.sahayak.sahayakApp',
  );
}
