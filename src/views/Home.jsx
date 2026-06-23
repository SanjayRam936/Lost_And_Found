import React from 'react';
import { Sparkles, Search, PlusCircle, ImagePlus, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Home = () => {
  const { navigateTo } = useAppContext();

  return (
    <div className="section-container">
      <div className="hero-section">
         <div className="hero-badge"><Sparkles size={14} className="text-green" /> AI-Powered Matching</div>
         <h1 className="hero-title">Find what's lost, <br/><span className="text-green">return what's found.</span></h1>
         <p className="hero-desc">The smartest campus lost and found platform. We use AI to match items instantly.</p>
         <div className="hero-buttons">
           <button className="btn-primary" onClick={() => navigateTo('register', null, { regType: 'lost' })}><Search size={18}/> I Lost Something</button>
           <button className="btn-secondary" onClick={() => navigateTo('register', null, { regType: 'found' })}><PlusCircle size={18}/> I Found Something</button>
         </div>
      </div>

      <div className="features-row">
        <div className="feature-item">
          <div className="feature-icon-wrapper icon-green"><ImagePlus size={20} /></div>
          <div className="feature-title">Smart Image AI</div>
          <div className="feature-desc">Upload a photo, we auto-tag and match it.</div>
        </div>
        <div className="feature-item">
          <div className="feature-icon-wrapper icon-purple"><ShieldCheck size={20} /></div>
          <div className="feature-title">Vivar Adar Protocol</div>
          <div className="feature-desc">Secure verification before handovers.</div>
        </div>
      </div>
    </div>
  );
};
