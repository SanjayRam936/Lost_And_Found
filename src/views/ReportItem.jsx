import React from 'react';
import { ImagePlus, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CustomSelect } from '../components/CustomSelect';
import { MapPicker } from '../components/MapPicker';
import { CATEGORY_OPTIONS } from '../utils/helpers';

export const ReportItem = () => {
  const { reportForm, setReportForm, handleReportSubmit, reportError, isLoading, navigateTo } = useAppContext();
  const fileRef = React.useRef(null);

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
         <div className="report-header">
           <h1>{reportForm.id ? 'Edit Report' : `Report ${reportForm.type === 'lost' ? 'Lost' : 'Found'} Item`}</h1>
           <p>Provide details to help our AI match it.</p>
         </div>
         <form className="report-form" onSubmit={handleReportSubmit}>
             <div className="type-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <div 
                   onClick={() => setReportForm({...reportForm, type: 'lost'})}
                   style={{ flex: 1, padding: '1rem', textAlign: 'center', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', backgroundColor: reportForm.type === 'lost' ? 'var(--primary-light)' : 'white', borderColor: reportForm.type === 'lost' ? 'var(--primary)' : 'var(--border-light)' }}
                >
                   <span style={{ fontWeight: '600', color: reportForm.type === 'lost' ? 'var(--primary)' : 'var(--text-gray)' }}>Lost an Item</span>
                </div>
                <div 
                   onClick={() => setReportForm({...reportForm, type: 'found'})}
                   style={{ flex: 1, padding: '1rem', textAlign: 'center', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', backgroundColor: reportForm.type === 'found' ? 'var(--primary-light)' : 'white', borderColor: reportForm.type === 'found' ? 'var(--primary)' : 'var(--border-light)' }}
                >
                   <span style={{ fontWeight: '600', color: reportForm.type === 'found' ? 'var(--primary)' : 'var(--text-gray)' }}>Found an Item</span>
                </div>
             </div>
             <div className="form-group">
               <label className="form-label">Item Title</label>
               <input type="text" className="form-input" placeholder="e.g. Black Wallet" required value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} />
            </div>
             <div className="form-group">
               <label className="form-label">Category</label>
               <CustomSelect
                 value={reportForm.category}
                 onChange={(val) => setReportForm({...reportForm, category: val})}
                 options={CATEGORY_OPTIONS}
                 placeholder="Select Category..."
               />
            </div>
            <div className="form-group">
               <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <MapPin size={16} color="var(--primary)" /> Location
               </label>
               <MapPicker
                 value={{ place: reportForm.location, lat: reportForm.latitude, lng: reportForm.longitude }}
                 placeholder="Search where it was lost / found…"
                 fallbackPlaceholder="Where was it?"
                 onChange={(v) => setReportForm({
                   ...reportForm,
                   location: v.place || (v.lat != null ? `${v.lat.toFixed(5)}, ${v.lng.toFixed(5)}` : ''),
                   latitude: v.lat,
                   longitude: v.lng,
                 })}
               />
            </div>
            <div className="date-time-row">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Date {reportForm.type === 'lost' ? <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}>(Optional)</span> : ''}</label>
                 <input 
                   type="date" 
                   className="form-input date-time-input" 
                   required={reportForm.type === 'found'} 
                   value={reportForm.date || ''} 
                   onChange={e => setReportForm({...reportForm, date: e.target.value})} 
                 />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Time {reportForm.type === 'lost' ? <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}>(Optional)</span> : ''}</label>
                 <input 
                   type="time" 
                   className="form-input date-time-input" 
                   required={reportForm.type === 'found'} 
                   value={reportForm.time || ''} 
                   onChange={e => setReportForm({...reportForm, time: e.target.value})} 
                 />
              </div>
            </div>
            <div className="form-group">
               <label className="form-label">Photo {reportForm.type === 'lost' ? '(Optional)' : '(Recommended)'}</label>
               <input
                 type="file"
                 accept="image/*"
                 ref={fileRef}
                 style={{ display: 'none' }}
                 onChange={e => setReportForm({ ...reportForm, image: e.target.files[0] || null })}
               />
               <div className="upload-area" style={{ cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
                 {reportForm.image instanceof File ? (
                   <>
                     <img src={URL.createObjectURL(reportForm.image)} alt="preview" style={{ maxHeight: 120, borderRadius: 8, marginBottom: 8 }} />
                     <div className="upload-subtitle">{reportForm.image.name} — click to change</div>
                   </>
                 ) : (
                   <>
                     <ImagePlus size={32} color="var(--primary)" />
                     <div className="upload-title">Click to upload</div>
                     <div className="upload-subtitle">JPG, PNG up to 5MB</div>
                   </>
                 )}
               </div>
            </div>
            <div className="form-group">
               <label htmlFor="item-description" className="form-label">Description</label>
               <textarea 
                  id="item-description"
                  className="form-textarea"
                  placeholder="Describe your item in detail (brand, color, size, identifying marks, serial number, contents, where and when it was lost, reward information if any, etc.)"
                  value={reportForm.description || ''}
                  onChange={e => {
                      const val = e.target.value;
                      if (val.length <= 5000) {
                          setReportForm({...reportForm, description: val});
                      }
                  }}
                  onBlur={e => setReportForm({...reportForm, description: e.target.value.trim()})}
                  maxLength={5000}
                  aria-label="Item description"
               />
               <div className="textarea-footer">
                   <p className="helper-text">
                       You can provide detailed information to help others identify your item more accurately. Include unique features, brand, color, serial number, location, date/time, or any other identifying details.
                   </p>
                   <span className="char-counter">
                       {(reportForm.description || '').length} / 5000
                   </span>
               </div>
            </div>
            {reportForm.type === 'found' && (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Handover Method</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: `2px solid ${reportForm.handoverMethod === 'direct' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: reportForm.handoverMethod === 'direct' ? 'var(--primary-light)' : 'white' }}>
                       <input type="radio" name="handover" value="direct" checked={reportForm.handoverMethod === 'direct'} onChange={() => setReportForm({...reportForm, handoverMethod: 'direct'})} style={{ marginTop: '4px' }} />
                       <div>
                         <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Direct Meetup</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Meet securely in a public place.</div>
                       </div>
                     </label>
                     <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: `2px solid ${reportForm.handoverMethod === 'police' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: reportForm.handoverMethod === 'police' ? 'var(--primary-light)' : 'white' }}>
                       <input type="radio" name="handover" value="police" checked={reportForm.handoverMethod === 'police'} onChange={() => setReportForm({...reportForm, handoverMethod: 'police'})} style={{ marginTop: '4px' }} />
                       <div>
                         <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Police Station</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>For high-value items.</div>
                       </div>
                     </label>
                     <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: `2px solid ${reportForm.handoverMethod === 'admin' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: reportForm.handoverMethod === 'admin' ? 'var(--primary-light)' : 'white' }}>
                       <input type="radio" name="handover" value="admin" checked={reportForm.handoverMethod === 'admin'} onChange={() => setReportForm({...reportForm, handoverMethod: 'admin'})} style={{ marginTop: '4px' }} />
                       <div>
                         <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Institution / Admin Desk</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Drop-off at the main office.</div>
                       </div>
                     </label>
                  </div>
                </div>

                {/* Drop-off location for Police / Institution handovers */}
                {(reportForm.handoverMethod === 'police' || reportForm.handoverMethod === 'admin') && (
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={16} color="var(--primary)" /> Handover Location
                    </label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '0.75rem' }}>
                      Mark where you dropped off the item so the owner knows exactly where to collect it.
                    </p>
                    <MapPicker
                      value={{ place: reportForm.handoverPlace, lat: reportForm.handoverLat, lng: reportForm.handoverLng }}
                      onChange={(v) => setReportForm({ ...reportForm, handoverPlace: v.place, handoverLat: v.lat, handoverLng: v.lng })}
                    />
                  </div>
                )}

                <div className="form-group" style={{ backgroundColor: 'var(--bg-alt)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                   <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Reward Preference</label>
                   <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Would you like to be offered a reward if the owner chooses to give one?</p>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                     <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.75rem', border: `2px solid ${reportForm.wantsReward ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: reportForm.wantsReward ? 'var(--primary-light)' : 'white', fontWeight: '600', color: reportForm.wantsReward ? 'var(--primary)' : 'var(--text-gray)' }}>
                       <input type="radio" name="reward" value="yes" checked={reportForm.wantsReward} onChange={() => setReportForm({...reportForm, wantsReward: true})} style={{ display: 'none' }} />
                       Yes, Opt-In
                     </label>
                     <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.75rem', border: `2px solid ${!reportForm.wantsReward ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: !reportForm.wantsReward ? 'var(--primary-light)' : 'white', fontWeight: '600', color: !reportForm.wantsReward ? 'var(--primary)' : 'var(--text-gray)' }}>
                       <input type="radio" name="reward" value="no" checked={!reportForm.wantsReward} onChange={() => setReportForm({...reportForm, wantsReward: false})} style={{ display: 'none' }} />
                       No, Thank You
                     </label>
                   </div>
                </div>
              </>
            )}
            {reportError && <div className="error-text" style={{ marginBottom: '1rem' }}>{reportError}</div>}
            <button type="submit" className="btn-submit" disabled={isLoading}>{isLoading ? 'Submitting…' : 'Submit Report'}</button>
            <button type="button" className="btn-cancel" onClick={() => navigateTo('dashboard')}>Cancel</button>
         </form>
       </div>
    </div>
  );
};
