import { prisma } from '../prisma/prisma.provider.js';
import permissionsService from './permissions.service.js';
import { PERMISSIONS } from '../constants/permissions.constants.js';

const permissions = permissionsService();

export default () => {
  return {
    getAllRoles: async (req, res) => {
      const { serverId } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (!serverId) {
        return res.status(400).json({
          error: 'Server ID is required'
        });
      }

      try {
        const roles = await prisma.serverRole.findMany({
          where: { serverId },
          skip,
          take: limit,
          orderBy: { createdAt: 'asc' }, // Roles más antiguos primero (mayor jerarquía)
          include: {
            ServerRolePermission: {
              select: { value: true }
            },
            members: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        });

        const totalRoles = await prisma.serverRole.count({
          where: { serverId }
        });

        const rolesWithPermissions = roles.map(role => ({
          ...role,
          permissions: role.ServerRolePermission.map(p => p.value),
          memberCount: role.members.length,
          ServerRolePermission: undefined // Remove from response
        }));

        return res.status(200).json({
          data: rolesWithPermissions,
          pagination: {
            total: totalRoles,
            page,
            limit,
            totalPages: Math.ceil(totalRoles / limit)
          }
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Error fetching roles',
          details: error.message
        });
      }
    },

    getRoleById: async (req, res) => {
      const { id } = req.params;

      try {
        const role = await prisma.serverRole.findUnique({
          where: { id },
          include: {
            ServerRolePermission: {
              select: { value: true }
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    email: true
                  }
                }
              }
            },
            server: {
              select: {
                id: true,
                name: true,
                ownerId: true
              }
            }
          }
        });

        if (!role) {
          return res.status(404).json({
            error: 'Role not found'
          });
        }

        const roleWithPermissions = {
          ...role,
          permissions: role.ServerRolePermission.map(p => p.value),
          ServerRolePermission: undefined
        };

        return res.status(200).json(roleWithPermissions);
      } catch (error) {
        return res.status(500).json({
          error: 'Error fetching role',
          details: error.message
        });
      }
    },

    createRole: async (req, res) => {
      const { name, color, permissions: rolePermissions = [], serverId } = req.body;

      if (!name || !serverId) {
        return res.status(400).json({
          error: 'Name and server ID are required'
        });
      }

      try {
        // Verificar que el servidor existe
        const server = await prisma.server.findUnique({
          where: { id: serverId }
        });

        if (!server) {
          return res.status(404).json({
            error: 'Server not found'
          });
        }

        // Crear el rol con permisos
        const newRole = await permissions.createRoleWithPermissions(
          serverId,
          name,
          rolePermissions,
          color
        );

        // Obtener el rol completo con permisos
        const roleWithPermissions = await prisma.serverRole.findUnique({
          where: { id: newRole.id },
          include: {
            ServerRolePermission: {
              select: { value: true }
            }
          }
        });

        return res.status(201).json({
          ...roleWithPermissions,
          permissions: roleWithPermissions.ServerRolePermission.map(p => p.value),
          ServerRolePermission: undefined
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Error creating role',
          details: error.message
        });
      }
    },

    updateRole: async (req, res) => {
      const { id } = req.params;
      const { name, color } = req.body;

      try {
        const role = await prisma.serverRole.findUnique({
          where: { id }
        });

        if (!role) {
          return res.status(404).json({
            error: 'Role not found'
          });
        }

        const updatedRole = await prisma.serverRole.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(color !== undefined && { color })
          },
          include: {
            ServerRolePermission: {
              select: { value: true }
            }
          }
        });

        return res.status(200).json({
          ...updatedRole,
          permissions: updatedRole.ServerRolePermission.map(p => p.value),
          ServerRolePermission: undefined
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Error updating role',
          details: error.message
        });
      }
    },

    deleteRole: async (req, res) => {
      const { id } = req.params;

      try {
        const role = await prisma.serverRole.findUnique({
          where: { id },
          include: {
            members: true
          }
        });

        if (!role) {
          return res.status(404).json({
            error: 'Role not found'
          });
        }

        // No permitir eliminar el rol @everyone
        if (role.name === '@everyone') {
          return res.status(400).json({
            error: 'Cannot delete @everyone role'
          });
        }

        // Eliminar asignaciones de miembros primero
        if (role.members.length > 0) {
          await prisma.serverMember.updateMany({
            where: { roleId: id },
            data: { roleId: null }
          });
        }

        // Eliminar permisos del rol
        await prisma.serverRolePermission.deleteMany({
          where: { roleId: id }
        });

        // Eliminar el rol
        await prisma.serverRole.delete({
          where: { id }
        });

        return res.status(200).json({
          message: 'Role deleted successfully'
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Error deleting role',
          details: error.message
        });
      }
    },

    getRolePermissions: async (req, res) => {
      const { id } = req.params;

      try {
        const rolePermissions = await permissions.getRolePermissions(id);
        
        return res.status(200).json({
          roleId: id,
          permissions: rolePermissions
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Error fetching role permissions',
          details: error.message
        });
      }
    },

    updateRolePermissions: async (req, res) => {
      const { id } = req.params;
      const { permissions: newPermissions } = req.body;

      if (!Array.isArray(newPermissions)) {
        return res.status(400).json({
          error: 'Permissions must be an array'
        });
      }

      try {
        const role = await prisma.serverRole.findUnique({
          where: { id }
        });

        if (!role) {
          return res.status(404).json({
            error: 'Role not found'
          });
        }

        const updatedPermissions = await permissions.assignPermissionsToRole(id, newPermissions);

        return res.status(200).json({
          roleId: id,
          permissions: updatedPermissions,
          message: 'Permissions updated successfully'
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Error updating role permissions',
          details: error.message
        });
      }
    },

    getAllPermissions: async (req, res) => {
      try {
        const allPermissions = permissions.getAllPermissions();
        return res.status(200).json(allPermissions);
      } catch (error) {
        return res.status(500).json({
          error: 'Error fetching permissions',
          details: error.message
        });
      }
    }
  };
};