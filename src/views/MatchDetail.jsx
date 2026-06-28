import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const MatchDetail = () => {
  const { navigateTo, currentParams, handleRejectMatch } = useAppContext();
  const matchId = currentParams?.matchId || 1;

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
          <div className="match-header-bar" onClick={() => navigateTo('my-reports')}><ArrowLeft size={18}/> Back to Reports</div>
          <div className="match-card">
             <div className="confidence-header">
                <div className="confidence-circle">98<span style={{fontSize: '0.8rem'}}>%</span></div>
                <div>
                   <div className="confidence-title">High Confidence Match</div>
                   <div className="confidence-subtitle"><Sparkles size={14}/> AI Verified</div>
                </div>
             </div>
             <div className="match-title">Black Leather Wallet</div>
             <div className="match-tags">
                <span className="match-tag tag-green">Brand: Bellroy</span>
                <span className="match-tag tag-gray">Color: Black</span>
             </div>
             <p style={{fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-gray)'}}>We found an item matching your description reported 2 hours after your report.</p>
             <button className="btn-submit" onClick={() => navigateTo('claim-otp-owner')} style={{marginTop: 0, marginBottom: '1rem'}}>Initiate My Item</button>
             <button className="btn-outline-reject" onClick={() => handleRejectMatch(matchId)}>Not My Item</button>
          </div>
       </div>
    </div>
  );
};
