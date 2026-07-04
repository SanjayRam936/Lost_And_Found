import React from 'react';
import { ArrowLeft, Sparkles, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const MatchDetail = () => {
  const {
    navigateTo, currentParams,
    currentMatch, matchLoading, claimError,
    loadMatchForLost, handleInitiateClaim, handleDismissMatch, isLoading, openImage,
  } = useAppContext();

  const lostPk = currentParams?.lostPk;

  React.useEffect(() => {
    if (lostPk) loadMatchForLost(lostPk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lostPk]);

  const found = currentMatch?.found_item;
  const confidencePct = currentMatch ? Math.round(currentMatch.confidence_score * 100) : 0;

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
               <button className="btn-submit" disabled={isLoading} onClick={handleInitiateClaim} style={{marginTop: 0, marginBottom: '1rem'}}>
                 {isLoading ? 'Starting…' : currentMatch.has_claim ? 'Continue Claim' : 'Initiate My Item'}
               </button>
               <button className="btn-outline-reject" onClick={handleDismissMatch}>Not My Item</button>
            </div>
          )}
       </div>
    </div>
  );
};
