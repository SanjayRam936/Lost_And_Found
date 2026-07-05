"""Deterministic text-quality checks for title / description / brand.

Only NON-AI checks live here (length, character make-up, keyboard-mash, emoji,
entropy, brand↔category mapping). The AI *semantic* consistency checks
(title↔category, title↔description) live in cross_field_validator.py so all the
model-backed logic stays in one place.
"""
import re
import unicodedata

from .constants import BRAND_CATEGORY_MAP

# Common keyboard-walk / mash sequences we treat as meaningless.
_KEYBOARD_SEQUENCES = [
    'qwerty', 'qwertyuiop', 'asdf', 'asdfgh', 'asdfghjkl', 'zxcvbn', 'zxcvbnm',
    'qazwsx', 'wsxedc', '1234', '12345', '123456', 'abcd', 'abcdef',
]
_COMMON_TEST_STRINGS = {'test', 'test123', 'testing', 'asdf123', 'abc', 'xyz', 'aaa'}

_EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001FAFF"   # symbols & pictographs, emoji, supplemental
    "\U00002600-\U000027BF"   # misc symbols & dingbats
    "\U0001F1E6-\U0001F1FF"   # regional indicators (flags)
    "\U0000FE00-\U0000FE0F"   # variation selectors
    "\U00002700-\U000027BF"
    "]", flags=re.UNICODE,
)


def _is_only_emoji(text):
    """True if the string is made up only of emoji / symbols / whitespace."""
    stripped = _EMOJI_RE.sub('', text)
    stripped = ''.join(ch for ch in stripped if not ch.isspace())
    # Drop remaining symbol/punctuation-only leftovers.
    stripped = ''.join(ch for ch in stripped if unicodedata.category(ch)[0] not in ('S',))
    return len(stripped) == 0 and bool(text.strip())


def _is_keyboard_mash(text):
    """Heuristic: repeated characters, keyboard walks, or very low entropy."""
    t = text.strip().lower()
    if not t:
        return False
    # 1) 4+ of the same character in a row -> "aaaa", "!!!!"
    if re.search(r'(.)\1{3,}', t):
        return True
    # 2) known keyboard sequences appearing as a chunk
    compact = re.sub(r'[^a-z0-9]', '', t)
    if compact in _COMMON_TEST_STRINGS:
        return True
    for seq in _KEYBOARD_SEQUENCES:
        if seq in compact:
            return True
    # 3) low entropy — ONLY for a single unbroken token. Real sentences have
    #    spaces and varied words and legitimately have a lowish unique-char
    #    ratio, so applying this to multi-word text false-flags normal input.
    if ' ' not in t:
        letters = re.sub(r'[^a-z0-9]', '', t)
        if len(letters) >= 6 and len(set(letters)) / len(letters) < 0.45:
            return True
    return False


def validate_title(title):
    """Title format/quality. Returns (errors: dict, warnings: list)."""
    errors, warnings = {}, []
    value = (title or '').strip()

    if len(value) < 3 or len(value) > 100:
        errors['title'] = 'Item title must be between 3 and 100 characters.'
        return errors, warnings
    if value.isdigit():
        errors['title'] = 'Item title cannot be only numbers.'
        return errors, warnings
    if not re.search(r'[A-Za-z0-9]', value):          # only symbols
        errors['title'] = 'Item title cannot be only symbols.'
        return errors, warnings
    if _is_keyboard_mash(value):
        errors['title'] = 'Your item title appears to contain random or meaningless text.'
        return errors, warnings
    return errors, warnings


def validate_description(description):
    """Description format/quality. Returns (errors: dict, warnings: list)."""
    errors, warnings = {}, []
    value = (description or '').strip()

    if len(value) < 30:
        errors['description'] = 'Description must be at least 30 characters.'
        return errors, warnings
    if len(value) > 5000:
        errors['description'] = 'Description must not exceed 5000 characters.'
        return errors, warnings
    if _is_only_emoji(value):
        errors['description'] = 'Your description appears to contain random or meaningless text.'
        return errors, warnings
    if _is_keyboard_mash(value):
        errors['description'] = 'Your description appears to contain random or meaningless text.'
        return errors, warnings
    return errors, warnings


def validate_brand(brand, category=None):
    """Brand format + brand↔category mapping. Mapping mismatch WARNS (never
    rejects) because the mapping is intentionally non-exhaustive."""
    errors, warnings = {}, []
    value = (brand or '').strip()
    if not value:
        return errors, warnings                        # optional

    if len(value) < 2 or len(value) > 50:
        errors['brand'] = 'Brand must be between 2 and 50 characters.'
        return errors, warnings
    if not re.match(r'^[A-Za-z0-9 ]+$', value):
        errors['brand'] = 'Brand may contain only letters, numbers and spaces.'
        return errors, warnings

    if category:
        mapped = BRAND_CATEGORY_MAP.get(value.lower())
        if mapped and category not in mapped:
            warnings.append('This brand is not typically associated with this category.')
    return errors, warnings
