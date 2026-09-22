from django.utils.deprecation import MiddlewareMixin
from apps.stores.models import Store

class TenantResolutionMiddleware(MiddlewareMixin):
    """
    Resolves the active tenant (Store) based on:
    1. Header: 'X-Store-Slug'
    2. Query parameter: ?store=<slug>
    3. Host subdomain or custom domain
    4. Fallback default store ('noire' or first active store)
    """

    def process_request(self, request):
        store_slug = (
            request.headers.get('x-store-slug') or
            request.META.get('HTTP_X_STORE_SLUG') or
            request.GET.get('store')
        )

        store = None

        if store_slug:
            store = Store.objects.filter(slug=store_slug.lower(), is_active=True).first()

        # Check host for custom domain or subdomain if not matched
        if not store:
            host = request.get_host().split(':')[0].lower()
            # Check custom domain first
            store = Store.objects.filter(custom_domain=host, is_active=True).first()
            if not store and '.' in host:
                subdomain = host.split('.')[0]
                if subdomain not in ('www', 'api', 'localhost', 'app'):
                    store = Store.objects.filter(slug=subdomain, is_active=True).first()

        # Fallback to default store if still none
        if not store:
            store = Store.objects.filter(slug='noire', is_active=True).first()
            if not store:
                store = Store.objects.filter(is_active=True).first()

        request.store = store
        return None
