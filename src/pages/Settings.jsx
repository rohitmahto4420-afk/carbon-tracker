import React, { useState } from "react";
import { User, Bell, Shield, LogOut, X } from "lucide-react";
import "./Settings.css";

export default function Settings() {
  const [activeModal, setActiveModal] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your preferences, security, and notifications.</p>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-header">
            <User size={20} />
            <h3>Profile Information</h3>
          </div>
          <p>Update your name and email address.</p>
          <button className="settings-btn" onClick={() => setActiveModal('profile')}>Edit Profile</button>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <Bell size={20} />
            <h3>Notifications</h3>
          </div>
          <p>Configure which alerts you receive.</p>
          <button className="settings-btn" onClick={() => setActiveModal('alerts')}>Manage Alerts</button>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <Shield size={20} />
            <h3>Privacy & Security</h3>
          </div>
          <p>Manage your password and data sharing.</p>
          <button className="settings-btn" onClick={() => setActiveModal('security')}>Security Settings</button>
        </div>
      </div>

      <div className="settings-danger-zone">
        <h3>Danger Zone</h3>
        <button className="logout-btn" onClick={handleLogout}><LogOut size={16}/> Log Out</button>
      </div>

      {/* Modals */}
      {activeModal === 'profile' && (
        <div className="settings-modal-overlay" onClick={closeModal}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Edit Profile</h2>
              <X size={24} style={{cursor: 'pointer'}} onClick={closeModal} />
            </div>
            <p>Update your personal information below.</p>
            <form className="settings-modal-form" onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
              <label>
                Full Name
                <input type="text" defaultValue="John Doe" placeholder="Enter your name" />
              </label>
              <label>
                Email Address
                <input type="email" defaultValue="johndoe@example.com" placeholder="Enter your email" />
              </label>
              <div className="settings-modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'alerts' && (
        <div className="settings-modal-overlay" onClick={closeModal}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Manage Alerts</h2>
              <X size={24} style={{cursor: 'pointer'}} onClick={closeModal} />
            </div>
            <p>Choose what notifications you want to receive.</p>
            <form className="settings-modal-form" onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Email Notifications (Weekly Summary)
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Push Notifications (Goal Achieved)
              </label>
              <label className="checkbox-label">
                <input type="checkbox" />
                SMS Alerts (Critical Updates)
              </label>
              <div className="settings-modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn">Save Preferences</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'security' && (
        <div className="settings-modal-overlay" onClick={closeModal}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Security Settings</h2>
              <X size={24} style={{cursor: 'pointer'}} onClick={closeModal} />
            </div>
            <p>Update your password and privacy preferences.</p>
            <form className="settings-modal-form" onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
              <label>
                Current Password
                <input type="password" placeholder="Enter current password" />
              </label>
              <label>
                New Password
                <input type="password" placeholder="Enter new password" />
              </label>
              <label>
                Confirm New Password
                <input type="password" placeholder="Confirm new password" />
              </label>
              <label className="checkbox-label" style={{marginTop: '10px'}}>
                <input type="checkbox" defaultChecked />
                Share anonymous usage data to improve Carbon Tracker
              </label>
              <div className="settings-modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn">Update Security</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
