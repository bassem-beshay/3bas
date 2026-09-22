from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderStatus
from .serializers import OrderSerializer, CreateOrderSerializer

class CheckoutOrderView(APIView):
    """Public customer checkout endpoint."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderTrackingView(APIView):
    """Public order lookup by order number."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_number):
        store = getattr(request, 'store', None)
        qs = Order.objects.all()
        if store:
            qs = qs.filter(store=store)
        order = qs.filter(order_number__iexact=order_number).first()
        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)

class OrderViewSet(viewsets.ModelViewSet):
    """Merchant order management viewset."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'payment_method']
    search_fields = ['order_number', 'customer_name', 'customer_email', 'customer_phone', 'city']
    ordering_fields = ['total', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        if not store:
            return Order.objects.none()
        return Order.objects.filter(store=store).prefetch_related('items')

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if not new_status or new_status not in OrderStatus.values:
            return Response({'error': f'Invalid status. Allowed values: {list(OrderStatus.values)}'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)
