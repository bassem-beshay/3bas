from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Product, ProductVariant
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductAdminWriteSerializer,
    ProductVariantSerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'tags', 'base_sku']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductAdminWriteSerializer

    def get_queryset(self):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        if not store:
            return Product.objects.none()

        qs = Product.objects.filter(store=store).select_related('category').prefetch_related('images', 'variants')

        # If public storefront visitor, only show active products
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(status='ACTIVE')

        # Filter by category slug
        category_slug = self.request.query_params.get('category')
        if category_slug:
            qs = qs.filter(Q(category__slug=category_slug) | Q(category__parent__slug=category_slug))

        # Filter by featured / new arrival / best seller
        if self.request.query_params.get('featured') == 'true':
            qs = qs.filter(is_featured=True)
        if self.request.query_params.get('new_arrival') == 'true':
            qs = qs.filter(is_new_arrival=True)
        if self.request.query_params.get('best_seller') == 'true':
            qs = qs.filter(is_best_seller=True)

        # Filter by size
        size = self.request.query_params.get('size')
        if size:
            qs = qs.filter(variants__size=size, variants__stock_quantity__gt=0).distinct()

        # Filter by color
        color = self.request.query_params.get('color')
        if color:
            qs = qs.filter(variants__color_name__iexact=color).distinct()

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        if min_price:
            try:
                qs = qs.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                qs = qs.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # Sort order shortcuts
        sort = self.request.query_params.get('sort')
        if sort == 'price_asc':
            qs = qs.order_by('price')
        elif sort == 'price_desc':
            qs = qs.order_by('-price')
        elif sort == 'newest':
            qs = qs.order_by('-created_at')

        return qs

    def perform_create(self, serializer):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        serializer.save(store=store)

class VariantStockUpdateViewSet(viewsets.ModelViewSet):
    """Direct stock update endpoint for inventory operations."""
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        if not store:
            return ProductVariant.objects.none()
        return ProductVariant.objects.filter(product__store=store)
