from rest_framework import serializers
from .models import Store

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'

class StorePublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'custom_domain', 'tagline', 'description',
            'currency', 'currency_symbol', 'logo_url', 'banner_url',
            'contact_email', 'contact_phone', 'instagram_url', 'tiktok_url',
            'announcement_bar_text', 'is_active', 'created_at'
        ]
