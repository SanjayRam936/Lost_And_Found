import React from 'react';
import { Monitor, PawPrint, Wallet, FileQuestion } from 'lucide-react';

export const getCategoryIcon = (category) => {
  switch(category) {
    case 'electronics': return <Monitor size={14} />;
    case 'pets': return <PawPrint size={14} />;
    case 'personal': return <Wallet size={14} />;
    default: return <FileQuestion size={14} />;
  }
};

export const getStatusBadge = (status) => {
  switch(status) {
    case 'matched': return <span className="badge-container status-orange"><span className="status-dot"></span> AI Matched</span>;
    case 'active': return <span className="badge-container status-blue"><span className="status-dot"></span> Active Search</span>;
    case 'pending': return <span className="badge-container status-purple"><span className="status-dot"></span> Claim Pending</span>;
    case 'resolved': return <span className="badge-container" style={{background: '#D1FAE5', color: '#047857'}}><span className="status-dot" style={{background: '#047857'}}></span> Resolved</span>;
    default: return null;
  }
};
