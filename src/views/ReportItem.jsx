import React from 'react';
import { ImagePlus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

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
            <div className="form-group">
               <label className="form-label">Item Title</label>
               <input type="text" className="form-input" placeholder="e.g. Black Wallet" required value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} />
            </div>
            <div className="form-group">
               <label className="form-label">Category</label>
               <select className="form-input" value={reportForm.category} onChange={e => setReportForm({...reportForm, category: e.target.value})}>
                 <option value="">Select Category...</option>
                 <option value="electronics">Electronics</option>
                 <option value="personal">Personal Items</option>
                 <option value="pets">Pets</option>
               </select>
            </div>
            <div className="form-group">
               <label className="form-label">Location</label>
               <input type="text" className="form-input" placeholder="Where was it?" required value={reportForm.location} onChange={e => setReportForm({...reportForm, location: e.target.value})} />
            </div>
            <div className="form-group">
               <label className="form-label">Photo (Optional but recommended)</label>
               <div className="upload-area">
                 <ImagePlus size={32} color="var(--primary)" />
                 <div className="upload-title">Click to upload</div>
                 <div className="upload-subtitle">JPG, PNG up to 5MB</div>
               </div>
            </div>
            <button type="submit" className="btn-submit">Submit Report</button>
            <button type="button" className="btn-cancel" onClick={() => navigateTo('dashboard')}>Cancel</button>
         </form>
       </div>
    </div>
  );
};
