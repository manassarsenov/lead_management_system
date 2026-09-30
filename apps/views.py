from django.contrib.auth import get_user_model
from django.db.models.aggregates import Sum, Count
from django.db.models.query_utils import Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.models import Lead, LeadActivity
from apps.serializers import (
    UserCreateSerializer, UserSerializer,
    LeadSerializer, LeadCreateSerializer, LeadUpdateSerializer, LeadListSerializer,
    LeadActivitySerializer, CustomTokenObtainPairSerializer, DashboardStatsSerializer
)

User = get_user_model()


def is_admin(user):
    return user.is_staff or getattr(user, 'role', None) == 'admin'


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and is_admin(request.user)


def visible_leads(user):
    qs = Lead.objects.all()
    if is_admin(user):
        return qs
    return qs.filter(Q(assigned_to=user) | Q(created_by=user))


@extend_schema(tags=['auth'])
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema(tags=['auth'])
class CustomTokenRefreshView(TokenRefreshView):
    pass


@extend_schema(tags=['auth'])
class RegisterCreateAPIView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save()


@extend_schema(tags=['users'])
class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['email', 'date_joined']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]

        return [IsAuthenticated()]


@extend_schema(tags=['users'])
class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@extend_schema(tags=['leads'])
class LeadViewSet(ModelViewSet):
    queryset = Lead.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'source', 'priority', 'assigned_to']
    search_fields = ['name', 'email', 'phone', 'company']
    ordering_fields = ['name', 'created_at', 'status', 'priority']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = visible_leads(self.request.user).select_related('assigned_to', 'created_by')
        if self.action == 'retrieve':
            qs = qs.prefetch_related('activities')
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return LeadListSerializer
        elif self.action == 'create':
            return LeadCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LeadUpdateSerializer
        return LeadSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@extend_schema(tags=['activities'])
class LeadActivityViewSet(ModelViewSet):
    queryset = LeadActivity.objects.all()
    serializer_class = LeadActivitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['lead', 'activity_type']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return LeadActivity.objects.select_related('lead', 'user').filter(
            lead__in=visible_leads(self.request.user)
        )

    def _check_lead_access(self, serializer):
        lead = serializer.validated_data.get('lead')
        if lead and not visible_leads(self.request.user).filter(pk=lead.pk).exists():
            raise PermissionDenied("Bu leadga yozuv qo'sha olmaysiz.")

    def perform_create(self, serializer):
        self._check_lead_access(serializer)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        self._check_lead_access(serializer)
        serializer.save()


@extend_schema(
    tags=['dashboard'],
    responses={200: DashboardStatsSerializer})
class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leads = visible_leads(request.user)

        total_leads = leads.count()
        total_pipeline_value = leads.aggregate(total=Sum('estimated_value'))['total'] or 0
        won_leads = leads.filter(status='won').count()
        conversion_rate = round((won_leads / total_leads * 100), 2) if total_leads > 0 else 0

        status_counts = leads.order_by().values('status').annotate(count=Count('id'))
        status_breakdown = {item['status']: item['count'] for item in status_counts}

        # Calculate weekly growth percentages comparing last 7 days vs previous 7 days
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        week_ago = now - timedelta(days=7)
        two_weeks_ago = now - timedelta(days=14)

        def calc_growth(queryset, status_filter=None):
            qs = queryset if status_filter is None else queryset.filter(status=status_filter)
            current_week = qs.filter(created_at__gte=week_ago).count()
            prev_week = qs.filter(created_at__gte=two_weeks_ago, created_at__lt=week_ago).count()
            if prev_week == 0:
                return 100.0 if current_week > 0 else 0.0
            return round(((current_week - prev_week) / prev_week) * 100, 1)

        total_growth = calc_growth(leads)
        new_growth = calc_growth(leads, 'new')
        contacted_growth = calc_growth(leads, 'contacted')
        qualified_growth = calc_growth(leads, 'qualified')
        won_growth = calc_growth(leads, 'won')
        lost_growth = calc_growth(leads, 'lost')

        return Response({
            'total_leads': total_leads,
            'total_pipeline_value': float(total_pipeline_value),
            'won_leads': won_leads,
            'conversion_rate': conversion_rate,
            'status_breakdown': status_breakdown,
            'growth': {
                'total': total_growth,
                'new': new_growth,
                'contacted': contacted_growth,
                'qualified': qualified_growth,
                'won': won_growth,
                'lost': lost_growth,
            }
        })
