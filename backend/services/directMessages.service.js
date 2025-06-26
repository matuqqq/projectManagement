import { prisma } from '../prisma/prisma.provider.js';

export default () => ({
    getMessagesBetweenUsers: async (userId1, userId2) => {
        return prisma.directMessage.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
    },

    createDirectMessage: async (senderId, receiverId, content) => {
        return prisma.directMessage.create({
            data: { senderId, receiverId, content }
        });
    },

        updateDirectMessage: async (id, content) => {
        return prisma.directMessage.update({
            where: { id },
            data: { content }
        });
    },

    deleteDirectMessage: async (id) => {
        return prisma.directMessage.delete({ where: { id } });
    }
});