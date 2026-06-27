import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, MapPin, CheckCircle, ArrowRight, UserCheck, KeySquare, CheckSquare, IndianRupee, MessageSquare, Phone } from 'lucide-react';

export const ClaimFlow = () => {
  const { navigateTo, currentParams, setClaimStep: setGlobalClaimStep, confirmItemReceived } = useAppContext();
  const [step, setStep] = useState(1);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [otp, setOtp] = useState('');
  const [handoverMethod, setHandoverMethod] = useState('direct');

  const handleNext = () => {
    if (step === 4) {
      navigateTo('rewards');
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ paddingBottom: '6rem' }}>
      <div className="dashboard-container">
        
        {/* Stepper Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
           <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', backgroundColor: 'var(--border-light)', zIndex: 0 }}></div>
           <div style={{ position: 'absolute', top: '15px', left: '0', width: `${((step - 1) / 3) * 100}%`, height: '2px', backgroundColor: 'var(--primary)', zIndex: 1, transition: 'width 0.3s' }}></div>
           
           {[1, 2, 3, 4].map(num => (
             <div key={num} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: step >= num ? 'var(--primary)' : 'white', border: `2px solid ${step >= num ? 'var(--primary)' : 'var(--border-light)'}`, color: step >= num ? 'white' : 'var(--text-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s' }}>
                 {step > num ? <CheckCircle size={16} /> : num}
               </div>
               <span style={{ fontSize: '0.65rem', marginTop: '4px', color: step >= num ? 'var(--primary)' : 'var(--text-gray)', fontWeight: step >= num ? '700' : '500' }}>
                 {num === 1 ? 'Verify' : num === 2 ? 'OTP' : num === 3 ? 'Handover' : 'Confirm'}
               </span>
             </div>
           ))}
        </div>

        <div className="white-card" style={{ padding: '2rem 1.5rem' }}>
          
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <KeySquare size={24} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Ownership Verification</h2>
              </div>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>The finder provided a hidden detail. Answer correctly to verify ownership.</p>
              
              <div style={{ backgroundColor: 'var(--bg-light)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Question from Finder:</p>
                <p style={{ fontStyle: 'italic', color: 'var(--text-gray)' }}>"What is the color of the inner lining of the wallet?"</p>
              </div>

              <div className="form-group">
                <label className="form-label">Your Answer</label>
                <input type="text" className="form-input" value={secretAnswer} onChange={(e) => setSecretAnswer(e.target.value)} placeholder="e.g. Red, Blue, etc." />
              </div>

              <button className="btn-submit" onClick={handleNext} disabled={!secretAnswer.trim()} style={{ marginTop: '1rem' }}>Verify Answer <ArrowRight size={16} style={{display:'inline', verticalAlign:'middle', marginLeft: '4px'}} /></button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <UserCheck size={24} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Contact Verification</h2>
              </div>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Enter the 6-digit OTP sent to your registered phone number.</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                {[1, 2, 3, 4, 5, 6].map((num, idx) => (
                  <input key={num} type="text" maxLength={1} style={{ width: '40px', height: '48px', fontSize: '1.5rem', textAlign: 'center', border: '1px solid var(--border-light)', borderRadius: '8px', outline: 'none' }} onChange={(e) => {
                     if(e.target.value && idx < 5) e.target.nextSibling.focus();
                     setOtp(prev => prev + e.target.value);
                  }} />
                ))}
              </div>

              <button className="btn-submit" onClick={handleNext}>Verify OTP <ArrowRight size={16} style={{display:'inline', verticalAlign:'middle', marginLeft: '4px'}} /></button>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <MapPin size={24} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Handover Process</h2>
              </div>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>How would you like to receive your item?</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                 <div 
                   onClick={() => setHandoverMethod('direct')}
                   style={{ 
                     display: 'flex', 
                     flexDirection: 'column', 
                     padding: '1rem', 
                     border: `2px solid ${handoverMethod === 'direct' ? 'var(--primary)' : 'var(--border-light)'}`, 
                     borderRadius: '12px', 
                     cursor: 'pointer', 
                     backgroundColor: handoverMethod === 'direct' ? 'var(--primary-light)' : 'white',
                     transition: 'all 0.3s ease'
                   }}
                 >
                   <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                     <input type="radio" name="handover" value="direct" checked={handoverMethod === 'direct'} onChange={() => setHandoverMethod('direct')} style={{ marginTop: '4px' }} onClick={(e) => e.stopPropagation()} />
                     <div>
                       <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Direct Meetup</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Meet securely in a public place.</div>
                     </div>
                   </div>
                   
                   <div className={`meetup-accordion ${handoverMethod === 'direct' ? 'expanded' : ''}`}>
                     <div className="meetup-actions">
                       <button 
                         className="btn-meetup-action" 
                         onClick={(e) => { e.stopPropagation(); navigateTo('chat'); }}
                       >
                         <MessageSquare size={18} />
                         Message
                       </button>
                       <button 
                         className="btn-meetup-action" 
                         onClick={(e) => { e.stopPropagation(); window.location.href = 'tel:+1234567890'; }}
                       >
                         <Phone size={18} />
                         Call
                       </button>
                     </div>
                   </div>
                 </div>

                 <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: `2px solid ${handoverMethod === 'admin' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: handoverMethod === 'admin' ? 'var(--primary-light)' : 'white' }}>
                   <input type="radio" name="handover" value="admin" checked={handoverMethod === 'admin'} onChange={() => setHandoverMethod('admin')} style={{ marginTop: '4px' }} />
                   <div>
                     <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>College Admin Desk</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Drop-off and pick-up at the main office.</div>
                   </div>
                 </label>

                 <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: `2px solid ${handoverMethod === 'police' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: handoverMethod === 'police' ? 'var(--primary-light)' : 'white' }}>
                   <input type="radio" name="handover" value="police" checked={handoverMethod === 'police'} onChange={() => setHandoverMethod('police')} style={{ marginTop: '4px' }} />
                   <div>
                     <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Police Station</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>For high-value items like passports or jewelry.</div>
                   </div>
                 </label>
              </div>

              <button className="btn-submit" onClick={handleNext}>Schedule Handover <ArrowRight size={16} style={{display:'inline', verticalAlign:'middle', marginLeft: '4px'}} /></button>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <CheckSquare size={24} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Owner Confirmation</h2>
              </div>
              
              <div style={{ textAlign: 'center', padding: '2rem 0', marginBottom: '1rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                   <ShieldCheck size={40} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Did you receive your item?</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Please confirm if you have successfully received your item from the finder.</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button className="btn-submit" onClick={confirmItemReceived} style={{ flex: 1, backgroundColor: '#10B981', margin: 0 }}>Yes, Received</button>
                 <button className="btn-outline-reject" style={{ flex: 1, margin: 0 }}>No, Report Issue</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
