import { prisma } from './prisma/prisma.provider.js';

async function main() {
    console.log('Starting database seeding...');

    try {
        // Create sample servers
        const server1 = await prisma.server.create({
            data: {
                name: "General Server",
                description: "A general purpose Discord server",
                isPublic: true,
                ownerId: "user123" // You'll need to replace this with a real user ID
            }
        });

        const server2 = await prisma.server.create({
            data: {
                name: "Gaming Hub",
                description: "Server for gaming enthusiasts",
                isPublic: true,
                ownerId: "user123"
            }
        });

        const server3 = await prisma.server.create({
            data: {
                name: "Study Group",
                description: "Private study group server",
                isPublic: false,
                ownerId: "user123"
            }
        });

        console.log('Created servers:', { server1: server1.id, server2: server2.id, server3: server3.id });

        // Create channels for server1
        await prisma.channel.create({
            data: {
                name: "general",
                description: "General discussion channel",
                serverId: server1.id,
                isPrivate: false
            }
        });

        await prisma.channel.create({
            data: {
                name: "announcements",
                description: "Server announcements",
                serverId: server1.id,
                isPrivate: false
            }
        });

        await prisma.channel.create({
            data: {
                name: "random",
                description: "Random conversations",
                serverId: server1.id,
                isPrivate: false
            }
        });

        await prisma.channel.create({
            data: {
                name: "private-chat",
                description: "Private discussion",
                serverId: server1.id,
                isPrivate: true
            }
        });

        // Create channels for server2
        await prisma.channel.create({
            data: {
                name: "gaming-general",
                description: "General gaming discussion",
                serverId: server2.id,
                isPrivate: false
            }
        });

        await prisma.channel.create({
            data: {
                name: "minecraft",
                description: "Minecraft discussions",
                serverId: server2.id,
                isPrivate: false
            }
        });

        await prisma.channel.create({
            data: {
                name: "valorant",
                description: "Valorant team coordination",
                serverId: server2.id,
                isPrivate: false
            }
        });

        await prisma.channel.create({
            data: {
                name: "voice-general",
                description: "General voice chat",
                serverId: server2.id,
                isPrivate: false,
                isVoice: true
            }
        });

        // Create channels for server3
        await prisma.channel.create({
            data: {
                name: "study-hall",
                description: "Main study discussion",
                serverId: server3.id,
                isPrivate: false
            }
        });

        await prisma.channel.create({
            data: {
                name: "resources",
                description: "Study resources sharing",
                serverId: server3.id,
                isPrivate: false
            }
        });

        await prisma.channel.create({
            data: {
                name: "homework-help",
                description: "Get help with homework",
                serverId: server3.id,
                isPrivate: true
            }
        });

        console.log('✅ Database seeding completed successfully!');
        console.log('Created:');
        console.log('- 3 servers');
        console.log('- 11 channels total');
        console.log('\nYou can now test the Discord-like interface!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
