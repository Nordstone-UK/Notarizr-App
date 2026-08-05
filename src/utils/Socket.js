import {io} from 'socket.io-client';
import {ServerURL} from './ApiUtils';

export const socket = io(ServerURL);
