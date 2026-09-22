import uuid
from django.db import models

class TimeStampedModel(models.Model):
    """Abstract base model with created and updated timestamps."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

class TenantQuerySet(models.QuerySet):
    def for_store(self, store):
        if not store:
            return self.none()
        return self.filter(store=store)

class TenantManager(models.Manager.from_queryset(TenantQuerySet)):
    pass

class TenantModel(TimeStampedModel):
    """Abstract base model for all tenant-scoped data models."""
    store = models.ForeignKey(
        'stores.Store',
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_set",
        db_index=True
    )

    objects = TenantManager()

    class Meta:
        abstract = True
