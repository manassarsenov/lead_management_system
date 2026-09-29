from django.urls import path
from apps.views import CustomTokenObtainPairView, CustomTokenRefreshView, RegisterView

urlpatterns = [
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh-token/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
]
