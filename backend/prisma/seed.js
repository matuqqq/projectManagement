import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();


async function main() {
  const user1 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'pablo@example.com',
      password: 'hashedpassword1',
      username: 'pablo',
      avatar: null,
      bio: 'Bio de pablo',
    },
  });
  console.log("user1 id:", user1.id);

  const user2 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'bob@example.com',
      password: 'hashedpassword2',
      username: 'bob',
      avatar: null,
      bio: 'Bio de Bob',
    },
  });
  console.log("user2 id:", user2.id);

  const user3 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'marcos@example.com',
      password: 'hashedpassword3',
      username: 'marcos',
      avatar: null,
      bio: 'Bio de marcos',
    },
  });
  console.log("user3 id:", user3.id);
  
  const server = await prisma.server.create({
    data: {
      id: randomUUID(),
      name: 'Server de prueba',
      description: 'server de ejemplo',
      icon: null,
      ownerId: user1.id,
    },
  });

  const adminRole = await prisma.serverRole.create({
    data: {
      id: randomUUID(),
      name: 'Admin',
      serverId: server.id,
    },
  });

  const memberRole = await prisma.serverRole.create({
    data: {
      id: randomUUID(),
      name: 'Member',
      serverId: server.id,
    },
  });

  await prisma.serverMember.createMany({
    data: [
      {
        id: randomUUID(),
        userId: user1.id,
        serverId: server.id,
        roleId: adminRole.id,
      },
      {
        id: randomUUID(),
        userId: user2.id,
        serverId: server.id,
        roleId: memberRole.id,
      },
      {
        id: randomUUID(),
        userId: user3.id,
        serverId: server.id,
        roleId: memberRole.id,
      },
    ],
  });

  const generalChannel = await prisma.channel.create({
    data: {
      id: randomUUID(),
      name: 'general',
      description: 'Canal general',
      serverId: server.id,
      isPrivate: false,
    },
  });

  await prisma.message.create({
    data: {
      id: randomUUID(),
      content: 'Hola a todos!',
      channelId: generalChannel.id,
      authorId: user1.id,
      updatedAt: new Date(),
      edited: false,
      attachments: null,
    },
  });

  await prisma.directMessage.create({
    data: {
      id: randomUUID(),
      content: 'Hola',
      senderId: user1.id,
      receiverId: user2.id,
      read: false,
    },
  });

  console.log('Seed completada');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
