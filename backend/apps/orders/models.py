import uuid
from django.db import models
from django.utils import timezone
from apps.core.models import TenantModel

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    PREPARING = 'PREPARING', 'Preparing'
    SHIPPED = 'SHIPPED', 'Shipped'
    DELIVERED = 'DELIVERED', 'Delivered'
    CANCELLED = 'CANCELLED', 'Cancelled'

class PaymentMethod(models.TextChoices):
    COD = 'COD', 'Cash on Delivery'
    CARD = 'CARD', 'Credit / Debit Card'
    INSTAPAY = 'INSTAPAY', 'InstaPay'

class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PAID = 'PAID', 'Paid'
    REFUNDED = 'REFUNDED', 'Refunded'
    FAILED = 'FAILED', 'Failed'

class Order(TenantModel):
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=50)
    
    shipping_address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True, default="")
    country = models.CharField(max_length=100, default="Egypt")
    
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.CONFIRMED
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.COD
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_code = models.CharField(max_length=50, blank=True, default="")
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} ({self.customer_name} - {self.total} {self.store.currency})"

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items'
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items'
    )
    
    product_name = models.CharField(max_length=255)
    variant_title = models.CharField(max_length=255) # e.g. "Noir Black / M"
    sku = models.CharField(max_length=100, blank=True, default="")
    image_url = models.URLField(max_length=600, blank=True, null=True)
    
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} ({self.variant_title})"
