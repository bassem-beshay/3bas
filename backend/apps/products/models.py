import uuid
from django.db import models
from apps.core.models import TenantModel

class ProductStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    ACTIVE = 'ACTIVE', 'Active'
    ARCHIVED = 'ARCHIVED', 'Archived'

class Product(TenantModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True, default="")
    details = models.TextField(blank=True, default="")
    care_instructions = models.TextField(blank=True, default="")
    
    price = models.DecimalField(max_digits=12, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    
    tags = models.CharField(max_length=255, blank=True, default="")
    base_sku = models.CharField(max_length=100, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=ProductStatus.choices,
        default=ProductStatus.ACTIVE
    )
    
    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('store', 'slug')

    def __str__(self):
        return f"{self.name} ({self.store.slug})"

    @property
    def total_stock(self):
        return sum(variant.stock_quantity for variant in self.variants.filter(is_active=True))

    @property
    def primary_image(self):
        cover = self.images.filter(is_cover=True).first()
        if cover:
            return cover.image_url
        first_img = self.images.first()
        return first_img.image_url if first_img else None

class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=600)
    alt_text = models.CharField(max_length=255, blank=True, default="")
    display_order = models.PositiveIntegerField(default=0)
    is_cover = models.BooleanField(default=False)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Image for {self.product.name}"

class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=100)
    size = models.CharField(max_length=50) # e.g. "XS", "S", "M", "L", "XL"
    color_name = models.CharField(max_length=50) # e.g. "Noir Black", "Bone White"
    color_hex = models.CharField(max_length=20, default="#000000")
    stock_quantity = models.IntegerField(default=0)
    price_override = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('product', 'size', 'color_name')
        ordering = ['color_name', 'size']

    def __str__(self):
        return f"{self.product.name} - {self.color_name} / {self.size} ({self.stock_quantity} in stock)"

    @property
    def effective_price(self):
        return self.price_override if self.price_override is not None else self.product.price
