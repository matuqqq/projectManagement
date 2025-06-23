import { prisma } from '../prisma/prisma.provider.js';

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
            const { userId } = req.params;

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
                                    {
                                        role: {
                                            permissions: {
                                                hasSome: ['MANAGE_CHANNELS', 'CREATE_CHANNEL']
                                            }
                                        }
                                    },
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
        },
        updateChanel: async (req, res) => {
            const { id, userId } = req.query;
            const { name, description, isPrivate } = req.body;

            if (!id || !userId) {
                return res.status(400).json({
                    error: 'Channel ID and User ID are required'
                });
            }

            try {
                const channel = await prisma.channel.findUnique({
                    where: { id },
                    include: {
                        server: {
                            select: {
                                ownerId: true,
                                id: true
                            }
                        }
                    }
                });

                if (!channel) {
                    return res.status(404).json({ error: 'Channel not found' });
                }

                const isOwner = channel.server.ownerId === userId;

                let hasPermissions = isOwner;
                if (!isOwner) {
                    const memberWithPermissions = await prisma.serverMember.findFirst({
                        where: {
                            userId: userId,
                            serverId: channel.server.id,
                            role: {
                                permissions: {
                                    hasSome: ['MANAGE_CHANNELS', 'CREATE_CHANNEL']
                                }
                            }
                        }
                    });
                    hasPermissions = !!memberWithPermissions;
                }

                if (!hasPermissions) {
                    return res.status(403).json({
                        error: 'You do not have permission to update this channel'
                    });
                }

                const updatedChannel = await prisma.channel.update({
                    where: { id },
                    data: { name, description, isPrivate }
                });

                return res.status(200).json(updatedChannel);
            } catch (error) {
                return res.status(500).json({
                    error: 'Error updating channel',
                    details: error.message
                });
            }
        },
        deleteChannel: async (req, res) => {
            const { id } = req.params;
            const { userId } = req.query;

            if (!id || !userId) {
                return res.status(400).json({
                    error: 'Channel ID and User ID are required'
                });
            }

            try {
                const channel = await prisma.channel.findUnique({
                    where: { id },
                    include: {
                        server: {
                            select: {
                                ownerId: true,
                                id: true
                            }
                        },
                        messages: {
                            select: {
                                id: true
                            }
                        }
                    }
                });

                if (!channel) {
                    return res.status(404).json({ error: 'Channel not found' });
                }

                const isOwner = channel.server.ownerId === userId;


                let hasPermissions = isOwner;
                if (!isOwner) {
                    const memberWithPermissions = await prisma.serverMember.findFirst({
                        where: {
                            userId: userId,
                            serverId: channel.server.id,
                            role: {
                                permissions: {
                                    hasSome: ['MANAGE_CHANNELS', 'DELETE_CHANNEL']
                            }
                        }
                    });
                    hasPermissions = !!memberWithPermissions;
                }

                if (!hasPermissions) {
                    return res.status(403).json({
                        error: 'You do not have permission to delete this channel'
                    });
                }

                if (channel.messages.length > 0) {
                    await prisma.message.deleteMany({
                        where: {
                            channelId: id
                        }
                    });
                }

                await prisma.channel.delete({
                    where: { id }
                });

                return res.status(200).json({
                    message: 'Channel deleted successfully'
                });
            } catch (error) {
                return res.status(500).json({
                    error: 'Error deleting channel',
                    details: error.message
                });
            }
        }
    }
};
