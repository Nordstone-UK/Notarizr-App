import {Platform} from 'react-native';

const productionServerURL = 'https://app.notarizr.co';
const localServerURL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const ServerURL = __DEV__ ? localServerURL : productionServerURL;
export const BaseURL = `${ServerURL}/api/v1/app`;
