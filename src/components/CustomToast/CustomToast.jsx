import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {widthToDp} from '../../utils/Responsive';

const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={{borderLeftColor: 'green', borderLeftWidth: widthToDp(2)}}
      contentContainerStyle={{paddingHorizontal: widthToDp(5)}}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
      }}
    />
  ),

  error: props => (
    <ErrorToast
      {...props}
      contentContainerStyle={{paddingHorizontal: widthToDp(5)}}
      style={{borderLeftColor: 'red', borderLeftWidth: widthToDp(2)}}
      text1Style={{
        fontWeight: '600',
        fontSize: 15,
      }}
      text2Style={{
        fontSize: 13,
      }}
    />
  ),
  warning: props => (
    <BaseToast
      {...props}
      style={{borderLeftColor: 'orange', borderLeftWidth: widthToDp(2)}}
      contentContainerStyle={{paddingHorizontal: widthToDp(5)}}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
      }}
      text2Style={{
        fontSize: 13,
      }}
    />
  ),
};

export default function CustomToast() {
  return <Toast position="bottom" bottomOffset={20} config={toastConfig} />;
}
