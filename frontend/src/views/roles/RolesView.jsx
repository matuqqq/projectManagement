import React, { useState } from 'react';
import RoleManager from '../../components/roles/RoleManager';
import { Server, Shield } from 'lucide-react';
import './RolesView.css';

const RolesView = () => {
  const [serverId, setServerId] = useState('');
  const [showRoles, setShowRoles] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (serverId.trim()) {
      setShowRoles(true);
    }
  };

  return (
    <div className="roles-view-container">
      <div className="roles-view-content">
        {/* Header */}
        <div className="header-section">
          <div className="header-title-container">
            <div className="header-icon">
              <Shield className="shield-icon" />
            </div>
            <h1 className="header-text">Role Management</h1>
          </div>
          <p className="header-subtext">Manage server roles and permissions</p>
        </div>

        {/* Server Selection */}
        <div className="server-selection-container">
          <div className="selection-header">
            <h2 className="selection-title">
              <Server className="server-icon" />
              Select Server
            </h2>
            <p className="selection-description">Enter a server ID to manage its roles and permissions</p>
          </div>
          <div className="selection-form-container">
            <form onSubmit={handleSubmit} className="selection-form">
              <input
                type="text"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                placeholder="Enter Server ID (e.g., 123456789012345678)"
                className="server-input"
              />
              <button
                type="submit"
                disabled={!serverId.trim()}
                className={`submit-button ${!serverId.trim() ? 'disabled-button' : ''}`}
              >
                Manage Roles
              </button>
            </form>
          </div>
        </div>

        {/* Role Manager */}
        {showRoles && serverId && (
          <div className="role-manager-section">
            <RoleManager serverId={serverId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesView;