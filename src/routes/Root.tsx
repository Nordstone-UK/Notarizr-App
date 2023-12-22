import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {FC, useEffect, useState} from 'react';
import {EventRegister} from 'react-native-event-listeners';
import notificationCacheMethods from '../cache/notification';
import AppNavigation from '../screens/Navigation/AppNavigation';

const Root: FC = (): JSX.Element => {
  const navigation: any = useNavigation();
  console.log("I'm getting passed");
  const [stack, setStack] = useState<'auth' | 'app'>('auth');
  useEffect(() => {
    const listener = EventRegister.addEventListener(
      'notfication',
      async data => {
        const {type, value} = data?.notification?.additionalData;
        if (type === 'session_created') {
          //get session by ID API
          //navigation.navigate('MedicalBookingScreen);
        }
        console.log('Notification', data);
      },
    );
    return () => {
      EventRegister.removeAllListeners();
    };
  }, [navigation, stack]);
  return <AppNavigation />;
};

const Wrapper: FC<{}> = ({}) => {
  return (
    <NavigationContainer>
      <Root />
    </NavigationContainer>
  );
};

export default Wrapper;
