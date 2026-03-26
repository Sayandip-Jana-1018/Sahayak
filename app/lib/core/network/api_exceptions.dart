import 'package:dio/dio.dart';

sealed class ApiException implements Exception {
  const ApiException(this.message);
  final String message;
}

class UnauthorizedException extends ApiException {
  const UnauthorizedException() : super('आपका सत्र समाप्त हो गया। कृपया फिर से लॉगिन करें।');
}

class RateLimitException extends ApiException {
  const RateLimitException() : super('बहुत सारे अनुरोध। कृपया थोड़ी देर बाद कोशिश करें।');
}

class ServerException extends ApiException {
  const ServerException([String? msg])
      : super(msg ?? 'सर्वर में कोई समस्या आई। हमारी टीम को सूचित किया गया है।');
}

class NetworkException extends ApiException {
  const NetworkException()
      : super('इंटरनेट कनेक्शन नहीं है। कृपया अपना नेटवर्क जांचें।');
}

class NotFoundException extends ApiException {
  const NotFoundException([String? msg]) : super(msg ?? 'डेटा नहीं मिला।');
}

class ValidationException extends ApiException {
  const ValidationException(String msg) : super(msg);
}

ApiException handleDioException(DioException e) {
  if (e.type == DioExceptionType.connectionError ||
      e.type == DioExceptionType.connectionTimeout ||
      e.type == DioExceptionType.receiveTimeout) {
    return const NetworkException();
  }
  final statusCode = e.response?.statusCode;
  final msg = e.response?.data?['message'] as String?;
  return switch (statusCode) {
    400 => ValidationException(msg ?? 'गलत जानकारी दी गई है।'),
    401 => const UnauthorizedException(),
    404 => NotFoundException(msg),
    429 => const RateLimitException(),
    502 || 503 => ServerException(msg),
    _   => ServerException(msg),
  };
}
