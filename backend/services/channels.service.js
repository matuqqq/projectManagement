import {prisma} from '../prisma/prisma.provider.js';

export default () => {
    return {

        getAllChannels: async (req, res) => {
            const { serverId } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            if (!serverId) {
                return res.status(400).json({
                    error: 'Server ID is required'
                });
            }

            try {
                const channels = await prisma.channel.findMany({
                    where: {
                        serverId: serverId
                    },
                    skip: skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        server: {
                            select: {
                                name: true
                            }
                        }
                    }
                });

                const totalChannels = await prisma.channel.count({
                    where: {
                        serverId: serverId
                    }
                });

                return res.status(200).json({
                    data: channels,
                    pagination: {
                        total: totalChannels,
                        page: page,
                        limit: limit,
                        totalPages: Math.ceil(totalChannels / limit)
                    }
                });
            } catch (error) {
                return res.status(500).json({
                    error: 'Error fetching channels',
                    details: error.message
                });
            }
        },

        getChannelById: async (req, res) => {
            const { id } = req.params;

            try {
                const channel = await prisma.channel.findUnique({
                    where: {
                        id: id
                    },
                    include: {
                        server: {
                            select: {
                                name: true,
                                id: true
                            }
                        },
                        admins: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                });

                if (!channel) {
                    return res.status(404).json({
                        error: 'Channel not found'
                    });
                }

                return res.status(200).json(channel);
            } catch (error) {
                return res.status(500).json({
                    error: 'Error fetching channel',
                    details: error.message
                });
            }
        },

        createChannel: async (req, res) => {
            const { name, description, serverId, isPrivate } = req.body;
            const userId = req.user?.id;

            if (!name || !serverId) {
                return res.status(400).json({
                    error: 'Name and server ID are required'
                });
            }

            try {
                const server = await prisma.server.findUnique({
                    where: {
                        id: serverId
                    },
                    include: {
                        members: {
                            where: {
                                userId: userId,
                                OR: [
                                    { role: { permissions: { has: 'CREATE_CHANNEL' } } },
                                    { server: { ownerId: userId } }
                                ]
                            }
                        }
                    }
                });

                if (!server) {
                    return res.status(404).json({
                        error: 'Server not found'
                    });
                }

                if (server.ownerId !== userId && server.members.length === 0) {
                    return res.status(403).json({
                        error: 'You do not have permission to create channels in this server'
                    });
                }

                const newChannel = await prisma.channel.create({
                    data: {
                        name,
                        description,
                        serverId,
                        isPrivate: isPrivate || false
                    }
                });

                return res.status(201).json(newChannel);
            } catch (error) {
                return res.status(500).json({
                    error: 'Error creating channel',
                    details: error.message
                });
            }
        }
    };
};