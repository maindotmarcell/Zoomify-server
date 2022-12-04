import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
const LocalStrategy = require('passport-local').Strategy;
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../../../models/User';
import { IMongoDBUser } from '../../../types/types';
import { Document } from 'mongoose';

const router = express.Router();

// local strategy middleware
router.use(bodyParser.json());
router.use(urlencoded({ extended: true }));
router.use(cookieParser('secretcode'));

// difining Local Strategy
passport.use(
	new LocalStrategy(
		{ usernameField: 'email' },
		(email: string, password: string, done: any) => {
			console.log(email);
			console.log(password);
			const sanitizedEmail = email.toLowerCase();
			User.findOne(
				{ email: sanitizedEmail },
				async (err: Error, doc: IMongoDBUser) => {
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
				}
			);
		}
	)
);

// Local endpoints
router.post('/login', passport.authenticate('local'), (req, res) => {
	console.log('Logged In');
	res.send('Successful Login');
});

router.post('/register', async (req, res, next) => {
	console.log(req.body);
	try {
		const sanitizedEmail = req.body.email.toLowerCase();
		User.findOne(
			{ email: sanitizedEmail },
			async (err: Error, doc: Document) => {
				if (err) throw err;
				if (doc) res.status(409).send({ msg: 'Email Taken' });
				if (!doc) {
					const rawUsername = req.body.username;
					const sanitizedUsername =
						rawUsername.charAt(0).toUpperCase() +
						rawUsername.slice(1).toLowerCase();

					const hashedPassword = await bcrypt.hash(req.body.password, 10);

					const newUser = await User.create({
						email: sanitizedEmail,
						username: sanitizedUsername,
						password: hashedPassword,
					});

					req.login(newUser, function (err) {
						if (err) return next(err);
						res.status(201).send({ msg: 'User Created' });
					});
				}
			}
		);
	} catch (err) {
		res.send('Invalid Credentials');
	}
});

export default router;
