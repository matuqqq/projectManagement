import { Router } from 'express';
import serversController from '../controllers/servers.controller.js';

const router = Router();

// GET /servers - Get all servers
router.get('/', serversController.getAllServers);

// GET /servers/:id - Get server by ID
router.get('/:id', serversController.getServerById);

// POST /servers/:userId - Create new server
router.post('/:userId', serversController.createServer);

// PUT /servers/:id - Update server
router.put('/:id', serversController.updateServer);

// DELETE /servers/:id - Delete server
router.delete('/:id', serversController.deleteServer);

export default router;
