import permissionsService from '../services/permissions.service.js';

const permissions = permissionsService();

// Middleware para verificar permisos
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id; // Asumiendo que el usuario está en req.user
      const serverId = req.params.serverId || req.body.serverId || req.query.serverId;

      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (!serverId) {
        return res.status(400).json({
          error: 'Server ID is required',
          code: 'SERVER_ID_REQUIRED'
        });
      }

      const hasPermission = await permissions.hasPermission(userId, serverId, permission);

      if (!hasPermission) {
        return res.status(403).json({
          error: `Missing permission: ${permission}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredPermission: permission
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        error: 'Error checking permissions',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Middleware para verificar múltiples permisos (OR)
export const requireAnyPermission = (permissionsList) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const serverId = req.params.serverId || req.body.serverId || req.query.serverId;

      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (!serverId) {
        return res.status(400).json({
          error: 'Server ID is required',
          code: 'SERVER_ID_REQUIRED'
        });
      }

      const userPermissions = await permissions.getUserPermissions(userId, serverId);
      const hasAnyPermission = permissionsList.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          error: `Missing any of required permissions: ${permissionsList.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredPermissions: permissionsList
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        error: 'Error checking permissions',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Middleware para verificar si puede gestionar un rol específico
export const requireRoleManagement = () => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const serverId = req.params.serverId || req.body.serverId || req.query.serverId;
      const roleId = req.params.roleId || req.body.roleId;

      if (!userId || !serverId || !roleId) {
        return res.status(400).json({
          error: 'User ID, Server ID, and Role ID are required',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const canManage = await permissions.canManageRole(userId, serverId, roleId);

      if (!canManage) {
        return res.status(403).json({
          error: 'Cannot manage this role - insufficient hierarchy or permissions',
          code: 'ROLE_HIERARCHY_ERROR'
        });
      }

      next();
    } catch (error) {
      console.error('Role management middleware error:', error);
      return res.status(500).json({
        error: 'Error checking role management permissions',
        code: 'ROLE_MANAGEMENT_CHECK_ERROR'
      });
    }
  };
};

// Middleware para agregar permisos del usuario al request
export const attachUserPermissions = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const serverId = req.params.serverId || req.body.serverId || req.query.serverId;

    if (userId && serverId) {
      req.userPermissions = await permissions.getUserPermissions(userId, serverId);
    }

    next();
  } catch (error) {
    console.error('Attach permissions middleware error:', error);
    next(); // Continue even if there's an error
  }
};