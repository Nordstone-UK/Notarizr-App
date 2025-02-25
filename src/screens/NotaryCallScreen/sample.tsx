import CallKeepService from '../services/CallKeepService';

const initializeOneSignal = () => {
  OneSignal.setAppId(ONESIGNAL_APP_ID);

  OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
    let notification = notificationReceivedEvent.getNotification();
    const data = notification.additionalData;

    console.log("Incoming notification:", data);

    if (data?.type === "voice_call" && data?.callStatus === "ringing") {
      playRingtone();
      CallKeepService.displayIncomingCall(data.callerName, data.callerId);
    }

    store.dispatch(setNotification(notification));
    EventRegister.emit('notification', notification);
    notificationReceivedEvent.complete(notification);
  });

  OneSignal.setNotificationOpenedHandler(notification => {
    const data = notification.notification.additionalData;

    if (data?.type === "voice_call") {
      stopRingtone();
      // Handle accepting call logic here
    }

    console.log("Notification opened:", notification);
  });
};
