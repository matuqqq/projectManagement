import { prisma } from "../prisma/prisma.provider.js";

const obtenerMiembros = async () => {
  return await prisma.serverMember.findMany({
    include: {
      user: true,
      server: true,
      role: true,
    },
  });
};

const crearMiembro = async (data) => {
  return await prisma.serverMember.create({
    data: {
      userId: data.userId,
      serverId: data.serverId,
      roleId: data.roleId,
    },
  });
};

export default {
  obtenerMiembros,
  crearMiembro
};