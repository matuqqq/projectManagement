import express from 'express';
import searchController from '../controllers/search.controller.js';

const router = express.Router();

// Main search endpoint - searches across all accessible messages
router.get('/', searchController.searchMessages);

// Search within a specific channel
router.get('/channel/:channelId', searchController.searchInChannel);

// Search within a specific server
router.get('/server/:serverId', searchController.searchInServer);

// Search direct messages
router.get('/direct-messages', searchController.searchDirectMessages);

// Get search suggestions
router.get('/suggestions', searchController.getSearchSuggestions);

export default router;