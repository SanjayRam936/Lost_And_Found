import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Package, Sparkles, ShieldCheck, LogOut, RefreshCw, Search, PlusCircle, Layers, TrendingUp, CheckCircle2, Gift } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ShieldLogo } from '../components/ShieldLogo';
import * as adminApi from '../api/admin';

const NAV = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'reports', label: 'Reports', icon: Package },
  { key: 'matches', label: 'Matches', icon: Sparkles },
  { key: 'claims', label: 'Claims', icon: ShieldCheck },
];

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString() : '—');

const Badge = ({ text, tone = 'gray' }) => {
  const tones = {
    gray: { bg: '#F1F5F9', c: '#475569' },
    green: { bg: '#D1FAE5', c: '#047857' },
    orange: { bg: '#FEF3C7', c: '#B45309' },
    purple: { bg: '#EDE9FE', c: '#7C3AED' },
    blue: { bg: '#DBEAFE', c: '#1D4ED8' },
  };
  const t = tones[tone] || tones.gray;
  return <span style={{ background: t.bg, color: t.c, padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>{text}</span>;
};

const statusTone = (s) => ({ STRONG: 'green', REVIEW: 'purple', RESOLVED: 'green', MATCHED: 'orange', INITIATED: 'blue', PENDING: 'gray', HANDED_OVER: 'blue', DISMISSED: 'gray', ACTIVE: 'blue' }[s] || 'gray');

const Table = ({ columns, rows, empty }) => (
  <div className="admin-tbl-wrap">
    <table className="admin-tbl">
      <thead>
        <tr>
          {columns.map((c) => <th key={c.key}>{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr><td className="admin-tbl-empty" colSpan={columns.length}>{empty || 'No data.'}</td></tr>
        )}
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? '—')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Theme-aligned tints for the overview stat cards.
const STAT_TONES = {
  green: { bg: 'var(--primary-light)', fg: 'var(--primary-hover)' },
  violet: { bg: 'var(--purple-light)', fg: 'var(--purple)' },
  amber: { bg: '#FEF3C7', fg: '#B45309' },
  dark: { bg: '#E5E7EB', fg: '#0A0A0A' },
};

// Solid colour per status tone — used for each card's left severity stripe.
const TONE_HEX = { gray: '#64748B', green: '#0F7A38', orange: '#B45309', purple: '#5B21E8', blue: '#1D66C9' };

// Deterministic avatar colour + initials for the Recent Users panel.
const AVATAR_COLORS = ['#17A94C', '#5B21E8', '#B45309', '#1D66C9', '#DC2626', '#0F766E'];
const avatarColor = (seed) => AVATAR_COLORS[Math.abs(Number(seed) || 0) % AVATAR_COLORS.length];
const initials = (u) => (u.full_name || u.email || '?').trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

// A compact, colour-coded item card for the overview columns.
const MiniCard = ({ prefix = '', id, title, status, meta, foot }) => {
  const tone = statusTone(status);
  return (
    <div className="admin-icard" style={{ '--st': TONE_HEX[tone] || '#94A3B8' }}>
      <div className="admin-icard-top">
        <span className="admin-icard-id">{prefix}{id}</span>
        <Badge text={status || '—'} tone={tone} />
      </div>
      <div className="admin-icard-title">{title || 'Untitled'}</div>
      <div className="admin-icard-meta">{meta}</div>
      {foot}
    </div>
  );
};

export const AdminDashboard = () => {
  const { handleLogout } = useAppContext();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState({ lost_items: [], found_items: [] });
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);

  const load = async (which) => {
    setLoading(true);
    setError('');
    try {
      if (which === 'overview') {
        // The overview shows live cards, so pull the supporting lists too.
        const [s, it, mt, us] = await Promise.all([
          adminApi.getStats(), adminApi.getItems(), adminApi.getMatches(), adminApi.getUsers(),
        ]);
        setStats(s); setItems(it); setMatches(mt); setUsers(us);
      }
      else if (which === 'users') setUsers(await adminApi.getUsers());
      else if (which === 'reports') setItems(await adminApi.getItems());
      else if (which === 'matches') setMatches(await adminApi.getMatches());
      else if (which === 'claims') setClaims(await adminApi.getClaims());
    } catch (e) {
      setError(e?.response?.status === 403 ? 'Admin access required (staff account).' : 'Could not load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab); /* eslint-disable-next-line */ }, [tab]);

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <ShieldLogo color="#34D06A" /> <span className="admin-portal-title">Admin Portal</span>
        </div>
        <div className="admin-nav">
          <div className="admin-nav-label">Menu</div>
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} className={`admin-nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              <Icon size={18} /> {label}
            </button>
          ))}
          <button className="admin-nav-item admin-exit" onClick={handleLogout}><LogOut size={18} /> Exit Admin</button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-topbar">
          <h3 style={{ textTransform: 'capitalize' }}>{tab}</h3>
          <button className="admin-refresh-btn" onClick={() => load(tab)} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        <div className="admin-main-area">
          {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}

          {tab === 'overview' && (
            <>
              <div className="admin-section-title"><LayoutDashboard size={16} color="var(--primary)" /> Platform Overview</div>
              <div className="admin-stats-row">
                {[
                  ['Total Users', stats?.users, Users, 'dark'],
                  ['Active Reports', stats?.active_reports, Layers, 'green'],
                  ['Lost Items', stats?.lost_items, Search, 'dark'],
                  ['Found Items', stats?.found_items, PlusCircle, 'green'],
                  ['AI Matches', stats?.total_matches, Sparkles, 'violet'],
                  ['Strong / Review', stats?.strong_matches, TrendingUp, 'violet'],
                  ['Claims', stats?.claims, ShieldCheck, 'amber'],
                  ['Resolved Claims', stats?.resolved_claims, CheckCircle2, 'green'],
                  ['Rewards Paid', stats?.rewards_paid, Gift, 'green'],
                ].map(([label, val, Icon, tone]) => {
                  const t = STAT_TONES[tone];
                  return (
                    <div className="admin-stat-card" key={label}>
                      <span className="admin-stat-icon" style={{ background: t.bg, color: t.fg }}><Icon size={18} /></span>
                      <div className="admin-stat-value">{val ?? (loading ? '…' : 0)}</div>
                      <div className="admin-stat-label">{label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Colourful card-column board: recent lost / found / matches */}
              <div className="admin-section-title" style={{ marginTop: '0.5rem' }}><LayoutDashboard size={16} color="var(--primary)" /> Recent Activity</div>
              <div className="admin-board">
                <div className="admin-col2">
                  <div className="admin-col2-head">
                    <span className="c-ic" style={{ background: '#FEE2E2', color: '#DC2626' }}><Search size={16} /></span>
                    <h4>Recent Lost Reports</h4>
                    <span className="c-count">{items.lost_items.length}</span>
                  </div>
                  <div className="admin-col2-body">
                    {items.lost_items.slice(0, 6).map((r) => (
                      <MiniCard key={r.id} prefix="LST-" id={r.id} title={r.title} status={r.status}
                        meta={<>{r.category} · {r.location || '—'} · by <b>{r.user}</b></>} />
                    ))}
                    {items.lost_items.length === 0 && <div className="admin-tbl-empty">No lost reports yet.</div>}
                  </div>
                </div>

                <div className="admin-col2">
                  <div className="admin-col2-head">
                    <span className="c-ic" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><PlusCircle size={16} /></span>
                    <h4>Recent Found Reports</h4>
                    <span className="c-count">{items.found_items.length}</span>
                  </div>
                  <div className="admin-col2-body">
                    {items.found_items.slice(0, 6).map((r) => (
                      <MiniCard key={r.id} prefix="FND-" id={r.id} title={r.title} status={r.status}
                        meta={<>{r.category} · {r.location || '—'} · by <b>{r.user}</b></>} />
                    ))}
                    {items.found_items.length === 0 && <div className="admin-tbl-empty">No found reports yet.</div>}
                  </div>
                </div>

                <div className="admin-col2">
                  <div className="admin-col2-head">
                    <span className="c-ic" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}><Sparkles size={16} /></span>
                    <h4>AI Matches</h4>
                    <span className="c-count">{matches.length}</span>
                  </div>
                  <div className="admin-col2-body">
                    {matches.slice(0, 6).map((m) => (
                      <MiniCard key={m.id} prefix="MTC-" id={m.id} title={m.lost_item} status={m.status}
                        meta={<>matched with <b>{m.found_item}</b></>}
                        foot={<div className="admin-icard-foot"><span className="admin-conf">{Math.round((m.confidence_score || 0) * 100)}% confidence</span></div>} />
                    ))}
                    {matches.length === 0 && <div className="admin-tbl-empty">No matches yet.</div>}
                  </div>
                </div>
              </div>

              {/* Recent users */}
              <div className="admin-section-title" style={{ marginTop: '1.5rem' }}><Users size={16} color="var(--primary)" /> Recent Users</div>
              <div className="admin-col2">
                <div className="admin-users-grid">
                  {[...users].slice(-8).reverse().map((u) => (
                    <div className="admin-user" key={u.id}>
                      <span className="admin-user-av" style={{ background: avatarColor(u.id) }}>{initials(u)}</span>
                      <div className="admin-user-info">
                        <div className="admin-user-name">{u.full_name || 'Unnamed user'}</div>
                        <div className="admin-user-email">{u.email}</div>
                        <div className="admin-user-stats">{u.lost_count ?? 0} lost · {u.found_count ?? 0} found</div>
                      </div>
                      {u.is_staff && <Badge text="Staff" tone="purple" />}
                    </div>
                  ))}
                  {users.length === 0 && <div className="admin-tbl-empty">No users yet.</div>}
                </div>
              </div>
            </>
          )}

          {tab === 'users' && (
            <Table
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'email', label: 'Email' },
                { key: 'full_name', label: 'Name' },
                { key: 'role', label: 'Role', render: (u) => <Badge text={u.is_staff ? 'Staff' : 'User'} tone={u.is_staff ? 'purple' : 'gray'} /> },
                { key: 'lost_count', label: 'Lost' },
                { key: 'found_count', label: 'Found' },
                { key: 'date_joined', label: 'Joined', render: (u) => fmtDate(u.date_joined) },
              ]}
              rows={users}
            />
          )}

          {tab === 'reports' && (
            <>
              <div className="admin-section-title"><Search size={16} color="var(--primary)" /> Lost Items ({items.lost_items.length})</div>
              <Table
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'title', label: 'Title' },
                  { key: 'category', label: 'Category' },
                  { key: 'location', label: 'Location' },
                  { key: 'status', label: 'Status', render: (r) => <Badge text={r.status} tone={statusTone(r.status)} /> },
                  { key: 'user', label: 'User' },
                ]}
                rows={items.lost_items}
              />
              <div className="admin-section-title" style={{ marginTop: '1.5rem' }}><PlusCircle size={16} color="var(--primary)" /> Found Items ({items.found_items.length})</div>
              <Table
                columns={[
                  { key: 'id', label: 'ID' },
                  { key: 'title', label: 'Title' },
                  { key: 'category', label: 'Category' },
                  { key: 'location', label: 'Location' },
                  { key: 'handover_type', label: 'Handover', render: (r) => <Badge text={r.handover_type} tone="blue" /> },
                  { key: 'wants_reward', label: 'Reward', render: (r) => (r.wants_reward ? 'Yes' : 'No') },
                  { key: 'user', label: 'User' },
                ]}
                rows={items.found_items}
              />
            </>
          )}

          {tab === 'matches' && (
            <Table
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'lost_item', label: 'Lost' },
                { key: 'found_item', label: 'Found' },
                { key: 'confidence_score', label: 'Confidence', render: (m) => `${Math.round(m.confidence_score * 100)}%` },
                { key: 'text_score', label: 'Text', render: (m) => m.text_score },
                { key: 'image_similarity', label: 'Image', render: (m) => m.image_similarity },
                { key: 'status', label: 'Status', render: (m) => <Badge text={m.status} tone={statusTone(m.status)} /> },
              ]}
              rows={matches}
              empty="No matches yet."
            />
          )}

          {tab === 'claims' && (
            <Table
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'item', label: 'Item' },
                { key: 'owner', label: 'Owner' },
                { key: 'finder', label: 'Finder' },
                { key: 'handover_type', label: 'Handover', render: (c) => <Badge text={c.handover_type} tone="blue" /> },
                { key: 'otp_verified', label: 'OTP', render: (c) => (c.otp_verified ? 'Verified' : '—') },
                { key: 'status', label: 'Status', render: (c) => <Badge text={c.status} tone={statusTone(c.status)} /> },
              ]}
              rows={claims}
              empty="No claims yet."
            />
          )}
        </div>
      </div>
    </div>
  );
};
