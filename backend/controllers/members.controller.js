import membersService from '../services/members.service.js';

// GET /miembros
const obtenerMiembros = async (req, res) => {
  try {
    const miembros = await membersService.obtenerMiembros();
    res.json(miembros);
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /miembros
const crearMiembro = async (req, res) => {
  const { userId, serverId, roleId } = req.body;

  if (!userId || !serverId) {
    return res.status(400).json({ error: 'userId y serverId son requeridos' });
  }

  try {
    const nuevoMiembro = await membersService.crearMiembro({ userId, serverId, roleId });
    res.status(201).json(nuevoMiembro);
  } catch (error) {
    console.error('Error al crear miembro:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El usuario ya pertenece a ese servidor' });
    }
    res.status(500).json({ error: 'Error al crear miembro del servidor' });
  }
};

export default {
  obtenerMiembros,
  crearMiembro
};