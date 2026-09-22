from django.db import models
from apps.core.models import TenantModel

class Category(TenantModel):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=150)
    description = models.TextField(blank=True, default="")
    image_url = models.URLField(max_length=500, blank=True, null=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']
        unique_together = ('store', 'slug')

    def __str__(self):
        return f"{self.name} ({self.store.slug})"
