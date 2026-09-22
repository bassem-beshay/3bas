from django.db import models
from apps.core.models import TenantModel

class StockAdjustmentReason(models.TextChoices):
    RESTOCK = 'RESTOCK', 'Restock'
    MANUAL_CORRECTION = 'MANUAL_CORRECTION', 'Manual Correction'
    DAMAGED = 'DAMAGED', 'Damaged/Defective'
    ORDER_FULFILLMENT = 'ORDER_FULFILLMENT', 'Order Fulfillment'
    RETURN = 'RETURN', 'Customer Return'

class StockAdjustment(TenantModel):
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        related_name='stock_adjustments'
    )
    change_amount = models.IntegerField()
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    reason = models.CharField(
        max_length=50,
        choices=StockAdjustmentReason.choices,
        default=StockAdjustmentReason.MANUAL_CORRECTION
    )
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.variant.sku} ({self.change_amount:+d}) -> {self.new_stock}"
