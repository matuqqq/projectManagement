const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.obtenerMiembros = async (req, res) => {
  try {
    const miembros = await prisma.serverMember.findMany({
      include: {
        user: true,
        server: true,
        role: true,
      },
    });
    res.json(miembros);
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.crearMiembro = async (req, res) => {
  const { userId, serverId, roleId } = req.body;

  if (!userId || !serverId) {
    return res.status(400).json({ error: 'userId y serverId son requeridos' });
  }

  try {
    const nuevoMiembro = await prisma.serverMember.create({
      data: {
        userId,
        serverId,
        roleId, // puede ser null
      },
    });
    res.status(201).json(nuevoMiembro);
  } catch (error) {
    console.error('Error al crear miembro:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El usuario ya pertenece a ese servidor' });
    }
    res.status(500).json({ error: 'Error al crear miembro del servidor' });
  }
};
