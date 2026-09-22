from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, VariantStockUpdateViewSet

router = DefaultRouter()
router.register(r'variants', VariantStockUpdateViewSet, basename='variant')
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
