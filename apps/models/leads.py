from django.db.models import TextChoices
from django.db.models.deletion import SET_NULL, CASCADE
from django.db.models.fields import CharField, EmailField, TextField, URLField, DecimalField, DateTimeField
from django.db.models.fields.related import ForeignKey

from apps.models.base import CreatedBaseModel
from apps.models.users import User


class Lead(CreatedBaseModel):
    class Status(TextChoices):
        NEW = 'new', 'New'
        CONTACTED = 'contacted', 'Contacted'
        QUALIFIED = 'qualified', 'Qualified'
        WON = 'won', 'Won'
        LOST = 'lost', 'Lost'

    class Source(TextChoices):
        WEBSITE = 'website', 'Website'
        SOCIAL_MEDIA = 'social-media', 'Social Media'
        REFERRAL = 'referral', 'Referral'
        COLD_CALL = 'cold-call', 'Cold Call'
        OTHER = 'other', 'Other'

    class Priority(TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'

    name = CharField(max_length=255)
    email = EmailField(blank=True, null=True)
    phone = CharField(max_length=20, blank=True, null=True)

    source = CharField(max_length=20, choices=Source.choices, default=Source.OTHER)
    status = CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    note = TextField(blank=True, null=True)

    assigned_to = ForeignKey(User, on_delete=SET_NULL, null=True, blank=True, related_name='leads')
    created_by = ForeignKey(User, on_delete=SET_NULL, null=True, blank=True, related_name='created_leads')

    company = CharField(max_length=255, blank=True, null=True)
    website = URLField(blank=True, null=True)
    priority = CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    estimated_value = DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)

    last_contacted = DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class LeadActivity(CreatedBaseModel):
    class ActivityType(TextChoices):
        STATUS_CHANGE = 'status_change', 'Status Change'
        CALL = 'call', 'Call'
        EMAIL = 'email', 'Email'
        NOTE = 'note', 'Note'
        OTHER = 'other', 'Other'

    lead = ForeignKey(Lead, on_delete=CASCADE, related_name='activities')
    user = ForeignKey(User, on_delete=SET_NULL, null=True, blank=True, related_name='activities')
    activity_type = CharField(max_length=20, choices=ActivityType.choices)
    title = CharField(max_length=255)
    description = TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lead Activity'
        verbose_name_plural = 'Lead Activities'
