from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.views import (
    CustomTokenObtainPairView, CustomTokenRefreshView,
    RegisterCreateAPIView, UserViewSet, LeadViewSet, LeadActivityViewSet, UserProfileView, DashboardStatsAPIView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'activities', LeadActivityViewSet, basename='activity')

urlpatterns = [
    path('dashboard/stats/', DashboardStatsAPIView.as_view(), name='dashboard_stats'),

    path('auth/users/me/', UserProfileView.as_view(), name='user_profile'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh-token/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterCreateAPIView.as_view(), name='register'),

    path('', include(router.urls)),
]
