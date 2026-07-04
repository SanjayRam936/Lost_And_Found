"""Lightweight real-time field checker for the frontend's debounced validation.

POST /api/v1/validation/check-field/
Body:   { "field": "title|description|brand", "value": "...", "category": "..." }
Return: { "valid": bool, "message": "...", "warning": bool (optional) }

Only fast text checks (+ the title↔category semantic check) run here — never
the image/CLIP pipeline — so it stays snappy behind a keystroke debounce.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from . import text_validator
from .ai_utils import text_similarity
from .cross_field_validator import TITLE_CATEGORY_MIN


class CheckFieldView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        field = request.data.get('field')
        value = (request.data.get('value') or '').strip()
        category = request.data.get('category')

        if field == 'title':
            errors, _ = text_validator.validate_title(value)
            if errors:
                return Response({'valid': False, 'message': errors['title']})
            if category:
                sim = text_similarity(value, category)
                if sim is not None and sim < TITLE_CATEGORY_MIN:
                    return Response({'valid': False,
                                     'message': 'Your item title does not match the selected category.'})
            return Response({'valid': True, 'message': 'Looks good.'})

        if field == 'description':
            errors, _ = text_validator.validate_description(value)
            if errors:
                return Response({'valid': False, 'message': errors['description']})
            return Response({'valid': True, 'message': 'Looks good.'})

        if field == 'brand':
            errors, warnings = text_validator.validate_brand(value, category)
            if errors:
                return Response({'valid': False, 'message': list(errors.values())[0]})
            if warnings:
                return Response({'valid': True, 'warning': True, 'message': warnings[0]})
            return Response({'valid': True, 'message': 'Looks good.'})

        return Response({'valid': True, 'message': ''})
