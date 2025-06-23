const express = require('express');
const router = express.Router();
const membersController = require('./members.controller');

// Ruta para obtener todos los miembros
router.get('/', membersController.obtenerMiembros);

// Ruta para crear un nuevo miembro
router.post('/', membersController.crearMiembro);

module.exports = router;