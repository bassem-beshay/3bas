import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class UserRole(models.TextChoices):
    SUPERADMIN = 'SUPERADMIN', 'Super Admin'
    STORE_OWNER = 'STORE_OWNER', 'Store Owner'
    STORE_ADMIN = 'STORE_ADMIN', 'Store Admin'
    CUSTOMER = 'CUSTOMER', 'Customer'

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STORE_OWNER
    )
    
    # Store association for merchant users
    store = models.ForeignKey(
        'stores.Store',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_members'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"
