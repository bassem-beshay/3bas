from rest_framework import serializers
from .models import StockAdjustment
from apps.products.models import ProductVariant

class InventoryItemSerializer(serializers.ModelSerializer):
    product_id = serializers.UUIDField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    primary_image = serializers.CharField(source='product.primary_image', read_only=True)
    category_name = serializers.CharField(source='product.category.name', default='Uncategorized', read_only=True)
    is_low_stock = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'product_id', 'product_name', 'product_slug', 'primary_image',
            'category_name', 'color_name', 'color_hex', 'size',
            'stock_quantity', 'price_override', 'effective_price',
            'is_active', 'is_low_stock'
        ]

    def get_is_low_stock(self, obj):
        return obj.stock_quantity <= 5

class StockAdjustmentSerializer(serializers.ModelSerializer):
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)

    class Meta:
        model = StockAdjustment
        fields = [
            'id', 'variant', 'variant_sku', 'change_amount',
            'previous_stock', 'new_stock', 'reason', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'previous_stock', 'new_stock', 'created_at']
