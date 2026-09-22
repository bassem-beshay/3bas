from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'default_address', 'city', 'total_spent',
            'orders_count', 'created_at'
        ]
