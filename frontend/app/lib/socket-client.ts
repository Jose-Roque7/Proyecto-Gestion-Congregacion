import { Manager, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectToServer = (
  token: string,
  onMembersUpdate: (data: any[]) => void
) => {
  const manager = new Manager('http://localhost:5000', {
    extraHeaders: {
      authentication: token,
    },
  });

  socket = manager.socket('/get');

  // 👇 AQUÍ ES DONDE VA
  socket.off('members-update');
  socket.on('members-update', onMembersUpdate);
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
