import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
const GoogleStrategy = require('passport-google-oauth20').Strategy;

dotenv.config();

const app = express();

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

passport.serializeUser((user: any, done) => {
	return done(null, user);
});

passport.deserializeUser((user: any, done) => {
	return done(null, user);
});

passport.use(
	new GoogleStrategy(
		{
			clientID: `${process.env.GOOGLE_CLIENT_ID}`,
			clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
			callbackURL: '/auth/google/callback',
		},
		function (accessToken: any, refreshToken: any, profile: any, cb: any) {
			// Called on Successful Authentication!
			// Insert into Database
			console.log(profile);
			cb(null, profile);
		}
	)
);

app.get('/', (req, res) => {
	res.send('Hello World');
});

app.get('/getuser', (req, res) => {
	res.send(req.user);
});

app.get(
	'/auth/google',
	passport.authenticate('google', { scope: ['profile'] })
);

app.get(
	'/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	function (req, res) {
		// Successful authentication, redirect home.
		res.redirect('http://localhost:3000');
	}
);

app.listen(4000, () => {
	console.log('Server started');
});
