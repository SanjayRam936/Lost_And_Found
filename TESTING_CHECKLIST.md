# Lost & Found AI — Frontend Manual Test Checklist

**Frontend:** http://localhost:5173  **Backend:** http://localhost:8000
Seed data first: `python manage.py seed_demo_data`
Demo logins (password `Testpass123!`): `owner1@demo.com`, `finder1@demo.com`; admin: `admin@lostfound.ai` / `Admin@12345`.

> This reflects the **real** app: email-based auth, the 16-category dropdown, the
> map location picker, embedded per-claim chat, and recalibrated matching.

---

## 1. Home & Auth
- [ ] Home page loads; hero buttons ("I Lost / Found Something") open **Sign In** first.
- [ ] Register: validation fires (name letters-only, `@gmail.com` email, 10-digit phone, 8+ char password, passwords match).
- [ ] Register success → auto-logged-in → Dashboard.
- [ ] Logout → Sign In. Log back in with the same account → works (JWT persists on refresh).
- [ ] Invalid password → clear error, no login.
- [ ] "Admin Login" link → sign in as `admin@lostfound.ai` → **Admin dashboard** (normal users can't reach it).

## 2. Dashboard
- [ ] Greets by first name; "Report Lost/Found" render as real buttons (hover lift, arrow).
- [ ] Stat cards show real counts (Your Reports, AI Matches); clicking a card → My Reports.
- [ ] Recent Activity lists your items with status badges.

## 3. Report Lost Item
- [ ] Category dropdown shows all **16 categories** (scrollable) with icons.
- [ ] **Location:** map renders; **click the map / drag pin** shows the address **in words**; "Use my current location" (allow GPS) fills the address.
- [ ] Date/Time optional for lost; Photo optional (preview shows if chosen).
- [ ] Submit → lands on My Reports with the new item.

## 4. Report Found Item
- [ ] Same category dropdown + location map.
- [ ] Handover method: **Direct / Police / Institution**. Choosing Police/Institution reveals a **Handover Location** map.
- [ ] Reward preference **Yes/No** toggle works.
- [ ] Submit (with a photo) → item created; matching runs in the background.

## 5. Matching & Vivar Adar (privacy)
- [ ] After a matching found item, the **owner's** lost item shows **"AI Matched"** + a "You have an AI match!" banner.
- [ ] **Review Match** → shows the found item's photo/details + confidence %.
- [ ] Log in as a **different** user → they can **never** see that match (no banner, empty match views) even via a guessed URL.
- [ ] Finder's found item shows "AI Matched" / "OTP Ready — Confirm Handover" appropriately.

## 6. Claim + OTP (DIRECT handover)
- [ ] Owner clicks **Initiate My Item** → OTP page shows a 6-digit **OTP (owner only)** + embedded **chat** below it.
- [ ] Interacting with the top of the page does **not** jump to the bottom.
- [ ] Finder (separate login) → their found item → **Enter Handover OTP** → sees an empty OTP input + chat (no OTP code).
- [ ] Chat: message sent by one side appears for the other within a few seconds.
- [ ] Finder enters the **wrong** OTP → error. Enters the **correct** OTP → "Handover Confirmed".
- [ ] Owner's page auto-flips to **"Handover Successful"**.

## 7. Handover branch (POLICE / INSTITUTION)
- [ ] For a found item handed to Police/Institution: initiating the claim shows a **"Ready for Collection"** page with the **handover location on a map** — **no OTP, no chat**.

## 8. Reward
- [ ] `wants_reward = False`: after OTP verify, claim just closes — **no reward page**.
- [ ] `wants_reward = True`: after OTP verify, **reward page opens**; owner sets amount → "Send Reward (Demo)" (or Razorpay if keys set) → released.
- [ ] Finder gets a **"Reward received ₹X"** state on their found item + a notification.
- [ ] Owner's resolved lost item shows **"Reward Due" → Pay Reward** from the product list.

## 9. Notifications & Profile
- [ ] Bell badge shows unread count; opening Notifications lists real alerts and clears the badge.
- [ ] Profile shows real name/email/phone.
- [ ] **Update Preferences** opens toggles (match/claim/reward alerts) and **Save** confirms "Saved ✓".

## 10. Admin dashboard (staff only)
- [ ] Tabs work: **Overview** (live stats), **Users**, **Reports**, **Matches** (confidence %), **Claims**.
- [ ] Refresh button reloads the active tab. A non-staff user is blocked (403 / "Admin access required").

## 11. Misc / robustness
- [ ] Unknown route falls back to Home (no crash).
- [ ] **Responsive:** on a narrow/mobile view, the bottom nav shows, cards stack, and content never scrolls **under** the fixed bottom bar.
- [ ] Hard refresh on any logged-in page keeps you logged in (session restore).
