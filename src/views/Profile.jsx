import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Profile = () => {
  const { handleLogout } = useAppContext();

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
          <div className="profile-header-card">
             <div className="profile-cover"></div>
             <div className="profile-avatar-container">
                <img className="profile-avatar" src="https://ui-avatars.com/api/?name=User&background=035C43&color=fff" alt="User" />
             </div>
             <div className="profile-name">John Doe</div>
             <div className="profile-email">john.doe@university.edu</div>
          </div>
          <div className="settings-card">
             <div className="settings-card-title"><Bell size={18}/> Notifications</div>
             <div className="settings-desc">Manage how we contact you.</div>
             <button className="btn-update-outline">Update Preferences</button>
          </div>
          <button className="btn-logout-new" onClick={handleLogout}><LogOut size={18}/> Sign Out</button>
       </div>
    </div>
  );
};
