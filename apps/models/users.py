from django.contrib.auth.models import BaseUserManager, AbstractUser
from django.db.models import TextChoices
from django.db.models.fields import EmailField, CharField, TextField, BooleanField


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email manzil kiritilishi shart')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(TextChoices):
        ADMIN = 'admin', 'Administrator'
        SALES = 'sales', 'Sales Representative'

    email = EmailField('email address', unique=True)
    role = CharField(max_length=20, choices=Role.choices, default=Role.SALES)

    department = CharField(max_length=50, blank=True, null=True)
    phone_number = CharField(max_length=20, blank=True, null=True)
    bio = TextField(blank=True, null=True)

    notify_new_lead = BooleanField(default=True)
    notify_status_change = BooleanField(default=True)
    notify_activity_updates = BooleanField(default=False)
    notify_weekly_reports = BooleanField(default=True)

    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
