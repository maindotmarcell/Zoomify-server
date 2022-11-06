import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
const GoogleStrategy = require('passport-google-oauth20').Strategy;
import User from './User';
import { IMongoDBUser } from './types';

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

// Login with Google
// Create a user in MongoDB
// Serialize & Deserialize -> Grab the user from the database and return him

passport.serializeUser((user: IMongoDBUser, done) => {
	return done(null, user._id);
});

passport.deserializeUser((id: string, done) => {
	User.findById(id, (err: Error, doc: IMongoDBUser) => {
		return done(null, doc);
	});
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
			// console.log(profile);
			// Insert into Database
			User.findOne(
				{ googleId: profile.id },
				async (err: Error, doc: IMongoDBUser) => {
					if (err) return cb(err, null);

					if (!doc) {
						// Create new user
						const newUser = new User({
							googleId: profile.id,
							username: profile.name.givenName,
						});

						await newUser.save();
						cb(null, newUser);
					}
					cb(null, doc);
				}
			);
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

app.get('/auth/logout', (req, res) => {
	if (req.user) {
		req.logout((err: Error) => console.log(err));
		res.send('success');
	}
});

app.listen(4000, () => {
	console.log('Server started');
});
