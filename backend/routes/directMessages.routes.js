import express from 'express';
import directMessagesController from '../controllers/directMessages.controller.js';

const router = express.Router();

// Obtener conversaciones del usuario
router.get('/conversations/:userId', directMessagesController.getUserConversations);
// Obtener mensajes entre dos usuarios
router.get('/:userId1/:userId2', directMessagesController.getMessages);
// Crear nuevo mensaje
router.post('/', directMessagesController.createMessage);
// Actualizar mensaje
router.put('/:id', directMessagesController.updateMessage);
// Eliminar mensaje
router.delete('/:id', directMessagesController.deleteMessage);
export default router;