import { Manager, Socket } from 'socket.io-client';
let socket: Socket | null = null;

export const connectToServer = ( token : string) => {
    const manager = new Manager('http://localhost:5000',{
        extraHeaders: {
            authentication : token
        }
    });
    socket = manager.socket('/get');
    addListeners(socket);
}

 export const addListeners = (socket: Socket) => {
       socket.on('clients-update', (data: any) => {
        console.log('Clients updated:', data);
    });
};

