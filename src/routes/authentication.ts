import express, { urlencoded } from 'express';
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passportLocal = require('passport-local').Strategy;
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import passport from 'passport';
import User from '../User';
import { IMongoDBUser } from '../types';

const router = express.Router();

// local strategy middleware
router.use(bodyParser.json());
router.use(urlencoded({ extended: true }));
router.use(cookieParser('secretcode'));

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

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	function (req, res) {
		// Successful authentication, redirect home.
		res.redirect('http://localhost:3000');
	}
);

router.get('/logout', (req, res) => {
	// console.log(req);
	if (req.user) {
		req.logout((err: Error) => console.log(err));
		res.send('success');
	}
});

module.exports = router;
