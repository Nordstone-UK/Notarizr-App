import {io} from 'socket.io-client';
import {BaseURL} from './ApiUtils';

export const socket = io('https://admins.notarizr.co/api');
