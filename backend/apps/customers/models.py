from django.db import models
from apps.core.models import TenantModel

class Customer(TenantModel):
    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customer_profiles'
    )
    email = models.EmailField()
    first_name = models.CharField(max_length=100, blank=True, default="")
    last_name = models.CharField(max_length=100, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    default_address = models.TextField(blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    orders_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('store', 'email')
        ordering = ['-created_at']

    @property
    def full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.email

    def __str__(self):
        return f"{self.full_name} ({self.store.slug})"
