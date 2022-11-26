import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
const app = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from 'socket.io';

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

app.use('/auth', authRoute);

app.get('/getuser', (req, res) => {
	// console.log(req);
	res.send(req.user);
});

io.on('connection', (socket) => {
	socket.emit('me', socket.id);
	console.log(socket.id);

	socket.on('disconnet', () => {
		socket.broadcast.emit('callEnded');
	});

	socket.on('callUser', (data) => {
		io.to(data.userToCall).emit('callUser', {
			signal: data.signalData,
			from: data.from,
			name: data.name,
		});
	});

	socket.on('answerCall', (data) => {
		io.to(data.to).emit('callAccepted', data.signal);
	});
});

server.listen(4000, () => {
	console.log('Server started');
});
