import dotenv from "dotenv";
dotenv.config({ path: '.env' });

import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prisma.provider.js";

const ACCESS_SECRET = process.env.TOKEN_SECRET || process.env.SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.SECRET;

// Debug logging to check if secrets are loaded
console.log('Environment check:');
console.log('TOKEN_SECRET exists:', !!process.env.TOKEN_SECRET);
console.log('REFRESH_TOKEN_SECRET exists:', !!process.env.REFRESH_TOKEN_SECRET);
console.log('SECRET exists:', !!process.env.SECRET);

export default () => {
  return {
    generateAccessToken: (user) => {
      if (!ACCESS_SECRET) {
        throw new Error('ACCESS_SECRET is not defined in environment variables');
      }
      return jwt.sign(
        { id: user.id, email: user.email, verified: user.verified, password: user.password },
        ACCESS_SECRET,
        { expiresIn: "8h" }
      );
    },

    generateRefreshToken: async (user) => {
      console.log("Generating refresh token for user:", user.id);
      if (!REFRESH_SECRET) {
        throw new Error('REFRESH_SECRET is not defined in environment variables');
      }
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
      if (!REFRESH_SECRET) {
        throw new Error('REFRESH_SECRET is not defined in environment variables');
      }
      return jwt.verify(token, REFRESH_SECRET);
    },

    verifyAccessToken: (token) => {
      if (!ACCESS_SECRET) {
        throw new Error('ACCESS_SECRET is not defined in environment variables');
      }
      return jwt.verify(token, ACCESS_SECRET);
    }
  };
};