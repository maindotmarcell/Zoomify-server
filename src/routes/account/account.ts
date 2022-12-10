import express, { Request, Response } from 'express';
import User from '../../models/User';
import { IMongoDBUser } from '../../types/types';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.put('/updateUsername', async (req: Request, res: Response) => {
	try {
		if (!req.isAuthenticated())
			return res.status(401).send('Unauthorized: user not authenticated.');

		User.findByIdAndUpdate(
			req.body.id,
			{
				username: req.body.newUsername,
			},
			(err: Error, user: IMongoDBUser) => {
				if (err) return res.status(500).send('Server error.');
				return res.status(200).send(`Username Updated: ${user.username}`);
			}
		);
	} catch (error) {
		console.log(error);
	}
});

router.put('/updatePassword', async (req: Request, res: Response) => {
	try {
		if (!req.isAuthenticated())
			return res.status(401).send('Unauthorized: user not authenticated.');

		// checking current password input
		// this method doesn't work, will probs need to use the bcrypt.compare() function
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);
		const user = await User.findById(req.body.id);

		if (hashedPassword !== user.password)
			return res.status(200).send('Incorrect password.');

		// updating the password
		await user.update({ password: hashedNewPassword });
		return res.status(200).send('Password updated.');
	} catch (error) {
		console.log(error);
		return res.status(500).send('Server error.');
	}
});

router.delete('/deleteAccount', async (req: Request, res: Response) => {
	console.log(req);
	res.status(200).json({ deleted: true });
});

export default router;
