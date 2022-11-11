import express, { urlencoded } from 'express';
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import passport from 'passport';
import User from '../models/User';
import { IMongoDBUser } from '../types/types';
import { Document } from 'mongoose';

const router = express.Router();

// local strategy middleware
router.use(bodyParser.json());
router.use(urlencoded({ extended: true }));
router.use(cookieParser('secretcode'));

// Login with Google
// Create a doc in MongoDB
// Serialize & Deserialize -> Grab the doc from the database and return him
passport.serializeUser((doc: IMongoDBUser, done) => {
	return done(null, doc._id);
});

passport.deserializeUser((id: string, done) => {
	User.findById(id, (err: Error, doc: IMongoDBUser) => {
		return done(null, doc);
	});
});

// difining Local Strategy
passport.use(
	new LocalStrategy(
		{ usernameField: 'email' },
		(email: string, password: string, done: any) => {
			console.log(email);
			console.log(password);
			User.findOne({ email: email }, async (err: Error, doc: IMongoDBUser) => {
				console.log(doc);
				if (err) throw err;
				if (!doc) return done(null, false);
				bcrypt.compare(password, doc.password, (err, result) => {
					if (err) throw err;
					if (result === true) {
						return done(null, doc);
					} else {
						return done(null, false);
					}
				});
			});
		}
	)
);

// defining Google Strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: `${process.env.GOOGLE_CLIENT_ID}`,
			clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
			callbackURL: '/auth/google/callback',
		},
		(accessToken: any, refreshToken: any, profile: any, cb: any) => {
			// Called on Successful Authentication
			// console.log(profile);
			// Insert into Database
			User.findOne(
				{ googleId: profile.id },
				async (err: Error, doc: IMongoDBUser) => {
					if (err) return cb(err, null);

					if (!doc) {
						// Create new doc
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

// Google endpoints
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	function (req, res) {
		// Successful authentication, redirect home.
		res.redirect('http://localhost:3000');
	}
);

// Local endpoints
router.post('/local/login', passport.authenticate('local'), (req, res) => {
	console.log('Logged In');
	res.send('Successful Login');
});

router.post('/local/register', async (req, res) => {
	console.log(req.body);
	User.findOne({ email: req.body.email }, async (err: Error, doc: Document) => {
		if (err) throw err;
		if (doc) res.send('User with this Email already exists');
		if (!doc) {
			const hashedPassword = await bcrypt.hash(req.body.password, 10);

			const newUser = new User({
				email: req.body.email,
				username: req.body.username,
				password: hashedPassword,
			});
			await newUser.save();
			res.send('User Created');
		}
	});
});

// Logout function
router.get('/logout', (req, res) => {
	// console.log(req);
	if (req.user) {
		req.logout((err: Error) => console.log(err));
		res.send('success');
	}
});

module.exports = router;
