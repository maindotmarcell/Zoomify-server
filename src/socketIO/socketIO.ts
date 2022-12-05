// socket.io code for vid chat
import { Socket } from 'socket.io';
import { io } from '../index';

// As the client emits a 'connection' event to the server
export const socketConnectionHandler = (socket: Socket) => {
	socket.emit('me', socket.id);
	console.log('🚀 ~ file: index.ts:53 ~ io.on ~ socket.id', socket.id);

	socket.on('disconnect', () => {
		socket.broadcast.emit('userLeft', { disconnectedUser: socket.id });
		// (Broadcast = Emit message to all connected sockets, except sender, that a user left)
	});

	// socket.on('endCall', () => {
	// 	socket.broadcast.emit('userLeft');
	// });

	socket.on('callUser', (data) => {
		// Forward call user event from caller to user to be called
		io.to(data.userToCall).emit('callUser', {
			// Emit to user to be called
			signal: data.signalData,
			from: data.from,
			name: data.name,
		});
	});

	// forward answered call back to caller to create p2p connection
	socket.on('answerCall', (data) => {
		io.to(data.to).emit('callAccepted', data);
	});

	socket.on('declineCall', (data) => {
		io.to(data.to).emit('callDeclined');
	});
};
