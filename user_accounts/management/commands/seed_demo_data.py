"""
seed_demo_data — populate the database with realistic demo data for testing.

Run with:  python manage.py seed_demo_data

NOTE: the real app uses the `user_accounts` custom User (email-based, with
full_name/phone_number — there is no `role`/`upi_id` field), so this command is
written against the actual models rather than the idealised spec.

Creates:
  - 3 users: owner1, owner2, finder1 (known password)
  - 3 lost item reports (different categories, Chennai GPS)
  - 3 found item reports (2 designed to match, 1 unrelated)
  - Both wants_reward=True and wants_reward=False
  - Both handover_type DIRECT and POLICE
"""
import io
import datetime

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile

from lost_items.models import LostItems
from found_items.models import FoundItems

User = get_user_model()

PASSWORD = "Testpass123!"

# Realistic Chennai, India coordinates
T_NAGAR = (13.0418, 80.2341)
MARINA = (13.0500, 80.2824)
ANNA_NAGAR = (13.0850, 80.2101)


def _png(text, bg=(30, 30, 30)):
    """Build a small PNG (with some text for OCR) as an in-memory file."""
    from PIL import Image, ImageDraw
    img = Image.new('RGB', (420, 300), bg)
    ImageDraw.Draw(img).text((20, 140), text, fill=(240, 240, 240))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return ContentFile(buf.getvalue())


class Command(BaseCommand):
    help = "Seed the database with demo users, lost items and found items."

    def handle(self, *args, **options):
        today = datetime.date.today()
        noon = datetime.time(12, 0)

        # --- Clean any previous demo data (idempotent) ---------------------
        demo_emails = ['owner1@demo.com', 'owner2@demo.com', 'finder1@demo.com']
        User.objects.filter(email__in=demo_emails).delete()  # cascades items

        # --- Users ---------------------------------------------------------
        owner1 = User.objects.create_user(email='owner1@demo.com', password=PASSWORD,
                                           full_name='Owner One', phone_number='9000000001')
        owner2 = User.objects.create_user(email='owner2@demo.com', password=PASSWORD,
                                           full_name='Owner Two', phone_number='9000000002')
        finder1 = User.objects.create_user(email='finder1@demo.com', password=PASSWORD,
                                            full_name='Finder One', phone_number='9000000003')

        # --- Lost items (owner1 & owner2) ----------------------------------
        lost_watch = LostItems.objects.create(
            user=owner1, title='Black Casio Watch',
            description='Black Casio G-Shock watch with a rubber strap, lost near T Nagar.',
            category='Watch', color='Black', location='T Nagar, Chennai',
            latitude=T_NAGAR[0], longitude=T_NAGAR[1], date=today, time=noon, status='ACTIVE',
        )
        lost_wallet = LostItems.objects.create(
            user=owner1, title='Brown Leather Wallet',
            description='Brown leather wallet containing ID cards and some cash.',
            category='Wallet & Purse', color='Brown', location='Marina Beach, Chennai',
            latitude=MARINA[0], longitude=MARINA[1], date=today, time=noon, status='ACTIVE',
        )
        lost_phone = LostItems.objects.create(
            user=owner2, title='iPhone 13',
            description='Blue Apple iPhone 13 with a clear case, lost in Anna Nagar.',
            category='Phone & Tablets', color='Blue', location='Anna Nagar, Chennai',
            latitude=ANNA_NAGAR[0], longitude=ANNA_NAGAR[1], date=today, time=noon, status='ACTIVE',
        )

        # --- Found items (finder1) -----------------------------------------
        # (1) matches lost_watch — DIRECT handover, wants_reward=True
        found_watch = FoundItems.objects.create(
            user=finder1, title='Dark Sports Watch',
            description='Dark sports watch with rubber band, found near T Nagar signal.',
            category='Watch', color='Black', location='T Nagar, Chennai',
            latitude=T_NAGAR[0] + 0.001, longitude=T_NAGAR[1] + 0.001, date=today, time=noon,
            handover_type='DIRECT', wants_reward=True,
        )
        found_watch.image.save('casio.png', _png('CASIO G-SHOCK'), save=True)

        # (2) matches lost_wallet — POLICE handover, wants_reward=False
        found_wallet = FoundItems.objects.create(
            user=finder1, title='Leather Wallet',
            description='A brown leather wallet found on Marina Beach, handed to police.',
            category='Wallet & Purse', color='Brown', location='Marina Beach, Chennai',
            latitude=MARINA[0], longitude=MARINA[1], date=today, time=noon,
            handover_type='POLICE', wants_reward=False, handover_place='Marina Police Station',
            handover_latitude=MARINA[0], handover_longitude=MARINA[1],
        )
        found_wallet.image.save('wallet.png', _png('WALLET'), save=True)

        # (3) unrelated — should NOT match anything strongly
        found_keys = FoundItems.objects.create(
            user=finder1, title='Bunch of Keys',
            description='A bunch of house keys on a red keychain, found in Guindy.',
            category='Keys', color='Silver', location='Guindy, Chennai',
            latitude=13.0067, longitude=80.2206, date=today, time=noon,
            handover_type='DIRECT', wants_reward=False,
        )

        # --- Summary -------------------------------------------------------
        w = self.stdout.write
        w(self.style.SUCCESS('\n=== DEMO DATA SEEDED ==='))
        w(f"\nUsers (password for all: {PASSWORD}):")
        for u in (owner1, owner2, finder1):
            w(f"  #{u.id}  {u.email}")
        w("\nLost items:")
        for i in (lost_watch, lost_wallet, lost_phone):
            w(f"  #{i.id}  {i.title!r}  [{i.category}]  owner={i.user.email}")
        w("\nFound items:")
        for i in (found_watch, found_wallet, found_keys):
            w(f"  #{i.id}  {i.title!r}  [{i.category}]  handover={i.handover_type}  "
              f"reward={i.wants_reward}  finder={i.user.email}")
        w("\nSuggested match runs:")
        w(f"  POST /api/v1/matches/run-match/{found_watch.id}/   (-> should match lost #{lost_watch.id})")
        w(f"  POST /api/v1/matches/run-match/{found_wallet.id}/  (-> should match lost #{lost_wallet.id})")
        w(self.style.SUCCESS('\nDone.\n'))
