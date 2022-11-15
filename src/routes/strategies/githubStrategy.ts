import express from 'express';
var GitHubStrategy = require('passport-github').Strategy;
import passport from 'passport';
import User from '../../models/User';
import { IMongoDBUser } from '../../types/types';

const router = express.Router();

passport.use(
	new GitHubStrategy(
		{
			clientID: `${process.env.GITHUB_CLIENT_ID}`,
			clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
			callbackURL: '/auth/github/callback',
		},
		(accessToken: any, refreshToken: any, profile: any, cb: any) => {
			// console.log('profile: ', profile);
			User.findOne(
				{ githubId: profile.id },
				async (err: Error, doc: IMongoDBUser) => {
					// console.log(doc);
					if (err) return cb(err, null);

					if (!doc) {
						// Create new doc
						const newUser = new User({
							githubId: profile.id,
							username: profile.username,
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

router.get('/', passport.authenticate('github'));

router.get(
	'/callback',
	passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
	function (req, res) {
		// Successful authentication, redirect home.
		res.redirect(`${process.env.CLIENT_URL}`);
	}
);

export default router;
