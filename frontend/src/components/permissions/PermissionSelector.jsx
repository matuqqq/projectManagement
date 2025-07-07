import React, { useState, useEffect } from 'react';
import { Shield, ChevronDown, ChevronRight, Info } from 'lucide-react';
import permissionsService from '../../services/permissions.service';
import './PermissionSelector.css';

const PermissionSelector = ({ 
  selectedPermissions = [], 
  onPermissionsChange, 
  disabled = false,
  showDescriptions = true 
}) => {
  const [allPermissions, setAllPermissions] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const permissions = await permissionsService.getAllPermissions();
      setAllPermissions(permissions);
      
      // Expandir todas las categorías por defecto
      if (permissions.categories) {
        const expanded = {};
        Object.keys(permissions.categories).forEach(category => {
          expanded[category] = true;
        });
        setExpandedCategories(expanded);
      }
    } catch (err) {
      setError('Error loading permissions');
      console.error('Error loading permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const handlePermissionToggle = (permission) => {
    if (disabled) return;

    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter(p => p !== permission)
      : [...selectedPermissions, permission];
    
    onPermissionsChange(newPermissions);
  };

  const handleSelectAll = (categoryPermissions) => {
    if (disabled) return;

    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
    
    if (allSelected) {
      // Deseleccionar todos los permisos de esta categoría
      const newPermissions = selectedPermissions.filter(p => !categoryPermissions.includes(p));
      onPermissionsChange(newPermissions);
    } else {
      // Seleccionar todos los permisos de esta categoría
      const newPermissions = [...new Set([...selectedPermissions, ...categoryPermissions])];
      onPermissionsChange(newPermissions);
    }
  };

  if (loading) {
    return (
      <div className="permission-selector-loading">
        <Shield className="loading-icon" />
        <span>Loading permissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="permission-selector-error">
        <span>{error}</span>
      </div>
    );
  }

  if (!allPermissions?.categories) {
    return (
      <div className="permission-selector-error">
        <span>No permissions available</span>
      </div>
    );
  }

  return (
    <div className="permission-selector">
      <div className="permission-selector-header">
        <Shield className="header-icon" />
        <h3>Role Permissions</h3>
        <span className="selected-count">
          {selectedPermissions.length} selected
        </span>
      </div>

      <div className="permission-categories">
        {Object.entries(allPermissions.categories).map(([categoryKey, category]) => {
          const isExpanded = expandedCategories[categoryKey];
          const categoryPermissions = category.permissions;
          const selectedInCategory = categoryPermissions.filter(p => selectedPermissions.includes(p));
          const allSelected = selectedInCategory.length === categoryPermissions.length;
          const someSelected = selectedInCategory.length > 0 && !allSelected;

          return (
            <div key={categoryKey} className="permission-category">
              <div className="category-header">
                <button
                  type="button"
                  className="category-toggle"
                  onClick={() => toggleCategory(categoryKey)}
                  disabled={disabled}
                >
                  {isExpanded ? (
                    <ChevronDown className="toggle-icon" />
                  ) : (
                    <ChevronRight className="toggle-icon" />
                  )}
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">
                    ({selectedInCategory.length}/{categoryPermissions.length})
                  </span>
                </button>
                
                <button
                  type="button"
                  className={`select-all-btn ${allSelected ? 'all-selected' : someSelected ? 'some-selected' : ''}`}
                  onClick={() => handleSelectAll(categoryPermissions)}
                  disabled={disabled}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {isExpanded && (
                <div className="category-permissions">
                  {categoryPermissions.map(permission => {
                    const isSelected = selectedPermissions.includes(permission);
                    const description = permissionsService.getPermissionDescription(allPermissions, permission);

                    return (
                      <div key={permission} className="permission-item">
                        <label className={`permission-label ${disabled ? 'disabled' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePermissionToggle(permission)}
                            disabled={disabled}
                            className="permission-checkbox"
                          />
                          <div className="permission-info">
                            <span className="permission-name">
                              {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {showDescriptions && (
                              <div className="permission-description">
                                <Info className="description-icon" />
                                <span>{description}</span>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPermissions.includes('ADMINISTRATOR') && (
        <div className="administrator-warning">
          <Shield className="warning-icon" />
          <div>
            <strong>Administrator Permission Selected</strong>
            <p>This role will have all permissions, including the ability to manage other roles and server settings.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionSelector;