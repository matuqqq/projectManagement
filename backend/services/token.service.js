import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prisma.provider.js";

const ACCESS_SECRET  = process.env.TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

export default () => {
  return {
    generateAccessToken: (user) => {
      return jwt.sign(
        { id: user.id, email: user.email, verified: user.verified, password: user.password },
        ACCESS_SECRET,
        { expiresIn: "8h" }
      );
    },

    generateRefreshToken: async (user) => {
      console.log("Generating refresh token for user:", user.id);
      const token = jwt.sign(
        { userId: user.id },
        REFRESH_SECRET
      );
      await prisma.refreshToken.create({
        data: {
          token,
          user: { connect: { id: user.id } }
        }
      });
      return token;
    },

    verifyRefreshToken: (token) => {
      return jwt.verify(token, REFRESH_SECRET);
    },

    verifyAccessToken: (token) => {
      return jwt.verify(token, ACCESS_SECRET);
    }
  };
};