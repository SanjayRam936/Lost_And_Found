import React from 'react';
import { ArrowLeft, Sparkles, MapPin, Lock, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const MatchDetail = () => {
  const {
    navigateTo, currentParams,
    currentMatch, matchLoading, claimError,
    loadMatchForLost, handleInitiateClaim, openOwnerHandover, handleDismissMatch, isLoading, openImage,
  } = useAppContext();

  const lostPk = currentParams?.lostPk;

  React.useEffect(() => {
    if (lostPk) loadMatchForLost(lostPk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lostPk]);

  const found = currentMatch?.found_item;
  const confidencePct = currentMatch ? Math.round(currentMatch.confidence_score * 100) : 0;
  // Found item details are revealed ONLY after the owner passes verification.
  const verified = !!currentMatch && (
    ['VERIFIED', 'PARTIAL'].includes(currentMatch.verification_status) || currentMatch.otp_generated
  );

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
          <div className="match-header-bar" onClick={() => navigateTo('my-reports')}><ArrowLeft size={18}/> Back to Reports</div>

          {matchLoading && <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-gray)' }}>Loading match…</div>}

          {!matchLoading && !currentMatch && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-gray)' }}>
              {claimError || 'No match available for this item yet.'}
            </div>
          )}

          {!matchLoading && currentMatch && (
            <div className="match-card">
               <div className="confidence-header">
                  <div className="confidence-circle">{confidencePct}<span style={{fontSize: '0.8rem'}}>%</span></div>
                  <div>
                     <div className="confidence-title">
                       {currentMatch.status === 'STRONG' ? 'High Confidence Match' : currentMatch.status === 'REVIEW' ? 'Possible Match' : 'Potential Match'}
                     </div>
                     <div className="confidence-subtitle"><Sparkles size={14}/> AI Verified</div>
                  </div>
               </div>

               {!verified ? (
                 /* ── VERIFY FIRST — found item details are hidden ── */
                 <>
                   <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                     <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                       <Lock size={26} />
                     </div>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Verify your ownership to view this item</h3>
                     <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                       To protect finders, the matched item's photo and details stay hidden until
                       you confirm ownership. You'll answer a few details about <b>your</b> item
                       from memory. You have <b>3 attempts</b>.
                     </p>
                   </div>
                   {claimError && <div className="error-text" style={{ marginBottom: '1rem' }}>{claimError}</div>}
                   <button className="btn-submit" disabled={isLoading} onClick={handleInitiateClaim}
                     style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                     <ShieldCheck size={18} /> Verify Ownership
                   </button>
                   <button className="btn-outline-reject" onClick={handleDismissMatch}>Not My Item</button>
                 </>
               ) : (
                 /* ── VERIFIED — reveal the found item and proceed ── */
                 <>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#047857', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                     <ShieldCheck size={16} /> Ownership verified
                   </div>
                   <div className="match-title">{found?.title}</div>
                   <div className="match-tags">
                      {found?.brand && <span className="match-tag tag-green">Brand: {found.brand}</span>}
                      {found?.color && <span className="match-tag tag-gray">Color: {found.color}</span>}
                      {found?.category && <span className="match-tag tag-gray">{found.category}</span>}
                   </div>
                   {found?.image && (
                     <div className="report-img-box" style={{ marginBottom: '1rem' }}>
                       <img src={found.image} alt={found.title} title="Click to view full image"
                         onClick={() => openImage(found.image)}
                         style={{ maxHeight: 200, borderRadius: 8, cursor: 'zoom-in' }} />
                     </div>
                   )}
                   <p style={{fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-gray)'}}>{found?.description}</p>
                   {found?.location && (
                     <p style={{fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-gray)'}}>
                       <MapPin size={12} style={{display:'inline', marginRight: 4}}/>{found.location}
                     </p>
                   )}
                   {claimError && <div className="error-text" style={{ marginBottom: '1rem' }}>{claimError}</div>}
                   <button className="btn-submit" disabled={isLoading} onClick={openOwnerHandover} style={{marginTop: 0, marginBottom: '1rem'}}>
                     {isLoading ? 'Opening…' : 'Continue to Handover'}
                   </button>
                   <button className="btn-outline-reject" onClick={handleDismissMatch}>Not My Item</button>
                 </>
               )}
            </div>
          )}
       </div>
    </div>
  );
};
