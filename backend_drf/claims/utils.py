"""Feature 2 — pre-claim ownership verification helpers.

The owner re-enters key details about their lost item from memory; we fuzzily
compare them against the stored report to decide whether to generate the OTP.
"""
from difflib import SequenceMatcher

FUZZY_THRESHOLD = 0.75


def _norm(s):
    return (s or '').strip().lower()


def _fuzzy_match(a, b, threshold=FUZZY_THRESHOLD):
    """Case-insensitive fuzzy equality using SequenceMatcher ratio."""
    a, b = _norm(a), _norm(b)
    if not a or not b:
        return False
    if a == b:
        return True
    return SequenceMatcher(None, a, b).ratio() >= threshold


def _feature_match(answer, lost_item, threshold=FUZZY_THRESHOLD):
    """A unique-feature answer 'matches' if it is fuzzily present in the lost
    item's free text (description / title / brand) — a substring hit, a strong
    per-word similarity, or overall ratio all count."""
    ans = _norm(answer)
    if not ans:
        return False
    haystack = f"{_norm(lost_item.description)} {_norm(lost_item.title)} {_norm(lost_item.brand)}"
    if ans in haystack:
        return True
    words = haystack.split()
    for token in ans.split():
        if len(token) >= 3 and any(SequenceMatcher(None, token, w).ratio() >= threshold for w in words):
            return True
    return SequenceMatcher(None, ans, haystack).ratio() >= threshold


def verify_ownership_answers(lost_item, answers):
    """Compare the owner's from-memory answers against the stored lost report.

    Scoring: title +2, color +2, brand +1 (bonus), unique_feature +1 (bonus).
        score >= 4 -> VERIFIED
        score 2-3  -> PARTIAL
        score < 2  -> FAILED

    Returns: {'score', 'status', 'field_results': {title, color, brand, unique_feature}}
    """
    title_ok = _fuzzy_match(answers.get('title'), lost_item.title)
    color_ok = _fuzzy_match(answers.get('color'), lost_item.color)

    brand_answer = (answers.get('brand') or '').strip()
    brand_ok = bool(brand_answer) and _fuzzy_match(brand_answer, lost_item.brand)

    feature_answer = (answers.get('unique_feature') or '').strip()
    feature_ok = bool(feature_answer) and _feature_match(feature_answer, lost_item)

    score = (2 if title_ok else 0) + (2 if color_ok else 0) + \
            (1 if brand_ok else 0) + (1 if feature_ok else 0)

    if score >= 4:
        status = 'VERIFIED'
    elif score >= 2:
        status = 'PARTIAL'
    else:
        status = 'FAILED'

    return {
        'score': score,
        'status': status,
        'field_results': {
            'title': title_ok,
            'color': color_ok,
            'brand': brand_ok,
            'unique_feature': feature_ok,
        },
    }
