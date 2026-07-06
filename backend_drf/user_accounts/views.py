import logging

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .emailing import send_otp_email
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
)

logger = logging.getLogger(__name__)

RESEND_COOLDOWN_SECONDS = 30


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {
        'user': UserSerializer(user).data,
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    """Create an INACTIVE account and email a 6-digit verification code. The
    account is only usable once the code is confirmed at /verify-email/."""

    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        email = data['email']

        # A verified email is rejected in the serializer; anything found here is an
        # unverified account being re-registered — refresh its details in place.
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User(email=email)
        user.full_name = data.get('full_name', '') or user.full_name
        user.phone_number = data.get('phone_number', '') or user.phone_number
        user.set_password(data['password'])
        user.is_active = False
        user.is_email_verified = False
        user.issue_otp()
        user.save()

        try:
            send_otp_email(user)
        except Exception as exc:
            logger.exception('Verification email failed for %s: %s', email, exc)
            return Response(
                {'detail': 'We could not send the verification email right now. Please try again in a moment.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {'detail': 'verification_required', 'email': user.email},
            status=status.HTTP_202_ACCEPTED,
        )


class VerifyEmailView(APIView):
    """Confirm the 6-digit code, activate the account, and log the user in."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        code = (request.data.get('code') or '').strip()
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            return Response({'detail': 'No account found for this email.'}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_email_verified:
            return Response(_tokens_for(user), status=status.HTTP_200_OK)
        ok, message = user.verify_otp(code)
        if not ok:
            return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(_tokens_for(user), status=status.HTTP_200_OK)


class ResendOtpView(APIView):
    """Reissue and resend a verification code (with a short cooldown)."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        user = User.objects.filter(email__iexact=email, is_email_verified=False).first()
        if user is not None:
            if user.email_otp_sent_at and (timezone.now() - user.email_otp_sent_at).total_seconds() < RESEND_COOLDOWN_SECONDS:
                return Response(
                    {'detail': 'Please wait a few seconds before requesting another code.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
            user.issue_otp()
            user.save()
            try:
                send_otp_email(user)
            except Exception as exc:
                logger.exception('Resend verification email failed for %s: %s', email, exc)
                return Response(
                    {'detail': 'Could not send the email right now. Please try again in a moment.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        # Generic response either way so we don't reveal which emails exist.
        return Response({'detail': 'If that email still needs verification, a new code has been sent.'}, status=status.HTTP_200_OK)


class LoginView(TokenObtainPairView):
    """Email + password -> {access, refresh, user}."""

    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """Blacklist the supplied refresh token so it can no longer be used."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response(
                {'detail': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            return Response(
                {'detail': 'Invalid or expired refresh token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {'detail': 'Logout successful.'},
            status=status.HTTP_205_RESET_CONTENT,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH the authenticated user's own profile."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response(
            {'detail': 'Password updated successfully.'},
            status=status.HTTP_200_OK,
        )
