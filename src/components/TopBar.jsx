import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Moon, Sun } from 'lucide-react';

const TopBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    if (document.body.classList.contains('dark-mode')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
      setIsDarkMode(false);
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
      localStorage.setItem('theme', 'dark');
    }
  };
  return (
    <header className="ecology-topbar">
      <div className="search-bar">
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search insights..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              setSearchQuery('');
            }
          }} 
        />
      </div>
      
      <nav className="topbar-nav">
        <NavLink 
          to="/home" 
          className={({isActive}) => isActive ? 'topbar-link active' : 'topbar-link'}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/challenges" 
          className={({isActive}) => isActive ? 'topbar-link active' : 'topbar-link'}
        >
          Challenges
        </NavLink>
        <NavLink 
          to="/graph" 
          className={({isActive}) => isActive ? 'topbar-link active' : 'topbar-link'}
        >
          Analytics
        </NavLink>
      </nav>
      
      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Toggle Dark Mode" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn" aria-label="Notifications" onClick={() => navigate('/notifications')}>
          <Bell size={20}/>
        </button>
        <button className="icon-btn" aria-label="User Profile" onClick={() => navigate('/settings')}>
          <User size={20}/>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
