from django.db import models
from django.utils import timezone
from apps.core.models import TenantModel

class DiscountType(models.TextChoices):
    PERCENTAGE = 'PERCENTAGE', 'Percentage Discount'
    FIXED = 'FIXED', 'Fixed Amount Discount'
    FREE_SHIPPING = 'FREE_SHIPPING', 'Free Shipping'

class Coupon(TenantModel):
    code = models.CharField(max_length=50, db_index=True)
    description = models.CharField(max_length=255, blank=True, default="")
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE
    )
    value = models.DecimalField(max_digits=10, decimal_places=2, help_text="Percentage or fixed amount")
    min_order_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    max_discount_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Total usage limit")
    times_used = models.PositiveIntegerField(default=0)
    
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('store', 'code')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.store.slug}"

    def is_valid_for_cart(self, subtotal):
        if not self.is_active:
            return False, "This coupon is no longer active."
        now = timezone.now()
        if self.valid_from and now < self.valid_from:
            return False, "This coupon is not valid yet."
        if self.valid_until and now > self.valid_until:
            return False, "This coupon has expired."
        if self.usage_limit and self.times_used >= self.usage_limit:
            return False, "This coupon has reached its usage limit."
        if subtotal < self.min_order_amount:
            return False, f"Minimum order amount of {self.min_order_amount} {self.store.currency} is required."
        return True, "Valid"

    def calculate_discount(self, subtotal, shipping_fee=0):
        if self.discount_type == DiscountType.PERCENTAGE:
            discount = (subtotal * self.value) / 100
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
            return discount
        elif self.discount_type == DiscountType.FIXED:
            return min(self.value, subtotal)
        elif self.discount_type == DiscountType.FREE_SHIPPING:
            return shipping_fee
        return 0
