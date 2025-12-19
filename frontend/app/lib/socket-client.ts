import { Manager, Socket } from 'socket.io-client';
let socket: Socket | null = null;

export const connectToServer = () => {
    const manager = new Manager('http://localhost:5000');
    socket = manager.socket('/members');
    addListeners(socket);
}

 const addListeners = (socket: Socket) => {
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('message', (data: any) => {
        console.log('Received message from server:', data);
    });
};

