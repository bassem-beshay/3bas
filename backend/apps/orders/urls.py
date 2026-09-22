from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CheckoutOrderView, OrderTrackingView

router = DefaultRouter()
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path('checkout/', CheckoutOrderView.as_view(), name='order-checkout'),
    path('track/<str:order_number>/', OrderTrackingView.as_view(), name='order-track'),
    path('', include(router.urls)),
]
