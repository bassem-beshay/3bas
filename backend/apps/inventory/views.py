from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.products.models import ProductVariant
from .models import StockAdjustment
from .serializers import InventoryItemSerializer, StockAdjustmentSerializer

class InventoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        if not store:
            return ProductVariant.objects.none()

        qs = ProductVariant.objects.filter(
            product__store=store
        ).select_related('product', 'product__category').order_by('stock_quantity', 'product__name')

        q = self.request.query_params.get('search')
        if q:
            qs = qs.filter(sku__icontains=q) | qs.filter(product__name__icontains=q)

        low_stock = self.request.query_params.get('low_stock')
        if low_stock == 'true':
            qs = qs.filter(stock_quantity__lte=5)

        return qs

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        variant = self.get_object()
        new_quantity = request.data.get('quantity')
        reason = request.data.get('reason', 'MANUAL_CORRECTION')
        notes = request.data.get('notes', '')

        if new_quantity is None:
            return Response({'error': 'Quantity is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_quantity = int(new_quantity)
            if new_quantity < 0:
                return Response({'error': 'Quantity cannot be negative'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)

        previous_stock = variant.stock_quantity
        change = new_quantity - previous_stock
        variant.stock_quantity = new_quantity
        variant.save()

        StockAdjustment.objects.create(
            store=variant.product.store,
            variant=variant,
            change_amount=change,
            previous_stock=previous_stock,
            new_stock=new_quantity,
            reason=reason,
            notes=notes
        )

        return Response(InventoryItemSerializer(variant).data)

class StockAdjustmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockAdjustmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        if not store:
            return StockAdjustment.objects.none()
        return StockAdjustment.objects.filter(store=store).select_related('variant')
