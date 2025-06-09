const express = require('express');
const router = express.Router();
const miembrosController = require('./controllers/members.controller');

// Ruta para obtener todos los miembros
router.get('/', miembrosController.obtenerMiembros);

// Ruta para crear un nuevo miembro
router.post('/', miembrosController.crearMiembro);

module.exports = router;

//sss