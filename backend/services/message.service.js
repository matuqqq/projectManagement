import {prisma} from '../prisma/prisma.provider.js';

export default () => {
    return {

        getAllMessages: async (req, res) => {
            const { channelId } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            if (!channelId) {
                return res.status(400).json({
                    error: 'Channel ID is required'
                });
            }

            try {
                const mesagges = await prisma.messages.findMany({
                    where: {
                        channelId: channelId
                    },
                    skip: skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        channel: {
                            select: {
                                name: true
                            }
                        }
                    }
                });

                const totalMessages = await prisma.channel.count({
                    where: {
                        channeld: channelId
                    }
                });

                return res.status(200).json({
                    data: messages,
                    pagination: {
                        total: totalMessages,
                        page: page,
                        limit: limit,
                        totalPages: Math.ceil(totalMessages / limit)
                    }
                });
            } catch (error) {
                return res.status(500).json({
                    error: 'Error fetching messages',
                    details: error.message
                });
            }
        },

        createMessages: async (req, res) => {
            const {channelId, message } = req.body;
            const {userId} = req.params;

            if (!channelId || !message) {
                return res.status(400).json({
                    error: 'channel ID are required'
                });
            }

            try {
                const server = await prisma.channel.findUnique({
                    where: {
                        id: channelId
                    },
                    include: {
                        members: {
                            where: {
                                userId: userId,
                                OR: [
                                    { role: { permissions: { has: 'CREATE_MESSAGE' } } },
                                ]
                            }
                        }
                    }
                });

                if (!channel) {
                    return res.status(404).json({
                        error: 'Channel not found'
                    });
                }

                if (server.ownerId !== userId && server.members.length === 0) {
                    return res.status(403).json({
                        error: 'You do not have permission to create messages in this server'
                    });
                }

                const newMessage = await prisma.channel.create({
                    data: {
                        userId : userId,
                        channelId: channelId,
                        message: message
                }
                });

                return res.status(201).json(newMessage);
            } catch (error) {
                return res.status(500).json({
                    error: 'Error creating message',
                    details: error.message
                });
            }
        }
    };
};