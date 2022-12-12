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
		return res.status(500).send('Server error.');
	}
});

router.put('/updatePassword', async (req: Request, res: Response) => {
	try {
		if (!req.isAuthenticated())
			return res.status(401).send('Unauthorized: user not authenticated.');

		// checking current password input
		const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);
		const user = await User.findById(req.body.id);

		bcrypt.compare(req.body.password, user.password, async (err, success) => {
			if (err) throw err;
			if (!success)
				return res.status(401).send('Unauthorized: password is incorrect.');

			// updating the password
			await user.update({ password: hashedNewPassword });
			return res.status(200).send('Password updated.');
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send('Server error.');
	}
});

router.delete('/delete-account', async (req: Request, res: Response) => {
	try {
		if (!req.isAuthenticated())
			return res.status(401).send('Unauthorized: user not authenticated.');

		await User.findByIdAndRemove(req.body.id);

		req.logout((err: Error) => console.log(err));
		return res.status(200).send('Account deleted.');
	} catch (error) {
		console.log(error);
		return res.status(500).send('Server error.');
	}
});

export default router;
