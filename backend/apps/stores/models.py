import uuid
from django.db import models

class Store(models.Model):
    """Represents an independent brand / store tenant."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True, db_index=True)
    custom_domain = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    tagline = models.CharField(max_length=255, blank=True, default="Contemporary Minimalist Fashion")
    description = models.TextField(blank=True, default="")
    
    currency = models.CharField(max_length=10, default="EGP")
    currency_symbol = models.CharField(max_length=10, default="EGP")
    
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    banner_url = models.URLField(max_length=500, blank=True, null=True)
    
    contact_email = models.EmailField(blank=True, default="concierge@noire.studio")
    contact_phone = models.CharField(max_length=50, blank=True, default="+20 100 000 0000")
    instagram_url = models.URLField(max_length=500, blank=True, null=True)
    tiktok_url = models.URLField(max_length=500, blank=True, null=True)
    
    announcement_bar_text = models.CharField(
        max_length=255,
        blank=True,
        default="COMPLIMENTARY DOMESTIC SHIPPING ON ORDERS OVER EGP 1,500"
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.slug})"
