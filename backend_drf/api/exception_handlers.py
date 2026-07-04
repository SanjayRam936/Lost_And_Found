"""Custom DRF exception handler.

DRF's default handler returns None for non-DRF (unexpected) exceptions, which
lets Django render the raw HTML "Server Error (500)" page. We instead log the
error and return a clean JSON body so the frontend never receives HTML.
"""
import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_default_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = drf_default_handler(exc, context)
    if response is not None:
        return response  # normal DRF errors (400/401/403/404/429...) pass through

    logger.exception("Unhandled API exception: %s", exc)
    return Response(
        {"detail": "Something went wrong on our side. Please try again in a moment."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
