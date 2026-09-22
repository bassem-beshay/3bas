from rest_framework import serializers
from .models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'value',
            'min_order_amount', 'max_discount_amount', 'usage_limit',
            'times_used', 'valid_from', 'valid_until', 'is_active', 'created_at'
        ]

class ValidateCouponSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    shipping_fee = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
