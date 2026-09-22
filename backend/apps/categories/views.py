from rest_framework import viewsets, permissions
from .models import Category
from .serializers import CategorySerializer

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        if not store:
            return Category.objects.none()
        
        qs = Category.objects.filter(store=store)
        if self.action == 'list':
            # By default return top-level categories
            if self.request.query_params.get('all') != 'true':
                qs = qs.filter(parent__isnull=True)
            if not self.request.user.is_authenticated:
                qs = qs.filter(is_active=True)
        return qs

    def perform_create(self, serializer):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        serializer.save(store=store)
