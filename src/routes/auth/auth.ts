import express from 'express';
import passport from 'passport';
import User from '../../models/User';
import { IMongoDBUser } from '../../types/types';
// route imports
import googleRoute from './strategies/googleStrategy';
import localRoute from './strategies/localStrategy';
import githubRoute from './strategies/githubStrategy';

const router = express.Router();


// Auth strategy routes
router.use('/local', localRoute);
router.use('/google', googleRoute);
router.use('/github', githubRoute);

// route to get current authenticated user
router.get('/getuser', (req, res) => {
	res.send(req.user);
});

// Logout function
router.get('/logout', (req, res) => {
	// console.log(req);
	if (req.user) {
		req.logout((err: Error) => console.log(err));
		res.send('success');
	}
});

export default router;
