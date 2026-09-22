from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Coupon
from .serializers import CouponSerializer, ValidateCouponSerializer

class CouponViewSet(viewsets.ModelViewSet):
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        if not store:
            return Coupon.objects.none()
        return Coupon.objects.filter(store=store)

    def perform_create(self, serializer):
        store = getattr(self.request, 'store', None)
        if not store and self.request.user.is_authenticated:
            store = self.request.user.store
        serializer.save(store=store)

class ValidateCouponView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        store = getattr(request, 'store', None)
        if not store:
            return Response({'error': 'Store not found'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ValidateCouponSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code'].strip().upper()
        subtotal = serializer.validated_data['subtotal']
        shipping_fee = serializer.validated_data.get('shipping_fee', 0)

        coupon = Coupon.objects.filter(store=store, code__iexact=code, is_active=True).first()
        if not coupon:
            return Response({'valid': False, 'message': 'Invalid coupon code.'}, status=status.HTTP_404_NOT_FOUND)

        is_valid, msg = coupon.is_valid_for_cart(subtotal)
        if not is_valid:
            return Response({'valid': False, 'message': msg}, status=status.HTTP_400_BAD_REQUEST)

        discount_amount = coupon.calculate_discount(subtotal, shipping_fee)
        return Response({
            'valid': True,
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'value': coupon.value,
            'discount_amount': float(discount_amount),
            'message': f"Coupon applied: {coupon.code}"
        })
