import express from 'express';
import messagesController from '../controllers/message.controller.js';

const router = express.Router();

router.get('/', messagesController.getAllMessages); // GET /api/messages?channelId=<channelId>
router.post('/:userId', messagesController.createMessage); // POST /api/messages/:userId
router.put('/:messageId/:userId', messagesController.updateMessage); // PUT /api/messages/:messageId/:userId
router.delete('/:messageId/:userId', messagesController.deleteMessage); // DELETE /api/messages/:messageId/:userId


export default router;