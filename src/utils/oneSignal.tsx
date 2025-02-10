import { Platform } from 'react-native';
import OneSignal from 'react-native-onesignal';
import SoundPlayer from 'react-native-sound-player';

import { notificationCache } from '../cache/notification';
import { EventRegister } from 'react-native-event-listeners';
import { setNotification } from '../features/user/userSlice';
import { store } from '../app/store';
// import {ringtone} from "../../assets/"
const ONESIGNAL_APP_ID = 'dc4e3a66-402e-41d7-832d-25b70c16fdea';
let ringtone = null;
const initializeOneSignal = () => {
  OneSignal.setAppId(ONESIGNAL_APP_ID);
  OneSignal.promptForPushNotificationsWithUserResponse(response => {
    console.log(response);
  });
  OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
    let notification = notificationReceivedEvent.getNotification();
    const data = notification.additionalData;
    console.log("Dattttttttttttttttta", data)
    if (data?.type === "voice_call" && data?.callStatus === "ringing") {
      playRingtone();
    }
    console.log("dateddddddddddd", data)
    store.dispatch(setNotification(notification));
    EventRegister.emit('notification', notification);
    notificationReceivedEvent.complete(notification);
  });
  OneSignal.setNotificationOpenedHandler(notification => {
    // store.dispatch(setNotification(notification));
    // EventRegister.emit('notification', notification);
    const data = notification.notification.additionalData;

    // Stop the ringtone if it was a voice call
    if (data?.type === "voice_call") {
      stopRingtone();
    }

    console.log("Notification opened:", notification);
  });
  // OneSignal.setNotificationBackgroundHandler(async notification => {
  //   const data = notification.additionalData;
  //   console.log("Background Notification Data:", data);

  //   if (data?.type === 'voice_call' && data?.callStatus === 'ringing') {
  //     playRingtone();
  //   }
  // });
};

const playRingtone = () => {
  try {
    // SoundPlayer.playSoundFile('ringtone', 'aiff'); // Ensure the file is in the correct directory
    SoundPlayer.playSoundFile('ringtone', 'mp3');
    console.log("Ringtone playing...");
  } catch (error) {
    console.error("Error playing sound:", error);
  }
};

const stopRingtone = () => {
  try {
    SoundPlayer.stop();
    console.log("Ringtone stopped");
  } catch (error) {
    console.error("Error stopping sound:", error);
  }
};


export const setOneSignalExternalId = (id: string) => {
  OneSignal.setExternalUserId(id);
};
export { initializeOneSignal };
