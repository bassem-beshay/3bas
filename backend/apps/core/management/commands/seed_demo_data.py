import random
from decimal import Decimal
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.stores.models import Store
from apps.categories.models import Category
from apps.products.models import Product, ProductImage, ProductVariant, ProductStatus
from apps.inventory.models import StockAdjustment
from apps.marketing.models import Coupon, DiscountType
from apps.customers.models import Customer
from apps.orders.models import Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds initial demo fashion brand (NOIRÉ), categories, products, variants, orders, and analytics."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing demo data seeding for NOIRÉ..."))

        # 1. Create or get Store
        store, created = Store.objects.get_or_create(
            slug='noire',
            defaults={
                'name': 'NOIRÉ',
                'custom_domain': 'noire.studio',
                'tagline': 'ARCHITECTURAL SILHOUETTES & CONTEMPORARY LUXURY',
                'description': (
                    'Founded on principles of sculptural precision and understated opulence, '
                    'NOIRÉ creates timeless ready-to-wear garments defined by architectural cuts, '
                    'luxurious natural textiles, and artisanal finishing.'
                ),
                'currency': 'EGP',
                'currency_symbol': 'EGP',
                'logo_url': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80',
                'banner_url': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85',
                'contact_email': 'concierge@noire.studio',
                'contact_phone': '+20 100 892 4110',
                'instagram_url': 'https://instagram.com/noire.studio',
                'tiktok_url': 'https://tiktok.com/@noire.studio',
                'announcement_bar_text': 'COMPLIMENTARY DOMESTIC COURIER ON ALL ORDERS OVER EGP 1,500',
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Created brand store: NOIRÉ"))
        else:
            self.stdout.write(self.style.WARNING("Brand store NOIRÉ already exists, updating properties."))
            store.currency = 'EGP'
            store.currency_symbol = 'EGP'
            store.save()

        # 2. Admin User
        admin_email = 'admin@noire.studio'
        admin_user, user_created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'username': 'admin',
                'first_name': 'Noire',
                'last_name': 'Studio',
                'role': 'STORE_OWNER',
                'store': store,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if user_created:
            admin_user.set_password('admin123456')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f"Created admin user: {admin_email} (password: admin123456)"))
        else:
            admin_user.store = store
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.set_password('admin123456')
            admin_user.save()

        # 3. Categories
        categories_data = [
            {
                'name': 'Outerwear',
                'slug': 'outerwear',
                'description': 'Architectural coats, tailored blazers, and protective layerings.',
                'image_url': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80',
                'display_order': 1,
            },
            {
                'name': 'Knitwear',
                'slug': 'knitwear',
                'description': 'Heavy gauge wool, brushed mohair, and tactile cashmere knits.',
                'image_url': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80',
                'display_order': 2,
            },
            {
                'name': 'Tops & Shirts',
                'slug': 'tops',
                'description': 'Crisp poplin shirts, heavyweight boxy tees, and silk drapery.',
                'image_url': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
                'display_order': 3,
            },
            {
                'name': 'Trousers & Denim',
                'slug': 'trousers',
                'description': 'Relaxed pleated trousers, wide-leg wool pants, and selvedge denim.',
                'image_url': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
                'display_order': 4,
            },
            {
                'name': 'Accessories',
                'slug': 'accessories',
                'description': 'Full-grain Italian calfskin bags, artisanal leather footwear, and minimalist accents.',
                'image_url': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
                'display_order': 5,
            },
        ]

        cat_map = {}
        for cdata in categories_data:
            cat, _ = Category.objects.get_or_create(
                store=store,
                slug=cdata['slug'],
                defaults=cdata
            )
            cat_map[cdata['slug']] = cat

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(cat_map)} categories."))

        # 4. Products & Variants
        products_catalog = [
            {
                'name': 'Heavyweight Boxy T-Shirt',
                'slug': 'heavyweight-boxy-tshirt',
                'category': 'tops',
                'price': Decimal('780.00'),
                'compare_at_price': Decimal('950.00'),
                'is_featured': True,
                'is_new_arrival': True,
                'is_best_seller': True,
                'base_sku': 'NOIR-TEE-01',
                'description': 'A signature foundation piece crafted from 280 GSM combed Egyptian cotton jersey with dropped shoulders, a bound crew collar, and an architectural boxy drape.',
                'details': '100% Combed Egyptian Cotton. 280 GSM heavyweight jersey. Pre-shrunk finish. Dropped shoulder profile.',
                'care_instructions': 'Machine wash cold inside out. Reshape while damp. Dry flat. Cool iron on reverse.',
                'images': [
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    # As in user's prompt:
                    # Black: S=5, M=12, L=0, XL=4
                    # White: S=3, M=8, L=6, XL=2
                    {'color': 'Noir Black', 'hex': '#111111', 'size': 'S', 'stock': 5},
                    {'color': 'Noir Black', 'hex': '#111111', 'size': 'M', 'stock': 12},
                    {'color': 'Noir Black', 'hex': '#111111', 'size': 'L', 'stock': 0},
                    {'color': 'Noir Black', 'hex': '#111111', 'size': 'XL', 'stock': 4},
                    {'color': 'Bone White', 'hex': '#F4F3EF', 'size': 'S', 'stock': 3},
                    {'color': 'Bone White', 'hex': '#F4F3EF', 'size': 'M', 'stock': 8},
                    {'color': 'Bone White', 'hex': '#F4F3EF', 'size': 'L', 'stock': 6},
                    {'color': 'Bone White', 'hex': '#F4F3EF', 'size': 'XL', 'stock': 2},
                    {'color': 'Charcoal Melange', 'hex': '#3A3A3C', 'size': 'M', 'stock': 7},
                    {'color': 'Charcoal Melange', 'hex': '#3A3A3C', 'size': 'L', 'stock': 5},
                ]
            },
            {
                'name': 'Double-Breasted Sculpted Wool Blazer',
                'slug': 'sculpted-wool-blazer',
                'category': 'outerwear',
                'price': Decimal('3650.00'),
                'compare_at_price': Decimal('4200.00'),
                'is_featured': True,
                'is_new_arrival': False,
                'is_best_seller': True,
                'base_sku': 'NOIR-BLZ-02',
                'description': 'Masterfully tailored double-breasted jacket made from virgin wool twill. Features structured padded shoulders, peak lapels, and horn buttons.',
                'details': '100% Virgin Wool Shell. 100% Cupro Lining. Horn buttons. Internal jet pockets.',
                'care_instructions': 'Specialist dry clean only. Press with damp cloth.',
                'images': [
                    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Caviar Black', 'hex': '#1C1C1E', 'size': 'S', 'stock': 4},
                    {'color': 'Caviar Black', 'hex': '#1C1C1E', 'size': 'M', 'stock': 9},
                    {'color': 'Caviar Black', 'hex': '#1C1C1E', 'size': 'L', 'stock': 3},
                    {'color': 'Camel Melange', 'hex': '#B89B72', 'size': 'S', 'stock': 2},
                    {'color': 'Camel Melange', 'hex': '#B89B72', 'size': 'M', 'stock': 5},
                    {'color': 'Camel Melange', 'hex': '#B89B72', 'size': 'L', 'stock': 1},
                ]
            },
            {
                'name': 'Minimalist Brushed Mohair Knit',
                'slug': 'brushed-mohair-knit',
                'category': 'knitwear',
                'price': Decimal('2250.00'),
                'compare_at_price': Decimal('2600.00'),
                'is_featured': True,
                'is_new_arrival': True,
                'is_best_seller': False,
                'base_sku': 'NOIR-KNT-03',
                'description': 'Cloud-soft crewneck sweater spun with superfine South African mohair and wool blend, hand-brushed for an airy tactile haze.',
                'details': '40% Mohair, 35% Wool, 25% Polyamide. Ribbed collar and hem. Relaxed fit.',
                'care_instructions': 'Hand wash gently in cold water with wool detergent. Dry flat.',
                'images': [
                    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Ecru Mist', 'hex': '#EAE6DF', 'size': 'S', 'stock': 6},
                    {'color': 'Ecru Mist', 'hex': '#EAE6DF', 'size': 'M', 'stock': 11},
                    {'color': 'Ecru Mist', 'hex': '#EAE6DF', 'size': 'L', 'stock': 4},
                    {'color': 'Moss Green', 'hex': '#586249', 'size': 'S', 'stock': 3},
                    {'color': 'Moss Green', 'hex': '#586249', 'size': 'M', 'stock': 7},
                    {'color': 'Moss Green', 'hex': '#586249', 'size': 'L', 'stock': 2},
                ]
            },
            {
                'name': 'Pleated Wide-Leg Wool Trousers',
                'slug': 'pleated-wide-leg-trousers',
                'category': 'trousers',
                'price': Decimal('1950.00'),
                'compare_at_price': None,
                'is_featured': False,
                'is_new_arrival': True,
                'is_best_seller': True,
                'base_sku': 'NOIR-TRS-04',
                'description': 'High-rise trousers cut with a deep double reverse pleat and sweeping wide legs that puddle effortlessly over dress shoes.',
                'details': '70% Wool, 30% Polyester. Corozo button closure. Side slash pockets and rear welt pockets.',
                'care_instructions': 'Dry clean only. Cool iron.',
                'images': [
                    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Deep Black', 'hex': '#141414', 'size': 'S', 'stock': 8},
                    {'color': 'Deep Black', 'hex': '#141414', 'size': 'M', 'stock': 14},
                    {'color': 'Deep Black', 'hex': '#141414', 'size': 'L', 'stock': 6},
                    {'color': 'Ash Stone', 'hex': '#C5C1B8', 'size': 'S', 'stock': 4},
                    {'color': 'Ash Stone', 'hex': '#C5C1B8', 'size': 'M', 'stock': 9},
                    {'color': 'Ash Stone', 'hex': '#C5C1B8', 'size': 'L', 'stock': 5},
                ]
            },
            {
                'name': 'Relaxed Poplin Overshirt',
                'slug': 'relaxed-poplin-overshirt',
                'category': 'tops',
                'price': Decimal('1450.00'),
                'compare_at_price': Decimal('1700.00'),
                'is_featured': False,
                'is_new_arrival': False,
                'is_best_seller': True,
                'base_sku': 'NOIR-SHT-05',
                'description': 'Crisp long-staple cotton poplin shirt with a generous drop-shoulder fit, oversized mother-of-pearl buttons, and square hem.',
                'details': '100% Giza Cotton Poplin. Mother-of-pearl buttons. Dual chest utility pockets.',
                'care_instructions': 'Machine wash cold. Warm iron while slightly damp.',
                'images': [
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Pure White', 'hex': '#FFFFFF', 'size': 'S', 'stock': 7},
                    {'color': 'Pure White', 'hex': '#FFFFFF', 'size': 'M', 'stock': 10},
                    {'color': 'Pure White', 'hex': '#FFFFFF', 'size': 'L', 'stock': 3},
                    {'color': 'Sky Chambray', 'hex': '#A2B6C4', 'size': 'S', 'stock': 5},
                    {'color': 'Sky Chambray', 'hex': '#A2B6C4', 'size': 'M', 'stock': 8},
                ]
            },
            {
                'name': 'Oversized Cashmere Blend Hoodie',
                'slug': 'oversized-cashmere-hoodie',
                'category': 'knitwear',
                'price': Decimal('2400.00'),
                'compare_at_price': Decimal('2850.00'),
                'is_featured': True,
                'is_new_arrival': True,
                'is_best_seller': True,
                'base_sku': 'NOIR-HOD-06',
                'description': 'Ultra-luxe hoodie knit from a plush blend of Mongolian cashmere and fine Merino wool. Features a seamless double-layer hood without drawstrings for pure minimalist lines.',
                'details': '30% Mongolian Cashmere, 70% Fine Merino Wool. Seamless hood construction.',
                'care_instructions': 'Dry clean or gentle hand wash. Do not wring.',
                'images': [
                    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Washed Black', 'hex': '#222222', 'size': 'S', 'stock': 5},
                    {'color': 'Washed Black', 'hex': '#222222', 'size': 'M', 'stock': 15},
                    {'color': 'Washed Black', 'hex': '#222222', 'size': 'L', 'stock': 8},
                    {'color': 'Heather Grey', 'hex': '#9A9A9A', 'size': 'S', 'stock': 4},
                    {'color': 'Heather Grey', 'hex': '#9A9A9A', 'size': 'M', 'stock': 9},
                    {'color': 'Heather Grey', 'hex': '#9A9A9A', 'size': 'L', 'stock': 3},
                ]
            },
            {
                'name': 'Architectural Belted Trench Coat',
                'slug': 'architectural-belted-trench',
                'category': 'outerwear',
                'price': Decimal('4850.00'),
                'compare_at_price': Decimal('5600.00'),
                'is_featured': True,
                'is_new_arrival': False,
                'is_best_seller': False,
                'base_sku': 'NOIR-TRN-07',
                'description': 'An elongated, water-resistant cotton gabardine trench coat featuring exaggerated storm flaps, a belted waist, and horn buckle cuffs.',
                'details': '100% Water-repellent Cotton Gabardine. Storm flap. Gun flap. Leather-wrapped buckles.',
                'care_instructions': 'Dry clean only.',
                'images': [
                    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Classic Camel', 'hex': '#C19A6B', 'size': 'S', 'stock': 2},
                    {'color': 'Classic Camel', 'hex': '#C19A6B', 'size': 'M', 'stock': 4},
                    {'color': 'Classic Camel', 'hex': '#C19A6B', 'size': 'L', 'stock': 1},
                    {'color': 'Slate Midnight', 'hex': '#1B2430', 'size': 'M', 'stock': 3},
                    {'color': 'Slate Midnight', 'hex': '#1B2430', 'size': 'L', 'stock': 2},
                ]
            },
            {
                'name': 'Japanese Selvedge Wide Denim',
                'slug': 'japanese-selvedge-denim',
                'category': 'trousers',
                'price': Decimal('2100.00'),
                'compare_at_price': Decimal('2450.00'),
                'is_featured': False,
                'is_new_arrival': True,
                'is_best_seller': True,
                'base_sku': 'NOIR-DNM-08',
                'description': 'Crafted in Okayama from 13.5 oz unwashed red-line selvedge denim. Cut with a mid-rise and straight wide leg that breaks neatly over boots.',
                'details': '100% Cotton Okayama Selvedge Denim. Custom silver-tone hardware. Chain-stitched hem.',
                'care_instructions': 'Soak cold. Hang dry. Avoid machine spin to preserve indigo gradation.',
                'images': [
                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Raw Indigo', 'hex': '#1F2E4D', 'size': 'S', 'stock': 6},
                    {'color': 'Raw Indigo', 'hex': '#1F2E4D', 'size': 'M', 'stock': 10},
                    {'color': 'Raw Indigo', 'hex': '#1F2E4D', 'size': 'L', 'stock': 7},
                    {'color': 'Faded Mineral', 'hex': '#5A636E', 'size': 'S', 'stock': 3},
                    {'color': 'Faded Mineral', 'hex': '#5A636E', 'size': 'M', 'stock': 5},
                ]
            },
            {
                'name': 'Structured Calfskin Minimalist Tote',
                'slug': 'structured-calfskin-tote',
                'category': 'accessories',
                'price': Decimal('3200.00'),
                'compare_at_price': Decimal('3900.00'),
                'is_featured': True,
                'is_new_arrival': False,
                'is_best_seller': True,
                'base_sku': 'NOIR-BAG-09',
                'description': 'Handcrafted in Florence from vegetable-tanned full-grain leather with hand-painted raw edges and silver foil NOIRÉ discreet lettering.',
                'details': 'Full-grain Tuscan Calf Leather. Suede interior. Magnetic top closure. Fits 16" laptop.',
                'care_instructions': 'Treat periodically with natural leather balm.',
                'images': [
                    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Noir Leather', 'hex': '#0A0A0A', 'size': 'ONE SIZE', 'stock': 8},
                    {'color': 'Cognac Tan', 'hex': '#8D5B36', 'size': 'ONE SIZE', 'stock': 4},
                ]
            },
            {
                'name': 'Chunky Square-Toe Chelsea Boots',
                'slug': 'chunky-square-toe-chelsea-boots',
                'category': 'accessories',
                'price': Decimal('3900.00'),
                'compare_at_price': Decimal('4500.00'),
                'is_featured': False,
                'is_new_arrival': True,
                'is_best_seller': False,
                'base_sku': 'NOIR-BOT-10',
                'description': 'Contemporary Chelsea boot resting on an exaggerated lugged Vibram rubber outsole, sculpted with a bold architectural square toe.',
                'details': 'Brushed Spazzolato Leather upper. Vibram lugged rubber sole. Elasticated side gussets.',
                'care_instructions': 'Wipe with damp cloth. Buff with wax polish.',
                'images': [
                    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Polished Black', 'hex': '#000000', 'size': '41', 'stock': 3},
                    {'color': 'Polished Black', 'hex': '#000000', 'size': '42', 'stock': 6},
                    {'color': 'Polished Black', 'hex': '#000000', 'size': '43', 'stock': 5},
                    {'color': 'Polished Black', 'hex': '#000000', 'size': '44', 'stock': 2},
                ]
            },
            {
                'name': 'Heavy Gauge Ribbed Turtleneck',
                'slug': 'heavy-gauge-ribbed-turtleneck',
                'category': 'knitwear',
                'price': Decimal('2100.00'),
                'compare_at_price': None,
                'is_featured': False,
                'is_new_arrival': False,
                'is_best_seller': False,
                'base_sku': 'NOIR-KNT-11',
                'description': 'Chunky Fisherman rib sweater with a fold-over high collar, knitted from extrafine Australian merino wool.',
                'details': '100% Extrafine Merino Wool. 5-gauge English fisherman rib.',
                'care_instructions': 'Hand wash cold. Dry flat.',
                'images': [
                    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Oatmeal Heather', 'hex': '#D8D1C5', 'size': 'S', 'stock': 4},
                    {'color': 'Oatmeal Heather', 'hex': '#D8D1C5', 'size': 'M', 'stock': 7},
                    {'color': 'Oatmeal Heather', 'hex': '#D8D1C5', 'size': 'L', 'stock': 3},
                    {'color': 'Onyx Black', 'hex': '#151515', 'size': 'M', 'stock': 5},
                    {'color': 'Onyx Black', 'hex': '#151515', 'size': 'L', 'stock': 4},
                ]
            },
            {
                'name': 'Technical Nylon Windbreaker Parka',
                'slug': 'technical-nylon-windbreaker-parka',
                'category': 'outerwear',
                'price': Decimal('2850.00'),
                'compare_at_price': Decimal('3200.00'),
                'is_featured': False,
                'is_new_arrival': True,
                'is_best_seller': False,
                'base_sku': 'NOIR-WND-12',
                'description': 'Lightweight matte Japanese recycled nylon shell with concealed waterproof zippers, toggle drawcords, and packable storm hood.',
                'details': '100% Recycled Japanese Polyamide. Matte finish. Waterproof YKK AquaGuard zippers.',
                'care_instructions': 'Machine wash cold on delicate cycle.',
                'images': [
                    'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85',
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
                ],
                'variants': [
                    {'color': 'Graphite Grey', 'hex': '#3C4048', 'size': 'S', 'stock': 3},
                    {'color': 'Graphite Grey', 'hex': '#3C4048', 'size': 'M', 'stock': 8},
                    {'color': 'Graphite Grey', 'hex': '#3C4048', 'size': 'L', 'stock': 5},
                    {'color': 'Sage Chalk', 'hex': '#8B9A8B', 'size': 'M', 'stock': 4},
                ]
            }
        ]

        created_products = []
        for pdata in products_catalog:
            cat = cat_map.get(pdata['category'])
            prod, _ = Product.objects.get_or_create(
                store=store,
                slug=pdata['slug'],
                defaults={
                    'name': pdata['name'],
                    'category': cat,
                    'price': pdata['price'],
                    'compare_at_price': pdata['compare_at_price'],
                    'is_featured': pdata['is_featured'],
                    'is_new_arrival': pdata['is_new_arrival'],
                    'is_best_seller': pdata['is_best_seller'],
                    'base_sku': pdata['base_sku'],
                    'description': pdata['description'],
                    'details': pdata['details'],
                    'care_instructions': pdata['care_instructions'],
                    'status': ProductStatus.ACTIVE,
                }
            )
            created_products.append(prod)

            # Images
            for i, img_url in enumerate(pdata['images']):
                ProductImage.objects.get_or_create(
                    product=prod,
                    image_url=img_url,
                    defaults={
                        'alt_text': prod.name,
                        'display_order': i,
                        'is_cover': (i == 0)
                    }
                )

            # Variants
            for vdata in pdata['variants']:
                sku = f"{pdata['base_sku']}-{vdata['color'][:3].upper()}-{vdata['size']}"
                ProductVariant.objects.get_or_create(
                    product=prod,
                    size=vdata['size'],
                    color_name=vdata['color'],
                    defaults={
                        'sku': sku,
                        'color_hex': vdata['hex'],
                        'stock_quantity': vdata['stock'],
                        'is_active': True,
                    }
                )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(created_products)} products with variants and images."))

        # 5. Coupons
        coupons_data = [
            {
                'code': 'WELCOME10',
                'description': '10% discount on initial order',
                'discount_type': DiscountType.PERCENTAGE,
                'value': Decimal('10.00'),
                'min_order_amount': Decimal('500.00'),
                'is_active': True
            },
            {
                'code': 'NOIRE20',
                'description': '20% off high-value orders',
                'discount_type': DiscountType.PERCENTAGE,
                'value': Decimal('20.00'),
                'min_order_amount': Decimal('3000.00'),
                'is_active': True
            },
            {
                'code': 'FREESHIP',
                'description': 'Free shipping on any order',
                'discount_type': DiscountType.FREE_SHIPPING,
                'value': Decimal('0.00'),
                'min_order_amount': Decimal('0.00'),
                'is_active': True
            }
        ]
        for cdata in coupons_data:
            Coupon.objects.get_or_create(
                store=store,
                code=cdata['code'],
                defaults=cdata
            )

        # 6. Demo Customers
        customers_data = [
            {'first': 'Youssef', 'last': 'El-Masry', 'email': 'youssef.masry@gmail.com', 'phone': '+20 100 234 5678', 'city': 'New Cairo', 'addr': 'Villa 42, Lake View Compound'},
            {'first': 'Nour', 'last': 'Hassan', 'email': 'nour.hassan@outlook.com', 'phone': '+20 111 876 5432', 'city': 'Zamalek', 'addr': '14 Hassan Sabry Street, Apt 5B'},
            {'first': 'Karim', 'last': 'Mansour', 'email': 'karim.mansour@gmail.com', 'phone': '+20 122 345 6789', 'city': 'Sheikh Zayed', 'addr': 'Allegria, Phase 2, Unit 18'},
            {'first': 'Salma', 'last': 'Farouk', 'email': 'salma.farouk@icloud.com', 'phone': '+20 109 112 3344', 'city': 'Maadi', 'addr': 'Street 9, Degla Maadi, Building 21'},
            {'first': 'Tarek', 'last': 'Kamel', 'email': 'tarek.kamel@yahoo.com', 'phone': '+20 106 554 4332', 'city': 'Heliopolis', 'addr': '5 Beirut Street, Korba'},
            {'first': 'Amina', 'last': 'Sherif', 'email': 'amina.sherif@gmail.com', 'phone': '+20 115 998 7766', 'city': 'Alexandria', 'addr': 'Loran, Cornish Road, Tower A'},
        ]
        customers = []
        for cinfo in customers_data:
            cust, _ = Customer.objects.get_or_create(
                store=store,
                email=cinfo['email'],
                defaults={
                    'first_name': cinfo['first'],
                    'last_name': cinfo['last'],
                    'phone': cinfo['phone'],
                    'city': cinfo['city'],
                    'default_address': cinfo['addr'],
                }
            )
            customers.append(cust)

        # 7. Demo Orders (Spanning the last 7 days to populate analytics)
        statuses_cycle = [
            OrderStatus.DELIVERED,
            OrderStatus.DELIVERED,
            OrderStatus.SHIPPED,
            OrderStatus.PREPARING,
            OrderStatus.CONFIRMED,
            OrderStatus.DELIVERED,
            OrderStatus.SHIPPED,
            OrderStatus.CONFIRMED,
        ]

        if Order.objects.filter(store=store).count() < 8:
            all_variants = list(ProductVariant.objects.filter(product__store=store, stock_quantity__gt=2))
            now = timezone.now()

            for i in range(12):
                cust = customers[i % len(customers)]
                days_ago = random.randint(0, 6)
                order_date = now - timedelta(days=days_ago, hours=random.randint(1, 18))
                chosen_variants = random.sample(all_variants, k=random.randint(1, 3))

                order_status = statuses_cycle[i % len(statuses_cycle)]
                pay_status = PaymentStatus.PAID if order_status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED] else PaymentStatus.PENDING

                order_num = f"#NOIRE-{order_date.strftime('%y%m%d')}-{1000 + i}"
                subtotal = sum(Decimal(str(v.effective_price)) for v in chosen_variants)
                shipping_fee = Decimal('0.00') if subtotal >= Decimal('1500.00') else Decimal('60.00')
                discount_amount = Decimal('100.00') if i % 4 == 0 else Decimal('0.00')
                total = (subtotal - discount_amount) + shipping_fee

                order = Order.objects.create(
                    store=store,
                    customer=cust,
                    order_number=order_num,
                    customer_name=cust.full_name,
                    customer_email=cust.email,
                    customer_phone=cust.phone,
                    shipping_address=cust.default_address,
                    city=cust.city,
                    postal_code='11835',
                    country='Egypt',
                    status=order_status,
                    payment_method=PaymentMethod.COD if i % 2 == 0 else PaymentMethod.CARD,
                    payment_status=pay_status,
                    subtotal=subtotal,
                    discount_amount=discount_amount,
                    discount_code='WELCOME10' if discount_amount > 0 else '',
                    shipping_fee=shipping_fee,
                    total=total,
                    notes='Deliver after 2 PM if possible.' if i % 3 == 0 else '',
                    created_at=order_date
                )
                # Overwrite auto_now_add for created_at to simulate timeline
                Order.objects.filter(id=order.id).update(created_at=order_date)

                cust.orders_count += 1
                cust.total_spent = Decimal(str(cust.total_spent)) + Decimal(str(total))
                cust.save()

                for var in chosen_variants:
                    OrderItem.objects.create(
                        order=order,
                        product=var.product,
                        variant=var,
                        product_name=var.product.name,
                        variant_title=f"{var.color_name} / {var.size}",
                        sku=var.sku,
                        image_url=var.product.primary_image,
                        price=var.effective_price,
                        quantity=1,
                        total=var.effective_price
                    )

            self.stdout.write(self.style.SUCCESS(f"Seeded realistic demo orders and analytics history."))

        self.stdout.write(self.style.SUCCESS("All NOIRÉ demo data seeded successfully!"))
