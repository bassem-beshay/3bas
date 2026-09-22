import random
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from rest_framework import serializers
from .models import Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus
from apps.products.models import ProductVariant
from apps.customers.models import Customer
from apps.marketing.models import Coupon
from apps.inventory.models import StockAdjustment

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'variant', 'product_name', 'variant_title', 'sku', 'image_url', 'price', 'quantity', 'total']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    currency = serializers.CharField(source='store.currency', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_email', 'customer_phone',
            'shipping_address', 'city', 'postal_code', 'country',
            'status', 'payment_method', 'payment_status',
            'subtotal', 'discount_amount', 'discount_code', 'shipping_fee', 'total',
            'notes', 'items', 'currency', 'created_at'
        ]
        read_only_fields = ['id', 'order_number', 'subtotal', 'discount_amount', 'shipping_fee', 'total', 'created_at']

class CheckoutItemInputSerializer(serializers.Serializer):
    variant_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)

class CreateOrderSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=50)
    shipping_address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")
    country = serializers.CharField(max_length=100, default="Egypt")
    payment_method = serializers.ChoiceField(choices=PaymentMethod.choices, default=PaymentMethod.COD)
    discount_code = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    items = CheckoutItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Cart is empty.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get('request')
        store = getattr(request, 'store', None)
        if not store:
            from apps.stores.models import Store
            store = Store.objects.filter(is_active=True).first()

        items_data = validated_data['items']
        subtotal = Decimal('0.00')
        order_items_to_create = []

        for item_data in items_data:
            variant_id = item_data['variant_id']
            qty = item_data['quantity']
            try:
                variant = ProductVariant.objects.select_for_update().get(id=variant_id, is_active=True)
            except ProductVariant.DoesNotExist:
                raise serializers.ValidationError(f"Product variant with id {variant_id} not found.")

            if variant.stock_quantity < qty:
                raise serializers.ValidationError(
                    f"Insufficient stock for {variant.product.name} ({variant.color_name} / {variant.size}). "
                    f"Available: {variant.stock_quantity}."
                )

            item_price = Decimal(str(variant.effective_price))
            line_total = item_price * qty
            subtotal += line_total

            order_items_to_create.append({
                'variant': variant,
                'product': variant.product,
                'product_name': variant.product.name,
                'variant_title': f"{variant.color_name} / {variant.size}",
                'sku': variant.sku,
                'image_url': variant.product.primary_image,
                'price': item_price,
                'quantity': qty,
                'total': line_total
            })

        # Calculate shipping fee: free if subtotal >= 1500 else 60
        shipping_fee = Decimal('0.00') if subtotal >= Decimal('1500.00') else Decimal('60.00')

        # Calculate discount
        discount_code = validated_data.get('discount_code', '').strip().upper()
        discount_amount = Decimal('0.00')
        if discount_code:
            coupon = Coupon.objects.filter(store=store, code__iexact=discount_code, is_active=True).first()
            if coupon:
                is_valid, _ = coupon.is_valid_for_cart(subtotal)
                if is_valid:
                    discount_amount = Decimal(str(coupon.calculate_discount(subtotal, shipping_fee)))
                    coupon.times_used += 1
                    coupon.save()

        total = max(Decimal('0.00'), (subtotal - discount_amount) + shipping_fee)

        # Generate unique order number
        today_str = timezone.now().strftime('%y%m%d')
        rand_suffix = f"{random.randint(1000, 9999)}"
        order_number = f"#{store.slug.upper()[:4]}-{today_str}-{rand_suffix}"

        # Create or update customer profile
        customer_email = validated_data['customer_email'].strip().lower()
        customer, _ = Customer.objects.get_or_create(
            store=store,
            email=customer_email,
            defaults={
                'first_name': validated_data['customer_name'].split()[0],
                'last_name': " ".join(validated_data['customer_name'].split()[1:]) if len(validated_data['customer_name'].split()) > 1 else "",
                'phone': validated_data['customer_phone'],
                'default_address': validated_data['shipping_address'],
                'city': validated_data['city'],
            }
        )
        customer.orders_count += 1
        customer.total_spent = Decimal(str(customer.total_spent)) + Decimal(str(total))
        customer.save()

        order = Order.objects.create(
            store=store,
            customer=customer,
            order_number=order_number,
            customer_name=validated_data['customer_name'],
            customer_email=customer_email,
            customer_phone=validated_data['customer_phone'],
            shipping_address=validated_data['shipping_address'],
            city=validated_data['city'],
            postal_code=validated_data.get('postal_code', ''),
            country=validated_data.get('country', 'Egypt'),
            status=OrderStatus.CONFIRMED,
            payment_method=validated_data.get('payment_method', PaymentMethod.COD),
            payment_status=PaymentStatus.PENDING,
            subtotal=subtotal,
            discount_amount=discount_amount,
            discount_code=discount_code,
            shipping_fee=shipping_fee,
            total=total,
            notes=validated_data.get('notes', '')
        )

        for item in order_items_to_create:
            variant = item['variant']
            qty = item['quantity']
            
            # Decrement inventory
            prev_stock = variant.stock_quantity
            new_stock = prev_stock - qty
            variant.stock_quantity = new_stock
            variant.save()

            StockAdjustment.objects.create(
                store=store,
                variant=variant,
                change_amount=-qty,
                previous_stock=prev_stock,
                new_stock=new_stock,
                reason='ORDER_FULFILLMENT',
                notes=f"Order {order.order_number}"
            )

            OrderItem.objects.create(
                order=order,
                product=item['product'],
                variant=variant,
                product_name=item['product_name'],
                variant_title=item['variant_title'],
                sku=item['sku'],
                image_url=item['image_url'],
                price=item['price'],
                quantity=qty,
                total=item['total']
            )

        return order
