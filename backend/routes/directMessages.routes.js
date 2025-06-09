import express from 'express';
import directMessagesController from '../controllers/directMessages.controller.js';

const router = express.Router();

router.get('/:userId1/:userId2', directMessagesController.getMessages);
router.post('/', directMessagesController.createMessage);

export default router;