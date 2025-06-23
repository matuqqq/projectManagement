import { prisma } from "../prisma/prisma.provider.js";
import bcrypt from "bcrypt";

export default () => {
  return {
    register: async (req, res) => {
      console.log(req.body);
      const { email, password, username } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            username,
            avatar: null,
            bio: null,
          },
        });

        // Opcional: no retornar la contraseña
        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(201).json(userWithoutPassword);
      } catch (error) {
        return res.status(500).json({ error: "Error al crear el usuario" });
      }
    },

    login: async (req, res) => {
      console.log(req.body);
      const identifier = req.body.email || req.body.username;
      const password = req.body.password;

      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
        });

        if (!user) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const isValid = await bcrypt.compare(password, user.password); // ¡corregido aquí!
        if (!isValid) {
          return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        return res.json({
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
          },
        });
      } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: "Error interno en el servidor" });
      }
    },
        getUserById: async (req, res) => {
      const { id } = req.params;
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
            bio: true
          }
        });
        if (!user) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
        return res.json(user);
      } catch (error) {
        return res.status(500).json({ error: "Error al buscar el usuario" });
      }
    }
  };
};
