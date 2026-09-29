from django.urls import path
from apps.views import CustomTokenObtainPairView, CustomTokenRefreshView, RegisterCreateAPIView, UserViewSet

urlpatterns = [
    path('users/', UserViewSet.as_view(), name='user_list'),

    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh-token/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterCreateAPIView.as_view(), name='register'),
]
