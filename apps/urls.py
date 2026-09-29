from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.views import (
    CustomTokenObtainPairView, CustomTokenRefreshView,
    RegisterCreateAPIView, UserViewSet, LeadViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'leads', LeadViewSet, basename='lead')

urlpatterns = [
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh-token/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterCreateAPIView.as_view(), name='register'),

    path('', include(router.urls)),
]
