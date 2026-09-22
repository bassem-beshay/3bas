from rest_framework import serializers
from .models import Product, ProductImage, ProductVariant
from apps.categories.models import Category

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'display_order', 'is_cover']

class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'size', 'color_name', 'color_hex',
            'stock_quantity', 'price_override', 'effective_price', 'is_active'
        ]

class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    primary_image = serializers.CharField(read_only=True)
    secondary_image = serializers.SerializerMethodField()
    available_colors = serializers.SerializerMethodField()
    available_sizes = serializers.SerializerMethodField()
    total_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'compare_at_price',
            'category', 'category_name', 'category_slug',
            'primary_image', 'secondary_image', 'available_colors', 'available_sizes',
            'total_stock', 'status', 'is_featured', 'is_new_arrival', 'is_best_seller',
            'created_at'
        ]

    def get_secondary_image(self, obj):
        imgs = obj.images.all()
        if len(imgs) > 1:
            return imgs[1].image_url
        return None

    def get_available_colors(self, obj):
        variants = obj.variants.filter(is_active=True)
        colors = {}
        for v in variants:
            if v.color_name not in colors:
                colors[v.color_name] = v.color_hex
        return [{'name': name, 'hex': hex_code} for name, hex_code in colors.items()]

    def get_available_sizes(self, obj):
        sizes = obj.variants.filter(is_active=True).values_list('size', flat=True).distinct()
        return list(sizes)

class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    primary_image = serializers.CharField(read_only=True)
    total_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'details', 'care_instructions',
            'price', 'compare_at_price', 'category', 'category_name', 'category_slug',
            'tags', 'base_sku', 'status', 'is_featured', 'is_new_arrival', 'is_best_seller',
            'images', 'variants', 'primary_image', 'total_stock', 'created_at'
        ]

class ProductAdminWriteSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, required=False)
    variants = ProductVariantSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'details', 'care_instructions',
            'price', 'compare_at_price', 'category', 'tags', 'base_sku',
            'status', 'is_featured', 'is_new_arrival', 'is_best_seller',
            'images', 'variants'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        variants_data = validated_data.pop('variants', [])
        product = Product.objects.create(**validated_data)

        for i, img_data in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                display_order=img_data.get('display_order', i),
                image_url=img_data['image_url'],
                alt_text=img_data.get('alt_text', product.name),
                is_cover=img_data.get('is_cover', i == 0)
            )

        for var_data in variants_data:
            ProductVariant.objects.create(product=product, **var_data)

        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        variants_data = validated_data.pop('variants', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for i, img_data in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    display_order=img_data.get('display_order', i),
                    image_url=img_data['image_url'],
                    alt_text=img_data.get('alt_text', instance.name),
                    is_cover=img_data.get('is_cover', i == 0)
                )

        if variants_data is not None:
            instance.variants.all().delete()
            for var_data in variants_data:
                ProductVariant.objects.create(product=instance, **var_data)

        return instance
