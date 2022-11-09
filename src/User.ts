import mongoose from 'mongoose';

const user = new mongoose.Schema({
	email: { required: false, type: String },
	googleId: {
		required: false,
		type: String,
	},
	username: {
		required: true,
		type: String,
	},
});

export default mongoose.model('User', user);
