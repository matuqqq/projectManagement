import express from 'express';
import usersController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', usersController.registerUser);
router.post('/login', usersController.loginUser);
router.get('/:id', usersController.getUserById);

export default router;