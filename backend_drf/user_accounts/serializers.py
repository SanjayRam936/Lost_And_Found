from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User

# Known temporary / disposable email providers — registrations with these are
# rejected so accounts are tied to a usable inbox.
DISPOSABLE_EMAIL_DOMAINS = {
    'mailinator.com', '10minutemail.com', '10minutemail.net', 'guerrillamail.com',
    'guerrillamail.net', 'tempmail.com', 'temp-mail.org', 'yopmail.com',
    'throwawaymail.com', 'trashmail.com', 'getnada.com', 'sharklasers.com',
    'dispostable.com', 'maildrop.cc', 'fakeinbox.com', 'mailnesia.com',
    'mohmal.com', 'moakt.com', 'mintemail.com', 'emailondeck.com', 'tempinbox.com',
    '33mail.com', 'spam4.me', 'grr.la', 'inboxbear.com', 'tempr.email',
}


def _domain_has_mail_server(domain):
    """True if the domain has an MX (or A) record — i.e. can receive mail.
    Returns False only when the domain provably has no mail server; any lookup
    error is FAIL-OPEN (we don't block real users on a transient DNS hiccup)."""
    try:
        import dns.resolver
    except Exception:
        return True                                    # library missing -> skip check
    try:
        answers = dns.resolver.resolve(domain, 'MX', lifetime=4)
        return len(answers) > 0
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers):
        # No mail servers / domain doesn't exist -> not a real email domain.
        try:
            dns.resolver.resolve(domain, 'A', lifetime=4)   # some domains accept mail via A
            return True
        except Exception:
            return False
    except Exception:
        return True                                    # timeout / other -> fail-open


class UserSerializer(serializers.ModelSerializer):
    """Public-facing representation of a user (never exposes the password)."""

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone_number', 'date_joined', 'is_staff']
        read_only_fields = ['id', 'email', 'date_joined', 'is_staff']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password],
        style={'input_type': 'password'},
    )
    password2 = serializers.CharField(
        write_only=True, style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone_number', 'password', 'password2']

    def validate_email(self, value):
        value = (value or '').strip().lower()
        if '@' not in value:
            raise serializers.ValidationError('Please enter a valid email address.')
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')

        domain = value.rsplit('@', 1)[-1]
        if domain in DISPOSABLE_EMAIL_DOMAINS:
            raise serializers.ValidationError(
                'Temporary or disposable email addresses are not allowed. Please use a real email.')
        if not _domain_has_mail_server(domain):
            raise serializers.ValidationError(
                'That email domain does not exist. Please use a real email address.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Logs in with email/password and returns the user object alongside tokens."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['full_name'] = user.full_name
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, write_only=True, validators=[validate_password],
    )

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
