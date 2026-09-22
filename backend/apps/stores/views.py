from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Store
from .serializers import StoreSerializer, StorePublicSerializer

class StoreViewSet(viewsets.ModelViewSet):
    """Admin store management viewset."""
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class CurrentStoreView(APIView):
    """Returns the store identified for the current request via header/host/query."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        store = getattr(request, 'store', None)
        if not store:
            store = Store.objects.filter(is_active=True).first()
        if not store:
            return Response({'error': 'No active store found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = StorePublicSerializer(store)
        return Response(serializer.data)
