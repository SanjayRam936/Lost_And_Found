import React from 'react';
import { ImagePlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CustomSelect } from '../components/CustomSelect';

export const ReportItem = () => {
  const { reportForm, setReportForm, handleReportSubmit, navigateTo } = useAppContext();

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
                 options={[
                   { value: 'electronics', label: 'Electronics' },
                   { value: 'personal', label: 'Personal Items' },
                   { value: 'pets', label: 'Pets' }
                 ]}
                 placeholder="Select Category..."
               />
            </div>
            <div className="form-group">
               <label className="form-label">Location</label>
               <input type="text" className="form-input" placeholder="Where was it?" required value={reportForm.location} onChange={e => setReportForm({...reportForm, location: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Date {reportForm.type === 'lost' ? <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}>(Optional)</span> : ''}</label>
                 <input 
                   type="date" 
                   className="form-input" 
                   required={reportForm.type === 'found'} 
                   value={reportForm.date || ''} 
                   onChange={e => setReportForm({...reportForm, date: e.target.value})} 
                 />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                 <label className="form-label">Time {reportForm.type === 'lost' ? <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-gray)'}}>(Optional)</span> : ''}</label>
                 <input 
                   type="time" 
                   className="form-input" 
                   required={reportForm.type === 'found'} 
                   value={reportForm.time || ''} 
                   onChange={e => setReportForm({...reportForm, time: e.target.value})} 
                 />
              </div>
            </div>
            <div className="form-group">
               <label className="form-label">Photo {reportForm.type === 'lost' ? '(Optional)' : '(Required)'}</label>
               <div className="upload-area">
                 <ImagePlus size={32} color="var(--primary)" />
                 <div className="upload-title">Click to upload</div>
                 <div className="upload-subtitle">JPG, PNG up to 5MB</div>
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
            <button type="submit" className="btn-submit">Submit Report</button>
            <button type="button" className="btn-cancel" onClick={() => navigateTo('dashboard')}>Cancel</button>
         </form>
       </div>
    </div>
  );
};
