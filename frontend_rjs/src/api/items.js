import api from './client';

// --- Normalisers: backend record -> shape the UI components expect ----------
function normalizeLost(it) {
  const claim = it.claim || null;
  let status = (it.status || 'ACTIVE').toLowerCase(); // active | matched | resolved
  // Derive the owner-facing status from the claim lifecycle so a completed
  // handover never keeps showing "Review Match" (even if the item's own status
  // field lags). Reward-due > resolved > (matched from the item's status).
  if (claim) {
    if (claim.status === 'RESOLVED') {
      status = (claim.wants_reward && claim.reward_status !== 'RELEASED') ? 'reward-due' : 'resolved';
    } else if (claim.status === 'HANDED_OVER') {
      // Police / institution drop-off completed (no OTP step).
      status = 'resolved';
    }
  }
  return {
    id: `lost-${it.id}`, // unique key across the merged lost+found list
    pk: it.id,
    type: 'lost',
    status,
    claim,                                  // { id, match_id, status, wants_reward, reward_status } | null
    category: it.category,
    title: it.title,
    brand: it.brand || '',
    color: it.color || '',
    description: it.description || '',
    location: it.location || '',
    latitude: it.latitude ?? null,
    longitude: it.longitude ?? null,
    // Feature 1 — route-based location.
    locationType: it.location_type || 'EXACT',
    sourceLocation: it.source_location || '',
    sourceLat: it.source_latitude ?? null,
    sourceLng: it.source_longitude ?? null,
    destLocation: it.dest_location || '',
    destLat: it.dest_latitude ?? null,
    destLng: it.dest_longitude ?? null,
    date: it.date || '',
    time: it.time || '',
    image: it.image || null,
    created_at: it.created_at,
  };
}

function normalizeFound(it) {
  const claim = it.claim || null;
  // Derive a finder-facing status: reward > resolved > claim > match.
  let status = 'active';
  if (claim && claim.status === 'RESOLVED') {
    if (claim.reward_status === 'RELEASED') status = 'reward-received';
    else if (claim.wants_reward) status = 'reward-pending';
    else status = 'resolved';
  } else if (claim && claim.status === 'INITIATED') status = 'claim-initiated';
  else if (it.is_matched) status = 'matched';

  return {
    id: `found-${it.id}`,
    pk: it.id,
    type: 'found',
    status,
    claim,                                  // { id, match_id, status, handover_type, wants_reward, reward_status, reward_amount } | null
    rewardAmount: claim?.reward_amount ? Number(claim.reward_amount) : null,
    matchId: claim?.match_id || null,
    category: it.category,
    title: it.title,
    brand: it.brand || '',
    color: it.color || '',
    description: it.description || '',
    location: it.location || '',
    latitude: it.latitude ?? null,
    longitude: it.longitude ?? null,
    date: it.date || '',
    time: it.time || '',
    image: it.image || null,
    handoverMethod: (it.handover_type || 'DIRECT').toLowerCase(),
    handoverType: it.handover_type || 'DIRECT',
    handoverPlace: it.handover_place || '',
    handoverLat: it.handover_latitude ?? null,
    handoverLng: it.handover_longitude ?? null,
    wantsReward: !!it.wants_reward,
    created_at: it.created_at,
  };
}

// Build a JSON body or multipart FormData (when an image File is attached).
function buildItemBody(form, { found }) {
  const base = {
    title: form.title,
    category: form.category || 'Unknown',
    brand: form.brand || '',
    color: form.color || '',
    description: form.description || '',
    location: form.location,
    latitude: form.latitude ?? null,
    longitude: form.longitude ?? null,
    date: form.date || null,
    time: form.time || null,
  };
  // Feature 1 — route-based location (lost items only; found items always pin a point).
  if (!found) {
    const mode = form.locationType === 'ROUTE' ? 'ROUTE' : 'EXACT';
    base.location_type = mode;
    if (mode === 'ROUTE') {
      base.source_location = form.sourceLocation || '';
      base.source_latitude = form.sourceLat ?? null;
      base.source_longitude = form.sourceLng ?? null;
      base.dest_location = form.destLocation || '';
      base.dest_latitude = form.destLat ?? null;
      base.dest_longitude = form.destLng ?? null;
      // The item's own location field is required; store a readable route summary.
      base.location = (form.sourceLocation && form.destLocation)
        ? `${form.sourceLocation} → ${form.destLocation}`
        : (form.location || 'Route');
      base.latitude = null;
      base.longitude = null;
    }
  }
  if (found) {
    const handoverType = (form.handoverMethod === 'police'
      ? 'POLICE'
      : form.handoverMethod === 'admin'
      ? 'INSTITUTION'
      : 'DIRECT');
    base.handover_type = handoverType;
    base.wants_reward = !!form.wantsReward;
    // Drop-off location only matters for POLICE / INSTITUTION handovers.
    if (handoverType !== 'DIRECT') {
      base.handover_place = form.handoverPlace || '';
      base.handover_latitude = form.handoverLat ?? null;
      base.handover_longitude = form.handoverLng ?? null;
    }
  }

  const hasFile = form.image instanceof File;
  if (!hasFile) return { data: base, headers: undefined };

  const fd = new FormData();
  Object.entries(base).forEach(([k, v]) => {
    if (v !== null && v !== undefined) fd.append(k, v);
  });
  fd.append('image', form.image);
  return { data: fd, headers: { 'Content-Type': 'multipart/form-data' } };
}

// --- API calls --------------------------------------------------------------
export async function listMyReports() {
  const [lostRes, foundRes] = await Promise.all([
    api.get('/lost-items/mine/'),
    api.get('/found-items/mine/'),
  ]);
  const merged = [
    ...lostRes.data.map(normalizeLost),
    ...foundRes.data.map(normalizeFound),
  ];
  merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return merged;
}

export async function createReport(form) {
  const found = form.type === 'found';
  const url = found ? '/found-items/report/' : '/lost-items/report/';
  const { data, headers } = buildItemBody(form, { found });
  // The backend runs the AI matching engine automatically on creation
  // (both directions), so there is no separate run-match call here.
  const res = await api.post(url, data, headers ? { headers } : undefined);
  return res.data;
}

export async function updateReport(form) {
  const found = form.type === 'found';
  const url = found ? `/found-items/${form.pk}/` : `/lost-items/${form.pk}/`;
  const { data, headers } = buildItemBody(form, { found });
  const res = await api.patch(url, data, headers ? { headers } : undefined);
  return res.data;
}

export async function deleteReport(report) {
  const url = report.type === 'found'
    ? `/found-items/${report.pk}/`
    : `/lost-items/${report.pk}/`;
  await api.delete(url);
}
