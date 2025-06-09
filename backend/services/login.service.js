import { prisma } from '../prisma/prisma.provider.js';
import bcrypt from 'bcrypt';

// User authentication service
async function authenticate(username, password) {
    
    // Search the user by username
    const user = await prisma.user.findUnique({
        where: { username }
    });
    if (!user) return null;

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    // Return the user without the password field in case of not having a password in the database
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export default {
    authenticate,
};