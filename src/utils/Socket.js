import {io} from 'socket.io-client';
import {BaseURL} from './ApiUtils';

export const socket = io('http://3.13.41.233:8080');
