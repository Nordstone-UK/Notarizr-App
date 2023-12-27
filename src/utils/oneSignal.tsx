import {Platform} from 'react-native';
import OneSignal from 'react-native-onesignal';
import {notificationCache} from '../cache/notification';
import {EventRegister} from 'react-native-event-listeners';

const ONESIGNAL_APP_ID = 'dc4e3a66-402e-41d7-832d-25b70c16fdea';

const initializeOneSignal = () => {
  OneSignal.setAppId(ONESIGNAL_APP_ID);
  OneSignal.promptForPushNotificationsWithUserResponse(response => {
    // console.log(response);
  });
  OneSignal.setNotificationWillShowInForegroundHandler(
    notificationReceivedEvent => {
      let notification = notificationReceivedEvent.getNotification();
      // console.log(
      //   'OneSignal: notification will show in foreground:',
      //   notificationReceivedEvent,
      // );
      // console.log('notification: ', notification);

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
