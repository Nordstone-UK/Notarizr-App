/**
 * @format
 */
import 'react-native-url-polyfill/auto';

import {AppRegistry} from 'react-native';
import {decode as base64Decode, encode as base64Encode} from 'base-64';
import {registerGlobals} from '@livekit/react-native';
import App from './App';
import {name as appName} from './app.json';

// LiveKit's signalling client expects browser-compatible Base64 helpers.
if (typeof global.btoa !== 'function') {
  global.btoa = base64Encode;
}
if (typeof global.atob !== 'function') {
  global.atob = base64Decode;
}

// LiveKit requires its WebRTC globals before the React tree is created.
registerGlobals();

window.addEventListener = () => {};
window.postMessage = () => {};

AppRegistry.registerComponent(appName, () => App);
