from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreViewSet, CurrentStoreView

router = DefaultRouter()
router.register(r'all', StoreViewSet, basename='store')

urlpatterns = [
    path('current/', CurrentStoreView.as_view(), name='store-current'),
    path('', include(router.urls)),
]
