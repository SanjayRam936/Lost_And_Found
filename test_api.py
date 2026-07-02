"""
End-to-end API integration test for Lost & Found AI.

Runs the full journey against a LIVE server and prints PASS/FAIL per step.
Start the backend first:  python manage.py runserver 8000

Usage:  python test_api.py

Endpoints are the REAL ones (email-based auth, /register/, /lost-items/report/,
/matches/run-match/, /claims/, /reward/ ...), not the idealised spec.
NOTE: the first found-item / run-match call loads the AI models, so allow ~1–2
minutes for those steps.
"""
import uuid
import random
import requests

BASE = "http://localhost:8000/api/v1"
PWD = "Testpass123!"
SUF = uuid.uuid4().hex[:8]                      # unique so re-runs don't clash
OWNER_EMAIL = f"owner_{SUF}@test.com"
FINDER_EMAIL = f"finder_{SUF}@test.com"
# Unique location per run so items from previous runs don't compete for the match.
LAT = round(12.85 + random.random() * 0.35, 5)
LNG = round(80.10 + random.random() * 0.30, 5)

results = []


def check(name, ok, detail=""):
    results.append((name, ok))
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}" + (f"  — {detail}" if detail else ""))
    return ok


def register(email):
    r = requests.post(f"{BASE}/register/", json={
        "full_name": email.split('@')[0], "email": email,
        "phone_number": "9000000000", "password": PWD, "password2": PWD,
    }, timeout=30)
    return r


def login(email):
    r = requests.post(f"{BASE}/login/", json={"email": email, "password": PWD}, timeout=30)
    return r.json().get("access") if r.status_code == 200 else None


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def cleanup_prior_test_data():
    """Remove users from previous runs of THIS script so their (near-identical)
    demo items don't pollute AI matching. Best-effort — needs Django settings."""
    try:
        import os, sys, django
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend_drf'))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
        django.setup()
        from django.contrib.auth import get_user_model
        n, _ = get_user_model().objects.filter(email__endswith='@test.com').delete()
        print(f"  (cleaned {n} objects from prior test runs)\n")
    except Exception as e:  # pragma: no cover
        print(f"  (skipped prior-data cleanup: {e})\n")


def main():
    print("\n=== LOST & FOUND AI — API INTEGRATION TEST ===\n")
    cleanup_prior_test_data()

    # Step 1–2: register
    check("Step 1  register owner", register(OWNER_EMAIL).status_code == 201)
    check("Step 2  register finder", register(FINDER_EMAIL).status_code == 201)

    # Step 3–4: login
    owner_tok = login(OWNER_EMAIL)
    finder_tok = login(FINDER_EMAIL)
    check("Step 3  login owner (JWT)", bool(owner_tok))
    check("Step 4  login finder (JWT)", bool(finder_tok))
    if not (owner_tok and finder_tok):
        return summary()

    # Step 5: owner reports a DISTINCTIVE lost item (a water bottle — so no other
    # item in the DB competes and the match is deterministic).
    r = requests.post(f"{BASE}/lost-items/report/", headers=auth(owner_tok), json={
        "title": "Orange Hydro Flask", "category": "Water Bottle", "color": "Orange",
        "description": "Orange Hydro Flask insulated steel water bottle with a dented base",
        "location": "Adyar, Chennai", "latitude": LAT, "longitude": LNG,
        "date": "2026-07-01", "time": "12:00:00",
    }, timeout=60)
    lost_id = r.json().get("id")
    check("Step 5  owner reports lost item", r.status_code == 201, f"lost id={lost_id}")

    # Step 6: finder reports the matching found bottle (auto-runs AI matching — slow)
    print("  (reporting found item — first AI matching run, this can take a minute…)")
    r = requests.post(f"{BASE}/found-items/report/", headers=auth(finder_tok), json={
        "title": "Steel Water Bottle", "category": "Water Bottle", "color": "Orange",
        "description": "orange insulated steel water bottle with a dented base",
        "location": "Adyar, Chennai", "latitude": LAT + 0.0003, "longitude": LNG + 0.0003,
        "date": "2026-07-01", "time": "12:00:00", "handover_type": "DIRECT", "wants_reward": True,
    }, timeout=300)
    found_id = r.json().get("id")
    check("Step 6  finder reports found item", r.status_code == 201, f"found id={found_id}")

    # Step 7: trigger matching explicitly.
    r = requests.post(f"{BASE}/matches/run-match/{found_id}/", headers=auth(finder_tok), timeout=300)
    check("Step 7  trigger AI matching", r.status_code == 201, f"{r.json().get('message', '')}")

    # Step 8: owner sees the match (Vivar Adar — owner has visibility). Select the
    # match for THIS finder's found item (the lost item's own view includes it
    # even after it flips to MATCHED).
    r = requests.get(f"{BASE}/matches/for-lost/{lost_id}/", headers=auth(owner_tok), timeout=60)
    owner_matches = r.json() if r.status_code == 200 else []
    check("Step 8  owner sees match results", r.status_code == 200 and len(owner_matches) >= 1,
          f"{len(owner_matches)} match(es)")
    m = next((x for x in owner_matches if x.get("found_item", {}).get("id") == found_id), None)
    match_id = m["id"] if m else None

    # Step 9: finder (wrong user for THIS lost item) sees nothing -> Vivar Adar
    r = requests.get(f"{BASE}/matches/for-lost/{lost_id}/", headers=auth(finder_tok), timeout=60)
    check("Step 9  wrong user blocked (Vivar Adar)", r.status_code == 200 and len(r.json()) == 0,
          "finder gets empty queryset")

    if not match_id:
        return summary()

    # Step 10: owner initiates claim -> OTP
    r = requests.post(f"{BASE}/claims/initiate/{match_id}/", headers=auth(owner_tok), timeout=60)
    claim = r.json()
    claim_id, otp = claim.get("id"), claim.get("otp_code")
    check("Step 10 owner initiates claim", r.status_code == 200 and otp is not None,
          f"claim id={claim_id}")

    # Step 11: OTP visible to owner, hidden from finder
    r = requests.get(f"{BASE}/claims/{claim_id}/", headers=auth(finder_tok), timeout=30)
    check("Step 11 OTP hidden from finder", r.json().get("otp_code") is None)

    # Step 12: finder submits OTP -> resolved
    r = requests.post(f"{BASE}/claims/{claim_id}/otp/verify/", headers=auth(finder_tok),
                      json={"otp": otp}, timeout=30)
    check("Step 12 finder verifies OTP -> resolved",
          r.status_code == 200 and r.json().get("status") == "RESOLVED")

    # Step 13: reward flow (found.wants_reward = True)
    r = requests.get(f"{BASE}/reward/{claim_id}/", headers=auth(owner_tok), timeout=30)
    check("Step 13 reward page opens (wants_reward=True)",
          r.status_code == 200 and r.json().get("role") == "owner")

    summary()


def summary():
    passed = sum(1 for _, ok in results if ok)
    print(f"\n=== RESULT: {passed}/{len(results)} steps passed ===\n")


if __name__ == "__main__":
    main()
