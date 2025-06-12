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
                const messages = await prisma.messages.findMany({ // Corrected 'mesagges' to 'messages'
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
                        // Assuming messages have a relation to a User model for the author
                        author: {
                            select: {
                                id: true,
                                name: true // Select author's ID and name
                            }
                        }
                    }
                });

                // Get the total count of messages for the channel
                const totalMessages = await prisma.messages.count({ // Corrected 'channel' to 'messages' and 'channeld' to 'channelId'
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
        createMessage: async (req, res) => { // Corrected function name to singular 'createMessage'
            const { channelId, message } = req.body; // Get channelId and message content from request body
            const { userId } = req.params; // Get userId from request parameters (e.g., from auth middleware)

            // Validate required fields
            if (!channelId || !message || !userId) {
                return res.status(400).json({
                    error: 'Channel ID, message content, and User ID are required'
                });
            }

            try {
                // Find the channel and check user permissions (assuming 'members' relation and 'role' with 'permissions')
                const channel = await prisma.channel.findUnique({
                    where: {
                        id: channelId
                    },
                    include: {
                        members: {
                            where: {
                                userId: userId,
                                // Check if the member's role has 'CREATE_MESSAGE' permission
                                role: {
                                    permissions: {
                                        has: 'CREATE_MESSAGE' // This assumes a JSONB or similar field for permissions
                                    }
                                }
                            }
                        }
                    }
                });

                // If channel not found, return 404
                if (!channel) {
                    return res.status(404).json({
                        error: 'Channel not found'
                    });
                }

                // Check if the user is the channel owner or has CREATE_MESSAGE permission
                // This logic needs to be carefully aligned with your actual permission model.
                // The original code had 'server.ownerId' which isn't directly from 'channel' here.
                // Assuming 'members' check is sufficient for participation and permission.
                const hasPermission = channel.members.length > 0; // User is a member with create message permission

                if (!hasPermission) {
                    return res.status(403).json({
                        error: 'You do not have permission to create messages in this channel'
                    });
                }

                // Create the new message
                const newMessage = await prisma.messages.create({ // Corrected 'channel.create' to 'messages.create'
                    data: {
                        userId: userId, // Associate message with the user who created it
                        channelId: channelId,
                        content: message // 'content' is a more common field name for message text
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
                const existingMessage = await prisma.messages.findUnique({
                    where: { id: messageId }
                });

                // If message not found, return 404
                if (!existingMessage) {
                    return res.status(404).json({ error: 'Message not found' });
                }

                // Check if the current user is the author of the message
                if (existingMessage.userId !== userId) {
                    return res.status(403).json({ error: 'You do not have permission to edit this message' });
                }

                // Update the message
                const updatedMessage = await prisma.messages.update({
                    where: { id: messageId },
                    data: { content: message, updatedAt: new Date() } // Update content and timestamp
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
                // Find the message and check if the user is the author
                const existingMessage = await prisma.messages.findUnique({
                    where: { id: messageId }
                });

                // If message not found, return 404
                if (!existingMessage) {
                    return res.status(404).json({ error: 'Message not found' });
                }

                // Check if the current user is the author of the message
                // Or if the user has DELETE_MESSAGE permission (e.g., Llera - backend lead)
                // This requires fetching user roles/permissions. For simplicity, we'll only check author for now.
                // You would extend this logic to check for admin/backend lead roles if needed.
                if (existingMessage.userId !== userId) {
                    return res.status(403).json({ error: 'You do not have permission to delete this message' });
                }

                // Delete the message
                await prisma.messages.delete({
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
