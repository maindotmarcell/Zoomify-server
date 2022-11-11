import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';

dotenv.config();

const app = express();

// Route imports
const authRoute = require('./routes/authentication');

mongoose.connect(
	`${process.env.START_MONGODB}${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}${process.env.END_MONGODB}`,
	{},
	() => {
		console.log('Connected to mongoose succesfully');
	}
);

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(
	session({ secret: 'secretcode', resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoute);

app.get('/', (req, res) => {
	res.send('Hello World');
});

app.get('/getuser', (req, res) => {
	// console.log(req);
	res.send(req.user);
});

app.listen(4000, () => {
	console.log('Server started');
});
