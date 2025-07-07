import { prisma } from '../prisma/prisma.provider.js';
import { PERMISSIONS, DEFAULT_PERMISSIONS } from '../constants/permissions.constants.js';

export default () => {
  return {
    // Obtener todos los permisos de un rol
    getRolePermissions: async (roleId) => {
      try {
        const permissions = await prisma.serverRolePermission.findMany({
          where: { roleId },
          select: { value: true }
        });
        
        return permissions.map(p => p.value);
      } catch (error) {
        throw new Error(`Error fetching role permissions: ${error.message}`);
      }
    },

    // Obtener permisos efectivos de un usuario en un servidor
    getUserPermissions: async (userId, serverId) => {
      try {
        // Verificar si es el owner del servidor
        const server = await prisma.server.findUnique({
          where: { id: serverId },
          select: { ownerId: true }
        });

        if (server?.ownerId === userId) {
          return Object.values(PERMISSIONS); // Owner tiene todos los permisos
        }

        // Obtener membresía del usuario
        const member = await prisma.serverMember.findUnique({
          where: {
            userId_serverId: {
              userId,
              serverId
            }
          },
          include: {
            role: {
              include: {
                ServerRolePermission: {
                  select: { value: true }
                }
              }
            }
          }
        });

        if (!member) {
          return []; // No es miembro del servidor
        }

        // Si tiene rol, obtener permisos del rol
        if (member.role) {
          const rolePermissions = member.role.ServerRolePermission.map(p => p.value);
          
          // Si tiene ADMINISTRATOR, devolver todos los permisos
          if (rolePermissions.includes(PERMISSIONS.ADMINISTRATOR)) {
            return Object.values(PERMISSIONS);
          }
          
          return rolePermissions;
        }

        // Si no tiene rol específico, usar permisos por defecto del servidor (@everyone)
        const everyoneRole = await prisma.serverRole.findFirst({
          where: {
            serverId,
            name: '@everyone'
          },
          include: {
            ServerRolePermission: {
              select: { value: true }
            }
          }
        });

        return everyoneRole?.ServerRolePermission.map(p => p.value) || DEFAULT_PERMISSIONS.EVERYONE;
      } catch (error) {
        throw new Error(`Error fetching user permissions: ${error.message}`);
      }
    },

    // Verificar si un usuario tiene un permiso específico
    hasPermission: async (userId, serverId, permission) => {
      try {
        const userPermissions = await this.getUserPermissions(userId, serverId);
        return userPermissions.includes(permission) || userPermissions.includes(PERMISSIONS.ADMINISTRATOR);
      } catch (error) {
        throw new Error(`Error checking permission: ${error.message}`);
      }
    },

    // Asignar permisos a un rol
    assignPermissionsToRole: async (roleId, permissions) => {
      try {
        // Validar que los permisos existan
        const validPermissions = permissions.filter(p => Object.values(PERMISSIONS).includes(p));
        
        if (validPermissions.length !== permissions.length) {
          throw new Error('Some permissions are invalid');
        }

        // Eliminar permisos existentes
        await prisma.serverRolePermission.deleteMany({
          where: { roleId }
        });

        // Crear nuevos permisos
        if (validPermissions.length > 0) {
          await prisma.serverRolePermission.createMany({
            data: validPermissions.map(permission => ({
              roleId,
              value: permission
            }))
          });
        }

        return validPermissions;
      } catch (error) {
        throw new Error(`Error assigning permissions to role: ${error.message}`);
      }
    },

    // Crear rol con permisos por defecto
    createRoleWithPermissions: async (serverId, name, permissions = [], color = null) => {
      try {
        const role = await prisma.serverRole.create({
          data: {
            name,
            serverId,
            color
          }
        });

        if (permissions.length > 0) {
          await this.assignPermissionsToRole(role.id, permissions);
        }

        return role;
      } catch (error) {
        throw new Error(`Error creating role with permissions: ${error.message}`);
      }
    },

    // Verificar permisos jerárquicos (un usuario no puede editar roles superiores)
    canManageRole: async (userId, serverId, targetRoleId) => {
      try {
        // El owner puede gestionar cualquier rol
        const server = await prisma.server.findUnique({
          where: { id: serverId },
          select: { ownerId: true }
        });

        if (server?.ownerId === userId) {
          return true;
        }

        // Verificar si tiene permiso MANAGE_ROLES
        const hasManageRoles = await this.hasPermission(userId, serverId, PERMISSIONS.MANAGE_ROLES);
        if (!hasManageRoles) {
          return false;
        }

        // Obtener el rol más alto del usuario
        const userMember = await prisma.serverMember.findUnique({
          where: {
            userId_serverId: {
              userId,
              serverId
            }
          },
          include: {
            role: true
          }
        });

        // Obtener el rol objetivo
        const targetRole = await prisma.serverRole.findUnique({
          where: { id: targetRoleId }
        });

        if (!userMember?.role || !targetRole) {
          return false;
        }

        // Comparar fechas de creación (roles más antiguos tienen mayor jerarquía)
        return userMember.role.createdAt < targetRole.createdAt;
      } catch (error) {
        throw new Error(`Error checking role management permission: ${error.message}`);
      }
    },

    // Obtener todos los permisos disponibles con sus categorías
    getAllPermissions: () => {
      return {
        permissions: PERMISSIONS,
        categories: PERMISSION_CATEGORIES,
        descriptions: PERMISSION_DESCRIPTIONS
      };
    }
  };
};