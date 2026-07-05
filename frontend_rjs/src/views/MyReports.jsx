import React from 'react';
import { Pencil, Trash2, MapPin, Sparkles, KeyRound } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getCategoryIcon, getStatusBadge } from '../utils/helpers';

export const MyReports = () => {
  const { activeFilter, setActiveFilter, filteredReports, reports, handleEditReport, handleDeleteReport, navigateTo, openFinderClaim, openOwnerReward, openFinderReward, openImage, fetchReports, openOwnerCollection } = useAppContext();

  // Refetch every time this screen opens so statuses (e.g. a handover the finder
  // completed on their own device) are always current — no stale "Review Match".
  React.useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayReports = filteredReports.filter(r => r.status !== 'rejected');
  // Lost items the AI matched (owner reviews) vs. found items the owner has
  // started a handover on (finder enters the OTP).
  const lostMatches = reports.filter(r => r.type === 'lost' && r.status === 'matched');
  const finderActions = reports.filter(r => r.type === 'found' && r.status === 'claim-initiated');

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
         <div className="reports-header">
           <h1>My Reports</h1>
           <p>Track the status of your items.</p>
         </div>

         {lostMatches.length > 0 && (
           <div
             onClick={() => navigateTo('match-detail', null, { lostPk: lostMatches[0].pk })}
             style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(90deg, #EEF2FF, #F5F3FF)', border: '1px solid #C7D2FE', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', cursor: 'pointer' }}
           >
             <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
               <Sparkles size={20} />
             </div>
             <div style={{ flex: 1 }}>
               <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                 {lostMatches.length === 1 ? 'You have an AI match!' : `You have ${lostMatches.length} AI matches!`}
               </div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                 {lostMatches.length === 1
                   ? `"${lostMatches[0].title}" has a possible match — tap to review.`
                   : 'Tap to review your matched items.'}
               </div>
             </div>
           </div>
         )}

         {finderActions.length > 0 && (
           <div
             onClick={() => openFinderClaim(finderActions[0])}
             style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(90deg, #FEF3C7, #FFFBEB)', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', cursor: 'pointer' }}
           >
             <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#D97706', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
               <KeyRound size={20} />
             </div>
             <div style={{ flex: 1 }}>
               <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Handover waiting — confirm with OTP</div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                 The owner of "{finderActions[0].title}" started a handover. Tap to enter their OTP.
               </div>
             </div>
           </div>
         )}

         <div className="filter-scroll">
            <button className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
            <button className={`filter-chip ${activeFilter === 'lost' ? 'active' : ''}`} onClick={() => setActiveFilter('lost')}>Lost Items</button>
            <button className={`filter-chip ${activeFilter === 'found' ? 'active' : ''}`} onClick={() => setActiveFilter('found')}>Found Items</button>
         </div>
         <div className="report-list">
            {displayReports.map(r => {
               // Whole-card action for actionable items.
               let cardAction = null;
               if (r.type === 'lost' && r.status === 'matched') cardAction = () => navigateTo('match-detail', null, { lostPk: r.pk });
               else if (r.type === 'lost' && r.status === 'reward-due') cardAction = () => openOwnerReward(r);
               else if (r.type === 'found' && r.status === 'claim-initiated') cardAction = () => openFinderClaim(r);
               else if (r.type === 'found' && (r.status === 'reward-received' || r.status === 'reward-pending')) cardAction = () => openFinderReward(r);

               return (
               <div className="report-card" key={r.id} onClick={cardAction || undefined} style={cardAction ? { cursor: 'pointer' } : undefined}>
                 <div className="report-card-header">
                   <div className="report-category">{getCategoryIcon(r.category)} {r.category}</div>
                   <div className="report-actions">
                     <button onClick={(e) => { e.stopPropagation(); handleEditReport(r); }}><Pencil size={16} /></button>
                     <button onClick={(e) => { e.stopPropagation(); handleDeleteReport(r); }}><Trash2 size={16} /></button>
                   </div>
                 </div>
                 <div className="report-body">
                   {r.image && (
                     <div className="report-img-box">
                       <img src={r.image} alt={r.title} title="Click to view full image"
                         onClick={(e) => { e.stopPropagation(); openImage(r.image); }}
                         style={{ cursor: 'zoom-in' }} />
                     </div>
                   )}
                   <div className="report-info">
                     <div className="report-title">{r.title}</div>
                     <div className="report-meta"><MapPin size={12} style={{display:'inline', marginRight: 4}}/>{r.location}</div>
                     <div className="report-type-tag" style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{r.type} report</div>
                     <div>{getStatusBadge(r.status)}</div>
                   </div>
                 </div>

                 {/* Lost owner: review the AI match */}
                 {r.type === 'lost' && r.status === 'matched' && (
                    <button className="btn-card-action btn-purple-solid" onClick={(e) => { e.stopPropagation(); navigateTo('match-detail', null, { lostPk: r.pk }); }}>Review Match</button>
                 )}

                 {/* Lost owner: handover done, finder opted in for a reward -> pay it */}
                 {r.type === 'lost' && r.status === 'reward-due' && (
                    <button className="btn-card-action btn-purple-solid" onClick={(e) => { e.stopPropagation(); openOwnerReward(r); }}>Pay Reward</button>
                 )}

                 {/* Lost owner: item dropped at a police station / institution -> re-view the collection point anytime */}
                 {r.type === 'lost' && r.claim?.status === 'HANDED_OVER' && (
                    <button className="btn-card-action btn-green-solid" onClick={(e) => { e.stopPropagation(); openOwnerCollection(r); }}>View Collection Point</button>
                 )}

                 {/* Finder: owner started a handover -> enter the OTP for this item */}
                 {r.type === 'found' && r.status === 'claim-initiated' && (
                    <button className="btn-card-action btn-purple-solid" onClick={(e) => { e.stopPropagation(); openFinderClaim(r); }}>Enter Handover OTP</button>
                 )}

                 {/* Finder: matched but the owner hasn't started a handover yet */}
                 {r.type === 'found' && r.status === 'matched' && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', padding: '0.5rem 0 0' }}>
                      Matched — waiting for the owner to start the handover.
                    </div>
                 )}

                 {/* Finder: reward received -> show the amount */}
                 {r.type === 'found' && r.status === 'reward-received' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0 0', fontWeight: 700, color: '#047857' }}>
                      <span>Reward received</span>
                      <span>₹{(r.rewardAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                 )}

                 {/* Finder: handover done, waiting for the owner to pay the reward */}
                 {r.type === 'found' && r.status === 'reward-pending' && (
                    <div style={{ fontSize: '0.8rem', color: '#B45309', padding: '0.5rem 0 0' }}>
                      Handover complete — awaiting reward from the owner.
                    </div>
                 )}
               </div>
            );})}
            {displayReports.length === 0 && (
               <div style={{textAlign: 'center', padding: '3rem 0', color: 'var(--text-gray)'}}>No reports found.</div>
            )}
         </div>
       </div>
    </div>
  );
};
