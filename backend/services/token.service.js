const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ACCESS_SECRET  = process.env.TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, verified: user.verified },
    ACCESS_SECRET,
    { expiresIn: "8h" }
  );
}

async function generateRefreshToken(user) {
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
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
};
