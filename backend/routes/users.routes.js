import express from 'express';
import usersController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', usersController.registerUser);
router.post('/login', usersController.loginUser);
router.delete('/delete', usersController.deleteUser);
router.get('/profile', usersController.getUserProfile);
router.put('/update', usersController.updateUser);

export default router;