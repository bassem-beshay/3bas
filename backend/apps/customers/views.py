from rest_framework import viewsets, permissions, filters
from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name', 'phone', 'city']
    ordering_fields = ['total_spent', 'orders_count', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        if not store:
            return Customer.objects.none()
        return Customer.objects.filter(store=store)

    def perform_create(self, serializer):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        serializer.save(store=store)
