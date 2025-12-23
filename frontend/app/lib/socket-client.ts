import { Manager, Socket } from 'socket.io-client';
let socket: Socket | null = null;

export const connectToServer = (token: string, onDataUpdate?: (data: any) => void) => {
    const manager = new Manager('http://localhost:5000', {
        extraHeaders: {
            authentication: token
        }
    });
    
    socket = manager.socket('/get');
    
    // Si hay callback, usarlo
    if (onDataUpdate) {
        socket.on('members-update', (data: any) => {
            console.log('Datos recibidos:', data);
            onDataUpdate(data); // Llamar al callback con la data
        });
    } else {
        addListeners(socket);
    }
}

 export const addListeners = (socket: Socket) => {
       socket.on('members-update', (data: any) => {
        return data;
    });
};

