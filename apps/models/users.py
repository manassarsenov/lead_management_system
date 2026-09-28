from django.contrib.auth.models import AbstractUser
from django.db.models import TextChoices
from django.db.models.fields import EmailField, CharField, TextField, BooleanField


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

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
