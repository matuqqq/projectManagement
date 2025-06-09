import express from 'express';
import channelsController from '../controllers/channels.controller.js';

const router = express.Router();

router.get('/', channelsController.getAllChannels);
router.get('/:id', channelsController.getChannelById);
router.post('/', channelsController.createChannel);

export default router;