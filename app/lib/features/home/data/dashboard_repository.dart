import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';
import '../../../core/config/api_config.dart';
import '../../../core/services/storage_service.dart';
import '../../../shared/models/models.dart';

class DashboardRepository {
  DashboardData? getCached() => StorageService.instance.cachedDashboard;

  Future<DashboardData> fetchOverview({String? elderlyProfileId}) async {
    try {
      final pid = elderlyProfileId ??
          StorageService.instance.activeProfileId;

      final response = await ApiClient.instance.get(
        ApiConfig.dashboardOverview,
        queryParameters: pid != null ? {'elderlyProfileId': pid} : null,
      );

      final json = response.data as Map<String, dynamic>;

      // Cache it
      await StorageService.instance.cacheDashboard(json);

      return DashboardData.fromJson(json);
    } on DioException catch (e) {
      throw handleDioException(e);
    }
  }
}
