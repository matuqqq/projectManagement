import express from 'express';
import rolesController from '../controllers/roles.controller.js';
import { requirePermission, requireRoleManagement, attachUserPermissions } from '../middleware/permissions.middleware.js';
import { PERMISSIONS } from '../constants/permissions.constants.js';

const router = express.Router();

// Obtener todos los roles de un servidor
router.get('/', attachUserPermissions, rolesController.getAllRoles);

// Obtener un rol específico
router.get('/:id', attachUserPermissions, rolesController.getRoleById);

// Crear un nuevo rol
router.post('/', requirePermission(PERMISSIONS.MANAGE_ROLES), rolesController.createRole);

// Actualizar un rol (nombre, color)
router.put('/:id', requireRoleManagement(), rolesController.updateRole);

// Eliminar un rol
router.delete('/:id', requireRoleManagement(), rolesController.deleteRole);

// Obtener permisos de un rol
router.get('/:id/permissions', attachUserPermissions, rolesController.getRolePermissions);

// Actualizar permisos de un rol
router.put('/:id/permissions', requireRoleManagement(), rolesController.updateRolePermissions);

// Obtener todos los permisos disponibles
router.get('/system/permissions', rolesController.getAllPermissions);

export default router;