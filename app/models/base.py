from django.db.models import Model
from django.db.models.fields import DateTimeField


class CreatedBaseModel(Model):
    updated_at = DateTimeField(auto_now_add=True)
    created_at = DateTimeField(auto_now=True)

    class Meta:
        abstract = True