import React from 'react';
import {
  Smartphone, Wallet, Key, Watch, Backpack, Laptop, Headphones, FileText,
  Gem, Shirt, GlassWater, Glasses, Camera, BookOpen, PawPrint, Package,
} from 'lucide-react';

// Single source of truth for item categories (value === label so it stores
// readable text and matches consistently across lost/found reports).
export const CATEGORIES = [
  'Phone & Tablets',
  'Wallet & Purse',
  'Keys',
  'Watch',
  'Bag & Backpack',
  'Laptop & Computer',
  'Earphones & Headphones',
  'ID Card & Documents',
  'Jewellery',
  'Clothing',
  'Water Bottle',
  'Spectacles',
  'Camera',
  'Books & Stationery',
  'Pet',
  'Other',
];

export const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

// Standard colors (a fixed list keeps values consistent so the matching
// engine's exact-color check works across lost/found reports).
export const COLORS = [
  'Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Yellow',
  'Orange', 'Brown', 'Pink', 'Purple', 'Gold', 'Multicolor', 'Other',
];
export const COLOR_OPTIONS = COLORS.map((c) => ({ value: c, label: c }));

const CATEGORY_ICONS = {
  'Phone & Tablets': Smartphone,
  'Wallet & Purse': Wallet,
  'Keys': Key,
  'Watch': Watch,
  'Bag & Backpack': Backpack,
  'Laptop & Computer': Laptop,
  'Earphones & Headphones': Headphones,
  'ID Card & Documents': FileText,
  'Jewellery': Gem,
  'Clothing': Shirt,
  'Water Bottle': GlassWater,
  'Spectacles': Glasses,
  'Camera': Camera,
  'Books & Stationery': BookOpen,
  'Pet': PawPrint,
  'Other': Package,
};

export const getCategoryIcon = (category) => {
  const Icon = CATEGORY_ICONS[category] || Package;
  return <Icon size={14} />;
};

export const getStatusBadge = (status) => {
  switch(status) {
    case 'matched': return <span className="badge-container status-orange"><span className="status-dot"></span> AI Matched</span>;
    case 'claim-initiated': return <span className="badge-container status-purple"><span className="status-dot"></span> OTP Ready — Confirm Handover</span>;
    case 'reward-due': return <span className="badge-container" style={{background: '#FEF3C7', color: '#B45309'}}><span className="status-dot" style={{background: '#B45309'}}></span> Reward Due</span>;
    case 'reward-pending': return <span className="badge-container" style={{background: '#FEF3C7', color: '#B45309'}}><span className="status-dot" style={{background: '#B45309'}}></span> Awaiting Reward</span>;
    case 'reward-received': return <span className="badge-container" style={{background: '#D1FAE5', color: '#047857'}}><span className="status-dot" style={{background: '#047857'}}></span> Reward Received</span>;
    case 'active': return <span className="badge-container status-blue"><span className="status-dot"></span> Active Search</span>;
    case 'pending': return <span className="badge-container status-purple"><span className="status-dot"></span> Claim Pending</span>;
    case 'resolved': return <span className="badge-container" style={{background: '#D1FAE5', color: '#047857'}}><span className="status-dot" style={{background: '#047857'}}></span> Resolved</span>;
    default: return null;
  }
};
