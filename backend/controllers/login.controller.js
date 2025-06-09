import loginService from '../services/login.service.js';

// Login controller
const login = async (req, res, next) => {
    const { username, password } = req.body;
// No user and password validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
// Wait for authentication
    try {
        const user = await loginService.authenticate(username, password);

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
// Store user in session
        req.session.user = user;

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
            },
        });
    } catch (error) {
        next(error);
    }
};
// Logout controller
const logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
// Clear the session cookie
        res.clearCookie('connect.sid'); 
        return res.status(200).json({ message: 'Logout successful' });
    });
};

export default {
    login,
    logout,
};