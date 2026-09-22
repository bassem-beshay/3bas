from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet, StockAdjustmentViewSet

router = DefaultRouter()
router.register(r'adjustments', StockAdjustmentViewSet, basename='stock-adjustment')
router.register(r'', InventoryViewSet, basename='inventory')

urlpatterns = [
    path('', include(router.urls)),
]
