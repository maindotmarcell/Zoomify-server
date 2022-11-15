import express from 'express';
const GoogleStrategy = require('passport-google-oauth20').Strategy;
import passport from 'passport';
import User from '../../models/User';
import { IMongoDBUser } from '../../types/types';

const router = express.Router();

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
						return cb(null, newUser);
					}
					return cb(null, doc);
				}
			);
		}
	)
);

// Google endpoints
router.get('/', passport.authenticate('google', { scope: ['profile'] }));

router.get(
	'/callback',
	passport.authenticate('google', {
		failureRedirect: `${process.env.CLIENT_URL}/login`,
	}),
	function (req, res) {
		// Successful authentication, redirect home.
		res.redirect(`${process.env.CLIENT_URL}`);
	}
);

export default router;
