import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from 'express-session';
import MySQLStoreModule from 'express-mysql-session';
import passport from "passport";
import helmet from "helmet";
import dotenv from "dotenv";

//import helloworld from "./controllers/helloworld.controller.js";
import channels from "./routes/channels.routes.js";

//import members from "./routes/members.routes.js";
import members from "./routes/members.routes.js";

dotenv.config();
const app = express();
const API_PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
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
app.use("/api/channels", channels); // now you can use this as a reference for your own controllers, lol
app.use("/api/members", members);


app.listen(API_PORT, () => {
  console.log(`Server is running on port ${API_PORT}`);
});