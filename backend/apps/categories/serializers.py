from rest_framework import serializers
from .models import Category

class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'display_order']

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubcategorySerializer(many=True, read_only=True)
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image_url',
            'parent', 'display_order', 'is_active', 'subcategories', 'products_count'
        ]

    def get_products_count(self, obj):
        return obj.products.filter(status='ACTIVE').count()
