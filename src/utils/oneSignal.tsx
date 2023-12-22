import {Platform} from 'react-native';
import OneSignal from 'react-native-onesignal';
import {notificationCache} from '../cache/notification';
import {EventRegister} from 'react-native-event-listeners';

const ONESIGNAL_APP_ID = 'dc4e3a66-402e-41d7-832d-25b70c16fdea';

const initializeOneSignal = () => {
  OneSignal.setAppId(ONESIGNAL_APP_ID);

  // if (Platform.OS !== 'android') {
  OneSignal.promptForPushNotificationsWithUserResponse(response => {});
  // }
  //Method for handling notifications received while app in foreground
  OneSignal.setNotificationWillShowInForegroundHandler(
    notificationReceivedEvent => {
      let notification = notificationReceivedEvent.getNotification();
      console.log('notification: ', notification);
      const data = notification.additionalData;
      //   console.log('additionalData: ', data);
      // Complete with null means don't show a notification.
      notificationReceivedEvent.complete(notification);
    },
  );

  OneSignal.setNotificationOpenedHandler(notification => {
    EventRegister.emit('notfication', notification);
  });
};

export const setOneSignalExternalId = (id: string) => {
  OneSignal.setExternalUserId(id);
};
export {initializeOneSignal};
