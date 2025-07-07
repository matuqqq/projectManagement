import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from 'express-session';
import MySQLStoreModule from 'express-mysql-session';
import passport from "passport";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// import helloworld from "./controllers/helloworld.controller.js";
import channels from "./routes/channels.routes.js";
import members from "./routes/members.routes.js";
import users from "./routes/users.routes.js";
import directMessagesRoutes from "./routes/directMessages.routes.js";
import roles from "./routes/roles.routes.js";
import { authenticateToken } from "./middleware/auth.middleware.js";
import servers from "./routes/servers.routes.js";

const app = express();
const API_PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const MySQLStore = MySQLStoreModule(session);
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        store: new MySQLStore({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
        }),
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.notUser = !req.user;
    next();
});

/*  ROUTES */

//app.use("/api/hello", helloworld); // example of the scaffolding, please use it as a reference for your own controllers
app.use("/api/channels", authenticateToken, channels); // now you can use this as a reference for your own controllers, lol
app.use("/api/members", authenticateToken, members);
app.use("/api/user", users); // Login/register routes don't need auth
app.use("/api/direct-messages", authenticateToken, directMessagesRoutes);
app.use("/api/roles", authenticateToken, roles);
app.use("/api/servers",authenticateToken, servers);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  if (error.code === 'PERMISSION_CHECK_ERROR') {
    return res.status(500).json({
      error: 'Internal server error while checking permissions',
      code: 'INTERNAL_ERROR'
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

app.listen(API_PORT, () => {
  console.log(`Server is running on port ${API_PORT}`);
});