"""
Unit tests for the Lost & Found matching engine and claim/reward flow.

Written against the ACTUAL implementation:
  - scoring functions live in matching.views
  - endpoints: /api/v1/matches/..., /api/v1/claims/..., /api/v1/reward/...
  - custom email-based user (user_accounts.User)
  - confidence thresholds are recalibrated: STRONG >= 0.65, REVIEW >= 0.50

Run:  python manage.py test matching.tests -v 2
(The AI tests load MiniLM/CLIP the first time, so allow a minute.)
"""
import datetime

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from matching.views import (
    compute_semantic_score, compute_category_score, compute_color_score,
    compute_location_score, compute_time_score, compute_confidence,
    get_match_status, BASE_WEIGHTS,
)
from matching.models import MatchItem, VisibilityAccess
from lost_items.models import LostItems
from found_items.models import FoundItems
from claims.models import Claim

User = get_user_model()
TODAY = datetime.date.today()
NOON = datetime.time(12, 0)


def make_user(email):
    return User.objects.create_user(email=email, password='Testpass123!', full_name=email.split('@')[0])


def make_lost(user, **kw):
    defaults = dict(title='Item', description='an item', category='Watch', color='Black',
                    location='T Nagar', latitude=13.0418, longitude=80.2341,
                    date=TODAY, time=NOON, status='ACTIVE')
    defaults.update(kw)
    return LostItems.objects.create(user=user, **defaults)


def make_found(user, **kw):
    defaults = dict(title='Item', description='an item', category='Watch', color='Black',
                    location='T Nagar', latitude=13.0418, longitude=80.2341,
                    date=TODAY, time=NOON, handover_type='DIRECT', wants_reward=False)
    defaults.update(kw)
    return FoundItems.objects.create(user=user, **defaults)


def make_match(lost, found, **kw):
    defaults = dict(confidence_score=0.8, text_score=0.7, image_similarity=0.0,
                    match_location=1.0, time_score=1.0, status='STRONG')
    defaults.update(kw)
    return MatchItem.objects.create(lost_item=lost, found_item=found, **defaults)


# ────────────────────────────────────────────────────────────────────────────
# Tests 1–6 : scoring functions
# ────────────────────────────────────────────────────────────────────────────
class ScoreFunctionTests(TestCase):

    def test_01_semantic_text_score(self):
        """Similar meaning -> high; unrelated -> low."""
        high = compute_semantic_score('black leather wallet with cards',
                                      'dark leather billfold holding cards')
        low = compute_semantic_score('black leather wallet with cards',
                                     'yellow rubber duck bath toy')
        print(f"\n[1] semantic high={high:.3f} low={low:.3f}")
        self.assertGreaterEqual(high, 0.70)
        self.assertLessEqual(low, 0.30)

    def test_02_category_score(self):
        self.assertEqual(compute_category_score('Watch', 'Watch'), 1.0)
        self.assertEqual(compute_category_score('Watch', 'Keys'), 0.0)
        print("\n[2] category same=1.0 diff=0.0 OK")

    def test_03_color_score(self):
        self.assertEqual(compute_color_score('Black', 'black'), 1.0)  # case-insensitive
        self.assertEqual(compute_color_score('Black', 'Red'), 0.0)
        print("\n[3] color same=1.0 diff=0.0 OK")

    def test_04_location_score(self):
        near = compute_location_score(13.0500, 80.2800, 13.0550, 80.2800)   # ~0.55 km
        far = compute_location_score(13.0500, 80.2800, 13.1500, 80.2800)    # ~11 km
        print(f"\n[4] location near={near:.3f} far={far:.3f}")
        self.assertGreaterEqual(near, 0.80)
        self.assertEqual(far, 0.0)

    def test_05_time_score(self):
        same = compute_time_score(TODAY, TODAY)
        gap = compute_time_score(TODAY, TODAY - datetime.timedelta(days=60))
        print(f"\n[5] time same={same:.3f} gap={gap:.3f}")
        self.assertGreaterEqual(same, 0.99)
        self.assertEqual(gap, 0.0)

    def test_06_confidence_formula(self):
        """Weights sum to 1.0, and redistribute correctly when no owner image."""
        self.assertAlmostEqual(sum(BASE_WEIGHTS.values()), 1.0, places=6)
        perfect = {k: 1.0 for k in BASE_WEIGHTS}
        # With image: all signals 1.0 -> confidence 1.0
        self.assertAlmostEqual(compute_confidence(perfect, owner_has_image=True), 1.0, places=3)
        # Without image: clip_image weight redistributed across the rest -> still 1.0
        self.assertAlmostEqual(compute_confidence(perfect, owner_has_image=False), 1.0, places=3)
        # A middling case stays within [0, 1]
        c = compute_confidence({'semantic': 0.6, 'category': 1.0, 'color': 1.0}, owner_has_image=False)
        self.assertTrue(0.0 <= c <= 1.0)
        print("\n[6] weights sum=1.0, redistribution OK")

    def test_status_thresholds(self):
        self.assertEqual(get_match_status(0.9), 'STRONG')
        self.assertEqual(get_match_status(0.55), 'REVIEW')
        self.assertEqual(get_match_status(0.2), 'PENDING')


# ────────────────────────────────────────────────────────────────────────────
# Test 7 : Vivar Adar (queryset-level visibility)
# ────────────────────────────────────────────────────────────────────────────
class VivarAdarTests(TestCase):
    def setUp(self):
        self.owner = make_user('owner@t.com')
        self.other = make_user('other@t.com')
        self.finder = make_user('finder@t.com')
        lost = make_lost(self.owner)
        found = make_found(self.finder)
        self.match = make_match(lost, found)
        VisibilityAccess.objects.create(match=self.match, user=self.owner)  # owner only

    def test_07_owner_sees_others_dont(self):
        c = APIClient()
        c.force_authenticate(self.owner)
        r = c.get('/api/v1/matches/mine/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data), 1)

        c.force_authenticate(self.other)
        r2 = c.get('/api/v1/matches/mine/')
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(len(r2.data), 0)  # no VisibilityAccess -> empty
        print("\n[7] Vivar Adar: owner sees 1, other sees 0 OK")


# ────────────────────────────────────────────────────────────────────────────
# Test 8 : RunMatchingView (loads the AI models)
# ────────────────────────────────────────────────────────────────────────────
class RunMatchingViewTests(TestCase):
    def test_08_run_match_creates_visibility_for_owner_only(self):
        owner = make_user('o8@t.com')
        finder = make_user('f8@t.com')
        make_lost(owner, description='black casio g-shock watch rubber strap')
        found = make_found(finder, description='dark sports watch rubber band')

        c = APIClient()
        c.force_authenticate(finder)
        r = c.post(f'/api/v1/matches/run-match/{found.id}/')
        self.assertEqual(r.status_code, 201)
        self.assertGreaterEqual(len(r.data['matches']), 1)

        # VisibilityAccess only for the lost item's owner, never the finder
        self.assertTrue(VisibilityAccess.objects.filter(user=owner).exists())
        self.assertFalse(VisibilityAccess.objects.filter(user=finder).exists())
        print(f"\n[8] run-match created {len(r.data['matches'])} matches, "
              f"visibility for owner only OK")


# ────────────────────────────────────────────────────────────────────────────
# Test 9 : DismissMatchView
# ────────────────────────────────────────────────────────────────────────────
class DismissMatchTests(TestCase):
    def setUp(self):
        self.owner = make_user('o9@t.com')
        self.stranger = make_user('s9@t.com')
        self.match = make_match(make_lost(self.owner), make_found(make_user('f9@t.com')))
        VisibilityAccess.objects.create(match=self.match, user=self.owner)

    def test_09_dismiss_permissions(self):
        c = APIClient()
        c.force_authenticate(self.stranger)
        self.assertEqual(c.post(f'/api/v1/matches/dismiss/{self.match.id}/').status_code, 403)

        c.force_authenticate(self.owner)
        self.assertEqual(c.post(f'/api/v1/matches/dismiss/{self.match.id}/').status_code, 200)
        self.match.refresh_from_db()
        self.assertEqual(self.match.status, 'DISMISSED')
        print("\n[9] dismiss: stranger 403, owner 200 -> DISMISSED OK")


# ────────────────────────────────────────────────────────────────────────────
# Test 10 : OTP flow
# ────────────────────────────────────────────────────────────────────────────
class OTPFlowTests(TestCase):
    def setUp(self):
        self.owner = make_user('o10@t.com')
        self.finder = make_user('f10@t.com')
        self.match = make_match(make_lost(self.owner), make_found(self.finder, handover_type='DIRECT'))
        VisibilityAccess.objects.create(match=self.match, user=self.owner)
        self.c = APIClient()

    def test_10_otp_flow(self):
        # Owner initiates -> OTP generated and visible to owner
        self.c.force_authenticate(self.owner)
        r = self.c.post(f'/api/v1/claims/initiate/{self.match.id}/')
        self.assertEqual(r.status_code, 200)
        otp = r.data['otp_code']
        self.assertIsNotNone(otp)
        claim_id = r.data['id']

        # Finder sees the claim but NOT the OTP code
        self.c.force_authenticate(self.finder)
        det = self.c.get(f'/api/v1/claims/{claim_id}/')
        self.assertIsNone(det.data['otp_code'])

        # Wrong OTP -> 400
        bad = self.c.post(f'/api/v1/claims/{claim_id}/otp/verify/', {'otp': '000000'}, format='json')
        self.assertEqual(bad.status_code, 400)

        # Correct OTP by finder -> RESOLVED
        ok = self.c.post(f'/api/v1/claims/{claim_id}/otp/verify/', {'otp': otp}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(Claim.objects.get(id=claim_id).status, 'RESOLVED')
        print("\n[10] OTP: owner-only visibility, finder verifies, wrong=400, resolved OK")


# ────────────────────────────────────────────────────────────────────────────
# Test 11 : Handover branch
# ────────────────────────────────────────────────────────────────────────────
class HandoverBranchTests(TestCase):
    def test_11_direct_vs_police(self):
        owner = make_user('o11@t.com')
        finder = make_user('f11@t.com')

        m_direct = make_match(make_lost(owner), make_found(finder, handover_type='DIRECT'))
        VisibilityAccess.objects.create(match=m_direct, user=owner)
        m_police = make_match(make_lost(owner), make_found(finder, handover_type='POLICE'))
        VisibilityAccess.objects.create(match=m_police, user=owner)

        c = APIClient()
        c.force_authenticate(owner)
        d = c.post(f'/api/v1/claims/initiate/{m_direct.id}/')
        p = c.post(f'/api/v1/claims/initiate/{m_police.id}/')

        self.assertIsNotNone(d.data['otp_code'])         # DIRECT -> OTP
        self.assertEqual(d.data['status'], 'INITIATED')
        self.assertIsNone(p.data['otp_code'])            # POLICE -> no OTP
        self.assertEqual(p.data['status'], 'HANDED_OVER')
        print("\n[11] handover: DIRECT=OTP, POLICE=no-OTP/HANDED_OVER OK")


# ────────────────────────────────────────────────────────────────────────────
# Test 12 : Reward branch
# ────────────────────────────────────────────────────────────────────────────
class RewardBranchTests(TestCase):
    def _resolved_claim(self, wants_reward):
        owner = make_user(f'ro{int(wants_reward)}@t.com')
        finder = make_user(f'rf{int(wants_reward)}@t.com')
        match = make_match(make_lost(owner), make_found(finder, wants_reward=wants_reward))
        VisibilityAccess.objects.create(match=match, user=owner)
        claim = Claim.objects.create(match=match, handover_type='DIRECT',
                                     otp_verified=True, status='RESOLVED')
        return owner, claim

    def test_12_reward_branch(self):
        c = APIClient()
        # wants_reward=False -> reward endpoint refuses (no reward flow)
        owner_no, claim_no = self._resolved_claim(False)
        c.force_authenticate(owner_no)
        self.assertEqual(c.get(f'/api/v1/reward/{claim_no.id}/').status_code, 400)

        # wants_reward=True -> reward summary available (reward flow opens)
        owner_yes, claim_yes = self._resolved_claim(True)
        c.force_authenticate(owner_yes)
        r = c.get(f'/api/v1/reward/{claim_yes.id}/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['role'], 'owner')
        print("\n[12] reward: wants_reward=False->400, True->200 OK")
