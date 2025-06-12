// messages.service.js
import { PrismaClient } from '@prisma/client'; // Assuming PrismaClient is set up correctly
const prisma = new PrismaClient(); // Initialize PrismaClient

export default () => {
    return {
        /**
         * Fetches all messages for a given channel with pagination.
         * @param {object} req - The request object.
         * @param {object} res - The response object.
         */
        getAllMessages: async (req, res) => {
            const { channelId } = req.query; // Get channelId from query parameters
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const limit = parseInt(req.query.limit) || 10; // Default to 10 messages per page
            const skip = (page - 1) * limit; // Calculate number of records to skip

            // Validate channelId
            if (!channelId) {
                return res.status(400).json({
                    error: 'Channel ID is required'
                });
            }

            try {
                // Fetch messages from the database
                const messages = await prisma.message.findMany({ // Corrected from prisma.messages to prisma.message
                    where: {
                        channelId: channelId // Filter by channelId
                    },
                    skip: skip, // For pagination: skip records
                    take: limit, // For pagination: take records
                    orderBy: {
                        createdAt: 'desc' // Order messages by creation date, newest first
                    },
                    include: {
                        // Optionally include channel name if needed, assuming a relation exists
                        channel: {
                            select: {
                                name: true
                            }
                        },
                        // Assuming Message has a relation to a User model via 'authorId' and 'author' field
                        author: {
                            select: {
                                id: true,
                                username: true // Select author's ID and username (as per schema.prisma)
                            }
                        }
                    }
                });

                // Get the total count of messages for the channel
                const totalMessages = await prisma.message.count({ // Corrected from prisma.messages to prisma.message
                    where: {
                        channelId: channelId
                    }
                });

                // Return messages and pagination info
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
                // Handle any errors during database operation
                console.error("Error fetching messages:", error);
                return res.status(500).json({
                    error: 'Error fetching messages',
                    details: error.message
                });
            }
        },

        /**
         * Creates a new message in a channel.
         * @param {object} req - The request object.
         * @param {object} res - The response object.
         */
        createMessage: async (req, res) => {
            const { channelId, message } = req.body; // Get channelId and message content from request body
            const { userId } = req.params; // Get userId from request parameters (e.g., from auth middleware)

            // Validate required fields
            if (!channelId || !message || !userId) {
                return res.status(400).json({
                    error: 'Channel ID, message content, and User ID are required'
                });
            }

            try {
                // Find the channel to ensure it exists and get its serverId
                const channel = await prisma.channel.findUnique({
                    where: { id: channelId },
                    select: {
                        serverId: true
                    }
                });

                if (!channel) {
                    return res.status(404).json({ error: 'Channel not found' });
                }

                // Check user's role and permissions within the server to which the channel belongs
                const serverMember = await prisma.serverMember.findUnique({
                    where: {
                        userId_serverId: { // Unique compound ID for ServerMember
                            userId: userId,
                            serverId: channel.serverId
                        }
                    },
                    include: {
                        role: {
                            select: {
                                permissions: true
                            }
                        }
                    }
                });

                let hasPermission = false;
                if (serverMember && serverMember.role && Array.isArray(serverMember.role.permissions)) {
                    // Check if 'CREATE_MESSAGE' permission exists in the role's permissions
                    if (serverMember.role.permissions.includes('CREATE_MESSAGE')) {
                        hasPermission = true;
                    }
                }

                // Additionally, check if the user is the owner of the server (they should always have permissions)
                const server = await prisma.server.findUnique({
                    where: { id: channel.serverId },
                    select: { ownerId: true }
                });

                if (server && server.ownerId === userId) {
                    hasPermission = true; // Server owner always has permission
                }

                if (!hasPermission) {
                    return res.status(403).json({
                        error: 'You do not have permission to create messages in this channel'
                    });
                }

                // Create the new message
                const newMessage = await prisma.message.create({ // Corrected from prisma.messages to prisma.message
                    data: {
                        authorId: userId, // Use 'authorId' as per schema.prisma
                        channelId: channelId,
                        content: message // Use 'content' as per schema.prisma
                    }
                });

                // Return the newly created message
                return res.status(201).json(newMessage);
            } catch (error) {
                // Handle errors during message creation
                console.error("Error creating message:", error);
                return res.status(500).json({
                    error: 'Error creating message',
                    details: error.message
                });
            }
        },

        /**
         * Updates an existing message. Only the author can update their message.
         * @param {object} req - The request object.
         * @param {object} res - The response object.
         */
        updateMessage: async (req, res) => {
            const { messageId } = req.params; // Get messageId from URL parameters
            const { message } = req.body; // Get new message content from request body
            const { userId } = req.params; // Get userId from request parameters (from auth middleware)

            // Validate required fields
            if (!messageId || !message || !userId) {
                return res.status(400).json({
                    error: 'Message ID, new message content, and User ID are required'
                });
            }

            try {
                // Find the message and check if the user is the author
                const existingMessage = await prisma.message.findUnique({ // Corrected from prisma.messages to prisma.message
                    where: { id: messageId }
                });

                // If message not found, return 404
                if (!existingMessage) {
                    return res.status(404).json({ error: 'Message not found' });
                }

                // Check if the current user is the author of the message
                if (existingMessage.authorId !== userId) { // Use 'authorId' as per schema.prisma
                    return res.status(403).json({ error: 'You do not have permission to edit this message' });
                }

                // Update the message
                const updatedMessage = await prisma.message.update({ // Corrected from prisma.messages to prisma.message
                    where: { id: messageId },
                    data: { content: message, edited: true, updatedAt: new Date() } // Update content, set edited to true and update timestamp
                });

                return res.status(200).json(updatedMessage);
            } catch (error) {
                // Handle errors during message update
                console.error("Error updating message:", error);
                return res.status(500).json({
                    error: 'Error updating message',
                    details: error.message
                });
            }
        },

        /**
         * Deletes an existing message. Only the author or a user with DELETE_MESSAGE permission can delete.
         * @param {object} req - The request object.
         * @param {object} res - The response object.
         */
        deleteMessage: async (req, res) => {
            const { messageId } = req.params; // Get messageId from URL parameters
            const { userId } = req.params; // Get userId from request parameters (from auth middleware)

            // Validate required fields
            if (!messageId || !userId) {
                return res.status(400).json({
                    error: 'Message ID and User ID are required'
                });
            }

            try {
                // Find the message and check if the user is the author or has delete permission
                const existingMessage = await prisma.message.findUnique({ // Corrected from prisma.messages to prisma.message
                    where: { id: messageId },
                    select: {
                        authorId: true,
                        channel: {
                            select: {
                                serverId: true
                            }
                        }
                    }
                });

                // If message not found, return 404
                if (!existingMessage) {
                    return res.status(404).json({ error: 'Message not found' });
                }

                let hasPermission = false;

                // Check if the current user is the author
                if (existingMessage.authorId === userId) {
                    hasPermission = true;
                } else {
                    // Check if the user has DELETE_MESSAGE permission within the server
                    const serverMember = await prisma.serverMember.findUnique({
                        where: {
                            userId_serverId: { // Unique compound ID for ServerMember
                                userId: userId,
                                serverId: existingMessage.channel.serverId
                            }
                        },
                        include: {
                            role: {
                                select: {
                                    permissions: true
                                }
                            }
                        }
                    });

                    if (serverMember && serverMember.role && Array.isArray(serverMember.role.permissions)) {
                        if (serverMember.role.permissions.includes('DELETE_MESSAGE')) { // Assuming this permission exists
                            hasPermission = true;
                        }
                    }

                    // Additionally, check if the user is the owner of the server
                    const server = await prisma.server.findUnique({
                        where: { id: existingMessage.channel.serverId },
                        select: { ownerId: true }
                    });

                    if (server && server.ownerId === userId) {
                        hasPermission = true; // Server owner always has permission
                    }
                }


                if (!hasPermission) {
                    return res.status(403).json({ error: 'You do not have permission to delete this message' });
                }

                // Delete the message
                await prisma.message.delete({ // Corrected from prisma.messages to prisma.message
                    where: { id: messageId }
                });

                return res.status(204).send(); // 204 No Content for successful deletion
            } catch (error) {
                // Handle errors during message deletion
                console.error("Error deleting message:", error);
                return res.status(500).json({
                    error: 'Error deleting message',
                    details: error.message
                });
            }
        }
    };
};
