import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
const LocalStrategy = require('passport-local').Strategy;
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../../models/User';
import { IMongoDBUser } from '../../types/types';
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

// Local endpoints
router.post('/login', passport.authenticate('local'), (req, res) => {
	console.log('Logged In');
	res.send('Successful Login');
});

router.post('/register', async (req, res, next) => {
	console.log(req.body);
	try {
		User.findOne(
			{ email: req.body.email },
			async (err: Error, doc: Document) => {
				if (err) throw err;
				if (doc) res.send('User with this Email already exists');
				if (!doc) {
					const hashedPassword = await bcrypt.hash(req.body.password, 10);

					const newUser = await User.create({
						email: req.body.email,
						username: req.body.username,
						password: hashedPassword,
					});

					req.login(newUser, function (err) {
						if (err) return next(err);
						res.send('User Created');
					});
				}
			}
		);
	} catch (err) {
		res.send('Invalid Credentials');
	}
});

export default router;
