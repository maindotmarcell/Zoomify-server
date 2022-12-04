import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import http from 'http';
import { Server } from 'socket.io';
import { socketConnectionHandler } from './socketIO/socketIO';

dotenv.config();

// Route imports
import authRoute from './routes/auth/auth';

const app = express();
const server = http.createServer(app);

// Database connection
mongoose.connect(
	`${process.env.START_MONGODB}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.END_MONGODB}`,
	{},
	() => {
		console.log('Connected to mongoose succesfully');
	}
);

// -------- Socket.io ----------
// Exporting io Server instance, socket connection logic handled socketIO.ts
export const io = new Server(server, {
	cors: {
		origin: `${process.env.CLIENT_URL}`,
		methods: ['GET', 'POST'],
	},
});
// setting handler function for 'connection' event
io.on('connection', socketConnectionHandler);

// --------- Express / REST -----------
// Middleware
app.use(express.json());
app.use(cors({ origin: `${process.env.CLIENT_URL}`, credentials: true }));
app.use(
	session({ secret: 'secretcode', resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// Routing for authentication
app.use('/auth', authRoute);

server.listen(4000, () => {
	console.log('Server started');
});
