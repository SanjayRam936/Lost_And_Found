import React from 'react';
import { ImagePlus, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CustomSelect } from '../components/CustomSelect';
import { MapPicker } from '../components/MapPicker';
import { RouteLocationInput } from '../components/RouteLocationInput';
import { CATEGORY_OPTIONS, COLOR_OPTIONS } from '../utils/helpers';

export const ReportItem = () => {
  const { reportForm, setReportForm, handleReportSubmit, reportError, isLoading, navigateTo } = useAppContext();
  const fileRef = React.useRef(null);
  const [errors, setErrors] = React.useState({});

  const isEditing = !!reportForm.pk;
  const isFound = reportForm.type === 'found';

  // Merge a patch into the latest form state (functional updater avoids stale
  // closures — important for async sources like the map / current location) and
  // clear that field's validation error as the user fixes it.
  const update = (patch, clearField) => {
    setReportForm((prev) => ({ ...prev, ...patch }));
    if (clearField) {
      setErrors((prev) => {
        if (!prev[clearField]) return prev;
        const next = { ...prev };
        delete next[clearField];
        return next;
      });
    }
  };

  const isRoute = !isFound && reportForm.locationType === 'ROUTE';

  const validate = () => {
    const e = {};
    if (!reportForm.title || !reportForm.title.trim()) e.title = 'Item title is required.';
    if (!reportForm.category) e.category = 'Please select a category.';

    if (isRoute) {
      // Route mode needs both endpoints resolved to coordinates.
      if (reportForm.sourceLat == null || reportForm.sourceLng == null) e.source = 'Enter a valid source location.';
      if (reportForm.destLat == null || reportForm.destLng == null) e.dest = 'Enter a valid destination location.';
    } else if (!reportForm.location || !reportForm.location.trim()) {
      e.location = 'Please pick or enter a location.';
    }

    if (isFound) {
      // A photo is required for found reports (unless editing one that already
      // has an image on the server — image is not re-sent on edit).
      if (!(reportForm.image instanceof File) && !isEditing) {
        e.image = 'A photo is required for found items.';
      }
      if (!reportForm.date) e.date = 'Date is required for found items.';
      if (!reportForm.time) e.time = 'Time is required for found items.';
    }
    return e;
  };

  const onSubmit = (evt) => {
    evt.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // Bring the first error into view.
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    handleReportSubmit(evt);
  };

  const errText = (key) =>
    errors[key] ? <div className="error-text" style={{ marginTop: 4 }}>{errors[key]}</div> : null;
  const invalid = (key) => (errors[key] ? { borderColor: 'var(--error, #DC2626)' } : undefined);

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
         <div className="report-header">
           <h1>{isEditing ? 'Edit Report' : `Report ${isFound ? 'Found' : 'Lost'} Item`}</h1>
           <p>Provide details to help our AI match it.</p>
         </div>
         <form className="report-form" onSubmit={onSubmit} noValidate>
             <div className="type-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <div
                   onClick={() => update({ type: 'lost' })}
                   style={{ flex: 1, padding: '1rem', textAlign: 'center', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', backgroundColor: reportForm.type === 'lost' ? 'var(--primary-light)' : 'white', borderColor: reportForm.type === 'lost' ? 'var(--primary)' : 'var(--border-light)' }}
                >
                   <span style={{ fontWeight: '600', color: reportForm.type === 'lost' ? 'var(--primary)' : 'var(--text-gray)' }}>Lost an Item</span>
                </div>
                <div
                   onClick={() => update({ type: 'found' })}
                   style={{ flex: 1, padding: '1rem', textAlign: 'center', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', backgroundColor: isFound ? 'var(--primary-light)' : 'white', borderColor: isFound ? 'var(--primary)' : 'var(--border-light)' }}
                >
                   <span style={{ fontWeight: '600', color: isFound ? 'var(--primary)' : 'var(--text-gray)' }}>Found an Item</span>
                </div>
             </div>

             <div className="form-group">
               <label className="form-label">Item Title</label>
               <input type="text" className="form-input" style={invalid('title')} placeholder="e.g. Black Wallet"
                 value={reportForm.title} onChange={e => update({ title: e.target.value }, 'title')} />
               {errText('title')}
            </div>

             <div className="form-group">
               <label className="form-label">Category</label>
               <div style={invalid('category') ? { border: '1px solid var(--error, #DC2626)', borderRadius: 8 } : undefined}>
                 <CustomSelect
                   value={reportForm.category}
                   onChange={(val) => update({ category: val }, 'category')}
                   options={CATEGORY_OPTIONS}
                   placeholder="Select Category..."
                 />
               </div>
               {errText('category')}
            </div>

            <div className="date-time-row">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Brand <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}>(Optional)</span></label>
                 <input type="text" className="form-input" placeholder="e.g. Casio, Apple"
                   value={reportForm.brand || ''} onChange={e => update({ brand: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Color <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}>(Optional)</span></label>
                 <CustomSelect
                   value={reportForm.color}
                   onChange={(val) => update({ color: val })}
                   options={COLOR_OPTIONS}
                   placeholder="Select color..."
                 />
              </div>
            </div>

            <div className="form-group">
               <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <MapPin size={16} color="var(--primary)" /> Location
               </label>

               {/* Feature 1 — location mode toggle (lost items only). */}
               {!isFound && (
                 <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                   {[
                     { key: 'EXACT', label: 'I know the exact location' },
                     { key: 'ROUTE', label: 'I lost it along a route' },
                   ].map((opt) => {
                     const active = (reportForm.locationType || 'EXACT') === opt.key;
                     return (
                       <div key={opt.key} onClick={() => update({ locationType: opt.key })}
                         style={{ flex: 1, padding: '0.6rem 0.5rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                           border: `2px solid ${active ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: 10,
                           background: active ? 'var(--primary-light)' : 'white', color: active ? 'var(--primary)' : 'var(--text-gray)' }}>
                         {opt.label}
                       </div>
                     );
                   })}
                 </div>
               )}

               {isRoute ? (
                 <RouteLocationInput
                   value={{
                     sourceLocation: reportForm.sourceLocation, sourceLat: reportForm.sourceLat, sourceLng: reportForm.sourceLng,
                     destLocation: reportForm.destLocation, destLat: reportForm.destLat, destLng: reportForm.destLng,
                   }}
                   errors={errors}
                   onChange={(patch) => {
                     setReportForm((prev) => ({ ...prev, ...patch }));
                     setErrors((prev) => { const n = { ...prev }; delete n.source; delete n.dest; return n; });
                   }}
                 />
               ) : (
                 <>
                   <MapPicker
                     value={{ place: reportForm.location, lat: reportForm.latitude, lng: reportForm.longitude }}
                     placeholder="Search where it was lost / found…"
                     fallbackPlaceholder="Where was it?"
                     onChange={(v) => update({
                       location: v.place || (v.lat != null ? `${v.lat.toFixed(5)}, ${v.lng.toFixed(5)}` : ''),
                       latitude: v.lat,
                       longitude: v.lng,
                     }, 'location')}
                   />
                   {errText('location')}
                 </>
               )}
            </div>

            <div className="date-time-row">
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Date {isFound ? <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--error, #DC2626)'}}>(Required)</span> : <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}>(Optional)</span>}</label>
                 <input
                   type="date"
                   className="form-input date-time-input"
                   style={invalid('date')}
                   value={reportForm.date || ''}
                   onChange={e => update({ date: e.target.value }, 'date')}
                 />
                 {errText('date')}
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Time {isFound ? <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--error, #DC2626)'}}>(Required)</span> : <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}>(Optional)</span>}</label>
                 <input
                   type="time"
                   className="form-input date-time-input"
                   style={invalid('time')}
                   value={reportForm.time || ''}
                   onChange={e => update({ time: e.target.value }, 'time')}
                 />
                 {errText('time')}
              </div>
            </div>

            <div className="form-group">
               <label className="form-label">Photo {isFound ? '(Required)' : '(Optional)'}</label>
               <input
                 type="file"
                 accept="image/*"
                 ref={fileRef}
                 style={{ display: 'none' }}
                 onChange={e => update({ image: e.target.files[0] || null }, 'image')}
               />
               <div className="upload-area" style={{ cursor: 'pointer', ...(invalid('image') || {}) }} onClick={() => fileRef.current?.click()}>
                 {reportForm.image instanceof File ? (
                   <>
                     <img src={URL.createObjectURL(reportForm.image)} alt="preview" style={{ maxHeight: 120, borderRadius: 8, marginBottom: 8 }} />
                     <div className="upload-subtitle">{reportForm.image.name} — click to change</div>
                   </>
                 ) : (
                   <>
                     <ImagePlus size={32} color="var(--primary)" />
                     <div className="upload-title">Click to upload</div>
                     <div className="upload-subtitle">JPG, PNG up to 5MB{isFound ? ' — required for found items' : ''}</div>
                   </>
                 )}
               </div>
               {errText('image')}
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
                          update({ description: val });
                      }
                  }}
                  onBlur={e => update({ description: e.target.value.trim() })}
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

            {isFound && (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Handover Method</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: `2px solid ${reportForm.handoverMethod === 'direct' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: reportForm.handoverMethod === 'direct' ? 'var(--primary-light)' : 'white' }}>
                       <input type="radio" name="handover" value="direct" checked={reportForm.handoverMethod === 'direct'} onChange={() => update({ handoverMethod: 'direct' })} style={{ marginTop: '4px' }} />
                       <div>
                         <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Direct Meetup</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Meet securely in a public place.</div>
                       </div>
                     </label>
                     <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: `2px solid ${reportForm.handoverMethod === 'police' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: reportForm.handoverMethod === 'police' ? 'var(--primary-light)' : 'white' }}>
                       <input type="radio" name="handover" value="police" checked={reportForm.handoverMethod === 'police'} onChange={() => update({ handoverMethod: 'police' })} style={{ marginTop: '4px' }} />
                       <div>
                         <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Police Station</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>For high-value items.</div>
                       </div>
                     </label>
                     <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: `2px solid ${reportForm.handoverMethod === 'admin' ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '12px', cursor: 'pointer', backgroundColor: reportForm.handoverMethod === 'admin' ? 'var(--primary-light)' : 'white' }}>
                       <input type="radio" name="handover" value="admin" checked={reportForm.handoverMethod === 'admin'} onChange={() => update({ handoverMethod: 'admin' })} style={{ marginTop: '4px' }} />
                       <div>
                         <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Institution / Admin Desk</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Drop-off at the main office.</div>
                       </div>
                     </label>
                  </div>
                </div>

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
                      onChange={(v) => update({ handoverPlace: v.place, handoverLat: v.lat, handoverLng: v.lng })}
                    />
                  </div>
                )}

                <div className="form-group" style={{ backgroundColor: 'var(--bg-alt)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                   <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Reward Preference</label>
                   <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Would you like to be offered a reward if the owner chooses to give one?</p>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                     <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.75rem', border: `2px solid ${reportForm.wantsReward ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: reportForm.wantsReward ? 'var(--primary-light)' : 'white', fontWeight: '600', color: reportForm.wantsReward ? 'var(--primary)' : 'var(--text-gray)' }}>
                       <input type="radio" name="reward" value="yes" checked={reportForm.wantsReward} onChange={() => update({ wantsReward: true })} style={{ display: 'none' }} />
                       Yes, Opt-In
                     </label>
                     <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.75rem', border: `2px solid ${!reportForm.wantsReward ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: !reportForm.wantsReward ? 'var(--primary-light)' : 'white', fontWeight: '600', color: !reportForm.wantsReward ? 'var(--primary)' : 'var(--text-gray)' }}>
                       <input type="radio" name="reward" value="no" checked={!reportForm.wantsReward} onChange={() => update({ wantsReward: false })} style={{ display: 'none' }} />
                       No, Thank You
                     </label>
                   </div>
                </div>
              </>
            )}

            {Object.keys(errors).length > 0 && (
              <div className="error-text" style={{ marginBottom: '1rem' }}>Please fix the highlighted fields above.</div>
            )}
            {reportError && <div className="error-text" style={{ marginBottom: '1rem' }}>{reportError}</div>}
            <button type="submit" className="btn-submit" disabled={isLoading}>{isLoading ? 'Submitting…' : 'Submit Report'}</button>
            <button type="button" className="btn-cancel" onClick={() => navigateTo('dashboard')}>Cancel</button>
         </form>
       </div>
    </div>
  );
};
