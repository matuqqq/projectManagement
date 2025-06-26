import express from 'express';
import membersController from '../controllers/members.controller.js';

const router = express.Router();

router.get('/', membersController.obtenerMiembros);

router.post('/', membersController.crearMiembro);

export default router;