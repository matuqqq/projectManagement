import rolesService from '../services/roles.service.js';

const getAllRoles = async (req, res, next) => {
  try {
    await rolesService().getAllRoles(req, res);
  } catch (error) {
    next(error);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    await rolesService().getRoleById(req, res);
  } catch (error) {
    next(error);
  }
};

const createRole = async (req, res, next) => {
  try {
    await rolesService().createRole(req, res);
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    await rolesService().updateRole(req, res);
  } catch (error) {
    next(error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    await rolesService().deleteRole(req, res);
  } catch (error) {
    next(error);
  }
};

const getRolePermissions = async (req, res, next) => {
  try {
    await rolesService().getRolePermissions(req, res);
  } catch (error) {
    next(error);
  }
};

const updateRolePermissions = async (req, res, next) => {
  try {
    await rolesService().updateRolePermissions(req, res);
  } catch (error) {
    next(error);
  }
};

const getAllPermissions = async (req, res, next) => {
  try {
    await rolesService().getAllPermissions(req, res);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions,
  getAllPermissions
};