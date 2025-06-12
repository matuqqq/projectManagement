// index.js (main backend file)
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from 'express-session';
import MySQLStoreModule from 'express-mysql-session';
import passport from "passport";
import helmet from "helmet";
import dotenv from "dotenv"; // Import dotenv

dotenv.config(); // Load environment variables as early as possible
const app = express();
const API_PORT = process.env.PORT || 3000;

// Import message controller
import messagesController from './controllers/message.controller.js'; // Ensure this path is correct
// Import other routes if they exist, e.g., channels
import channels from "./routes/channels.routes.js"; // Keep your channels import
import message from "./routes/message.routes.js"; // Import message routes


app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const MySQLStore = MySQLStoreModule(session);

// Configure express-session middleware
app.use(
    session({
        secret: process.env.SECRET || 'a-very-strong-fallback-secret-for-development', // IMPORTANT: Ensure SECRET is in your .env or use a strong fallback
        resave: false,
        saveUninitialized: false,
        store: new MySQLStore({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
        }),
        cookie: { secure: process.env.NODE_ENV === 'production' } // Set secure cookie in production
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware to simulate userId for demonstration purposes
// In a real application, this would come from authentication (e.g., JWT token from Passport)
app.use((req, res, next) => {
    // For demonstration, let's assume a hardcoded userId for now if not authenticated.
    // In a real app, req.user would be populated by Passport.
    req.params.userId = req.user?.id || 'user123'; // Use authenticated user ID or fallback
    res.locals.user = req.user;
    res.locals.notUser = !req.user;
    next();
});

/* ROUTES */
// Your existing channels route
app.use("/api/channels", channels);
app.use("/api/messages", message); // Use messagesController for message routes
// Correctly define message routes using messagesController
// Make sure these paths match your frontend fetch calls


// Basic error handling middleware (ensure this is the last app.use)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke on the server!');
});


app.listen(API_PORT, () => {
    console.log(`Server is running on port ${API_PORT}`);
    console.log(`Access the backend at http://localhost:${API_PORT}`);
});
