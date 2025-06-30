import express from 'express';
import usersController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', usersController.registerUser);
router.post('/login', usersController.loginUser);
router.delete('/delete/:id', usersController.deleteUser);
router.get('/profile/:id', usersController.getUserProfile);
router.put('/update/:id', usersController.updateUser);

export default router;