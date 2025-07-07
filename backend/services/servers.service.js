import { prisma } from '../prisma/prisma.provider.js';

export default () => {
    return {
        getAllServers: async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            try {
                const servers = await prisma.server.findMany({
                    skip: skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        _count: {
                            select: {
                                channels: true,
                                members: true
                            }
                        }
                    }
                });

                const totalServers = await prisma.server.count();

                return res.status(200).json({
                    data: servers,
                    pagination: {
                        total: totalServers,
                        page: page,
                        limit: limit,
                        totalPages: Math.ceil(totalServers / limit)
                    }
                });
            } catch (error) {
                return res.status(500).json({
                    error: 'Error fetching servers',
                    details: error.message
                });
            }
        },

        getServerById: async (req, res) => {
            const { id } = req.params;

            try {
                const server = await prisma.server.findUnique({
                    where: {
                        id: id
                    },
                    include: {
                        channels: {
                            orderBy: {
                                createdAt: 'asc'
                            }
                        },
                        _count: {
                            select: {
                                channels: true,
                                members: true
                            }
                        }
                    }
                });

                if (!server) {
                    return res.status(404).json({
                        error: 'Server not found'
                    });
                }

                return res.status(200).json(server);
            } catch (error) {
                return res.status(500).json({
                    error: 'Error fetching server',
                    details: error.message
                });
            }
        },

        createServer: async (req, res) => {
            const { name, description, icon, isPublic } = req.body;
            const { userId } = req.params;

            if (!name) {
                return res.status(400).json({
                    error: 'Server name is required'
                });
            }

            try {
                const newServer = await prisma.server.create({
                    data: {
                        name,
                        description,
                        icon,
                        isPublic: isPublic || false,
                        ownerId: userId
                    }
                });

                return res.status(201).json(newServer);
            } catch (error) {
                return res.status(500).json({
                    error: 'Error creating server',
                    details: error.message
                });
            }
        },

        updateServer: async (req, res) => {
            const { id } = req.params;
            const { userId } = req.query;
            const { name, description, icon, isPublic } = req.body;

            if (!id || !userId) {
                return res.status(400).json({
                    error: 'Server ID and User ID are required'
                });
            }

            try {
                const server = await prisma.server.findUnique({
                    where: { id },
                    select: {
                        ownerId: true
                    }
                });

                if (!server) {
                    return res.status(404).json({ error: 'Server not found' });
                }

                if (server.ownerId !== userId) {
                    return res.status(403).json({
                        error: 'You do not have permission to update this server'
                    });
                }

                const updatedServer = await prisma.server.update({
                    where: { id },
                    data: { name, description, icon, isPublic }
                });

                return res.status(200).json(updatedServer);
            } catch (error) {
                return res.status(500).json({
                    error: 'Error updating server',
                    details: error.message
                });
            }
        },

        deleteServer: async (req, res) => {
            const { id } = req.params;
            const { userId } = req.query;

            if (!id || !userId) {
                return res.status(400).json({
                    error: 'Server ID and User ID are required'
                });
            }

            try {
                const server = await prisma.server.findUnique({
                    where: { id },
                    select: {
                        ownerId: true
                    }
                });

                if (!server) {
                    return res.status(404).json({ error: 'Server not found' });
                }

                if (server.ownerId !== userId) {
                    return res.status(403).json({
                        error: 'You do not have permission to delete this server'
                    });
                }

                // Delete all channels and their messages first
                await prisma.message.deleteMany({
                    where: {
                        channel: {
                            serverId: id
                        }
                    }
                });

                await prisma.channel.deleteMany({
                    where: {
                        serverId: id
                    }
                });

                // Delete server members
                await prisma.serverMember.deleteMany({
                    where: {
                        serverId: id
                    }
                });

                // Delete the server
                await prisma.server.delete({
                    where: { id }
                });

                return res.status(200).json({
                    message: 'Server deleted successfully'
                });
            } catch (error) {
                return res.status(500).json({
                    error: 'Error deleting server',
                    details: error.message
                });
            }
        }
    }
};
