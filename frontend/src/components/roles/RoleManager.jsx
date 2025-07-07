import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Users, Crown } from 'lucide-react';
import permissionsService from '../../services/permissions.service';
import PermissionSelector from '../permissions/PermissionSelector';
import './RoleManager.css';

const RoleManager = ({ serverId }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (serverId) {
      loadRoles();
    }
  }, [serverId]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await permissionsService.getServerRoles(serverId, token);
      if (response.data) {
        setRoles(response.data);
      }
    } catch (err) {
      setError('Error loading roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole({
      name: '',
      color: '#99aab5',
      permissions: []
    });
    setShowCreateModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowCreateModal(true);
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (editingRole.id) {
        // Actualizar rol existente
        await permissionsService.updateRole(editingRole.id, {
          name: roleData.name,
          color: roleData.color
        }, token);
        
        // Actualizar permisos por separado
        await permissionsService.updateRolePermissions(editingRole.id, roleData.permissions, token);
      } else {
        // Crear nuevo rol
        await permissionsService.createRole({
          ...roleData,
          serverId
        }, token);
      }
      
      await loadRoles();
      setShowCreateModal(false);
      setEditingRole(null);
    } catch (err) {
      console.error('Error saving role:', err);
      setError('Error saving role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }

    try {
      await permissionsService.deleteRole(roleId, token);
      await loadRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      setError('Error deleting role');
    }
  };

  const handleViewPermissions = (role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  const getRoleColor = (color) => {
    return color || '#99aab5';
  };

  if (loading) {
    return (
      <div className="role-manager-loading">
        <Shield className="loading-icon" />
        <span>Loading roles...</span>
      </div>
    );
  }

  return (
    <div className="role-manager">
      <div className="role-manager-header">
        <div className="header-title">
          <Shield className="header-icon" />
          <h2>Server Roles</h2>
        </div>
        <button className="create-role-btn" onClick={handleCreateRole}>
          <Plus className="btn-icon" />
          Create Role
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="roles-list">
        {roles.map((role) => (
          <div key={role.id} className="role-card">
            <div className="role-header">
              <div className="role-info">
                <div 
                  className="role-color-indicator"
                  style={{ backgroundColor: getRoleColor(role.color) }}
                />
                <div className="role-details">
                  <h3 className="role-name">{role.name}</h3>
                  <div className="role-stats">
                    <span className="member-count">
                      <Users className="stat-icon" />
                      {role.memberCount || 0} members
                    </span>
                    <span className="permission-count">
                      <Shield className="stat-icon" />
                      {role.permissions?.length || 0} permissions
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="role-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => handleViewPermissions(role)}
                  title="View Permissions"
                >
                  <Shield className="btn-icon" />
                </button>
                {role.name !== '@everyone' && (
                  <>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditRole(role)}
                      title="Edit Role"
                    >
                      <Edit className="btn-icon" />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteRole(role.id)}
                      title="Delete Role"
                    >
                      <Trash2 className="btn-icon" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {role.permissions?.includes('ADMINISTRATOR') && (
              <div className="admin-badge">
                <Crown className="crown-icon" />
                Administrator
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Role Modal */}
      {showCreateModal && (
        <RoleModal
          role={editingRole}
          onSave={handleSaveRole}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRole(null);
          }}
        />
      )}

      {/* View Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <PermissionsModal
          role={selectedRole}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
};

// Modal para crear/editar roles
const RoleModal = ({ role, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    color: role?.color || '#99aab5',
    permissions: role?.permissions || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content role-modal">
        <div className="modal-header">
          <h3>{role?.id ? 'Edit Role' : 'Create Role'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="role-form">
          <div className="form-group">
            <label>Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter role name"
              required
            />
          </div>

          <div className="form-group">
            <label>Role Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#99aab5"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Permissions</label>
            <PermissionSelector
              selectedPermissions={formData.permissions}
              onPermissionsChange={(permissions) => 
                setFormData(prev => ({ ...prev, permissions }))
              }
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {role?.id ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para ver permisos
const PermissionsModal = ({ role, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content permissions-modal">
        <div className="modal-header">
          <h3>Permissions for {role.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="permissions-view">
          <PermissionSelector
            selectedPermissions={role.permissions || []}
            onPermissionsChange={() => {}} // Read-only
            disabled={true}
            showDescriptions={false}
          />
        </div>
      </div>
    </div>
  );
};

export default RoleManager;