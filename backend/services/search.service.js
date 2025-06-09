import { prisma } from '../prisma/prisma.provider.js';

export default () => {
    return {
        // Main search function for messages across all accessible channels
        searchMessages: async (req, res) => {
            const { 
                query, 
                userId, 
                authorId, 
                channelId, 
                serverId, 
                hasAttachments, 
                dateFrom, 
                dateTo,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;
            
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 25, 100); // Max 100 results per page
            const skip = (page - 1) * limit;

            if (!query || query.trim().length < 2) {
                return res.status(400).json({
                    error: 'Search query must be at least 2 characters long'
                });
            }

            if (!userId) {
                return res.status(400).json({
                    error: 'User ID is required for search'
                });
            }

            try {
                // Build search conditions
                const searchConditions = {
                    AND: [
                        {
                            content: {
                                contains: query.trim(),
                                mode: 'insensitive'
                            }
                        }
                    ]
                };

                // Add optional filters
                if (authorId) {
                    searchConditions.AND.push({ authorId });
                }

                if (channelId) {
                    searchConditions.AND.push({ channelId });
                }

                if (serverId) {
                    searchConditions.AND.push({
                        channel: {
                            serverId
                        }
                    });
                }

                if (hasAttachments === 'true') {
                    searchConditions.AND.push({
                        attachments: {
                            isEmpty: false
                        }
                    });
                } else if (hasAttachments === 'false') {
                    searchConditions.AND.push({
                        attachments: {
                            isEmpty: true
                        }
                    });
                }

                if (dateFrom) {
                    searchConditions.AND.push({
                        createdAt: {
                            gte: new Date(dateFrom)
                        }
                    });
                }

                if (dateTo) {
                    searchConditions.AND.push({
                        createdAt: {
                            lte: new Date(dateTo)
                        }
                    });
                }

                // Get user's accessible servers to filter results
                const userServers = await prisma.serverMember.findMany({
                    where: { userId },
                    select: { serverId: true }
                });

                const accessibleServerIds = userServers.map(member => member.serverId);

                // Add server access filter
                if (!serverId) {
                    searchConditions.AND.push({
                        channel: {
                            serverId: {
                                in: accessibleServerIds
                            }
                        }
                    });
                }

                // Execute search
                const messages = await prisma.message.findMany({
                    where: searchConditions,
                    skip,
                    take: limit,
                    orderBy: {
                        [sortBy]: sortOrder
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        },
                        channel: {
                            select: {
                                id: true,
                                name: true,
                                serverId: true,
                                server: {
                                    select: {
                                        id: true,
                                        name: true,
                                        icon: true
                                    }
                                }
                            }
                        }
                    }
                });
 
                // Get total count for pagination
                const totalMessages = await prisma.message.count({
                    where: searchConditions
                });

                // Highlight search terms in results
                const highlightedMessages = messages.map(message => ({
                    ...message,
                    content: this.highlightSearchTerm(message.content, query.trim())
                }));

                return res.status(200).json({
                    data: highlightedMessages,
                    pagination: {
                        total: totalMessages,
                        page,
                        limit,
                        totalPages: Math.ceil(totalMessages / limit)
                    },
                    searchQuery: query.trim(),
                    filters: {
                        authorId,
                        channelId,
                        serverId,
                        hasAttachments,
                        dateFrom,
                        dateTo
                    }
                });

            } catch (error) {
                return res.status(500).json({
                    error: 'Error performing search',
                    details: error.message
                });
            }
        },

        // Search within a specific channel
        searchInChannel: async (req, res) => {
            const { channelId } = req.params;
            const { query, userId, authorId, hasAttachments, dateFrom, dateTo } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 25, 100);
            const skip = (page - 1) * limit;

            if (!query || query.trim().length < 2) {
                return res.status(400).json({
                    error: 'Search query must be at least 2 characters long'
                });
            }

            if (!userId) {
                return res.status(400).json({
                    error: 'User ID is required'
                });
            }

            try {
                // Check if user has access to the channel
                const channel = await prisma.channel.findUnique({
                    where: { id: channelId },
                    include: {
                        server: {
                            include: {
                                members: {
                                    where: { userId }
                                }
                            }
                        }
                    }
                });

                if (!channel) {
                    return res.status(404).json({
                        error: 'Channel not found'
                    });
                }

                if (channel.server.members.length === 0) {
                    return res.status(403).json({
                        error: 'You do not have access to this channel'
                    });
                }

                // Build search conditions
                const searchConditions = {
                    AND: [
                        { channelId },
                        {
                            content: {
                                contains: query.trim(),
                                mode: 'insensitive'
                            }
                        }
                    ]
                };

                // Add optional filters
                if (authorId) {
                    searchConditions.AND.push({ authorId });
                }

                if (hasAttachments === 'true') {
                    searchConditions.AND.push({
                        attachments: { isEmpty: false }
                    });
                } else if (hasAttachments === 'false') {
                    searchConditions.AND.push({
                        attachments: { isEmpty: true }
                    });
                }

                if (dateFrom) {
                    searchConditions.AND.push({
                        createdAt: { gte: new Date(dateFrom) }
                    });
                }

                if (dateTo) {
                    searchConditions.AND.push({
                        createdAt: { lte: new Date(dateTo) }
                    });
                }

                const messages = await prisma.message.findMany({
                    where: searchConditions,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                });

                const totalMessages = await prisma.message.count({
                    where: searchConditions
                });

                const highlightedMessages = messages.map(message => ({
                    ...message,
                    content: this.highlightSearchTerm(message.content, query.trim())
                }));

                return res.status(200).json({
                    data: highlightedMessages,
                    pagination: {
                        total: totalMessages,
                        page,
                        limit,
                        totalPages: Math.ceil(totalMessages / limit)
                    },
                    channel: {
                        id: channel.id,
                        name: channel.name,
                        server: {
                            id: channel.server.id,
                            name: channel.server.name
                        }
                    },
                    searchQuery: query.trim()
                });

            } catch (error) {
                return res.status(500).json({
                    error: 'Error searching in channel',
                    details: error.message
                });
            }
        },

        // Search within a specific server
        searchInServer: async (req, res) => {
            const { serverId } = req.params;
            const { query, userId, authorId, channelId, hasAttachments, dateFrom, dateTo } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 25, 100);
            const skip = (page - 1) * limit;

            if (!query || query.trim().length < 2) {
                return res.status(400).json({
                    error: 'Search query must be at least 2 characters long'
                });
            }

            if (!userId) {
                return res.status(400).json({
                    error: 'User ID is required'
                });
            }

            try {
                // Check if user is a member of the server
                const serverMember = await prisma.serverMember.findUnique({
                    where: {
                        userId_serverId: {
                            userId,
                            serverId
                        }
                    },
                    include: {
                        server: {
                            select: {
                                id: true,
                                name: true,
                                icon: true
                            }
                        }
                    }
                });

                if (!serverMember) {
                    return res.status(403).json({
                        error: 'You are not a member of this server'
                    });
                }

                // Build search conditions
                const searchConditions = {
                    AND: [
                        {
                            channel: {
                                serverId
                            }
                        },
                        {
                            content: {
                                contains: query.trim(),
                                mode: 'insensitive'
                            }
                        }
                    ]
                };

                // Add optional filters
                if (authorId) {
                    searchConditions.AND.push({ authorId });
                }

                if (channelId) {
                    searchConditions.AND.push({ channelId });
                }

                if (hasAttachments === 'true') {
                    searchConditions.AND.push({
                        attachments: { isEmpty: false }
                    });
                } else if (hasAttachments === 'false') {
                    searchConditions.AND.push({
                        attachments: { isEmpty: true }
                    });
                }

                if (dateFrom) {
                    searchConditions.AND.push({
                        createdAt: { gte: new Date(dateFrom) }
                    });
                }

                if (dateTo) {
                    searchConditions.AND.push({
                        createdAt: { lte: new Date(dateTo) }
                    });
                }

                const messages = await prisma.message.findMany({
                    where: searchConditions,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        },
                        channel: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                });

                const totalMessages = await prisma.message.count({
                    where: searchConditions
                });

                const highlightedMessages = messages.map(message => ({
                    ...message,
                    content: this.highlightSearchTerm(message.content, query.trim())
                }));

                return res.status(200).json({
                    data: highlightedMessages,
                    pagination: {
                        total: totalMessages,
                        page,
                        limit,
                        totalPages: Math.ceil(totalMessages / limit)
                    },
                    server: serverMember.server,
                    searchQuery: query.trim()
                });

            } catch (error) {
                return res.status(500).json({
                    error: 'Error searching in server',
                    details: error.message
                });
            }
        },

        // Search direct messages
        searchDirectMessages: async (req, res) => {
            const { query, userId, otherUserId, dateFrom, dateTo } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 25, 100);
            const skip = (page - 1) * limit;

            if (!query || query.trim().length < 2) {
                return res.status(400).json({
                    error: 'Search query must be at least 2 characters long'
                });
            }

            if (!userId) {
                return res.status(400).json({
                    error: 'User ID is required'
                });
            }

            try {
                // Build search conditions
                const searchConditions = {
                    AND: [
                        {
                            OR: [
                                { senderId: userId },
                                { receiverId: userId }
                            ]
                        },
                        {
                            content: {
                                contains: query.trim(),
                                mode: 'insensitive'
                            }
                        }
                    ]
                };

                // Filter by specific conversation
                if (otherUserId) {
                    searchConditions.AND.push({
                        OR: [
                            { senderId: otherUserId, receiverId: userId },
                            { senderId: userId, receiverId: otherUserId }
                        ]
                    });
                }

                if (dateFrom) {
                    searchConditions.AND.push({
                        createdAt: { gte: new Date(dateFrom) }
                    });
                }

                if (dateTo) {
                    searchConditions.AND.push({
                        createdAt: { lte: new Date(dateTo) }
                    });
                }

                const directMessages = await prisma.directMessage.findMany({
                    where: searchConditions,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        },
                        receiver: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                });

                const totalMessages = await prisma.directMessage.count({
                    where: searchConditions
                });

                const highlightedMessages = directMessages.map(message => ({
                    ...message,
                    content: this.highlightSearchTerm(message.content, query.trim())
                }));

                return res.status(200).json({
                    data: highlightedMessages,
                    pagination: {
                        total: totalMessages,
                        page,
                        limit,
                        totalPages: Math.ceil(totalMessages / limit)
                    },
                    searchQuery: query.trim()
                });

            } catch (error) {
                return res.status(500).json({
                    error: 'Error searching direct messages',
                    details: error.message
                });
            }
        },

        // Get search suggestions based on recent searches or popular terms
        getSearchSuggestions: async (req, res) => {
            const { userId, query } = req.query;

            if (!userId) {
                return res.status(400).json({
                    error: 'User ID is required'
                });
            }

            try {
                const suggestions = [];

                // If query is provided, get suggestions based on partial match
                if (query && query.length >= 1) {
                    // Get recent messages that contain the query
                    const recentMessages = await prisma.message.findMany({
                        where: {
                            content: {
                                contains: query,
                                mode: 'insensitive'
                            },
                            channel: {
                                server: {
                                    members: {
                                        some: {
                                            userId
                                        }
                                    }
                                }
                            }
                        },
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            content: true,
                            author: {
                                select: {
                                    username: true
                                }
                            }
                        }
                    });

                    // Extract unique words/phrases
                    const words = new Set();
                    recentMessages.forEach(message => {
                        const messageWords = message.content.toLowerCase().split(/\s+/);
                        messageWords.forEach(word => {
                            if (word.includes(query.toLowerCase()) && word.length > 2) {
                                words.add(word);
                            }
                        });
                    });

                    suggestions.push(...Array.from(words).slice(0, 5));
                }

                // Get popular search terms (you could implement a search history table for this)
                const popularTerms = [
                    'announcement',
                    'meeting',
                    'update',
                    'help',
                    'question'
                ];

                return res.status(200).json({
                    suggestions: [...suggestions, ...popularTerms].slice(0, 10)
                });

            } catch (error) {
                return res.status(500).json({
                    error: 'Error getting search suggestions',
                    details: error.message
                });
            }
        },

        // Helper function to highlight search terms
        highlightSearchTerm: (content, searchTerm) => {
            if (!searchTerm || !content) return content;
            
            const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return content.replace(regex, '<mark>$1</mark>');
        }
    };
};