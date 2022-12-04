import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import http from 'http';
const app = express();
const server = http.createServer(app);
import { Server, Socket } from 'socket.io';

dotenv.config();

const io = new Server(server, {
	cors: {
		origin: `${process.env.CLIENT_URL}`,
		methods: ['GET', 'POST'],
	},
});

// Route imports
import authRoute from './routes/auth';

mongoose.connect(
	`${process.env.START_MONGODB}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.END_MONGODB}`,
	{},
	() => {
		console.log('Connected to mongoose succesfully');
	}
);

// Middleware
app.use(express.json());
app.use(cors({ origin: `${process.env.CLIENT_URL}`, credentials: true }));
app.use(
	session({ secret: 'secretcode', resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// routing for authentication
app.use('/auth', authRoute);

// route to get current authenticated user (might move this into auth route later)
app.get('/getuser', (req, res) => {
	// console.log(req);
	res.send(req.user);
});

// ---------- socket.io code for vid chat below ---------------
// As the client emits a 'connection' event to the server
io.on('connection', (socket: Socket) => {
	socket.emit('me', socket.id);
	console.log('🚀 ~ file: index.ts:53 ~ io.on ~ socket.id', socket.id);

	socket.on('disconnect', () => {
		socket.broadcast.emit('userLeft');
		// (Broadcast = Emit message to all connected sockets, except sender, that a user left)
	});

	socket.on('callUser', (data) => {
		// Forward call user event from caller to user to be called
		io.to(data.userToCall).emit('callUser', {
			// Emit to user to be called
			signal: data.signalData,
			from: data.from,
			name: data.name,
		});
	});

	// forward answered call back to caller to create p2p connection
	socket.on('answerCall', (data) => {
		io.to(data.to).emit('callAccepted', data.signal);
	});
});

server.listen(4000, () => {
	console.log('Server started');
});
