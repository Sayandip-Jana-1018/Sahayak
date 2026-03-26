// Re-export for multipart usage elsewhere
export 'package:dio/dio.dart' show FormData, MultipartFile, DioException;

import 'package:dio/dio.dart';

class ApiClient {
  ApiClient._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: const String.fromEnvironment(
          'API_BASE_URL', defaultValue: 'http://10.0.2.2:8080'),
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
    ))
      ..interceptors.addAll([
        _authInterceptor,
        LogInterceptor(requestBody: false, responseBody: false),
      ]);
  }

  static final ApiClient instance = ApiClient._internal();
  late final Dio _dio;

  final _AuthInterceptor _authInterceptor = _AuthInterceptor();

  void    setToken(String token) => _authInterceptor.token = token;
  void    clearToken()           => _authInterceptor.token = null;
  String? get currentToken       => _authInterceptor.token;

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) =>
      _dio.get<T>(path, queryParameters: queryParameters);

  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters}) =>
      _dio.post<T>(path, data: data, queryParameters: queryParameters);

  Future<Response<T>> put<T>(String path, {dynamic data}) =>
      _dio.put<T>(path, data: data);

  Future<Response<T>> patch<T>(String path, {dynamic data}) =>
      _dio.patch<T>(path, data: data);

  Future<Response<T>> delete<T>(String path, {dynamic data}) =>
      _dio.delete<T>(path, data: data);

  Future<Response<T>> postMultipart<T>(String path, {required FormData formData}) =>
      _dio.post<T>(path, data: formData);
}

class _AuthInterceptor extends Interceptor {
  String? token;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}
