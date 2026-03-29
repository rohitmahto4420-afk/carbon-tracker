import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, BarChart2, Users, Settings, Archive, Zap, Camera } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="ecology-sidebar">
      <div className="sidebar-header">
        <h2>Ecology</h2>
        <p className="sidebar-subtitle">Carbon Footprint</p>
        <span className="sidebar-version">TRACKER V1.0</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/home" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <LayoutDashboard size={20}/> Dashboard
        </NavLink>
        
        <NavLink 
          to="/calculator" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
          onClick={() => window.dispatchEvent(new Event('resetCalculator'))}
        >
          <PlusCircle size={20}/> Log Activity
        </NavLink>
        
        <NavLink 
          to="/graph" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <BarChart2 size={20}/> Analytics
        </NavLink>
        
        <NavLink 
          to="/simulator" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Zap size={20}/> Simulator
        </NavLink>
        
        <NavLink 
          to="/scanner" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Camera size={20}/> Scanner
        </NavLink>
        
        <NavLink 
          to="/records" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Archive size={20}/> Records
        </NavLink>
        
        <NavLink 
          to="/challenges" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Users size={20}/> Challenges
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Settings size={20}/> Settings
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <NavLink 
          to="/calculator" 
          className="new-entry-btn" 
          style={{textDecoration: 'none'}}
          onClick={() => window.dispatchEvent(new Event('resetCalculator'))}
        >
          New Entry
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
