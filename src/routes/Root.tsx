import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {FC, useEffect, useState} from 'react';
import {EventRegister} from 'react-native-event-listeners';
import notificationCacheMethods from '../cache/notification';

const Root: FC = (): JSX.Element => {
  const navigation: any = useNavigation();

  const [stack, setStack] = useState<'auth' | 'app'>('auth');
  useEffect(() => {
    const listener = EventRegister.addEventListener(
      'notfication',
      async data => {
        if (stack === 'app') {
          const {type, user, chatID} = data?.notification?.additionalData;

          if (type === 'chat_notification' && user && chatID) {
            // navigate to chat screen
            navigation.navigate(SCREENS.PERSONAL_CHAT, {
              user: user,
              chatID: chatID,
            });
          }
          if (type === 'general_notification') {
            notificationCacheMethods.reload();
            // navigate to notification screen
            navigation.navigate(SCREENS.NOTIFICATIONS);
          }
        }
      },
    );
    return () => {
      EventRegister.removeAllListeners();
    };
  }, [navigation, stack]);
};

const Wrapper: FC<{}> = ({}) => {
  return (
    <NavigationContainer>
      <Root />
    </NavigationContainer>
  );
};

export default Wrapper;
