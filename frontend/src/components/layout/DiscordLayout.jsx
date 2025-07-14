import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Hash, 
  AtSign, 
  Settings, 
  Plus, 
  Compass,
  Download,
  Mic,
  Headphones,
  MoreVertical
} from 'lucide-react';
import './DiscordLayout.css';

const DiscordLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedServer, setSelectedServer] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Obtener información del usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Mock servers data
  const servers = [
    { id: 'dm', name: 'Direct Messages', type: 'dm' },
    { id: '1', name: 'General Server', icon: null },
    { id: '2', name: 'Gaming Hub', icon: null },
    { id: '3', name: 'Study Group', icon: null }
  ];

  const handleServerClick = (server) => {
    setSelectedServer(server);
    if (server.type === 'dm') {
      navigate('/direct-messages');
    } else {
      navigate('/channels');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="discord-layout">
      {/* Server Sidebar */}
      <div className="server-sidebar">
        <div className="server-list">
          {/* Direct Messages */}
          <div
            className={`server-item dm-server ${isActive('/direct-messages') ? 'selected' : ''}`}
            onClick={() => handleServerClick({ id: 'dm', name: 'Direct Messages', type: 'dm' })}
            title="Direct Messages"
          >
            <AtSign className="dm-icon" />
          </div>

          <div className="server-divider" />

          {/* Server List */}
          {servers.filter(s => s.type !== 'dm').map((server) => (
            <div
              key={server.id}
              className={`server-item ${selectedServer?.id === server.id ? 'selected' : ''}`}
              onClick={() => handleServerClick(server)}
              title={server.name}
            >
              {server.icon ? (
                <img src={server.icon} alt={server.name} className="server-icon" />
              ) : (
                <div className="server-icon-placeholder">
                  {server.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {/* Add Server Button */}
          <div className="server-item add-server" title="Add a Server">
            <Plus className="add-server-icon" />
          </div>

          {/* Discover Servers */}
          <div className="server-item discover-server" title="Explore Public Servers">
            <Compass className="discover-icon" />
          </div>
        </div>

        <div className="server-sidebar-bottom">
          <div className="server-item download-app" title="Download Apps">
            <Download className="download-icon" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-layout">
        {children}
      </div>

      {/* User Panel (si no está en el children) */}
      {!location.pathname.includes('/direct-messages') && !location.pathname.includes('/channels') && (
        <div className="user-panel">
          <div className="user-info">
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="user-details">
              <span className="username">{user?.username || 'User'}</span>
              <span className="user-status">Online</span>
            </div>
          </div>
          <div className="user-controls">
            <Mic className="control-icon" />
            <Headphones className="control-icon" />
            <Settings className="control-icon" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscordLayout;