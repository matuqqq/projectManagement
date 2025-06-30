import { prisma } from "../prisma/prisma.provider.js";
import bcrypt from "bcrypt";
import tokenService from "./token.service.js";

const tokens = tokenService();

function getUserIdFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = tokens.verifyAccessToken(token);
  return decoded.id;
}

export default () => {
  return {
    register: async (req, res) => {
      console.log(req.body);
      console.log("Registering user...");
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
        const { password: _, ...userWithoutPassword } = newUser;
        const accessToken = tokens.generateAccessToken(newUser);
        const refreshToken = await tokens.generateRefreshToken(newUser);

        return res.status(201).json({
          user: userWithoutPassword,
          accessToken,
          refreshToken,
          message: "Usuario creado correctamente",
          success: true,
        });
      } catch (error) {
      console.error("❌ Prisma error:", error);
      return res.status(500).json({ error: "Error al crear el usuari", details: error.message });
      }
    },

    login: async (req, res) => {
      console.log("Logging in user...");
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
        const accessToken = tokens.generateAccessToken(user);
        const refreshToken = await tokens.generateRefreshToken(user);

        return res.json(
          {
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              avatar: user.avatar,
              bio: user.bio,
              accessToken,
              refreshToken,
            },
            message: "Usuario logueado correctamente",
            success: true,
          }
        );
      } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: "Error interno en el servidor" });
      }
    },

    deleteUser: async (req, res) => {
      try {
        const userId = req.params.id;
        console.log("Deleting user with ID:", userId);
        await prisma.user.delete({ where: { id: userId } });
        return res
          .status(200)
          .json({ message: "Usuario eliminado correctamente" });
      } catch (error) {
        return res
          .status(404)
          .json({ error: "Usuario no encontrado o token inválido" });
      }
    },

    getUserProfile: async (req, res) => {
      try {
        const userId = req.params.id;
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            email: true,
            username: true,
            avatar: true,
            bio: true,
          },
        });
        if (!user) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
        return res.json(user);
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Error al obtener el perfil o token inválido" });
      }
    },

    updateUser: async (req, res) => {
      try {
        const userId = req.params.id;
        const { email, username, avatar, bio } = req.body;
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { email, username, avatar, bio },
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
            bio: true,
          },
        });
        return res.json(updatedUser);
      } catch (error) {
        return res.status(404).json({
          error: "Usuario no encontrado, datos inválidos o token inválido",
        });
      }
    },
  };
};
