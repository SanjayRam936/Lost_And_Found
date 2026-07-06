import secrets
from datetime import timedelta

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone

OTP_TTL_MINUTES = 10       # a verification code is valid for 10 minutes
OTP_MAX_ATTEMPTS = 5       # wrong guesses before a new code is required


class UserManager(BaseUserManager):
    """Manager for the email-based custom user model (no username field)."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Email is the unique identifier used for authentication instead of username."""

    username = None
    email = models.EmailField('email address', unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    upi_id = models.CharField(max_length=100, blank=True, default='')  # for receiving rewards

    # Email-ownership verification (registration OTP). Unverified accounts are
    # kept inactive so they cannot authenticate until they confirm the code.
    is_email_verified = models.BooleanField(default=False)
    email_otp = models.CharField(max_length=6, blank=True, default='')
    email_otp_sent_at = models.DateTimeField(null=True, blank=True)
    email_otp_attempts = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # email + password are required by default

    objects = UserManager()

    def __str__(self):
        return self.email

    # ── Email OTP helpers ────────────────────────────────────────────────────
    def issue_otp(self):
        """Generate a fresh 6-digit code and reset the attempt counter."""
        self.email_otp = f"{secrets.randbelow(1_000_000):06d}"
        self.email_otp_sent_at = timezone.now()
        self.email_otp_attempts = 0
        return self.email_otp

    def otp_is_expired(self):
        if not self.email_otp_sent_at:
            return True
        return timezone.now() > self.email_otp_sent_at + timedelta(minutes=OTP_TTL_MINUTES)

    def verify_otp(self, code):
        """Validate a submitted code. Returns (ok: bool, message: str). On success
        the account is marked verified + active and the code is cleared."""
        if not self.email_otp:
            return False, 'No verification code is pending. Please request a new one.'
        if self.otp_is_expired():
            return False, 'This code has expired. Please request a new one.'
        if self.email_otp_attempts >= OTP_MAX_ATTEMPTS:
            return False, 'Too many incorrect attempts. Please request a new code.'
        if str(code).strip() != self.email_otp:
            self.email_otp_attempts += 1
            self.save(update_fields=['email_otp_attempts'])
            return False, 'Incorrect code. Please check your email and try again.'
        self.is_email_verified = True
        self.is_active = True
        self.email_otp = ''
        self.email_otp_attempts = 0
        self.save(update_fields=['is_email_verified', 'is_active', 'email_otp', 'email_otp_attempts'])
        return True, 'ok'
