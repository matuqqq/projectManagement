import { prisma } from '../prisma/prisma.provider.js';

export default () => ({
    getMessagesBetweenUsers: async (userId1, userId2) => {
        return await prisma.directMessage.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            },
            orderBy: { createdAt: 'asc' },
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
    },

    createDirectMessage: async (senderId, receiverId, content) => {
        return await prisma.directMessage.create({
            data: { senderId, receiverId, content },
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
    },

        updateDirectMessage: async (id, content) => {
        return await prisma.directMessage.update({
            where: { id },
            data: { content },
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
    },

    deleteDirectMessage: async (id) => {
        return await prisma.directMessage.delete({ where: { id } });
    },

    // Nuevo método para obtener conversaciones del usuario
    getUserConversations: async (userId) => {
        try {
        // Obtener todos los mensajes donde el usuario es sender o receiver
        const messages = await prisma.directMessage.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
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
            },
            orderBy: { createdAt: 'desc' }
        });

        // Agrupar por conversación (par de usuarios)
        const conversationsMap = new Map();
        
        messages.forEach(message => {
            const otherUser = message.senderId === userId ? message.receiver : message.sender;
            const conversationKey = [userId, otherUser.id].sort().join('-');
            
            if (!conversationsMap.has(conversationKey)) {
                conversationsMap.set(conversationKey, {
                    id: conversationKey,
                    otherUser,
                    lastMessage: message.content,
                    lastMessageTime: message.createdAt,
                    unreadCount: 0 // Esto requeriría lógica adicional para calcular
                });
            }
        });

        return Array.from(conversationsMap.values());
        } catch (error) {
            console.error('Error in getUserConversations:', error);
            throw new Error('Failed to fetch user conversations');
        }
    }
});