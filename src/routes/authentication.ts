import express from 'express';
import passport from 'passport';
import User from '../models/User';
import { IMongoDBUser } from '../types/types';
import googleRoute from './strategies/googleStrategy';
import localRoute from './strategies/localStrategy';
import githubRoute from './strategies/githubStrategy';

const router = express.Router();

// Serialize & Deserialize -> Grab the doc from the database and return it
passport.serializeUser((doc: IMongoDBUser, done) => {
	return done(null, doc._id);
});

passport.deserializeUser((id: string, done) => {
	User.findById(id, (err: Error, doc: IMongoDBUser) => {
		return done(null, doc);
	});
});

// Auth strategy routes
router.use('/local', localRoute);
router.use('/google', googleRoute);
router.use('/github', githubRoute);

// Logout function
router.get('/logout', (req, res) => {
	// console.log(req);
	if (req.user) {
		req.logout((err: Error) => console.log(err));
		res.send('success');
	}
});

module.exports = router;
