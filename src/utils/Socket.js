import {io} from 'socket.io-client';
import {ServerURL} from './ApiUtils';

export const socket = io(ServerURL, {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = token => {
  if (!token) {
    throw new Error('A login token is required to connect to chat.');
  }

  if (socket.auth?.token !== token) {
    if (socket.connected) {
      socket.disconnect();
    }
    socket.auth = {token};
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const waitForSocketConnection = (timeout = 10000) =>
  new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve(socket);
      return;
    }

    const timer = setTimeout(() => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleError);
      reject(new Error('The call server could not be reached.'));
    }, timeout);

    const cleanup = () => {
      clearTimeout(timer);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleError);
    };
    const handleConnect = () => {
      cleanup();
      resolve(socket);
    };
    const handleError = error => {
      cleanup();
      reject(new Error(error?.message || 'The call server could not connect.'));
    };

    socket.once('connect', handleConnect);
    socket.once('connect_error', handleError);
  });

export const socketRequest = (event, payload, timeout = 12000) =>
  new Promise((resolve, reject) => {
    socket.timeout(timeout).emit(event, payload, (error, response) => {
      if (error) {
        reject(new Error('The chat server did not respond.'));
        return;
      }

      if (!response?.ok) {
        reject(new Error(response?.error || 'The chat request failed.'));
        return;
      }

      resolve(response);
    });
  });
