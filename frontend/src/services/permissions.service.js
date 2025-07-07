import { sendGet, sendPost, sendPatch, sendPut, sendDelete } from '../connections/backendConnect';

class PermissionsService {
  // Obtener todos los permisos disponibles del sistema
  async getAllPermissions() {
    try {
      const response = await sendGet('/roles/system/permissions');
      return response;
    } catch (error) {
      console.error('Error fetching all permissions:', error);
      throw error;
    }
  }

  // Obtener roles de un servidor
  async getServerRoles(serverId, token, page = 1, limit = 10) {
    try {
      const response = await sendGet('/roles', { serverId, page, limit }, token);
      return response;
    } catch (error) {
      console.error('Error fetching server roles:', error);
      throw error;
    }
  }

  // Obtener un rol específico
  async getRoleById(roleId, token) {
    try {
      const response = await sendGet(`/roles/${roleId}`, {}, token);
      return response;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  // Crear un nuevo rol
  async createRole(roleData, token) {
    try {
      const response = await sendPost('/roles', roleData, token);
      return response;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  // Actualizar un rol
  async updateRole(roleId, roleData, token) {
    try {
      const response = await sendPut(`/roles/${roleId}`, roleData, token);
      return response;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  // Eliminar un rol
  async deleteRole(roleId, token) {
    try {
      const response = await sendDelete(`/roles/${roleId}`, token);
      return response;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Obtener permisos de un rol
  async getRolePermissions(roleId, token) {
    try {
      const response = await sendGet(`/roles/${roleId}/permissions`, {}, token);
      return response;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  }

  // Actualizar permisos de un rol
  async updateRolePermissions(roleId, permissions, token) {
    try {
      const response = await sendPut(`/roles/${roleId}/permissions`, { permissions }, token);
      return response;
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  }

  // Verificar si el usuario tiene un permiso específico
  hasPermission(userPermissions, requiredPermission) {
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return false;
    }
    
    // Si tiene ADMINISTRATOR, tiene todos los permisos
    if (userPermissions.includes('ADMINISTRATOR')) {
      return true;
    }
    
    return userPermissions.includes(requiredPermission);
  }

  // Verificar si el usuario tiene alguno de los permisos especificados
  hasAnyPermission(userPermissions, requiredPermissions) {
    if (!userPermissions || !Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) {
      return false;
    }
    
    // Si tiene ADMINISTRATOR, tiene todos los permisos
    if (userPermissions.includes('ADMINISTRATOR')) {
      return true;
    }
    
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  }

  // Obtener permisos por categoría para la UI
  getPermissionsByCategory(allPermissions) {
    if (!allPermissions?.categories) {
      return {};
    }
    
    return allPermissions.categories;
  }

  // Obtener descripción de un permiso
  getPermissionDescription(allPermissions, permission) {
    if (!allPermissions?.descriptions) {
      return 'No description available';
    }
    
    return allPermissions.descriptions[permission] || 'No description available';
  }
}

export default new PermissionsService();