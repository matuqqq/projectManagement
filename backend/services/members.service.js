const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.obtenerMiembros = async () => {
  return await prisma.serverMember.findMany({
    include: {
      user: true,
      server: true,
      role: true,
    },
  });
};

exports.crearMiembro = async (data) => {
  return await prisma.serverMember.create({
    data: {
      userId: data.userId,
      serverId: data.serverId,
      roleId: data.roleId,
    },
  });
};
