from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField
from rest_framework.serializers import ModelSerializer
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.models import Lead, LeadActivity

User = get_user_model()


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'department',
                  'phone_number', 'bio', 'notify_new_lead', 'notify_status_change',
                  'notify_activity_updates', 'notify_weekly_reports', 'is_active']
        read_only_fields = ['id']


class UserCreateSerializer(ModelSerializer):
    password = CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name',
                  'role', 'department', 'phone_number', 'bio']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LeadActivitySerializer(ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = LeadActivity
        fields = ['id', 'lead', 'user', 'user_details', 'activity_type', 'title',
                  'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeadSerializer(ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    activities = LeadActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = ['id', 'name', 'email', 'phone', 'source', 'status', 'note',
                  'assigned_to', 'assigned_to_details', 'created_by', 'created_by_details',
                  'company', 'website', 'priority', 'estimated_value', 'last_contacted',
                  'activities', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeadCreateSerializer(ModelSerializer):
    class Meta:
        model = Lead
        fields = ['name', 'email', 'phone', 'source', 'status', 'note',
                  'assigned_to', 'company', 'website', 'priority', 'estimated_value']

    def validate_email(self, value):
        if value and Lead.objects.filter(email=value).exists():
            raise ValidationError("A lead with this email already exists.")
        return value


class LeadUpdateSerializer(ModelSerializer):
    class Meta:
        model = Lead
        fields = ['name', 'email', 'phone', 'source', 'status', 'note',
                  'assigned_to', 'company', 'website', 'priority', 'estimated_value',
                  'last_contacted']

    def validate_email(self, value):
        if value:
            lead = self.instance
            if Lead.objects.filter(email=value).exclude(id=lead.id).exists():
                raise ValidationError("A lead with this email already exists.")
        return value


class LeadListSerializer(ModelSerializer):
    assigned_to_name = CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = Lead
        fields = ['id', 'name', 'email', 'phone', 'source', 'status', 'priority',
                  'assigned_to', 'assigned_to_name', 'company', 'created_at']


class CustomTokenObtainPairSerializer(TokenObtainSerializer):
    token_class = RefreshToken

    def validate(self, attrs) -> dict[str, str]:
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        data["data"] = UserSerializer(self.user).data

        return data
