import express from 'express';
import channelsController from '../controllers/channels.controller.js';

const router = express.Router();

router.get('/channels', channelsController.getAllChannels);
router.get('/channels/:id', channelsController.getChannelById);
router.post('/channels', channelsController.createChannel);

export default router;